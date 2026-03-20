import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly baseUrl = 'assets/images';

  /**
   * Get character icon URL
   * @param apiKey - Character's API key / normalized name
   * @returns URL to character icon image
   */
  getCharacterIcon(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/icon.webp`;
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
}
