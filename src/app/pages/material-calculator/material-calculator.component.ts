import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { CharacterService } from '../../_services/character.service';
import { CalculatorStateService } from '../../_services/calculator-state.service';
import { MaterialCalculationService } from '../../_services/material-calculation.service';
import {
  AETHER_ID,
  CharacterEntryKey,
  CharacterProgressEntry as CharacterProgress,
  createDefaultCharacterProgress,
  isSameEntry,
  TRAVELER_ID,
} from '../../_models/calculator';
import { Character, CharacterProfile, CharacterTalents } from '../../_models/character';
import { ElementType, ElementTypeLabel } from '../../_models/enum';
import { MaterialCostDisplayComponent } from './material-cost-display/material-cost-display.component';
import {
  CharacterOption,
  CharacterSearchComponent,
} from '../../_components/character-search/character-search.component';
import { SelectDropdownComponent } from '../../_components/select-dropdown/select-dropdown.component';
import { ImageService } from '../../_services/image.service';

type SelectedCharacter = Pick<Character, 'profile' | 'skills' | 'variants'>;

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
  { label: 'Normal Attack', current: 'normalSkillLevel', goal: 'goalNormalSkillLevel' },
  { label: 'Elemental Skill', current: 'elementalSkillLevel', goal: 'goalElementalSkillLevel' },
  { label: 'Elemental Burst', current: 'burstLevel', goal: 'goalBurstLevel' },
];

/** The Traveler has one entry per element, with talents stored per element */
const TRAVELER_NAME = 'Traveler';
const TRAVELER_ELEMENTS: ElementType[] = [
  ElementType.ANEMO,
  ElementType.CRYO,
  ElementType.DENDRO,
  ElementType.ELECTRO,
  ElementType.GEO,
  ElementType.HYDRO,
  ElementType.PYRO,
];

/** Row and option label, e.g. "Traveler (Geo)" */
function getEntryName(name: string, element?: ElementType): string {
  return element ? `${name} (${ElementTypeLabel[element]})` : name;
}

/** Lumine and Aether both display as the Traveler */
function getDisplayName(profile: CharacterProfile): string {
  return profile.id === TRAVELER_ID ? TRAVELER_NAME : profile.name;
}

/** Options for the add search: one per element for the Traveler */
function toCharacterOptions(profile: CharacterProfile): CharacterOption[] {
  if (profile.id === AETHER_ID) {
    return [];
  }
  if (profile.id !== TRAVELER_ID) {
    return [
      {
        characterId: profile.id,
        name: profile.name,
        normalizedName: profile.normalizedName,
      },
    ];
  }
  return TRAVELER_ELEMENTS.map((element) => ({
    characterId: profile.id,
    element,
    name: getEntryName(getDisplayName(profile), element),
    normalizedName: profile.normalizedName,
  }));
}

/** Unique tracking key; Travelers share a character ID */
function getEntryKey(entry: CharacterEntryKey): string {
  return `${entry.characterId}-${entry.element ?? ''}`;
}

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
      return {
        rows: inventory.characters.map((progress) => {
          const character = byId.get(progress.characterId);
          return {
            key: getEntryKey(progress),
            progress,
            name: character ? getEntryName(getDisplayName(character), progress.element) : 'Unknown',
            normalizedName: character?.normalizedName ?? '',
          };
        }),
        available: characters
          .flatMap(toCharacterOptions)
          .filter((option) => !inventory.characters.some((entry) => isSameEntry(entry, option))),
      };
    }),
  );

  constructor(
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
  }

  /**
   * Handle character selection from the inventory list
   */
  onCharacterSelected(characterProgress: CharacterProgress): void {
    this.selectedCharacterProgress = characterProgress;
    this.loadCharacter(characterProgress.characterId).subscribe((selected) => {
      // Ignore responses for a row that is no longer selected
      if (!this.isExpanded(characterProgress)) {
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
              map(({ profile, skills, variants }) => ({ profile, skills, variants })),
              catchError(() => of({ profile: character })),
            );
        }),
        shareReplay(1),
      );
      this.detailsCache.set(characterId, cached);
    }
    return cached;
  }

  onAddCharacter(option: CharacterEntryKey): void {
    if (this.calculatorState.getCharacter(option)) {
      return;
    }
    this.calculatorState.addCharacter(
      createDefaultCharacterProgress(option.characterId, option.element),
    );
  }

  /**
   * Remove a character from the inventory
   */
  onRemoveCharacter(entry: CharacterEntryKey): void {
    this.calculatorState.removeCharacter(entry);
    if (this.isExpanded(entry)) {
      this.clearSelection();
    }
  }

  /**
   * Expand a row to show its materials, or collapse it when already expanded
   */
  onRowClicked(entry: CharacterEntryKey): void {
    if (this.isExpanded(entry)) {
      this.clearSelection();
      return;
    }
    const progress = this.calculatorState.getCharacter(entry);
    if (progress) {
      this.onCharacterSelected(progress);
    }
  }

  isExpanded(entry: CharacterEntryKey): boolean {
    return (
      this.selectedCharacterProgress !== null &&
      isSameEntry(this.selectedCharacterProgress, entry)
    );
  }

  getCharacterIcon(normalizedName: string): string {
    return this.imageService.getCharacterIcon(normalizedName);
  }

  isTraveler(entry: CharacterEntryKey): boolean {
    return entry.characterId === TRAVELER_ID;
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
    this.onProgressUpdated(progress, updates);
  }

  onCombatCurrentChange(
    progress: CharacterProgress,
    column: CombatColumn,
    value: string,
  ): void {
    const level = parseInt(value, 10);
    this.onProgressUpdated(progress, {
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
    this.onProgressUpdated(progress, {
      [column.goal]: Math.max(progress[column.current], level),
    });
  }

  /**
   * Persist a progress change and refresh the expanded row's costs
   */
  private onProgressUpdated(
    entry: CharacterEntryKey,
    updates: Partial<CharacterProgress>,
  ): void {
    this.calculatorState.updateCharacterProgress(entry, updates);
    if (this.isExpanded(entry)) {
      this.selectedCharacterProgress = this.calculatorState.getCharacter(entry) ?? null;
      this.recalculateCost();
    }
  }

  private clearSelection(): void {
    this.selectedCharacterProgress = null;
    this.selectedCharacter = null;
    this.calculatedCost = null;
  }

  /** Traveler talents differ per element; other characters use their base talents */
  private getSkills(
    character: SelectedCharacter,
    element?: ElementType,
  ): CharacterTalents | undefined {
    const variant = element ? character.variants?.[element] : undefined;
    return variant?.skills ?? character.skills;
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
      this.getSkills(this.selectedCharacter, this.selectedCharacterProgress.element),
      this.selectedCharacterProgress,
    );

    this.calculatedCost = this.calculationService.mergeCosts(
      characterCost,
      talentCost,
    );
  }
}
