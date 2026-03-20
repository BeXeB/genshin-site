import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { GuideViewerComponent } from '../../_components/guide-viewer/guide-viewer.component';

@Component({
  selector: 'app-guide-details',
  imports: [PageTitleComponent, GuideViewerComponent],
  templateUrl: './guide-details.component.html',
  styleUrl: './guide-details.component.css',
})
export class GuideDetailsComponent {
  constructor(private route: ActivatedRoute) {}

  slug: string = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.slug = slug;
  }
}
