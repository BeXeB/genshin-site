import { Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HyperlinkService } from '../../_services/hyperlink.service';
import { HyperlinkInsertionService } from '../../_services/hyperlink-insertion.service';
import { ModalService } from '../../_services/modal.service';
import { Hyperlink } from '../../_models/hyperlinks';
import { FormattedTextComponent } from '../formatted-text-component/formatted-text.component';

interface HyperlinkWithType extends Hyperlink {
  type: 'game' | 'custom';
}

@Component({
  selector: 'app-hyperlink-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, FormattedTextComponent],
  templateUrl: './hyperlink-editor.component.html',
  styleUrl: './hyperlink-editor.component.css',
})
export class HyperlinkEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  // Browse
  searchQuery: string = '';
  hyperlinks: HyperlinkWithType[] = [];
  filteredHyperlinks: HyperlinkWithType[] = [];
  selectedHyperlink: HyperlinkWithType | null = null;
  showDropdown: boolean = false;

  // Modal state tracking
  private modalElement: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private wasOpen = false;

  constructor(
    private hyperlinkService: HyperlinkService,
    private insertionService: HyperlinkInsertionService,
    private modalService: ModalService,
    private el: ElementRef
  ) {}

  get showQuickLinks(): boolean {
    return this.insertionService.currentCharacterName !== null;
  }

  ngOnInit(): void {
    this.loadHyperlinks();
  }

  ngAfterViewInit(): void {
    // Find the parent app-modal element by traversing up the DOM
    let element: HTMLElement | null = this.el.nativeElement as HTMLElement;
    while (element && !element.classList.contains('app-modal')) {
      element = element.parentElement;
    }

    if (element) {
      this.modalElement = element;
      this.observer = new MutationObserver(() => {
        const isOpen = this.modalElement?.classList.contains('open');
        if (this.wasOpen && !isOpen) {
          this.reset();
        }
        this.wasOpen = isOpen || false;
      });

      this.observer.observe(this.modalElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadHyperlinks(): void {
    this.hyperlinkService.getHyperlinksMap().subscribe((map) => {
      const links: HyperlinkWithType[] = [];

      map.forEach((link, key) => {
        // Only show custom hyperlinks, not game ones
        if (link.isCustom) {
          links.push({ ...link, type: 'custom' });
        }
      });

      this.hyperlinks = links.sort((a, b) => {
        // Alphabetical by name
        return (a.name || '').localeCompare(b.name || '');
      });

      this.filterHyperlinks();
    });
  }

  filterHyperlinks(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredHyperlinks = this.hyperlinks.filter(
      (h) =>
        (h.name.toLowerCase().includes(query) || String(h.id).includes(query)) &&
        h.id !== this.insertionService.excludeHyperlinkId
    );
  }

  onSearchChange(): void {
    this.filterHyperlinks();
    this.selectedHyperlink = null;
  }

  selectHyperlink(hyperlink: HyperlinkWithType): void {
    this.selectedHyperlink = hyperlink;
    this.showDropdown = false;
  }

  showSearchDropdown(): void {
    this.showDropdown = true;
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  insertLink(hyperlink: HyperlinkWithType): void {
    this.insertionService.insertHyperlink(hyperlink.id, undefined, 'C');
  }

  insertQuickLink(talentKey: string): void {
    const characterName = this.insertionService.currentCharacterName;
    if (!characterName) {
      console.warn('No character context for quick link');
      return;
    }
    const linkId = `${characterName}-${talentKey}`;
    this.insertionService.insertHyperlink(linkId, undefined, 'Z');
  }

  getDisplayId(hyperlink: HyperlinkWithType): string {
    if (typeof hyperlink.id === 'number') {
      return `${hyperlink.id}`;
    }
    return hyperlink.id as string;
  }

  deselectHyperlink(): void {
    this.selectedHyperlink = null;
  }

  private reset(): void {
    this.searchQuery = '';
    this.selectedHyperlink = null;
    this.showDropdown = false;
    this.filterHyperlinks();
  }
}
