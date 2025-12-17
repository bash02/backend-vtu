import mongoose, { Schema} from "mongoose";
import type { ITransaction } from "../types/models";

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["airtime", "data", "electricity", "cable", "wallet"],
      required: true,
    },

    provider: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
