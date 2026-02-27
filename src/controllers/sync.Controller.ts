import type { Request, Response } from "express";
import { ProductModel } from "../models/product";
import { UserModel } from "../models/user";
import { SaleModel } from "../models/sale";
import { CategoryModel } from "../models/category";


// Generic sync resolver for any model
async function resolveSync(Model: any, incoming: any) {
  const { id, deleted, synced, ...rest } = incoming;
  let record = await Model.findById(Number(id));
  if (!record) {
    if (!deleted) {
      // create new record if not deleted
      record = await Model.create({ id: Number(id), ...rest, deleted: false, synced: true });
      return { action: "created", record };
    }
    return { action: "skipped", reason: "deleted and not found" };
  }
  // If deleted, remove it
  if (deleted) {
    await Model.delete(Number(id));
    return { action: "deleted", record };
  }
  // If not deleted, update fields and mark as synced
  const updated = await Model.update(Number(id), { ...rest, deleted: false, synced: true });
  return { action: "updated", record: updated };
}

export const syncController = async (req: Request, res: Response) => {
  try {
    const { products = [], users = [], sales = [], categories = [] } = req.body;
    const results: any = { products: [], users: [], sales: [], categories: [] };

    // Upsert client rows
    for (const p of products) results.products.push(await resolveSync(ProductModel, p));
    for (const u of users) results.users.push(await resolveSync(UserModel, u));
    for (const s of sales) results.sales.push(await resolveSync(SaleModel, s));
    for (const c of categories) results.categories.push(await resolveSync(CategoryModel, c));

    // Fetch all rows where synced = false (server-side unsynced)
    const fetchUnsynced = async (Model: any) => {
      const rows = await Model.findAll();
      const unsynced = rows.filter((r: any) => r.synced === false && r.deleted === false);
      // After fetching, mark as synced
      for (const r of unsynced) {
        await Model.update(r.id, { synced: true });
      }
      return unsynced;
    };

    const updatedProducts = await fetchUnsynced(ProductModel);
    const updatedUsers = await fetchUnsynced(UserModel);
    const updatedSales = await fetchUnsynced(SaleModel);
    const updatedCategories = await fetchUnsynced(CategoryModel);

    res.json({
      success: true,
      results,
      updatedSince: {
        products: updatedProducts,
        users: updatedUsers,
        sales: updatedSales,
        categories: updatedCategories,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Sync failed" });
  }
};

export const getUnsyncedController = async (req: Request, res: Response) => {
  try {
    // Generic helper: mark synced, remove deleted
    const processRecords = async (Model: any) => {
      const records = await Model.findAll();
      const unsynced = records.filter((r: any) => r.synced === false);
      // Mark all as synced
      for (const r of unsynced) {
        await Model.update(r.id, { synced: true });
      }
      // Remove deleted records
      const deletedIds = unsynced.filter((r: any) => r.deleted === true || r.deleted === 1).map((r: any) => r.id);
      for (const id of deletedIds) {
        await Model.delete(id);
      }
      return unsynced;
    };

    const products = await processRecords(ProductModel);
    const users = await processRecords(UserModel);
    const sales = await processRecords(SaleModel);
    const categories = await processRecords(CategoryModel);

    res.json({
      success: true,
      products,
      users,
      sales,
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch unsynced records" });
  }
};