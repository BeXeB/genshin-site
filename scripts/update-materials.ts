import genshindb from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import {
  CraftIngredient,
  Material,
  MaterialCraft,
} from '../src/app/_models/materials';
import { MaterialType } from '../src/app/_models/enum';

const BASE_OUTPUT_PATH = path.join(__dirname, '../src/assets/json/materials');
const BASE_CRAFTS_PATH = path.join(
  __dirname,
  '../src/assets/json/materials/crafts',
);
const queryLanguage = genshindb.Language.English;
genshindb.setOptions({
  queryLanguages: [queryLanguage],
  resultLanguage: queryLanguage,
});

function normalize(name: string): string {
  return name.replace(/[\s'"`:\-—]+/g, '').toLowerCase();
}

function getMaterialNames(category: string): string[] {
  const result = genshindb.materials(category, {
    matchCategories: true,
  });

  if (!result) return [];

  return Array.isArray(result)
    ? result.filter((x): x is string => typeof x === 'string')
    : [];
}

function mapMaterial(mat: genshindb.Material, type: MaterialType): Material {
  return {
    id: mat.id,
    name: mat.name,

    rarity: mat.rarity,
    sortRank: mat.sortRank,
    description: mat.description,

    type: type,
    typeText: mat.typeText,

    dropDomainName: mat.dropDomainName,
    daysOfWeek: mat.daysOfWeek,

    images: {
      filename_icon: mat.images.filename_icon,
    },
  };
}

function mapCraft(craft: genshindb.Craft): MaterialCraft {
  return {
    id: craft.id,

    resultCount: craft.resultCount,
    moraCost: craft.moraCost,
    recipe: craft.recipe.map((r) => ({ id: r.id, count: r.count })),
  };
}

const nations: string[] = [
  'Mondstadt',
  'Liyue',
  'Inazuma',
  'Sumeru',
  'Fontaine',
  'Natlan',
  'Nod-Krai',
];

// local specialties
const localSpecialtyNames = nations.flatMap((n) =>
  getMaterialNames(`Local Specialty (${n})`),
);

// talent books
const talentMaterialNames = getMaterialNames('Character Talent Material');

//boss materials
const bossMaterialNames = getMaterialNames('Character Level-Up Material');

//gemstone materials
const gemstoneNames = getMaterialNames('Character Ascension Material');

// weapon materials
const weaponMaterialNames = getMaterialNames('Weapon Ascension Material');

//generic materials
const genericMaterialNames = getMaterialNames(
  'Character and Weapon Enhancement Material',
);

//mora
const moraName = getMaterialNames('Common Currency');

// char xp
const charXPNames = getMaterialNames('Character EXP Material');

// weapon xp names
const weaponXPNames = getMaterialNames('Weapon Enhancement Material');

async function run() {
  await processMaterialGroup(
    talentMaterialNames,
    'talent',
    MaterialType.TALENT_MATERIAL,
    true,
  );
  await processMaterialGroup(
    weaponMaterialNames,
    'weapon',
    MaterialType.WEAPON_MATERIAL,
    true,
  );
  await processMaterialGroup(
    gemstoneNames,
    'gemstone',
    MaterialType.GEMSTONE,
    true,
  );
  await processMaterialGroup(
    genericMaterialNames,
    'generic',
    MaterialType.GENERIC_MATERIAL,
    true,
  );

  await processMaterialGroup(
    bossMaterialNames,
    'boss',
    MaterialType.BOSS_MATERIAL,
  );
  await processMaterialGroup(
    localSpecialtyNames,
    'local-specialty',
    MaterialType.LOCAL_SPECIALTY,
  );
  await processMaterialGroup(moraName, 'xp-and-mora', MaterialType.MORA);
  await processMaterialGroup(
    charXPNames,
    'xp-and-mora',
    MaterialType.CHARACTER_XP,
  );
  await processMaterialGroup(
    weaponXPNames,
    'xp-and-mora',
    MaterialType.WEAPON_XP,
  );
}

async function processMaterialGroup(
  names: string[],
  folderName: string,
  materialType: MaterialType,
  generateCrafts = false,
) {
  if (!names || names.length === 0) {
    console.log(`No materials found for ${folderName}`);
    return;
  }

  const outputPath = path.join(BASE_OUTPUT_PATH, folderName);
  const craftPath = path.join(BASE_CRAFTS_PATH, folderName);
  await fs.ensureDir(outputPath);

  if (generateCrafts) {
    await fs.ensureDir(craftPath);
  }

  const existingFiles = await fs.readdir(outputPath);
  const existingMaterials = existingFiles
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => f.replace('.json', ''));

  const normalizedNames = names.map(normalize);

  const missing = normalizedNames.filter(
    (name) => !existingMaterials.includes(name),
  );

  console.log(`Found ${missing.length} new materials in ${folderName}.`);

  for (const name of missing) {
    let material: Material;

    console.log(`Downloading ${name}...`);

    const materialRes = genshindb.materials(name, {
      queryLanguages: [queryLanguage],
    });

    if (!materialRes) {
      console.error(`Failed to fetch data for ${name}`);
      continue;
    }

    material = mapMaterial(materialRes, materialType);

    await fs.writeJson(path.join(outputPath, `${name}.json`), material, {
      spaces: 2,
    });

    // Handle crafts if required
    if (generateCrafts) {
      let craft: MaterialCraft;

      const craftRes = genshindb.crafts(name, {
        queryLanguages: [queryLanguage],
      });

      if (craftRes) {
        craft = mapCraft(craftRes);

        await fs.writeJson(path.join(craftPath, `${name}.json`), craft, {
          spaces: 2,
        });
      }
    }
  }

  await fs.writeJson(path.join(outputPath, 'index.json'), normalizedNames, {
      spaces: 2,
    });

  console.log('Update complete.');
}

run().catch((error) => {
  console.error('Error updating materials:', error);
});

// save each type of material into separate folders
// for talent/weapon/gemstone/generic materials fill out the crafts json as well
// if a craft returns undefined it doesnt exist and its the smallest verison of the item
