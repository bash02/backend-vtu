import mongoose, { Schema } from "mongoose";
import type { ITransaction } from "../types/models";

const transactionSchema = new Schema<ITransaction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
   required: false,
    index: true,
  },

  reference: {
    type: String,
   required: false,
    unique: true,
    index: true,
  },

  type: {
    type: String,
    enum: ["airtime", "data", "electricity", "cable", "wallet"],
   required: false
  },

  provider: {
    type: String,
   required: false
  },

  amount: {
    type: Number,
   required: false,
    min: 0,
  },

  fee: {
    type: Number,
    default: 0,
    min: 0,
  },

  total: {
    type: Number,
   required: false
  },

  status: {
    type: String,
    enum: ["pending", "success", "failed", "reversed"],
    default: "pending",
    index: true,
  },

  phone: String,
  meterNumber: String,
  smartCardNumber: String,

  response: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    },
});

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
