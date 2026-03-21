const mongoose = require("mongoose");
const MonthlyEnergyBalance = require("../models/MonthlyEnergyBalance");
const YearlyEnergyBalance = require("../models/YearlyEnergyBalance");

async function recalculateYearlyEnergyBalance(customerAccountId, year) {
  const objectId =
    customerAccountId instanceof mongoose.Types.ObjectId
      ? customerAccountId
      : new mongoose.Types.ObjectId(customerAccountId);

  const result = await MonthlyEnergyBalance.aggregate([
    {
      $match: {
        customerAccountId: objectId,
        year,
      },
    },
    {
      $group: {
        _id: null,
        gridConsumptionKwh: { $sum: "$gridConsumptionKwh" },
        gridFeedInKwh: { $sum: "$gridFeedInKwh" },
      },
    },
  ]);

  const totals = result[0] || {
    gridConsumptionKwh: 0,
    gridFeedInKwh: 0,
  };

  const yearly = await YearlyEnergyBalance.findOneAndUpdate(
    { customerAccountId: objectId, year },
    {
      $set: {
        gridConsumptionKwh: totals.gridConsumptionKwh,
        gridFeedInKwh: totals.gridFeedInKwh,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return yearly;
}

module.exports = {
  recalculateYearlyEnergyBalance,
};
