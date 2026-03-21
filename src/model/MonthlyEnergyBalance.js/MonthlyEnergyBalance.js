import mongoose from "mongoose";
const monthlyEnergyBalanceSchema = new mongoose.Schema(
  {
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      index: true,
    },
    year: { type: Number, required: true, min: 2000, max: 3000 },
    month: { type: Number, required: true, min: 1, max: 12 },
    gridConsumptionKwh: { type: Number, required: true, min: 0, default: 0 },
    gridFeedInKwh: { type: Number, required: true, min: 0, default: 0 },
    feedInTariff: { type: Number, required: true, min: 0 },
    consumptionTariff: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);
monthlyEnergyBalanceSchema.index(
  { customerAccountId: 1, year: 1, month: 1 },
  { unique: true },
);
export default mongoose.model(
  "MonthlyEnergyBalance",
  monthlyEnergyBalanceSchema,
);
