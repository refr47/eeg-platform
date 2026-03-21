const mongoose = require("mongoose");

const eegStateSchema = new mongoose.Schema(
  {
    eegId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eeg",
      required: true,
      index: true,
    },
    recordedAt: { type: Date, required: true, default: Date.now, index: true },
    availablePowerKw: { type: Number, required: true, min: 0 },
    consumedPowerKw: { type: Number, required: true, min: 0 },
    surplusPowerKw: { type: Number, required: true, min: 0, default: 0 },
    deficitPowerKw: { type: Number, required: true, min: 0, default: 0 },
    source: { type: String, required: true, default: "aggregation" },
  },
  { timestamps: false },
);

module.exports = mongoose.model("EegState", eegStateSchema);
