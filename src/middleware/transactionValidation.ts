import type { Request, Response, NextFunction } from "express";
import Joi from "joi";

// PATCH/UPDATE: All fields optional
export const transactionPatchSchema = Joi.object({
  user: Joi.string().optional(),
  reference: Joi.string().optional(),
  type: Joi.string()
    .valid("airtime", "data", "electricity", "cable", "wallet")
    .optional(),
  provider: Joi.string().optional(),
  amount: Joi.number().min(0).optional(),
  fee: Joi.number().min(0).optional(),
  total: Joi.number().optional(),
  status: Joi.string()
    .valid("pending", "success", "failed", "reversed")
    .optional(),
  phone: Joi.string().optional().allow(null, ""),
  meterNumber: Joi.string().optional().allow(null, ""),
  smartCardNumber: Joi.string().optional().allow(null, ""),
  response: Joi.any().optional(),
});

export function validateTransactionPatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = transactionPatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}

// CREATE/POST: Required fields for creation
export const transactionCreateSchema = Joi.object({
  user: Joi.string().required(),
  reference: Joi.string().required(),
  type: Joi.string()
    .valid("airtime", "data", "electricity", "cable", "wallet")
    .required(),
  provider: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  fee: Joi.number().min(0).default(0),
  total: Joi.number().required(),
  status: Joi.string()
    .valid("pending", "success", "failed", "reversed")
    .optional(),
  phone: Joi.string().optional().allow(null, ""),
  meterNumber: Joi.string().optional().allow(null, ""),
  smartCardNumber: Joi.string().optional().allow(null, ""),
  response: Joi.any().optional(),
});

export function validateTransactionCreate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = transactionCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}
