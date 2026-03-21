const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      default: null,
      index: true,
    },
    eegId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eeg",
      default: null,
      index: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: [
        "smartMeter",
        "battery",
        "inverter",
        "gateway",
        "charger",
        "sensor",
      ],
    },
    name: { type: String, required: true, trim: true },
    manufacturer: { type: String, trim: true, default: null },
    model: { type: String, trim: true, default: null },
    serialNumber: { type: String, required: true, trim: true, unique: true },
    mqttClientId: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true,
    },
    mqttTopicBase: { type: String, trim: true, default: null },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "disabled"],
      default: "active",
    },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Device", deviceSchema);
