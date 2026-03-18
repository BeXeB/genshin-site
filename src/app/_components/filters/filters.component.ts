import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FilterGroup, PageFilters } from '../../_models/filters';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent {
  @Input() groups: FilterGroup[] = [];
  @Input() filters: PageFilters = {};

  @Output() filtersChange = new EventEmitter<PageFilters>();

  showDropdown = false;

  constructor(private elRef: ElementRef) {}

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
