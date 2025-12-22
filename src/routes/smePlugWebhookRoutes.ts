import { Router } from "express";
import { smePlugWebhook } from "../controllers/smePlugWebhook.Controller";

const router = Router();

// SMEPlug Webhook Route
router.post("/smeplug", smePlugWebhook);

export default router;
