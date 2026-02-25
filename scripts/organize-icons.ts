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

// --- Image mappings ---

const CHARACTER_IMAGE_MAP: Record<string, string> = {
  filename_icon: 'icon.png',
  filename_iconCard: 'card.png',
  filename_sideIcon: 'side.png',
  filename_gachaSplash: 'gacha-splash.png',
  filename_gachaSlice: 'gacha-icon.png',
};

const WEAPON_IMAGE_MAP: Record<string, string> = {
  filename_icon: 'icon.png',
  filename_awakenIcon: 'awaken.png',
  filename_gacha: 'gacha.png',
};

const SKILL_IMAGE_MAP: Record<string, string> = {
  filename_combat1: 'combat1.png',
  filename_combat2: 'combat2.png',
  filename_combat3: 'combat3.png',
  filename_passive1: 'passive1.png',
  filename_passive2: 'passive2.png',
  filename_passive3: 'passive3.png',
  filename_passive4: 'passive4.png',
};

const CONSTELLATION_IMAGE_MAP: Record<string, string> = {
  filename_c1: 'c1.png',
  filename_c2: 'c2.png',
  filename_c3: 'c3.png',
  filename_c4: 'c4.png',
  filename_c5: 'c5.png',
  filename_c6: 'c6.png',
  filename_constellation: 'constellation.png',
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s'"`]+/g, '');
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

  // --- COPY FILES ---
  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach((file) => {
    if (!file.endsWith('.png')) return;

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
