import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { WeaponService } from '../../_services/weapon.service';
import { WeaponResolved } from '../../_models/weapons';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { map, switchMap } from 'rxjs';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { PageFilters } from '../../_models/filters';
import { FilterService } from '../../_services/filter.service';
import { ItemCardComponent } from "../../_components/item-card/item-card.component";

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    RouterLink,
    FiltersComponent,
    ItemCardComponent
],
  templateUrl: './weapons.component.html',
  styleUrl: './weapons.component.css',
})
export class WeaponsComponent implements OnInit {
  private readonly STORAGE_KEY = 'weaponFilters';

  constructor(
    private weaponsService: WeaponService,
    private resolver: ResolverService,
    private filterService: FilterService,
  ) {}

  weapons: WeaponResolved[] = [];
  filteredWeapons: WeaponResolved[] = [];

  searchTerm: string = '';
  filters: PageFilters = {};

  filterGroups = [
    {
      label: 'Tipus',
      key: 'weapons',
      options: ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'],
    },
    {
      label: 'Ritkaság',
      key: 'rarity',
      options: ['5', '4', '3', '2', '1'],
    },
  ];

  filterFns = {
    weapons: (c: WeaponResolved, values: string[]) =>
      values.includes(c.weaponText),

    rarity: (c: WeaponResolved, values: string[]) =>
      values.includes(c.rarity.toString()),
  };

  ngOnInit(): void {
    const state = this.filterService.loadState(this.STORAGE_KEY);
    this.filters = state.filters ?? {};
    this.searchTerm = state.searchTerm;

    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.weaponsService.getWeapons()),
        map((data) => this.resolver.resolveWeapons(data)),
      )
      .subscribe((resolvedWeapons) => {
        resolvedWeapons = resolvedWeapons.filter((w) => w.id !== 11419);
        let sorted = resolvedWeapons.sort((a, b) => {
          if (a.rarity !== b.rarity) return b.rarity - a.rarity;

          return a.weaponType.localeCompare(b.weaponType);
        });
        this.weapons = sorted;
        this.applyFilters();
      });
  }

  applyFilters() {
    this.filteredWeapons = this.filterService.filter(
      this.weapons,
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

  getIconUrls(weapon: WeaponResolved) {
    return {
      iconUrl: `assets/images/weapons/${weapon.normalizedName}/icon.webp`,
      typeUrl: `assets/images/${weapon.weaponText}.webp`,
    };
  }
}
