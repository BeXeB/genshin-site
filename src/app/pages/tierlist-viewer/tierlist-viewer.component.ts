import { Component } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { Tier, TierCharacter, Tierlist } from '../../_models/tierlist';
import { CharacterProfile } from '../../_models/character';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { TierlistService } from '../../_services/tierlist.service';

@Component({
  selector: 'app-tierlist-viewer',
  imports: [PageTitleComponent],
  templateUrl: './tierlist-viewer.component.html',
  styleUrl: './tierlist-viewer.component.css',
})
export class TierlistViewerComponent {
  constructor(
    private characterService: CharacterService,
    private tierlistService: TierlistService,
  ) {}

  tierlist: Tierlist | null = null;
  characterMap: Map<string, CharacterProfile> = new Map();

  ngOnInit() {
    this.characterService
      .getCharacters()
      .subscribe((characters: CharacterProfile[]) => {
        this.characterMap = new Map(
          characters.map((c: CharacterProfile) => [c.normalizedName, c]),
        );
      });
  }

  getCharsWithProfile(
    tier: Tier,
  ): { character: TierCharacter; profile: CharacterProfile | undefined }[] {
    return tier.characters.map((c: TierCharacter) => ({
      character: c,
      profile: this.characterMap.get(c.apiKey),
    }));
  }

  getExtraNames(extra: string[]): string {
    return extra
      .map((key) => this.characterMap.get(key)?.name ?? key)
      .join(', ');
  }

  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.error('Nem JSON fájl!');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      this.processUploadedFile(fileContent);
    };

    reader.readAsText(file);
  }

  private processUploadedFile(fileContent: string) {
    this.tierlist = this.tierlistService.getTierlistFromJson(fileContent);
  }
}
