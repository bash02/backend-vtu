// models/PlanPrice.ts
import mongoose from "mongoose";

const PlanPriceSchema = new mongoose.Schema(
  {
    plan_key: { type: String, unique: true, index: true },
    provider: { type: String, required: true },

    selling_price: { type: Number, required: true },
    is_active: { type: Boolean, default: true },

    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PlanPrice =  mongoose.model("PlanPrice", PlanPriceSchema);


export { PlanPrice };