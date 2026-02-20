import { Component, OnInit } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  transferArrayItem,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CharacterService } from '../../_services/character.service';
import { FormsModule } from '@angular/forms';
import {
  CharacterTag,
  TagDefinition,
  Tier,
  TierCharacter,
} from '../../_models/tierlist';

@Component({
  selector: 'app-tierlist-maker',
  standalone: true,
  imports: [FormsModule, DragDropModule],
  templateUrl: './tierlist-maker.component.html',
  styleUrl: './tierlist-maker.component.css',
})
export class TierlistMakerComponent implements OnInit {
  constructor(private characterSerivce: CharacterService) {}

  get allDropLists() {
    return ['charactersList', ...this.tiers.map((_, i) => 'tier-' + i)];
  }

  characters: TierCharacter[] = [];

  tiers: Tier[] = [];

  tags: TagDefinition[] = [];
  newTagLabel: string = '';
  newTagColor: string = '#555555';

  selectedCharacter: TierCharacter | null = null;

  ngOnInit(): void {
    this.characterSerivce.getCharacters().subscribe(
      (data) =>
        (this.characters = data
          .filter((c) => c.name !== 'Manekina' && c.name !== 'Manekin')
          .map((c) => ({
            id: c.id,
            apiKey: c.name.replace(/\s+/g, '').toLowerCase(),
            tags: [],
            profile: c,
          }))),
    );
  }

  addTier() {
    this.tiers.push({ tier: '', characters: [] });
  }

  removeTier(tierToRemove: Tier) {
    for (let i = tierToRemove.characters.length - 1; i >= 0; i--) {
      transferArrayItem(
        tierToRemove.characters,
        this.characters,
        i,
        this.characters.length,
      );
    }

    this.tiers = this.tiers.filter((t) => t !== tierToRemove);
  }

  addTag() {
    if (!this.newTagLabel.trim()) return;
    const newTagId = this.newTagLabel.toLowerCase().replace(/\s+/g, '-');
    if (this.tags.some((tag) => tag.id === newTagId)) {
      return;
    }
    const newTag: TagDefinition = {
      id: this.newTagLabel.toLowerCase().replace(/\s+/g, '-'),
      label: this.newTagLabel,
      color: this.newTagColor,
    };
    this.tags.push(newTag);
    this.newTagLabel = '';
    this.newTagColor = '#555555';
  }

  removeTag(tagId: string) {
    this.tags = this.tags.filter((t) => t.id !== tagId);
    this.tiers.forEach((tier) => {
      tier.characters.forEach((char) => {
        char.tags = char.tags.filter((ct) => ct.id !== tagId);
      });
    });
  }

  selectCharacter(char: TierCharacter) {
    this.selectedCharacter = char;
  }

  addTagToCharacter(tagId: string, extras: string[] = []) {
    if (!this.selectedCharacter) return;

    const existing = this.selectedCharacter.tags.find((t) => t.id === tagId);
    if (existing) {
      existing.extra = extras.length ? extras : existing.extra;
    } else {
      const tagDef = this.tags.find((t) => t.id === tagId);
      if (!tagDef) return;
      const newTag: CharacterTag = {
        id: tagId,
        color: tagDef.color,
        label: tagDef.label,
      };
      if (extras.length) newTag.extra = extras;
      this.selectedCharacter.tags.push(newTag);
    }
  }

  removeTagFromCharacter(tagId: string) {
    if (!this.selectedCharacter) return;
    this.selectedCharacter.tags = this.selectedCharacter.tags.filter(
      (t) => t.id !== tagId,
    );
  }

  selectedTagId: string = '';
  selectedTagExtras: string = '';

  onAddTag() {
    if (!this.selectedTagId) return;

    const extras = this.selectedTagExtras
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this.addTagToCharacter(this.selectedTagId, extras);

    this.selectedTagId = '';
    this.selectedTagExtras = '';
  }

  drop(event: CdkDragDrop<any[]>) {
    const movedItem = event.previousContainer.data[event.previousIndex];
    console.log('Character being moved:', movedItem);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      if (!item) return;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getJsonFiles() {
    const tagsJson = JSON.stringify(this.tags, null, 2);
    const tagsBlob = new Blob([tagsJson], { type: 'application/json' });
    const tagsUrl = window.URL.createObjectURL(tagsBlob);
    const a1 = document.createElement('a');
    a1.href = tagsUrl;
    a1.download = 'tags.json';
    document.body.appendChild(a1);
    a1.click();
    document.body.removeChild(a1);
    window.URL.revokeObjectURL(tagsUrl);

    const tiersWithoutProfile = this.tiers.map((tier) => ({
      tier: tier.tier,
      characters: tier.characters.map(({ profile, ...rest }) => rest),
    }));
    const tiersJson = JSON.stringify(tiersWithoutProfile, null, 2);
    const tiersBlob = new Blob([tiersJson], { type: 'application/json' });
    const tiersUrl = window.URL.createObjectURL(tiersBlob);
    const a2 = document.createElement('a');
    a2.href = tiersUrl;
    a2.download = 'tierlist.json';
    document.body.appendChild(a2);
    a2.click();
    document.body.removeChild(a2);
    window.URL.revokeObjectURL(tiersUrl);
  }
}
