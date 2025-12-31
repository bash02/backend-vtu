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
router.post("/data", auth, buyData);
router.get("/data", auth, getAllDataTransactions);

// for admin
router.post("/admin/edit-plan", auth, upsertPlanPrice);

// AIRTIME //
router.post("/airtime", auth, buyAirtime);

// EDUCATION PIN //
router.post("/education-pin", auth, buyEducationPin);

// ELECTRICITY //
router.post("/electricity", auth, buyElectricity);
router.get("/electricity/validate-meter", auth, validateMeter);

// CABLE //
router.post("/cable", auth, buyCable);
router.get("/cable/validate-iuc", auth, validateIUC);

export default router;
