import type { Request, Response } from "express";
import { ExpoToken } from "../models/expoToken";
import { sendExpoNotification } from "../utils";

export const saveExpoToken = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { expoPushToken } = req.body;
  if (!expoPushToken || !userId)
    return res.status(400).json({ error: "Missing token or user" });

  await ExpoToken.findOneAndUpdate(
    { userId },
    { expoPushToken },
    { upsert: true, new: true }
  );
  res.json({ success: true });
};

export const pushNotification = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { title, body } = req.body;
  if (!title || !body || !userId)
    return res.status(400).json({ error: "Missing fields" });

  const tokenDoc = await ExpoToken.findOne({ userId });
  if (!tokenDoc) return res.status(404).json({ error: "Expo token not found" });

  const result = await sendExpoNotification(
    tokenDoc.expoPushToken,
    title,
    body
  );
  res.json({ success: true, result: result.data });
};
