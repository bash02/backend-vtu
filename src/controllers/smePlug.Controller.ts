import type { Request, Response } from "express";
import { smePlugApi } from "../api/smeplug";
import { generatePlanKey } from "../utils/generatePlanKey";
import { PlanPrice } from "../models/planPrice";
import { User } from "../models/user";
import { Transaction } from "../models/transaction";

export interface DataTransferResponse {
  status: boolean;
  data: {
    reference: string;
    msg: string;
  };
}

export interface SmePlugPlan {
  id: string;
  name: string;
  dispense_method: string;
  telco_price: string;
  price: string;
}

export interface SmePlugPlansByNetwork {
  [networkId: string]: SmePlugPlan[];
}

export interface ProcessedDataPlan {
  id: string;
  name: string;
  vendor_price?: string; // original vendor string price
  selling_price: number; // vendor + percentage
  charge_percentage?: number;
}

export interface ProcessedPlansByNetwork {
  [networkId: string]: ProcessedDataPlan[];
}

export interface GetDataPlansResponse {
  status: boolean;
  charge_type: "data";
  charge_percentage: number;
  data: ProcessedPlansByNetwork;
}

export interface SmePlugDataPlansApiResponse {
  status: boolean;
  data: SmePlugPlansByNetwork;
}

export const getWalletBalance = async (_req: Request, res: Response) => {
  try {
    const response = await smePlugApi.getWalletBalance();
    res.json(response.data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch wallet balance" });
  }
};

export const getNetworks = async (_req: Request, res: Response) => {
  try {
    const response = await smePlugApi.getNetworks();
    res.json(response.data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch networks" });
  }
};

const networkMap: Record<number, string> = {
  1: "MTN",
  2: "Airtel",
  3: "Glo",
  4: "9Mobile",
};

// Admin: Get all data plans with DB price/status
export const getDataPlans = async (req: Request, res: Response) => {
  // Fetch and unwrap the vendor plans response
  const vendorPlansResponse = await smePlugApi.getDataPlans();
  const vendorPlansData = (
    vendorPlansResponse.data as SmePlugDataPlansApiResponse
  ).data;

  const rules = await PlanPrice.find({});
  const ruleMap = new Map(rules.map((r) => [r.plan_key, r]));

  const isAdmin = req.user?.role === "admin" ? true : false;

  // Unwrap and flatten all plans from all networks into a single array
  // Also, preserve the networkId for each plan by mapping with its parent key
  const allPlans: Array<SmePlugPlan & { networkId: number }> = Object.entries(
    vendorPlansData
  ).flatMap(([networkId, plans]) =>
    (plans as SmePlugPlan[]).map((plan) => ({
      ...plan,
      networkId: Number(networkId),
    }))
  );

  const result = allPlans.map((plan) => {
    const network = networkMap[plan.networkId] || "UNKNOWN";
    const planKey = generatePlanKey({
      api: "smeplug",
      network: network,
      name: plan.name,
    });

    const rule = ruleMap.get(planKey);

    const api =
      rule && rule.api
        ? rule.api
        : Number(plan.telco_price) === 0
        ? "simhosting"
        : "smeplug";

    // Always return the full plan info, and if a rule exists, include DB price and status
    if (!isAdmin) {
      const { price, telco_price, dispense_method, ...rest } = plan;
      return {
        ...rest,
        selling_price: rule?.selling_price ?? null,
      };
    }
    return {
      ...plan,
      api,
      plan_key: planKey,
      selling_price: rule?.selling_price ?? null,
      is_active: rule?.is_active ?? false,
    };
  });

  res.json({ status: true, data: result });
};

// Add: Create or update a plan price (POST or PATCH)
export const upsertPlanPrice = async (req: Request, res: Response) => {
  try {
    // Accept any fields from the body and use them to generate plan_key
    const api: string = req.body.api;
    const selling_price: number = req.body.selling_price;
    const is_active: boolean | undefined = req.body.is_active;
    const plan_key: string = req.body.plan_key;
    const provider: string = req.body.provider;
    const plan: string = req.body.plan;

    if (!plan_key || !api || !selling_price || !provider || !plan) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: plan_key, api, selling_price, provider, plan",
      });
    }

    // Upsert logic
    const existing = await PlanPrice.findOne({ plan_key, api, provider });
    if (existing) {
      existing.selling_price = selling_price;
      if (is_active !== undefined) existing.is_active = is_active;
      existing.updated_at = new Date();
      await existing.save();
      return res.json({ success: true, plan: existing, updated: true });
    } else {
      const created = await PlanPrice.create({
        plan_key,
        api,
        plan,
        provider,
        selling_price,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date(),
      });
      return res.json({ success: true, plan: created, created: true });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
};

export const purchaseDataPlan = async (req: Request, res: Response) => {
  try {
    const { network_id, phone, plan_id, plan_key } = req.body;

    if (!network_id || !phone || !plan_id || !plan_key) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user?.id as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    const existing = await PlanPrice.findOne({ plan_key });

    if (
      !user ||
      typeof user.balance !== "number" ||
      typeof existing?.selling_price !== "number" ||
      user.balance < existing.selling_price
    ) {
      return res.status(400).json({
        error: "Insufficient balance, user not found, or plan price missing",
      });
    }

    // Call external purchase API
    const response = await smePlugApi.purchaseDataPlan(
      network_id,
      phone,
      plan_id
    );

    const responseData = response.data as DataTransferResponse;

    // Debit user wallet immediately on success from API
    if (responseData.status) {
      user.balance -= existing.selling_price;
      await user.save();
    } else {
      return res.status(400).json({
        error: "Failed to purchase data plan from provider",
        response: responseData,
      });
    }
    existing;
    // Create transaction with status 'success' since already debited

    await Transaction.create({
      user: user._id,
      reference: responseData.data.reference,
      type: "data",
      provider: existing.provider || "",
      amount: existing.selling_price,
      fee: 0,
      total: existing.selling_price,
      status: "pending",
      phone: phone,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to purchase data plan",
    });
  }
};

export const vtuTopup = async (req: Request, res: Response) => {
  try {
    const { network_id, phone_number, amount } = req.body;
    if (!network_id || !phone_number || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const response = await smePlugApi.vtuTopup(
      network_id,
      phone_number,
      amount
    );
    res.json(response.data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to perform VTU topup" });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const reference = req.params.reference as string;
    if (!reference) {
      return res.status(400).json({ error: "Missing transaction reference" });
    }
    const response = await smePlugApi.getTransaction(reference);
    res.json(response.data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch transaction" });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const response = await smePlugApi.getTransactions();
    res.json(response.data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch transactions" });
  }
};

export const fetchDevices = async (_req: Request, res: Response) => {
  try {
    const response = await smePlugApi.fetchDevices();
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch devices" });
  }
};
