import type { Request, Response } from "express";
import { Charge } from "../models/charge";

// Create a charge
export const createCharge = async (req: Request, res: Response) => {
  try {
    const { amount, type } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        error: "Amount and type are required",
      });
    }

    const charge = await Charge.create({ amount, type });
    res.status(201).json({ success: true, charge });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Get all charges
export const getCharges = async (_req: Request, res: Response) => {
  try {
    const charges = await Charge.find().sort({ createdAt: -1 });
    res.json({ success: true, charges });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Get charge by QUERY param
export const getChargeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        error: "Charge id is required",
      });
    }

    const charge = await Charge.findById(id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        error: "Charge not found",
      });
    }

    res.json({ success: true, charge });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Invalid charge ID",
    });
  }
};

// Update charge by QUERY param
export const updateCharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { amount, type } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        error: "Charge id is required",
      });
    }

    const charge = await Charge.findByIdAndUpdate(
      id,
      { amount, type },
      { new: true, runValidators: true }
    );

    if (!charge) {
      return res.status(404).json({
        success: false,
        error: "Charge not found",
      });
    }

    res.json({ success: true, charge });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Delete charge by QUERY param
export const deleteCharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        error: "Charge id is required",
      });
    }

    const charge = await Charge.findByIdAndDelete(id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        error: "Charge not found",
      });
    }

    res.json({ success: true, message: "Charge deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};
