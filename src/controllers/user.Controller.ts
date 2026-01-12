// controllers/userController.ts

import type { Request, Response } from "express";
import _ from "lodash";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";
import { User } from "../models/user";
import { sendVerificationEmail } from "../mails/mails";
import { generateVerificationCode, setVerificationCode } from "../config/code";
import { assignDedicatedAccount } from "../services/paystackService";

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

    // Generate verification code
    const code = generateVerificationCode();
    setVerificationCode(user.email, code);
    await sendVerificationEmail(user.email, String(code));

    // Create token
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.isAdmin ? "admin" : "user",
    });

    // ==============================
    //  SEND RESPONSE TO CLIENT NOW
    // ==============================
    res.status(201)
      .header("x-auth-token", token)
      .json({
        success: true,
        user: _.pick(user, ["_id", "name", "email", "phone", "pin"]),
        message: "User created successfully. Verification code sent.",
      });

    // =========================================
    //  RUN DVA GENERATION IN BACKGROUND
    // =========================================
    setImmediate(async () => {
      try {
        const dvaPayload = {
          email: user.email,
          first_name: user.name?.split(" ")[0] || user.name,
          last_name: user.name?.split(" ")[1] || "",
          phone: user.phone,
          preferred_bank: req.body.preferred_bank || "wema-bank",
          country: req.body.country || "NG",
        };

        const dvaResponse = await assignDedicatedAccount(dvaPayload);

        if (dvaResponse.ok) {
          console.log("DVA assigned successfully for:", user.email);
          await user.save();
        } else {
          console.error("DVA assignment failed:", dvaResponse);
        }
      } catch (err) {
        console.error("DVA background error:", err);
      }
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
    const allowedFields = [
      "name",
      "email",
      "password",
      "phone",
      "balance",
      "pin",
      "dva",
      "isAdmin",
      "isActive",
    ];
    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        if (
          field === "dva" &&
          typeof req.body.dva === "object" &&
          req.body.dva !== null
        ) {
          // Only update allowed dva subfields
          const dvaFields = [
            "customer_code",
            "account_number",
            "account_name",
            "bankname",
            "currency",
          ];
          data.dva = {};
          for (const subField of dvaFields) {
            if (subField in req.body.dva) {
              data.dva[subField] = req.body.dva[subField];
            }
          }
        } else {
          data[field] = req.body[field];
        }
      }
    }
    // If no updatable fields provided
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No valid fields provided for update" });
    }
    if (data.password || data.pin) {
      data.password = await hashPassword(data.password);
      data.pin = await hashPassword(data.pin);
    }
    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("_id name email phone dva isAdmin isActive");
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
