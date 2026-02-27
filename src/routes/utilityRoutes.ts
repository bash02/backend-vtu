import { Router } from "express";
import { auth } from "../middleware/auth";
import { getAllPlans, buyData } from "../controllers/utility.controller";

const router = Router();

// USER //
router.get("/plans", auth, getAllPlans);
// buydata
router.post("/buydata", auth, buyData);

export default router;
