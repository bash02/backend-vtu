import { Router } from "express";
import * as codeController from "../controllers/code.Controller";

const router = Router();

// Send code for reset (password, pin, email)
router.post("/send-reset-code", codeController.sendResetCode);
// Change password
router.post("/change-password", codeController.changePassword);
// Forget password
router.post("/forget-password", codeController.forgetPassword);
// Change pin
router.post("/change-pin", codeController.changePin);
// Reset pin
router.post("/reset-pin", codeController.resetPin);

// Confirm account
router.post("/confirm-account", codeController.confirmAccount); 

export default router;
