import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Provider } from "../models/provider";

/* -------------------- helpers -------------------- */
const getIdFromQuery = (req: Request): string | null => {
  const { id } = req.query;
  return typeof id === "string" ? id : null;
};

const validateObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);

/* -------------------- controllers -------------------- */

/**
 * CREATE Provider
 * POST /providers
 */
export const createProvider = async (req: Request, res: Response) => {
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json({ status: true, data: provider });
  } catch (err: any) {
    res.status(400).json({ status: false, error: err.message });
  }
};

/**
 * GET all Providers
 * GET /providers
 */
export const getProviders = async (_req: Request, res: Response) => {
  const providers = await Provider.find().sort({ priority: 1 });
  res.json({ status: true, data: providers });
};

/**
 * GET single Provider
 * GET /providers/single?id=xxxx
 */
export const getProvider = async (req: Request, res: Response) => {
  const id = getIdFromQuery(req);

  if (!id)
    return res.status(400).json({ status: false, error: "id is required" });

  if (!validateObjectId(id))
    return res.status(400).json({ status: false, error: "Invalid ObjectId" });

  const provider = await Provider.findById(id);

  if (!provider)
    return res.status(404).json({ status: false, error: "Provider not found" });

  res.json({ status: true, data: provider });
};

/**
 * UPDATE Provider (PATCH)
 * PATCH /providers?id=xxxx
 */
export const updateProvider = async (req: Request, res: Response) => {
  const id = getIdFromQuery(req);

  if (!id)
    return res.status(400).json({ status: false, error: "id is required" });

  if (!validateObjectId(id))
    return res.status(400).json({ status: false, error: "Invalid ObjectId" });

  const provider = await Provider.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!provider)
    return res.status(404).json({ status: false, error: "Provider not found" });

  res.json({ status: true, data: provider });
};

/**
 * DELETE Provider
 * DELETE /providers?id=xxxx
 */
export const deleteProvider = async (req: Request, res: Response) => {
  const id = getIdFromQuery(req);

  if (!id)
    return res.status(400).json({ status: false, error: "id is required" });

  if (!validateObjectId(id))
    return res.status(400).json({ status: false, error: "Invalid ObjectId" });

  const provider = await Provider.findByIdAndDelete(id);

  if (!provider)
    return res.status(404).json({ status: false, error: "Provider not found" });

  res.json({ status: true, message: "Provider deleted" });
};
