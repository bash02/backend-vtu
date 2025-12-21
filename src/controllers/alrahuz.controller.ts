import { request, type Request, type Response } from "express";
import { alrahuzApi } from "../api/alrahuzdata";
import { PlanPrice } from "../models/planPrice";
import { generatePlanKey } from "../utils/generatePlanKey";
import { size } from "lodash";

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  role?: string;
  status?: string;
}

export interface WalletInfo {
  balance: number | string;
  currency?: string;
}

export interface DataplansResponse {
  ALL?: DataPlan[];
  MTN?: DataPlan[];
  GLO?: DataPlan[];
  AIRTEL?: DataPlan[];
  "9MOBILE"?: DataPlan[];
}

export interface DataPlan {
  id: number;
  dataplan_id: string;
  plan_network: string;
  plan_type: string;
  plan: string;
  plan_amount: number | string;
  month_validate: string;
}

export interface CableplansResponse {
  DSTVPLAN?: CablePlan[];
  GOTVPLAN?: CablePlan[];
  STARTIMEPLAN?: CablePlan[];
}

export interface CablePlan {
  id: number;
  cableplan_id: string;
  cable: string;
  package: string;
  plan_amount: number | string;
}

export interface RechargeResponse {
  mtn?: number;
  glo?: number;
  airtel?: number;
  "9mobile"?: number;
  mtn_pin?: RechargePin[];
  glo_pin?: RechargePin[];
  airtel_pin?: RechargePin[];
  "9mobile_pin"?: RechargePin[];
}

export interface RechargePin {
  id: number;
  network_name: string;
  amount: number;
  amount_to_pay: number;
}

export interface ElectricityResponse {
  discos?: Disco[];
}

export interface Disco {
  id: number;
  name: string;
  code: string;
}

export interface Exam {
  [examName: string]: {
    amount: number;
  };
}

export interface TransactionsResponse {
  data?: Transaction[];
  airtime?: Transaction[];
  cable?: Transaction[];
  electricity?: Transaction[];
}

export interface Transaction {
  id: number;
  reference: string;
  amount: number;
  status: "success" | "pending" | "failed";
  created_at: string;
}

export interface AlrahuzUserResponse {
  status?: boolean;
  message?: string;

  user?: UserInfo;
  wallet?: WalletInfo;

  dataplans?: DataplansResponse;
  cableplans?: CableplansResponse;
  recharge?: RechargeResponse;
  electricity?: ElectricityResponse;
  Exam?: Exam;

  transactions?: TransactionsResponse;

  [key: string]: any; // allow safe future expansion
}

export const extendWithCharge = (price: number, percent: number) => ({
  selling_price: Math.ceil(price + (percent / 100) * price),
});

export const extendWithDiscount = (price: number, percent: number) => ({
  selling_price: Math.ceil(price - (percent / 100) * price),
});

// Utility to flatten nested plan objects into a single array
function flattenPlans(plans: any): any[] {
  if (Array.isArray(plans)) {
    return plans;
  } else if (typeof plans === "object" && plans !== null) {
    let result: any[] = [];
    for (const key in plans) {
      if (plans.hasOwnProperty(key)) {
        result = result.concat(flattenPlans(plans[key]));
      }
    }
    return result;
  } else {
    return [];
  }
}

export async function processPlanTree(
  plans: any,
  isAdmin: boolean
): Promise<any[]> {
  const rules = await PlanPrice.find({});
  const ruleMap = new Map(rules.map((r) => [r.plan_key, r]));

  // Flatten all plans into a single array
  const flatPlans = flattenPlans(plans);

  return flatPlans.map((p) => {
    const network = p.plan_network ?? "";
    const category = p.plan_type ?? "";
    const size = p.plan ?? p.name ?? "";
    const validity = p.month_validate ?? "";

    let planKey;

    if (p.cable) {
      planKey = generatePlanKey({
        provider: "alrahuz",
        network: p.cable,
        name: p.package,
      });
      console.log("Cable Plan Key:", planKey);
    } else {
      planKey = generatePlanKey({
        provider: "alrahuz",
        network: network,
        category,
        size,
        validity,
      });
    }

    const rule = ruleMap.get(planKey);

    const basePlan = {
      ...p,
      ...(isAdmin && { provider: rule?.provider || "alrahuz" }),
      selling_price: rule?.selling_price || null,
      is_active: rule?.is_active || false,
      planKey: planKey,
    };
    // Hide is_active and planKey for non-admins
    if (!isAdmin) {
      const { plan_amount, is_active, planKey, ...rest } = basePlan;
      return rest;
    }
    return basePlan;
  });
}

export const checkUserDetail = async (req: Request, res: Response) => {
  try {
    const response = await alrahuzApi.getUser();
    const userData = response.data as AlrahuzUserResponse;

    const isAdmin = req.user?.role === "admin" ? true : false;

    // Flattened Data plans
    const dataplans = await processPlanTree(userData?.Dataplans || {}, isAdmin);

    // Remove 'cablename' from Cableplan before processing
    const cableplanObj = { ...(userData?.Cableplan || {}) };
    delete cableplanObj.cablename;

    // Flattened Cable plans
    const cableplans = await processPlanTree(cableplanObj, isAdmin);

    return res.status(200).json({
      ...(isAdmin && { userDetail: userData.user }),
      topuppercentage: userData.topuppercentage,
      Exam: userData.Exam,
      dataplans,
      cableplans,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to process recharge pricing",
    });
  }
};

// Add: Create or update a plan price (POST or PATCH)
export const upsertPlanPrice = async (req: Request, res: Response) => {
  try {
    // Accept any fields from the body and use them to generate plan_key
    const provider: string = req.body.provider;
    const selling_price: number = req.body.selling_price;
    const is_active: boolean | undefined = req.body.is_active;
    const plan_key: string = req.body.plan_key;

    // Validation: required fields
    if (!plan_key || !provider || selling_price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Plan key, provider, and selling price are required",
      });
    }

    // Upsert logic
    const existing = await PlanPrice.findOne({ plan_key, provider });
    if (existing) {
      existing.selling_price = selling_price;
      if (is_active !== undefined) existing.is_active = is_active;
      existing.updated_at = new Date();
      await existing.save();
      return res.json({ success: true, plan: existing, updated: true });
    } else {
      const created = await PlanPrice.create({
        plan_key,
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

// DATA //
export const buyData = async (req: Request, res: Response) => {
  try {
    const { network, mobile_number, plan } = req.body;
    if (!network || !mobile_number || !plan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await alrahuzApi.buyData(req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to buy data",
    });
  }
};

export const getAllDataTransactions = async (_req: Request, res: Response) => {
  try {
    const response = await alrahuzApi.getAllDataTransactions();
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch data transactions",
    });
  }
};

// AIRTIME //
export const buyAirtime = async (req: Request, res: Response) => {
  try {
    const { network, mobile_number, amount } = req.body;
    if (!network || !mobile_number || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await alrahuzApi.buyAirtime(req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to buy airtime",
    });
  }
};

// EDUCATION PIN //
export const buyEducationPin = async (req: Request, res: Response) => {
  try {
    const { exam_name, quantity } = req.body;
    if (!exam_name || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await alrahuzApi.buyEducationPin(req.body);
    console.log(response.data);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to buy education pin",
    });
  }
};

// ELECTRICITY //
export const buyElectricity = async (req: Request, res: Response) => {
  try {
    const { disco, meter_number, meter_type, amount } = req.body;
    if (!disco || !meter_number || !meter_type || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await alrahuzApi.buyElectricity(req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to buy electricity",
    });
  }
};

export const validateMeter = async (req: Request, res: Response) => {
  try {
    const meter = req.query.meter as string;
    if (!meter) {
      return res.status(400).json({ error: "Meter number is required" });
    }

    const response = await alrahuzApi.validateMeter(meter);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to validate meter",
    });
  }
};

// CABLE //
export const buyCable = async (req: Request, res: Response) => {
  try {
    const { provider, iuc, plan } = req.body;
    if (!provider || !iuc || !plan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await alrahuzApi.buyCable(req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to buy cable subscription",
    });
  }
};

export const validateIUC = async (req: Request, res: Response) => {
  try {
    const iuc = req.query.iuc as string;
    if (!iuc) {
      return res.status(400).json({ error: "IUC number is required" });
    }

    const response = await alrahuzApi.validateIUC(iuc);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to validate IUC",
    });
  }
};
