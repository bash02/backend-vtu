import mongoose, { Schema } from "mongoose";

const dvaSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_code: { type: String, required: true, unique: true },
  account_number: { type: String, required: true, unique: true },
  account_name: String,
  bankname: String,
  currency: String,
  created_at: Date,
  updated_at: Date,
});

export const DVA = mongoose.model("DVA", dvaSchema);
