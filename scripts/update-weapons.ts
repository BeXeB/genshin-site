import genshindb from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import { Weapon, WeaponStats } from '../src/app/_models/weapons';
import { StatType, WeaponType } from '../src/app/_models/enum';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/json/weapons');
const queryLanguage = genshindb.Language.English;

const weapons = genshindb.weapons('names', {
  matchCategories: true,
});

function normalize(name: string): string {
  return name.replace(/[\s'"`]+/g, '').toLowerCase();
}

function mapWeapon(weapon: genshindb.Weapon): Weapon {
  return {
    id: weapon.id,
    name: weapon.name,

    description: weapon.description,
    descriptionRaw: weapon.descriptionRaw,

    weaponType: weapon.weaponType as WeaponType,
    weaponText: weapon.weaponText,

    rarity: weapon.rarity,
    story: weapon.story,

    baseAtkValue: weapon.baseAtkValue,
    baseStatText: weapon.baseStatText,

    mainStatType: weapon.mainStatType as StatType,
    mainStatText: weapon.mainStatText,

    effectName: weapon.effectName,
    effectTemplateRaw: weapon.effectTemplateRaw,

    r1: weapon.r1,
    r2: weapon.r2,
    r3: weapon.r3,
    r4: weapon.r4,
    r5: weapon.r5,

    costs: weapon.costs,

    images: weapon.images,

    version: weapon.version,

    stats: {}
  }
}

async function run() {
  if (!weapons) {
    console.error('No weapons found');
    return;
  }

  await fs.ensureDir(OUTPUT_PATH);

  const existingFiles = await fs.readdir(OUTPUT_PATH);

  const existingWeapons = existingFiles
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => f.replace('.json', ''));

  const normalizedNames = weapons.map(normalize);

  const missing = normalizedNames.filter(
    (name) => !existingWeapons.includes(name),
  );

  console.log(`Found ${missing.length} new weapons.`);

  for (const name of missing) {
    let weapon: Weapon;

    console.log(`Downloading ${name}...`);

    const weaponRes = genshindb.weapons(name, {
      queryLanguages: [queryLanguage],
    });

    if (!weaponRes) {
      console.error(`Failed to fetch data for ${name}`);
      continue;
    }

    let weaponStats: WeaponStats = {};

    const rarity: number = weaponRes.rarity;

    const levels: number[] = Array.from({ length: rarity > 2 ? 90 : 70 }, (_, i) => i + 1);
    const ascensionLevels: number[] = rarity > 2 ? [20, 40, 50, 60, 70, 80] : [20, 40, 50, 60];

    for (const level of levels) {
      const stats = weaponRes.stats(level);
      weaponStats[level] = {
        level: level,
        ascension: stats.ascension,
        attack: stats.attack,
        specialized: stats.specialized,
      };
    }

    for (const ascensionLevel of ascensionLevels) {
      const stats = weaponRes.stats(ascensionLevel, '+');
      weaponStats[ascensionLevel + '+'] = {
        level: ascensionLevel,
        ascension: stats.ascension,
        attack: stats.attack,
        specialized: stats.specialized,
      };
    }

    weapon = mapWeapon(weaponRes);
    weapon.stats = weaponStats;

    await fs.writeJson(path.join(OUTPUT_PATH, `${name}.json`), weapon, {
      spaces: 2,
    });
  }

  await fs.writeJson(path.join(OUTPUT_PATH, 'index.json'), normalizedNames, {
    spaces: 2,
  });

  console.log('Update complete.');
}

run().catch((error) => {
  console.error('Error updating weapons:', error);
});
