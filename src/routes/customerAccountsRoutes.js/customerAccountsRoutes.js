import * as express from "express";
import asyncHandler from "../src/utils/asyncHandler";
import auth from "../middlewares/auth";
import customerAccountsController from "../controllers/customerAccountsController";
import monthlyEnergyBalancesController from "../controllers/monthlyEnergyBalancesController";
const { requireAuth } = auth;
const {
  createCustomerAccount,
  getCustomerAccountById,
  listCustomerAccounts,
  updateCustomerAccount,
} = customerAccountsController;
const {
  upsertMonthlyEnergyBalance,
  listMonthlyEnergyBalances,
  getYearlyEnergyBalance,
} = monthlyEnergyBalancesController;
const router = express.Router();
router.get("/", requireAuth, asyncHandler(listCustomerAccounts));
router.post("/", requireAuth, asyncHandler(createCustomerAccount));
router.get(
  "/:customerAccountId",
  requireAuth,
  asyncHandler(getCustomerAccountById),
);
router.put(
  "/:customerAccountId",
  requireAuth,
  asyncHandler(updateCustomerAccount),
);
router.post(
  "/:customerAccountId/monthly-energy-balances",
  requireAuth,
  asyncHandler(upsertMonthlyEnergyBalance),
);
router.get(
  "/:customerAccountId/monthly-energy-balances",
  requireAuth,
  asyncHandler(listMonthlyEnergyBalances),
);
router.get(
  "/:customerAccountId/yearly-energy-balances/:year",
  requireAuth,
  asyncHandler(getYearlyEnergyBalance),
);
export default router;
