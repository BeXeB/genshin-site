// character type changed, need to add all the missing fields

import fs from 'fs-extra';
import path from 'path';
import genshindb from 'genshin-db';
import { Character } from '../src/app/_models/character';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/json/characters');
const queryLanguage = genshindb.Language.English;

function normalize(name: string): string {
  return name.replace(/[\s'"`]+/g, '').toLowerCase();
}

// Helper to update raw descriptions in talents/constellations
function updateTalentRaw(target: any, source: any) {
  if (!source) return target;
  target = target || {};
  Object.keys(source).forEach((key) => {
    if (!source[key]) return;
    target[key] = target[key] || {};
    if (!target[key].descriptionRaw) {
      target[key].descriptionRaw = source[key].descriptionRaw;
    }
  });
  return target;
}

async function runPatch() {
  const files = (await fs.readdir(OUTPUT_PATH)).filter(
    (f) => f.endsWith('.json') && f !== 'index.json' && f !== 'profiles.json'
  );

  for (const file of files) {
    const filePath = path.join(OUTPUT_PATH, file);
    const character: Character = await fs.readJson(filePath);
    const name = character.profile?.name || path.parse(file).name;

    // Fetch fresh genshin-db data
    const [profileRes, skillsRes, constellationsRes] = await Promise.all([
      Promise.resolve(genshindb.characters(name, { queryLanguages: [queryLanguage] })),
      Promise.resolve(genshindb.talents(name, { queryLanguages: [queryLanguage] })),
      Promise.resolve(genshindb.constellations(name, { queryLanguages: [queryLanguage] })),
    ]);

    if (!profileRes) continue;

    // --- normalized name ---
    if (!character.profile.normalizedName) {
      character.profile.normalizedName = normalize(profileRes.name);
    }

    // --- update skills descriptionRaw ---
    if (skillsRes) {
      character.skills = updateTalentRaw(character.skills, skillsRes);
    }

    // --- update constellations descriptionRaw ---
    if (constellationsRes) {
      character.constellation = updateTalentRaw(character.constellation, constellationsRes);
    }

    // Save updated JSON
    await fs.writeJson(filePath, character, { spaces: 2 });
    console.log(`Patched ${file}`);
  }

  console.log('✅ All character JSONs patched with normalized names and raw fields.');
}

runPatch().catch((err) => console.error(err));
