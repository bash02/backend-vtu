import { Router } from "express";
import { paystackWebhook } from "../controllers/webhookController";

const router = Router();

// Paystack webhook endpoint
router.post("/paystack", paystackWebhook);

export default router;
