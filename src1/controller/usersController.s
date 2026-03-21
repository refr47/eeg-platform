const User = require("../models/User");

async function getCurrentUser(req, res) {
  return res.json(req.user);
}

async function getUserById(req, res) {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
}

module.exports = {
  getCurrentUser,
  getUserById
};