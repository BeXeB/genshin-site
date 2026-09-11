import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import {
    Tier,
    TierCharacter,
    Tierlist,
    TagDefinition
} from '../../_models/tierlist';
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

    @ViewChild('tierlistContainer')
    tierlistContainer!: ElementRef;

    constructor(private imageService: ImageService) {}

    getCharsWithProfile(
        tier: Tier,
    ): {
        character: TierCharacter;
        profile: CharacterProfile | undefined;
    }[] {
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

        let container: HTMLDivElement | null = null;

        try {
            /*
             * Export dimensions
             *
             * The title is always 150px wide, including its
             * padding and border because of box-sizing: border-box.
             */
            const TITLE_WIDTH = 150;

            const CHARACTER_WIDTH = 100;
            const CHARACTER_GAP = 5;
            const CHARACTER_PADDING = 10; // 5px left + 5px right

            const MAX_CHARACTERS_PER_ROW = 10;

            /*
             * Find the widest tier.
             *
             * We only need the maximum number of characters in
             * a single tier, not the total number of characters.
             */
            const maxCharacters = Math.min(
                MAX_CHARACTERS_PER_ROW,
                Math.max(
                    0,
                    ...this.tierlist.tiers.map(
                        (tier) => tier.characters.length
                    )
                )
            );

            /*
             * Calculate the width needed by the character area.
             *
             * Example:
             * 3 chars =
             * 3 * 100px
             * + 2 * 5px gaps
             * + 10px padding
             * = 320px
             */
            const charactersWidth =
                maxCharacters > 0
                    ? maxCharacters * CHARACTER_WIDTH +
                      (maxCharacters - 1) * CHARACTER_GAP +
                      CHARACTER_PADDING
                    : CHARACTER_PADDING;

            const exportWidth = TITLE_WIDTH + charactersWidth;

            const element = this.tierlistContainer.nativeElement as HTMLElement;

            // Clone the element so the normal UI is never modified.
            const clonedElement = element.cloneNode(true) as HTMLElement;

            /*
             * Explicit export styles.
             *
             * Firefox needs concrete widths here instead of relying
             * on flexbox's intrinsic sizing.
             */
            const style = document.createElement('style');

            style.textContent = `
                .tierlist-export {
                    width: ${exportWidth}px !important;
                    min-width: ${exportWidth}px !important;
                    max-width: ${exportWidth}px !important;
                    box-sizing: border-box !important;
                    overflow: visible !important;
                }

                /* Always use desktop tier layout for exports */
                .tierlist-export .tier {
                    display: flex !important;
                    flex-direction: row !important;

                    width: ${exportWidth}px !important;
                    min-width: ${exportWidth}px !important;
                    max-width: ${exportWidth}px !important;

                    flex-shrink: 0 !important;
                    box-sizing: border-box !important;
                }

                .tierlist-export .tier-title {
                    flex: 0 0 ${TITLE_WIDTH}px !important;
                    width: ${TITLE_WIDTH}px !important;
                    min-width: ${TITLE_WIDTH}px !important;
                    max-width: ${TITLE_WIDTH}px !important;

                    box-sizing: border-box !important;

                    border-right: solid 1px var(--gray) !important;
                    border-bottom: none !important;
                }

                .tierlist-export .characters {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: wrap !important;

                    flex: 0 0 ${charactersWidth}px !important;
                    width: ${charactersWidth}px !important;
                    min-width: ${charactersWidth}px !important;
                    max-width: ${charactersWidth}px !important;

                    box-sizing: border-box !important;
                }

                .tierlist-export .character {
                    width: 100px !important;
                    min-width: 100px !important;
                    max-width: 100px !important;
                }

                .tierlist-export .character-icon {
                    width: 100% !important;
                    max-width: 100px !important;
                }

                .tierlist-export .tag {
                    font-size: 12px !important;
                    padding: 4px 8px !important;
                }
            `;

            clonedElement.appendChild(style);
            clonedElement.classList.add('tierlist-export');

            clonedElement.appendChild(style);
            clonedElement.classList.add('tierlist-export');

            /*
             * Put the clone outside the visible page.
             *
             * Explicit width is important for Firefox.
             */
            container = document.createElement('div');

            container.style.position = 'absolute';
            container.style.top = '-99999px';
            container.style.left = '0';
            container.style.width = `${exportWidth}px`;
            container.style.minWidth = `${exportWidth}px`;
            container.style.overflow = 'visible';
            container.style.pointerEvents = 'none';

            container.appendChild(clonedElement);
            document.body.appendChild(container);

            /*
             * Wait for the browser to perform layout before
             * html2canvas measures the element.
             */
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
            });

            const canvas = await html2canvas(clonedElement, {
              backgroundColor: null,
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: true,
              width: exportWidth,
              windowWidth: exportWidth,
            });

            const mimeType =
                format === 'jpg' ? 'image/jpeg' : 'image/png';

            const quality = format === 'jpg' ? 0.95 : undefined;

            const dataUrl = quality
                ? canvas.toDataURL(mimeType, quality)
                : canvas.toDataURL(mimeType);

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
        } finally {
            /*
             * Always remove the temporary export container,
             * including when html2canvas throws an error.
             */
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
    }
}
