import { Rarity } from "../enums";

export interface BaseItemData {
  id: string;
  name: string;
  rarity: Rarity;
  icon: string;
}
