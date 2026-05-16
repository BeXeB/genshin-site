import fs from "fs";
import path from "path";

type Entry = {
  descriptionRaw?: string;
};

type Data = {
  skills?: Record<string, Entry>;
  constellation?: Record<string, Entry>;
};

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node extract-data.js <json-file>");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);

const raw = fs.readFileSync(absolutePath, "utf-8");
const data: Data = JSON.parse(raw);

const skillKeys = [
  "combat1",
  "combat2",
  "combat3",
  "passive1",
  "passive2",
  "passive3",
  "passive4",
];

const constellationKeys = ["c1", "c2", "c3", "c4", "c5", "c6"];

const extracted = {
  skills: Object.fromEntries(
    skillKeys.map((key) => [
      key,
      data.skills?.[key]?.descriptionRaw ?? null,
    ])
  ),

  constellation: Object.fromEntries(
    constellationKeys.map((key) => [
      key,
      data.constellation?.[key]?.descriptionRaw ?? null,
    ])
  ),
};

console.log(JSON.stringify(extracted, null, 2));
