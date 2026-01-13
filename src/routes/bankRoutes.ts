import { Router } from "express";
import { fetchProvidersController, generateDVA, getBankListController } from "../controllers/bank.Controller";

const router = Router();

// GET /api/banks?country=nigeria
router.get("/banks", getBankListController);

// GET /api/providers
router.get("/providers", fetchProvidersController);

router.post("/dva/generate", generateDVA);

export default router;
