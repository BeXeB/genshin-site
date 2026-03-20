import { OnInit, OnDestroy, Directive } from '@angular/core';
import { Subject, Observable, takeUntil } from 'rxjs';
import { PageFilters, FilterGroup, StoredFilters } from '../_models/filters';
import { FilterService } from '../_services/filter.service';

@Directive()
export abstract class BaseListComponent<T> implements OnInit, OnDestroy {
  protected destroy$ = new Subject<void>();

  // Abstract properties - must be defined by subclass
  abstract data: T[];
  abstract filtered: T[];
  abstract searchTerm: string;
  abstract filters: PageFilters;
  abstract filterGroups: FilterGroup[];
  abstract filterFns: Record<string, (item: T, values: string[]) => boolean>;

  // Storage key for persisting filters/search
  abstract get storageKey(): string;

  // Abstract methods - must be implemented by subclass
  /**
   * Load data from service(s).
   * This is called once in ngOnInit after loading stored state.
   */
  abstract loadData(): Observable<T[]>;

  /**
   * Transform/sort data after loading from service.
   * This is called before applying filters.
   */
  abstract transformData(data: T[]): T[];

  constructor(protected filterService: FilterService) {}

  ngOnInit(): void {
    this.initializeAndLoadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Apply current filters and search term to data
   * Also saves the state to storage
   */
  applyFilters(): void {
    this.filtered = this.filterService.filter(
      this.data,
      this.searchTerm,
      (item) => this.getSearchableText(item),
      this.filters,
      this.filterFns,
    );

    this.filterService.saveState(this.storageKey, {
      filters: this.filters,
      searchTerm: this.searchTerm,
    });
  }

  /**
   * Handle filter changes from filter component
   */
  onFiltersChange(filters: PageFilters): void {
    this.filters = filters;
    this.applyFilters();
  }

  /**
   * Get the searchable text from an item.
   * Can be overridden by subclass for custom search behavior.
   */
  protected getSearchableText(item: T): string {
    return (item as any).name ?? '';
  }

  /**
   * Initialize state from storage and load data
   */
  private initializeAndLoadData(): void {
    // Load saved filter state
    const state = this.filterService.loadState(this.storageKey);
    this.filters = state.filters ?? {};
    this.searchTerm = state.searchTerm;

    // Load data from service
    this.loadData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.data = this.transformData(data ?? []);
        this.applyFilters();
      });
  }
}
