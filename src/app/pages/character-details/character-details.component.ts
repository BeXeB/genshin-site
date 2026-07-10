import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { CharacterOverviewComponent } from './character-overview/character-overview.component';
import { CharacterResolved } from '../../_models/character';
import { CharacterGuideComponent } from './character-guide/character-guide.component';
import { ResolverService } from '../../_services/resolver.service';
import { StorageService } from '../../_services/storage.service';
import { switchMap, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { ElementType, ElementTypeLabel } from '../../_models/enum';

@Component({
  selector: 'app-character-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageTitleComponent,
    CharacterOverviewComponent,
    CharacterGuideComponent,
  ],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.css',
})
export class CharacterDetailsComponent implements OnInit {
  char: CharacterResolved | null = null;
  apikey: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  selectedElement: ElementType = ElementType.ANEMO;

  elementColors: Record<ElementType, string> = {
    ELEMENT_PYRO: 'var(--pyro)',
    ELEMENT_HYDRO: 'var(--hydro)',
    ELEMENT_ANEMO: 'var(--anemo)',
    ELEMENT_ELECTRO: 'var(--electro)',
    ELEMENT_DENDRO: 'var(--dendro)',
    ELEMENT_CRYO: 'var(--cryo)',
    ELEMENT_GEO: 'var(--geo)',
    ELEMENT_NONE: 'var(--black)',
  };

  getElementColor(): string {
    if (!this.char) return '';

    if (this.isTraveller()) {
      return this.elementColors[this.selectedElement];
    }

    return `var(--${ElementTypeLabel[this.char.profile.elementType].toLowerCase()})`;
  }

  isTraveller(): boolean {
    return (
      this.char?.profile.normalizedName === 'aether' ||
      this.char?.profile.normalizedName === 'lumine'
    );
  }

  onElementChange(element: ElementType) {
    this.selectedElement = element;
  }

  constructor(
    private characterService: CharacterService,
    private resolverService: ResolverService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const name = params.get('slug');
          if (!name) {
            throw new Error('No character slug provided');
          }
          this.apikey = name;
          return this.resolverService.initialize().pipe(
            switchMap(() => this.characterService.getCharacterDetails(name)),
            switchMap((data) => this.resolverService.resolveCharacter(data)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resolvedChar) => {
          this.char = resolvedChar;
          this.errorMessage = null;
          this.cdr.markForCheck();
        },
        error: () => {
          const name = this.apikey || 'unknown';
          this.errorMessage = `Character "${name}" not found`;
          this.cdr.markForCheck();
        },
      });
  }
}
