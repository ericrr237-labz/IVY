// server/routes/metrics.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Resolve path to server/data/records.json (works regardless of CWD)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "records.json");

// Safe read helper
const readAll = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf-8");
    const raw = fs.readFileSync(FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error("metrics.readAll error:", e);
    return [];
  }
};

// GET /api/metrics/cltv
router.get("/cltv", async (req, res) => {
  try {
    const records = readAll();

    // Your schema (from index.js):
    // { id, createdAt, type: "revenue" | "expenses" | "cogs" | "cac" | ...,
    //   value: Number, marketingSpend?: Number, newCustomers?: Number, ... }

    const safeNum = (n) => (typeof n === "number" && !Number.isNaN(n) ? n : 0);

    let totalRevenue = 0;
    let totalExpenses = 0;     // NOTE: type is "expenses" (plural) in your code
    let totalCOGS = 0;

    let firstRevenueDate = null;
    let lastRevenueDate = null;

    let totalNewCustomers = 0; // derive "customers" from summed newCustomers entries (if you use CAC forms)

    for (const r of records) {
      const val = safeNum(r.value);

      if (r.type === "revenue") {
        totalRevenue += val;

        // lifespan window using revenue timestamps
        const d = r.createdAt ? new Date(r.createdAt) : null;
        if (d && !isNaN(d.getTime())) {
          if (!firstRevenueDate || d < firstRevenueDate) firstRevenueDate = d;
          if (!lastRevenueDate || d > lastRevenueDate) lastRevenueDate = d;
        }
      }

      if (r.type === "expenses") totalExpenses += val; // plural
      if (r.type === "cogs") totalCOGS += val;

      // If you’ve been storing marketing/new customer events, count them
      if (typeof r.newCustomers === "number" && !Number.isNaN(r.newCustomers)) {
        totalNewCustomers += r.newCustomers;
      }
    }

    // Derive customers
    // Prefer your real "newCustomers" stream if present; otherwise fallback to 1 to avoid /0.
    const customers = totalNewCustomers > 0 ? totalNewCustomers : 1;

    // Lifespan (months) across the revenue window; default to 12 if no valid dates
    const monthIndex = (d) => d.getUTCFullYear() * 12 + d.getUTCMonth();
    let avgLifespanMonths = 12;
    if (firstRevenueDate && lastRevenueDate) {
      const span = Math.max(1, monthIndex(lastRevenueDate) - monthIndex(firstRevenueDate) + 1);
      avgLifespanMonths = span; // one overall window; simple & stable until you track churn
    }

    // ARPU & Margin
    const arpu = totalRevenue > 0 ? totalRevenue / customers : 0;
    const grossMargin =
      totalRevenue > 0
        ? (totalRevenue - totalExpenses - totalCOGS) / totalRevenue
        : 0;

    // CLTV
    const cltv = arpu * grossMargin * avgLifespanMonths;

    return res.json({
      cltv: Number.isFinite(cltv) ? cltv : 0,
      breakdown: {
        totalRevenue,
        totalExpenses,
        totalCOGS,
        customers,
        avgLifespanMonths,
        arpu,
        grossMargin,
        window: {
          firstRevenueDate: firstRevenueDate?.toISOString() || null,
          lastRevenueDate: lastRevenueDate?.toISOString() || null,
        },
      },
    });
  } catch (err) {
    console.error("CLTV error:", err);
    return res.status(500).json({
      error: "Error calculating CLTV",
      detail: err?.message || String(err),
    });
  }
});

export default router;
