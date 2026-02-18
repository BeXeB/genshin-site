export interface CharacterAscensionMaterials {
  localSpecialty: number;
  bossMaterial: number;
  mora: number;
  gemstones: {
    twostar?: number;
    threestar?: number;
    fourstar?: number;
    fivestar?: number;
  };
  genericMaterials: {
    onestar?: number;
    twostar?: number;
    threestar?: number;
  };
}

export interface WeaponAscensionMaterials {
  mora: number;
  ascensionMaterials: {
    twostar?: number;
    threestar?: number;
    fourstar?: number;
    fivestar?: number;
  },
  eliteMaterials: {
    twostar?: number;
    threestar?: number;
    fourstar?: number;
  },
  genericMaterials: {
    onestar?: number;
    twostar?: number;
    threestar?: number;
  };
}

export interface TalentLevelupMaterials {
  mora: number;
  weeklyMaterial: number;
  genericMaterials: {
    onestar?: number;
    twostar?: number;
    threestar?: number;
  };
  talentMaterials: {
    twostar?: number;
    threestar?: number;
    fourstar?: number;
  }
}
