import fs from "fs";
import path from "path";

const SOURCE_DIR = path.join(__dirname, "../raw_icons");
const TARGET_DIR = path.join(__dirname, "../src/assets/images/characters");
const PROFILES_FILE = path.join(
  __dirname,
  "../src/assets/json/characters/profiles.json"
);
const CHARACTER_JSON_DIR = path.join(
  __dirname,
  "../src/assets/json/characters"
);

// --- Image mappings ---

const CHARACTER_IMAGE_MAP: Record<string, string> = {
  filename_icon: "icon.png",
  filename_iconCard: "card.png",
  filename_sideIcon: "side.png",
  filename_gachaSplash: "gacha-splash.png",
  filename_gachaSlice: "gacha-icon.png",
};

const SKILL_IMAGE_MAP: Record<string, string> = {
  filename_combat1: "combat1.png",
  filename_combat2: "combat2.png",
  filename_combat3: "combat3.png",
  filename_passive1: "passive1.png",
  filename_passive2: "passive2.png",
  filename_passive3: "passive3.png",
  filename_passive4: "passive4.png",
};

const CONSTELLATION_IMAGE_MAP: Record<string, string> = {
  filename_c1: "c1.png",
  filename_c2: "c2.png",
  filename_c3: "c3.png",
  filename_c4: "c4.png",
  filename_c5: "c5.png",
  filename_c6: "c6.png",
  filename_constellation: "constellation.png",
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "");
}

function organize() {
  const profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));

  const lookup: Record<string, string> = {};

  for (const profile of profiles) {
    const normalized = normalizeName(profile.name);
    const charFolder = path.join(TARGET_DIR, normalized);
    ensureDir(charFolder);

    // --- CHARACTER ICONS ---
    if (profile.images) {
      for (const [key, filename] of Object.entries(profile.images)) {
        if (CHARACTER_IMAGE_MAP[key] && filename) {
          lookup[filename as string] = path.join(
            charFolder,
            CHARACTER_IMAGE_MAP[key]
          );
        }
      }
    }

    // --- LOAD CHARACTER-SPECIFIC JSON ---
    const characterJsonPath = path.join(
      CHARACTER_JSON_DIR,
      `${normalized}.json`
    );

    if (!fs.existsSync(characterJsonPath)) {
      console.warn(`⚠ Missing JSON for ${normalized}`);
      continue;
    }

    const characterData = JSON.parse(
      fs.readFileSync(characterJsonPath, "utf-8")
    );

    // --- SKILLS ---
    if (characterData.skills?.images) {
      const skillFolder = path.join(charFolder, "skills");
      ensureDir(skillFolder);

      for (const [key, filename] of Object.entries(
        characterData.skills.images
      )) {
        if (SKILL_IMAGE_MAP[key] && filename) {
          lookup[filename as string] = path.join(
            skillFolder,
            SKILL_IMAGE_MAP[key]
          );
        }
      }
    }

    // --- CONSTELLATIONS ---
    if (characterData.constellation?.images) {
      const constellationFolder = path.join(charFolder, "constellation");
      ensureDir(constellationFolder);

      for (const [key, filename] of Object.entries(
        characterData.constellation.images
      )) {
        if (CONSTELLATION_IMAGE_MAP[key] && filename) {
          lookup[filename as string] = path.join(
            constellationFolder,
            CONSTELLATION_IMAGE_MAP[key]
          );
        }
      }
    }
  }

  // --- MOVE FILES ---
  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach((file) => {
    if (!file.endsWith(".png")) return;

    const nameWithoutExt = path.parse(file).name;
    const destination = lookup[nameWithoutExt];

    if (destination) {
      const srcPath = path.join(SOURCE_DIR, file);
      fs.renameSync(srcPath, destination);
      console.log(
        `Moved ${file} → ${path.relative(TARGET_DIR, destination)}`
      );
    } else {
      console.log(`Skipping ${file} (not referenced in JSON)`);
    }
  });

  console.log("✅ Done organizing all character assets.");
}

organize();
