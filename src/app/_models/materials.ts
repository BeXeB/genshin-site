import { MaterialType } from './enum';

export type Material = {
  id: number;
  name: string;

  rarity?: 1 | 2 | 3 | 4 | 5;
  sortRank: number;
  description: string;

  type: MaterialType;
  typeText: string;

  dropDomainName?: string;
  daysOfWeek?: string[];

  images: {
    filename_icon: string;
  };
};

export type MaterialCraft = {
  id: number;

  resultCount: number;
  moraCost: number;
  recipe: CraftIngredient[];
};

export type CraftIngredient = {
  id: number;
  count: number;
};
