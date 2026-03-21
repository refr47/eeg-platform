import mongoose from "mongoose";
const yearlyEnergyBalanceSchema = new mongoose.Schema(
  {
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      index: true,
    },
    year: { type: Number, required: true, min: 2000, max: 3000 },
    gridConsumptionKwh: { type: Number, required: true, min: 0, default: 0 },
    gridFeedInKwh: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);
yearlyEnergyBalanceSchema.index(
  { customerAccountId: 1, year: 1 },
  { unique: true },
);
export default mongoose.model("YearlyEnergyBalance", yearlyEnergyBalanceSchema);
