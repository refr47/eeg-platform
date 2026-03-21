const express = require("express");
const asyncHandler = require("../src/utils/asyncHandler");
const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  recalculateAllYearlyEnergyBalances,
  recalculateCustomerAccountYear,
} = require("../controllers/adminController");

const router = express.Router();

router.post(
  "/yearly-energy-balances/recalculate",
  requireAuth,
  requireRole("admin"),
  asyncHandler(recalculateAllYearlyEnergyBalances),
);

router.post(
  "/customer-accounts/:customerAccountId/yearly-energy-balances/:year/recalculate",
  requireAuth,
  requireRole("admin"),
  asyncHandler(recalculateCustomerAccountYear),
);

module.exports = router;
