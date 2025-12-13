import { Router } from "express";
import * as userController from "../controllers/userController";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";

const router = Router();

router.get("/", auth, admin, userController.getUsers);
router.get("/me", auth, userController.getCurrentUser);
router.post("/", userController.createUser);

// Support update and delete by query param as well
router.put("/", auth, admin, (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "Missing id query parameter" });
  req.params.id = id;
  userController.updateUser(req, res);
});

router.delete("/", auth, admin, (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "Missing id query parameter" });
  req.params.id = id;
  userController.deleteUser(req, res);
});

export default router;
