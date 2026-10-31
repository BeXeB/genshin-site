import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LevelingCost } from '../../../_models/calculator';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { MaterialService } from '../../../_services/material.service';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';

@Component({
  selector: 'app-material-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialCostDisplayComponent],
  templateUrl: './material-inventory.component.html',
  styleUrls: ['../material-calculator.component.css'],
})
export class MaterialInventoryComponent {
  /** Every material at zero need, so the shared tables list the whole catalogue */
  allMaterials$ = this.materialService.getMaterials().pipe(
    map(
      (materials): LevelingCost => ({
        materials: materials.map((m) => ({ materialId: m.id, materialName: m.name, quantity: 0 })),
        totalMora: 0,
      }),
    ),
  );

  owned$ = this.calculatorState.inventory$.pipe(map((inventory) => inventory.ownedMaterials));

  constructor(
    private materialService: MaterialService,
    private calculatorState: CalculatorStateService,
  ) {}

  onOwnedChange(change: { materialId: number; quantity: number }): void {
    this.calculatorState.setOwnedMaterial(change.materialId, change.quantity);
  }
}
