import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterGroup, PageFilters } from '../../_models/filters';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent {
  @Input() groups: FilterGroup[] = [];
  @Input() filters: PageFilters = {};

  @Output() filtersChange = new EventEmitter<PageFilters>();

  showDropdown = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleFilter(key: string, value: string) {
    if (!this.filters[key]) this.filters[key] = [];

    const arr = this.filters[key];
    const index = arr.indexOf(value);

    if (index > -1) arr.splice(index, 1);
    else arr.push(value);

    this.filtersChange.emit(this.filters);
  }
}
