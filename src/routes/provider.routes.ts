import { Router } from "express";
import {
  createProvider,
  getProviders,
  getProvider,
  updateProvider,
  deleteProvider,
} from "../controllers/provider.controller";

const router = Router();

router.post("/", createProvider);
router.get("/", getProviders);
router.get("/single", getProvider);
router.patch("/", updateProvider);
router.delete("/", deleteProvider);

export default router;
