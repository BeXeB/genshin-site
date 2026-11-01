/**
 * Material Calculator Models
 * Phase 1: Leveling and Ascension tracking
 * Phase 2: Talent upgrade tracking
 */

import { ElementType } from './enum';

/** Lumine's profile ID; Lumine and Aether are merged into one Traveler */
export const TRAVELER_ID = 10000007;
/** Aether's profile ID, used only to migrate saved entries */
export const AETHER_ID = 10000005;

export type CharacterProgressEntry = {
  characterId: number;
  element?: ElementType; // Travelers only: one entry per element
  currentLevel: number; // 1-90
  currentAscension: number; // 0-6
  goalLevel: number; // 1-90
  goalAscension: number; // 0-6
  normalSkillLevel: number; // 1-10
  elementalSkillLevel: number; // 1-10
  burstLevel: number; // 1-10
  goalNormalSkillLevel: number; // 1-10
  goalElementalSkillLevel: number; // 1-10
  goalBurstLevel: number; // 1-10
};

/**
 * Identifies an entry: character ID, plus element for Travelers
 */
export type CharacterEntryKey = Pick<CharacterProgressEntry, 'characterId' | 'element'>;

export function isSameEntry(a: CharacterEntryKey, b: CharacterEntryKey): boolean {
  return a.characterId === b.characterId && a.element === b.element;
}

/**
 * Travelers share one level and ascension, so only the first Traveler entry carries
 * that cost. Other Traveler elements add only their own talents.
 */
export function includesSharedLeveling(
  entry: CharacterEntryKey,
  entries: CharacterEntryKey[]
): boolean {
  if (entry.characterId !== TRAVELER_ID) {
    return true;
  }
  const firstTraveler = entries.find((c) => c.characterId === TRAVELER_ID);
  return !firstTraveler || isSameEntry(entry, firstTraveler);
}

/**
 * Create a new character progress entry with default values
 * (level 1 -> 90, ascension 0 -> 6, talents 1 -> 9)
 */
export function createDefaultCharacterProgress(
  characterId: number,
  element?: ElementType
): CharacterProgressEntry {
  return {
    characterId,
    element,
    currentLevel: 1,
    currentAscension: 0,
    goalLevel: 90,
    goalAscension: 6,
    normalSkillLevel: 1,
    elementalSkillLevel: 1,
    burstLevel: 1,
    goalNormalSkillLevel: 9,
    goalElementalSkillLevel: 9,
    goalBurstLevel: 9,
  };
}

/**
 * Creates an ID that tells copies of the same weapon apart.
 * Weapons are not unique per account, so one weaponId can appear several times.
 */
export function createInstanceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type WeaponProgressEntry = {
  instanceId: string;
  weaponId: number;
  currentLevel: number; // 1-90
  currentAscension: number; // 0-6
  goalLevel: number; // 1-90
  goalAscension: number; // 0-6
};

/**
 * Create a new weapon progress entry (level 1 -> the weapon's max level).
 * Ascensions are derived from the levels when the entry is added to the inventory.
 */
export function createDefaultWeaponProgress(
  weaponId: number,
  maxLevel: number
): WeaponProgressEntry {
  return {
    instanceId: createInstanceId(),
    weaponId,
    currentLevel: 1,
    currentAscension: 0,
    goalLevel: maxLevel,
    goalAscension: 0,
  };
}

/** Refine progress for a craftable weapon; a craft adds one refine step */
export type CraftableProgressEntry = {
  instanceId: string;
  weaponId: number;
  currentRefine: number; // 0-5
  goalRefine: number; // 0-5
};

/** Highest refine level; each craft adds one refine step */
export const MAX_REFINE = 5;

/** New craftables start at refine 0 with the max refine as the goal */
export function createDefaultCraftableProgress(weaponId: number): CraftableProgressEntry {
  return { instanceId: createInstanceId(), weaponId, currentRefine: 0, goalRefine: MAX_REFINE };
}

/** Crafts needed to reach the goal refine, capped at MAX_REFINE */
export function getCraftsNeeded(entry: CraftableProgressEntry): number {
  return Math.max(0, Math.min(entry.goalRefine, MAX_REFINE) - entry.currentRefine);
}

/**
 * A current refine above the goal raises the goal; a goal below the current refine is clamped
 */
export function getRefineUpdates(
  entry: CraftableProgressEntry,
  field: 'currentRefine' | 'goalRefine',
  value: string
): Partial<CraftableProgressEntry> {
  const refine = Math.min(Math.max(Number(value), 0), MAX_REFINE);
  if (field === 'currentRefine') {
    return { currentRefine: refine, goalRefine: Math.max(entry.goalRefine, refine) };
  }
  return { goalRefine: refine, currentRefine: Math.min(entry.currentRefine, refine) };
}

export type CalculatorInventory = {
  characters: CharacterProgressEntry[];
  weapons: WeaponProgressEntry[];
  /** Owned counts by material ID; missing IDs count as zero */
  ownedMaterials: Record<number, number>;
  /** Refine progress for craftable weapons the user chose to track */
  craftables?: CraftableProgressEntry[];
  lastUpdated?: number; // timestamp
};

export type MaterialTotal = {
  materialId: number;
  materialName: string;
  quantity: number;
};

export type LevelingCost = {
  materials: MaterialTotal[];
  totalMora: number;
};
