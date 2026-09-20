import { CharacterProfile } from "./character";

export type SlotType = 'eletre' | 'ejszakara' | 'kuka';

export interface CharacterSlot {
  type: SlotType;
  character: CharacterProfile | null;
}
