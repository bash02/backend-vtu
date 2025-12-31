import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: mongoose.Schema.Types.String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  pin: {
    type: mongoose.Schema.Types.String,
    length: 4,
    default: null,
  },
  phone: {
    type: mongoose.Schema.Types.String,
    required: true,
    length: 11,
  },
  balance: {
    type: mongoose.Schema.Types.Number,
    min: 0.0,
    max: 1000000.0,
    default: 0.0,
  },
  isAdmin: { type: mongoose.Schema.Types.Boolean, default: false },
  isActive: { type: mongoose.Schema.Types.Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  dva: {
    customer_code: { type: mongoose.Schema.Types.String, default: null },
    account_number: { type: mongoose.Schema.Types.String, default: null },
    account_name: { type: mongoose.Schema.Types.String, default: null },
    bankname: { type: mongoose.Schema.Types.String, default: null },
    currency: { type: mongoose.Schema.Types.String, default: null },
  },
});

const User = mongoose.model("User", userSchema);

export { User };
