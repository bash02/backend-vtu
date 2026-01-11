import { Router } from "express";
import { fetchProvidersController, getBankListController } from "../controllers/bank.Controller";

const router = Router();

// GET /api/banks?country=nigeria
router.get("/banks", getBankListController);

// GET /api/providers
router.get("/providers", fetchProvidersController);

export default router;
