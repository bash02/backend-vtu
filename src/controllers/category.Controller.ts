import type { Request, Response } from "express";
import { CategoryModel } from "../models/category";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.findAll();
    const filtered = categories.filter((c: any) => !c.deleted && !c.synced);
    res.json({ success: true, categories: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(Number(id));
    if (!category || (category as any).deleted) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }
    const category = await CategoryModel.create({ name, deleted: false, synced: false });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : "Invalid data" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await CategoryModel.update(Number(id), { name, deleted: false, synced: false });
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : "Invalid data" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(Number(id));
    if (!category || (category as any).deleted) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    await CategoryModel.update(Number(id), { deleted: true, synced: false });
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete category" });
  }
};
