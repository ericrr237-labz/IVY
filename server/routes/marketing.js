// server/routes/marketing.js (ESM)
import { Router } from "express";
import { readJSON, writeJSON } from "../utils/store.js";

const router = Router();
const FILE = "marketing.json";

// GET /api/marketing/notes
router.get("/notes", async (req, res) => {
  const state = await readJSON(FILE, { notes: "" });
  res.json(state);
});

// PUT /api/marketing/notes
router.put("/notes", async (req, res) => {
  const { notes = "" } = req.body || {};
  const state = await readJSON(FILE, { notes: "" });
  state.notes = String(notes);
  await writeJSON(FILE, state);
  res.json({ ok: true, notes: state.notes });
});

export default router;
