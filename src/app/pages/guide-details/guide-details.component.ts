import { Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { GuideViewerComponent } from '../../_components/guide-viewer/guide-viewer.component';

@Component({
  selector: 'app-guide-details',
  imports: [PageTitleComponent, GuideViewerComponent],
  templateUrl: './guide-details.component.html',
  styleUrl: './guide-details.component.css',
})
export class GuideDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef
  ) {}

  slug: string = '';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        filter((slug): slug is string => !!slug),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slug) => {
        this.slug = slug;
      });
  }
}
