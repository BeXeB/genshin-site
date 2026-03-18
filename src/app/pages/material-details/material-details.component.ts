import { Component, OnInit } from '@angular/core';
import { Material, MaterialResolved } from '../../_models/materials';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { MaterialService } from '../../_services/material.service';
import { map, switchMap } from 'rxjs';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-material-details',
  imports: [PageTitleComponent, RouterLink],
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
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const name = params.get('slug');
          if (!name) return [null];
          return this.resolver
            .initialize()
            .pipe(switchMap(() => this.materialService.getMaterial(name)))
            .pipe(
              map((data) =>
                data ? this.resolver.resolveMaterial(data) : null,
              ),
            );
        }),
      )
      .subscribe((resolvedMaterial) => {
        if (resolvedMaterial) {
          this.material = resolvedMaterial;
        } else {
          console.warn(`Material not found`);
          this.material = null;
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
