const MonthlyEnergyBalance = require("../models/MonthlyEnergyBalance");
const {
  recalculateYearlyEnergyBalance,
} = require("../services/yearlyEnergyBalanceService");

async function recalculateAllYearlyEnergyBalances(req, res) {
  const pairs = await MonthlyEnergyBalance.aggregate([
    {
      $group: {
        _id: {
          customerAccountId: "$customerAccountId",
          year: "$year",
        },
      },
    },
  ]);

  const results = [];
  for (const pair of pairs) {
    const yearly = await recalculateYearlyEnergyBalance(
      pair._id.customerAccountId,
      pair._id.year,
    );
    results.push(yearly);
  }

  return res.json({
    message: "Recalculation completed",
    count: results.length,
    results,
  });
}

async function recalculateCustomerAccountYear(req, res) {
  const yearly = await recalculateYearlyEnergyBalance(
    req.params.customerAccountId,
    Number(req.params.year),
  );

  return res.json(yearly);
}

module.exports = {
  recalculateAllYearlyEnergyBalances,
  recalculateCustomerAccountYear,
};
