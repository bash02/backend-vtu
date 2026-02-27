// controllers/userController.ts

import type { Request, Response } from "express";
import _ from "lodash";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";
import { UserModel } from "../models/user";


export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, error: "Only admins can view all users" });
    }

    const users = await UserModel.findAll();
    // Remove password field
    const sanitizedUsers = users.map(u => _.omit(u, ["password"]));

    res.json({
      success: true,
      users: sanitizedUsers,
      message: "Users retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};



export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    const user = await UserModel.findById(Number(id));
    if (!user || user.deleted) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    const sanitizedUser = _.pick(user, ["id", "name", "email"]);
    res.json({
      success: true,
      user: sanitizedUser,
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
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "name, email and password are required"
      });
    }

    const existingUsers = await UserModel.findAll();
    const existing = existingUsers.find(u => u.email === email);

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "User already exists (sync safe)",
        user: existing
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      synced: false,
      deleted: false
    });

    res.status(201).json({
      success: true,
      user
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid data"
    });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing user id parameter"
    });
  }

  try {
    const user = await UserModel.findById(Number(id));

    if (!user || user.deleted) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const allowedFields = [
      "name",
      "email",
      "password",
      "role"
      // ❌ DO NOT allow client to manually update deleted/synced
    ];

    const data: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        data[field] = req.body[field];
      }
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // 🔥 Sync-safe updates
    data.synced = false;

    const updatedUser = await UserModel.update(Number(id), data);

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id || req.query.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing user id parameter"
    });
  }

  try {
    if (!req.user?.role || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can delete users"
      });
    }

    const user = await UserModel.findById(Number(id));
    if (!user || user.deleted) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await UserModel.update(Number(id), { deleted: true, synced: false });

    res.json({
      success: true,
      message: "User marked as deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Server error"
    });
  }
};