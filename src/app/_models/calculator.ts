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
 * Create a new character progress entry with default values
 * (level 1 -> 90, ascension 0 -> 6, talents 1 -> 9)
 */
export function createDefaultCharacterProgress(
  characterId: number,
  element?: ElementType,
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

export type WeaponProgressEntry = {
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
  maxLevel: number,
): WeaponProgressEntry {
  return {
    weaponId,
    currentLevel: 1,
    currentAscension: 0,
    goalLevel: maxLevel,
    goalAscension: 0,
  };
}

export type CalculatorInventory = {
  characters: CharacterProgressEntry[];
  weapons: WeaponProgressEntry[];
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
