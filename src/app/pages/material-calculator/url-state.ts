import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

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
