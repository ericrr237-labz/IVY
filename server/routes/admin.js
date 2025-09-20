// /server/routes/admin.js
import express from "express";
import User from "../models/User.js";
import Org from "../models/Org.js";
import Membership from "../models/Membership.js";
import authAttach from "../Middleware/authAttach.js";

const router = express.Router();

// Only allow superadmin
router.use(authAttach, (req, res, next) => {
  if (!req.auth?.userId || req.auth?.role !== "owner") {
    // or check isSuperAdmin on User
    return res.status(403).json({ ok:false, error:"Forbidden" });
  }
  next();
});

// POST /api/admin/create-user  { name, email, password, orgName }
router.post("/create-user", async (req, res) => {
  const { name, email, password, orgName } = req.body || {};
  if (!email || !password || !orgName) return res.status(400).json({ ok:false, error:"Missing fields" });

  let user = await User.findOne({ email });
  if (user) return res.status(409).json({ ok:false, error:"Email already exists" });

  user = new User({ email, name, passwordHash: "x" });
  await user.setPassword(password);
  await user.save();

  const org = await Org.create({ name: orgName, ownerId: user._id, plan: "free", isActive: true });
  await Membership.create({ userId: user._id, orgId: org._id, role: "owner" });

  res.json({ ok:true, user: { id:user._id, email:user.email }, org: { id:org._id, name:org.name }});
});

export default router;
