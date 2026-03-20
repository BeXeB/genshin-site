import { Component, OnInit, OnDestroy } from '@angular/core';
import { Guide } from '../../_models/guides';
import { GuidesService } from '../../_services/guides.service';
import { ImageService } from '../../_services/image.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-guides',
  imports: [PageTitleComponent, RouterLink],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.css',
})
export class GuidesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  guides: Guide[] = [];

  constructor(private guidesService: GuidesService, private imageService: ImageService) {}

  ngOnInit(): void {
    this.guidesService.getGuides()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.guides = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAvatarListIcon(): string {
    return this.imageService.getSkillIcon('UI_BtnIcon_AvatarList');
  }
}
