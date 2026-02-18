import { MaterialData, MaterialFamilyData, MaterialGroupsData } from '../data/material';
import { MaterialType, Rarity } from '../enums';
import { BaseItem } from './base-item';

export class Material implements BaseItem {
  constructor(
    public id: string,
    public name: string,
    public rarity: Rarity,
    public icon: string,
    public type: MaterialType,
  ) {}

  static fromData(data: MaterialData): Material {
    return new Material(data.id, data.name, data.rarity, data.icon, data.type)
  }
}

export class MaterialFamily {
  constructor(
    public id: string,
    public rarities: MaterialRarities,
  ) {}

  static fromData(
    data: MaterialFamilyData,
    materialMap: Map<string, Material>
  ): MaterialFamily {
    const rarities: MaterialRarities = {
      onestar: data.rarities.onestar ? materialMap.get(data.rarities.onestar) : undefined,
      twostar: data.rarities.twostar ? materialMap.get(data.rarities.twostar) : undefined,
      threestar: data.rarities.threestar ? materialMap.get(data.rarities.threestar) : undefined,
      fourstar: data.rarities.fourstar ? materialMap.get(data.rarities.fourstar) : undefined,
      fivestar: data.rarities.fivestar ? materialMap.get(data.rarities.fivestar) : undefined,
    };

    return new MaterialFamily(data.id, rarities);
  }
}

export class MaterialGroups {
  constructor(
    public talentMaterials: MaterialFamily[] = [],
    public genericMaterials: MaterialFamily[] = [],
    public eliteMaterials: MaterialFamily[] = []
  ) {}

  static fromData(
    data: MaterialGroupsData,
    materialMap: Map<string, Material>
  ): MaterialGroups {
    return new MaterialGroups(
      data.talentMaterials.map(f => MaterialFamily.fromData(f, materialMap)),
      data.genericMaterials.map(f => MaterialFamily.fromData(f, materialMap)),
      data.eliteMaterials.map(f => MaterialFamily.fromData(f, materialMap))
    );
  }
}

export type MaterialRarities = {
  onestar?: Material;
  twostar?: Material;
  threestar?: Material;
  fourstar?: Material;
  fivestar?: Material;
};
