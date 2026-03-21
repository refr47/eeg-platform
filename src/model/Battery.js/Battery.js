import mongoose from "mongoose";
const batterySchema = new mongoose.Schema(
  {
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      index: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    capacityKwh: { type: Number, required: true, min: 0 },
    maxChargePowerKw: { type: Number, required: true, min: 0 },
    maxDischargePowerKw: { type: Number, required: true, min: 0 },
    minSocPercent: { type: Number, required: true, min: 0, max: 100 },
    maxSocPercent: { type: Number, required: true, min: 0, max: 100 },
    allowGridCharging: { type: Boolean, required: true, default: false },
    allowEegCharging: { type: Boolean, required: true, default: true },
    allowDischargeToHome: { type: Boolean, required: true, default: true },
    allowDischargeToEeg: { type: Boolean, required: true, default: false },
    allowDischargeToGrid: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("Battery", batterySchema);
