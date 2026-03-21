import { Component } from '@angular/core';
import { ArtifactService } from '../../_services/artifact.service';
import { ImageService } from '../../_services/image.service';
import { ArtifactSet } from '../../_models/artifacts';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FilterService } from '../../_services/filter.service';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { PageFilters, FilterGroup } from '../../_models/filters';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { BaseListComponent } from '../../_components/base-list.component';
import { Observable } from 'rxjs';

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
export class ArtifactsComponent extends BaseListComponent<ArtifactSet> {
  private readonly _storageKey = 'artifactFilters';

  data: ArtifactSet[] = [];
  filtered: ArtifactSet[] = [];

  searchTerm: string = '';
  filters: PageFilters = {};

  filterGroups: FilterGroup[] = [
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

  get storageKey(): string {
    return this._storageKey;
  }

  constructor(
    private artifactService: ArtifactService,
    protected override filterService: FilterService,
    private imageService: ImageService,
  ) {
    super(filterService);
  }

  loadData(): Observable<ArtifactSet[]> {
    return this.artifactService.getArtifacts();
  }

  transformData(data: ArtifactSet[]): ArtifactSet[] {
    return data
      .sort((a, b) => b.version.localeCompare(a.version))
      .sort((a, b) => {
        const maxA = this.getMaxRarity(a);
        const maxB = this.getMaxRarity(b);
        return maxA < maxB ? 1 : -1;
      });
  }

  getMaxRarity(artifact: ArtifactSet): number {
    return artifact.rarityList.length > 0
      ? Math.max(...artifact.rarityList)
      : 0;
  }

  getImage(artifact: ArtifactSet): string {
    const piece = artifact.effect1Pc ? 'circlet' : 'flower';
    return this.imageService.getArtifactImage(artifact.normalizedName, piece);
  }
}
