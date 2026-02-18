import { BaseItemData } from './base-item';
import { MaterialType } from '../enums';

export interface MaterialData extends BaseItemData {
  type: MaterialType;
}

export interface MaterialFamilyData {
  id: string;
  rarities: {
    onestar?: string;
    twostar?: string;
    threestar?: string;
    fourstar?: string;
    fivestar?: string;
  };
}

export interface MaterialGroupsData {
  talentMaterials: MaterialFamilyData[];
  genericMaterials: MaterialFamilyData[];
  eliteMaterials: MaterialFamilyData[];
}
