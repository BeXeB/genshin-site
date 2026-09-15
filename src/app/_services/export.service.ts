import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TalentExportData {
  selectedCharacter: any;
  briefDrafts: Record<string, string>;
  talentSections: any[];
}

export interface HyperlinkExportData {
  hyperlinks: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private talentData$ = new BehaviorSubject<TalentExportData | null>(null);
  private hyperlinkData$ = new BehaviorSubject<HyperlinkExportData | null>(
    null,
  );

  setTalentData(data: TalentExportData): void {
    this.talentData$.next(data);
  }

  setHyperlinkData(data: HyperlinkExportData): void {
    this.hyperlinkData$.next(data);
  }

  exportTalent(): void {
    const data = this.talentData$.value;
    if (!data || !data.selectedCharacter) return;

    try {
      const result: Record<string, string> = {};

      for (const section of data.talentSections) {
        for (const row of section.rows) {
          const value = data.briefDrafts[row.key]?.trim();
          if (value) {
            result[row.key] = value;
          }
        }
      }

      // Download brief descriptions
      const json = JSON.stringify(result, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.selectedCharacter.normalizedName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting brief descriptions:', error);
    }
  }

  exportHyperlinks(): void {
    const data = this.hyperlinkData$.value;
    if (!data) return;

    try {
      const toExport = data.hyperlinks.filter((h) => h.isCustom);

      const dataStr = JSON.stringify(toExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'custom-hyperlinks.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting hyperlinks:', error);
    }
  }
}
