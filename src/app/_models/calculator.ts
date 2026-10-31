/**
 * Material Calculator Models
 * Phase 1: Leveling and Ascension tracking
 * Phase 2: Talent upgrade tracking
 */

export type CharacterProgressEntry = {
  characterId: number;
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
 * Create a new character progress entry with default values
 * (level 1 -> 90, ascension 0 -> 6, talents 1 -> 10)
 */
export function createDefaultCharacterProgress(
  characterId: number,
): CharacterProgressEntry {
  return {
    characterId,
    currentLevel: 1,
    currentAscension: 0,
    goalLevel: 90,
    goalAscension: 6,
    normalSkillLevel: 1,
    elementalSkillLevel: 1,
    burstLevel: 1,
    goalNormalSkillLevel: 10,
    goalElementalSkillLevel: 10,
    goalBurstLevel: 10,
  };
}

export type WeaponProgressEntry = {
  weaponId: number;
  currentLevel: number; // 1-90
  currentAscension: number; // 0-5 (weapons only go to 5)
  goalLevel: number; // 1-90
  goalAscension: number; // 0-5
};

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
