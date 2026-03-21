const CustomerAccount = require("../models/CustomerAccount");
const MonthlyEnergyBalance = require("../models/MonthlyEnergyBalance");
const YearlyEnergyBalance = require("../models/YearlyEnergyBalance");
const {
  recalculateYearlyEnergyBalance,
} = require("../services/yearlyEnergyBalanceService");

async function upsertMonthlyEnergyBalance(req, res) {
  const { customerAccountId } = req.params;
  const {
    year,
    month,
    gridConsumptionKwh,
    gridFeedInKwh,
    feedInTariff,
    consumptionTariff,
  } = req.body;

  const account = await CustomerAccount.findById(customerAccountId);

  if (!account) {
    return res.status(404).json({ message: "Customer account not found" });
  }

  if (
    !req.auth.roles.includes("admin") &&
    account.userId.toString() !== req.auth.userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const monthly = await MonthlyEnergyBalance.findOneAndUpdate(
    { customerAccountId, year, month },
    {
      $set: {
        gridConsumptionKwh,
        gridFeedInKwh,
        feedInTariff,
        consumptionTariff,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  const yearly = await recalculateYearlyEnergyBalance(customerAccountId, year);

  return res.status(201).json({
    monthlyEnergyBalance: monthly,
    yearlyEnergyBalance: yearly,
  });
}

async function listMonthlyEnergyBalances(req, res) {
  const { customerAccountId } = req.params;
  const year = req.query.year ? Number(req.query.year) : undefined;

  const account = await CustomerAccount.findById(customerAccountId);

  if (!account) {
    return res.status(404).json({ message: "Customer account not found" });
  }

  if (
    !req.auth.roles.includes("admin") &&
    account.userId.toString() !== req.auth.userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const filter = { customerAccountId };
  if (year !== undefined && !Number.isNaN(year)) {
    filter.year = year;
  }

  const items = await MonthlyEnergyBalance.find(filter).sort({
    year: 1,
    month: 1,
  });
  return res.json(items);
}

async function getYearlyEnergyBalance(req, res) {
  const { customerAccountId, year } = req.params;

  const account = await CustomerAccount.findById(customerAccountId);

  if (!account) {
    return res.status(404).json({ message: "Customer account not found" });
  }

  if (
    !req.auth.roles.includes("admin") &&
    account.userId.toString() !== req.auth.userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let yearly = await YearlyEnergyBalance.findOne({
    customerAccountId,
    year: Number(year),
  });

  if (!yearly) {
    yearly = await recalculateYearlyEnergyBalance(
      customerAccountId,
      Number(year),
    );
  }

  return res.json(yearly);
}

module.exports = {
  upsertMonthlyEnergyBalance,
  listMonthlyEnergyBalances,
  getYearlyEnergyBalance,
};
