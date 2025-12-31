// controllers/userController.ts

import type { Request, Response } from "express";
import _ from "lodash";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";
import { User } from "../models/user";
import { sendVerificationEmail } from "../mails/mails";
import { generateVerificationCode, setVerificationCode } from "../config/code";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json({ success: true, users, message: "Users retrieved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select(
      "_id name email phone"
    );
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user, message: "User retrieved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req?.user?.id).select(
      "name email pin phone balance dva"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
      message: "User retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .json({ success: false, error: "User already registered." });

    user = new User(
      _.pick(req.body, ["name", "email", "password", "phone", "pin"])
    );
    user.password = await hashPassword(user.password);
    user.pin = await hashPassword(user.pin);
    await user.save();

    // Send verification code after user creation
    const code = generateVerificationCode();
    setVerificationCode(user.email, code);
    await sendVerificationEmail(user.email, String(code));

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.isAdmin ? "admin" : "user",
    });
    res
      .status(201)
      .header("x-auth-token", token)
      .json({
        success: true,
        user: _.pick(user, ["_id", "name", "email", "phone", "pin"]),
        message: "User created successfully. Verification code sent.",
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid data",
    });
  }
};

// PATCH: Partially update user fields. Supports id from either params or query.
export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Missing user id parameter" });
  }
  try {
    // Only validate fields that are present (for PATCH, not all required)
    const allowedFields = ["name", "email", "password", "phone", "pin"];
    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        data[field] = req.body[field];
      }
    }
    // If no updatable fields provided
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No valid fields provided for update" });
    }
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("_id name email phone");
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({
      success: true,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  // Support id from either params or query
  const id = req.params.id || req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Missing user id parameter" });
  }
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Server error",
    });
  }
};
