import type { Request, Response } from "express";
import { SaleModel } from "../models/sale";



export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await SaleModel.findAll();
    const filtered = sales.filter((s: any) => !s.deleted);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
};



export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    const sale = await SaleModel.findById(Number(id));
    if (!sale || (sale as any).deleted) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sale" });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const { items, total_amount, payment_method } = req.body;
    if (!items || total_amount === undefined) {
      return res.status(400).json({
        error: "items and total_amount are required",
      });
    }
    const sale = await SaleModel.create({
      items,
      total_amount,
      payment_method: payment_method || "cash",
      synced: false,
      deleted: false,
    });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Failed to create sale" });
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing sale id parameter",
    });
  }

  try {
    const sale = await SaleModel.findById(Number(id));
    if (!sale || (sale as any).deleted) {
      return res.status(404).json({
        success: false,
        error: "Sale not found",
      });
    }
    await SaleModel.update(Number(id), { deleted: true, synced: false });
    res.json({
      success: true,
      message: "Sale marked as deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Server error",
    });
  }
};



export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const sale = await SaleModel.findById(Number(id));
    if (!sale || (sale as any).deleted) {
      return res.status(404).json({ error: "Sale not found" });
    }

    const updateData: any = {
      synced: false,
    };

    if (req.body.items !== undefined)
      updateData.items = req.body.items;

    if (req.body.total_amount !== undefined)
      updateData.total_amount = req.body.total_amount;

    if (req.body.payment_method !== undefined)
      updateData.payment_method = req.body.payment_method;

    const updatedSale = await SaleModel.update(Number(id), updateData);

    res.json({
      success: true,
      data: updatedSale,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update sale" });
  }
};