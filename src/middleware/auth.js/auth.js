import User from "../models/User";
import { verifyAccessToken } from "../services/tokenService.js";
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing bearer token" });
  }
  const token = authHeader.slice("Bearer ".length);
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active") {
    return res.status(401).json({ message: "User not authorized" });
  }
  req.auth = {
    userId: user._id.toString(),
    email: user.email,
    roles: user.roles,
  };
  req.user = user;
  next();
}
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    const roles = req.auth?.roles || [];
    const isAllowed = allowedRoles.some((role) => roles.includes(role));
    if (!isAllowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
export { requireAuth };
export { requireRole };
export default {
  requireAuth,
  requireRole,
};
