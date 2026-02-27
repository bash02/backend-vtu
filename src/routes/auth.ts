import { Router } from "express";
import { login } from "../controllers/auth.Controller";

const router = Router();

router.post("/login", login);

export default router;
