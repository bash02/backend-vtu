import type { Request, Response } from "express";
import { Transaction } from "../models/transaction";


const SECRET_KEY = process.env.SMEPLUG_SECRET_KEY || "";

export const smePlugWebhook = async (req: Request, res: Response) => {
  try {


    // Authorization check
    if (req.headers.authorization !== `Bearer ${SECRET_KEY}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { transaction } = req.body;

    if (!transaction?.reference) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // Find transaction by reference
    const existing = await Transaction.findOne({
      reference: transaction.reference,
    });

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Prevent double processing
    if (existing.status === "success") {
      return res.json({
        success: true,
        message: "Transaction already processed",
      });
    }

    const isSuccess = transaction.status === "success";

    // Update transaction status and response ONLY
    existing.status = isSuccess ? "success" : "failed";
    existing.response = transaction;
    await existing.save();

    // **NO USER DEBITING HERE**

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Webhook error",
    });
  }
};
