import { Injectable } from '@angular/core';
import { CharacterService } from './character.service';
import { HyperlinkService } from './hyperlink.service';
import { StorageKeys } from '../_models/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private characterService: CharacterService,
    private hyperlinkService: HyperlinkService
  ) {}

  exportEditorData(): void {
    this.exportTalentData();
    this.exportHyperlinkData();
  }

  private exportTalentData(): void {
    try {
      const stateJson = localStorage.getItem(StorageKeys.TALENT_EDITOR_STATE);

      if (!stateJson) {
        console.warn('No talent editor state found.');
        return;
      }

      const state = JSON.parse(stateJson);

      const characterName = state?.selectedCharacterId;

      if (!characterName) {
        console.warn('No selected character found in talent editor state.');
        return;
      }

      // Get the original, complete descriptions.
      this.characterService.getBriefDescriptions(characterName).subscribe({
        next: (originalDescriptions) => {
          // Start with ALL original descriptions.
          const exportData = {
            ...originalDescriptions,
          };

          // Overlay only the descriptions that were edited.
          if (state.editedDescriptions) {
            Object.assign(exportData, state.editedDescriptions);
          }

          this.downloadJson(exportData, `${this.sanitizeFilename(characterName)}.json`);
        },

        error: (error) => {
          console.error('Failed to load character descriptions for export:', error);
        },
      });
    } catch (error) {
      console.error('Error exporting talent data:', error);
    }
  }

  private exportHyperlinkData(): void {
    this.hyperlinkService.getCustomHyperlinks().subscribe({
      next: (hyperlinks) => {
        this.downloadJson(hyperlinks, 'custom-hyperlinks.json');
      },
      error: (error) => {
        console.error('Failed to load custom hyperlinks for export:', error);
      },
    });
  }

  private downloadJson(data: unknown, filename: string): void {
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, '_');
  }
}
