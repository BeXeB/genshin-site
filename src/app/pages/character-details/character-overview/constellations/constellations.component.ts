import { Component, Input } from '@angular/core';
import { Character } from '../../../../_models/character';

@Component({
  selector: 'app-overview-constellations',
  imports: [],
  templateUrl: './constellations.component.html',
  styleUrl: './constellations.component.css',
})
export class OverviewConstellationsComponent {
  @Input() char: Character | null = null;
  @Input() elementColor: string | null = null;
}
