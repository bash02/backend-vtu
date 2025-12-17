import { Router } from "express";
import { auth } from "../middleware/auth";
import * as transactionController from "../controllers/transactionController";
import { admin } from "../middleware/admin";
import {
  validateTransactionCreate,
  validateTransactionPatch,
} from "../middleware/transactionValidation";

const router = Router();

// User: get own transactions
router.get("/me", auth, transactionController.getMyTransactions);

// User: get transaction by id
router.get("/me/detail", auth, transactionController.getMyTransactionById);

// Admin: get all transactions
router.get("/", auth, admin, transactionController.getAllTransactions);

// Admin: get all transactions for a user
router.get(
  "/users",
  auth,
  admin,
  transactionController.getTransactionsByUserId
);

// Admin: get transaction by id
router.get("/detail", auth, admin, transactionController.getTransactionById);

// Admin: create a transaction with validation
router.post(
  "/",
  auth,
  admin,
  validateTransactionCreate,
  transactionController.createTransaction
);

// Admin: delete transaction
router.delete("/", auth, admin, transactionController.deleteTransaction);

// Admin: patch transaction
router.patch(
  "/",
  auth,
  admin,
  validateTransactionPatch,
  transactionController.updateTransaction
);

export default router;
