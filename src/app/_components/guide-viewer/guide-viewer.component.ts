import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from '../../_services/markdown.service';
import { Router } from '@angular/router';
import { marked } from 'marked';

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
export class GuideViewerComponent implements OnInit, OnChanges {
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

  // Helper to set content and optional TOC, attach scroll handlers
  private applyContent(content: string, tocHtml?: string | null) {
    this.html = this.sanitizer.bypassSecurityTrustHtml(content);

    // Only set TOC when parser returned non-empty content and TOC is enabled
    if (this.showToc && tocHtml && tocHtml.toString().trim().length > 0) {
      this.toc = this.sanitizer.bypassSecurityTrustHtml(tocHtml);
      setTimeout(() => this.addTOCScroll(), 0);
    } else {
      this.toc = '';
    }

    // Always attempt to scroll to hash if present
    setTimeout(() => this.scrollToHash(window.location.hash), 0);
  }

  constructor(
    private sanitizer: DomSanitizer,
    private markdownService: MarkdownService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadGuide();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'] || changes['sourceType']) {
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
      }
    } catch (error) {
      this.html = '<p>Hamarosan</p>';
    }
  }

  private loadCharacterGuide() {
    fetch(`assets/guides/characters/${this.source}.md`)
      .then((response) => {
        if (!response.ok) {
          this.html = '<p>Hamarosan</p>';
          throw new Error('Guide not found');
        }
        return response.text();
      })
      .then(async (markdown) => {
        const path = this.router.url.split('#')[0];
        const { content, toc } = await this.markdownService.parse(
          markdown,
          path,
        );

        this.applyContent(content, toc);
      })
      .catch(() => {
        this.html = '<p>Hamarosan</p>';
        this.toc = '';
      });
  }

  private loadGuideFile() {
    fetch(`assets/guides/${this.source}.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Guide not found');
        }
        return response.text();
      })
      .then(async (markdown) => {
        const parsed = await marked(markdown);
        this.applyContent(parsed, null);
      })
      .catch(() => {
        this.html = '<p>Hamarosan</p>';
        this.toc = '';
      });
  }

  private addTOCScroll() {
    document.querySelectorAll('.toc-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const href = (link as HTMLAnchorElement).getAttribute('href')!;
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;

        const id = href.substring(hashIndex + 1);
        this.scrollToHash(`#${id}`);

        history.replaceState(null, '', `${window.location.pathname}#${id}`);
      });
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
}
