import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { WeaponService } from '../../_services/weapon.service';
import { WeaponResolved } from '../../_models/weapons';
import { FormsModule } from '@angular/forms';
import { WeaponCardComponent } from './weapon-card/weapon-card.component';
import { RouterLink } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [PageTitleComponent, FormsModule, WeaponCardComponent, RouterLink],
  templateUrl: './weapons.component.html',
  styleUrl: './weapons.component.css',
})
export class WeaponsComponent implements OnInit {
  constructor(
    private weaponsService: WeaponService,
    private resolver: ResolverService,
  ) {}

  rarityColor: Record<number, string> = {
    1: 'var(--rar-1)',
    2: 'var(--rar-2)',
    3: 'var(--rar-3)',
    4: 'var(--rar-4)',
    5: 'var(--rar-5)',
  };

  ngOnInit(): void {
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
        this.filteredWeapons = sorted;
      });
  }

  weapons: WeaponResolved[] = [];
  filteredWeapons: WeaponResolved[] = [];
  weaponTypes: string[] = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];

  weaponFilters: string[] = [];
  rarityFilters: string[] = [];
  searchTerm: string = '';
  showFiltersDropdown: boolean = false;

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
    let results = this.weapons.filter((weapon) =>
      weapon.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );

    if (this.weaponFilters.length > 0) {
      results = results.filter((char) =>
        this.weaponFilters.includes(char.weaponText),
      );
    }

    if (this.rarityFilters.length > 0) {
      results = results.filter((weapon) =>
        this.rarityFilters.includes(weapon.rarity.toString()),
      );
    }

    this.filteredWeapons = results;
  }
}
