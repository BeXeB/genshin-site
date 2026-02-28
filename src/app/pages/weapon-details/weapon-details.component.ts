import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { WeaponRefine, WeaponResolved } from '../../_models/weapons';
import { Material } from '../../_models/materials';
import { ActivatedRoute } from '@angular/router';
import { ResolverService } from '../../_services/resolver.service';
import { WeaponService } from '../../_services/weapon.service';
import { map, switchMap } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-weapon-details',
  imports: [PageTitleComponent, FormsModule, DecimalPipe],
  templateUrl: './weapon-details.component.html',
  styleUrl: './weapon-details.component.css',
})
export class WeaponDetailsComponent implements OnInit {
  weapon: WeaponResolved | null = null;
  mora: Material | null = null;

  constructor(
    private route: ActivatedRoute,
    private resolver: ResolverService,
    private weaponService: WeaponService,
    private sanitizer: DomSanitizer,
  ) {}

  quickLevels = [
    '1',
    '5',
    '10',
    '15',
    '20',
    '20+',
    '25',
    '30',
    '35',
    '40+',
    '45',
    '50+',
    '55',
    '60+',
    '65',
    '70+',
    '75',
    '80+',
    '85',
    '90',
  ];

  refinements: Record<number, 'r1' | 'r2' | 'r3' | 'r4' | 'r5'> = {
    1: 'r1',
    2: 'r2',
    3: 'r3',
    4: 'r4',
    5: 'r5',
  };

  selectedRefine: number = 1;

  level: string = '1';
  levelIndex: number = this.quickLevels.indexOf(this.level);

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('slug');
    if (!name) return;

    this.resolver
      .initialize()
      .pipe(
        switchMap(() => this.weaponService.getWeapon(name)),
        map((data) => {
          if (!data) return null;
          return this.resolver.resolveWeapon(data);
        }),
      )
      .subscribe((resolvedWeapon) => {
        if (resolvedWeapon) {
          this.weapon = resolvedWeapon;
          this.setLevel(this.weapon?.rarity > 2 ? '90' : '70');
        } else {
          console.warn(`Weapon with slug "${name}" not found`);
        }
      });
  }

  effectToHtml(effectRefine: WeaponRefine | undefined): SafeHtml {
    if (!effectRefine) {
      return '';
    }
    let template = this.weapon?.effectTemplateRaw;
    if (!template) {
      return effectRefine.description;
    }

    template = template.replace(
      /<color="?(#?[0-9A-Fa-f]{3,8})"?>(.*?)<\/color>/g,
      (_, color, text) => {
        const normalizedColor = color.startsWith('#') ? color : `#${color}`;
        return `<span style="color:${normalizedColor}">${text}</span>`;
      },
    );

    template = this.replacePlaceholders(template, effectRefine.values);

    return this.toHtml(template);
  }

  private replacePlaceholders(
    text: string,
    values: (string | number)[],
  ): string {
    return text.replace(/\{(\d+)\}/g, (_, index) => {
      const i = Number(index);
      return values[i] !== undefined ? String(values[i]) : `{${index}}`;
    });
  }

  toHtml(desc: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      desc.replaceAll('\n', '<br>'),
    );
  }

  hasRefine(ref: number): boolean {
    const key = `r${ref}` as keyof typeof this.weapon;
    return !!this.weapon?.[key];
  }

  updateLevelFromIndex() {
    if (!this.weapon) return;

    let level = this.quickLevels[this.levelIndex].toString();

    if (this.weapon.rarity <= 2 && level === '70+') {
      level = '70';
    }

    this.level = level;
  }

  validateLevel() {
    if (!this.weapon) return;
    const ascensionPattern =
      this.weapon?.rarity > 2 ? /^(20|40|50|60|70|80)\+$/ : /^(20|40|50|60)\+$/;
    if (ascensionPattern.test(this.level)) {
      this.setLevel(this.level);
      return;
    }

    let num = parseInt(this.level);
    if (isNaN(num)) {
      this.setLevel('1');
    } else {
      num = Math.max(1, Math.min(90, num));
      this.setLevel(num.toString());
    }
  }

  setLevel(level: string) {
    this.level = level;

    const index = this.quickLevels.indexOf(level);

    const closestIndex = this.quickLevels.reduce((closest, current, idx) => {
      const currentNum = parseInt(current);
      const closestNum = parseInt(this.quickLevels[closest]);
      const targetNum = parseInt(level);
      if (isNaN(currentNum) || isNaN(closestNum) || isNaN(targetNum)) {
        return closest;
      }
      return Math.abs(currentNum - targetNum) < Math.abs(closestNum - targetNum)
        ? idx
        : closest;
    }, 0);

    this.levelIndex = index !== -1 ? index : closestIndex;
  }
}
