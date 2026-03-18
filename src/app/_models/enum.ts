export enum WeaponType {
  BOW = 'WEAPON_BOW',
  CATALYST = 'WEAPON_CATALYST',
  CLAYMORE = 'WEAPON_CLAYMORE',
  POLE = 'WEAPON_POLE',
  SWORD_ONE_HAND = 'WEAPON_SWORD_ONE_HAND',
}

export const WeaponTypeLabel: Record<WeaponType, string> = {
  [WeaponType.BOW]: 'Bow',
  [WeaponType.CATALYST]: 'Catalyst',
  [WeaponType.CLAYMORE]: 'Claymore',
  [WeaponType.POLE]: 'Polearm',
  [WeaponType.SWORD_ONE_HAND]: 'Sword',
};

export enum QualityType {
  QUALITY_ORANGE = 'QUALITY_ORANGE',
  QUALITY_PURPLE = 'QUALITY_PURPLE',
  QUALITY_BLUE = 'QUALITY_BLUE',
  QUALITY_GREEN = 'QUALITY_GREEN',
  QUALITY_GREY = 'QUALITY_GREY',
}

export const QualityTypeLabel: Record<QualityType, string> = {
  [QualityType.QUALITY_ORANGE]: '5★',
  [QualityType.QUALITY_PURPLE]: '4★',
  [QualityType.QUALITY_BLUE]: '3★',
  [QualityType.QUALITY_GREEN]: '2★',
  [QualityType.QUALITY_GREY]: '1★',
};

export enum ElementType {
  ANEMO = 'ELEMENT_ANEMO',
  CRYO = 'ELEMENT_CRYO',
  DENDRO = 'ELEMENT_DENDRO',
  ELECTRO = 'ELEMENT_ELECTRO',
  GEO = 'ELEMENT_GEO',
  HYDRO = 'ELEMENT_HYDRO',
  NONE = 'ELEMENT_NONE',
  PYRO = 'ELEMENT_PYRO',
}

export const ElementTypeLabel: Record<ElementType, string> = {
  [ElementType.ANEMO]: 'Anemo',
  [ElementType.CRYO]: 'Cryo',
  [ElementType.DENDRO]: 'Dendro',
  [ElementType.ELECTRO]: 'Electro',
  [ElementType.GEO]: 'Geo',
  [ElementType.HYDRO]: 'Hydro',
  [ElementType.NONE]: 'None',
  [ElementType.PYRO]: 'Pyro',
};

export enum StatType {
  HP = 'FIGHT_PROP_HP',
  HP_P = 'FIGHT_PROP_HP_PERCENT',
  ATK = 'FIGHT_PROP_ATTACK',
  ATK_P = 'FIGHT_PROP_ATTACK_PERCENT',
  DEF = 'FIGHT_PROP_DEFENSE',
  DEF_P = 'FIGHT_PROP_DEFENSE_PERCENT',
  ER = 'FIGHT_PROP_CHARGE_EFFICIENCY',
  EM = 'FIGHT_PROP_ELEMENT_MASTERY',
  CR = 'FIGHT_PROP_CRITICAL',
  CD = 'FIGHT_PROP_CRITICAL_HURT',
  HB = 'FIGHT_PROP_HEAL_ADD',

  ELECTRO_P = 'FIGHT_PROP_ELEC_ADD_HURT',
  PYRO_P = 'FIGHT_PROP_FIRE_ADD_HURT',
  DENDRO_P = 'FIGHT_PROP_GRASS_ADD_HURT',
  CRYO_P = 'FIGHT_PROP_ICE_ADD_HURT',
  PHYS_P = 'FIGHT_PROP_PHYSICAL_ADD_HURT',
  GEO_P = 'FIGHT_PROP_ROCK_ADD_HURT',
  HYDRO_P = 'FIGHT_PROP_WATER_ADD_HURT',
  ANEMO_P = 'FIGHT_PROP_WIND_ADD_HURT',
}

export const StatTypeLabel: Record<StatType, string> = {
  [StatType.HP]: 'HP',
  [StatType.HP_P]: 'HP%',
  [StatType.ATK]: 'ATK',
  [StatType.ATK_P]: 'ATK%',
  [StatType.DEF]: 'DEF',
  [StatType.DEF_P]: 'DEF%',
  [StatType.ER]: 'Energy Recharge',
  [StatType.EM]: 'Elemental Mastery',
  [StatType.CR]: 'Crit Rate',
  [StatType.CD]: 'Crit Damage',
  [StatType.HB]: 'Healing Bonus',

  [StatType.ELECTRO_P]: 'Electro DMG Bonus',
  [StatType.PYRO_P]: 'Pyro DMG Bonus',
  [StatType.DENDRO_P]: 'Dendro DMG Bonus',
  [StatType.CRYO_P]: 'Cryo DMG Bonus',
  [StatType.PHYS_P]: 'Physical DMG Bonus',
  [StatType.GEO_P]: 'Geo DMG Bonus',
  [StatType.HYDRO_P]: 'Hydro DMG Bonus',
  [StatType.ANEMO_P]: 'Anemo DMG Bonus',
};

export enum ArtifactType {
  FLOWER = 'EQUIP_BRACER',
  PLUME = 'EQUIP_NECKLACE',
  SANDS = 'EQUIP_SHOES',
  RING = 'EQUIP_RING',
  CIRCLET = 'EQUIP_DRESS',
}

export const ArtifactTypeLabel: Record<ArtifactType, string> = {
  [ArtifactType.FLOWER]: 'Flower',
  [ArtifactType.PLUME]: 'Plume',
  [ArtifactType.SANDS]: 'Sands',
  [ArtifactType.RING]: 'Goblet',
  [ArtifactType.CIRCLET]: 'Circlet',
};

export enum MaterialType {
  TALENT_MATERIAL = 'talent',
  BOSS_MATERIAL = 'boss',
  GEMSTONE = 'gemstone',
  LOCAL_SPECIALTY = 'local-specialty',
  WEAPON_MATERIAL = 'weapon',
  GENERIC_MATERIAL = 'generic',
  XP_AND_MORA = 'xp-and-mora',
}

export const MaterialTypeLabel: Record<MaterialType, string> = {
  [MaterialType.TALENT_MATERIAL]: 'Talent Material',
  [MaterialType.BOSS_MATERIAL]: 'Boss Material',
  [MaterialType.GEMSTONE]: 'Gemstone',
  [MaterialType.LOCAL_SPECIALTY]: 'Local Specialty',
  [MaterialType.WEAPON_MATERIAL]: 'Weapon Material',
  [MaterialType.GENERIC_MATERIAL]: 'Material',
  [MaterialType.XP_AND_MORA]: 'XP & Mora',
};
