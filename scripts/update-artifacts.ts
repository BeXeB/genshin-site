import genshindb from 'genshin-db';
import fs from 'fs-extra';
import path from 'path';
import { ArtifactPiece, ArtifactSet } from '../src/app/_models/artifacts';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/json/artifacts');
const queryLanguage = genshindb.Language.English;

const artifacts = genshindb.artifacts('names', {
  matchCategories: true,
});

function normalize(name: string): string {
  return name.replace(/[\s'"`:\-—]+/g, '').toLowerCase();
}

function mapArtifact(artifact: genshindb.Artifact): ArtifactSet {
  return {
    id: artifact.id,
    name: artifact.name,
    rarityList: artifact.rarityList,

    effect1Pc: artifact.effect1Pc,
    effect2Pc: artifact.effect2Pc,
    effect4Pc: artifact.effect4Pc,

    flower: artifact.flower as ArtifactPiece,
    plume: artifact.plume as ArtifactPiece,
    sands: artifact.sands as ArtifactPiece,
    goblet: artifact.goblet as ArtifactPiece,
    circlet: artifact.circlet as ArtifactPiece,

    images: {
      filename_flower: artifact.images.filename_flower,
      filename_plume: artifact.images.filename_plume,
      filename_sands: artifact.images.filename_sands,
      filename_goblet: artifact.images.filename_goblet,
      filename_circlet: artifact.images.filename_circlet,
    },

    version: artifact.version,
  };
}

async function run() {
  if (!artifacts) {
    console.error('No artifacts found');
    return;
  }

  await fs.ensureDir(OUTPUT_PATH);

  const existingFiles = await fs.readdir(OUTPUT_PATH);

  const existingArtifacts = existingFiles
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => f.replace('.json', ''));

  const normalizedNames = artifacts.map(normalize);

  const missing = normalizedNames.filter(
    (name) => !existingArtifacts.includes(name),
  );

  console.log(`Found ${missing.length} new artifacts.`);

  for (const name of missing) {
    let artifact: ArtifactSet;

    console.log(`Downloading ${name}...`);

    const artifactRes = genshindb.artifacts(name, {
      queryLanguages: [queryLanguage],
    });

    if (!artifactRes) {
      console.error(`Failed to fetch data for ${name}`);
      continue;
    }

    artifact = mapArtifact(artifactRes);

    await fs.writeJson(path.join(OUTPUT_PATH, `${name}.json`), artifact, {
      spaces: 2,
    });
  }
  await fs.writeJson(path.join(OUTPUT_PATH, 'index.json'), normalizedNames, {
    spaces: 2,
  });

  console.log('Update complete.');
}

run().catch((error) => {
  console.error('Error updating artifacts:', error);
});
