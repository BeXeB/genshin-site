import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ElementType } from '../../../_models/enum';

@Component({
  selector: 'app-character-guide',
  imports: [],
  templateUrl: './character-guide.component.html',
  styleUrl: './character-guide.component.css',
})
export class CharacterGuideComponent implements OnInit {
  @Input() apikey: string | null = null;
  @Input() elementColor: string | null = null;
  @Input() selectedElement: ElementType = ElementType.ANEMO;

  html: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    fetch(`assets/guides/characters/${this.apikey}.md`)
      .then((response) => {
        if (!response.ok) {
          this.html = '<p>Hamarosan</p>';
          throw new Error('Guide not found');
        }
        return response.text();
      })
      .then(async (markdown) => {
        const parsed = await marked(markdown);
        this.html = this.sanitizer.bypassSecurityTrustHtml(parsed);
      })
      .catch(() => {
        this.html = '<p>Hamarosan</p>';
      });
  }
}
