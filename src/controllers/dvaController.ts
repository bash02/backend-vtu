import dotenv from "dotenv";
dotenv.config();

import type { Request, Response } from "express";
import type { IDVA } from "../types/models";
import type {
  AssignDedicatedAccountData,
  DvaBankProvidersResponse,
  DvaBankProvider,
} from "../services/paystackService";
import {
  assignDedicatedAccount,
  fetchDvaBanks,
} from "../services/paystackService";
import { DVA } from "../models/dva";

// Create a customer and assign DVA (single endpoint, .env credentials)
export const createCustomerAndAssignDVA = async (
  req: Request,
  res: Response
) => {
  try {
    // Get user from token (assume req.user is set by auth middleware)
    // @ts-ignore
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: User not found" });
    }
    // Use type-safe body
    const data: AssignDedicatedAccountData = req.body;
    // Assign DVA and create customer in one go
    const dvaRes = await assignDedicatedAccount({ ...data });
    const dvaData = (dvaRes as any).data?.data || (dvaRes as any).data;
    // Save DVA to DB for this user
    const dvaDoc = await DVA.findOneAndUpdate(
      { customer_code: dvaData?.customer_code },
      {
        user: userId,
        customer_code: dvaData?.customer_code,
        account_name: dvaData?.account_name,
        account_number: dvaData?.account_number,
        bank: dvaData?.bank,
        provider_slug: dvaData?.provider_slug,
        currency: dvaData?.currency,
        active: dvaData?.active,
        assigned: dvaData?.assigned,
        assignment: dvaData?.assignment,
        created_at: dvaData?.created_at,
        updated_at: dvaData?.updated_at,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Return the Paystack response and the saved DVA
    res.status(201).json({
      success: true,
      dva: dvaDoc,
      paystack: dvaData,
    });
  } catch (err: any) {
    res
      .status(400)
      .json({ success: false, error: err.response?.data || err.message });
  }
};

// Endpoint to fetch available bank providers for DVA
export const getDvaBankProviders = async (req: Request, res: Response) => {
  try {
    const response = await fetchDvaBanks();
    // Defensive: handle both apisauce and expected Paystack structure
    const providers: DvaBankProvider[] =
      (response.data && (response.data as any).data) || [];
    const message: string =
      (response.data && (response.data as any).message) ||
      "Providers retrieved";
    res.status(200).json({
      success: true,
      message,
      data: providers,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};
