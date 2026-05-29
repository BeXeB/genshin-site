import { CharacterProfile } from './character';

export type TagDefinition = {
  id: string;
  label: string;
  backgroundcolor: string;
  color?: string;
};

export type CharacterTag = {
  id: string;
  label: string;
  backgroundcolor: string;
  color?: string;
  extra?: string[];
};

export type TierCharacter = {
  id: number;
  instanceId?: string;
  apiKey: string;
  tags: CharacterTag[];
};

export type Tier = {
  tier: string;
  characters: TierCharacter[];
};

export type Tierlist = {
  tiers: Tier[];
  tags: TagDefinition[];
};
