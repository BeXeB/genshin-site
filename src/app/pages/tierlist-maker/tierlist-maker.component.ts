import { Component, OnInit } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  transferArrayItem,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
import { FormsModule } from '@angular/forms';
import {
  CharacterTag,
  TagDefinition,
  Tier,
  TierCharacter,
  Tierlist,
} from '../../_models/tierlist';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { StorageService } from '../../_services/storage.service';
import { CharacterProfile } from '../../_models/character';

@Component({
  selector: 'app-tierlist-maker',
  standalone: true,
  imports: [FormsModule, DragDropModule, PageTitleComponent],
  templateUrl: './tierlist-maker.component.html',
  styleUrl: './tierlist-maker.component.css',
})
export class TierlistMakerComponent implements OnInit {
  constructor(
    private characterSerivce: CharacterService,
    private storageService: StorageService,
    private imageService: ImageService,
  ) {}

  get allDropLists() {
    return [
      'charactersList',
      ...this.tierlist.tiers.map((_, i) => 'tier-' + i),
    ];
  }

  characters: TierCharacter[] = [];

  tierlist: Tierlist = {
    tiers: [],
    tags: [],
  };

  newTagLabel: string = '';
  newTagColor: string = '#555555';

  selectedCharacter: TierCharacter | null = null;

  characterMap: Map<string, CharacterProfile> = new Map();

  poolSearch: string = '';

  get filteredCharacters(): TierCharacter[] {
    const search = this.poolSearch.trim().toLowerCase();

    if (!search) return this.characters;

    return this.characters.filter((char) => {
      const profile = this.getCharacterProfile(char.apiKey);
      const name = profile?.name?.toLowerCase() ?? '';
      const apiKey = char.apiKey.toLowerCase();

      return name.includes(search) || apiKey.includes(search);
    });
  }

  ngOnInit(): void {
    const saved = this.storageService.loadTierlist();
    if (saved) {
      this.tierlist = saved;

      this.tierlist.tiers.forEach((tier) => {
        tier.characters.forEach((char) => {
          if (!char.instanceId) {
            char.instanceId = crypto.randomUUID();
          }
        });
      });
    }

    this.characterSerivce
      .getCharacters()
      .subscribe((data: CharacterProfile[]) => {
        this.characterMap = new Map(data.map((c) => [c.normalizedName, c]));

        this.characters = data
          .filter((c) => c.name !== 'Manekina' && c.name !== 'Manekin')
          .map((c) => ({
            id: c.id,
            apiKey: c.normalizedName,
            tags: [],
            profile: c,
          }))
          .sort((b, a) => a.profile.version.localeCompare(b.profile.version));
      });
  }

  addTier() {
    this.tierlist.tiers.push({ tier: '', characters: [] });
    this.storageService.saveTierlist(this.tierlist);
  }

  removeTier(tierToRemove: Tier) {
    this.tierlist.tiers = this.tierlist.tiers.filter((t) => t !== tierToRemove);

    this.storageService.saveTierlist(this.tierlist);
  }

  normalize(tag: string): string {
    return tag.toLowerCase().replace(/[\s'"`:\-—]+/g, '');
  }

  getExtraNames(extra: string[]): string {
    return extra
      .map((key) => this.characterMap.get(key)?.name ?? key)
      .join(', ');
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
    this.storageService.saveTierlist(this.tierlist);
  }

  removeTag(tagId: string) {
    this.tierlist.tags = this.tierlist.tags.filter((t) => t.id !== tagId);
    this.tierlist.tiers.forEach((tier) => {
      tier.characters.forEach((char) => {
        char.tags = char.tags.filter((ct) => ct.id !== tagId);
      });
    });

    this.storageService.saveTierlist(this.tierlist);
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

    this.storageService.saveTierlist(this.tierlist);
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

    this.storageService.saveTierlist(this.tierlist);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      return;
    }

    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    const fromPool = event.previousContainer.id === 'charactersList';

    if (fromPool) {
      const cloned: TierCharacter = {
        ...item,
        instanceId: crypto.randomUUID(),
        tags: [],
      };

      event.container.data.splice(event.currentIndex, 0, cloned);
      this.storageService.saveTierlist(this.tierlist);
      return;
    }

    const toPool = event.container.id === 'charactersList';

    if (toPool) {
      event.previousContainer.data.splice(event.previousIndex, 1);
      this.storageService.saveTierlist(this.tierlist);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    this.storageService.saveTierlist(this.tierlist);
  }

  allowDropFromPool = (drag: any, drop: any) => {
    return true; // allow visuals
  };

  getJsonFile() {
    if (!this.tierlist) return;

    const tierlistJson = JSON.stringify(this.tierlist, null, 2);
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

  getCharacterIcon(apiKey: string): string {
    return this.imageService.getCharacterIcon(apiKey);
  }

  getCharacterProfile(apiKey: string): CharacterProfile | undefined {
    return this.characterMap.get(apiKey);
  }
}
