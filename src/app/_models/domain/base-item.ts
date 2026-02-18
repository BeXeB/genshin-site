import { Rarity } from "../enums";

export interface BaseItem {
  id: string;
  name: string;
  rarity: Rarity;
  icon: string;
}
