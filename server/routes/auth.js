// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Org from "../models/Org.js";
import Membership from "../models/Membership.js";
import authAttach from "../Middleware/authAttach.js";




const router = express.Router();


/* -------------------------- ENV / CONFIG -------------------------- */
const ACCESS_TTL_MIN   = parseInt(process.env.ACCESS_TTL_MIN  || "15", 10);   // minutes
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TTL_DAYS || "30", 10);  // days

const ACCESS_SECRET         = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;



if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.warn("[auth] Missing JWT secrets in .env (JWT_SECRET, JWT_REFRESH_SECRET)");
}

/* ------------------------------ HELPERS ------------------------------ */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: `${ACCESS_TTL_MIN}m` });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
function sanitizeUser(u) {
  return { id: u._id, email: u.email, name: u.name, isSuperAdmin: !!u.isSuperAdmin };
}

/* ------------------------------- ROUTES ------------------------------- */
/**
 * POST /api/auth/signup
 * Body: { name, email, password, orgName }
 * Creates user + org + membership(owner). Returns { user, org, tokens:{access,refresh} }
 */
router.post("/signup", async (req, res) => {
    if (String(process.env.ALLOW_PUBLIC_SIGNUP).toLowerCase() !== "true") {
       return res.status(403).json({ ok:false, error: "Public signup is disabled" });
  }
  try {
    const { name, email, password, orgName } = req.body || {};
    if (!email || !password || !orgName) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    let existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ ok: false, error: "Email already in use" });

    // Create user
    const user = new User({ email, name, passwordHash: "x" });
    if (typeof user.setPassword === "function") {
      await user.setPassword(password);
    } else {
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    await user.save();

    // Create org + membership
    const org = await Org.create({ name: orgName, ownerId: user._id, plan: "free" });
    await Membership.create({ userId: user._id, orgId: org._id, role: "owner" });

    // Tokens (bind access to the new org)
    const access  = signAccessToken({ userId: user._id.toString(), activeOrgId: org._id.toString() });
    const refresh = signRefreshToken({ userId: user._id.toString() });

    return res.json({
      ok: true,
      user: sanitizeUser(user),
      org: { id: org._id, name: org.name },
      tokens: { access, refresh },
    });
  } catch (e) {
    console.error("signup error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Signup failed" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password, orgId? }
 * Returns { user, activeOrgId, tokens:{access,refresh} }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, orgId } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "Missing email or password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    let ok = false;
    if (typeof user.verifyPassword === "function") {
      ok = await user.verifyPassword(password);
    } else {
      ok = await bcrypt.compare(password, user.passwordHash);
    }
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const memberships = await Membership.find({ userId: user._id }).lean();
    if (!memberships.length) return res.status(403).json({ ok: false, error: "No org memberships" });

    const active = (orgId && memberships.find(m => m.orgId.toString() === orgId))
      ? orgId
      : memberships[0].orgId.toString();

    const access  = signAccessToken({ userId: user._id.toString(), activeOrgId: active });
    const refresh = signRefreshToken({ userId: user._id.toString() });

    return res.json({
      ok: true,
      user: sanitizeUser(user),
      activeOrgId: active,
      tokens: { access, refresh },
    });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Login failed" });
  }
});

/**
 * POST /api/auth/refresh
 * Body: { refresh }
 * Returns { tokens:{access} }
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refresh } = req.body || {};
    if (!refresh) return res.status(400).json({ ok: false, error: "Missing refresh token" });

    const { userId } = verifyRefresh(refresh);

    const memberships = await Membership.find({ userId }).lean();
    if (!memberships.length) return res.status(403).json({ ok: false, error: "No org memberships" });

    // default to first org; client can call /switch-org after
    const active = memberships[0].orgId.toString();
    const access = signAccessToken({ userId, activeOrgId: active });

    return res.json({ ok: true, tokens: { access } });
  } catch (e) {
    console.error("refresh error:", e);
    return res.status(401).json({ ok: false, error: "Refresh failed", detail: e?.message });
  }
});

/**
 * POST /api/auth/switch-org  (protected)
 * Headers: Authorization: Bearer <access>
 * Body: { orgId }
 * Returns { activeOrgId, access }
 */
router.post("/switch-org", authAttach, async (req, res) => {
  try {
    const { orgId } = req.body || {};
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ ok: false, error: "No user" });
    if (!orgId)  return res.status(400).json({ ok: false, error: "Missing orgId" });

    const membership = await Membership.findOne({ userId, orgId }).lean();
    if (!membership) return res.status(403).json({ ok: false, error: "Not a member of that org" });

    const access = signAccessToken({ userId, activeOrgId: orgId });
    return res.json({ ok: true, activeOrgId: orgId, access });
  } catch (e) {
    console.error("switch-org error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Switch org failed" });
  }
});

export default router;
