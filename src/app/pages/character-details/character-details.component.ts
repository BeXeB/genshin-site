import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { CharacterOverviewComponent } from './character-overview/character-overview.component';
import { CharacterResolved } from '../../_models/character';
import { CharacterGuideComponent } from './character-guide/character-guide.component';
import { ResolverService } from '../../_services/resolver.service';
import { switchMap } from 'rxjs';
import { ElementType } from '../../_models/enum';

@Component({
  selector: 'app-character-details',
  standalone: true,
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

    return `var(--${this.char.profile.elementText.toLowerCase()})`;
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
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('slug');
    if (!name) return;
    this.apikey = name;

    this.resolverService
      .initialize()
      .pipe(
        switchMap(() => this.characterService.getCharacterDetails(name)),
        switchMap((data) => this.resolverService.resolveCharacter(data)),
      )
      .subscribe((resolvedChar) => {
        this.char = resolvedChar;
      });
  }
}
