import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeaponService } from './weapon.service';
import { Weapon } from '../_models/weapons';

describe('WeaponService', () => {
  let service: WeaponService;
  let httpMock: HttpTestingController;

  const mockWeaponNames = ['aquila-favonia', 'mistsplitter-reforged', 'primordial-jade-cutter'];

  const mockWeapons: Weapon[] = [
    {
      id: 1,
      name: 'Aquila Favonia',
      normalizedName: 'aquila-favonia',
      rarity: 5,
      weaponType: 'sword' as any,
      weaponText: 'Sword',
      description: 'An eagle greatsword',
      descriptionRaw: 'raw desc',
      baseAtkValue: 674,
      mainStatType: 'atk' as any,
      stats: {} as any,
      costs: { ascend1: [], ascend2: [], ascend3: [], ascend4: [] },
      images: { filename_icon: 'icon.png', filename_awakenIcon: 'awaken.png', filename_gacha: 'gacha.png' },
      version: '1.0',
      story: 'story',
    } as any,
    {
      id: 2,
      name: 'Mistsplitter Reforged',
      normalizedName: 'mistsplitter-reforged',
      rarity: 5,
      weaponType: 'sword' as any,
      weaponText: 'Sword',
      description: 'A sword of mist',
      descriptionRaw: 'raw desc',
      baseAtkValue: 674,
      mainStatType: 'atk' as any,
      stats: {} as any,
      costs: { ascend1: [], ascend2: [], ascend3: [], ascend4: [] },
      images: { filename_icon: 'icon.png', filename_awakenIcon: 'awaken.png', filename_gacha: 'gacha.png' },
      version: '1.0',
      story: 'story',
    } as any,
    {
      id: 3,
      name: 'Primordial Jade Cutter',
      normalizedName: 'primordial-jade-cutter',
      rarity: 5,
      weaponType: 'sword' as any,
      weaponText: 'Sword',
      description: 'A jade cutter',
      descriptionRaw: 'raw desc',
      baseAtkValue: 674,
      mainStatType: 'atk' as any,
      stats: {} as any,
      costs: { ascend1: [], ascend2: [], ascend3: [], ascend4: [] },
      images: { filename_icon: 'icon.png', filename_awakenIcon: 'awaken.png', filename_gacha: 'gacha.png' },
      version: '1.0',
      story: 'story',
    } as any,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeaponService],
    });

    service = TestBed.inject(WeaponService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWeapons', () => {
    it('should fetch all weapons by first getting index then loading each', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons.length).toBe(3);
        expect(weapons[0].name).toBe('Aquila Favonia');
        expect(weapons[1].name).toBe('Mistsplitter Reforged');
        expect(weapons[2].name).toBe('Primordial Jade Cutter');
      });

      // First request for index
      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush(mockWeaponNames);

      // Then requests for each weapon
      mockWeaponNames.forEach((name, index) => {
        const req = httpMock.expectOne(`assets/json/weapons/${name}.json`);
        req.flush(mockWeapons[index]);
      });
    });

    it('should handle index file with single weapon', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons.length).toBe(1);
        expect(weapons[0].name).toBe('Aquila Favonia');
      });

      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush(['aquila-favonia']);

      const weaponReq = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      weaponReq.flush(mockWeapons[0]);
    });

    it('should return empty array when index is empty', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons).toEqual([]);
      });

      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush([]);
    });

    it('should return empty array when index is null', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons).toEqual([]);
      });

      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush(null);
    });

    it('should handle HTTP error on index request', () => {
      service.getWeapons().subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/weapons/index.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should preserve weapon order from index', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons[0].name).toBe('Aquila Favonia');
        expect(weapons[1].name).toBe('Mistsplitter Reforged');
        expect(weapons[2].name).toBe('Primordial Jade Cutter');
      });

      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush(mockWeaponNames);

      mockWeaponNames.forEach((name, index) => {
        const req = httpMock.expectOne(`assets/json/weapons/${name}.json`);
        req.flush(mockWeapons[index]);
      });
    });
  });

  describe('getWeapon', () => {
    it('should fetch single weapon by slug', () => {
      service.getWeapon('aquila-favonia').subscribe((weapon) => {
        expect(weapon.name).toBe('Aquila Favonia');
        expect(weapon.id).toBe(1);
      });

      const req = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      req.flush(mockWeapons[0]);
    });

    it('should construct correct URL with weapon slug', () => {
      service.getWeapon('mistsplitter-reforged').subscribe();

      const req = httpMock.expectOne('assets/json/weapons/mistsplitter-reforged.json');
      expect(req.request.url).toContain('mistsplitter-reforged.json');
    });

    it('should handle different weapon slugs', () => {
      service.getWeapon('primordial-jade-cutter').subscribe();

      const req = httpMock.expectOne('assets/json/weapons/primordial-jade-cutter.json');
      expect(req.request.url).toContain('primordial-jade-cutter.json');
    });

    it('should return complete weapon object', () => {
      service.getWeapon('aquila-favonia').subscribe((weapon) => {
        expect(weapon.id).toBeDefined();
        expect(weapon.name).toBeDefined();
        expect(weapon.rarity).toBeDefined();
        expect(weapon.weaponType).toBeDefined();
      });

      const req = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      req.flush(mockWeapons[0]);
    });

    it('should handle 404 error for non-existent weapon', () => {
      service.getWeapon('nonexistent-weapon').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/weapons/nonexistent-weapon.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should handle server error', () => {
      service.getWeapon('aquila-favonia').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(500);
        },
      );

      const req = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      req.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('should allow multiple calls with different slugs', () => {
      service.getWeapon('aquila-favonia').subscribe();
      const req1 = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      req1.flush(mockWeapons[0]);

      service.getWeapon('mistsplitter-reforged').subscribe();
      const req2 = httpMock.expectOne('assets/json/weapons/mistsplitter-reforged.json');
      req2.flush(mockWeapons[1]);

      expect(req1.request.url).toContain('aquila-favonia.json');
      expect(req2.request.url).toContain('mistsplitter-reforged.json');
    });
  });

  describe('sequential getWeapons and getWeapon calls', () => {
    it('should handle getWeapons followed by getWeapon', () => {
      service.getWeapons().subscribe((weapons) => {
        expect(weapons.length).toBe(2);
      });

      const indexReq = httpMock.expectOne('assets/json/weapons/index.json');
      indexReq.flush(['aquila-favonia', 'mistsplitter-reforged']);

      const weapon1Req = httpMock.expectOne('assets/json/weapons/aquila-favonia.json');
      weapon1Req.flush(mockWeapons[0]);

      const weapon2Req = httpMock.expectOne('assets/json/weapons/mistsplitter-reforged.json');
      weapon2Req.flush(mockWeapons[1]);

      service.getWeapon('primordial-jade-cutter').subscribe();

      const singleReq = httpMock.expectOne('assets/json/weapons/primordial-jade-cutter.json');
      singleReq.flush(mockWeapons[2]);
    });
  });
});
