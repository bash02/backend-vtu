import { Router } from "express";
import {
  createCustomerAndAssignDVA,
  getDvaBankProviders,
} from "../controllers/dva.Controller";
import { auth } from "../middleware/auth";

const router = Router();

// Create customer and assign DVA (single endpoint)
router.post("/assign", auth, createCustomerAndAssignDVA);
// Fetch available bank providers for DVA
router.get("/providers", auth, getDvaBankProviders);

export default router;
