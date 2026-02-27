import genshindb, { Items } from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import {
  Character,
  CharacterProfile,
  CharacterTalents,
  CharacterConstellation,
  CharacterStats,
  CombatTalent,
  PassiveTalent,
  ConstellationDetail,
} from '../src/app/_models/character';
import { ElementType, QualityType, StatType, WeaponType } from '../src/app/_models/enum';
import { Item } from '../src/app/_models/items';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/json/characters');
const queryLanguage = genshindb.Language.English;
const characters = genshindb.characters('names', {
  matchCategories: true,
});

function normalize(name: string): string {
  return name.replace(/[\s'"`:\-—]+/g, '').toLowerCase();
}

function toWeaponType(value: string): WeaponType {
  return value as WeaponType;
}

function toElementType(value: string): ElementType {
  return value as ElementType;
}

function toQualityType(value: string): QualityType {
  return value as QualityType;
}

function toStatType(value: string): StatType {
  return value as StatType;
}

function mapProfile(profile: genshindb.Character): CharacterProfile {
  return {
    id: profile.id,
    name: profile.name,
    normalizedName: normalize(profile.name),

    title: profile.title,
    description: profile.description,

    weaponType: toWeaponType(profile.weaponType),
    weaponText: profile.weaponText,

    qualityType: toQualityType(profile.qualityType),
    rarity: profile.rarity,

    birthday: profile.birthday,
    birthdaymmdd: profile.birthdaymmdd,

    elementType: toElementType(profile.elementType),
    elementText: profile.elementText,

    affiliation: profile.affiliation,
    region: profile.region,

    substatType: toStatType(profile.substatType),
    substatText: profile.substatText,

    constellation: profile.constellation,

    costs: {
      ascend1: mapItems(profile.costs.ascend1),
      ascend2: mapItems(profile.costs.ascend2),
      ascend3: mapItems(profile.costs.ascend3),
      ascend4: mapItems(profile.costs.ascend4),
      ascend5: mapItems(profile.costs.ascend5),
      ascend6: mapItems(profile.costs.ascend6),
    },

    images: {
      filename_icon: profile.images.filename_icon,
      filename_iconCard: profile.images.filename_iconCard,
      filename_sideIcon: profile.images.filename_sideIcon,
      filename_gachaSplash: profile.images.filename_gachaSplash,
      filename_gachaSlice: profile.images.filename_gachaSlice,
    },
    version: profile.version,
  };
}

function mapItems(item: Items[]): Item[] {
  return item.map(i => ({id: +i.id, name: i.name, count: i.count}));
}

function mapTalents(skills: genshindb.Talent): CharacterTalents {
  let mappedCombatTalents: Record<string, CombatTalent> = {
    combat1: mapCombatTalent(skills.combat1)
  };

  if (skills.combat2) {
    mappedCombatTalents['combat2'] = mapCombatTalent(skills.combat2);
  }

  if (skills.combat3) {
    mappedCombatTalents['combat3'] = mapCombatTalent(skills.combat3);
  }

  let mappedPassiveTalents: Record<string, PassiveTalent> = {
    passive1: mapPassiveTalent(skills.passive1),
    passive2: mapPassiveTalent(skills.passive2),
  };

  if (skills.passive3) {
    mappedPassiveTalents['passive3'] = mapPassiveTalent(skills.passive3);
  }

  if (skills.passive4) {
    mappedPassiveTalents['passive4'] = mapPassiveTalent(skills.passive4);
  }

  return {
    id: skills.id,
    name: skills.name,

    combat1: mappedCombatTalents['combat1'],
    combat2: mappedCombatTalents['combat2'],
    combat3: mappedCombatTalents['combat3'],

    passive1: mappedPassiveTalents['passive1'],
    passive2: mappedPassiveTalents['passive2'],
    passive3: mappedPassiveTalents['passive3'],
    passive4: mappedPassiveTalents['passive4'],

    costs: {
      lvl2: mapItems(skills.costs.lvl2),
      lvl3: mapItems(skills.costs.lvl3),
      lvl4: mapItems(skills.costs.lvl4),
      lvl5: mapItems(skills.costs.lvl5),
      lvl6: mapItems(skills.costs.lvl6),
      lvl7: mapItems(skills.costs.lvl7),
      lvl8: mapItems(skills.costs.lvl8),
      lvl9: mapItems(skills.costs.lvl9),
      lvl10: mapItems(skills.costs.lvl10),
    },

    images: {
      filename_combat1: skills.images?.filename_combat1,
      filename_combat2: skills.images?.filename_combat2,
      filename_combat3: skills.images?.filename_combat3,
      filename_passive1: skills.images?.filename_passive1,
      filename_passive2: skills.images?.filename_passive2,
      filename_passive3: skills.images?.filename_passive3,
      filename_passive4: skills.images?.filename_passive4,
    },
    version: skills.version,
  };
}

function mapCombatTalent(talent: genshindb.CombatTalentDetail): CombatTalent {
  return {
    name: talent.name,
    description: talent.description,
    descriptionRaw: talent.descriptionRaw,
    attributes: {
      labels: talent.attributes.labels,
      parameters: talent.attributes.parameters,
    },
  };
}

function mapPassiveTalent(talent: genshindb.PassiveTalentDetail): PassiveTalent {
  return {
    name: talent.name,
    descriptionRaw: talent.descriptionRaw,
    description: talent.description,
  };
}

function mapConstellation(
  constellation: genshindb.Constellation,
): CharacterConstellation {
  return {
    id: constellation.id,
    name: constellation.name,

    c1: mapConstellationDetail(constellation.c1),
    c2: mapConstellationDetail(constellation.c2),
    c3: mapConstellationDetail(constellation.c3),
    c4: mapConstellationDetail(constellation.c4),
    c5: mapConstellationDetail(constellation.c5),
    c6: mapConstellationDetail(constellation.c6),

    images: {
      filename_c1: constellation.images.filename_c1,
      filename_c2: constellation.images.filename_c2,
      filename_c3: constellation.images.filename_c3,
      filename_c4: constellation.images.filename_c4,
      filename_c5: constellation.images.filename_c5,
      filename_c6: constellation.images.filename_c6,
      filename_constellation: constellation.images.filename_constellation,
    },
    version: constellation.version,
  };
}

function mapConstellationDetail(
  constellation: genshindb.ConstellationDetail,
): ConstellationDetail {
  return {
    name: constellation.name,
    descriptionRaw: constellation.descriptionRaw,
    description: constellation.description,
  };
}

async function run(): Promise<void> {
  if (!characters) {
    console.error('No characters found');
    return;
  }

  await fs.ensureDir(OUTPUT_PATH);

  const existingFiles = await fs.readdir(OUTPUT_PATH);

  const existingCharacters = existingFiles
    .filter(
      (f) => f.endsWith('.json') && f !== 'index.json' && f !== 'profiles.json',
    )
    .map((f) => f.replace('.json', ''));


  const normalizedNames = characters.map(normalize);

  const missing = normalizedNames.filter(
    (name) => !existingCharacters.includes(name),
  );

  console.log(`Found ${missing.length} new characters.`);

  const allProfiles: CharacterProfile[] = [];

  for (const name of normalizedNames) {
    let character: Character;

    if (missing.includes(name)) {
      console.log(`Downloading ${name}...`);

      const [profileRes, skillsRes, constellationRes] = await Promise.all([
        Promise.resolve(
          genshindb.characters(name, { queryLanguages: [queryLanguage] }),
        ),
        Promise.resolve(
          genshindb.talents(name, { queryLanguages: [queryLanguage] }),
        ),
        Promise.resolve(
          genshindb.constellations(name, { queryLanguages: [queryLanguage] }),
        ),
      ]);

      if (!profileRes) {
        console.error(`Failed to fetch data for ${name}`);
        continue;
      }

      let characterStats: CharacterStats = {};
      const levels: number[] = Array.from({ length: 90 }, (_, i) => i + 1);
      levels.push(95);
      levels.push(100);
      const ascensionLevels: number[] = [20, 40, 50, 60, 70, 80];

      for (const level of levels) {
        const stats = profileRes.stats(level);
        characterStats[level] = {
          level: level,
          ascension: stats.ascension,
          hp: stats.hp,
          attack: stats.attack,
          defense: stats.defense,
          specialized: stats.specialized,
        };
      }

      for (const ascensionLevel of ascensionLevels) {
        const stats = profileRes.stats(ascensionLevel, "+");
        characterStats[ascensionLevel + "+"] = {
          level: ascensionLevel,
          ascension: stats.ascension,
          hp: stats.hp,
          attack: stats.attack,
          defense: stats.defense,
          specialized: stats.specialized,
        };
      }

      let skills: CharacterTalents | undefined = undefined;
      let constellations: CharacterConstellation | undefined = undefined;

      if (skillsRes) {
        skills = mapTalents(skillsRes);
      }

      if (constellationRes) {
        constellations = mapConstellation(constellationRes);
      }

      character = {
        profile: mapProfile(profileRes),
        skills: skills,
        constellation: constellations,
        stats: characterStats,
      };

      await fs.writeJson(path.join(OUTPUT_PATH, `${name}.json`), character, {
        spaces: 2,
      });
    } else {
      character = await fs.readJson(path.join(OUTPUT_PATH, `${name}.json`));
    }
    allProfiles.push(character.profile);
  }

  await fs.writeJson(path.join(OUTPUT_PATH, 'index.json'), normalizedNames, {
    spaces: 2,
  });

  await fs.writeJson(path.join(OUTPUT_PATH, 'profiles.json'), allProfiles, {
    spaces: 2,
  });

  console.log('Update complete.');
}

run().catch((error) => {
  console.error('Error updating characters:', error);
});
