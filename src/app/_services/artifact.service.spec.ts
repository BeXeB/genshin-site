import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArtifactService } from './artifact.service';
import { ArtifactSet } from '../_models/artifacts';

describe('ArtifactService', () => {
  let service: ArtifactService;
  let httpMock: HttpTestingController;

  const mockArtifactNames = [
    'gladiators-finale',
    'wanderers-troupe',
    'noblesse-oblige',
  ];

  const mockArtifacts: ArtifactSet[] = [
    {
      id: 1,
      name: 'Gladiator\'s Finale',
      normalizedName: 'gladiators-finale',
      rarityList: [4, 5],
      images: { filename_flower: 'flower.png' },
      version: '1.0',
    },
    {
      id: 2,
      name: 'Wanderer\'s Troupe',
      normalizedName: 'wanderers-troupe',
      rarityList: [4, 5],
      images: { filename_flower: 'flower.png' },
      version: '1.0',
    },
    {
      id: 3,
      name: 'Noblesse Oblige',
      normalizedName: 'noblesse-oblige',
      rarityList: [4, 5],
      images: { filename_flower: 'flower.png' },
      version: '1.0',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ArtifactService],
    });

    service = TestBed.inject(ArtifactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getArtifacts', () => {
    it('should fetch all artifacts by first getting index then loading each', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts.length).toBe(3);
        expect(artifacts[0].name).toBe('Gladiator\'s Finale');
        expect(artifacts[1].name).toBe('Wanderer\'s Troupe');
        expect(artifacts[2].name).toBe('Noblesse Oblige');
      });

      // First request for index
      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush(mockArtifactNames);

      // Then requests for each artifact
      mockArtifactNames.forEach((name, index) => {
        const req = httpMock.expectOne(`assets/json/artifacts/${name}.json`);
        req.flush(mockArtifacts[index]);
      });
    });

    it('should handle index file with single artifact', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts.length).toBe(1);
        expect(artifacts[0].name).toBe('Gladiator\'s Finale');
      });

      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush(['gladiators-finale']);

      const artifactReq = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      artifactReq.flush(mockArtifacts[0]);
    });

    it('should return empty array when index is empty', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts).toEqual([]);
      });

      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush([]);
    });

    it('should return empty array when index is null', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts).toEqual([]);
      });

      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush(null);
    });

    it('should handle HTTP error on index request', () => {
      service.getArtifacts().subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/artifacts/index.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should preserve artifact order from index', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts[0].name).toBe('Gladiator\'s Finale');
        expect(artifacts[1].name).toBe('Wanderer\'s Troupe');
        expect(artifacts[2].name).toBe('Noblesse Oblige');
      });

      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush(mockArtifactNames);

      mockArtifactNames.forEach((name, index) => {
        const req = httpMock.expectOne(`assets/json/artifacts/${name}.json`);
        req.flush(mockArtifacts[index]);
      });
    });
  });

  describe('getArtifact', () => {
    it('should fetch single artifact by slug', () => {
      service.getArtifact('gladiators-finale').subscribe((artifact) => {
        expect(artifact.name).toBe('Gladiator\'s Finale');
        expect(artifact.id).toBe(1);
      });

      const req = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      req.flush(mockArtifacts[0]);
    });

    it('should construct correct URL with artifact slug', () => {
      service.getArtifact('wanderers-troupe').subscribe();

      const req = httpMock.expectOne('assets/json/artifacts/wanderers-troupe.json');
      expect(req.request.url).toContain('wanderers-troupe.json');
    });

    it('should handle different artifact slugs', () => {
      service.getArtifact('noblesse-oblige').subscribe();

      const req = httpMock.expectOne('assets/json/artifacts/noblesse-oblige.json');
      expect(req.request.url).toContain('noblesse-oblige.json');
    });

    it('should return complete artifact object', () => {
      service.getArtifact('gladiators-finale').subscribe((artifact) => {
        expect(artifact.id).toBeDefined();
        expect(artifact.name).toBeDefined();
        expect(artifact.rarityList).toBeDefined();
        expect(artifact.images).toBeDefined();
      });

      const req = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      req.flush(mockArtifacts[0]);
    });

    it('should handle 404 error for non-existent artifact', () => {
      service.getArtifact('nonexistent-artifact').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne('assets/json/artifacts/nonexistent-artifact.json');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });

    it('should handle server error', () => {
      service.getArtifact('gladiators-finale').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(500);
        },
      );

      const req = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      req.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('should allow multiple calls with different slugs', () => {
      service.getArtifact('gladiators-finale').subscribe();
      const req1 = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      req1.flush(mockArtifacts[0]);

      service.getArtifact('wanderers-troupe').subscribe();
      const req2 = httpMock.expectOne('assets/json/artifacts/wanderers-troupe.json');
      req2.flush(mockArtifacts[1]);

      expect(req1.request.url).toContain('gladiators-finale.json');
      expect(req2.request.url).toContain('wanderers-troupe.json');
    });
  });

  describe('sequential getArtifacts and getArtifact calls', () => {
    it('should handle getArtifacts followed by getArtifact', () => {
      service.getArtifacts().subscribe((artifacts) => {
        expect(artifacts.length).toBe(2);
      });

      const indexReq = httpMock.expectOne('assets/json/artifacts/index.json');
      indexReq.flush(['gladiators-finale', 'wanderers-troupe']);

      const artifact1Req = httpMock.expectOne('assets/json/artifacts/gladiators-finale.json');
      artifact1Req.flush(mockArtifacts[0]);

      const artifact2Req = httpMock.expectOne('assets/json/artifacts/wanderers-troupe.json');
      artifact2Req.flush(mockArtifacts[1]);

      service.getArtifact('noblesse-oblige').subscribe();

      const singleReq = httpMock.expectOne('assets/json/artifacts/noblesse-oblige.json');
      singleReq.flush(mockArtifacts[2]);
    });
  });
});
