import { Component } from '@angular/core';
import { GuidesService } from '../../_services/guides.service';
import { ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { SafeHtml } from '@angular/platform-browser';
import { PageTitleComponent } from "../../_components/page-title/page-title.component";

@Component({
  selector: 'app-guide-details',
  imports: [PageTitleComponent],
  templateUrl: './guide-details.component.html',
  styleUrl: './guide-details.component.css',
})
export class GuideDetailsComponent {
  constructor(
    private guideService: GuidesService,
    private route: ActivatedRoute,
  ) {}

  slug: string = '';
  html: SafeHtml = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.slug = slug;
    this.guideService.getGuideMarkdown(slug).subscribe((data) => {
      this.html = marked(data);
    });
  }
}
