
import jwt from "jsonwebtoken";

const ACCESS_TTL_MIN  = parseInt(process.env.ACCESS_TTL_MIN || "15", 10);
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TTL_DAYS || "30", 10);

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: `${ACCESS_TTL_MIN}m` });
}
export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}
export function verifyAccess(token) {
  return jwt.verify(token, process.env.ACCESS_SECRET);
}
export function verifyRefresh(token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
}
