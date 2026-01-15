import type { Request, Response } from "express";
import { assignDedicatedAccount, fetchDvaBanks, getBankList } from "../services/paystackService";
import { User } from "../models/user";

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


// controllers/dva.controller.ts

export const generateDVA = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string | undefined;
    console.log("Generating DVA for user ID:", userId);
    if (!userId)
      return res.status(400).json({ success: false, error: "User ID is required" });
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const dvaPayload = {
      email: user.email,
      first_name: user.name?.split(" ")[0] || user.name,
      last_name: user.name?.split(" ")[1] || "",
      phone: user.phone,
      preferred_bank: "wema-bank",
      country: "NG",
    };

    const dvaResponse = await assignDedicatedAccount(dvaPayload);

    res.json({
      success: true,
      message: "DVA request sent",
      data: dvaResponse,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "DVA generation failed",
    });
  }
};
