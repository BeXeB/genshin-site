import { Component, Input } from '@angular/core';
import { ConstellationDetail } from '../../../../../_models/character';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-constellation-details',
  imports: [],
  templateUrl: './constellation-details.component.html',
  styleUrl: './constellation-details.component.css',
})
export class ConstellationDetailsComponent {
  @Input() constellation: ConstellationDetail | undefined = undefined;
  @Input() elementColor: string | null = null;
  @Input() imageUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  getFormattedDescription(description: string | undefined): SafeHtml {
    if (!description) {
      return '';
    }

    description = description.replace(/\{LINK#[^}]+\}(.*?)\{\/LINK\}/g, '$1');

    description = description.replace(
      /<color="?(#?[0-9A-Fa-f]{3,8})"?>(.*?)<\/color>/g,
      (_, color, text) => {
        const normalizedColor = color.startsWith('#') ? color : `#${color}`;
        return `<span style="color:${normalizedColor}">${text}</span>`;
      },
    );

    description = description.replaceAll('\n', '<br>');

    description = description.replaceAll(
      /<br><br>/g,
      `</div><div style="margin: 14px 0;">`,
    );

    description = description.replaceAll(/<br>/g, '</div><div>');

    const htmlString = `<div style="margin: 0px 0px 14px;">${description}</div>`;

    const formattedDescription: SafeHtml =
      this.sanitizer.bypassSecurityTrustHtml(htmlString);

    return formattedDescription;
  }
}
