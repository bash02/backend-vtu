import { Router } from "express";
import * as codeController from "../controllers/code.Controller";
import { auth } from "../middleware/auth";

const router = Router();

// Send code for reset (password, pin, email)
router.post("/send-reset-code", codeController.sendResetCode);
// Change password
router.post("/change-password", codeController.changePassword);
// Forget password
router.post("/forgot-password", codeController.forgetPassword);
// Change pin
router.post("/change-pin", codeController.changePin);
// Reset pin
router.post("/reset-pin", codeController.resetPin);

// Confirm account
router.post("/confirm-account", codeController.confirmAccount);

router.post("/compare-pin", auth, codeController.comparePin);

export default router;
