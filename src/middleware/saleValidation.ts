import type { Request, Response, NextFunction } from "express";
import Joi from "joi";

// PATCH/UPDATE: All fields optional
export const salePatchSchema = Joi.object({
  items: Joi.string().optional(),
  total_amount: Joi.number().optional(),
  payment_method: Joi.string().optional(),
  deleted: Joi.boolean().default(false),
  synced: Joi.boolean().default(false),
});

export function validateSalePatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = salePatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}

// CREATE/POST: Required fields for creation
export const saleCreateSchema = Joi.object({
  items: Joi.string().required(),
  total_amount: Joi.number().required(),
  payment_method: Joi.string().required(),
  deleted: Joi.boolean().default(false),
  synced: Joi.boolean().default(false),
});

export function validateSaleCreate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = saleCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((d) => d.message).join(", "),
    });
  }
  return next();
}
