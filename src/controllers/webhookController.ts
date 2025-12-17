import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
import crypto from "crypto";
import { Transaction } from "../models/transaction";

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
      // Create a transaction in DB after successful charge
      const tx = event.data;
      console.log("Processing charge.success for transaction:", tx);
      try {
        await Transaction.create({
          user: tx.metadata?.userId, // You must ensure userId is in metadata when initiating payment
          reference: tx.reference,
          type: "wallet",
          provider: tx.channel,
          amount: tx.amount / 100, // Paystack sends amount in kobo
          fee: tx.fees || 0,
          total: (tx.amount + (tx.fees || 0)) / 100,
          status: "success",
          response: tx,
          createdAt: new Date(tx.paid_at),
          updatedAt: new Date(),
        });
      } catch (e) {
        // Optionally log error
      }
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
            { customer_code: data.customer.customer_code },
            {
              account_number: data.dedicated_account.account_number,
              account_name: data.dedicated_account.account_name,
              bank: {
                name: data.dedicated_account.bank.name,
                id: data.dedicated_account.bank.id,
                slug: data.dedicated_account.bank.slug,
              },
              currency: data.dedicated_account.currency,
              active: data.dedicated_account.active,
              assigned: data.dedicated_account.assigned,
              assignment: data.dedicated_account.assignment,
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
