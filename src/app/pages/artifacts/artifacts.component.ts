import { Component, OnInit } from '@angular/core';
import { ArtifactService } from '../../_services/artifact.service';
import { ArtifactSet } from '../../_models/artifacts';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-artifacts',
  standalone: true,
  imports: [PageTitleComponent, FormsModule, RouterLink],
  templateUrl: './artifacts.component.html',
  styleUrl: './artifacts.component.css',
})
export class ArtifactsComponent implements OnInit {
  constructor(private artifactService: ArtifactService) {}

  artifacts: ArtifactSet[] = [];
  filteredArtifacts: ArtifactSet[] = [];

  rarityFilters: string[] = [];
  searchTerm: string = '';
  showFiltersDropdown: boolean = false;

  rarityColor: Record<number, string> = {
    1: 'var(--rar-1)',
    2: 'var(--rar-2)',
    3: 'var(--rar-3)',
    4: 'var(--rar-4)',
    5: 'var(--rar-5)',
  };

  ngOnInit(): void {
    this.artifactService.getArtifacts().subscribe((data) => {
      this.artifacts = data.sort((a, b) => {
        let maxA = this.getMaxRarity(a);
        let maxB = this.getMaxRarity(b);
        return maxA < maxB ? 1 : -1;
      });
      this.filteredArtifacts = data;
    });
  }

  toggleFiltersDropdown(): void {
    this.showFiltersDropdown = !this.showFiltersDropdown;
  }

  toggleFilter(filterArray: string[], value: string): void {
    const index = filterArray.indexOf(value);
    if (index > -1) {
      filterArray.splice(index, 1);
    } else {
      filterArray.push(value);
    }
    this.onSearchTermChange();
  }

  onSearchTermChange(): void {
    let results = this.artifacts.filter((artifact) =>
      artifact.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );

    if (this.rarityFilters.length > 0) {
      results = results.filter((artifact) =>
        this.rarityFilters.some((f) =>
          artifact.rarityList.some((r) => r.toString() === f),
        ),
      );
    }

    this.filteredArtifacts = results;
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
