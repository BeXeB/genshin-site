import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import { Tier } from '../../_models/tierlist';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tierlist-maker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tierlist-maker.component.html',
  styleUrl: './tierlist-maker.component.css',
})
export class TierlistMakerComponent implements OnInit {
  constructor(private characterSerivce: CharacterService) {}

  characters: CharacterProfile[] = [];

  tiers: Tier[] = [];

  ngOnInit(): void {
    this.characterSerivce.getCharacters().subscribe(data => this.characters = data);
  }

  addTier() {
    this.tiers.push({tier: "", characters: []})
    console.log(this.tiers)
  }
}
