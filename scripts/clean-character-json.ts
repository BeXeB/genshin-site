import fs from "fs";
import path from "path";

const CHARACTER_JSON_DIR = path.join(
  __dirname,
  "../src/assets/json/characters"
);

function removeDescriptionRaw(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(removeDescriptionRaw);
  } else if (typeof obj === "object" && obj !== null) {
    delete obj.descriptionRaw;

    for (const key of Object.keys(obj)) {
      removeDescriptionRaw(obj[key]);
    }
  }
}

function clean() {
  const files = fs.readdirSync(CHARACTER_JSON_DIR);

  files.forEach((file) => {
    if (!file.endsWith(".json")) return;
    if (file === "profiles.json" || file === "index.json") return;

    const filePath = path.join(CHARACTER_JSON_DIR, file);

    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    removeDescriptionRaw(json);

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");

    console.log(`Cleaned ${file}`);
  });

  console.log("✅ Removed all descriptionRaw fields.");
}

clean();
