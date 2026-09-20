import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import type { SlotType } from '../../_models/eek';
import { ImageService } from '../../_services/image.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CharacterSlot } from '../../_models/eek';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-eletre-ejszakara-kuka',
  imports: [PageTitleComponent, DragDropModule],
  templateUrl: './eletre-ejszakara-kuka.component.html',
  styleUrl: './eletre-ejszakara-kuka.component.css',
})
export class EletreEjszakaraKukaComponent implements OnInit {
  constructor(
    private characterService: CharacterService,
    protected imageService: ImageService
  ) {}

  @ViewChild('pastContainer')
  pastContainer!: ElementRef<HTMLElement>;

  previousRoundsResults: {
    eletre: CharacterProfile | null;
    ejszakara: CharacterProfile | null;
    kuka: CharacterProfile | null;
  }[] = [];

  characters: CharacterProfile[] = [];
  selectedCharacters: CharacterProfile[] = [];

  usedCharacterSlugs: string[] = [];
  removedCharacterSlugs: string[] = [
    'nahida',
    'qiqi',
    'klee',
    'diona',
    'sayu',
    'dori',
    'yaoyao',
    'kachina',
    'aino',
    'prune',
    'iansan',
    'sigewinne'
  ];

  slots: CharacterSlot[] = [
    {
      type: 'eletre',
      character: null,
    },
    {
      type: 'ejszakara',
      character: null,
    },
    {
      type: 'kuka',
      character: null,
    },
  ];

  get dropListIds(): string[] {
    return ['charactersList', ...this.slots.map((slot) => slot.type)];
  }

  getSlotLabel(type: SlotType): string {
    switch (type) {
      case 'eletre':
        return 'Életre';
      case 'ejszakara':
        return 'Éjszakára';
      case 'kuka':
        return 'Kuka';
      default:
        return '';
    }
  }

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe((characters) => {
      this.characters = characters;
      this.get3RandomCharacters();
    });
  }

  get3RandomCharacters(): void {
    const availableCharacters = this.characters.filter(
      (character) =>
        !this.usedCharacterSlugs.includes(character.normalizedName) &&
        !this.removedCharacterSlugs.includes(character.normalizedName)
    );
    const shuffled = availableCharacters.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    this.usedCharacterSlugs.push(...selected.map((c) => c.normalizedName));
    this.selectedCharacters = selected;
  }

  getIcon(character: CharacterProfile): string {
    if ([10000005, 10000007].includes(character.id)) {
      return this.imageService.getCharacterGachaSplash(character.normalizedName);
    }
    return this.imageService.getCharacterGachaSlice(character.normalizedName);
  }

  get allSlotsFilled(): boolean {
    return (
      this.selectedCharacters.length === 0 && this.slots.some((slot) => slot.character !== null)
    );
  }

  drop(event: CdkDragDrop<CharacterProfile[]>, targetSlotType?: SlotType): void {
    const character = event.item.data as CharacterProfile;

    if (!character) return;

    const sourceId = event.previousContainer.id;
    const targetId = event.container.id;

    // Nothing to do.
    if (sourceId === targetId) {
      return;
    }

    // ─────────────────────────────
    // SLOT → POOL
    // ─────────────────────────────

    if (targetId === 'charactersList') {
      const sourceSlot = this.slots.find((slot) => slot.type === sourceId);

      if (!sourceSlot) return;

      sourceSlot.character = null;

      if (!this.selectedCharacters.some((c) => c.normalizedName === character.normalizedName)) {
        this.selectedCharacters.push(character);
      }

      return;
    }

    // ─────────────────────────────
    // POOL → SLOT
    // ─────────────────────────────

    if (sourceId === 'charactersList') {
      const targetSlot = this.slots.find((slot) => slot.type === targetId);

      if (!targetSlot) return;

      // If the target slot is occupied, put the old
      // character back into the pool.
      if (targetSlot.character) {
        this.selectedCharacters.push(targetSlot.character);
      }

      targetSlot.character = character;

      this.selectedCharacters = this.selectedCharacters.filter(
        (c) => c.normalizedName !== character.normalizedName
      );

      return;
    }

    const sourceSlot = this.slots.find((slot) => slot.type === sourceId);
    const targetSlot = this.slots.find((slot) => slot.type === targetId);

    if (!sourceSlot || !targetSlot) return;

    // Swap the characters.
    const temp = targetSlot.character;

    targetSlot.character = sourceSlot.character;
    sourceSlot.character = temp;
  }

  submit(): void {
    if (!this.allSlotsFilled) return;

    const eletre = this.slots.find((s) => s.type === 'eletre')!.character!;
    const ejszakara = this.slots.find((s) => s.type === 'ejszakara')!.character!;
    const kuka = this.slots.find((s) => s.type === 'kuka')!.character!;

    this.previousRoundsResults.push({
      eletre,
      ejszakara,
      kuka,
    });

    this.slots.forEach((slot) => {
      slot.character = null;
    });
    this.get3RandomCharacters();
  }

  async downloadAsImage(): Promise<void> {
    if (!this.pastContainer) {
      return;
    }

    let container: HTMLDivElement | null = null;

    try {
      const element = this.pastContainer.nativeElement;

      // Clone the visible container.
      const clone = element.cloneNode(true) as HTMLElement;

      // Use the full content width instead of the scrollable width.
      const width = element.scrollWidth;

      clone.style.width = `${width}px`;
      clone.style.minWidth = `${width}px`;
      clone.style.maxWidth = `${width}px`;
      clone.style.overflow = 'visible';

      clone.querySelectorAll('.round-result').forEach((card) => {
        const el = card as HTMLElement;

        el.style.width = '120px';
        el.style.minWidth = '120px';
        el.style.maxWidth = '120px';
        el.style.flex = '0 0 120px';

        const img = el.querySelector('img') as HTMLImageElement | null;

        if (!img) return;

        const wrapper = document.createElement('div');

        wrapper.style.width = '120px';
        wrapper.style.height = '240px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.position = 'relative';
        wrapper.style.flexShrink = '0';

        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        img.style.width = '120px';
        img.style.height = 'auto';
        img.style.minWidth = '120px';
        img.style.maxWidth = 'none';

        // Same visual behavior as object-position: top
        img.style.display = 'block';
        img.style.objectFit = 'initial';
        img.style.objectPosition = 'initial';
      });

      // Put the clone outside the visible page.
      container = document.createElement('div');

      container.style.position = 'absolute';
      container.style.top = '-99999px';
      container.style.left = '0';
      container.style.width = `${width}px`;
      container.style.overflow = 'visible';
      container.style.pointerEvents = 'none';

      container.appendChild(clone);
      document.body.appendChild(container);

      // Let the browser calculate the cloned layout.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: width,
        windowWidth: width,
      });

      const link = document.createElement('a');

      link.download = 'eletre-ejszakara-kuka.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    } finally {
      if (container?.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }
}
