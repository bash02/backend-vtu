import { Router } from "express";
import { auth } from "../middleware/auth";
import { getAllPlans } from "../controllers/utility.controller";

const router = Router();

// USER //
router.get("/plans", auth, getAllPlans);

export default router;
