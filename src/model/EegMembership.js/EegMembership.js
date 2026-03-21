import mongoose from "mongoose";
const eegMembershipSchema = new mongoose.Schema(
  {
    eegId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eeg",
      required: true,
      index: true,
    },
    customerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["member", "admin"],
      default: "member",
    },
    joinedAt: { type: Date, required: true, default: Date.now },
    leftAt: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);
eegMembershipSchema.index({ eegId: 1, customerAccountId: 1 }, { unique: true });
export default mongoose.model("EegMembership", eegMembershipSchema);
