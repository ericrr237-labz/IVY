// server/routes/profile.js
import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");
const DEFAULT = {
  fullName: "", email: "", phone: "", instagram: "", bio: "",
  avatar: "", businessName: "IVY User", city: "", state: "",
  createdAt: null, updatedAt: null,
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function read() {
  try {
    ensureDir();
    if (!fs.existsSync(PROFILE_PATH)) return null;
    return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
  } catch { return null; }
}
function write(obj) {
  ensureDir();
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(obj, null, 2));
}

// GET → return existing profile (or default)
router.get("/", (req, res) => {
  let doc = read();
  if (!doc) {
    doc = { ...DEFAULT, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    write(doc);
  }
  res.json({ ok: true, data: doc });
});

// POST → update and save
router.post("/", (req, res) => {
  const fields = ["fullName","email","phone","instagram","bio","avatar","businessName","city","state"];
  const base = read() || { ...DEFAULT, createdAt: new Date().toISOString() };
  const next = { ...base };
  for (const k of fields) if (k in (req.body || {})) next[k] = req.body[k];
  next.updatedAt = new Date().toISOString();
  write(next);
  res.json({ ok: true, data: next });
});

export default router;
