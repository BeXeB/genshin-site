import { Component, Input, OnInit } from '@angular/core';
import { GuideViewerComponent } from '../../../_components/guide-viewer/guide-viewer.component';
import { ElementType, ElementTypeLabel } from '../../../_models/enum';

@Component({
  selector: 'app-character-guide',
  imports: [GuideViewerComponent],
  templateUrl: './character-guide.component.html',
  styleUrl: './character-guide.component.css',
})
export class CharacterGuideComponent implements OnInit {
  @Input() apikey: string | null = null;
  @Input() elementColor?: string | null;
  @Input() selectedElement: ElementType = ElementType.ANEMO;
  @Input() isTraveler: boolean = false;
  @Input() title: string = '';

  guideSource: string = '';

  ngOnInit(): void {
    this.updateGuideSource();
  }

  ngOnChanges(): void {
    this.updateGuideSource();
  }

  private updateGuideSource(): void {
    if (!this.apikey) {
      this.guideSource = '';
      return;
    }

    if (this.isTraveler) {
      // For travelers, construct source as "traveler-{element}"
      // Convert ElementType.GEO to "geo", ELEMENT_GEO to "geo", etc.
      const elementLabel = ElementTypeLabel[this.selectedElement].toLowerCase();
      this.guideSource = `traveler-${elementLabel}`;
    } else {
      this.guideSource = this.apikey;
    }
  }
}
