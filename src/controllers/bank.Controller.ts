import type { Request, Response } from "express";
import { fetchDvaBanks, getBankList } from "../services/paystackService";

export const getBankListController = async (req: Request, res: Response) => {
  try {
    const country = req.query.country as string || "nigeria";
    const result = await getBankList(country);
    if (result.ok && result.data) {
      res.json({ success: true, banks: result.data.data });
    } else {
      res.status(500).json({ success: false, error: "Failed to fetch bank list" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};


export const fetchProvidersController = async (req: Request, res: Response) => {
  try {
    const result = await fetchDvaBanks();
    if (result.ok && result.data) {
      res.json({ success: true, providers: result.data });
    } else {
      res.status(500).json({ success: false, error: "Failed to fetch bank providers" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
}