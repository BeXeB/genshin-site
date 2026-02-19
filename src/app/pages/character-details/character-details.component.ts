import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.css',
})
export class CharacterDetailsComponent implements OnInit {
  constructor(
    private characterService: CharacterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) return;
    this.characterService
      .getCharacterDetails(name)
      .subscribe((data) => console.log(data));
  }
}
