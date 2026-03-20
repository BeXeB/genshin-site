import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharacterService } from './character.service';
import { Character, CharacterProfile } from '../_models/character';

describe('CharacterService', () => {
  let service: CharacterService;
  let httpMock: HttpTestingController;

  const mockCharacterProfiles: CharacterProfile[] = [
    {
      id: 1,
      name: 'Fischl',
      rarity: 4,
      elementType: 'electro' as any,
      elementText: 'Electro',
      region: 'mondstadt',
      normalizedName: 'fischl',
      weaponType: 'bow' as any,
      weaponText: 'Bow',
      qualityType: 'rarity4' as any,
      substatType: 'atk' as any,
      substatText: 'ATK',
      title: 'Investigator',
      description: 'A test character',
      birthdaymmdd: '0512',
      birthday: 'May 12',
      affiliation: 'Outriders',
      constellation: 'Cygnus',
      costs: {
        ascend1: [],
        ascend2: [],
        ascend3: [],
        ascend4: [],
        ascend5: [],
        ascend6: [],
      },
      images: { filename_icon: 'fischl.png' },
      version: '1.0',
    } as any,
    {
      id: 2,
      name: 'Raiden Shogun',
      rarity: 5,
      elementType: 'electro' as any,
      elementText: 'Electro',
      region: 'inazuma',
      normalizedName: 'raidenshogun',
      weaponType: 'polearm' as any,
      weaponText: 'Polearm',
      qualityType: 'rarity5' as any,
      substatType: 'atk' as any,
      substatText: 'ATK',
      title: 'Raiden Shogun',
      description: 'A test character',
      birthdaymmdd: '0621',
      birthday: 'June 21',
      affiliation: 'Inazuma',
      constellation: 'Raiden Shogun',
      costs: {
        ascend1: [],
        ascend2: [],
        ascend3: [],
        ascend4: [],
        ascend5: [],
        ascend6: [],
      },
      images: { filename_icon: 'raiden.png' },
      version: '2.0',
    } as any,
  ];

  const mockCharacterNames = [
    'fischl',
    'raidenshogun',
    'barbara',
    'xingqiu',
    'diona',
  ];

  const mockCharacterDetails: Character = {
    profile: mockCharacterProfiles[0],
    stats: {} as any,
    skills: {
      normal: {
        label: 'Normal Attack',
        description: 'Perform up to 5 shots with a bow.',
        costs: {
          ascend1: [],
          ascend2: [],
          ascend3: [],
          ascend4: [],
          ascend5: [],
          ascend6: [],
        },
      },
      charges: {
        label: 'Aimed Shot',
        description: 'Aim before loosing the arrow.',
        costs: {
          ascend1: [],
          ascend2: [],
          ascend3: [],
          ascend4: [],
          ascend5: [],
          ascend6: [],
        },
      },
      burst: {
        label: 'Elemental Burst',
        description: 'Summon Oz.',
        costs: {
          ascend1: [],
          ascend2: [],
          ascend3: [],
          ascend4: [],
          ascend5: [],
          ascend6: [],
        },
      },
    },
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharacterService],
    });

    service = TestBed.inject(CharacterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should fetch character profiles', () => {
      service.getCharacters().subscribe((profiles) => {
        expect(profiles.length).toBe(2);
        expect(profiles[0]?.name).toBe('Fischl');
        expect(profiles[1]?.name).toBe('Raiden Shogun');
      });

      const req = httpMock.expectOne('assets/json/characters/profiles.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacterProfiles);
    });

    it('should call correct endpoint', () => {
      service.getCharacters().subscribe();

      const req = httpMock.expectOne('assets/json/characters/profiles.json');
      expect(req.request.url).toContain('profiles.json');
    });

    it('should handle empty character list', () => {
      service.getCharacters().subscribe((profiles) => {
        expect(profiles.length).toBe(0);
        expect(profiles).toEqual([]);
      });

      const req = httpMock.expectOne('assets/json/characters/profiles.json');
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      let errorOccurred = false;

      service.getCharacters().subscribe(
        () => {},
        (error) => {
          errorOccurred = true;
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/characters/profiles.json');
      req.error(new ErrorEvent('Network error'), { status: 404 });

      expect(errorOccurred).toBe(true);
    });

    it('should return profiles with correct properties', () => {
      service.getCharacters().subscribe((profiles) => {
        expect(profiles[0]?.name).toBeDefined();
        expect(profiles[0]?.rarity).toBeDefined();
        expect(profiles[0]?.elementType).toBeDefined();
        expect(profiles[0]?.weaponType).toBeDefined();
      });

      const req = httpMock.expectOne('assets/json/characters/profiles.json');
      req.flush(mockCharacterProfiles);
    });
  });

  describe('getCharacterNames', () => {
    it('should fetch character index/names', () => {
      service.getCharacterNames().subscribe((names) => {
        expect(names.length).toBe(5);
        expect(names[0]).toBe('fischl');
        expect(names).toContain('barbara');
      });

      const req = httpMock.expectOne('assets/json/characters/index.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacterNames);
    });

    it('should call correct endpoint', () => {
      service.getCharacterNames().subscribe();

      const req = httpMock.expectOne('assets/json/characters/index.json');
      expect(req.request.url).toContain('index.json');
    });

    it('should handle empty list', () => {
      service.getCharacterNames().subscribe((names) => {
        expect(names.length).toBe(0);
      });

      const req = httpMock.expectOne('assets/json/characters/index.json');
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      service.getCharacterNames().subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(500);
        },
      );

      const req = httpMock.expectOne('assets/json/characters/index.json');
      req.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('should return array of strings', () => {
      service.getCharacterNames().subscribe((names) => {
        expect(Array.isArray(names)).toBe(true);
        expect(names.every((name) => typeof name === 'string')).toBe(true);
      });

      const req = httpMock.expectOne('assets/json/characters/index.json');
      req.flush(mockCharacterNames);
    });
  });

  describe('getCharacterDetails', () => {
    it('should fetch character details by name', () => {
      service.getCharacterDetails('fischl').subscribe((character) => {
        expect(character.profile?.name).toBe('Fischl');
        expect(character.profile?.id).toBe(1);
        expect(character.skills).toBeDefined();
      });

      const req = httpMock.expectOne('assets/json/characters/fischl.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacterDetails);
    });

    it('should construct correct URL with character name', () => {
      service.getCharacterDetails('raidenshogun').subscribe();

      const req = httpMock.expectOne('assets/json/characters/raidenshogun.json');
      expect(req.request.url).toContain('raidenshogun.json');
    });

    it('should handle different character names', () => {
      service.getCharacterDetails('barbara').subscribe();

      const req = httpMock.expectOne('assets/json/characters/barbara.json');
      expect(req.request.url).toContain('barbara');
    });

    it('should return complete character object', () => {
      service.getCharacterDetails('fischl').subscribe((character) => {
        expect(character.profile).toBeDefined();
        expect(character.profile?.name).toBeDefined();
        expect(character.profile?.id).toBeDefined();
        expect(character.stats).toBeDefined();
      });

      const req = httpMock.expectOne('assets/json/characters/fischl.json');
      req.flush(mockCharacterDetails);
    });

    it('should handle 404 error for non-existent character', () => {
      service.getCharacterDetails('nonexistent').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/characters/nonexistent.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should handle server error', () => {
      service.getCharacterDetails('fischl').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(500);
        },
      );

      const req = httpMock.expectOne('assets/json/characters/fischl.json');
      req.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('should allow calling with different character names in sequence', () => {
      service.getCharacterDetails('fischl').subscribe();
      const req1 = httpMock.expectOne('assets/json/characters/fischl.json');
      req1.flush(mockCharacterDetails);

      service.getCharacterDetails('barbara').subscribe();
      const req2 = httpMock.expectOne('assets/json/characters/barbara.json');
      req2.flush(mockCharacterDetails);

      expect(req1.request.url).toContain('fischl.json');
      expect(req2.request.url).toContain('barbara.json');
    });
  });

  describe('multiple concurrent requests', () => {
    it('should handle multiple getCharacters calls', () => {
      let count = 0;

      service.getCharacters().subscribe(() => count++);
      service.getCharacters().subscribe(() => count++);

      const requests = httpMock.match('assets/json/characters/profiles.json');
      expect(requests.length).toBe(2);

      requests.forEach((req) => req.flush(mockCharacterProfiles));
      expect(count).toBe(2);
    });

    it('should handle mixed request types', () => {
      service.getCharacters().subscribe();
      service.getCharacterNames().subscribe();
      service.getCharacterDetails('fischl').subscribe();

      const profileReq = httpMock.expectOne('assets/json/characters/profiles.json');
      const indexReq = httpMock.expectOne('assets/json/characters/index.json');
      const detailReq = httpMock.expectOne('assets/json/characters/fischl.json');

      profileReq.flush(mockCharacterProfiles);
      indexReq.flush(mockCharacterNames);
      detailReq.flush(mockCharacterDetails);
    });
  });
});
