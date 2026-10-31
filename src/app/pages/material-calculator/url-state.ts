import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElementType, ElementTypeLabel } from '../../_models/enum';

/** URL form of an element, e.g. ELEMENT_ANEMO becomes "anemo" */
export function getElementUrlName(element: ElementType): string {
  return ElementTypeLabel[element].toLowerCase();
}

/** Reverse of getElementUrlName; undefined when the name matches no element */
export function getElementFromUrlName(name: string | null): ElementType | undefined {
  return Object.values(ElementType).find((element) => getElementUrlName(element) === name);
}

/**
 * Replaces the query string of the current history entry without a router navigation.
 * A router navigation would scroll the page to the top; this keeps the scroll position.
 * Null and undefined values are dropped, so `{ weapon: null }` clears the parameter.
 */
export function replaceQueryParams(
  router: Router,
  location: Location,
  route: ActivatedRoute,
  queryParams: Params,
): void {
  const cleaned: Params = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  const url = router.serializeUrl(
    router.createUrlTree([], { relativeTo: route, queryParams: cleaned }),
  );
  // Keep the router's history state so Back still restores the earlier entry
  location.replaceState(url, '', location.getState());
}
