import fs from 'fs';
import path from 'path';

const CHARACTER_JSON_DIR = path.join(
  __dirname,
  '../src/assets/json/characters',
);
const WEAPON_JSON_DIR = path.join(__dirname, '../src/assets/json/weapons');
const ARTIFACT_JSON_DIR = path.join(__dirname, '../src/assets/json/artifacts');
const MATERIAL_JSON_DIR = path.join(__dirname, '../src/assets/json/materials');

const ASSET_DIR_CHAR = path.join(__dirname, '../src/assets/images/characters');
const ASSET_DIR_WEAPONS = path.join(__dirname, '../src/assets/images/weapons');
const ASSET_DIR_ARTIFACTS = path.join(
  __dirname,
  '../src/assets/images/artifacts',
);
const ASSET_DIR_MATERIALS = path.join(
  __dirname,
  '../src/assets/images/materials',
);

const materialFolders = fs
  .readdirSync(MATERIAL_JSON_DIR)
  .filter((f) => fs.statSync(path.join(MATERIAL_JSON_DIR, f)).isDirectory());

const SKILL_IMAGE_MAP: Record<string, string> = {
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
};

const PROFILE_IMAGE_MAP: Record<string, string> = {
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

const ARTIFACT_IMAGE_MAP: Record<string, string> = {
  filename_flower: 'flower.webp',
  filename_plume: 'plume.webp',
  filename_sands: 'sands.webp',
  filename_goblet: 'goblet.webp',
  filename_circlet: 'circlet.webp',
};

const IGNORE_MISSING: Set<string> = new Set([
  'manekin/card.webp',
  'manekin/gacha-splash.webp',
  'manekin/gacha-icon.webp',
  'manekina/card.webp',
  'manekina/gacha-splash.webp',
  'manekina/gacha-icon.webp',
]);

function check() {
  const characterFiles = fs.readdirSync(CHARACTER_JSON_DIR);

  let missingCount = 0;

  characterFiles.forEach((file) => {
    if (!file.endsWith('.json')) return;
    if (file === 'profiles.json' || file === 'index.json') return;

    const characterName = path.parse(file).name;

    const jsonPath = path.join(CHARACTER_JSON_DIR, file);
    const characterData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const skillDir = path.join(ASSET_DIR_CHAR, characterName, 'skills');
    const constellationDir = path.join(
      ASSET_DIR_CHAR,
      characterName,
      'constellation',
    );

    // --- PROFILE IMAGES ---
    if (characterData.profile?.images) {
      const profileDir = path.join(ASSET_DIR_CHAR, characterName);

      for (const [jsonKey, outputFile] of Object.entries(PROFILE_IMAGE_MAP)) {
        const originalName =
          characterData.profile.images[
            jsonKey as keyof typeof characterData.profile.images
          ];
        if (!originalName) continue;

        const expectedPath = path.join(profileDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          const key = `${characterName}/${outputFile}`;

          if (!IGNORE_MISSING.has(key)) {
            console.log(
              `❌ ${characterName}/${outputFile}  (JSON: ${originalName}.webp)`,
            );
            missingCount++;
          }
        }
      }
    }

    // --- SKILLS ---
    if (characterData.skills?.images) {
      for (const [jsonKey, outputFile] of Object.entries(SKILL_IMAGE_MAP)) {
        const originalName = characterData.skills.images[jsonKey];
        if (!originalName) continue;

        const expectedPath = path.join(skillDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ ${characterName}/skills/${outputFile}  (JSON: ${originalName}.webp)`,
          );
          missingCount++;
        }
      }
    }

    // --- CONSTELLATIONS ---
    if (characterData.constellation?.images) {
      for (const [jsonKey, outputFile] of Object.entries(
        CONSTELLATION_IMAGE_MAP,
      )) {
        const originalName = characterData.constellation.images[jsonKey];
        if (!originalName) continue;

        const expectedPath = path.join(constellationDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ ${characterName}/constellation/${outputFile}  (JSON: ${originalName}.webp)`,
          );
          missingCount++;
        }
      }
    }
  });

  // --- WEAPONS ---

  const weaponFiles = fs.readdirSync(WEAPON_JSON_DIR);

  weaponFiles.forEach((file) => {
    if (!file.endsWith('.json')) return;
    if (file === 'index.json') return;

    const weaponName = path.parse(file).name;

    const jsonPath = path.join(WEAPON_JSON_DIR, file);
    const weaponData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const weaponDir = path.join(ASSET_DIR_WEAPONS, weaponName);

    if (weaponData.images) {
      for (const [jsonKey, outputFile] of Object.entries(WEAPON_IMAGE_MAP)) {
        const originalName =
          weaponData.images[jsonKey as keyof typeof weaponData.images];

        if (!originalName) continue;

        const expectedPath = path.join(weaponDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ weapons/${weaponName}/${outputFile}  (JSON: ${originalName}.webp)`,
          );
          missingCount++;
        }
      }
    }
  });

  // --- ARTIFACTS ---

  const artifactFiles = fs.readdirSync(ARTIFACT_JSON_DIR);

  artifactFiles.forEach((file) => {
    if (!file.endsWith('.json')) return;
    if (file === 'index.json') return;

    const artifactName = path.parse(file).name;

    const jsonPath = path.join(ARTIFACT_JSON_DIR, file);
    const artifactData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const artifactDir = path.join(ASSET_DIR_ARTIFACTS, artifactName);

    if (artifactData.images) {
      for (const [jsonKey, outputFile] of Object.entries(ARTIFACT_IMAGE_MAP)) {
        const originalName =
          artifactData.images[jsonKey as keyof typeof artifactData.images];

        if (!originalName) continue;

        const expectedPath = path.join(artifactDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ artifacts/${artifactName}/${outputFile}  (JSON: ${originalName}.webp)`,
          );
          missingCount++;
        }
      }
    }
  });

  // materials

  materialFolders.forEach((folder) => {
    // skip crafts folder
    if (folder === 'crafts') return;

    const folderPath = path.join(MATERIAL_JSON_DIR, folder);
    const materialFiles = fs.readdirSync(folderPath);

    materialFiles.forEach((file) => {
      if (!file.endsWith('.json')) return;
      if (file === 'index.json') return;

      const materialName = path.parse(file).name;

      const jsonPath = path.join(folderPath, file);
      const materialData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const originalName = materialData.images?.filename_icon;
      if (!originalName) return;

      const expectedPath = path.join(
        ASSET_DIR_MATERIALS,
        folder,
        `${materialName}.webp`,
      );

      if (!fs.existsSync(expectedPath)) {
        console.log(
          `❌ materials/${folder}/${materialName}.webp  (JSON: ${originalName}.webp)`,
        );
        missingCount++;
      }
    });
  });

  if (missingCount === 0) {
    console.log('✅ No missing images found.');
  } else {
    console.log(`\n⚠ Total missing images: ${missingCount}`);
  }
}

check();
