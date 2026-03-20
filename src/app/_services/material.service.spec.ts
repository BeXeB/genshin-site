import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MaterialService } from './material.service';
import { Material, MaterialCraft } from '../_models/materials';
import { MaterialType } from '../_models/enum';

describe('MaterialService', () => {
  let service: MaterialService;
  let httpMock: HttpTestingController;

  const mockMaterials: Material[] = [
    {
      id: 1,
      name: 'Primogem',
      rarity: 5,
      type: MaterialType.XP_AND_MORA,
      normalizedName: 'primogem',
      sortRank: 1,
      description: 'primogem',
      typeText: 'XP & Mora',
      images: { filename_icon: 'primogem.png' },
    },
    {
      id: 2,
      name: 'Mora',
      rarity: 3,
      type: MaterialType.XP_AND_MORA,
      normalizedName: 'mora',
      sortRank: 2,
      description: 'mora',
      typeText: 'XP & Mora',
      images: { filename_icon: 'mora.png' },
    },
  ];

  const mockMaterialCrafts: MaterialCraft[] = [
    {
      id: 3,
      moraCost: 1000,
      resultCount: 3,
      recipe: [{ id: 1, name: 'Primogem', count: 2 }],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MaterialService],
    });

    service = TestBed.inject(MaterialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMaterials', () => {
    it('should fetch materials from all folders', () => {
      service.getMaterials().subscribe((materials) => {
        expect(materials.length).toBe(14); // 2 from each folder (7 folders)
        expect(materials[0].id).toBe(1);
      });

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      folders.forEach((folder) => {
        const req = httpMock.expectOne(
          `assets/json/materials/${folder}/materials.json`,
        );
        req.flush(mockMaterials);
      });
    });

    it('should flatten arrays from all folders', () => {
      service.getMaterials().subscribe((materials) => {
        expect(Array.isArray(materials)).toBe(true);
        expect(materials.length).toBeGreaterThan(0);
      });

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      folders.forEach((folder) => {
        const req = httpMock.expectOne(
          `assets/json/materials/${folder}/materials.json`,
        );
        req.flush(mockMaterials);
      });
    });

    it('should cache materials on subsequent calls', () => {
      service.getMaterials().subscribe((materials) => {
        expect(materials).toBeDefined();
      });

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      folders.forEach((folder) => {
        const req = httpMock.expectOne(
          `assets/json/materials/${folder}/materials.json`,
        );
        req.flush(mockMaterials);
      });

      // Second call should use cache, no new HTTP requests
      service.getMaterials().subscribe(() => {});

      // Verify no additional requests were made
      httpMock.expectNone((req) => req.url.includes('materials.json'));
    });

    it('should handle empty folder responses', () => {
      service.getMaterials().subscribe((materials) => {
        expect(materials).toBeDefined();
      });

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      folders.forEach((folder) => {
        const req = httpMock.expectOne(
          `assets/json/materials/${folder}/materials.json`,
        );
        req.flush([]);
      });
    });
  });

  describe('getMaterialCrafts', () => {
    it('should fetch material crafts', () => {
      service.getMaterialCrafts().subscribe((crafts) => {
        expect(crafts).toEqual(mockMaterialCrafts);
        expect(crafts[0].moraCost).toBe(1000);
      });

      const req = httpMock.expectOne('assets/json/materials/crafts.json');
      req.flush(mockMaterialCrafts);
    });

    it('should call correct endpoint', () => {
      service.getMaterialCrafts().subscribe();

      const req = httpMock.expectOne('assets/json/materials/crafts.json');
      expect(req.request.url).toContain('crafts.json');
    });

    it('should handle empty crafts list', () => {
      service.getMaterialCrafts().subscribe((crafts) => {
        expect(crafts).toEqual([]);
      });

      const req = httpMock.expectOne('assets/json/materials/crafts.json');
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      service.getMaterialCrafts().subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/materials/crafts.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('getMaterial', () => {
    beforeEach(() => {
      // Pre-load materials cache
      service.getMaterials().subscribe();

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      folders.forEach((folder) => {
        const req = httpMock.expectOne(
          `assets/json/materials/${folder}/materials.json`,
        );
        req.flush(mockMaterials);
      });
    });

    it('should find material by normalized name', () => {
      service.getMaterial('primogem').subscribe((material) => {
        expect(material).toEqual(mockMaterials[0]);
        expect(material?.name).toBe('Primogem');
      });
    });

    it('should return undefined for non-existent material', () => {
      service.getMaterial('nonexistent').subscribe((material) => {
        expect(material).toBeUndefined();
      });
    });

    it('should search through cached materials', () => {
      service.getMaterial('mora').subscribe((material) => {
        expect(material?.id).toBe(2);
      });
    });

    it('should handle multiple searches', () => {
      service.getMaterial('primogem').subscribe((material) => {
        expect(material?.id).toBe(1);
      });

      service.getMaterial('mora').subscribe((material) => {
        expect(material?.id).toBe(2);
      });
    });
  });

  describe('caching behavior', () => {
    it('should use shareReplay to cache results', () => {
      let count1 = 0;
      let count2 = 0;

      service.getMaterials().subscribe(() => count1++);
      service.getMaterials().subscribe(() => count2++);

      const folders = [
        'talent',
        'boss',
        'gemstone',
        'local-specialty',
        'weapon',
        'generic',
        'xp-and-mora',
      ];

      // Should only have one request per folder
      const requests = httpMock.match((r) => r.url.includes('materials.json'));
      expect(requests.length).toBe(7);

      requests.forEach((req) => req.flush(mockMaterials));

      expect(count1).toBe(1);
      expect(count2).toBe(1); // Should emit same cached result
    });
  });
});
