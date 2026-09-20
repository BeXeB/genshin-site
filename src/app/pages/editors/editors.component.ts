import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { ExportService } from '../../_services/export.service';
import { EditorHistoryService } from '../../_services/editor-history.service';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-editors',
  standalone: true,
  imports: [CommonModule, RouterModule, PageTitleComponent],
  templateUrl: './editors.component.html',
  styleUrl: './editors.component.css',
})
export class EditorsComponent {
  constructor(
    private exportService: ExportService,
    private editorHistoryService: EditorHistoryService,
    private storageService: StorageService
  ) {}

  export(): void {
    this.exportService.exportEditorData();
  }

  resetEditorData(): void {
    const confirmed = confirm('Are you sure? This will clear all editor data.');
    if (confirmed) {
      this.editorHistoryService.clearAll();
      this.storageService.clearEditorData();
      location.reload();
    }
  }
}
