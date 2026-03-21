const express = require("express");
const asyncHandler = require("../src/utils/asyncHandler");
const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  getCurrentUser,
  getUserById,
} = require("../controllers/usersController");

const router = express.Router();

router.get("/me", requireAuth, asyncHandler(getCurrentUser));
router.get(
  "/:userId",
  requireAuth,
  requireRole("admin"),
  asyncHandler(getUserById),
);

module.exports = router;
