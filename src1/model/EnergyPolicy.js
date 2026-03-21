const mongoose = require("mongoose");

const energyPolicySchema = new mongoose.Schema(
  {
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      index: true,
    },
    batteryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Battery",
      required: true,
      index: true,
    },
    preferEegCharging: { type: Boolean, required: true, default: true },
    allowBatteryDischargeWhenEegDeficit: {
      type: Boolean,
      required: true,
      default: true,
    },
    allowBatteryFeedInToEeg: { type: Boolean, required: true, default: false },
    allowBatteryFeedInToGrid: { type: Boolean, required: true, default: false },
    reserveSocPercent: { type: Number, required: true, min: 0, max: 100 },
    targetSocPercent: { type: Number, required: true, min: 0, max: 100 },
    maxChargePowerKw: { type: Number, required: true, min: 0 },
    maxDischargePowerKw: { type: Number, required: true, min: 0 },
    priority: { type: Number, required: true, default: 10 },
    isActive: { type: Boolean, required: true, default: true },
    validFrom: { type: Date, required: true, default: Date.now },
    validTo: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EnergyPolicy", energyPolicySchema);
