import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';
import { environment } from '../../environments/environment';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacterIcon', () => {
    it('should return correct character icon URL', () => {
      const apiKey = 'aether';
      const result = service.getCharacterIcon(apiKey);
      expect(result).toBe(`${environment.apiImageBaseUrl}/characters/aether/icon.webp`);
    });

    it('should handle normalized names', () => {
      const apiKey = 'raiden-shogun';
      const result = service.getCharacterIcon(apiKey);
      expect(result).toBe(`${environment.apiImageBaseUrl}/characters/raiden-shogun/icon.webp`);
    });
  });

  describe('getElementIcon', () => {
    it('should return correct element icon URL for Geo', () => {
      const result = service.getElementIcon('Geo');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Geo.webp`);
    });

    it('should return correct element icon URL for Pyro', () => {
      const result = service.getElementIcon('Pyro');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Pyro.webp`);
    });

    it('should return correct element icon URL for Hydro', () => {
      const result = service.getElementIcon('Hydro');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Hydro.webp`);
    });

    it('should return correct element icon URL for Electro', () => {
      const result = service.getElementIcon('Electro');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Electro.webp`);
    });

    it('should return correct element icon URL for Cryo', () => {
      const result = service.getElementIcon('Cryo');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Cryo.webp`);
    });

    it('should return correct element icon URL for Anemo', () => {
      const result = service.getElementIcon('Anemo');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Anemo.webp`);
    });

    it('should return correct element icon URL for Dendro', () => {
      const result = service.getElementIcon('Dendro');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Dendro.webp`);
    });
  });

  describe('getWeaponIcon', () => {
    it('should return correct weapon icon URL', () => {
      const weaponSlug = 'primordial-jade-cutter';
      const result = service.getWeaponIcon(weaponSlug);
      expect(result).toBe(`${environment.apiImageBaseUrl}/weapons/primordial-jade-cutter/icon.webp`);
    });

    it('should handle simple weapon names', () => {
      const weaponSlug = 'aquila-favonia';
      const result = service.getWeaponIcon(weaponSlug);
      expect(result).toBe(`${environment.apiImageBaseUrl}/weapons/aquila-favonia/icon.webp`);
    });
  });

  describe('getWeaponTypeIcon', () => {
    it('should return correct weapon type icon URL for Sword', () => {
      const result = service.getWeaponTypeIcon('Sword');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Sword.webp`);
    });

    it('should return correct weapon type icon URL for Claymore', () => {
      const result = service.getWeaponTypeIcon('Claymore');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Claymore.webp`);
    });

    it('should return correct weapon type icon URL for Polearm', () => {
      const result = service.getWeaponTypeIcon('Polearm');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Polearm.webp`);
    });

    it('should return correct weapon type icon URL for Bow', () => {
      const result = service.getWeaponTypeIcon('Bow');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Bow.webp`);
    });

    it('should return correct weapon type icon URL for Catalyst', () => {
      const result = service.getWeaponTypeIcon('Catalyst');
      expect(result).toBe(`${environment.apiImageBaseUrl}/Catalyst.webp`);
    });
  });

  describe('getArtifactImage', () => {
    it('should return correct artifact image URL for flower', () => {
      const result = service.getArtifactImage('maiden-beloved', 'flower');
      expect(result).toBe(`${environment.apiImageBaseUrl}/artifacts/maiden-beloved/flower.webp`);
    });

    it('should return correct artifact image URL for circlet', () => {
      const result = service.getArtifactImage('maiden-beloved', 'circlet');
      expect(result).toBe(`${environment.apiImageBaseUrl}/artifacts/maiden-beloved/circlet.webp`);
    });

    it('should return correct artifact image URL for any piece', () => {
      const result = service.getArtifactImage('heart-of-depth', 'goblet');
      expect(result).toBe(`${environment.apiImageBaseUrl}/artifacts/heart-of-depth/goblet.webp`);
    });
  });

  describe('getMaterialImage', () => {
    it('should return correct material image URL with specified type', () => {
      const result = service.getMaterialImage('prithiva-topaz-sliver', 'gemstone');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/gemstone/prithiva-topaz-sliver.webp`);
    });

    it('should default to generic type when not specified', () => {
      const result = service.getMaterialImage('fine-enhancement-ore');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/generic/fine-enhancement-ore.webp`);
    });

    it('should handle boss material type', () => {
      const result = service.getMaterialImage('tusk', 'boss');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/boss/tusk.webp`);
    });

    it('should handle talent material type', () => {
      const result = service.getMaterialImage('guide-to-ballad', 'talent');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/talent/guide-to-ballad.webp`);
    });

    it('should handle weapon material type', () => {
      const result = service.getMaterialImage('luminous-sponge', 'weapon');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/weapon/luminous-sponge.webp`);
    });

    it('should handle local specialty type', () => {
      const result = service.getMaterialImage('brilliant-diamond-ore', 'local-specialty');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/local-specialty/brilliant-diamond-ore.webp`);
    });

    it('should handle xp-and-mora type', () => {
      const result = service.getMaterialImage('wanderers-advice', 'xp-and-mora');
      expect(result).toBe(`${environment.apiImageBaseUrl}/materials/xp-and-mora/wanderers-advice.webp`);
    });
  });

  describe('getSkillIcon', () => {
    it('should return correct skill icon URL', () => {
      const result = service.getSkillIcon('UI_BtnIcon_AvatarList');
      expect(result).toBe(`${environment.apiImageBaseUrl}/UI_BtnIcon_AvatarList.webp`);
    });

    it('should handle other skill codes', () => {
      const result = service.getSkillIcon('skill_code_example');
      expect(result).toBe(`${environment.apiImageBaseUrl}/skill_code_example.webp`);
    });
  });

  describe('baseUrl usage', () => {
    it('should use consistent baseUrl in all methods', () => {
      // All methods should use the same baseUrl prefix
      const characterIconUrl = service.getCharacterIcon('test');
      const elementIconUrl = service.getElementIcon('Test');
      const weaponIconUrl = service.getWeaponIcon('test');
      const materialImageUrl = service.getMaterialImage('test', 'generic');

      expect(characterIconUrl).toContain('assets/images/');
      expect(elementIconUrl).toContain('assets/images/');
      expect(weaponIconUrl).toContain('assets/images/');
      expect(materialImageUrl).toContain('assets/images/');
    });
  });
});
