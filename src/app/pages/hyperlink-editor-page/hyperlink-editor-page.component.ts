import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { HyperlinkInsertionService } from '../../_services/hyperlink-insertion.service';
import { ModalService } from '../../_services/modal.service';
import { ExportService } from '../../_services/export.service';
import {
  FormattedTextEditorComponent,
  HyperlinkRequest,
} from '../../_components/formatted-text-editor/formatted-text-editor.component';
import { HyperlinkEditorComponent } from '../../_components/hyperlink-editor/hyperlink-editor.component';
import { Hyperlink } from '../../_models/hyperlinks';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface HyperlinkListItem extends Hyperlink {
  type: 'custom';
}

@Component({
  selector: 'app-hyperlink-editor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FormattedTextEditorComponent],
  templateUrl: './hyperlink-editor-page.component.html',
  styleUrl: './hyperlink-editor-page.component.css',
})
export class HyperlinkEditorPageComponent implements OnInit, OnDestroy {
  // List state
  hyperlinks: HyperlinkListItem[] = [];
  searchQuery: string = '';
  filteredHyperlinks: HyperlinkListItem[] = [];
  selectedHyperlink: HyperlinkListItem | null = null;

  // Create form state
  showCreateForm = false;
  newHyperlinkId: string = '';
  newHyperlinkName: string = '';
  newHyperlinkDescription: string = '';
  createError: string = '';

  // Edit form state
  editingName: string = '';
  editingDescription: string = '';
  isEditing = false;

  // Hyperlink insertion context
  currentEditField: 'create-description' | 'edit-description' | null = null;
  currentHyperlinkRequest: HyperlinkRequest | null = null;
  currentHyperlinkId: string | null = null; // Track ID of hyperlink being edited to prevent self-insertion

  private destroy$ = new Subject<void>();

  constructor(
    private hyperlinkService: HyperlinkService,
    private insertionService: HyperlinkInsertionService,
    private modalService: ModalService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadHyperlinks();

    // Subscribe to hyperlink insertions from the modal
    this.insertionService.insertion$.pipe(takeUntil(this.destroy$)).subscribe((insertion) => {
      this.insertHyperlink(insertion.id, insertion.displayText);
    });
  }

  /**
   * Load all custom hyperlinks from service
   */
  loadHyperlinks(): void {
    this.hyperlinkService
      .getHyperlinksMap()
      .pipe(takeUntil(this.destroy$))
      .subscribe((map) => {
        const links: HyperlinkListItem[] = [];

        map.forEach((link, key) => {
          if (link.isCustom) {
            links.push({ ...link, type: 'custom' });
          }
        });

        this.hyperlinks = links.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        this.filterHyperlinks();
        this.updateExportData();
      });
  }

  /**
   * Filter hyperlinks based on search query
   */
  filterHyperlinks(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredHyperlinks = this.hyperlinks.filter(
      (h) => h.name.toLowerCase().includes(query) || String(h.id).includes(query)
    );
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    this.filterHyperlinks();
  }

  /**
   * Handle hyperlink request from FormattedTextEditorComponent
   */
  onHyperlinkRequested(
    field: 'create-description' | 'edit-description',
    request: HyperlinkRequest
  ): void {
    this.currentEditField = field;
    this.currentHyperlinkRequest = request;
    // For edit field, prevent inserting the hyperlink into itself
    this.currentHyperlinkId =
      field === 'edit-description' ? (this.selectedHyperlink?.id as string) : null;
    // Clear character context so quick links won't show in modal
    this.insertionService.setCurrentCharacter(null);
    // Exclude current hyperlink from being selectable to prevent infinite recursion
    this.insertionService.setExcludedHyperlinkId(this.currentHyperlinkId);
    this.modalService.open('hyperlink-editor');
  }

  /**
   * Insert hyperlink into the appropriate description field
   */
  insertHyperlink(hyperlinkId: string | number, displayText?: string): void {
    if (!this.currentEditField || !this.currentHyperlinkRequest) return;

    const request = this.currentHyperlinkRequest;
    const start = request.selectionStart;
    const end = request.selectionEnd;
    const selected = request.selectedText || 'Link';

    // Create link markup using the same format as talent editor
    const linkMarkup = `{LINK#${hyperlinkId}}${selected}{/LINK}`;

    // Insert into the appropriate field
    if (this.currentEditField === 'create-description') {
      const value = this.newHyperlinkDescription;
      const newValue = value.slice(0, start) + linkMarkup + value.slice(end);
      this.newHyperlinkDescription = newValue;
    } else if (this.currentEditField === 'edit-description') {
      const value = this.editingDescription;
      const newValue = value.slice(0, start) + linkMarkup + value.slice(end);
      this.editingDescription = newValue;
    }

    // Clear context and close modal
    this.currentEditField = null;
    this.currentHyperlinkRequest = null;
    this.currentHyperlinkId = null;
    this.insertionService.setExcludedHyperlinkId(null);
    this.modalService.close();
  }

  selectHyperlink(hyperlink: HyperlinkListItem): void {
    this.selectedHyperlink = hyperlink;
    this.editingName = hyperlink.name;
    this.editingDescription = hyperlink.description;
    this.isEditing = false;
  }

  /**
   * Deselect current hyperlink
   */
  deselectHyperlink(): void {
    this.selectedHyperlink = null;
    this.editingName = '';
    this.editingDescription = '';
    this.isEditing = false;
  }

  /**
   * Toggle create form visibility
   */
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  /**
   * Reset create form
   */
  resetCreateForm(): void {
    this.newHyperlinkId = '';
    this.newHyperlinkName = '';
    this.newHyperlinkDescription = '';
    this.createError = '';
  }

  /**
   * Validate new hyperlink form
   */
  validateNewHyperlink(): boolean {
    this.createError = '';

    if (!this.newHyperlinkId.trim()) {
      this.createError = 'ID is required';
      return false;
    }

    if (!this.newHyperlinkId.match(/^[a-z0-9\-]+$/)) {
      this.createError = 'ID must contain only lowercase letters, numbers, and hyphens';
      return false;
    }

    if (!this.newHyperlinkName.trim()) {
      this.createError = 'Name is required';
      return false;
    }

    if (!this.newHyperlinkDescription.trim()) {
      this.createError = 'Description is required';
      return false;
    }

    if (this.hyperlinks.some((h) => h.id === this.newHyperlinkId)) {
      this.createError = 'This ID already exists';
      return false;
    }

    return true;
  }

  /**
   * Create a new custom hyperlink
   */
  createNewHyperlink(): void {
    if (!this.validateNewHyperlink()) {
      return;
    }

    const newHyperlink: Hyperlink = {
      id: this.newHyperlinkId,
      name: this.newHyperlinkName,
      description: this.newHyperlinkDescription,
      isCustom: true,
    };

    this.hyperlinkService.addCustomHyperlink(newHyperlink);
    this.loadHyperlinks();
    this.resetCreateForm();
    this.showCreateForm = false;
  }

  /**
   * Save changes to selected hyperlink
   */
  saveHyperlink(): void {
    if (!this.selectedHyperlink) return;

    if (!this.editingName.trim()) {
      alert('Name is required');
      return;
    }

    if (!this.editingDescription.trim()) {
      alert('Description is required');
      return;
    }

    this.hyperlinkService.updateCustomHyperlink(
      this.selectedHyperlink.id as string,
      this.editingName,
      this.editingDescription
    );

    this.loadHyperlinks();
    this.deselectHyperlink();
  }

  /**
   * Delete the selected hyperlink
   */
  deleteHyperlink(): void {
    if (!this.selectedHyperlink) return;

    if (!confirm(`Delete hyperlink "${this.selectedHyperlink.name}"?`)) {
      return;
    }

    this.hyperlinkService.deleteCustomHyperlink(this.selectedHyperlink.id as string);

    this.loadHyperlinks();
    this.deselectHyperlink();
  }

  private updateExportData(): void {
    this.exportService.setHyperlinkData({
      hyperlinks: this.hyperlinks,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
