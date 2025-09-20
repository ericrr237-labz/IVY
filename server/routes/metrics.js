// server/routes/metrics.js
import express from "express";
import Record from "../models/Record.js"; // Mongo-only
import mongoose from "mongoose"; // ADD



const oid = (id) => new mongoose.Types.ObjectId(id); // ADD
const router = express.Router();
const prependOrgMatch = (pipeline, orgId) => [{ $match: { orgId: oid(orgId) } }, ...pipeline]; // ADD

/* ------------------------------ Helpers ------------------------------ */

function parseDateInput(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeNumber(n) {
  if (typeof n === "number") return n;
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

async function fetchByKey({ key, orgId, from, to }) {
  const q = { key };
  if (orgId) q.orgId = orgId; // harmless if you haven’t added orgs yet
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = farom;
    if (to)   q.date.$lte = to;
  }
  // lean() for speed; we only need value & date
  return Record.find(q).select({ value: 1, date: 1 }).lean();
}

const sumValues = (rows) => rows.reduce((acc, r) => acc + normalizeNumber(r.value), 0);

/* ------------------------------ Routes ------------------------------ */

/**
 * GET /api/metrics/gross-margin?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Gross Margin = (Revenue - COGS) / Revenue
 */
router.get("/gross-margin", async (req, res) => {
  try {
    const orgId = req.auth?.orgId || null; // optional
    const from = parseDateInput(req.query.from);
    const to   = parseDateInput(req.query.to);

    const [revenues, cogs] = await Promise.all([
      fetchByKey({ key: "revenue", orgId, from, to }),
      fetchByKey({ key: "cogs",     orgId, from, to }), // change "cogs" if you use a different key
    ]);

    const revenueTotal = sumValues(revenues);
    const cogsTotal    = sumValues(cogs);
    const grossProfit  = revenueTotal - cogsTotal;
    const grossMargin  = revenueTotal > 0 ? grossProfit / revenueTotal : 0;

    return res.json({
      ok: true,
      metric: "gross_margin",
      value: grossMargin, // 0..1
      breakdown: {
        revenue: revenueTotal,
        cogs: cogsTotal,
        grossProfit,
        range: {
          from: from ? from.toISOString() : null,
          to:   to   ? to.toISOString()   : null,
        },
        source: "mongo",
        orgScoped: Boolean(orgId),
      },
    });
  } catch (e) {
    console.error("gross-margin error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
});

/**
 * GET /api/metrics/cltv?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Simple CLTV = Total Revenue / New Customers
 */
router.get("/cltv", async (req, res) => {
  try {
    const orgId = req.auth?.orgId || null;
    const from = parseDateInput(req.query.from);
    const to   = parseDateInput(req.query.to);

    const [revenues, newCustomers] = await Promise.all([
      fetchByKey({ key: "revenue",      orgId, from, to }),
      fetchByKey({ key: "newCustomers", orgId, from, to }),
    ]);

    const totalRevenue = sumValues(revenues);
    const totalNew     = sumValues(newCustomers);
    const cltv         = totalNew > 0 ? totalRevenue / totalNew : 0;

    return res.json({
      ok: true,
      metric: "CLTV",
      value: cltv,
      breakdown: {
        totalRevenue,
        totalNewCustomers: totalNew,
        range: {
          from: from ? from.toISOString() : null,
          to:   to   ? to.toISOString()   : null,
        },
        source: "mongo",
        orgScoped: Boolean(orgId),
      },
    });
  } catch (e) {
    console.error("CLTV error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
});

/**
 * GET /api/metrics/cac?from=YYYY-MM-DD&to=YYYY-MM-DD
 * CAC = Marketing Spend / New Customers
 */
router.get("/cac", async (req, res) => {
  try {
    const orgId = req.auth?.orgId || null;
    const from = parseDateInput(req.query.from);
    const to   = parseDateInput(req.query.to);

    const [marketing, newCustomers] = await Promise.all([
      fetchByKey({ key: "marketing",    orgId, from, to }), // change if your key is different
      fetchByKey({ key: "newCustomers", orgId, from, to }),
    ]);

    const marketingSpend = sumValues(marketing);
    const totalNew       = sumValues(newCustomers);
    const cac            = totalNew > 0 ? marketingSpend / totalNew : 0;

    return res.json({
      ok: true,
      metric: "CAC",
      value: cac,
      breakdown: {
        marketingSpend,
        totalNewCustomers: totalNew,
        range: {
          from: from ? from.toISOString() : null,
          to:   to   ? to.toISOString()   : null,
        }, 
        source: "mongo",
        orgScoped: Boolean(orgId),
      },
    });
  } catch (e) {
    console.error("CAC error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
});

export default router;
