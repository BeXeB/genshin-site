export type CharacterProfile = {
  id: number;
  name: string;
  title: string;
  description: string;

  weaponType: string;
  weaponText: string;

  bodyType: string;
  gender: string;

  qualityType: string;
  rarity: number;

  birthdaymmdd: string;
  birthday: string;

  elementType: string;
  elementText: string;

  affiliation: string;
  associationType: string;

  substatType: string;
  substatText: string;

  constellation: string;

  cv: {
    english: string;
    chinese: string;
    japanese: string;
    korean: string;
  };

  costs: Record<
    `ascend${1 | 2 | 3 | 4 | 5 | 6}`,
    {
      id: number;
      name: string;
      count: number;
    }[]
  >;

  images: {
    filename_icon: string;
    filename_iconCard: string;
    filename_sideIcon: string;
    filename_gachaSplash: string;
    filename_gachaSlice: string;
    mihoyo_icon: string;
    mihoyo_sideIcon: string;
    hoyowiki_icon: string;
  };

  version: string;
};

export type CharacterSkills = {
  id: number;
  name: string;

  combat1: CombatSkill;
  combat2: CombatSkill;
  combat3: CombatSkill;

  passive1: PassiveSkill;
  passive2: PassiveSkill;
  passive3: PassiveSkill;
  passive4: PassiveSkill;
  passive5: PassiveSkill;

  costs: Record<
    `lvl${number}`,
    {
      id: number;
      name: string;
      count: number;
    }[]
  >;

  images: {
    filename_combat1: string;
    filename_combat2: string;
    filename_combat3: string;
    filename_passive1: string;
    filename_passive2: string;
    filename_passive3: string;
    filename_passive4: string;
  };

  version: string;
};

export type CombatSkill = {
  name: string;
  descriptionRaw: string;
  description: string;
  attributes: {
    labels: string[];
    parameters: Record<string, number[]>;
  };
};

export type PassiveSkill = {
  name: string;
  descriptionRaw: string;
  description: string;
};

export type CharacterStat = {
  level: number;
  ascension: number;
  hp: number;
  attack: number;
  defense: number;
  specialized: number;
};

export type CharacterStats = Record<string, CharacterStat>;

export type CharacterConstellation = {
  id: number;
  name: string;

  c1: ConstellationSkill;
  c2: ConstellationSkill;
  c3: ConstellationSkill;
  c4: ConstellationSkill;
  c5: ConstellationSkill;
  c6: ConstellationSkill;

  images: {
    filename_c1: string;
    filename_c2: string;
    filename_c3: string;
    filename_c4: string;
    filename_c5: string;
    filename_c6: string;
    filename_constellation: string;
  };

  version: string;
};

export type ConstellationSkill = {
  name: string;
  descriptionRaw: string;
  description: string;
};

export type Character = {
  profile: CharacterProfile;
  skills: CharacterSkills;
  stats: CharacterStats;
  constellation: CharacterConstellation;
};
