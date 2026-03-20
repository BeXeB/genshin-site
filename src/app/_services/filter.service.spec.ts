import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { StorageService } from './storage.service';
import { PageFilters, StoredFilters } from '../_models/filters';

describe('FilterService', () => {
  let service: FilterService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getData',
      'saveData',
    ]);

    TestBed.configureTestingModule({
      providers: [
        FilterService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(FilterService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('filter method', () => {
    interface TestItem {
      id: number;
      name: string;
      rarity: number;
      type: string;
    }

    const testData: TestItem[] = [
      { id: 1, name: 'Item A', rarity: 5, type: 'weapon' },
      { id: 2, name: 'Item B', rarity: 4, type: 'artifact' },
      { id: 3, name: 'Item C', rarity: 5, type: 'weapon' },
      { id: 4, name: 'Other D', rarity: 3, type: 'material' },
    ];

    it('should return all items when no filters are applied', () => {
      const result = service.filter(testData, '', (item) => item.name);
      expect(result.length).toBe(4);
      expect(result).toEqual(testData);
    });

    it('should filter items by search term', () => {
      const result = service.filter(
        testData,
        'Item',
        (item) => item.name,
      );
      expect(result.length).toBe(3);
      expect(result.every((item) => item.name.includes('Item'))).toBe(true);
    });

    it('should filter items with case-insensitive search', () => {
      const result = service.filter(
        testData,
        'item',
        (item) => item.name,
      );
      expect(result.length).toBe(3);
    });

    it('should apply single filter function', () => {
      const filters: PageFilters = { type: ['weapon'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      expect(result.length).toBe(2);
      expect(result.every((item) => item.type === 'weapon')).toBe(true);
    });

    it('should apply multiple filter values', () => {
      const filters: PageFilters = { type: ['weapon', 'artifact'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      expect(result.length).toBe(3);
    });

    it('should combine search and filters', () => {
      const filters: PageFilters = { rarity: ['5'] };
      const filterFns = {
        rarity: (item: TestItem, values: string[]) =>
          values.includes(item.rarity.toString()),
      };

      const result = service.filter(
        testData,
        'Item',
        (item) => item.name,
        filters,
        filterFns,
      );

      expect(result.length).toBe(2);
      expect(result.every((item) => item.name.includes('Item') && item.rarity === 5)).toBe(true);
    });

    it('should apply multiple filter keys', () => {
      const filters: PageFilters = { type: ['weapon'], rarity: ['5'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
        rarity: (item: TestItem, values: string[]) =>
          values.includes(item.rarity.toString()),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      expect(result.length).toBe(2);
      expect(result.every((item) => item.type === 'weapon' && item.rarity === 5)).toBe(true);
    });

    it('should skip empty filter arrays', () => {
      const filters: PageFilters = { type: [], rarity: ['5'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
        rarity: (item: TestItem, values: string[]) =>
          values.includes(item.rarity.toString()),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      // Should only apply rarity filter
      expect(result.length).toBe(2);
    });

    it('should skip filter keys without corresponding functions', () => {
      const filters: PageFilters = { unknownFilter: ['value'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      // Should return all items since unknownFilter isn't in filterFns
      expect(result.length).toBe(4);
    });

    it('should handle empty data array', () => {
      const result = service.filter([], 'search', (item: TestItem) => item.name);
      expect(result).toEqual([]);
    });

    it('should handle null or undefined data', () => {
      const result = service.filter(
        null as any,
        'search',
        (item: TestItem) => item.name,
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when no items match filters', () => {
      const filters: PageFilters = { type: ['nonexistent'] };
      const filterFns = {
        type: (item: TestItem, values: string[]) => values.includes(item.type),
      };

      const result = service.filter(
        testData,
        '',
        (item) => item.name,
        filters,
        filterFns,
      );

      expect(result).toEqual([]);
    });
  });

  describe('loadState', () => {
    it('should load state from storage', () => {
      const mockState: StoredFilters = {
        filters: { type: ['weapon'] },
        searchTerm: 'test',
      };
      storageService.getData.and.returnValue(mockState);

      const result = service.loadState('testKey');

      expect(result).toEqual(mockState);
      expect(storageService.getData).toHaveBeenCalledWith('testKey');
    });

    it('should return default state when storage is empty', () => {
      storageService.getData.and.returnValue(null);

      const result = service.loadState('testKey');

      expect(result).toEqual({ filters: {}, searchTerm: '' });
    });

    it('should return default state when data is undefined', () => {
      storageService.getData.and.returnValue(undefined);

      const result = service.loadState('testKey');

      expect(result).toEqual({ filters: {}, searchTerm: '' });
    });
  });

  describe('saveState', () => {
    it('should save state to storage', () => {
      const state: StoredFilters = {
        filters: { rarity: ['5'] },
        searchTerm: 'sword',
      };

      service.saveState('testKey', state);

      expect(storageService.saveData).toHaveBeenCalledWith('testKey', state);
    });

    it('should save state with empty filters', () => {
      const state: StoredFilters = {
        filters: {},
        searchTerm: '',
      };

      service.saveState('testKey', state);

      expect(storageService.saveData).toHaveBeenCalledWith('testKey', state);
    });
  });

  describe('integration: loadState -> filter -> saveState', () => {
    it('should persist filter state across service calls', () => {
      const initialState: StoredFilters = {
        filters: { type: ['weapon'] },
        searchTerm: 'item',
      };
      storageService.getData.and.returnValue(initialState);

      const loaded = service.loadState('key');
      expect(loaded).toEqual(initialState);

      service.saveState('key', loaded);
      expect(storageService.saveData).toHaveBeenCalledWith('key', initialState);
    });
  });
});
