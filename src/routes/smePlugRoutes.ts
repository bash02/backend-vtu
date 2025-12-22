import express from "express";
import {
  getWalletBalance,
  getNetworks,
  purchaseDataPlan,
  vtuTopup,
  getTransaction,
  fetchDevices,
  getTransactions,
  upsertPlanPrice,
  getDataPlans,
} from "../controllers/smePlug.Controller";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";

const router = express.Router();

router.get("/wallet-balance", admin, getWalletBalance);
router.get("/networks", auth, getNetworks);
router.get("/data-plans", auth, getDataPlans);

// for admin
router.post("/admin/edit-plan", auth, admin, upsertPlanPrice);
router.post("/purchase-data-plan", auth, purchaseDataPlan);
router.post("/vtu-topup", auth, vtuTopup);
router.get("/transaction", auth, getTransaction);
router.get("/transactions", auth, getTransactions);
router.get("/devices", auth, fetchDevices);

export default router;
