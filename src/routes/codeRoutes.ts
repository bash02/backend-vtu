import { Router } from "express";
import * as codeController from "../controllers/codeController";

const router = Router();

// Send code for reset (password, pin, email)
router.post("/send-reset-code", codeController.sendResetCode);
// Change password
router.post("/change-password", codeController.changePassword);
// Change pin
router.post("/change-pin", codeController.changePin);
// Change email
router.post("/change-email", codeController.changeEmail);
// Confirm email with code and activate user
router.post("/confirm-email", codeController.confirmEmail);

export default router;
