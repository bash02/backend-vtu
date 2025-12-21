// models/Provider.ts
import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["smeplug", "alrahuz", "billsadasub", "simhosting"],
    unique: true,
    required: true,
  },
  is_active: { type: Boolean, default: true },
  priority: { type: Number, default: 1 }, // fallback order
});

const Provider = mongoose.model("Provider", ProviderSchema);

export { Provider };
