import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
import crypto from "crypto";
import { Transaction } from "../models/transaction";
import { DVA } from "../models/dva.schema";
import { Charge } from "../models/charge";
import { User } from "../models/user";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    // RESPOND IMMEDIATELY
    res.status(200).send("OK");

    // Continue async processing (NO RESPONSE HERE)
    const event = req.body;
    console.log("Received Paystack webhook event:", event);

    switch (event.event) {
      case "charge.success": {
        try {
          const tx = event.data;

          const accountNumber =
            tx.authorization?.receiver_bank_account_number ||
            tx.metadata?.receiver_account_number;

          if (!accountNumber) {
            console.error("Missing DVA account number");
            return;
          }

          const dva = await DVA.findOne({ account_number: accountNumber });
          console.log("DVA found:", dva);
          if (!dva) {
            console.error("DVA not found:", accountNumber);
            return;
          }

          const userId = dva.userId;
          console.log("User ID from DVA:", userId);

          if (!userId) {
            console.error("User ID missing on DVA document");
            return;
          }

          const exists = await Transaction.findOne({
            reference: tx.reference,
          });
          if (exists) return;

          const amount = tx.amount / 100;

          const systemCharge = await Charge.findOne({ type: "funding" });
          const chargeAmount = systemCharge?.amount || 0;

          await Transaction.create({
            user: userId,
            reference: tx.reference,
            type: "wallet",
            provider: "paystack",
            amount,
            fee: chargeAmount,
            total: amount - chargeAmount,
            status: "success",
            response: tx,
          });

          await User.findByIdAndUpdate(userId, {
            $inc: { balance: amount - chargeAmount },
          });

          console.log("User credited:", amount, "User:", userId);
        } catch (err) {
          console.error("charge.success error:", err);
        }
        break;
      }

      case "dedicatedaccount.assign.success": {
        try {
          const data = event.data;

          // Find user by email from the webhook data
          const user = await User.findOne({ email: data.customer.email });
          if (!user) {
            console.error("User not found for email:", data.customer.email);
            return;
          }

          // Update or insert DVA with user ID linked
          await DVA.create({
            customer_code: data.customer.customer_code,
            account_number: data.dedicated_account.account_number,
            account_name: data.dedicated_account.account_name,
            bankname: data.dedicated_account.bank.name,
            currency: data.dedicated_account.currency,
            userId: user._id,
          });

          console.log("Dedicated account saved with linked user:", user._id);
        } catch (err) {
          console.error("DVA assign error:", err);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Only happens BEFORE response is sent
    console.error("Webhook fatal error:", err);
    if (!res.headersSent) {
      res.status(500).send("Webhook error");
    }
  }
};
