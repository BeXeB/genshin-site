import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { LevelingCost } from '../../../_models/calculator';
import { MaterialType } from '../../../_models/enum';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { MaterialService } from '../../../_services/material.service';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';

const HIDDEN_INVENTORY_IDS = new Set([112001, 113021]);

@Component({
  selector: 'app-material-inventory',
  standalone: true,
  imports: [CommonModule, MaterialCostDisplayComponent],
  templateUrl: './material-inventory.component.html',
  styleUrls: ['../calculator-table.css'],
})
export class MaterialInventoryComponent {
  /**
   * Every material at zero need, so the shared tables list the whole catalogue.
   * Crystals are only listed when a craft recipe uses them.
   */
  allMaterials$ = combineLatest([
    this.materialService.getMaterials(),
    this.materialService.getMaterialCrafts(),
  ]).pipe(
    map(([materials, crafts]): LevelingCost => {
      const craftIngredientIds = new Set(
        crafts.flatMap((craft) => craft.recipe.map((item) => item.id))
      );
      return {
        materials: materials
          .filter((m) => !HIDDEN_INVENTORY_IDS.has(m.id))
          .filter((m) => m.type !== MaterialType.CRYSTAL || craftIngredientIds.has(m.id))
          .map((m) => ({ materialId: m.id, materialName: m.name, quantity: 0 })),
        totalMora: 0,
      };
    })
  );

  owned$ = this.calculatorState.inventory$.pipe(map((inventory) => inventory.ownedMaterials));

  constructor(
    private materialService: MaterialService,
    private calculatorState: CalculatorStateService
  ) {}

  onOwnedChange(change: { materialId: number; quantity: number }): void {
    this.calculatorState.setOwnedMaterial(change.materialId, change.quantity);
  }
}
