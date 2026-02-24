import { Component, Input } from '@angular/core';
import { ConstellationSkill } from '../../../../../_models/character';

@Component({
  selector: 'app-constellation-details',
  imports: [],
  templateUrl: './constellation-details.component.html',
  styleUrl: './constellation-details.component.css',
})
export class ConstellationDetailsComponent {
  @Input() constellation: ConstellationSkill | undefined = undefined;
  @Input() elementColor: string | null = null;
  @Input() imageUrl: string | null = null;
}
