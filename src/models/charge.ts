import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema({
  amount: { type: Number },
  type: {
    type: String,
    enum: ["funding", "debit", "data", "airtime", "cable", "electricity"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Charge = mongoose.model("Charge", chargeSchema);

export { Charge };
