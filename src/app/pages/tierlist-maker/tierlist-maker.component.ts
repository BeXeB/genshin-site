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
  Tierlist,
} from '../../_models/tierlist';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';

@Component({
  selector: 'app-tierlist-maker',
  standalone: true,
  imports: [FormsModule, DragDropModule, PageTitleComponent],
  templateUrl: './tierlist-maker.component.html',
  styleUrl: './tierlist-maker.component.css',
})
export class TierlistMakerComponent implements OnInit {
  constructor(private characterSerivce: CharacterService) {}

  get allDropLists() {
    return ['charactersList', ...this.tierlist.tiers.map((_, i) => 'tier-' + i)];
  }

  characters: TierCharacter[] = [];

  tierlist: Tierlist = {
    tiers: [],
    tags: [],
  };

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
            apiKey: c.normalizedName,
            tags: [],
            profile: c,
          }))),
    );
  }

  addTier() {
    this.tierlist.tiers.push({ tier: '', characters: [] });
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

    this.tierlist.tiers = this.tierlist.tiers.filter((t) => t !== tierToRemove);
  }

  normalize(tag: string): string {
    return tag.toLowerCase().replace(/[\s'"`:\-—]+/g, '');
  }

  addTag() {
    if (!this.newTagLabel.trim()) return;
    const newTagId = this.normalize(this.newTagLabel);
    if (this.tierlist.tags.some((tag) => tag.id === newTagId)) {
      return;
    }
    const newTag: TagDefinition = {
      id: this.normalize(this.newTagLabel),
      label: this.newTagLabel,
      color: this.newTagColor,
    };
    this.tierlist.tags.push(newTag);
    this.newTagLabel = '';
    this.newTagColor = '#555555';
  }

  removeTag(tagId: string) {
    this.tierlist.tags = this.tierlist.tags.filter((t) => t.id !== tagId);
    this.tierlist.tiers.forEach((tier) => {
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
      const tagDef = this.tierlist.tags.find((t) => t.id === tagId);
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

  getJsonFile() {
    if (!this.tierlist) return;

    const tiersWithoutProfile = this.tierlist.tiers.map((tier) => ({
      ...tier,
      characters: tier.characters.map(({ profile, ...rest }) => rest),
    }));

    const tierlistToExport = {
      ...this.tierlist,
      tiers: tiersWithoutProfile,
    };

    const tierlistJson = JSON.stringify(tierlistToExport, null, 2);
    const blob = new Blob([tierlistJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tierlist.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
