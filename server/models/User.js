import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true, lowercase: true, trim: true },
  name: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};
userSchema.methods.verifyPassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const User = mongoose.model("User", userSchema);
export default User;
