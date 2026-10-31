import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { CharacterService } from '../../_services/character.service';
import { CalculatorStateService } from '../../_services/calculator-state.service';
import { MaterialCalculationService } from '../../_services/material-calculation.service';
import {
  CharacterProgressEntry,
  CharacterProgressEntry as CharacterProgress,
  createDefaultCharacterProgress,
} from '../../_models/calculator';
import { Character } from '../../_models/character';
import { CharacterInventoryListComponent } from './character-inventory-list/character-inventory-list.component';
import { CharacterProgressEditorComponent } from './character-progress-editor/character-progress-editor.component';
import { MaterialCostDisplayComponent } from './material-cost-display/material-cost-display.component';

type SelectedCharacter = Pick<Character, 'profile' | 'skills'>;

@Component({
  selector: 'app-material-calculator',
  standalone: true,
  imports: [
    CommonModule,
    CharacterInventoryListComponent,
    CharacterProgressEditorComponent,
    MaterialCostDisplayComponent,
  ],
  templateUrl: './material-calculator.component.html',
  styleUrl: './material-calculator.component.css',
})
export class MaterialCalculatorComponent implements OnInit {
  selectedCharacterProgress: CharacterProgress | null = null;
  selectedCharacter: SelectedCharacter | null = null;
  characters$ = this.characterService.getCharacters();
  inventory$ = this.calculatorState.inventory$;
  calculatedCost: any = null;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private calculatorState: CalculatorStateService,
    private calculationService: MaterialCalculationService,
  ) {}

  ngOnInit(): void {
    // Check if a character is pre-selected via route params
    this.route.queryParams.subscribe((params) => {
      if (params['character']) {
        const characterId = parseInt(params['character'], 10);
        this.selectCharacterById(characterId);
      }
    });
  }

  /**
   * Select a character by ID and load its data
   */
  selectCharacterById(characterId: number): void {
    this.loadCharacter(characterId).subscribe((selected) => {
      if (!selected) {
        return;
      }
      this.selectedCharacter = selected;
      const existing = this.calculatorState.getCharacter(characterId);
      if (existing) {
        this.selectedCharacterProgress = existing;
      } else {
        // Pre-populate with defaults
        this.selectedCharacterProgress =
          createDefaultCharacterProgress(characterId);
        // Add to inventory
        this.calculatorState.addCharacter(this.selectedCharacterProgress);
      }
      this.recalculateCost();
    });
  }

  /**
   * Handle character selection from the inventory list
   */
  onCharacterSelected(characterProgress: CharacterProgress): void {
    this.selectedCharacterProgress = characterProgress;
    this.loadCharacter(characterProgress.characterId).subscribe((selected) => {
      this.selectedCharacter = selected;
      this.recalculateCost();
    });
  }

  /**
   * Load a character's profile and talents, falling back to the profile alone on error
   */
  private loadCharacter(
    characterId: number,
  ): Observable<SelectedCharacter | null> {
    return this.characters$.pipe(
      switchMap((characters) => {
        const character = characters.find((c) => c.id === characterId);
        if (!character) {
          return of(null);
        }
        return this.characterService
          .getCharacterDetails(character.normalizedName)
          .pipe(
            map(({ profile, skills }) => ({ profile, skills })),
            catchError(() => of({ profile: character })),
          );
      }),
    );
  }

  /**
   * Handle adding a new character to inventory
   */
  onAddCharacter(characterId: number): void {
    const existing = this.calculatorState.getCharacter(characterId);
    if (!existing) {
      const newEntry = createDefaultCharacterProgress(characterId);
      this.calculatorState.addCharacter(newEntry);
      this.onCharacterSelected(newEntry);
    }
  }

  /**
   * Handle removing a character from inventory
   */
  onRemoveCharacter(characterId: number): void {
    this.calculatorState.removeCharacter(characterId);
    if (this.selectedCharacterProgress?.characterId === characterId) {
      this.selectedCharacterProgress = null;
      this.selectedCharacter = null;
      this.calculatedCost = null;
    }
  }

  /**
   * Handle progress updates
   */
  onProgressUpdated(updates: Partial<CharacterProgressEntry>): void {
    if (this.selectedCharacterProgress) {
      // If goalLevel was updated, also update goalAscension accordingly
      if (updates.goalLevel !== undefined) {
        updates.goalAscension = this.getAscensionPhaseFromLevel(updates.goalLevel);
      }

      // If currentLevel was updated, also update currentAscension accordingly
      if (updates.currentLevel !== undefined) {
        updates.currentAscension = this.getAscensionPhaseFromLevel(updates.currentLevel);
      }

      this.calculatorState.updateCharacterProgress(
        this.selectedCharacterProgress.characterId,
        updates,
      );
      this.selectedCharacterProgress = {
        ...this.selectedCharacterProgress,
        ...updates,
      };
      this.recalculateCost();
    }
  }

  /**
   * Get ascension phase based on level
   * Phases: 0 (1-20), 1 (21-40), 2 (41-50), 3 (51-60), 4 (61-70), 5 (71-80), 6 (81-90)
   */
  private getAscensionPhaseFromLevel(level: number): number {
    if (level <= 20) return 0;
    if (level <= 40) return 1;
    if (level <= 50) return 2;
    if (level <= 60) return 3;
    if (level <= 70) return 4;
    if (level <= 80) return 5;
    return 6;
  }

  /**
   * Recalculate material costs based on current progress
   */
  private recalculateCost(): void {
    if (!this.selectedCharacterProgress || !this.selectedCharacter) {
      this.calculatedCost = null;
      return;
    }

    const {
      currentLevel,
      goalLevel,
      currentAscension,
      goalAscension,
    } = this.selectedCharacterProgress;

    const characterCost = this.calculationService.calculateCharacterTotalCost(
      this.selectedCharacter.profile,
      currentLevel,
      goalLevel,
      currentAscension,
      goalAscension,
    );
    const talentCost = this.calculationService.calculateAllTalentsCost(
      this.selectedCharacter.skills,
      this.selectedCharacterProgress,
    );

    this.calculatedCost = this.calculationService.mergeCosts(
      characterCost,
      talentCost,
    );
  }
}
