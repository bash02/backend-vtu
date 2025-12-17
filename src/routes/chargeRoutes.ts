import { Router } from "express";
import {
  createCharge,
  getCharges,
  getChargeById,
  updateCharge,
  deleteCharge,
} from "../controllers/chargeController";

const router = Router();

// Create
router.post("/", createCharge);

// Get all
router.get("/", getCharges);

// Get by id (query)
router.get("/detail", getChargeById);

// Update by id (query)
router.patch("/", updateCharge);

// Delete by id (query)
router.delete("/", deleteCharge);

export default router;
