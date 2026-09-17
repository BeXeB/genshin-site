import { Injectable } from '@angular/core';
import { CharacterBriefDescriptions } from '../_models/character';
import { ElementType } from '../_models/enum';
import { StorageService } from './storage.service';

interface TalentEditorState {
  selectedCharacterId: string | null;
  selectedSection: string | null;
  selectedTalentKey: keyof CharacterBriefDescriptions | null;
  selectedElement: ElementType | null;
  editedDescriptions: Record<string, string>;
}

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
      editedDescriptions: {},
    };
  }

  /**
   * Get the current state from storage
   */
  getState(): TalentEditorState {
    const stored = this.storageService.getData<TalentEditorState>(this.STORAGE_KEY);
    return stored || this.getEmptyState();
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
  saveEditedDescription(talentKey: keyof CharacterBriefDescriptions, content: string): void {
    const state = this.getState();
    if (content && content.trim().length > 0) {
      state.editedDescriptions[String(talentKey)] = content;
    } else {
      // Remove if empty
      delete state.editedDescriptions[String(talentKey)];
    }
    this.saveState(state);
  }

  /**
   * Get an edited description if it exists, otherwise undefined
   * Component should fall back to original JSON value if undefined
   */
  getEditedDescription(talentKey: keyof CharacterBriefDescriptions): string | undefined {
    const state = this.getState();
    return state.editedDescriptions[String(talentKey)];
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

  /**
   * Clear all state (called on download or error)
   */
  clearAll(): void {
    this.storageService.saveData(this.STORAGE_KEY, this.getEmptyState());
  }
}
