import { CharacterData } from '../data/character';
import { Element, Rarity, WeaponType } from '../enums';
import { BaseItem } from './base-item';
import { Material, MaterialFamily } from './materials';

export class Character implements BaseItem {
  constructor(
    public id: string,
    public name: string,
    public rarity: Rarity,
    public icon: string,

    public element: Element,
    public weaponType: WeaponType,

    public specialty: Material,
    public bossMaterial: Material,
    public weeklyMaterial: Material,

    public talentMaterial: MaterialFamily,
    public genericMaterial: MaterialFamily
  ) {}

  static fromData(
    data: CharacterData,
    materialMap: Map<string, Material>,
    familyMap: Map<string, MaterialFamily>
  ): Character {
    const specialty = materialMap.get(data.specialty);
    const bossMaterial = materialMap.get(data.bossMaterial);
    const weeklyMaterial = materialMap.get(data.weeklyMaterial);

    const talentFamily = familyMap.get(data.talentMaterial);
    const genericFamily = familyMap.get(data.genericMaterial);

    if (!specialty || !bossMaterial || !weeklyMaterial) {
      throw new Error(`Material not found for Character ${data.id}`);
    }

    if (!talentFamily || !genericFamily) {
      throw new Error(`MaterialFamily not found for Character ${data.id}`);
    }

    return new Character(
      data.id,
      data.name,
      data.rarity,
      data.icon,
      data.element,
      data.weaponType,
      specialty,
      bossMaterial,
      weeklyMaterial,
      talentFamily,
      genericFamily
    );
  }
}
