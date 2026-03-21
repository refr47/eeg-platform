import mongoose from "mongoose";
const addressSchema = new mongoose.Schema(
  {
    postalCode: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    houseNumber: { type: String, required: true, trim: true },
    doorNumber: { type: String, trim: true, default: null },
  },
  { _id: false },
);
const bankAccountSchema = new mongoose.Schema(
  {
    iban: { type: String, required: true, trim: true, uppercase: true },
    bic: { type: String, required: true, trim: true, uppercase: true },
    accountNumber: { type: String, required: true, trim: true },
  },
  { _id: false },
);
const customerAccountSchema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    meterNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{12}$/,
    },
    isProducer: { type: Boolean, required: true },
    isConsumer: { type: Boolean, required: true },
    deliveryPointConsumption: {
      type: String,
      required: true,
      unique: true,
      minlength: 33,
      maxlength: 33,
    },
    deliveryPointProduction: {
      type: String,
      default: null,
      minlength: 33,
      maxlength: 33,
      unique: true,
      sparse: true,
      validate: {
        validator(value) {
          if (this.isProducer) {
            return typeof value === "string" && value.length === 33;
          }
          return value === null || value === undefined || value === "";
        },
        message:
          "deliveryPointProduction is required with length 33 when isProducer is true",
      },
    },
    address: { type: addressSchema, required: true },
    bankAccount: { type: bankAccountSchema, required: true },
    registeredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);
customerAccountSchema.pre("validate", function preValidate(next) {
  if (!this.isProducer && !this.isConsumer) {
    return next(
      new Error("At least one of isProducer or isConsumer must be true"),
    );
  }
  if (!this.isProducer) {
    this.deliveryPointProduction = null;
  }
  next();
});
export default mongoose.model("CustomerAccount", customerAccountSchema);
