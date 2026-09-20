import { Injectable } from '@angular/core';
import { ElementType, ElementTypeLabel, WeaponType, WeaponTypeLabel } from '../_models/enum';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly baseUrl = 'assets/images';

  getCharacterIcon(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/icon.webp`;
  }

  getCharacterIconCard(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/card.webp`;
  }

  getCharacterSideIcon(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/side.webp`;
  }

  getCharacterGachaSplash(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/gacha-splash.webp`;
  }

  getCharacterGachaSlice(apiKey: string): string {
    return `${this.baseUrl}/characters/${apiKey}/gacha-icon.webp`;
  }

  getCharacterConstellationIcon(
    apiKey: string,
    constellation: string,
    element?: ElementType
  ): string {
    const elementPath =
      element === undefined ? '' : `/${ElementTypeLabel[element].toLocaleLowerCase()}`;
    return `${this.baseUrl}/characters/${apiKey}${elementPath}/constellation/${constellation}.webp`;
  }

  getCharacterTalentIcon(apiKey: string, talent: string, element?: ElementType): string {
    const elementPath =
      element === undefined ? '' : `/${ElementTypeLabel[element].toLocaleLowerCase()}`;
    return `${this.baseUrl}/characters/${apiKey}${elementPath}/skills/${talent}.webp`;
  }

  getElementIcon(element: ElementType): string {
    return `${this.baseUrl}/${ElementTypeLabel[element]}.webp`;
  }

  getWeaponIcon(weaponSlug: string): string {
    return `${this.baseUrl}/weapons/${weaponSlug}/icon.webp`;
  }

  getWeaponTypeIcon(type: WeaponType): string {
    return `${this.baseUrl}/${WeaponTypeLabel[type]}.webp`;
  }

  getArtifactIcon(artifactSlug: string, piece: string): string {
    return `${this.baseUrl}/artifacts/${artifactSlug}/${piece}.webp`;
  }

  getMaterialIcon(materialId: string, materialType: string = 'generic'): string {
    return `${this.baseUrl}/materials/${materialType}/${materialId}.webp`;
  }

  getSkillIcon(skillCode: string): string {
    return `${this.baseUrl}/${skillCode}.webp`;
  }

  getAdventurerHandbookIcon(): string {
    return `assets/images/UI_BtnIcon_Handbook.webp`;
  }
}
