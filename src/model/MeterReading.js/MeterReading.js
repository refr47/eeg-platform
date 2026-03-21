import mongoose from "mongoose";
const meterReadingSchema = new mongoose.Schema(
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
      index: true,
    },
    recordedAt: { type: Date, required: true, default: Date.now, index: true },
    gridImportKw: { type: Number, required: true, min: 0, default: 0 },
    gridExportKw: { type: Number, required: true, min: 0, default: 0 },
    cumulativeImportKwh: { type: Number, required: true, min: 0 },
    cumulativeExportKwh: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, default: "mqtt" },
  },
  { timestamps: false },
);
export default mongoose.model("MeterReading", meterReadingSchema);
