import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  plan: { type: String, default: "free" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Org = mongoose.model("Org", orgSchema);
export default Org;
