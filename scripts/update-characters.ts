import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

import {
  Character,
  CharacterProfile,
  CharacterSkills,
  CharacterConstellation,
  CharacterStats,
} from '../src/app/_models/character';

const API_BASE = 'https://genshin-db-api.vercel.app/api/v5';

const OUTPUT_PATH = path.join(
  __dirname,
  '../src/assets/json/characters'
);

function normalize(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase();
}

async function run(): Promise<void> {
  console.log('Fetching character names...');

  const { data: names } = await axios.get<string[]>(
    `${API_BASE}/characters?query=names&matchCategories=true&resultLanguage=english`
  );

  await fs.ensureDir(OUTPUT_PATH);

  const existingFiles = await fs.readdir(OUTPUT_PATH);

  const existingCharacters = existingFiles
    .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'profiles.json')
    .map(f => f.replace('.json', ''));

  const normalizedNames = names.map(normalize);

  const missing = normalizedNames.filter(
    name => !existingCharacters.includes(name)
  );

  console.log(`Found ${missing.length} new characters.`);

  // Store profiles for profiles.json
  const allProfiles: CharacterProfile[] = [];

  for (const name of normalizedNames) {
    let character: Character;

    if (missing.includes(name)) {
      console.log(`Downloading ${name}...`);

      const [
        profileRes,
        skillsRes,
        constellationRes,
        statsRes,
      ] = await Promise.all([
        axios.get<CharacterProfile>(
          `${API_BASE}/characters?resultLanguage=english&query=${name}`
        ),
        axios.get<CharacterSkills>(
          `${API_BASE}/talents?resultLanguage=english&query=${name}`
        ),
        axios.get<CharacterConstellation>(
          `${API_BASE}/constellations?resultLanguage=english&query=${name}`
        ),
        axios.get<CharacterStats>(
          `${API_BASE}/stats?folder=characters&resultLanguage=english&query=${name}`
        ),
      ]);

      character = {
        profile: profileRes.data,
        skills: skillsRes.data,
        constellation: constellationRes.data,
        stats: statsRes.data,
      };

      await fs.writeJson(
        path.join(OUTPUT_PATH, `${name}.json`),
        character,
        { spaces: 2 }
      );
    } else {
      // Load existing file to extract profile
      character = await fs.readJson(
        path.join(OUTPUT_PATH, `${name}.json`)
      );
    }

    allProfiles.push(character.profile);
  }

  // Update index.json
  await fs.writeJson(
    path.join(OUTPUT_PATH, 'index.json'),
    normalizedNames,
    { spaces: 2 }
  );

  // Generate profiles.json
  await fs.writeJson(
    path.join(OUTPUT_PATH, 'profiles.json'),
    allProfiles,
    { spaces: 2 }
  );

  console.log('Update complete.');
}

run().catch(console.error);
