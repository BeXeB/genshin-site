import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

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
      expect(result).toBe('assets/images/characters/aether/icon.webp');
    });

    it('should handle normalized names', () => {
      const apiKey = 'raiden-shogun';
      const result = service.getCharacterIcon(apiKey);
      expect(result).toBe('assets/images/characters/raiden-shogun/icon.webp');
    });
  });

  describe('getElementIcon', () => {
    it('should return correct element icon URL for Geo', () => {
      const result = service.getElementIcon('Geo');
      expect(result).toBe('assets/images/Geo.webp');
    });

    it('should return correct element icon URL for Pyro', () => {
      const result = service.getElementIcon('Pyro');
      expect(result).toBe('assets/images/Pyro.webp');
    });

    it('should return correct element icon URL for Hydro', () => {
      const result = service.getElementIcon('Hydro');
      expect(result).toBe('assets/images/Hydro.webp');
    });

    it('should return correct element icon URL for Electro', () => {
      const result = service.getElementIcon('Electro');
      expect(result).toBe('assets/images/Electro.webp');
    });

    it('should return correct element icon URL for Cryo', () => {
      const result = service.getElementIcon('Cryo');
      expect(result).toBe('assets/images/Cryo.webp');
    });

    it('should return correct element icon URL for Anemo', () => {
      const result = service.getElementIcon('Anemo');
      expect(result).toBe('assets/images/Anemo.webp');
    });

    it('should return correct element icon URL for Dendro', () => {
      const result = service.getElementIcon('Dendro');
      expect(result).toBe('assets/images/Dendro.webp');
    });
  });

  describe('getWeaponIcon', () => {
    it('should return correct weapon icon URL', () => {
      const weaponSlug = 'primordial-jade-cutter';
      const result = service.getWeaponIcon(weaponSlug);
      expect(result).toBe('assets/images/weapons/primordial-jade-cutter/icon.webp');
    });

    it('should handle simple weapon names', () => {
      const weaponSlug = 'aquila-favonia';
      const result = service.getWeaponIcon(weaponSlug);
      expect(result).toBe('assets/images/weapons/aquila-favonia/icon.webp');
    });
  });

  describe('getWeaponTypeIcon', () => {
    it('should return correct weapon type icon URL for Sword', () => {
      const result = service.getWeaponTypeIcon('Sword');
      expect(result).toBe('assets/images/Sword.webp');
    });

    it('should return correct weapon type icon URL for Claymore', () => {
      const result = service.getWeaponTypeIcon('Claymore');
      expect(result).toBe('assets/images/Claymore.webp');
    });

    it('should return correct weapon type icon URL for Polearm', () => {
      const result = service.getWeaponTypeIcon('Polearm');
      expect(result).toBe('assets/images/Polearm.webp');
    });

    it('should return correct weapon type icon URL for Bow', () => {
      const result = service.getWeaponTypeIcon('Bow');
      expect(result).toBe('assets/images/Bow.webp');
    });

    it('should return correct weapon type icon URL for Catalyst', () => {
      const result = service.getWeaponTypeIcon('Catalyst');
      expect(result).toBe('assets/images/Catalyst.webp');
    });
  });

  describe('getArtifactImage', () => {
    it('should return correct artifact image URL for flower', () => {
      const result = service.getArtifactImage('maiden-beloved', 'flower');
      expect(result).toBe('assets/images/artifacts/maiden-beloved/flower.webp');
    });

    it('should return correct artifact image URL for circlet', () => {
      const result = service.getArtifactImage('maiden-beloved', 'circlet');
      expect(result).toBe('assets/images/artifacts/maiden-beloved/circlet.webp');
    });

    it('should return correct artifact image URL for any piece', () => {
      const result = service.getArtifactImage('heart-of-depth', 'goblet');
      expect(result).toBe('assets/images/artifacts/heart-of-depth/goblet.webp');
    });
  });

  describe('getMaterialImage', () => {
    it('should return correct material image URL with specified type', () => {
      const result = service.getMaterialImage('prithiva-topaz-sliver', 'gemstone');
      expect(result).toBe('assets/images/materials/gemstone/prithiva-topaz-sliver.webp');
    });

    it('should default to generic type when not specified', () => {
      const result = service.getMaterialImage('fine-enhancement-ore');
      expect(result).toBe('assets/images/materials/generic/fine-enhancement-ore.webp');
    });

    it('should handle boss material type', () => {
      const result = service.getMaterialImage('tusk', 'boss');
      expect(result).toBe('assets/images/materials/boss/tusk.webp');
    });

    it('should handle talent material type', () => {
      const result = service.getMaterialImage('guide-to-ballad', 'talent');
      expect(result).toBe('assets/images/materials/talent/guide-to-ballad.webp');
    });

    it('should handle weapon material type', () => {
      const result = service.getMaterialImage('luminous-sponge', 'weapon');
      expect(result).toBe('assets/images/materials/weapon/luminous-sponge.webp');
    });

    it('should handle local specialty type', () => {
      const result = service.getMaterialImage('brilliant-diamond-ore', 'local-specialty');
      expect(result).toBe('assets/images/materials/local-specialty/brilliant-diamond-ore.webp');
    });

    it('should handle xp-and-mora type', () => {
      const result = service.getMaterialImage('wanderers-advice', 'xp-and-mora');
      expect(result).toBe('assets/images/materials/xp-and-mora/wanderers-advice.webp');
    });
  });

  describe('getSkillIcon', () => {
    it('should return correct skill icon URL', () => {
      const result = service.getSkillIcon('UI_BtnIcon_AvatarList');
      expect(result).toBe('assets/images/UI_BtnIcon_AvatarList.webp');
    });

    it('should handle other skill codes', () => {
      const result = service.getSkillIcon('skill_code_example');
      expect(result).toBe('assets/images/skill_code_example.webp');
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
