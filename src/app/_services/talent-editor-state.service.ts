import { Injectable } from '@angular/core';
import { CharacterBriefDescriptions } from '../_models/character';
import { ElementType } from '../_models/enum';
import { StorageService } from './storage.service';

export interface TalentEditorState {
  selectedCharacterId: string | null;
  selectedSection: string | null;
  selectedTalentKey: keyof CharacterBriefDescriptions | null;
  selectedElement: ElementType | null;
  editedDescriptionsByCharacter: Record<string, Partial<CharacterBriefDescriptions>>;
  editedDescriptionsByCharacterElement: Record<
    string,
    Partial<Record<ElementType, Partial<CharacterBriefDescriptions>>>
  >;
}

type StoredTalentEditorState = Partial<TalentEditorState> & {
  editedDescriptions?: Record<string, string>;
};

@Injectable({
  providedIn: 'root',
})
export class TalentEditorStateService {
  private readonly STORAGE_KEY = 'talentEditorState';

  constructor(private storageService: StorageService) {}

  private getEmptyState(): TalentEditorState {
    return {
      selectedCharacterId: null,
      selectedSection: null,
      selectedTalentKey: null,
      selectedElement: null,
      editedDescriptionsByCharacter: {},
      editedDescriptionsByCharacterElement: {},
    };
  }

  /**
   * Get the current state from storage
   */
  getState(): TalentEditorState {
    const stored = this.storageService.getData<StoredTalentEditorState>(this.STORAGE_KEY);
    if (!stored) return this.getEmptyState();

    const editedDescriptionsByCharacter = stored.editedDescriptionsByCharacter ?? {};
    const editedDescriptionsByCharacterElement = stored.editedDescriptionsByCharacterElement ?? {};
    if (
      stored.selectedCharacterId &&
      stored.editedDescriptions &&
      !editedDescriptionsByCharacter[stored.selectedCharacterId]
    ) {
      editedDescriptionsByCharacter[stored.selectedCharacterId] = stored.editedDescriptions;
    }

    if (
      stored.selectedCharacterId &&
      stored.selectedElement &&
      editedDescriptionsByCharacter[stored.selectedCharacterId] &&
      !editedDescriptionsByCharacterElement[stored.selectedCharacterId]?.[stored.selectedElement]
    ) {
      editedDescriptionsByCharacterElement[stored.selectedCharacterId] = {
        ...editedDescriptionsByCharacterElement[stored.selectedCharacterId],
        [stored.selectedElement]: editedDescriptionsByCharacter[stored.selectedCharacterId],
      };
      delete editedDescriptionsByCharacter[stored.selectedCharacterId];
    }

    const selectedCharacterId = stored.selectedCharacterId ?? null;
    return {
      selectedCharacterId,
      selectedSection: stored.selectedSection ?? null,
      selectedTalentKey: stored.selectedTalentKey ?? null,
      selectedElement: stored.selectedElement ?? null,
      editedDescriptionsByCharacter,
      editedDescriptionsByCharacterElement,
    };
  }

  /**
   * Save the current state to storage
   */
  private saveState(state: TalentEditorState): void {
    this.storageService.saveData(this.STORAGE_KEY, state);
  }

  /**
   * Save character selection and navigation state
   */
  saveCharacterSelection(
    characterId: string,
    section: string | null,
    talentKey: keyof CharacterBriefDescriptions | null,
    element: ElementType | null
  ): void {
    const state = this.getState();
    state.selectedCharacterId = characterId;
    state.selectedSection = section;
    state.selectedTalentKey = talentKey;
    state.selectedElement = element;
    this.saveState(state);
  }

  /**
   * Save an edited description (delta approach - only store if edited)
   * Only called when user modifies content
   */
  saveEditedDescription(
    talentKey: keyof CharacterBriefDescriptions,
    content: string,
    characterId?: string,
    element?: ElementType
  ): void {
    const state = this.getState();
    const targetCharacterId = characterId ?? state.selectedCharacterId;
    if (!targetCharacterId) return;

    const descriptions = element
      ? (state.editedDescriptionsByCharacterElement[targetCharacterId]?.[element] ?? {})
      : (state.editedDescriptionsByCharacter[targetCharacterId] ?? {});
    descriptions[talentKey] = content;
    if (element) {
      state.editedDescriptionsByCharacterElement[targetCharacterId] = {
        ...state.editedDescriptionsByCharacterElement[targetCharacterId],
        [element]: descriptions,
      };
    } else {
      state.editedDescriptionsByCharacter[targetCharacterId] = descriptions;
    }
    this.saveState(state);
  }

  /**
   * Get an edited description if it exists, otherwise undefined
   * Component should fall back to original JSON value if undefined
   */
  getEditedDescription(
    talentKey: keyof CharacterBriefDescriptions,
    characterId?: string,
    element?: ElementType
  ): string | undefined {
    const state = this.getState();
    const targetCharacterId = characterId ?? state.selectedCharacterId;
    if (!targetCharacterId) return undefined;

    return element
      ? state.editedDescriptionsByCharacterElement[targetCharacterId]?.[element]?.[talentKey]
      : state.editedDescriptionsByCharacter[targetCharacterId]?.[talentKey];
  }

  getEditedDescriptions(
    characterId: string,
    element?: ElementType
  ): Partial<CharacterBriefDescriptions> {
    const state = this.getState();
    return element
      ? (state.editedDescriptionsByCharacterElement[characterId]?.[element] ?? {})
      : (state.editedDescriptionsByCharacter[characterId] ?? {});
  }

  /**
   * Check if the stored character ID still exists in the provided list
   * Returns false if state is invalid or character no longer exists
   */
  validateState(availableCharacterIds: string[]): boolean {
    const state = this.getState();
    if (!state.selectedCharacterId) {
      return false;
    }
    return availableCharacterIds.includes(state.selectedCharacterId);
  }

  clearSelection(): void {
    const state = this.getState();
    state.selectedCharacterId = null;
    state.selectedSection = null;
    state.selectedTalentKey = null;
    state.selectedElement = null;
    this.saveState(state);
  }

  /**
   * Clear all state (called on download or error)
   */
  clearAll(): void {
    this.storageService.saveData(this.STORAGE_KEY, this.getEmptyState());
  }
}
