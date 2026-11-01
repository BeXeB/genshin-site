import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LevelingCost } from '../../../_models/calculator';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';

/** One table row: projected cells sit between the name and the remove button; the cost opens below when expanded */
@Component({
  selector: 'app-entry-row',
  standalone: true,
  imports: [MaterialCostDisplayComponent],
  templateUrl: './entry-row.component.html',
  styleUrls: ['../calculator-table.css'],
})
export class EntryRowComponent {
  @Input({ required: true }) name = '';
  @Input() expanded = false;
  @Input() cost: LevelingCost | null = null;
  @Output() nameClicked = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
}
