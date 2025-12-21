import { Router } from "express";
import {
  checkUserDetail,
  buyData,
  getAllDataTransactions,
  buyAirtime,
  buyEducationPin,
  buyElectricity,
  validateMeter,
  buyCable,
  validateIUC,
  upsertPlanPrice,
} from "../controllers/alrahuz.controller";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";

const router = Router();

// USER //
router.get("/data-plans", auth, checkUserDetail);

// DATA //
router.post("/data", buyData);
router.get("/data", getAllDataTransactions);

// for admin
router.post("/admin/edit-plan", auth, upsertPlanPrice);

// AIRTIME //
router.post("/airtime", buyAirtime);

// EDUCATION PIN //
router.post("/education-pin", buyEducationPin);

// ELECTRICITY //
router.post("/electricity", buyElectricity);
router.get("/electricity/validate-meter", validateMeter);

// CABLE //
router.post("/cable", buyCable);
router.get("/cable/validate-iuc", validateIUC);

export default router;
