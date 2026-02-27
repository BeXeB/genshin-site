import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(__dirname, '../raw_icons');
const CHAR_TARGET_DIR = path.join(__dirname, '../src/assets/images/characters');
const PROFILES_FILE = path.join(
  __dirname,
  '../src/assets/json/characters/profiles.json',
);
const CHARACTER_JSON_DIR = path.join(
  __dirname,
  '../src/assets/json/characters',
);

const WEAPON_JSON_DIR = path.join(__dirname, '../src/assets/json/weapons');
const WEAPON_TARGET_DIR = path.join(__dirname, '../src/assets/images/weapons');

const ARTIFACT_JSON_DIR = path.join(__dirname, '../src/assets/json/artifacts');
const ARTIFACT_TARGET_DIR = path.join(
  __dirname,
  '../src/assets/images/artifacts',
);

const MATERIAL_JSON_DIR = path.join(__dirname, '../src/assets/json/materials');
const MATERIAL_TARGET_DIR = path.join(
  __dirname,
  '../src/assets/images/materials',
);

// --- Image mappings ---

const CHARACTER_IMAGE_MAP: Record<string, string> = {
  filename_icon: 'icon.webp',
  filename_iconCard: 'card.webp',
  filename_sideIcon: 'side.webp',
  filename_gachaSplash: 'gacha-splash.webp',
  filename_gachaSlice: 'gacha-icon.webp',
};

const WEAPON_IMAGE_MAP: Record<string, string> = {
  filename_icon: 'icon.webp',
  filename_awakenIcon: 'awaken.webp',
  filename_gacha: 'gacha.webp',
};

const SKILL_IMAGE_MAP: Record<string, string> = {
  filename_combat1: 'combat1.webp',
  filename_combat2: 'combat2.webp',
  filename_combat3: 'combat3.webp',
  filename_passive1: 'passive1.webp',
  filename_passive2: 'passive2.webp',
  filename_passive3: 'passive3.webp',
  filename_passive4: 'passive4.webp',
};

const CONSTELLATION_IMAGE_MAP: Record<string, string> = {
  filename_c1: 'c1.webp',
  filename_c2: 'c2.webp',
  filename_c3: 'c3.webp',
  filename_c4: 'c4.webp',
  filename_c5: 'c5.webp',
  filename_c6: 'c6.webp',
  filename_constellation: 'constellation.webp',
};

const ARTIFACT_IMAGE_MAP: Record<string, string> = {
  filename_flower: 'flower.webp',
  filename_plume: 'plume.webp',
  filename_sands: 'sands.webp',
  filename_goblet: 'goblet.webp',
  filename_circlet: 'circlet.webp',
};

const MATERIAL_IMAGE_MAP: Record<string, string> = {
  filename_icon: 'icon.webp',
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s'"`:\-—]+/g, '');
}

function organize() {
  const profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));

  const lookup: Record<string, string[]> = {};

  for (const profile of profiles) {
    const normalized = normalizeName(profile.name);
    const charFolder = path.join(CHAR_TARGET_DIR, normalized);
    ensureDir(charFolder);

    // --- CHARACTER ICONS ---
    if (profile.images) {
      for (const [jsonKey, filename] of Object.entries(profile.images)) {
        if (CHARACTER_IMAGE_MAP[jsonKey] && filename) {
          const imageName = filename as string;

          if (!lookup[imageName]) {
            lookup[imageName] = [];
          }

          lookup[imageName].push(
            path.join(charFolder, CHARACTER_IMAGE_MAP[jsonKey]),
          );
        }
      }
    }

    // --- LOAD CHARACTER-SPECIFIC JSON ---
    const characterJsonPath = path.join(
      CHARACTER_JSON_DIR,
      `${normalized}.json`,
    );

    if (!fs.existsSync(characterJsonPath)) {
      console.warn(`⚠ Missing JSON for ${normalized}`);
      continue;
    }

    const characterData = JSON.parse(
      fs.readFileSync(characterJsonPath, 'utf-8'),
    );

    // --- SKILLS ---
    if (characterData.skills?.images) {
      const skillFolder = path.join(charFolder, 'skills');
      ensureDir(skillFolder);

      for (const [jsonKey, filename] of Object.entries(
        characterData.skills.images,
      )) {
        if (SKILL_IMAGE_MAP[jsonKey] && filename) {
          const imageName = filename as string;

          if (!lookup[imageName]) {
            lookup[imageName] = [];
          }

          lookup[imageName].push(
            path.join(skillFolder, SKILL_IMAGE_MAP[jsonKey]),
          );
        }
      }
    }

    // --- CONSTELLATIONS ---
    if (characterData.constellation?.images) {
      const constellationFolder = path.join(charFolder, 'constellation');
      ensureDir(constellationFolder);
      for (const [jsonKey, filename] of Object.entries(
        characterData.constellation.images,
      )) {
        if (CONSTELLATION_IMAGE_MAP[jsonKey] && filename) {
          const imageName = filename as string;

          if (!lookup[imageName]) {
            lookup[imageName] = [];
          }

          lookup[imageName].push(
            path.join(constellationFolder, CONSTELLATION_IMAGE_MAP[jsonKey]),
          );
        }
      }
    }
  }

  // ----------------------------
  // WEAPONS
  // ----------------------------

  const weaponFiles = fs.readdirSync(WEAPON_JSON_DIR);

  for (const file of weaponFiles) {
    if (!file.endsWith('.json')) continue;
    if (file === 'index.json') continue;

    const weaponName = path.parse(file).name;
    const weaponJsonPath = path.join(WEAPON_JSON_DIR, file);

    const weaponData = JSON.parse(fs.readFileSync(weaponJsonPath, 'utf-8'));

    const weaponFolder = path.join(WEAPON_TARGET_DIR, weaponName);
    ensureDir(weaponFolder);

    if (weaponData.images) {
      for (const [jsonKey, filename] of Object.entries(weaponData.images)) {
        if (WEAPON_IMAGE_MAP[jsonKey] && filename) {
          const imageName = filename as string;

          if (!lookup[imageName]) {
            lookup[imageName] = [];
          }

          lookup[imageName].push(
            path.join(weaponFolder, WEAPON_IMAGE_MAP[jsonKey]),
          );
        }
      }
    }
  }

  // ----------------------------
  // ARTIFACTS
  // ----------------------------

  const artifactFiles = fs.readdirSync(ARTIFACT_JSON_DIR);

  for (const file of artifactFiles) {
    if (!file.endsWith('.json')) continue;
    if (file === 'index.json') continue;

    const artifactName = path.parse(file).name;
    const artifactJsonPath = path.join(ARTIFACT_JSON_DIR, file);

    const artifactData = JSON.parse(fs.readFileSync(artifactJsonPath, 'utf-8'));

    const artifactFolder = path.join(ARTIFACT_TARGET_DIR, artifactName);
    ensureDir(artifactFolder);

    if (artifactData.images) {
      for (const [jsonKey, filename] of Object.entries(artifactData.images)) {
        if (ARTIFACT_IMAGE_MAP[jsonKey] && filename) {
          const imageName = filename as string;

          if (!lookup[imageName]) {
            lookup[imageName] = [];
          }

          lookup[imageName].push(
            path.join(artifactFolder, ARTIFACT_IMAGE_MAP[jsonKey]),
          );
        }
      }
    }
  }

  // ----------------------------
  // MATERIALS
  // ----------------------------

  const materialFolders = fs
    .readdirSync(MATERIAL_JSON_DIR)
    .filter((f) => fs.statSync(path.join(MATERIAL_JSON_DIR, f)).isDirectory());

  for (const folder of materialFolders) {
    if (folder === 'crafts') continue;

    const folderPath = path.join(MATERIAL_JSON_DIR, folder);
    const materialFiles = fs.readdirSync(folderPath);

    for (const file of materialFiles) {
      if (!file.endsWith('.json')) continue;
      if (file === 'index.json') continue;

      const materialName = path.parse(file).name;
      const materialJsonPath = path.join(folderPath, file);

      const materialData = JSON.parse(
        fs.readFileSync(materialJsonPath, 'utf-8'),
      );

      if (materialData.images) {
        for (const [jsonKey, filename] of Object.entries(materialData.images)) {
          if (MATERIAL_IMAGE_MAP[jsonKey] && filename) {
            const imageName = filename as string;

            if (!lookup[imageName]) {
              lookup[imageName] = [];
            }

            // materialname.webp (not icon.webp)
            lookup[imageName].push(
              path.join(MATERIAL_TARGET_DIR, folder, `${materialName}.webp`),
            );
          }
        }
      }
    }
  }

  // --- COPY FILES ---
  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach((file) => {
    if (!file.endsWith('.webp')) return;

    const nameWithoutExt = path.parse(file).name;
    const destinations = lookup[nameWithoutExt];

    if (destinations && destinations.length > 0) {
      const srcPath = path.join(SOURCE_DIR, file);

      destinations.forEach((destination) => {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(srcPath, destination);

        console.log(
          `Copied ${file} → ${path.relative(CHAR_TARGET_DIR, destination)}`,
        );
      });
    } else {
      console.log(`Skipping ${file} (not referenced in JSON)`);
    }
  });

  console.log('✅ Done organizing all character assets.');
}

organize();
