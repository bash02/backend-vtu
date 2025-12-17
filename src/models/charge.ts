import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema(
  {
    amount: { type: Number },
    type: {
      type: String,
      enum: ["funding", "debit"],
      required: true,
    },
  },
  { timestamps: true }
);

const Charge = mongoose.model("Charge", chargeSchema);

export { Charge };
