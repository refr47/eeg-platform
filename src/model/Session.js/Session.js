import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenId: { type: String, required: true, index: true },
    createdAt: { type: Date, required: true, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: false },
);
export default mongoose.model("Session", sessionSchema);
