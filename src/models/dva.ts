import mongoose, { Schema } from "mongoose";

const dvaSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_code: { type: String, required: true, unique: true },
  account_number: { type: String, required: true, unique: true },
  account_name: String,
  bankname: String,
  currency: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const DVA = mongoose.model("DVA", dvaSchema);
