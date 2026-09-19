/**
 * Centralized storage key constants
 * Prevents string duplication and makes keys type-safe
 */
export const StorageKeys = {
  // List page filters
  CHARACTER_FILTERS: 'characterFilters',
  WEAPON_FILTERS: 'weaponFilters',
  ARTIFACT_FILTERS: 'artifactFilters',
  MATERIAL_FILTERS: 'materialFilter',
  // Tierlist data
  TIERLIST_DATA: 'tierlistData',
  // User settings
  SETTINGS: 'settings',
  // Editor data
  TALENT_EDITOR_STATE: 'talentEditorState',
  CUSTOM_HYPERLINKS: 'customHyperlinks',
  DELETED_CUSTOM_HYPERLINK_IDS: 'deletedCustomHyperlinkIds',
} as const;
