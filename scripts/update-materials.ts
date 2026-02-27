import genshindb from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import { Material, MaterialCraft } from '../src/app/_models/materials';
import { MaterialType } from '../src/app/_models/enum';

const BASE_OUTPUT_PATH = path.join(__dirname, '../src/assets/json/materials');
const BASE_CRAFTS_PATH = path.join(
  __dirname,
  '../src/assets/json/materials/crafts',
);
const CRAFTS_OUTPUT_FILE = path.join(BASE_OUTPUT_PATH, 'crafts.json');
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
    normalizedName: normalize(mat.name),

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

function mapCraft(craft: genshindb.Craft, materialToCraft: genshindb.Material): MaterialCraft {
  return {
    id: materialToCraft.id,

    resultCount: craft.resultCount,
    moraCost: craft.moraCost,
    recipe: craft.recipe.map((r) => ({
      id: r.id,
      name: r.name,
      count: r.count,
    })),
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
  let allCrafts: MaterialCraft[] = [];
  if (await fs.pathExists(CRAFTS_OUTPUT_FILE)) {
    allCrafts = (await fs.readJson(CRAFTS_OUTPUT_FILE)) as MaterialCraft[];
  }

  await processMaterialGroup(
    talentMaterialNames,
    'talent',
    MaterialType.TALENT_MATERIAL,
    allCrafts,
  );
  await processMaterialGroup(
    weaponMaterialNames,
    'weapon',
    MaterialType.WEAPON_MATERIAL,
    allCrafts,
  );
  await processMaterialGroup(
    gemstoneNames,
    'gemstone',
    MaterialType.GEMSTONE,
    allCrafts,
  );
  await processMaterialGroup(
    genericMaterialNames,
    'generic',
    MaterialType.GENERIC_MATERIAL,
    allCrafts,
  );

  await processMaterialGroup(
    bossMaterialNames,
    'boss',
    MaterialType.BOSS_MATERIAL,
    allCrafts,
  );
  await processMaterialGroup(
    localSpecialtyNames,
    'local-specialty',
    MaterialType.LOCAL_SPECIALTY,
    allCrafts,
  );
  await processMaterialGroup(
    moraName.concat(charXPNames, weaponXPNames),
    'xp-and-mora',
    MaterialType.XP_AND_MORA,
    allCrafts,
  );

  await fs.writeJson(CRAFTS_OUTPUT_FILE, allCrafts, { spaces: 2 });
  console.log(`All crafts written to ${CRAFTS_OUTPUT_FILE}`);
}

async function processMaterialGroup(
  names: string[],
  folderName: string,
  materialType: MaterialType,
  allCrafts: MaterialCraft[],
) {
  if (!names || names.length === 0) {
    console.log(`No materials found for ${folderName}`);
    return;
  }

  const materials: Material[] = [];

  const outputPath = path.join(BASE_OUTPUT_PATH, folderName);
  await fs.ensureDir(outputPath);

  let existingMaterials: string[] = [];
  const indexFilePath = path.join(outputPath, 'index.json');

  if (await fs.pathExists(indexFilePath)) {
    existingMaterials = (await fs.readJson(indexFilePath)) as string[];
  } else {
    existingMaterials = [];
  }

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

    materials.push(material);

    const craftRes = genshindb.crafts(name, {
      queryLanguages: [queryLanguage],
    });
    if (craftRes) {
      allCrafts.push(mapCraft(craftRes, materialRes));
    }
  }

  await fs.writeJson(path.join(outputPath, `materials.json`), materials, {
    spaces: 2,
  });

  await fs.writeJson(path.join(outputPath, 'index.json'), normalizedNames, {
    spaces: 2,
  });

  console.log('Update complete.');
}

run().catch((error) => {
  console.error('Error updating materials:', error);
});
