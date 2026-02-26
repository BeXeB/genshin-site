import { Component, OnInit } from '@angular/core';
import { Guide } from '../../_models/guides';
import { GuidesService } from '../../_services/guides.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guides',
  imports: [PageTitleComponent, RouterLink],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.css',
})
export class GuidesComponent implements OnInit {
  constructor(private guidesService: GuidesService) {}

  ngOnInit(): void {
    this.guidesService.getGuides().subscribe((data) => {
      this.guides = data;
    });
  }

  guides: Guide[] = [];
}
