import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { CharacterService } from '../../_services/character.service';
import { CalculatorStateService } from '../../_services/calculator-state.service';
import { MaterialCalculationService } from '../../_services/material-calculation.service';
import {
  CharacterProgressEntry as CharacterProgress,
  createDefaultCharacterProgress,
} from '../../_models/calculator';
import { Character } from '../../_models/character';
import { MaterialCostDisplayComponent } from './material-cost-display/material-cost-display.component';
import { CharacterSearchComponent } from '../../_components/character-search/character-search.component';
import { SelectDropdownComponent } from '../../_components/select-dropdown/select-dropdown.component';
import { ImageService } from '../../_services/image.service';

type SelectedCharacter = Pick<Character, 'profile' | 'skills'>;

type CombatColumn = {
  label: string;
  current: 'normalSkillLevel' | 'elementalSkillLevel' | 'burstLevel';
  goal: 'goalNormalSkillLevel' | 'goalElementalSkillLevel' | 'goalBurstLevel';
};

const ASCENSION_CAPS = [20, 40, 50, 60, 70, 80];

/** Level dropdown values; ascension caps are shown as e.g. "20+" */
function buildLevelOptions(): (number | string)[] {
  const options: (number | string)[] = [];
  for (let level = 1; level <= 90; level++) {
    options.push(level);
    if (ASCENSION_CAPS.includes(level) && level < 90) {
      options.push(`${level}+`);
    }
  }
  return options;
}

const LEVEL_OPTIONS = buildLevelOptions();
const TALENT_LEVEL_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const COMBAT_COLUMNS: CombatColumn[] = [
  { label: 'Combat 1', current: 'normalSkillLevel', goal: 'goalNormalSkillLevel' },
  { label: 'Combat 2', current: 'elementalSkillLevel', goal: 'goalElementalSkillLevel' },
  { label: 'Combat 3', current: 'burstLevel', goal: 'goalBurstLevel' },
];

@Component({
  selector: 'app-material-calculator',
  standalone: true,
  imports: [
    CommonModule,
    MaterialCostDisplayComponent,
    CharacterSearchComponent,
    SelectDropdownComponent,
  ],
  templateUrl: './material-calculator.component.html',
  styleUrl: './material-calculator.component.css',
})
export class MaterialCalculatorComponent implements OnInit {
  selectedCharacterProgress: CharacterProgress | null = null;
  selectedCharacter: SelectedCharacter | null = null;
  characters$ = this.characterService.getCharacters().pipe(shareReplay(1));
  inventory$ = this.calculatorState.inventory$;
  calculatedCost: any = null;
  private detailsCache = new Map<number, Observable<SelectedCharacter | null>>();

  readonly levelOptions = LEVEL_OPTIONS;
  readonly talentLevelOptions = TALENT_LEVEL_OPTIONS;
  readonly combatColumns = COMBAT_COLUMNS;

  /** Table rows for owned characters, plus characters that can still be added */
  view$ = combineLatest([this.characters$, this.inventory$]).pipe(
    map(([characters, inventory]) => {
      const byId = new Map(characters.map((c) => [c.id, c] as const));
      const owned = new Set(inventory.characters.map((c) => c.characterId));
      return {
        rows: inventory.characters.map((progress) => {
          const character = byId.get(progress.characterId);
          return {
            progress,
            name: character?.name ?? 'Unknown',
            normalizedName: character?.normalizedName ?? '',
          };
        }),
        available: characters.filter((c) => !owned.has(c.id)),
      };
    }),
  );

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private calculatorState: CalculatorStateService,
    private calculationService: MaterialCalculationService,
    private destroyRef: DestroyRef,
    private imageService: ImageService,
  ) {}

  ngOnInit(): void {
    // Fetch owned characters' details in the background so row clicks are instant
    this.inventory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((inventory) => {
      for (const progress of inventory.characters) {
        this.loadCharacter(progress.characterId).subscribe();
      }
    });

    // Check if a character is pre-selected via route params
    this.route.queryParams.subscribe((params) => {
      if (params['character']) {
        this.selectCharacterBySlug(params['character']);
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
   * Select a character by its URL slug (normalized name)
   */
  selectCharacterBySlug(slug: string): void {
    this.characters$.pipe(take(1)).subscribe((characters) => {
      const character = characters.find((c) => c.normalizedName === slug);
      if (character) {
        this.selectCharacterById(character.id);
      }
    });
  }

  /**
   * Handle character selection from the inventory list
   */
  onCharacterSelected(characterProgress: CharacterProgress): void {
    this.selectedCharacterProgress = characterProgress;
    const { characterId } = characterProgress;
    this.loadCharacter(characterId).subscribe((selected) => {
      // Ignore responses for a row that is no longer selected
      if (this.selectedCharacterProgress?.characterId !== characterId) {
        return;
      }
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
    let cached = this.detailsCache.get(characterId);
    if (!cached) {
      cached = this.characters$.pipe(
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
        shareReplay(1),
      );
      this.detailsCache.set(characterId, cached);
    }
    return cached;
  }

  onAddCharacter(characterId: number): void {
    if (this.calculatorState.getCharacter(characterId)) {
      return;
    }
    this.calculatorState.addCharacter(createDefaultCharacterProgress(characterId));
  }

  /**
   * Remove a character from the inventory
   */
  onRemoveCharacter(characterId: number): void {
    this.calculatorState.removeCharacter(characterId);
    if (this.isExpanded(characterId)) {
      this.clearSelection();
    }
  }

  /**
   * Expand a row to show its materials, or collapse it when already expanded
   */
  onRowClicked(characterId: number): void {
    if (this.isExpanded(characterId)) {
      this.clearSelection();
      return;
    }
    const progress = this.calculatorState.getCharacter(characterId);
    if (progress) {
      this.onCharacterSelected(progress);
    }
  }

  isExpanded(characterId: number): boolean {
    return this.selectedCharacterProgress?.characterId === characterId;
  }

  getCharacterIcon(normalizedName: string): string {
    return this.imageService.getCharacterIcon(normalizedName);
  }

  /**
   * A current level above the goal raises the goal; a goal below the current level is clamped
   */
  onLevelChange(
    progress: CharacterProgress,
    field: 'currentLevel' | 'goalLevel',
    value: string,
  ): void {
    const level = parseInt(value, 10);
    const updates: Partial<CharacterProgress> =
      field === 'currentLevel'
        ? { currentLevel: level, goalLevel: Math.max(progress.goalLevel, level) }
        : { goalLevel: Math.max(progress.currentLevel, level) };
    this.onProgressUpdated(progress.characterId, updates);
  }

  onCombatCurrentChange(
    progress: CharacterProgress,
    column: CombatColumn,
    value: string,
  ): void {
    const level = parseInt(value, 10);
    this.onProgressUpdated(progress.characterId, {
      [column.current]: level,
      [column.goal]: Math.max(progress[column.goal], level),
    });
  }

  onCombatGoalChange(
    progress: CharacterProgress,
    column: CombatColumn,
    value: string,
  ): void {
    const level = parseInt(value, 10);
    this.onProgressUpdated(progress.characterId, {
      [column.goal]: Math.max(progress[column.current], level),
    });
  }

  /**
   * Persist a progress change and refresh the expanded row's costs
   */
  private onProgressUpdated(
    characterId: number,
    updates: Partial<CharacterProgress>,
  ): void {
    this.calculatorState.updateCharacterProgress(characterId, updates);
    if (this.isExpanded(characterId)) {
      this.selectedCharacterProgress =
        this.calculatorState.getCharacter(characterId) ?? null;
      this.recalculateCost();
    }
  }

  private clearSelection(): void {
    this.selectedCharacterProgress = null;
    this.selectedCharacter = null;
    this.calculatedCost = null;
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
