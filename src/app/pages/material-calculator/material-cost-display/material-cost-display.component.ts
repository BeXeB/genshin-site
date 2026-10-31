import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LevelingCost, MaterialTotal } from '../../../_models/calculator';
import { MaterialService } from '../../../_services/material.service';
import { Material } from '../../../_models/materials';
import { MaterialType, MaterialTypeLabel } from '../../../_models/enum';

export interface MaterialTableColumn {
  rarity: number;
  label: string;
}

/** One line per material family, or per material when the family's rarities repeat */
export interface MaterialTableLine {
  /** Highest-rarity material; supplies the icon and name */
  lead: MaterialTotal;
  /** One entry per column; undefined when the line has no material of that rarity */
  cells: (MaterialTotal | undefined)[];
}

export interface MaterialTypeGroup {
  label: string;
  columns: MaterialTableColumn[];
  lines: MaterialTableLine[];
}

/** Section order follows the Excel TODO sheet; gemstones sit after local specialty. */
const TYPE_DISPLAY_ORDER: MaterialType[] = [
  MaterialType.TALENT_MATERIAL,
  MaterialType.WEAPON_MATERIAL,
  MaterialType.GENERIC_MATERIAL,
  MaterialType.BOSS_MATERIAL,
  MaterialType.LOCAL_SPECIALTY,
  MaterialType.GEMSTONE,
  MaterialType.XP_AND_MORA,
];

/** Rarity column headers, named as in the Excel TODO sheet */
const RARITY_NAMES: Partial<Record<number, string>> = {
  5: 'Gold',
  4: 'Purple',
  3: 'Blue',
  2: 'Green',
  1: 'White',
};

@Component({
  selector: 'app-material-cost-display',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, RouterLink],
  templateUrl: './material-cost-display.component.html',
  styleUrl: './material-cost-display.component.css',
})
export class MaterialCostDisplayComponent implements OnInit, OnChanges {
  @Input() cost: LevelingCost | null = null;
  @Input() characterName: string = '';
  /** Show materials as one table per type instead of a flat grid */
  @Input() groupByType = false;

  sortedMaterials: MaterialTotal[] = [];
  typeGroups: MaterialTypeGroup[] = [];
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
    this.typeGroups = this.buildTypeGroups(this.sortedMaterials);
  }

  /** Split materials into one table per type, in TYPE_DISPLAY_ORDER */
  private buildTypeGroups(materials: MaterialTotal[]): MaterialTypeGroup[] {
    const groups: MaterialTypeGroup[] = [];
    for (const type of TYPE_DISPLAY_ORDER) {
      const items = materials.filter((m) => this.materialMap.get(m.materialId)?.type === type);
      if (items.length > 0) {
        groups.push(this.buildGroup(this.sectionLabel(type), items));
      }
    }
    const unknown = materials.filter((m) => !this.materialMap.has(m.materialId));
    if (unknown.length > 0) {
      groups.push(this.buildGroup('Other', unknown));
    }
    return groups;
  }

  /**
   * One line per sortRank family, one column per rarity. A family whose rarities repeat
   * (e.g. boss drops sharing one sortRank) is split into one line per material.
   */
  private buildGroup(label: string, items: MaterialTotal[]): MaterialTypeGroup {
    const rarityOf = (m: MaterialTotal) => this.materialMap.get(m.materialId)?.rarity ?? 0;
    const familyOf = (m: MaterialTotal) => this.materialMap.get(m.materialId)?.sortRank ?? 0;

    const rarities = [...new Set(items.map(rarityOf))].sort((a, b) => b - a);
    const columns: MaterialTableColumn[] = rarities.map((rarity) => ({
      rarity,
      label: RARITY_NAMES[rarity] ?? 'Amount',
    }));

    const families = new Map<number, MaterialTotal[]>();
    for (const item of items) {
      const family = familyOf(item);
      families.set(family, [...(families.get(family) ?? []), item]);
    }

    const lines: MaterialTableLine[] = [];
    for (const members of families.values()) {
      const distinct = new Set(members.map(rarityOf)).size === members.length;
      for (const group of distinct ? [members] : members.map((m) => [m])) {
        const lead = group.reduce((best, m) => (rarityOf(m) > rarityOf(best) ? m : best));
        lines.push({
          lead,
          cells: rarities.map((rarity) => group.find((m) => rarityOf(m) === rarity)),
        });
      }
    }

    lines.sort(
      (a, b) =>
        rarityOf(b.lead) - rarityOf(a.lead) ||
        familyOf(a.lead) - familyOf(b.lead) ||
        a.lead.materialName.localeCompare(b.lead.materialName),
    );

    return { label, columns, lines };
  }

  private sectionLabel(type: MaterialType): string {
    return type === MaterialType.GENERIC_MATERIAL ? 'Generic Material' : MaterialTypeLabel[type];
  }

  /** Header colour for a rarity column; empty when the column has no rarity */
  rarityColor(rarity: number): string {
    return rarity > 0 ? `var(--rar-${rarity})` : '';
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
