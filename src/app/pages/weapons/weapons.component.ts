import { Component } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { WeaponService } from '../../_services/weapon.service';
import { WeaponResolved } from '../../_models/weapons';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { map, switchMap, Observable } from 'rxjs';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { PageFilters, FilterGroup } from '../../_models/filters';
import { FilterService } from '../../_services/filter.service';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { BaseListComponent } from '../../_components/base-list.component';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    RouterLink,
    FiltersComponent,
    ItemCardComponent,
  ],
  templateUrl: './weapons.component.html',
  styleUrl: './weapons.component.css',
})
export class WeaponsComponent extends BaseListComponent<WeaponResolved> {
  private readonly _storageKey = 'weaponFilters';

  data: WeaponResolved[] = [];
  filtered: WeaponResolved[] = [];

  searchTerm: string = '';
  filters: PageFilters = {};

  filterGroups: FilterGroup[] = [
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

  get storageKey(): string {
    return this._storageKey;
  }

  constructor(
    private weaponsService: WeaponService,
    private resolver: ResolverService,
    protected override filterService: FilterService,
  ) {
    super(filterService);
  }

  loadData(): Observable<WeaponResolved[]> {
    return this.resolver.initialize().pipe(
      switchMap(() => this.weaponsService.getWeapons()),
      map((data) => this.resolver.resolveWeapons(data)),
    );
  }

  transformData(data: WeaponResolved[]): WeaponResolved[] {
    const filtered = data.filter((w) => w.id !== 11419);
    return filtered.sort((a, b) => {
      if (a.rarity !== b.rarity) return b.rarity - a.rarity;
      return a.weaponType.localeCompare(b.weaponType);
    });
  }

  getIconUrls(weapon: WeaponResolved) {
    return {
      iconUrl: `assets/images/weapons/${weapon.normalizedName}/icon.webp`,
      typeUrl: `assets/images/${weapon.weaponText}.webp`,
    };
  }
}
