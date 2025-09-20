import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  key: { type: String, required: true },    // 'revenue','expense','cogs','marketing','newCustomers'
  value: Number,
  date: { type: Date, default: Date.now },
  category: String,
  note: String,
  type: String,
  marketingSpend: Number,
  newCustomers: Number,

  // multitenancy
  orgId:     { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });

recordSchema.index({ orgId: 1, date: -1 });
recordSchema.index({ orgId: 1, key: 1, date: -1 });

const Record = mongoose.model("Record", recordSchema);
export default Record;
