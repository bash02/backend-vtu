import type { Request, Response, NextFunction } from "express";
import Joi from "joi";

// PATCH/UPDATE: All fields optional
export const userPatchSchema = Joi.object({
  name: Joi.string().min(5).max(50).optional(),
  email: Joi.string().min(5).max(255).optional().email(),
  password: Joi.string().min(5).max(255).optional(),
  // Allow phone numbers in international or local formats: optional leading '+', 7-15 digits, no spaces
  phone: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Phone must be 7-15 digits and may include a leading + (no spaces)",
    }),
  pin: Joi.string().length(4).optional().allow(null, ""),
  balance: Joi.number().min(0).max(1000000).optional(),
  isAdmin: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export function validateUserPatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = userPatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}

// CREATE/POST: Required fields for creation
export const userCreateSchema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(5).max(255).required(),
  // Allow phone numbers in international or local formats: optional leading '+', 7-15 digits, no spaces
  phone: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Phone must be 7-15 digits and may include a leading + (no spaces)",
    }),
  pin: Joi.string().length(4).optional().allow(null, ""),
  account_number: Joi.string().required(),  // add this
  bvn: Joi.string().required(),             // add this
  bank_code: Joi.string().required(),       // add this
  // balance: Joi.number().min(0).max(1000000).optional(),
  // isAdmin: Joi.boolean().optional(),
  // isActive: Joi.boolean().optional(),
});

export function validateUserCreate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = userCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}
