import { Component, OnInit } from '@angular/core';
import { ArtifactSet } from '../../_models/artifacts';
import { ActivatedRoute } from '@angular/router';
import { ArtifactService } from '../../_services/artifact.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-artifact-details',
  imports: [PageTitleComponent],
  templateUrl: './artifact-details.component.html',
  styleUrl: './artifact-details.component.css',
})
export class ArtifactDetailsComponent implements OnInit {
  artifact: ArtifactSet | null = null;

  constructor(
    private route: ActivatedRoute,
    private artifactService: ArtifactService,
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('slug');
    if (!name) return;
    this.artifactService.getArtifact(name).subscribe((data) => {
      this.artifact = data;
    });
  }

  toHtml(desc: string | undefined): SafeHtml {
    if (!desc) return '';
    return desc.replaceAll('\n', '<br>');
  }
}
