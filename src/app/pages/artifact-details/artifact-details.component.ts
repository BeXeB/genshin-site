import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ArtifactSet } from '../../_models/artifacts';
import { ActivatedRoute } from '@angular/router';
import { ArtifactService } from '../../_services/artifact.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { SafeHtml } from '@angular/platform-browser';
import { FormatterService } from '../../_services/formatter.service';

@Component({
  selector: 'app-artifact-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitleComponent],
  templateUrl: './artifact-details.component.html',
  styleUrl: './artifact-details.component.css',
})
export class ArtifactDetailsComponent implements OnInit {
  artifact: ArtifactSet | null = null;

  constructor(
    private route: ActivatedRoute,
    private artifactService: ArtifactService,
    private formatterService: FormatterService,
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('slug');
    if (!name) return;
    this.artifactService.getArtifact(name).subscribe((data) => {
      this.artifact = data;
      console.log('Fetched artifact:', this.artifact);
    });
  }

  toHtml(desc: string | undefined): SafeHtml {
    return this.formatterService.simpleHtmlConvert(desc);
  }
}
