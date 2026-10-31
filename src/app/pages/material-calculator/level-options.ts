/** Level cap for each ascension (index = ascension), e.g. ascension 1 caps at level 40 */
export const LEVEL_CAP_BY_ASCENSION = [20, 40, 50, 60, 70, 80, 90];

/** Levels where an ascension is required; shown in dropdowns as e.g. "20+" */
const ASCENSION_CAPS = LEVEL_CAP_BY_ASCENSION.slice(0, -1);

/** Level dropdown values from 1 to maxLevel; ascension caps are shown as e.g. "20+" */
export function buildLevelOptions(maxLevel: number): (number | string)[] {
  const options: (number | string)[] = [];
  for (let level = 1; level <= maxLevel; level++) {
    options.push(level);
    if (ASCENSION_CAPS.includes(level) && level < maxLevel) {
      options.push(`${level}+`);
    }
  }
  return options;
}
