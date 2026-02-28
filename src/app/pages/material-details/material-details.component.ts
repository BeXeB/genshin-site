import { Component, OnInit } from '@angular/core';
import { Material, MaterialResolved } from '../../_models/materials';
import { ActivatedRoute } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { MaterialService } from '../../_services/material.service';
import { map, switchMap } from 'rxjs';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-material-details',
  imports: [PageTitleComponent],
  templateUrl: './material-details.component.html',
  styleUrl: './material-details.component.css',
})
export class MaterialDetailsComponent implements OnInit {
  material: MaterialResolved | null = null;
  mora: Material | null = null;

  constructor(
    private route: ActivatedRoute,
    private resolver: ResolverService,
    private materialService: MaterialService,
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('slug');
    if (!name) return;

    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.materialService.getMaterial(name)),
        map((data) => {
          if (!data) return null;
          return this.resolver.resolveMaterial(data);
        }),
      )
      .subscribe((resolvedMaterial) => {
        if (resolvedMaterial) {
          this.material = resolvedMaterial;
        } else {
          console.warn(`Material with slug "${name}" not found`);
        }
      });
    this.materialService.getMaterial('mora').subscribe((data) => {
      this.mora = data ?? null;
    });
  }

  toHtml(desc: string): SafeHtml {
    return desc.replaceAll('\n', '<br>');
  }
}
