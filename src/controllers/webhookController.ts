import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
import crypto from "crypto";
import { Transaction } from "../models/transaction";
import { DVA } from "../models/dva";
import { Charge } from "../models/charge";
import { User } from "../models/user";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export const paystackWebhook = async (req: Request, res: Response) => {
  // Verify signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).json({ success: false, error: "Invalid signature" });
  }

  // Respond immediately
  res.status(200).send("OK");

  // Handle event asynchronously
  const event = req.body;
  console.log("Received Paystack webhook event:", event);
  switch (event.event) {
    case "charge.success": {
      const tx = event.data;

      //  Get DVA account number
      const accountNumber =
        tx.authorization?.receiver_bank_account_number ||
        tx.metadata?.receiver_account_number;

      if (!accountNumber) {
        console.error("Missing DVA account number");
        break;
      }

      // Find DVA → user
      const dva = await DVA.findOne({ account_number: accountNumber } as any);
      if (!dva) {
        console.error("DVA not found for:", accountNumber);
        break;
      }

      const userId = dva.user;

      // Prevent duplicate webhook
      const exists = await Transaction.findOne({ reference: tx.reference });
      if (exists) break;

      //  Amount deposited (Paystack sends kobo)
      const amount = tx.amount / 100;

      // Get system charge (optional)
      const systemCharge = await Charge.findOne({ type: "funding" });
      const chargeAmount = systemCharge?.amount || 0;

      // Create transaction
      await Transaction.create({
        user: userId,
        reference: tx.reference,
        type: "wallet",
        provider: "paystack",
        amount: amount,
        fee: chargeAmount, // system charge (record only)
        total: amount, // user gets FULL amount
        status: "success",
        response: tx,
        createdAt: new Date(tx.paid_at),
      });

      // 7️⃣ Credit FULL amount to user balance
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: amount },
      });

      console.log("User credited:", amount, "User:", userId);
      break;
    }
    case "customeridentification.success":
      break;
    case "customeridentification.failed":
      break;
    case "dedicatedaccount.assign.success": {
      const data = event.data;
      console.log("Dedicated account assigned:", data);
      try {
        await import("../models/dva").then(async ({ DVA }) => {
          await DVA.updateOne(
            { customer_code: data.customer.customer_code } as any,
            {
              account_number: data.dedicated_account.account_number,
              account_name: data.dedicated_account.account_name,
              bankname: data.dedicated_account.bank.name,
              currency: data.dedicated_account.currency,
              created_at: data.dedicated_account.created_at,
              updated_at: data.dedicated_account.updated_at,
            },
            { upsert: true }
          );
        });
      } catch (e) {
        // Optionally log error
      }
      break;
    }
    case "dedicatedaccount.assign.failed":
      break;
    default:
      break;
  }
};
