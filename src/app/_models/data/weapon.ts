import { BaseItemData } from '../data/base-item';
import { WeaponType } from '../enums';

export interface WeaponData  extends BaseItemData {
  type: WeaponType;
  genericMaterial: string;
  eliteMaterial: string;
}
