import mongoose from "mongoose";

const dvaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Not always available from webhook
      unique: false, // Not always unique from webhook
    },
    customer_code: { type: String, required: true },
    account_name: { type: String },
    account_number: { type: String },
    bank: {
      name: { type: String },
      id: { type: Number },
      slug: { type: String },
    },
    currency: { type: String },
    active: { type: Boolean },
    assigned: { type: Boolean },
    assignment: {
      assignee_id: { type: Number },
      assignee_type: { type: String },
      account_type: { type: String },
      integration: { type: Number },
    },
    created_at: { type: Date },
    updated_at: { type: Date },
  },
  { timestamps: true }
);

const DVA = mongoose.models.DVA || mongoose.model("DVA", dvaSchema);

export { DVA };
