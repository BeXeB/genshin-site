import fs from "fs";
import path from "path";

const CHARACTER_JSON_DIR = path.join(
  __dirname,
  "../src/assets/json/characters"
);

const ASSET_DIR = path.join(
  __dirname,
  "../src/assets/images/characters"
);

const SKILL_IMAGE_MAP: Record<string, string> = {
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
};

function check() {
  const files = fs.readdirSync(CHARACTER_JSON_DIR);

  let missingCount = 0;

  files.forEach((file) => {
    if (!file.endsWith(".json")) return;
    if (file === "profiles.json" || file === "index.json") return;

    const characterName = path.parse(file).name;

    const jsonPath = path.join(CHARACTER_JSON_DIR, file);
    const characterData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    const skillDir = path.join(ASSET_DIR, characterName, "skills");
    const constellationDir = path.join(
      ASSET_DIR,
      characterName,
      "constellation"
    );

    // --- SKILLS ---
    if (characterData.skills?.images) {
      for (const [jsonKey, outputFile] of Object.entries(SKILL_IMAGE_MAP)) {
        const originalName = characterData.skills.images[jsonKey];
        if (!originalName) continue;

        const expectedPath = path.join(skillDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ ${characterName}/skills/${outputFile}  (JSON: ${originalName}.png)`
          );
          missingCount++;
        }
      }
    }

    // --- CONSTELLATIONS ---
    if (characterData.constellation?.images) {
      for (const [jsonKey, outputFile] of Object.entries(
        CONSTELLATION_IMAGE_MAP
      )) {
        const originalName = characterData.constellation.images[jsonKey];
        if (!originalName) continue;

        const expectedPath = path.join(constellationDir, outputFile);

        if (!fs.existsSync(expectedPath)) {
          console.log(
            `❌ ${characterName}/constellation/${outputFile}  (JSON: ${originalName}.png)`
          );
          missingCount++;
        }
      }
    }
  });

  if (missingCount === 0) {
    console.log("✅ No missing images found.");
  } else {
    console.log(`\n⚠ Total missing images: ${missingCount}`);
  }
}

check();
