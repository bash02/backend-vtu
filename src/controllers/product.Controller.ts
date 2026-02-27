
import type { Request, Response } from "express";
import { ProductModel } from "../models/product";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, quantity, sku, image, category_id } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: "name, price, and quantity are required" });
    }

    console.log(req.body);

    // Prisma will throw unique constraint error for SKU
    const product = await ProductModel.create({
      name,
      description,
      price,
      quantity,
      sku,
      image,
      category_id,
      synced: false,
      deleted: false,
    });
    res.status(201).json(product);
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002") return res.status(400).json({ error: "SKU must be unique" });
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.findAll();
    const filtered = products.filter((p: any) => !p.deleted);
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(Number(id));
    if (!product || (product as any).deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(Number(id));
    if (!product || (product as any).deleted || (product as any).synced) return res.status(404).json({ error: "Product not found or synced" });

    const allowedFields = ["name", "description", "price", "quantity", "sku", "image", "category_id"];
    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const updatedProduct = await ProductModel.update(Number(id), data);
    res.json({ success: true, data: updatedProduct });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(400).json({ error: "SKU must be unique" });
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(Number(id));
    if (!product || (product as any).deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    await ProductModel.update(Number(id), { deleted: true, synced: false });
    res.json({
      success: true,
      message: "Product marked as deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};