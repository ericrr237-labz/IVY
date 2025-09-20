// server/Middleware/authAttach.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";



export default async function authAttach(req, res, next) {
  try {
    const authz = req.headers.authorization || "";
    const token = authz.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ ok: false, error: "No token" });

    const payload = jwt.verify(token, process.env.ACCESS_SECRET); // keep your secret/env
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ ok: false, error: "No user" });

    // ⬅️ normalize what routes will read
    req.auth = {
      userId: String(user._id),
      isSuperAdmin: !!user.isSuperAdmin,
      activeOrgId: user.activeOrgId ? String(user.activeOrgId) : null,
    };

    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Auth failed", detail: e.message });
  }
}
