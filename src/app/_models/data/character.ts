import { BaseItemData } from './base-item';
import { Element, WeaponType } from '../enums';

export interface CharacterData extends BaseItemData {
  element: Element;
  weaponType: WeaponType;
  specialty: string;
  bossMaterial: string;
  talentMaterial: string;
  weeklyMaterial: string;
  genericMaterial: string;
}
