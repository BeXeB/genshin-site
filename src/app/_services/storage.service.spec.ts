import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Tierlist } from '../_models/tierlist';

describe('StorageService', () => {
  let service: StorageService;
  let store: { [key: string]: string } = {};

  const mockLocalStorage = {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    });
    service = TestBed.inject(StorageService);
    store = {};
  });

  function setupLocalStorageSpies() {
    const getItemSpy = spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    const setItemSpy = spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    const removeItemSpy = spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    return { getItemSpy, setItemSpy, removeItemSpy };
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveData and getData', () => {
    let spies: any;
    beforeEach(() => {
      spies = setupLocalStorageSpies();
    });

    it('should save and retrieve data', () => {
      const testData = { id: 1, name: 'Test' };
      service.saveData('testKey', testData);

      const retrieved = service.getData('testKey');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = service.getData('nonExistent');
      expect(retrieved).toBeNull();
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: { id: 1, name: 'John' },
        items: [1, 2, 3],
        nested: { deep: { value: 'test' } },
      };
      service.saveData('complex', complexData);

      const retrieved = service.getData('complex');
      expect(retrieved).toEqual(complexData);
    });

    it('should overwrite existing data', () => {
      service.saveData('key', { value: 1 });
      service.saveData('key', { value: 2 });

      const retrieved = service.getData('key');
      expect(retrieved).toEqual({ value: 2 });
    });

    it('should handle arrays', () => {
      const arrayData = [1, 2, 3, 4, 5];
      service.saveData('array', arrayData);

      const retrieved = service.getData('array');
      expect(retrieved).toEqual(arrayData);
    });

    it('should handle empty objects', () => {
      const emptyObject = {};
      service.saveData('empty', emptyObject);

      const retrieved = service.getData('empty');
      expect(retrieved).toEqual(emptyObject);
    });
  });

  describe('error handling', () => {
    let spies: any;
    beforeEach(() => {
      spies = setupLocalStorageSpies();
    });

    it('should handle localStorage errors gracefully on save', () => {
      spies.setItemSpy.and.throwError('QuotaExceededError');
      spyOn(console, 'error');

      const testData = { id: 1 };
      service.saveData('key', testData);

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully on load', () => {
      spies.getItemSpy.and.throwError('SecurityError');
      spyOn(console, 'error');

      const result = service.getData('key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle corrupted JSON on load', () => {
      store['corrupted'] = '{invalid json}';
      spyOn(console, 'error');

      const result = service.getData('corrupted');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('saveTierlist and loadTierlist', () => {
    let spies: any;
    beforeEach(() => {
      spies = setupLocalStorageSpies();
    });

    const mockTierlist: Tierlist = {
      tags: [{ id: 'tag1', label: 'Tag', color: '#000000' }],
      tiers: [
        {
          tier: 'S',
          characters: [
            {
              id: 1,
              apiKey: 'char1',
              tags: [],
              profile: { id: 1, name: 'Char1' } as any,
            },
          ],
        },
      ],
    };

    it('should save tierlist', () => {
      service.saveTierlist(mockTierlist);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load tierlist', () => {
      service.saveTierlist(mockTierlist);
      const loaded = service.loadTierlist();

      expect(loaded).toBeTruthy();
      expect(loaded?.tiers[0]?.characters.length).toBe(1);
    });

    it('should return null when no tierlist is saved', () => {
      const loaded = service.loadTierlist();
      expect(loaded).toBeNull();
    });

    it('should remove profile data from characters before saving', () => {
      service.saveTierlist(mockTierlist);
      const loaded = service.loadTierlist();

      const characters = loaded?.tiers[0]?.characters ?? [];
      expect(characters[0].profile).toBeUndefined();
    });

    it('should handle tierlist save errors', () => {
      spies.setItemSpy.and.throwError('QuotaExceededError');
      spyOn(console, 'error');

      service.saveTierlist(mockTierlist);

      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching('Failed to save tierlist'),
        jasmine.any(Error),
      );
    });

    it('should handle tierlist load errors', () => {
      spies.getItemSpy.and.throwError('SecurityError');
      spyOn(console, 'error');

      const loaded = service.loadTierlist();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
