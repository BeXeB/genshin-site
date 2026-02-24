import { Component, Input, OnInit } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-character-guide',
  imports: [],
  templateUrl: './character-guide.component.html',
  styleUrl: './character-guide.component.css',
})
export class CharacterGuideComponent implements OnInit {
  @Input() apikey: string | null = null;
  @Input() elementColor: string | null = null;

  htmlContent: SafeHtml = '';

  ngOnInit(): void {
    fetch(`assets/guides/${this.apikey}.md`)
      .then((response) => {
        if (!response.ok) {
          this.htmlContent = '<p>Hamarosan</p>';
          throw new Error('Guide not found');
        }
        return response.text();
      })
      .then((markdown) => {
        this.htmlContent = marked(markdown);
      })
      .catch(() => {
        this.htmlContent = '<p>Hamarosan</p>';
      });
  }
}
