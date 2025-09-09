// server/routes/feedback.js (ESM)
import { Router } from "express";
import { readJSON, writeJSON } from "../utils/store.js";

const router = Router();
const FILE = "feedback.json";

// GET /api/feedback -> list
router.get("/", async (req, res) => {
  const rows = await readJSON(FILE, []);
  res.json(rows);
});

// POST /api/feedback -> create
router.post("/", async (req, res) => {
  const body = req.body || {};
  // minimal validation
  if (!body.title || !body.details) {
    return res.status(400).json({ ok: false, error: "Missing title/details" });
  }

  const rows = await readJSON(FILE, []);
  const now = new Date().toISOString();

  const record = {
    id: body.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    category: body.category || "Other",
    priority: body.priority || "Normal",
    title: String(body.title).slice(0, 120),
    details: String(body.details).slice(0, 1000),
    email: body.email || "",
    includeScreenshot: !!body.includeScreenshot,
    screenshot: body.screenshot || "",
    allowContact: body.allowContact !== false,
    status: body.status || "Recorded",
    createdAt: body.createdAt || now,
  };

  rows.unshift(record);
  await writeJSON(FILE, rows);
  res.json(record);
});

export default router;
