import { Router } from "express";
import { fetchProvidersController, generateDVA, getBankListController } from "../controllers/bank.Controller";
import { auth } from "../middleware/auth";

const router = Router();

// GET /api/banks?country=nigeria
router.get("/banks", getBankListController);

// GET /api/providers
router.get("/providers", fetchProvidersController);

router.post("/dva/generate", auth, generateDVA);


export default router;
