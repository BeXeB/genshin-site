import { Location } from '@angular/common';
import { Directive, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LevelingCost } from '../../_models/calculator';
import { CalculatorStateService } from '../../_services/calculator-state.service';
import { MaterialCalculationService } from '../../_services/material-calculation.service';
import { ImageService } from '../../_services/image.service';
import { replaceQueryParams } from './url-state';

/** Name shown for an inventory entry whose catalogue entry is missing */
export const UNKNOWN_ENTRY_NAME = 'Ismeretlen';

/** Shared services and URL-synced selection for the calculator tabs that render an entry table */
@Directive()
export abstract class CalculatorTableBase {
  protected readonly calculatorState = inject(CalculatorStateService);
  protected readonly calculationService = inject(MaterialCalculationService);
  protected readonly imageService = inject(ImageService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly location = inject(Location);

  calculatedCost: LevelingCost | null = null;

  /** Clears the subclass's expanded-row selection */
  protected abstract clearSelection(): void;

  /** Collapses the expanded row and removes it from the URL */
  protected collapseRow(): void {
    this.clearSelection();
    this.syncUrl({});
  }

  /** Writes the expanded row to the URL so Back returns to it */
  protected syncUrl(params: Params): void {
    replaceQueryParams(this.router, this.location, this.route, params);
  }
}
