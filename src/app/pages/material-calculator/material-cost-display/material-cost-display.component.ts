import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LevelingCost, MaterialTotal } from '../../../_models/calculator';
import { MaterialService } from '../../../_services/material.service';
import { Material } from '../../../_models/materials';
import { MaterialType } from '../../../_models/enum';

@Component({
  selector: 'app-material-cost-display',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './material-cost-display.component.html',
  styleUrl: './material-cost-display.component.css',
})
export class MaterialCostDisplayComponent implements OnInit, OnChanges {
  @Input() cost: LevelingCost | null = null;
  @Input() characterName: string = '';

  sortedMaterials: MaterialTotal[] = [];
  private materialMap: Map<number, Material> = new Map();

  constructor(private materialService: MaterialService) {}

  ngOnChanges(): void {
    this.sortMaterials();
  }

  ngOnInit(): void {
    // Load all materials and build ID->Material map for fast lookups
    this.materialService.getMaterials().subscribe((materials) => {
      materials.forEach((material) => {
        this.materialMap.set(material.id, material);
      });
      this.sortMaterials();
    });
  }

  private sortMaterials(): void {
    const typeOrder: MaterialType[] = Object.values(MaterialType);
    const info = (materialId: number) => {
      const material = this.materialMap.get(materialId);
      return {
        type: material ? typeOrder.indexOf(material.type) : typeOrder.length,
        rarity: material?.rarity ?? 0,
        sortRank: material?.sortRank ?? 0,
      };
    };

    this.sortedMaterials = [...(this.cost?.materials ?? [])].sort((a, b) => {
      const infoA = info(a.materialId);
      const infoB = info(b.materialId);
      return (
        infoA.type - infoB.type || infoB.rarity - infoA.rarity || infoA.sortRank - infoB.sortRank
      );
    });
  }

  /**
   * Format mora display
   */
  formatMora(amount: number): string {
    return amount.toLocaleString();
  }

  /**
   * Get material image path based on material type
   * Uses MaterialService lookup for optimal type-based folder mapping
   */
  getMaterialImagePath(materialId: number, materialName: string): string {
    // Try to get material from loaded materials map
    const material = this.materialMap.get(materialId);
    if (material) {
      const folder = material.type; // MaterialType enum values ARE the folder names
      const filename = material.normalizedName; // Use normalizedName (e.g., "heroswit") not filename_icon (e.g., "UI_ItemIcon_104003")
      return `assets/images/materials/${folder}/${filename}.webp`;
    }

    // Fallback: normalize name and guess folder based on ID
    const normalized = this.normalizeName(materialName);

    // Mora special case
    if (materialId === 202) {
      return 'assets/images/materials/xp-and-mora/mora.webp';
    }

    // Try to determine folder from ID ranges as fallback
    if (materialId >= 104100 && materialId <= 104199) {
      return `assets/images/materials/gemstone/${normalized}.webp`;
    }
    if (materialId >= 101200 && materialId <= 101299) {
      return `assets/images/materials/local-specialty/${normalized}.webp`;
    }
    if (materialId >= 106000 && materialId <= 106999) {
      return `assets/images/materials/talent/${normalized}.webp`;
    }
    if ((materialId >= 102000 && materialId <= 102999) ||
        (materialId >= 112000 && materialId <= 112999)) {
      return `assets/images/materials/generic/${normalized}.webp`;
    }
    if (materialId >= 113000 && materialId <= 113999) {
      return `assets/images/materials/boss/${normalized}.webp`;
    }

    // Default fallback
    return `assets/images/materials/generic/${normalized}.webp`;
  }

  /** Details page route; uses the loaded slug, or the normalized name before materials load */
  getMaterialLink(materialId: number, materialName: string): string {
    const slug = this.materialMap.get(materialId)?.normalizedName ?? this.normalizeName(materialName);
    return `/materials/${slug}`;
  }

  getRarityColor(materialId: number): string {
    return `var(--rar-${this.materialMap.get(materialId)?.rarity ?? 1})`;
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
  }

  /**
   * Check if material is an EXP book (for special styling)
   */
  isExpBook(materialId: number): boolean {
    return [104001, 104002, 104003].includes(materialId);
  }

  /**
   * Check if material is enhancement ore (for special styling)
   */
  isEnhancementOre(materialId: number): boolean {
    return [104011, 104012, 104013].includes(materialId);
  }
}
