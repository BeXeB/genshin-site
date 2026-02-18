import { WeaponData } from '../data/weapon';
import { Rarity, WeaponType } from '../enums';
import { BaseItem } from './base-item';
import { MaterialFamily } from './materials';

export class Weapon implements BaseItem {
  constructor(
    public id: string,
    public name: string,
    public rarity: Rarity,
    public icon: string,

    public type: WeaponType,
    public genericMaterial: MaterialFamily,
    public eliteMaterial: MaterialFamily,
  ) {}

  static fromData(
    data: WeaponData,
    materialFamilyMap: Map<string, MaterialFamily>,
  ): Weapon {
    const generic = materialFamilyMap.get(data.genericMaterial);
    const elite = materialFamilyMap.get(data.eliteMaterial);

    if (!generic || !elite) {
      throw new Error(`MaterialFamily not found for Weapon ${data.id}`);
    }

    return new Weapon(
      data.id,
      data.name,
      data.rarity,
      data.icon,
      data.type,
      generic,
      elite,
    );
  }
}
