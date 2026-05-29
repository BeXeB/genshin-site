import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Tier, TierCharacter, Tierlist, TagDefinition } from '../../_models/tierlist';
import { CharacterProfile } from '../../_models/character';
import { ImageService } from '../../_services/image.service';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-tierlist-display',
    standalone: true,
    templateUrl: './tierlist-display.component.html',
    styleUrl: './tierlist-display.component.css',
})
export class TierlistDisplayComponent {
    @Input() tierlist!: Tierlist;
    @Input() characterMap: Map<string, CharacterProfile> = new Map();
    @ViewChild('tierlistContainer') tierlistContainer!: ElementRef;

    constructor(private imageService: ImageService) { }

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

    getCharacterIcon(apiKey: string): string {
        return this.imageService.getCharacterIcon(apiKey);
    }

    getTagDefinition(tagId: string): TagDefinition | undefined {
        return this.tierlist.tags.find((t) => t.id === tagId);
    }

    async exportAsImage(format: 'png' | 'jpg' = 'png'): Promise<void> {
        if (!this.tierlistContainer) {
            console.error('Container not found');
            return;
        }

        try {
            const element = this.tierlistContainer.nativeElement;

            const canvas = await html2canvas(element, {
                backgroundColor: '#00000000', // transparent background
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true,
            });

            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? 0.95 : undefined;

            const dataUrl = quality ? canvas.toDataURL(mimeType, quality) : canvas.toDataURL(mimeType);

            if (!dataUrl || dataUrl.length < 100) {
                console.error('Invalid canvas data');
                return;
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `tierlist.${format === 'jpg' ? 'jpg' : 'png'}`;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
        }
    }
}
