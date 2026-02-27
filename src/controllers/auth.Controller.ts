import type { Request, Response } from "express";
import { signToken } from "../utils/jwt";
import { UserModel } from "../models/user";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const users = await UserModel.findAll();
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Only allow login if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only admin users can login." });
    }
    // Password check should be implemented here (hash compare)
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.findById(Number(userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === "admin",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};