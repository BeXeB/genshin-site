import { Component } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../_services/material.service';
import { ImageService } from '../../_services/image.service';
import { MaterialResolved } from '../../_models/materials';
import { ResolverService } from '../../_services/resolver.service';
import { map, switchMap, Observable } from 'rxjs';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { BaseListComponent } from '../../_components/base-list.component';
import { FilterService } from '../../_services/filter.service';
import { PageFilters, FilterGroup } from '../../_models/filters';
import { StorageKeys } from '../../_models/storage-keys';

@Component({
  selector: 'app-materials',
  imports: [PageTitleComponent, FormsModule, ItemCardComponent],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.css',
})
export class MaterialsComponent extends BaseListComponent<MaterialResolved> {
  data: MaterialResolved[] = [];
  filtered: MaterialResolved[] = [];

  searchTerm: string = '';
  filters: PageFilters = {};

  filterGroups: FilterGroup[] = [];
  filterFns = {};

  get storageKey(): string {
    return StorageKeys.MATERIAL_FILTERS;
  }

  constructor(
    private materialService: MaterialService,
    private resolver: ResolverService,
    protected override filterService: FilterService,
    private imageService: ImageService
  ) {
    super(filterService);
  }

  loadData(): Observable<MaterialResolved[]> {
    return this.resolver.initialize().pipe(
      switchMap(() => this.materialService.getMaterials()),
      map((data) => this.resolver.resolveMaterials(data))
    );
  }

  transformData(data: MaterialResolved[]): MaterialResolved[] {
    return data.sort((a, b) => {
      if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;

      const rarityA = a.rarity ?? -Infinity;
      const rarityB = b.rarity ?? -Infinity;

      return rarityB - rarityA;
    });
  }

  getImage(material: MaterialResolved): string {
    return this.imageService.getMaterialImage(material.normalizedName, material.type);
  }
}
