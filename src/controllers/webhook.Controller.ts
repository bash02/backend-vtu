import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
import crypto from "crypto";
import { Transaction } from "../models/transaction";
import { Charge } from "../models/charge";
import { User } from "../models/user";
import { ExpoToken } from "../models/expoToken";
import { sendExpoNotification } from "../utils";

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

    // Respond immediately to Paystack
    res.status(200).send("OK");

    // Continue async processing (no further response)
    const event = req.body;

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

          // Find user by DVA account number
          const user = await User.findOne({
            "dva.account_number": accountNumber,
          });
          if (!user) {
            console.error("User not found for DVA account number:", accountNumber);
            return;
          }
          const userId = user._id;

          const exists = await Transaction.findOne({ reference: tx.reference });
          if (exists) return;

          const amount = tx.amount / 100;

          const systemCharge = await Charge.findOne({ type: "funding" });
          const chargeAmount = systemCharge?.amount || 0;

          await Transaction.create({
            user: userId,
            reference: tx.reference,
            type: "wallet",
            provider: "paystack",
            amount: `${amount}`,
            fee: chargeAmount,
            total: amount - chargeAmount,
            number: accountNumber,
            status: "success",
            response: tx,
          });

          await User.findByIdAndUpdate(userId, {
            $inc: { balance: amount - chargeAmount },
          });

          // Send push notification if Expo token exists
          const tokenDoc = await ExpoToken.findOne({ userId });
          if (tokenDoc) {
            const title = "Wallet Funded";
            const body = `Your wallet has been credited with ₦${amount - chargeAmount}. Reference: ${tx.reference}`;
            await sendExpoNotification(tokenDoc.expoPushToken, title, body);
          }
        } catch (err) {
          console.error("charge.success error:", err);
        }
        break;
      }

      case "dedicatedaccount.assign.success": {
        try {
          const data = event.data;
          const user = await User.findOne({ email: data.customer.email });
          if (!user) {
            console.error("User not found for email:", data.customer.email);
            return;
          }

          user.dva = {
            customer_code: data.customer.customer_code,
            account_number: data.dedicated_account.account_number,
            account_name: data.dedicated_account.account_name,
            bankname: data.dedicated_account.bank.name,
            currency: data.dedicated_account.currency,
          };

          // Clear reserved flag: DVA fully assigned now
          user.dvaReserved = false;

          await user.save();

          // Send push notification if token exists
          const tokenDoc = await ExpoToken.findOne({ userId: user._id });
          if (tokenDoc) {
            const title = "Dedicated Account Assigned";
            const body = `A dedicated bank account has been assigned to you: ${data.dedicated_account.account_number} (${data.dedicated_account.bank.name})`;
            await sendExpoNotification(tokenDoc.expoPushToken, title, body);
          }

          console.log("Dedicated account saved and reserved flag cleared for user:", user._id);
        } catch (err) {
          console.error("DVA assign error:", err);
        }
        break;
      }

      case "dedicatedaccount.assign.failed": {
        try {
          const data = event.data;
          const user = await User.findOne({ email: data.customer.email });
          if (!user) return;

          // Clear reserved flag on failure so user can retry
          user.dvaReserved = false;
          await user.save();
        } catch (err) {
          console.error("DVA assign failure error:", err);
        }
        break;
      }

      default:
        // Other webhook events can be handled here if needed
        break;
    }
  } catch (err) {
    // Errors before sending response
    console.error("Webhook fatal error:", err);
    if (!res.headersSent) {
      res.status(500).send("Webhook error");
    }
  }
};
