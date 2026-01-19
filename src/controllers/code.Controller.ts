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
  sendChangeConfirmationEmail,
} from "../mails/mails";
import { hashPassword, comparePassword } from "../utils/hash";

// Confirm account using code
export const confirmAccount = async (req: Request, res: Response) => {
  const { email, code } = req.body ;

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
  // await sendChangeConfirmationEmail(email, "email");
  res.json({ message: "Account confirmed successfully." });
};

// Send verification code for password, pin, or email reset
export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const code = generateVerificationCode();
  setVerificationCode(email, code);
  try {
    // await sendVerificationEmail(email, String(code));
    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(`Failed to send verification email to: ${email}`, err);
    res.status(500).json({ error: "Failed to send verification email" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { email, code, oldPassword, newPassword } = req.body;

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

  // Use comparePassword to check if oldPassword matches stored hash
  const isOldPasswordCorrect = await comparePassword(
    oldPassword,
    user.password
  );
  if (!isOldPasswordCorrect) {
    return res.status(400).json({ error: "Old password is incorrect" });
  }

  // Hash new password before saving
  user.password = await hashPassword(newPassword);
  await user.save();

  deleteVerificationCode(email);
  // await sendChangeConfirmationEmail(email, "password");

  res.json({
    message: "Password changed successfully. Confirmation email sent.",
  });
};

// Forget password (initiate password reset)
export const forgetPassword = async (req: Request, res: Response) => {
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
  // await sendChangeConfirmationEmail(email, "password");
  res.json({
    message: "Password changed successfully. Confirmation email sent.",
  });
};

// Change pin using code
export const changePin = async (req: Request, res: Response) => {
  const { email, code, oldPin, newPin } = req.body;
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

  // Use bcrypt comparePassword to verify oldPin
  const isOldPinCorrect = await comparePassword(oldPin, user.pin);
  if (!isOldPinCorrect) {
    return res.status(400).json({ error: "Old pin is incorrect" });
  }

  // Hash newPin before saving
  user.pin = await hashPassword(newPin);
  await user.save();

  deleteVerificationCode(email);
  // await sendChangeConfirmationEmail(email, "pin");

  res.json({ message: "Pin changed successfully. Confirmation email sent." });
};

// Reset pin using code
export const resetPin = async (req: Request, res: Response) => {
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
  user.pin = await hashPassword(newPin); // Hash the new pin before saving
  await user.save();
  deleteVerificationCode(email);
  // await sendChangeConfirmationEmail(email, "pin");
  res.json({ message: "Pin changed successfully. Confirmation email sent." });
};



export const comparePin = async (req: Request, res: Response) => {
  try {
    const {pin} = req.body;
    const userId = req.user?.id as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPinCorrect = await comparePassword(pin, user.pin);

    if (!isPinCorrect) {
      return res.status(400).json({ error: "Incorrect pin" });
    }

    res.json({ message: "Pin is correct" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}