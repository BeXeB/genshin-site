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
    'sigewinne',
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

    const count = Math.min(3, availableCharacters.length);

    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (availableCharacters.length - i));

      [availableCharacters[i], availableCharacters[j]] = [
        availableCharacters[j],
        availableCharacters[i],
      ];
    }

    const selected = availableCharacters.slice(0, count);

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

      // Use the full horizontally scrollable width.
      const width = element.scrollWidth;
      const height = element.scrollHeight;

      clone.style.width = `${width}px`;
      clone.style.minWidth = `${width}px`;
      clone.style.maxWidth = `${width}px`;
      clone.style.height = `${height}px`;
      clone.style.overflow = 'visible';

      // Make each row use the full export width.
      clone.querySelectorAll('.result-row').forEach((row) => {
        const el = row as HTMLElement;

        el.style.width = `${width}px`;
        el.style.minWidth = `${width}px`;
        el.style.maxWidth = `${width}px`;
        el.style.flexShrink = '0';
        el.style.overflow = 'visible';
      });

      // Pre-render every character image into a 120x240 canvas.
      // This reproduces:
      //   object-fit: cover;
      //   object-position: top center;
      //
      // without relying on html2canvas to interpret object-fit.
      const imagePromises: Promise<void>[] = [];

      clone.querySelectorAll('.round-result').forEach((card) => {
        const el = card as HTMLElement;

        el.style.width = '120px';
        el.style.minWidth = '120px';
        el.style.maxWidth = '120px';
        el.style.flex = '0 0 120px';
        el.style.overflow = 'hidden';

        const img = el.querySelector('img') as HTMLImageElement | null;

        if (!img) {
          return;
        }

        const promise = new Promise<void>((resolve) => {
          const drawImage = () => {
            const sourceWidth = img.naturalWidth;
            const sourceHeight = img.naturalHeight;

            if (!sourceWidth || !sourceHeight) {
              resolve();
              return;
            }

            const targetWidth = 120;
            const targetHeight = 240;

            // Calculate the scale required for "cover".
            const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);

            const drawWidth = sourceWidth * scale;
            const drawHeight = sourceHeight * scale;

            // Center horizontally, but keep the top of the image visible.
            const x = (targetWidth - drawWidth) / 2;
            const y = 0;

            const canvas = document.createElement('canvas');

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d');

            if (!ctx) {
              resolve();
              return;
            }

            ctx.drawImage(img, x, y, drawWidth, drawHeight);

            // Replace the original image with our already-cropped canvas.
            canvas.style.width = `${targetWidth}px`;
            canvas.style.height = `${targetHeight}px`;
            canvas.style.display = 'block';

            img.replaceWith(canvas);

            resolve();
          };

          if (img.complete && img.naturalWidth > 0) {
            drawImage();
          } else {
            img.onload = drawImage;
            img.onerror = () => resolve();
          }
        });

        imagePromises.push(promise);
      });

      // Make sure all images have been converted before html2canvas runs.
      await Promise.all(imagePromises);

      // Put the clone outside the visible page.
      container = document.createElement('div');

      container.style.position = 'absolute';
      container.style.top = '-99999px';
      container.style.left = '0';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = 'visible';
      container.style.pointerEvents = 'none';

      container.appendChild(clone);
      document.body.appendChild(container);

      // Allow the browser to calculate the cloned layout.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
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
