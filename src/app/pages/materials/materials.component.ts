import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../_services/material.service';
import { MaterialResolved } from '../../_models/materials';
import { ResolverService } from '../../_services/resolver.service';
import { RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { StorageService } from '../../_services/storage.service';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';

@Component({
  selector: 'app-materials',
  imports: [PageTitleComponent, FormsModule, RouterLink, ItemCardComponent],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.css',
})
export class MaterialsComponent implements OnInit {
  private readonly STORAGE_KEY = 'materialFilter';
  constructor(
    private materialService: MaterialService,
    private resolver: ResolverService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.materialService.getMaterials()),
        map((data) => this.resolver.resolveMaterials(data)),
      )
      .subscribe((resolvedMaterials) => {
        let sorted = resolvedMaterials.sort((a, b) => {
          if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;

          const rarityA = a.rarity ?? -Infinity;
          const rarityB = b.rarity ?? -Infinity;

          return rarityB - rarityA;
        });
        this.materials = sorted;
        this.onSearchTermChange();
      });
  }

  searchTerm: string = '';

  materials: MaterialResolved[] = [];
  filteredMaterials: MaterialResolved[] = [];

  onSearchTermChange(): void {
    let results = this.materials.filter((material) =>
      material.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );

    this.filteredMaterials = results;
    this.saveFilters();
  }

  getImage(material: MaterialResolved): string {
    return `assets/images/materials/${material.type}/${material.normalizedName}.webp`;
  }

  private saveFilters(): void {
    this.storageService.saveData<MaterialFilter>(this.STORAGE_KEY, {
      searchTerm: this.searchTerm,
    });
  }

  private loadFilters(): void {
    const saved = this.storageService.getData<MaterialFilter>(this.STORAGE_KEY);

    if (!saved) return;

    this.searchTerm = saved.searchTerm ?? '';
  }
}

interface MaterialFilter {
  searchTerm: string;
}
