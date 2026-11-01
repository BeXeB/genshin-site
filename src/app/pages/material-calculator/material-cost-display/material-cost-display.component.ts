import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LevelingCost, MaterialTotal } from '../../../_models/calculator';
import { MaterialService } from '../../../_services/material.service';
import { Material, MaterialCraft } from '../../../_models/materials';
import { MaterialType, MaterialTypeLabel } from '../../../_models/enum';

export interface MaterialTableColumn {
  rarity: number;
  label: string;
  color: string;
}

/** One line per material family, or per material when the family's rarities repeat */
export interface MaterialTableLine {
  /** Highest-rarity material; supplies the icon and name */
  lead: MaterialTotal;
  /** One entry per column; undefined when the line has no material of that rarity */
  cells: (MaterialTotal | undefined)[];
}

export interface MaterialTable {
  columns: MaterialTableColumn[];
  lines: MaterialTableLine[];
}

export interface MaterialTypeGroup {
  label: string;
  tables: MaterialTable[];
  /** Mora shown above the tables; only the XP & Mora group carries it */
  showMora: boolean;
  mora: number;
  /** Single-rarity sections take a third of a row instead of half */
  compact: boolean;
}

/** Sections in display order */
const TYPE_DISPLAY_ORDER: MaterialType[] = [
  MaterialType.TALENT_MATERIAL,
  MaterialType.WEAPON_MATERIAL,
  MaterialType.GENERIC_MATERIAL,
  MaterialType.BOSS_MATERIAL,
  MaterialType.LOCAL_SPECIALTY,
  MaterialType.XP_AND_MORA,
  MaterialType.GEMSTONE,
  MaterialType.BILLET,
  MaterialType.CRYSTAL,
];

/** Sections of these types get a row of their own */
const OWN_ROW_TYPES: MaterialType[] = [MaterialType.GENERIC_MATERIAL];

/** Generic families whose top rarity reaches this value form the elite table */
const ELITE_MIN_RARITY = 4;

/** Boss materials of this rarity are the weekly boss drops */
const WEEKLY_BOSS_RARITY = 5;

/** Talent materials of this rarity are the crowns */
const CROWN_RARITY = 5;

/** Mora's material ID, used for owned-count lookups */
const MORA_ID = 202;

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
  /** Show materials as one table per type instead of a flat grid */
  @Input() groupByType = false;
  /** Materials tab: shown amounts are still needed after these owned counts */
  @Input() ownedMaterials: Record<number, number> | null = null;
  /** Inventory tab: count cells become inputs that emit ownedChange */
  @Input() inventoryMode = false;
  @Output() ownedChange = new EventEmitter<{ materialId: number; quantity: number }>();
  readonly moraId = MORA_ID;

  sortedMaterials: MaterialTotal[] = [];
  typeRows: MaterialTypeGroup[][] = [];
  craftMora = 0;
  private materialMap: Map<number, Material> = new Map();
  private neededById = new Map<number, number>();
  private craftMap = new Map<number, MaterialCraft>();
  private craftedById = new Map<number, number>();

  constructor(private materialService: MaterialService) {}

  ngOnChanges(): void {
    this.sortMaterials();
  }

  ngOnInit(): void {
    // Load materials and crafts, then build the ID lookups
    forkJoin({
      materials: this.materialService.getMaterials(),
      crafts: this.materialService.getMaterialCrafts(),
    }).subscribe(({ materials, crafts }) => {
      materials.forEach((material) => {
        this.materialMap.set(material.id, material);
      });
      crafts.forEach((craft) => this.craftMap.set(craft.id, craft));
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

    const needed = this.cost?.materials ?? [];
    this.neededById = new Map(needed.map((m) => [m.materialId, m.quantity]));
    this.planCrafts();
    const shown = this.subtractsOwned
      ? needed.map((m) => ({
          ...m,
          quantity: m.quantity - this.coveredOf(m.materialId) + this.consumedOf(m.materialId),
        }))
      : needed;

    this.sortedMaterials = [...shown].sort((a, b) => {
      const infoA = info(a.materialId);
      const infoB = info(b.materialId);
      return (
        infoA.type - infoB.type || infoB.rarity - infoA.rarity || infoA.sortRank - infoB.sortRank
      );
    });
    const totalMora = this.cost?.totalMora ?? 0;
    const mora = this.subtractsOwned
      ? Math.max(0, totalMora - this.ownedOf(MORA_ID)) + this.craftMora
      : totalMora;
    this.typeRows = this.buildTypeRows(this.sortedMaterials, mora);
  }

  /** Owned counts reduce the shown amounts, except on the inventory tab where they are inputs */
  private get subtractsOwned(): boolean {
    return this.ownedMaterials !== null && !this.inventoryMode;
  }

  ownedOf(materialId: number): number {
    return this.ownedMaterials?.[materialId] ?? 0;
  }

  /** Total needed before owned counts were subtracted */
  neededOf(materialId: number): number {
    return this.neededById.get(materialId) ?? 0;
  }

  /** Items each material can craft from owned excess, cascading up the recipe chains */
  private computeCrafted(): Map<number, number> {
    const crafted = new Map<number, number>();
    const excess = new Map<number, number>();
    const visiting = new Set<number>();

    const excessOf = (materialId: number): number => {
      const known = excess.get(materialId);
      if (known !== undefined) {
        return known;
      }
      const craft = this.craftMap.get(materialId);
      let made = 0;
      if (craft && craft.recipe.length > 0 && !visiting.has(materialId)) {
        visiting.add(materialId);
        const batches = craft.recipe.map((item) =>
          Math.floor(Math.max(0, excessOf(item.id)) / item.count)
        );
        made = Math.min(...batches) * craft.resultCount;
        visiting.delete(materialId);
      }
      crafted.set(materialId, made);
      const value = this.ownedOf(materialId) + made - this.neededOf(materialId);
      excess.set(materialId, value);
      return value;
    };

    this.craftMap.forEach((_, materialId) => excessOf(materialId));
    return crafted;
  }

  /** Plans the crafts that cover needs from owned materials; sets craftedById and craftMora */
  private planCrafts(): void {
    this.craftedById = new Map<number, number>();
    this.craftMora = 0;
    if (!this.subtractsOwned) {
      return;
    }

    const capacity = this.computeCrafted();
    const consumers = new Map<number, { craft: MaterialCraft; count: number }[]>();
    this.craftMap.forEach((craft) => {
      for (const item of craft.recipe) {
        consumers.set(item.id, [...(consumers.get(item.id) ?? []), { craft, count: item.count }]);
      }
    });

    const crafts = new Map<number, number>();
    const visiting = new Set<number>();
    const demandOf = (materialId: number): number =>
      (consumers.get(materialId) ?? []).reduce(
        (total, { craft, count }) => total + craftsOf(craft.id) * count,
        this.neededOf(materialId)
      );
    const craftsOf = (materialId: number): number => {
      const known = crafts.get(materialId);
      const craft = this.craftMap.get(materialId);
      if (known !== undefined) {
        return known;
      }
      if (!craft || visiting.has(materialId)) {
        return 0;
      }
      visiting.add(materialId);
      const shortage = Math.max(0, demandOf(materialId) - this.ownedOf(materialId));
      const affordable = Math.floor((capacity.get(materialId) ?? 0) / craft.resultCount);
      const count = Math.min(Math.ceil(shortage / craft.resultCount), affordable);
      visiting.delete(materialId);
      crafts.set(materialId, count);
      return count;
    };

    this.craftMap.forEach((craft, materialId) => {
      const count = craftsOf(materialId);
      if (count > 0) {
        this.craftedById.set(materialId, count * craft.resultCount);
        this.craftMora += count * craft.moraCost;
      }
    });
  }

  /** Owned plus crafted amount, subtracted from the total needed */
  private coveredOf(materialId: number): number {
    return this.ownedOf(materialId) + (this.craftedById.get(materialId) ?? 0);
  }

  /** Materials consumed as ingredients by planned crafts */
  private consumedOf(materialId: number): number {
    let consumed = 0;

    this.craftMap.forEach((craft) => {
      const crafted = this.craftedById.get(craft.id) ?? 0;

      if (crafted <= 0) {
        return;
      }

      const batches = crafted / craft.resultCount;

      const ingredient = craft.recipe.find((item) => item.id === materialId);

      if (ingredient) {
        consumed += batches * ingredient.count;
      }
    });

    return consumed;
  }

  onOwnedInput(materialId: number, quantity: number): void {
    this.ownedChange.emit({ materialId, quantity });
  }

  /** Split materials into rows of type sections, in TYPE_DISPLAY_ORDER */
  private buildTypeRows(materials: MaterialTotal[], mora: number): MaterialTypeGroup[][] {
    const rows: MaterialTypeGroup[][] = [[]];
    const addGroup = (label: string, tables: MaterialTable[], groupMora?: number) => {
      const shown = tables.filter((table) => table.lines.length > 0);
      if (shown.length > 0 || (groupMora ?? 0) > 0) {
        const compact = shown.every((table) => table.columns.length <= 1);
        const showMora = groupMora !== undefined && (groupMora > 0 || this.inventoryMode);
        rows[rows.length - 1].push({
          label,
          tables: shown,
          showMora,
          mora: groupMora ?? 0,
          compact,
        });
      }
    };
    for (const type of TYPE_DISPLAY_ORDER) {
      if (OWN_ROW_TYPES.includes(type) && rows[rows.length - 1].length > 0) {
        rows.push([]);
      }
      const items = materials.filter((m) => this.materialMap.get(m.materialId)?.type === type);
      if (type === MaterialType.GENERIC_MATERIAL) {
        const [common, elite] = this.splitByTopRarity(items);
        addGroup('Generic Common', [this.buildTable(common)]);
        addGroup('Generic Elite', [this.buildTable(elite)]);
      } else if (type === MaterialType.TALENT_MATERIAL) {
        const isCrown = (m: MaterialTotal) => this.rarityOf(m) === CROWN_RARITY;
        addGroup(MaterialTypeLabel[type], [
          this.buildTable(items.filter((m) => !isCrown(m))),
          this.buildTable(items.filter(isCrown), 'Amount'),
        ]);
      } else if (type === MaterialType.BOSS_MATERIAL) {
        const isWeekly = (m: MaterialTotal) => this.rarityOf(m) === WEEKLY_BOSS_RARITY;
        addGroup(MaterialTypeLabel[type], [this.buildTable(items.filter((m) => !isWeekly(m)))]);
        addGroup('Weekly Material', [this.buildTable(items.filter(isWeekly))]);
      } else if (type === MaterialType.XP_AND_MORA) {
        const isMora = (m: MaterialTotal) => m.materialId === MORA_ID;
        const isWeaponXp = (m: MaterialTotal) => this.isEnhancementOre(m.materialId);
        addGroup(
          MaterialTypeLabel[type],
          [
            this.buildTable(items.filter((m) => !isMora(m) && !isWeaponXp(m))),
            this.buildTable(items.filter(isWeaponXp)),
          ],
          mora
        );
      } else {
        addGroup(MaterialTypeLabel[type], [this.buildTable(items)]);
      }
      if (OWN_ROW_TYPES.includes(type)) {
        rows.push([]);
      }
    }
    const unknown = materials.filter((m) => !this.materialMap.has(m.materialId));
    addGroup('Other', [this.buildTable(unknown)]);
    return rows.filter((row) => row.length > 0);
  }

  private rarityOf(item: MaterialTotal): number {
    return this.materialMap.get(item.materialId)?.rarity ?? 0;
  }

  /**
   * One line per sortRank family, one column per rarity. A family whose rarities repeat
   * (e.g. boss drops sharing one sortRank) is split into one line per material.
   */
  private buildTable(items: MaterialTotal[], headerOverride?: string): MaterialTable {
    const familyOf = (m: MaterialTotal) => this.materialMap.get(m.materialId)?.sortRank ?? 0;

    const rarities = [...new Set(items.map((m) => this.rarityOf(m)))].sort((a, b) => b - a);
    const columns: MaterialTableColumn[] = rarities.map((rarity) =>
      headerOverride
        ? { rarity, label: headerOverride, color: '' }
        : { rarity, label: RARITY_NAMES[rarity] ?? 'Amount', color: this.rarityColor(rarity) }
    );

    const families = new Map<number, MaterialTotal[]>();
    for (const item of items) {
      const family = familyOf(item);
      families.set(family, [...(families.get(family) ?? []), item]);
    }

    const lines: MaterialTableLine[] = [];
    for (const members of families.values()) {
      const distinct = new Set(members.map((m) => this.rarityOf(m))).size === members.length;
      for (const group of distinct ? [members] : members.map((m) => [m])) {
        const lead = group.reduce((best, m) => (this.rarityOf(m) > this.rarityOf(best) ? m : best));
        lines.push({
          lead,
          cells: rarities.map((rarity) => group.find((m) => this.rarityOf(m) === rarity)),
        });
      }
    }

    lines.sort(
      (a, b) =>
        this.rarityOf(b.lead) - this.rarityOf(a.lead) ||
        familyOf(a.lead) - familyOf(b.lead) ||
        a.lead.materialId - b.lead.materialId
    );

    return { columns, lines };
  }

  /** Split generic materials into [common, elite] by each family's top rarity */
  private splitByTopRarity(items: MaterialTotal[]): [MaterialTotal[], MaterialTotal[]] {
    const familyOf = (m: MaterialTotal) => this.materialMap.get(m.materialId)?.sortRank ?? 0;
    const topRarity = new Map<number, number>();
    for (const item of items) {
      const rarity = this.materialMap.get(item.materialId)?.rarity ?? 0;
      topRarity.set(familyOf(item), Math.max(topRarity.get(familyOf(item)) ?? 0, rarity));
    }
    const isElite = (item: MaterialTotal) =>
      (topRarity.get(familyOf(item)) ?? 0) >= ELITE_MIN_RARITY;
    return [items.filter((m) => !isElite(m)), items.filter((m) => isElite(m))];
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

  /** Talent books read "Philosophies of X" in-game; the section heading already says it */
  displayName(name: string): string {
    return name.replace(/^Philosophies of /, '');
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
    if (
      (materialId >= 102000 && materialId <= 102999) ||
      (materialId >= 112000 && materialId <= 112999)
    ) {
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
    const slug =
      this.materialMap.get(materialId)?.normalizedName ?? this.normalizeName(materialName);
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
