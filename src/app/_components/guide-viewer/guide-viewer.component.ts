import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from '../../_services/markdown.service';
import { GuidesService } from '../../_services/guides.service';
import { Router } from '@angular/router';
import { marked } from 'marked';
import { Subject, takeUntil } from 'rxjs';

export type GuideSourceType =
  | 'markdown-content'
  | 'character-file'
  | 'guide-file';

@Component({
  selector: 'app-guide-viewer',
  imports: [],
  templateUrl: './guide-viewer.component.html',
  styleUrl: './guide-viewer.component.css',
})
export class GuideViewerComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Type of guide source
   * - 'markdown-content': raw markdown passed directly
   * - 'character-file': load from assets/guides/characters/{apikey}.md
   * - 'guide-file': load from assets/guides/{slug}.md
   */
  @Input() sourceType: GuideSourceType = 'markdown-content';

  /**
   * The markdown content or file identifier (slug/apikey depending on sourceType)
   */
  @Input() source: string = '';

  /**
   * Whether to display the TOC (Table of Contents). Only works with MarkdownService
   */
  @Input() showToc: boolean = false;

  /**
   * Color for TOC and guide container borders (for character guides)
   */
  @Input() elementColor?: string | null;

  /**
   * Custom title to show above the guide content
   */
  @Input() title: string = 'Útmutató';

  html: SafeHtml = '';
  toc: SafeHtml | string = '';

  private tocEventListeners: Array<{el: Element, listener: EventListener}> = [];
  private pendingTimeouts: number[] = [];
  private destroy$ = new Subject<void>();

  // Helper to clean up event listeners from previous TOC
  private cleanupTOCListeners() {
    this.tocEventListeners.forEach(({el, listener}) => {
      el.removeEventListener('click', listener);
    });
    this.tocEventListeners = [];
  }

  // Helper to cancel all pending operations
  private cancelPendingOperations() {
    // Signal to cancel any ongoing subscriptions
    this.destroy$.next();

    // Clear any pending timeouts
    this.pendingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.pendingTimeouts = [];
  }

  // Helper to schedule a timeout and track it
  private scheduleTimeout(callback: () => void, delay: number): number {
    const timeoutId = window.setTimeout(callback, delay);
    this.pendingTimeouts.push(timeoutId);
    return timeoutId;
  }

  // Helper to set content and optional TOC, attach scroll handlers
  private applyContent(content: string, tocHtml?: string | null) {
    this.cleanupTOCListeners();
    this.html = this.sanitizer.bypassSecurityTrustHtml(content);

    // Only set TOC when parser returned non-empty content and TOC is enabled
    if (this.showToc && tocHtml && tocHtml.toString().trim().length > 0) {
      this.toc = this.sanitizer.bypassSecurityTrustHtml(tocHtml);
      this.scheduleTimeout(() => this.addTOCScroll(), 0);
    } else {
      this.toc = '';
    }

    // Always attempt to scroll to hash if present
    this.scheduleTimeout(() => this.scrollToHash(window.location.hash), 0);

    // Trigger change detection for components using OnPush
    this.cdr.markForCheck();
  }

  constructor(
    private sanitizer: DomSanitizer,
    private markdownService: MarkdownService,
    private guidesService: GuidesService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGuide();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'] || changes['sourceType']) {
      // Cancel any ongoing operations before loading new guide
      this.cancelPendingOperations();
      this.loadGuide();
    }
  }

  private loadGuide(): void {
    switch (this.sourceType) {
      case 'markdown-content':
        this.loadMarkdownContent();
        break;
      case 'character-file':
        this.loadCharacterGuide();
        break;
      case 'guide-file':
        this.loadGuideFile();
        break;
    }
  }

  private async loadMarkdownContent() {
    try {
      if (this.showToc) {
        // Use MarkdownService for TOC generation
        const path = this.router.url.split('#')[0];
        const { content, toc } = await this.markdownService.parse(
          this.source,
          path,
        );
        this.applyContent(content, toc);
      } else {
        // Use basic marked for plain markdown
        const parsed = await marked(this.source);
        this.html = this.sanitizer.bypassSecurityTrustHtml(parsed);
        this.cdr.markForCheck();
      }
    } catch (error) {
      this.html = '<p>Hamarosan</p>';
      this.cdr.markForCheck();
    }
  }

  private loadCharacterGuide() {
    this.guidesService
      .getCharacterGuideMarkdown(this.source)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (markdown) => {
          try {
            const path = this.router.url.split('#')[0];
            const { content, toc } = await this.markdownService.parse(
              markdown,
              path,
            );
            this.applyContent(content, toc);
          } catch (error) {
            this.html = '<p>Hamarosan</p>';
            this.toc = '';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.html = '<p>Hamarosan</p>';
          this.toc = '';
          this.cdr.markForCheck();
        },
      });
  }

  private loadGuideFile() {
    this.guidesService
      .getGuideMarkdown(this.source)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (markdown) => {
          try {
            const parsed = await marked(markdown);
            this.applyContent(parsed, null);
          } catch (error) {
            this.html = '<p>Hamarosan</p>';
            this.toc = '';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.html = '<p>Hamarosan</p>';
          this.toc = '';
          this.cdr.markForCheck();
        },
      });
  }

  private addTOCScroll() {
    document.querySelectorAll('.toc-link').forEach((link) => {
      const listener = (e: Event) => {
        e.preventDefault();

        const href = (link as HTMLAnchorElement).getAttribute('href')!;
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;

        const id = href.substring(hashIndex + 1);
        this.scrollToHash(`#${id}`);

        history.replaceState(null, '', `${window.location.pathname}#${id}`);
      };
      link.addEventListener('click', listener);
      this.tocEventListeners.push({el: link, listener});
    });
  }

  private scrollToHash(hash: string) {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elemRect = target.getBoundingClientRect().top;
      const scrollPos = elemRect - bodyRect - offset;

      window.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.cleanupTOCListeners();
    this.pendingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.destroy$.next();
    this.destroy$.complete();
  }
}
