import type { Request, Response } from "express";
import { comparePassword } from "../utils/hash"; // your bcrypt wrapper
import { signToken } from "../utils/jwt"; // your JWT signer
import { User } from "../models/user";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.isAdmin ? "admin" : "user",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


     
