import { Component, OnInit } from '@angular/core';
import { ArtifactService } from '../../_services/artifact.service';
import { ArtifactSet } from '../../_models/artifacts';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FilterService } from '../../_services/filter.service';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { PageFilters } from '../../_models/filters';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';

@Component({
  selector: 'app-artifacts',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    RouterLink,
    FiltersComponent,
    ItemCardComponent,
  ],
  templateUrl: './artifacts.component.html',
  styleUrl: './artifacts.component.css',
})
export class ArtifactsComponent implements OnInit {
  private readonly STORAGE_KEY = 'artifactFilters';
  constructor(
    private artifactService: ArtifactService,
    private filterService: FilterService,
  ) {}

  artifacts: ArtifactSet[] = [];
  filteredArtifacts: ArtifactSet[] = [];

  searchTerm: string = '';
  filters: PageFilters = {};

  filterGroups = [
    {
      label: 'Ritkaság',
      key: 'rarity',
      options: ['5', '4', '3', '2', '1'],
    },
  ];

  filterFns = {
    rarity: (artifact: ArtifactSet, values: string[]) =>
      values.some((f) => artifact.rarityList.some((r) => r.toString() === f)),
  };

  ngOnInit(): void {
    const state = this.filterService.loadState(this.STORAGE_KEY);
    this.filters = state.filters ?? {};
    this.searchTerm = state.searchTerm;

    this.artifactService.getArtifacts().subscribe((data) => {
      this.artifacts = data.sort((a, b) => {
        let maxA = this.getMaxRarity(a);
        let maxB = this.getMaxRarity(b);
        return maxA < maxB ? 1 : -1;
      });
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredArtifacts = this.filterService.filter(
      this.artifacts,
      this.searchTerm,
      (c) => c.name,
      this.filters,
      this.filterFns,
    );

    this.filterService.saveState(this.STORAGE_KEY, {
      filters: this.filters,
      searchTerm: this.searchTerm,
    });
  }

  onFiltersChange(filters: PageFilters) {
    this.filters = filters;
    this.applyFilters();
  }

  getImage(artifact: ArtifactSet): string {
    let result = `assets/images/artifacts/${artifact.normalizedName}/`;
    result += artifact.effect1Pc ? 'circlet.webp' : 'flower.webp';
    return result;
  }

  getMaxRarity(artifact: ArtifactSet): number {
    let max = 0;
    artifact.rarityList.forEach((r) => {
      if (r > max) max = r;
    });

    return max;
  }
}
