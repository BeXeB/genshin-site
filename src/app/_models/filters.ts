export type FilterGroup = {
  label: string;
  key: string;
  options: string[];
};

export type PageFilters = {
  [key: string]: string[];
};

export type StoredFilters = {
  filters: PageFilters;
  searchTerm: string;
};
