import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Material, MaterialResolved } from '../../_models/materials';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialService } from '../../_services/http/material.service';
import { ImageService } from '../../_services/image.service';
import { takeUntil } from 'rxjs';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormatterService } from '../../_services/formatter.service';
import { BaseDetailComponent } from '../../_components/base-detail.component';

@Component({
  selector: 'app-material-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitleComponent, RouterLink],
  templateUrl: './material-details.component.html',
  styleUrl: './material-details.component.css',
})
export class MaterialDetailsComponent extends BaseDetailComponent<MaterialResolved> {
  material: MaterialResolved | null = null;
  mora: Material | null = null;
  errorMessage: string | null = null;

  constructor(
    protected override route: ActivatedRoute,
    private materialService: MaterialService,
    protected override formatterService: FormatterService,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService,
  ) {
    super(route, formatterService);
  }

  override loadDetail(slug: string): void {
    // Fetch material with resolved craft data directly from backend
    this.materialService.getMaterialBySlugResolved(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resolvedMaterial) => {
          this.material = resolvedMaterial;
          this.errorMessage = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = `Material "${slug}" not found`;
          this.cdr.markForCheck();
        },
      });

    // Fetch mora separately for cost display
    this.materialService.getMaterial('mora')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mora = data ?? null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.mora = null;
          this.cdr.markForCheck();
        },
      });
  }

  getMaterialImage(material: Material | null): string {
    if (!material) return '';
    return this.imageService.getMaterialImage(material.normalizedName, material.type);
  }
}
