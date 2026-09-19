import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, forkJoin, map, Subject, switchMap, takeUntil } from 'rxjs';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
import { ModalService } from '../../_services/modal.service';
import { HyperlinkInsertionService } from '../../_services/hyperlink-insertion.service';
import { EditorHistoryService } from '../../_services/editor-history.service';
import { TalentEditorStateService } from '../../_services/talent-editor-state.service';
import { ExportService } from '../../_services/export.service';
import { ElementType, ElementTypeLabel } from '../../_models/enum';
import {
  Character,
  CharacterBriefMap,
  CharacterBriefDescriptions,
  CharacterProfile,
  CombatTalent,
  PassiveTalent,
  ConstellationDetail,
} from '../../_models/character';
import { FormattedTextComponent } from '../../_components/formatted-text-component/formatted-text.component';
import {
  FormattedTextEditorComponent,
  HyperlinkRequest,
} from '../../_components/formatted-text-editor/formatted-text-editor.component';
import { HyperlinkSelectorComponent } from '../../_components/hyperlink-selector/hyperlink-selector.component';

type TalentRow = {
  key: keyof CharacterBriefDescriptions;
  talent: CombatTalent | PassiveTalent | ConstellationDetail;
  section: string;
};

type ColorPreset = {
  label: string;
  color: string;
  element?: ElementType;
};

type CharacterLoadRequest = {
  profile: CharacterProfile;
  restoreSelection: boolean;
};

@Component({
  selector: 'app-talent-editor',
  imports: [CommonModule, FormsModule, FormattedTextComponent, FormattedTextEditorComponent],
  templateUrl: './talent-editor.component.html',
  styleUrl: './talent-editor.component.css',
})
export class TalentEditorComponent implements OnInit, OnDestroy {
  constructor(
    private characterSerivce: CharacterService,
    private imageService: ImageService,
    private modalService: ModalService,
    private insertionService: HyperlinkInsertionService,
    private historyService: EditorHistoryService,
    private stateService: TalentEditorStateService,
    private router: Router
  ) {}

  @ViewChild('hyperlink-editor') hyperlinkEditor?: HyperlinkSelectorComponent;

  characters: CharacterProfile[] = [];

  search: string = '';
  showDropdown = false;

  selectedCharacter: CharacterProfile | null = null;
  selectedCharacterDetails: Character | null = null;
  selectedTalentKey: keyof CharacterBriefDescriptions | null = null;
  selectedSection: string | null = null;
  selectedElement: ElementType | null = null;

  briefDrafts: Partial<CharacterBriefDescriptions> = {};
  private loadedBriefDescriptions: CharacterBriefMap = {};

  // Debounce timer for editor changes
  private editorChangeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingEditorChange: {
    characterId: string;
    element: ElementType | null;
    key: keyof CharacterBriefDescriptions;
    text: string;
  } | null = null;

  colorPresets: ColorPreset[] = [
    { label: 'Kiemelés', color: '#FFD780FF' },
    { label: 'Anemo', color: '#80FFD7FF', element: ElementType.ANEMO },
    { label: 'Cryo', color: '#99FFFFFF', element: ElementType.CRYO },
    { label: 'Dendro', color: '#99FF88FF', element: ElementType.DENDRO },
    { label: 'Electro', color: '#FFACFFFF', element: ElementType.ELECTRO },
    { label: 'Geo', color: '#FFE699FF', element: ElementType.GEO },
    { label: 'Hydro', color: '#80C0FFFF', element: ElementType.HYDRO },
    { label: 'Pyro', color: '#FF9999FF', element: ElementType.PYRO },
  ];

  // Hyperlink insertion tracking
  private currentTalentKey: keyof CharacterBriefDescriptions | null = null;
  private currentHyperlinkRequest: HyperlinkRequest | null = null;
  private readonly characterSelection$ = new Subject<CharacterLoadRequest>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.characterSelection$
      .pipe(
        switchMap(({ profile, restoreSelection }) =>
          forkJoin({
            details: this.characterSerivce.getCharacterDetails(profile.normalizedName),
            descriptions: this.characterSerivce.getBriefDescriptions(profile.normalizedName),
          }).pipe(
            map(({ details, descriptions }) => ({
              profile,
              restoreSelection,
              details,
              descriptions,
            })),
            catchError((error) => {
              console.error('Failed to load character in talent editor:', error);
              this.handleError();
              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ profile, restoreSelection, details, descriptions }) => {
        this.applyLoadedCharacter(profile, details, descriptions, restoreSelection);
      });

    this.characterSerivce.getCharacters().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: CharacterProfile[]) => {
        this.characters = data.sort((b, a) => a.sortId - b.sortId);

        // Try to restore state after characters are loaded
        this.restoreState();
      },
      error: (error) => {
        console.error('Failed to load characters for talent editor:', error);
        this.handleError();
      },
    });

    this.insertionService.insertion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.insertHyperlink(event.id, event.displayText, event.type));
  }

  private restoreState(): void {
    const state = this.stateService.getState();

    // Validate the stored character still exists
    if (!this.stateService.validateState(this.characters.map((c) => c.normalizedName))) {
      this.stateService.clearSelection();
      return;
    }

    if (state.selectedCharacterId) {
      const character = this.characters.find((c) => c.normalizedName === state.selectedCharacterId);
      if (character) {
        this.loadCharacter(character, true);
      }
    }
  }

  private handleError(): void {
    console.error('Talent editor encountered an error, redirecting');
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.flushPendingEditorChange();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredCharacters(): CharacterProfile[] {
    const search = this.search.trim().toLowerCase();

    if (!search) return this.characters;

    return this.characters.filter((char) => {
      const name = char.name.toLowerCase();
      const normalizedName = char.normalizedName.toLowerCase();

      return name.includes(search) || normalizedName.includes(search);
    });
  }

  selectCharacter(profile: CharacterProfile) {
    this.flushPendingEditorChange();
    this.loadCharacter(profile, false);
  }

  private loadCharacter(profile: CharacterProfile, restoreSelection: boolean): void {
    this.selectedCharacter = profile;
    this.search = profile.name;
    this.showDropdown = false;
    this.selectedCharacterDetails = null;
    this.loadedBriefDescriptions = {};
    this.briefDrafts = {};
    this.selectedTalentKey = null;
    this.selectedSection = null;
    this.selectedElement = null;

    this.characterSelection$.next({ profile, restoreSelection });
  }

  private applyLoadedCharacter(
    profile: CharacterProfile,
    details: Character,
    descriptions: CharacterBriefMap,
    restoreSelection: boolean
  ): void {
    this.selectedCharacterDetails = details;
    this.loadedBriefDescriptions = descriptions;

    const state = this.stateService.getState();
    const variantElements = this.getVariantElements();
    this.selectedElement =
      restoreSelection && state.selectedElement && variantElements.includes(state.selectedElement)
        ? state.selectedElement
        : (variantElements[0] ?? null);
    this.updateBriefDrafts();

    const sections = this.talentSections;
    const restoredSection = restoreSelection
      ? sections.find((section) => section.label === state.selectedSection)
      : undefined;
    const selectedSection = restoredSection ?? sections[0];

    this.selectedSection = selectedSection?.label ?? null;
    this.selectedTalentKey =
      restoreSelection &&
      state.selectedTalentKey &&
      selectedSection?.rows.some((row) => row.key === state.selectedTalentKey)
        ? state.selectedTalentKey
        : (selectedSection?.rows[0]?.key ?? null);

    this.historyService.clearAll();
    this.saveState();
  }

  private saveState(): void {
    if (this.selectedCharacter) {
      this.stateService.saveCharacterSelection(
        this.selectedCharacter.normalizedName,
        this.selectedSection,
        this.selectedTalentKey,
        this.selectedElement
      );
    }
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  getCharacterIcon(apiKey: string): string {
    return this.imageService.getCharacterIcon(apiKey);
  }

  getElementIcon(element: ElementType): string {
    return this.imageService.getElementIcon(element);
  }

  // Mask-based coloring (like the toolbar color presets) so the icon itself is tinted.
  getElementIconStyle(element: ElementType): Record<string, string> {
    const iconUrl = this.imageService.getElementIcon(element);
    const elementName = ElementTypeLabel[element].toLowerCase();
    const backgroundColor = `var(--${elementName})`;

    return {
      'background-color': backgroundColor,
      'mask-image': `url(${iconUrl})`,
      '-webkit-mask-image': `url(${iconUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }

  getVariantElements(): ElementType[] {
    if (!this.selectedCharacterDetails?.variants) {
      return [];
    }
    return Object.keys(this.selectedCharacterDetails.variants) as ElementType[];
  }

  selectElement(element: ElementType) {
    this.flushPendingEditorChange();
    this.selectedElement = element;
    this.updateBriefDrafts();
    this.historyService.clearAll();
    this.selectedTalentKey = null;
    this.selectedSection = null;

    // Set first section and talent as selected for new element
    const firstSection = this.talentSections[0];
    if (firstSection) {
      this.selectedSection = firstSection.label;
      const firstRow = firstSection.rows[0];
      if (firstRow) {
        this.selectedTalentKey = firstRow.key;
      }
    }

    // Save state
    this.saveState();
  }

  private updateBriefDrafts(): void {
    if (!this.selectedCharacter) return;

    const variantDescriptions = this.loadedBriefDescriptions as Partial<
      Record<ElementType, Partial<CharacterBriefDescriptions>>
    >;
    const sourceDescriptions = this.selectedElement
      ? (variantDescriptions[this.selectedElement] ?? {})
      : (this.loadedBriefDescriptions as Partial<CharacterBriefDescriptions>);
    const editedDescriptions = this.stateService.getEditedDescriptions(
      this.selectedCharacter.normalizedName,
      this.selectedElement ?? undefined
    );

    this.briefDrafts = { ...sourceDescriptions, ...editedDescriptions };
  }

  get talentSections(): { label: string; rows: TalentRow[] }[] {
    const sections: { label: string; rows: TalentRow[] }[] = [];

    // Use variant data if available and selected
    let skills = this.selectedCharacterDetails?.skills;
    let constellation = this.selectedCharacterDetails?.constellation;

    if (this.selectedElement && this.selectedCharacterDetails?.variants) {
      const variant = this.selectedCharacterDetails.variants[this.selectedElement];
      if (variant) {
        skills = variant.skills;
        constellation = variant.constellation;
      }
    }

    if (skills) {
      sections.push({
        label: 'Skillek',
        rows: [
          { key: 'combat1', talent: skills.combat1, section: 'Skillek' },
          { key: 'combat2', talent: skills.combat2, section: 'Skillek' },
          { key: 'combat3', talent: skills.combat3, section: 'Skillek' },
        ],
      });

      const passiveRows: TalentRow[] = [
        { key: 'passive1', talent: skills.passive1, section: 'Passzívok' },
        { key: 'passive2', talent: skills.passive2, section: 'Passzívok' },
      ];
      if (skills.passive3)
        passiveRows.push({
          key: 'passive3',
          talent: skills.passive3,
          section: 'Passzívok',
        });
      if (skills.passive4)
        passiveRows.push({
          key: 'passive4',
          talent: skills.passive4,
          section: 'Passzívok',
        });

      sections.push({ label: 'Passzívok', rows: passiveRows });
    }

    if (constellation) {
      sections.push({
        label: 'Konstellációk',
        rows: [
          { key: 'c1', talent: constellation.c1, section: 'Konstellációk' },
          { key: 'c2', talent: constellation.c2, section: 'Konstellációk' },
          { key: 'c3', talent: constellation.c3, section: 'Konstellációk' },
          { key: 'c4', talent: constellation.c4, section: 'Konstellációk' },
          { key: 'c5', talent: constellation.c5, section: 'Konstellációk' },
          { key: 'c6', talent: constellation.c6, section: 'Konstellációk' },
        ],
      });
    }

    return sections;
  }

  getAllTalentRows(): TalentRow[] {
    const rows: TalentRow[] = [];
    for (const section of this.talentSections) {
      rows.push(...section.rows);
    }
    return rows;
  }

  getTalentTabLabel(row: TalentRow): string {
    const labelMap: Record<keyof CharacterBriefDescriptions, string> = {
      combat1: 'Normal Attack',
      combat2: 'Elemental Skill',
      combat3: 'Elemental Burst',
      passive1: 'P1',
      passive2: 'P2',
      passive3: 'P3',
      passive4: 'P4',
      c1: 'C1',
      c2: 'C2',
      c3: 'C3',
      c4: 'C4',
      c5: 'C5',
      c6: 'C6',
    };
    return labelMap[row.key] || row.talent.name;
  }

  getSelectedTalent(): TalentRow | null {
    if (!this.selectedTalentKey) return null;
    return this.getAllTalentRows().find((row) => row.key === this.selectedTalentKey) || null;
  }

  selectTalent(key: keyof CharacterBriefDescriptions) {
    this.selectedTalentKey = key;
    // Update selected section based on talent
    for (const section of this.talentSections) {
      if (section.rows.some((row) => row.key === key)) {
        this.selectedSection = section.label;
        break;
      }
    }
    // Save state
    this.saveState();
  }

  selectSection(sectionLabel: string) {
    this.selectedSection = sectionLabel;
    // Select first talent in the section
    const section = this.talentSections.find((s) => s.label === sectionLabel);
    if (section && section.rows.length > 0) {
      this.selectedTalentKey = section.rows[0].key;
    }
    // Save state
    this.saveState();
  }

  getCurrentSection(): { label: string; rows: TalentRow[] } | null {
    return this.talentSections.find((s) => s.label === this.selectedSection) || null;
  }

  getPresetIconStyle(preset: ColorPreset): Record<string, string> {
    if (!preset.element) {
      return {};
    }

    const iconUrl = this.imageService.getElementIcon(preset.element);
    const elementName = ElementTypeLabel[preset.element].toLowerCase();
    const backgroundColor = `var(--${elementName})`;

    return {
      'background-color': backgroundColor,
      'mask-image': `url(${iconUrl})`,
      '-webkit-mask-image': `url(${iconUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }

  openHyperlinkModal(key: keyof CharacterBriefDescriptions) {
    this.currentTalentKey = key;
    this.modalService.open('hyperlink-editor');
  }

  onEditorTextChange(key: keyof CharacterBriefDescriptions, newText: string): void {
    this.briefDrafts[key] = newText;
    if (!this.selectedCharacter) return;

    // Debounce saving edited description to state service (300ms)
    if (this.editorChangeDebounceTimer) {
      clearTimeout(this.editorChangeDebounceTimer);
    }

    this.pendingEditorChange = {
      characterId: this.selectedCharacter.normalizedName,
      element: this.selectedElement,
      key,
      text: newText,
    };
    this.editorChangeDebounceTimer = setTimeout(() => this.flushPendingEditorChange(), 300);
  }

  private flushPendingEditorChange(): void {
    if (this.editorChangeDebounceTimer) {
      clearTimeout(this.editorChangeDebounceTimer);
      this.editorChangeDebounceTimer = null;
    }

    if (!this.pendingEditorChange) return;

    const { characterId, element, key, text } = this.pendingEditorChange;
    this.pendingEditorChange = null;
    this.stateService.saveEditedDescription(key, text, characterId, element ?? undefined);
  }

  onEditorHyperlinkRequested(
    key: keyof CharacterBriefDescriptions,
    request: HyperlinkRequest
  ): void {
    this.currentTalentKey = key;
    this.currentHyperlinkRequest = request;
    // Set the current character in the insertion service for quick links
    if (this.selectedCharacter) {
      this.insertionService.setCurrentCharacter(this.selectedCharacter.normalizedName);
    }
    this.modalService.open('hyperlink-editor');
  }

  insertHyperlink(hyperlinkId: string | number, displayText?: string, linkType?: 'C' | 'Z') {
    if (!this.currentTalentKey || !this.currentHyperlinkRequest) return;

    const key = this.currentTalentKey;
    this.flushPendingEditorChange();
    this.historyService.flushPending(key);

    const selection = this.currentHyperlinkRequest;
    const value = this.briefDrafts[key] ?? '';
    const start = selection.selectionStart;
    const end = selection.selectionEnd;
    const selected = selection.selectedText || 'Link';

    // Determine link type based on explicit type parameter or ID format
    let linkMarkup: string;
    if (linkType === 'Z') {
      // Type Z link (brief field reference)
      linkMarkup = `{LINK#Z${hyperlinkId}}${selected}{/LINK}`;
    } else {
      // Type C or N link (custom concept or game hyperlink)
      linkMarkup = `{LINK#${hyperlinkId}}${selected}{/LINK}`;
    }

    const newValue = value.slice(0, start) + linkMarkup + value.slice(end);
    this.briefDrafts[key] = newValue;

    // Save the edited description to state
    this.stateService.saveEditedDescription(
      key,
      newValue,
      this.selectedCharacter?.normalizedName,
      this.selectedElement ?? undefined
    );

    // Capture the state change in history
    this.historyService.captureSnapshot(key, newValue, start, start + linkMarkup.length);

    this.modalService.close();
  }
}
