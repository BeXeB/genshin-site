import genshindb from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import {
  Character,
  CharacterProfile,
  CharacterSkills,
  CharacterConstellation,
  CharacterStats,
  CombatSkill,
  PassiveSkill,
  ConstellationSkill,
} from '../src/app/_models/character';
import { ElementType, QualityType, WeaponType } from '../src/app/_models/enum';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/json/characters');
const queryLanguage = genshindb.Language.English;
const characters = genshindb.characters('names', {
  matchCategories: true,
});

function normalize(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase();
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

function mapProfile(profile: genshindb.Character): CharacterProfile {
  return {
    id: profile.id,
    name: profile.name,

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

    substatType: profile.substatType,
    substatText: profile.substatText,

    constellation: profile.constellation,
    costs: profile.costs,

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

function mapSkills(skills: genshindb.Talent): CharacterSkills {
  let mappedCombatSkills: Record<string, CombatSkill> = {
    combat1: mapCombatSkill(skills.combat1)
  };

  if (skills.combat2) {
    mappedCombatSkills['combat2'] = mapCombatSkill(skills.combat2);
  }

  if (skills.combat3) {
    mappedCombatSkills['combat3'] = mapCombatSkill(skills.combat3);
  }

  let mappedPassiveSkills: Record<string, PassiveSkill> = {
    passive1: mapPassiveSkill(skills.passive1),
    passive2: mapPassiveSkill(skills.passive2),
  };

  if (skills.passive3) {
    mappedPassiveSkills['passive3'] = mapPassiveSkill(skills.passive3);
  }

  if (skills.passive4) {
    mappedPassiveSkills['passive4'] = mapPassiveSkill(skills.passive4);
  }

  return {
    id: skills.id,
    name: skills.name,

    combat1: mappedCombatSkills['combat1'],
    combat2: mappedCombatSkills['combat2'],
    combat3: mappedCombatSkills['combat3'],

    passive1: mappedPassiveSkills['passive1'],
    passive2: mappedPassiveSkills['passive2'],
    passive3: mappedPassiveSkills['passive3'],
    passive4: mappedPassiveSkills['passive4'],

    costs: skills.costs,

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

function mapCombatSkill(skill: genshindb.CombatTalentDetail): CombatSkill {
  return {
    name: skill.name,
    description: skill.description,
    attributes: {
      labels: skill.attributes.labels,
      parameters: skill.attributes.parameters,
    },
  };
}

function mapPassiveSkill(skill: genshindb.PassiveTalentDetail): PassiveSkill {
  return {
    name: skill.name,
    description: skill.description,
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
): ConstellationSkill {
  return {
    name: constellation.name,
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
        console.error('Profile:', profileRes);
        continue;
      }

      let characterStats: CharacterStats = {};
      const levels: number[] = Array.from({ length: 90 }, (_, i) => i + 1);
      levels.push(95);
      levels.push(100);
      const ascensionLevels = [20, 40, 50, 60, 70, 80];

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

      let skills: CharacterSkills | undefined = undefined;
      let constellations: CharacterConstellation | undefined = undefined;

      if (skillsRes) {
        skills = mapSkills(skillsRes);
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
