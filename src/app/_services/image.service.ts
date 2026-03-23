import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly baseUrl = environment.apiImageBaseUrl;

  /**
   * Get character icon URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character icon image
   */
  getCharacterIcon(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/icon.webp`;
  }

  /**
   * Get character card image URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character card image
   */
  getCharacterCardImage(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/card.webp`;
  }

  /**
   * Get character side portrait URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character side portrait image
   */
  getCharacterSideImage(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/side.webp`;
  }

  /**
   * Get character gacha splash URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character gacha splash image
   */
  getCharacterGachaSplash(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/gacha-splash.webp`;
  }

  /**
   * Get character gacha icon URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character gacha icon image
   */
  getCharacterGachaIcon(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/gacha-icon.webp`;
  }

  /**
   * Get element icon URL
   * @param element - Element name (e.g., 'Geo', 'Pyro', 'Hydro')
   * @returns URL to element icon image
   */
  getElementIcon(element: string): string {
    return `${this.baseUrl}/${element}.webp`;
  }

  /**
   * Get weapon icon URL
   * @param weaponSlug - Weapon's normalized name / slug
   * @returns URL to weapon icon image
   */
  getWeaponIcon(weaponSlug: string): string {
    return `${this.baseUrl}/weapons/${weaponSlug}/icon.webp`;
  }

  /**
   * Get weapon type icon URL
   * @param type - Weapon type (e.g., 'Sword', 'Claymore', 'Bow')
   * @returns URL to weapon type icon image
   */
  getWeaponTypeIcon(type: string): string {
    return `${this.baseUrl}/${type}.webp`;
  }

  /**
   * Get artifact image URL
   * @param artifactSlug - Artifact set's normalized name
   * @param piece - Artifact piece (e.g., 'flower', 'circlet')
   * @returns URL to artifact image
   */
  getArtifactImage(artifactSlug: string, piece: string): string {
    return `${this.baseUrl}/artifacts/${artifactSlug}/${piece}.webp`;
  }

  /**
   * Get material image URL
   * @param materialId - Material's normalized name / ID
   * @param materialType - Material type folder (e.g., 'boss', 'gemstone', 'generic'). Defaults to 'generic' if not provided
   * @returns URL to material image
   */
  getMaterialImage(materialId: string, materialType: string = 'generic'): string {
    return `${this.baseUrl}/materials/${materialType}/${materialId}.webp`;
  }

  /**
   * Get skill icon URL
   * @param skillCode - Skill code / ID
   * @returns URL to skill icon image
   */
  getSkillIcon(skillCode: string): string {
    return `${this.baseUrl}/${skillCode}.webp`;
  }

  /**
   * Get character skill image URL
   * @param apiKey - Character's API key / normalized name
   * @param skillType - Skill type (e.g., 'combat1', 'combat2', 'passive1')
   * @param element - Optional element type for travelers (e.g., 'Anemo', 'Geo')
   * @returns URL to character skill image
   */
  getCharacterSkillImage(apiKey: string, skillType: string, element?: string): string {
    if (skillType === 'combat1') {
      // Combat1 uses special filename from data, but fallback to generic
      return `${this.baseUrl}/characters/${apiKey}/${skillType}.webp`;
    }

    const elementPath = element ? `/${element.toLowerCase()}` : '';
    return `${this.baseUrl}/characters/${apiKey}${elementPath}/skills/${skillType}.webp`;
  }

  /**
   * Get character constellation image URL
   * @param apiKey - Character's API key / normalized name
   * @param constellationLevel - Constellation level (e.g., 'c1', 'c2')
   * @param element - Optional element type for travelers (e.g., 'Anemo', 'Geo')
   * @returns URL to character constellation image
   */
  getCharacterConstellationImage(apiKey: string, constellationLevel: string, element?: string): string {
    const elementPath = element ? `/${element.toLowerCase()}` : '';
    return `${this.baseUrl}/characters/${apiKey}${elementPath}/constellation/${constellationLevel}.webp`;
  }
}
