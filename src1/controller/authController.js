const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");
const { signAccessToken } = require("../services/tokenService");

async function register(req, res) {
  const { email, password, profile, roles } = req.body;

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "password must be a string with at least 8 characters",
    });
  }

  const user = new User({
    email,
    profile,
    roles: Array.isArray(roles) && roles.length > 0 ? roles : ["customer"],
  });

  await user.setPassword(password);
  await user.save();

  return res.status(201).json(user);
}

async function createSession(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
  }).select("+passwordHash");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "User is not active" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  const tokenId = crypto.randomUUID();

  await Session.create({
    userId: user._id,
    tokenId,
  });

  return res.status(201).json({
    accessToken: token,
    tokenType: "Bearer",
    user: user.toJSON(),
  });
}

async function getCurrentSession(req, res) {
  return res.json({
    user: req.user,
  });
}

module.exports = {
  register,
  createSession,
  getCurrentSession,
};
