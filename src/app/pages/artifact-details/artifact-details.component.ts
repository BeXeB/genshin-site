import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ImageService } from '../../_services/image.service';
import { ArtifactSet } from '../../_models/artifacts';
import { ActivatedRoute } from '@angular/router';
import { ArtifactService } from '../../_services/artifact.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormatterService } from '../../_services/formatter.service';
import { takeUntil } from 'rxjs';
import { BaseDetailComponent } from '../../_components/base-detail.component';
import { FormattedTextComponent } from '../../_components/formatted-text-component/formatted-text.component';

@Component({
  selector: 'app-artifact-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitleComponent, FormattedTextComponent],
  templateUrl: './artifact-details.component.html',
  styleUrl: './artifact-details.component.css',
})
export class ArtifactDetailsComponent extends BaseDetailComponent<ArtifactSet> {
  artifact: ArtifactSet | null = null;
  errorMessage: string | null = null;

  constructor(
    protected override route: ActivatedRoute,
    private artifactService: ArtifactService,
    protected override formatterService: FormatterService,
    private cdr: ChangeDetectorRef,
    protected imageService: ImageService
  ) {
    super(route, formatterService);
  }

  override loadDetail(slug: string): void {
    this.artifact = null;
    this.errorMessage = null;
    this.artifactService
      .getArtifact(slug)
      .pipe(takeUntil(this.detailLoadCancelled$), takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.artifact = data;
          this.errorMessage = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = `Artifact "${slug}" not found`;
          this.cdr.markForCheck();
        },
      });
  }
}
