import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  key: { type: String, required: true }, // 'revenue', 'expense', 'marketing'
  value: Number,
  date: { type: Date, default: Date.now },
  category: String,
  note: String,
  type: String,
  marketingSpend: Number,
  newCustomers: Number
}, { timestamps: true });

export default mongoose.model('Record', recordSchema);
