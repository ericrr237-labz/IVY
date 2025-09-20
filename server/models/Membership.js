import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  orgId:  { type: mongoose.Schema.Types.ObjectId, ref: "Org",  required: true, index: true },
  role:   { type: String, enum: ["owner","admin","member"], default: "member", index: true },
}, { timestamps: true });

membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
