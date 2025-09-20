// server/routes/records.js
import { Router } from "express";
import mongoose from "mongoose";
import Record from "../models/Record.js";

const router = Router();
const oid = (id) => new mongoose.Types.ObjectId(id);

// GET /api/records  (scoped to org, optional filters: key, from, to, limit)
router.get("/", async (req, res, next) => {
  try {
    const orgId = req.auth?.activeOrgId;
    if (!orgId) return res.status(401).json({ ok: false, error: "No org" });

    const { key, from, to, limit } = req.query;
    const q = { orgId: oid(orgId) };
    if (key) q.key = key;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    const n = Math.min(parseInt(limit || "200", 10), 1000);
    const items = await Record.find(q).sort({ date: -1 }).limit(n).lean();
    res.json({ ok: true, items });
  } catch (e) { next(e); }
});

// POST /api/records  (stamp createdBy & orgId)
router.post("/", async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    const orgId = req.auth?.activeOrgId;
    if (!userId || !orgId) {
      return res.status(401).json({ ok: false, error: "Auth failed", detail: "missing auth context" });
    }

    const { key, value, date, category, note, type, marketingSpend, newCustomers } = req.body || {};
    if (!key) return res.status(400).json({ ok: false, error: "bad_request", detail: "key is required" });
    if (typeof value !== "number") return res.status(400).json({ ok: false, error: "bad_request", detail: "value must be a number" });

    const doc = await Record.create({
      key,
      value,
      date: date ? new Date(date) : new Date(),
      category,
      note,
      type,
      marketingSpend,
      newCustomers,
      createdBy: oid(userId),
      orgId: oid(orgId),
    });

    res.status(201).json({ ok: true, item: doc });
  } catch (e) { next(e); }
});

// PATCH /api/records/:id  (no changing stamps)
router.patch("/:id", async (req, res, next) => {
  try {
    const orgId = req.auth?.activeOrgId;
    if (!orgId) return res.status(401).json({ ok: false, error: "No org" });

    const update = { ...req.body };
    delete update.orgId;
    delete update.createdBy;

    const doc = await Record.findOneAndUpdate(
      { _id: oid(req.params.id), orgId: oid(orgId) },
      update,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: doc });
  } catch (e) { next(e); }
});

// DELETE /api/records/:id  (scoped to org)
router.delete("/:id", async (req, res, next) => {
  try {
    const orgId = req.auth?.activeOrgId;
    if (!orgId) return res.status(401).json({ ok: false, error: "No org" });

    const out = await Record.deleteOne({ _id: oid(req.params.id), orgId: oid(orgId) });
    res.json({ ok: true, deleted: out.deletedCount === 1 });
  } catch (e) { next(e); }
});

export default router;
