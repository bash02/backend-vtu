import { Router } from "express";
import {
  saveExpoToken,
  pushNotification,
} from "../controllers/notification.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/expo-token", auth, saveExpoToken);
router.post("/push-notification", auth, pushNotification);

export default router;
