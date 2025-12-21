import type { Request, Response } from "express";
import { Transaction } from "../models/transaction";

// Use and Admin: Create a transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Admin: Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().populate(
      "user",
      "_id name email"
    );
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// User and Admin: Get a transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Missing transaction id parameter" });
  }
  try {
    const transaction = await Transaction.findById(id).populate(
      "user",
      "_id name email"
    );
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// User: Get their own transaction by id
export const getMyTransactionById = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id || req.user.id;
  const transactionId = req.params.id || req.query.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: User ID not found" });
  }
  if (!transactionId) {
    return res.status(400).json({
      success: false,
      error: "Bad Request: Transaction ID is required",
    });
  }
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
    });
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Admin: Update a transaction
export const updateTransaction = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Missing transaction id parameter" });
  }
  try {
    const transaction = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Admin: Delete a transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Missing transaction id parameter" });
  }
  try {
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// User: Get their own transactions
export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id || req.user.id;
    const transactions = await Transaction.find({ user: userId });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

// Admin: Get all transactions for a specific user by user ID
export const getTransactionsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId || req.query.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, error: "Missing user id parameter" });
  }
  try {
    const transactions = await Transaction.find({ user: userId }).populate(
      "user",
      "_id name email"
    );
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};
