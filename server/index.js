// server/index.js
import "dotenv/config"
console.log("[ENV] ACCESS_SECRET present:", !!process.env.ACCESS_SECRET);
console.log("[ENV] REFRESH_SECRET present:", !!process.env.REFRESH_SECRET);
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import metricsRoutes from "./routes/metrics.js";
import askGPT from "./routes/askGPT.js"
import authRouter from "./routes/auth.js";
import feedbackRouter from "./routes/feedback.js";
import marketingRouter from "./routes/marketing.js";
import settingsRouter from "./routes/settings.js";
import { fileURLToPath } from "url";
import authAttach from "./Middleware/authAttach.js";
import recordsRouter from "./routes/records.js";
import metricsRouter from "./routes/metrics.js";
import profileRoutes from "./routes/profile.js";
import mongoose from "mongoose";
import adminRouter from "./routes/admin.js";



console.log("OPENAI_API_KEY length:", (process.env.OPENAI_API_KEY || "").length);
console.log("ENV loaded?", !!process.env.OPENAI_API_KEY);
console.log("[server] mounted /api/auth");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve("./data");
const FILE = path.join(DATA_DIR, "records.json");
const app = express();


app.use(cors({
  origin: "http://localhost:3000",  // your CRA dev server
  credentials: true
}));





app.use(express.json({ limit: "10mb" }));


// Mongo connect
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Mongo connected");
}).catch(err => {
  console.error("Mongo connect error:", err);
  process.exit(1);
});

app.use("/api/auth", authRouter);

app.use("/api", authAttach);
app.use("/api/admin", adminRouter);
app.use("/api/records", authAttach, recordsRouter);
app.use("/api/metrics", authAttach, metricsRoutes);
app.use("/api/profile", authAttach, profileRoutes);
app.use("/api/feedback", feedbackRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/settings", settingsRouter);


app.get("/healthz", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => {
  res.type("text/plain").send("IVY API is running. Try /api/profile, /api/metrics, /api/feedback...");
});
app.get("/api/whoami", (req, res) => res.json({ ok: true, service: "IVY API" }));

// ensure data file exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf-8");

const readAll = () => JSON.parse(fs.readFileSync(FILE, "utf-8"));
const writeAll = (arr) => fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));

/* ---------- RECORDS ROUTES ---------- */
// GET /api/records  -> list all

app.get("/api/records", (req, res) => {
  res.json(readAll());
});

app.post("/api/ask-gpt", askGPT);
  

// POST /api/records -> create one
app.post("/api/records", (req, res) => {
  const { type, value, label, note, key, marketingSpend, newCustomers } = req.body || {};

  // minimal validation
  if (!type) return res.status(400).json({ error: "type is required" });

  const rec = {
    id: crypto.randomUUID?.() || String(Date.now()),
    createdAt: new Date().toISOString(),
    type,                        // "revenue" | "expenses" | "cogs" | "cac" | etc.
    value: Number(value) || 0,
    label: label || note || "",
    note: note || "",
    key: key || null,
    marketingSpend: marketingSpend ?? null,
    newCustomers: newCustomers ?? null,
  };

  const all = readAll();
  all.unshift(rec);
  writeAll(all);
  res.status(201).json(rec);
});

// (optional) DELETE /api/records/:id
app.delete("/api/records/:id", (req, res) => {
  const all = readAll();
  const idx = all.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const [deleted] = all.splice(idx, 1);
  writeAll(all);
  res.json(deleted);
});

/* ------------------------------------ */

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
