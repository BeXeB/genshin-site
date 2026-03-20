import { Component, Input } from '@angular/core';
import { GuideViewerComponent } from '../../../_components/guide-viewer/guide-viewer.component';

@Component({
  selector: 'app-character-guide',
  imports: [GuideViewerComponent],
  templateUrl: './character-guide.component.html',
  styleUrl: './character-guide.component.css',
})
export class CharacterGuideComponent {
  @Input() apikey: string | null = null;
  @Input() elementColor?: string | null;
}
