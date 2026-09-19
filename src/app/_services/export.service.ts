import { Injectable } from '@angular/core';
import { CharacterService } from './character.service';
import { HyperlinkService } from './hyperlink.service';
import { TalentEditorStateService } from './talent-editor-state.service';
import { CharacterBriefDescriptions } from '../_models/character';
import { forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private characterService: CharacterService,
    private hyperlinkService: HyperlinkService,
    private talentEditorStateService: TalentEditorStateService
  ) {}

  exportEditorData(): void {
    this.exportTalentData();
    this.exportHyperlinkData();
  }

  private exportTalentData(): void {
    const editedCharacters = Object.entries(
      this.talentEditorStateService.getEditedCharacters()
    );

    if (editedCharacters.length === 0) {
      console.warn('No edited talent descriptions found.');
      return;
    }

    forkJoin(
      editedCharacters.map(([characterName, editedDescriptions]) =>
        this.characterService.getBriefDescriptions(characterName).pipe(
          map((originalDescriptions) => ({
            characterName,
            descriptions: {
              ...this.getEmptyTalentDescriptions(),
              ...originalDescriptions,
              ...editedDescriptions,
            },
          }))
        )
      )
    ).subscribe({
      next: (characters) => {
        characters.forEach(({ characterName, descriptions }) => {
          this.downloadJson(descriptions, `${this.sanitizeFilename(characterName)}.json`);
        });
      },
      error: (error) => {
        console.error('Failed to export talent descriptions:', error);
      },
    });
  }

  private getEmptyTalentDescriptions(): Required<CharacterBriefDescriptions> {
    return {
      combat1: '',
      combat2: '',
      combat3: '',
      passive1: '',
      passive2: '',
      passive3: '',
      passive4: '',
      c1: '',
      c2: '',
      c3: '',
      c4: '',
      c5: '',
      c6: '',
    };
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
