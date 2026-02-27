// models/Provider.ts
import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["smeplug", "alrahuz", "bilalsadasub", "simhosting", "gongozconcept"],
    unique: true,
    required: true,
  },
  is_active: { type: Boolean, default: true },
});

const Provider = mongoose.model("Provider", ProviderSchema);

export { Provider };
