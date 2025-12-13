import Joi from "joi";
import mongoose from "mongoose";
import type { UserType } from "../types";

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
});

const User = mongoose.model("User", userSchema);

function validateUser(user: UserType) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    phone: Joi.string().length(11).required(),
  });

  return schema.validate(user);
}

export { User, validateUser };
