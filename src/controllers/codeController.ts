import type { Request, Response } from "express";
import { User } from "../models/user";
import {
  generateVerificationCode,
  setVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
} from "../config/code";
import {
  sendVerificationEmail,
  sendConfirmationEmail,
  sendChangeConfirmationEmail,
} from "../mails/mails";
import { hashPassword } from "../utils/hash";

// Send verification code for password, pin, or email reset
export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const code = generateVerificationCode();
  setVerificationCode(email, code);
  try {
    await sendVerificationEmail(email, String(code));
    console.log(`Verification email sent to: ${email}`);
    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(`Failed to send verification email to: ${email}`, err);
    res.status(500).json({ error: "Failed to send verification email" });
  }
};

// Change password using code
export const changePassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  const record = getVerificationCode(email);
  if (
    !record ||
    record.code !== Number(code) ||
    Date.now() > record.expiresAt
  ) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.password = await hashPassword(newPassword);
  await user.save();
  deleteVerificationCode(email);
  await sendChangeConfirmationEmail(email, "password");
  res.json({
    message: "Password changed successfully. Confirmation email sent.",
  });
};

// Change pin using code
export const changePin = async (req: Request, res: Response) => {
  const { email, code, newPin } = req.body;
  const record = getVerificationCode(email);
  if (
    !record ||
    record.code !== Number(code) ||
    Date.now() > record.expiresAt
  ) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.pin = newPin;
  await user.save();
  deleteVerificationCode(email);
  await sendChangeConfirmationEmail(email, "pin");
  res.json({ message: "Pin changed successfully. Confirmation email sent." });
};

// Change email using code
export const changeEmail = async (req: Request, res: Response) => {
  const { oldEmail, code, newEmail } = req.body;
  const record = getVerificationCode(oldEmail);
  if (
    !record ||
    record.code !== Number(code) ||
    Date.now() > record.expiresAt
  ) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
  const user = await User.findOne({ email: oldEmail });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.email = newEmail;
  await user.save();
  deleteVerificationCode(oldEmail);
  await sendChangeConfirmationEmail(newEmail, "email", { newEmail });
  res.json({ message: "Email changed successfully. Confirmation email sent." });
};

// Confirm email with code and activate user
export const confirmEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const record = getVerificationCode(email);
  if (
    !record ||
    record.code !== Number(code) ||
    Date.now() > record.expiresAt
  ) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.isActive = true;
  await user.save();
  deleteVerificationCode(email);
  await sendConfirmationEmail(email, code);
  res.json({
    message: "Email confirmed and account activated. Confirmation email sent.",
  });
};
