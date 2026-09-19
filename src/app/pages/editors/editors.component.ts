import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
export class EditorsComponent implements OnInit {
  activeEditor: 'talent' | 'hyperlink' = 'talent';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exportService: ExportService,
    private editorHistoryService: EditorHistoryService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Navigate to talent editor by default
    this.selectEditor('talent');
  }

  selectEditor(editor: 'talent' | 'hyperlink'): void {
    this.activeEditor = editor;
    this.router.navigate([editor], { relativeTo: this.route });
  }

  export(): void {
    if (this.activeEditor === 'talent') {
      this.exportService.exportTalent();
    } else {
      this.exportService.exportHyperlinks();
    }
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
