import { TestBed } from '@angular/core/testing';
import { SettingsService, Settings } from './settings.service';
import { StorageService } from './storage.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getData',
      'saveData',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created with default settings when no data in storage', () => {
    storageService.getData.and.returnValue(null);

    service = TestBed.inject(SettingsService);

    expect(service).toBeTruthy();
    expect(service.settings.value).toEqual({
      detailed: true,
      talentlevel: 9,
    });
  });

  it('should load saved settings from storage', () => {
    const savedSettings: Settings = {
      detailed: false,
      talentlevel: 6,
    };
    storageService.getData.and.returnValue(savedSettings);

    service = TestBed.inject(SettingsService);

    expect(service.settings.value).toEqual({
      detailed: false,
      talentlevel: 6,
    });
  });

  it('should merge saved settings with defaults', () => {
    const savedSettings = { talentlevel: 8 };
    storageService.getData.and.returnValue(savedSettings as any);

    service = TestBed.inject(SettingsService);

    expect(service.settings.value).toEqual({
      detailed: true, // default
      talentlevel: 8, // overridden
    });
  });

  describe('settings$ observable', () => {
    beforeEach(() => {
      storageService.getData.and.returnValue(null);
      service = TestBed.inject(SettingsService);
    });

    it('should return a BehaviorSubject', () => {
      expect(service.settings).toBeDefined();
      expect(service.settings.subscribe).toBeDefined();
    });

    it('should emit initial value immediately', (done) => {
      service.settings.subscribe((settings) => {
        expect(settings.detailed).toBe(true);
        expect(settings.talentlevel).toBe(9);
        done();
      });
    });

    it('should emit new values when settings change', (done) => {
      const values: Settings[] = [];

      service.settings.subscribe((settings) => {
        values.push(settings);
      });

      service.changeOption('talentlevel', 10);

      setTimeout(() => {
        expect(values.length).toBe(2);
        expect(values[1].talentlevel).toBe(10);
        done();
      }, 0);
    });
  });

  describe('changeOption', () => {
    beforeEach(() => {
      storageService.getData.and.returnValue(null);
      service = TestBed.inject(SettingsService);
    });

    it('should update boolean setting', (done) => {
      service.changeOption('detailed', false);

      service.settings.subscribe((settings) => {
        expect(settings.detailed).toBe(false);
        done();
      });
    });

    it('should update number setting', (done) => {
      service.changeOption('talentlevel', 12);

      service.settings.subscribe((settings) => {
        expect(settings.talentlevel).toBe(12);
        done();
      });
    });

    it('should persist setting to storage', () => {
      service.changeOption('talentlevel', 7);

      expect(storageService.saveData).toHaveBeenCalledWith(
        'settings',
        jasmine.objectContaining({
          talentlevel: 7,
          detailed: true,
        }),
      );
    });

    it('should preserve other settings when updating one', (done) => {
      service.changeOption('talentlevel', 11);

      service.settings.subscribe((settings) => {
        expect(settings.detailed).toBe(true); // unchanged
        expect(settings.talentlevel).toBe(11); // updated
        done();
      });
    });

    it('should allow multiple changes', (done) => {
      service.changeOption('detailed', false);
      service.changeOption('talentlevel', 8);

      service.settings.subscribe((settings) => {
        expect(settings.detailed).toBe(false);
        expect(settings.talentlevel).toBe(8);
        done();
      });
    });

    it('should save to storage on each change', () => {
      service.changeOption('talentlevel', 7);
      service.changeOption('detailed', false);

      expect(storageService.saveData).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeOption type safety', () => {
    beforeEach(() => {
      storageService.getData.and.returnValue(null);
      service = TestBed.inject(SettingsService);
    });

    it('should update talentlevel with number', () => {
      expect(() => {
        service.changeOption('talentlevel', 10);
      }).not.toThrow();
    });

    it('should update detailed with boolean', () => {
      expect(() => {
        service.changeOption('detailed', true);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      storageService.getData.and.returnValue(null);
      service = TestBed.inject(SettingsService);
    });

    it('should handle talentlevel value of 0', (done) => {
      service.changeOption('talentlevel', 0);

      service.settings.subscribe((settings) => {
        expect(settings.talentlevel).toBe(0);
        done();
      });
    });

    it('should handle large talentlevel values', (done) => {
      service.changeOption('talentlevel', 999);

      service.settings.subscribe((settings) => {
        expect(settings.talentlevel).toBe(999);
        done();
      });
    });

    it('should handle rapid setting changes', (done) => {
      service.changeOption('talentlevel', 5);
      service.changeOption('talentlevel', 6);
      service.changeOption('talentlevel', 7);
      service.changeOption('talentlevel', 8);

      service.settings.subscribe((settings) => {
        expect(settings.talentlevel).toBe(8);
        done();
      });
    });
  });
});
