import { Router } from "express";
import { paystackWebhook } from "../controllers/webhook.Controller";

const router = Router();

// Paystack webhook endpoint
router.post("/paystack", paystackWebhook);

export default router;
