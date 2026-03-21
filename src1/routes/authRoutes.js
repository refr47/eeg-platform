const express = require("express");
const asyncHandler = require("../src/utils/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const {
  register,
  createSession,
  getCurrentSession,
} = require("../controllers/authController");

const router = express.Router();

router.post("/users", asyncHandler(register));
router.post("/sessions", asyncHandler(createSession));
router.get("/sessions/current", requireAuth, asyncHandler(getCurrentSession));

module.exports = router;
