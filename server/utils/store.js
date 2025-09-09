// server/utils/store.js (ESM)
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");

async function ensureDataDir() {
  try { await fs.mkdir(dataDir, { recursive: true }); } catch {}
}

export async function readJSON(name, fallback) {
  await ensureDataDir();
  const file = path.join(dataDir, name);
  try {
    const buf = await fs.readFile(file, "utf8");
    return JSON.parse(buf);
  } catch {
    return fallback;
  }
}

export async function writeJSON(name, data) {
  await ensureDataDir();
  const file = path.join(dataDir, name);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
  return data;
}
