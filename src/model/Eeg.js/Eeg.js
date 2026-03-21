import mongoose from "mongoose";
const eegSchema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, trim: true },
    registeredAt: { type: Date, required: true, default: Date.now },
    memberCount: { type: Number, required: true, min: 0, default: 0 },
    configuredFeedInCapacityKw: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("Eeg", eegSchema);
