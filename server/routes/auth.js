// server/routes/auth.js
import { Router } from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data");
const AUTH_PATH = path.join(DATA_DIR, "auth.json");

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readAuth()  { try { ensureDir(); if (!fs.existsSync(AUTH_PATH)) return null; return JSON.parse(fs.readFileSync(AUTH_PATH, "utf8")); } catch { return null; } }
function writeAuth(o){ ensureDir(); fs.writeFileSync(AUTH_PATH, JSON.stringify(o, null, 2)); }

function ensureDefaultUser() {
  let auth = readAuth();
  if (!auth) {
    const email = "admin@aivi.com";
    const passwordHash = bcrypt.hashSync("password", 10);
    auth = { email, passwordHash, passwordUpdatedAt: new Date().toISOString() };
    writeAuth(auth);
  }
  return auth;
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const auth = ensureDefaultUser();
  if (!email || !password) return res.status(400).json({ ok:false, error:"missing_fields" });
  if (email !== auth.email)  return res.status(401).json({ ok:false, error:"invalid_credentials" });
  const ok = bcrypt.compareSync(password, auth.passwordHash || "");
  if (!ok) return res.status(401).json({ ok:false, error:"invalid_credentials" });
  res.json({ ok:true, email: auth.email });
});

// POST /api/auth/change-password
router.post("/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ ok:false, error:"weak_password" });

  const auth = ensureDefaultUser();
  const match = bcrypt.compareSync(currentPassword || "", auth.passwordHash || "");
  if (!match) return res.status(401).json({ ok:false, error:"wrong_current_password" });

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  writeAuth({ ...auth, passwordHash, passwordUpdatedAt: new Date().toISOString() });
  res.json({ ok:true });
});

export default router;
