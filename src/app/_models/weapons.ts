import { QualityType, StatType, WeaponType } from './enum';
import { Item, ResolvedItem } from './items';

export type Weapon = {
  id: number;
  name: string;
  normalizedName: string;

  description: string;
  weaponType: WeaponType;

  qualityType: QualityType;
  rarity: 1 | 2 | 3 | 4 | 5;

  story: string;

  mainStatType?: StatType;

  effectName?: string;

  r1?: WeaponRefine;
  r2?: WeaponRefine;
  r3?: WeaponRefine;
  r4?: WeaponRefine;
  r5?: WeaponRefine;

  costs: Record<`ascend${1 | 2 | 3 | 4}`, Item[]> &
    Partial<Record<`ascend${5 | 6}`, Item[]>>;

  images: {
    filename_icon: string;
    filename_awakenIcon: string;
    filename_gacha: string;
  };

  sortOrder: number;

  stats: WeaponStats;
};

export type WeaponRefine = {
  description: string;
};

export type WeaponStats = Record<string, WeaponStat>;

export type WeaponStat = {
  level: number;
  ascension: number;
  attack?: number;
  specialized?: number;
};

export type WeaponResolved = Omit<Weapon, 'costs'> & {
  costs: Partial<Record<`ascend${1 | 2 | 3 | 4 | 5 | 6}`, ResolvedItem[]>>;
};
