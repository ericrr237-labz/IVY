// server/routes/settings.js (ESM)
import { Router } from "express";
import { readJSON, writeJSON } from "../utils/store.js";

const router = Router();
const FILE = "settings.json";

// GET /api/settings
router.get("/", async (req, res) => {
  const defaults = {
    theme: "dark",
    compactMode: false,
    showTips: true,
    emailUpdates: true,
    pushNotifications: false,
    inAppAlerts: true,
    usageAnalytics: true,
    googleCalendarConnected: false,
    gmailConnected: false,
    stripeConnected: false,
    openaiKey: "",
  };
  const state = await readJSON(FILE, defaults);
  res.json(state);
});

// POST /api/settings
router.post("/", async (req, res) => {
  const incoming = req.body || {};
  // Merge with existing to avoid clobbering unknown fields
  const current = await readJSON(FILE, {});
  const next = { ...current, ...incoming };
  await writeJSON(FILE, next);
  res.json({ ok: true });
});

export default router;
