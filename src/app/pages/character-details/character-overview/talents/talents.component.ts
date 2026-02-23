import { Component, Input } from '@angular/core';
import { Character } from '../../../../_models/character';

@Component({
  selector: 'app-overview-talents',
  imports: [],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class OverviewTalentsComponent {
  @Input() char: Character | null = null;
  @Input() elementColor: string | null = null;
}
