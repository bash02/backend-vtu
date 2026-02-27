import { Router } from "express";
import * as userController from "../controllers/user.Controller";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";
import {
  userCreateSchema,
  validateUserCreate,
} from "../middleware/userValidation";

const router = Router();

// Admin: get all users
router.get("/", userController.getUsers);

// User and Admin: get current user
router.get("/me", userController.getCurrentUser);

// All
router.post("/", validateUserCreate, userController.createUser);

// Support update and delete by query param as well
router.patch("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

export default router;
