// controllers/userController.ts

import type { Request, Response } from "express";
import _ from "lodash";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";
import { User, validateUser } from "../models/user";

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
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user, message: "User retrieved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).json({ success: false, error: error.message });

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .json({ success: false, error: "User already registered." });

    user = new User(_.pick(req.body, ["name", "email", "password", "phone"]));
    user.password = await hashPassword(user.password);
    await user.save();

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
        user: _.pick(user, ["_id", "name", "email", "phone"]),
        message: "User created successfully",
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid data",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    let data = _.pick(req.body, ["name", "email", "password", "phone", "pin"]);

    // Remove undefined or missing fields so only provided fields are updated
    (Object.keys(data) as Array<keyof typeof data>).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true, // ensures Mongoose applies schema validation
    }).select("_id name email phone");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid data",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Server error",
    });
  }
};
