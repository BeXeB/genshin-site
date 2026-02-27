import { CharacterProfile } from "./character";

export type TagDefinition = {
  id: string;
  label: string;
  color: string;
}

export type CharacterTag = {
  id: string;
  label: string;
  color: string;
  extra?: string[];
}

export type TierCharacter = {
  id: number;
  apiKey: string;
  tags: CharacterTag[];
  profile?: CharacterProfile;
}

export type Tier = {
  tier: string;
  characters: TierCharacter[];
}

export type Tierlist = {
  tiers: Tier[],
  tags: TagDefinition[]
}
