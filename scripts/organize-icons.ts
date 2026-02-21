import fs from "fs";
import path from "path";

const SOURCE_DIR = path.join(__dirname, "../raw_icons");
const TARGET_DIR = path.join(__dirname, "../src/assets/images/characters");
const PROFILES_FILE = path.join(__dirname, "../src/assets/json/characters/profiles.json");

// Map image keys in profiles.json → target filename
const IMAGE_MAP: { [key: string]: string } = {
  filename_icon: "icon.png",
  filename_iconCard: "card.png",
  filename_sideIcon: "side.png",
  filename_gachaSplash: "gacha-splash.png",
  filename_gachaSlice: "gacha-icon.png",
};

interface ProfileImages {
  [key: string]: string;
}

interface CharacterProfile {
  name: string;
  images: ProfileImages;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "");
}

function organize() {
  const profiles: CharacterProfile[] = JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));

  // Build a lookup of filename (without extension) → { characterFolder, targetFilename }
  const lookup: { [key: string]: { folder: string; target: string } } = {};

  for (const profile of profiles) {
    const folder = path.join(TARGET_DIR, normalizeName(profile.name));
    ensureDir(folder);

    for (const [key, filename] of Object.entries(profile.images)) {
      if (IMAGE_MAP[key] && filename) {
        lookup[filename] = { folder, target: IMAGE_MAP[key] };
      }
    }
  }

  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach((file) => {
    if (!file.endsWith(".png")) return;

    const nameWithoutExt = path.parse(file).name; // strip .png
    const info = lookup[nameWithoutExt];

    if (info) {
      const srcPath = path.join(SOURCE_DIR, file);
      const dstPath = path.join(info.folder, info.target);

      fs.renameSync(srcPath, dstPath);
      console.log(`Moved ${file} → ${path.relative(TARGET_DIR, dstPath)}`);
    } else {
      console.log(`Skipping ${file} (not in profiles.json)`);
    }
  });

  console.log("✅ Done organizing character icons.");
}

organize();
