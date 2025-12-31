import mongoose from "mongoose";

const ExpoTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  expoPushToken: { type: String, required: true },
});

export const ExpoToken = mongoose.model("ExpoToken", ExpoTokenSchema);
