import mongoose from "mongoose";

const dvaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer_code: { type: String, required: true },
    account_name: { type: String },
    account_number: { type: String },
    bankname: { type: String },
    currency: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
  },
  { timestamps: true }
);

const DVA = mongoose.models.DVA || mongoose.model("DVA", dvaSchema);

export { DVA };
