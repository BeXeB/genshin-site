import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { CharacterOverviewComponent } from './character-overview/character-overview.component';
import { CharacterResolved } from '../../_models/character';
import { CharacterGuideComponent } from './character-guide/character-guide.component';
import { ResolverService } from '../../_services/resolver.service';

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

  constructor(
    private characterService: CharacterService,
    private resolverService: ResolverService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) return;
    this.apikey = name;
    this.characterService.getCharacterDetails(name).subscribe((data) => {
      this.char = this.resolverService.resolveCharacter(data);
    });
  }

  getElementColor(): string {
    if (!this.char) return '';
    return `var(--${this.char?.profile.elementText.toLowerCase()})`;
  }
}
