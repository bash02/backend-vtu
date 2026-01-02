import type { Request, Response } from "express";
import { alrahuzApi } from "../api/alrahuzdata";
import { PlanPrice } from "../models/planPrice";
import {
  generatePlanKey,
  getNetworkName,
  getCableName,
} from "../utils/generatePlanKey";
import { User } from "../models/user";
import { Transaction } from "../models/transaction";
import { Charge } from "../models/charge";
import { Exam as ExamModel } from "../models/exam";

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

  // Remove duplicates by dataplan_id for data plans or cableplan_id for cable plans
  const uniquePlans = flatPlans.filter((plan, index, self) => {
    const idKey = plan.dataplan_id || plan.cableplan_id || plan.id;
    return (
      self.findIndex(
        (p) => (p.dataplan_id || p.cableplan_id || p.id) === idKey
      ) === index
    );
  });

  return uniquePlans
    .filter((p) => {
      if (isAdmin) return true; // Admins see all plans
      // For non-admins, only include plans with a matching rule
      const network = p.plan_network ?? "";
      const category = p.plan_type ?? "";
      const size = p.plan ?? p.name ?? "";
      const validity = p.month_validate ?? "";
      let plan_key;
      if (p.cable) {
        plan_key = generatePlanKey({
          api: "alrahuz",
          network: p.cable,
          name: p.package,
        });
      } else {
        plan_key = generatePlanKey({
          api: "alrahuz",
          network,
          category,
          size,
          validity,
        });
      }
      return ruleMap.has(plan_key);
    })
    .map((p) => {
      const network = p.plan_network ?? "";
      const category = p.plan_type ?? "";
      const size = p.plan ?? p.name ?? "";
      const validity = p.month_validate ?? "";

      let plan_key;

      if (p.cable) {
        plan_key = generatePlanKey({
          api: "alrahuz",
          network: p.cable,
          name: p.package,
        });
      } else {
        plan_key = generatePlanKey({
          api: "alrahuz",
          network,
          category,
          size,
          validity,
        });
      }

      const rule = ruleMap.get(plan_key);

      const basePlan = {
        ...p,
        ...(isAdmin && { api: rule?.api || "alrahuz" }),
        selling_price: rule?.selling_price || null,
        is_active: rule?.is_active || false,
        plan_key: plan_key,
      };
      // Hide is_active and plan_key for non-admins
      if (!isAdmin) {
        const { plan_amount, is_active, ...rest } = basePlan;
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
      status: true,
      ...(isAdmin && { userDetail: userData.user }),
      topuppercentage: userData.topuppercentage,
      Exam: userData.Exam,
      dataplans,
      cableplans,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process recharge pricing",
    });
  }
};

// Add: Create or update a plan price (POST or PATCH)
export const upsertPlanPrice = async (req: Request, res: Response) => {
  try {
    // Accept any fields from the body and use them to generate plan_key
    const api: string = req.body.api;
    const selling_price: number = req.body.selling_price;
    const is_active: boolean | undefined = req.body.is_active;
    const plan_key: string = req.body.plan_key;
    const provider: string = req.body.provider || req.body.plan_network;
    const plan: string = req.body.plan;
    const plan_type: string = req.body.plan_type;
    const month_validate: string = req.body.month_validate;

      console.log("Upsert Plan Price Request Body:", req.body);

    // Validation: required fields
    if (
      !plan_key ||
      !api ||
      !selling_price ||
      !provider ||
      !plan ||
      !is_active
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Plan key, api, selling price, provider, plan, and is active are required",
      });
    }


    // Upsert logic
    const existing = await PlanPrice.findOne({ plan_key });
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
        plan:
          month_validate && plan_type
            ? `${plan} ${plan_type} ${month_validate}`
            : `${plan}`,
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
    const { network, mobile_number, plan_key, plan_id } = req.body;

    if (!network || !mobile_number || !plan_key || !plan_id) {
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
      typeof existing?.selling_price !== "number"
    ) {
      return res.status(400).json({
        error: "User not found or plan price missing",
      });
    }

    if (user.balance < existing.selling_price) {
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // Call Alrahuz API
    const response = await alrahuzApi.buyData({
      network,
      mobile_number,
      plan_id,
    });

    const responseData = response.data as any;

    // Debit wallet ONLY if provider succeeded
    if (!responseData.status) {
      return res.status(400).json({
        error: "Failed to purchase data plan from provider",
        response: responseData,
      });
    }

    user.balance -= existing.selling_price;
    await user.save();

    await Transaction.create({
      user: user._id,
      reference: responseData.data?.reference || "",
      type: "data",
      provider: existing.provider,
      amount: existing.plan,
      fee: 0,
      total: existing.selling_price,
      status: "pending", // webhook will finalize
      number: mobile_number,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
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
    const { network, amount, mobile_number } = req.body;
    if (!network || !mobile_number || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user?.id as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || typeof user.balance !== "number") {
      return res
        .status(400)
        .json({ error: "User not found or invalid balance" });
    }

    // Get discount/charge percentage for airtime
    const airtimeDiscountPercentage =
      (await Charge.findOne({ type: "airtime" }))?.amount || 0;
    const discount = (airtimeDiscountPercentage / 100) * amount;
    const debitAmount = amount - discount;

    if (user.balance < debitAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Call provider API
    const response = await alrahuzApi.buyAirtime(
      network,
      amount,
      mobile_number
    );
    const responseData = response.data as any;

    // Only debit wallet if provider succeeded
    if (!responseData.status) {
      return res.status(400).json({
        error: "Failed to purchase airtime from provider",
        response: responseData,
      });
    }

    user.balance -= debitAmount;
    await user.save();

    await Transaction.create({
      user: user._id,
      reference: responseData.data?.reference || "",
      type: "airtime",
      provider: getNetworkName(network),
      amount: `${amount}`,
      fee: airtimeDiscountPercentage,
      total: debitAmount,
      status: "pending", // webhook will finalize
      number: mobile_number,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
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

    const userId = req.user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || typeof user.balance !== "number") {
      return res
        .status(400)
        .json({ error: "User not found or invalid balance" });
    }

    // Get exam price (from Exam config or request, fallback to 0)
    let examAmount = 0;
    if (req.body.amount) {
      examAmount = Number(req.body.amount);
    } else if (req.body.exam_amount) {
      examAmount = Number(req.body.exam_amount);
    } else if (req.body.price) {
      examAmount = Number(req.body.price);
    } else {
      // Try to get from Exam model if available
      const examDoc = await ExamModel.findOne({
        name: exam_name,
        is_active: true,
      });
      if (examDoc && examDoc.amount) {
        examAmount = Number(examDoc.amount);
      }
    }
    if (!examAmount || isNaN(examAmount)) {
      return res
        .status(400)
        .json({ error: "Exam amount not found or invalid" });
    }
    const totalAmount = examAmount * Number(quantity);
    if (user.balance < totalAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Call provider API
    const response = await alrahuzApi.buyEducationPin(req.body);
    const responseData = response.data as any;

    // Only debit wallet if provider succeeded
    if (!responseData.status) {
      return res.status(400).json({
        error: "Failed to purchase education pin from provider",
        response: responseData,
      });
    }

    user.balance -= totalAmount;
    await user.save();

    await Transaction.create({
      user: user._id,
      reference: responseData.data?.reference || "",
      type: "education_pin",
      provider: "alrahuz",
      amount: `${quantity}`,
      fee: 0,
      total: totalAmount,
      status: "pending", // webhook will finalize
      number: user.phone,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to buy education pin",
    });
  }
};

// ELECTRICITY //
export const buyElectricity = async (req: Request, res: Response) => {
  try {
    const { disco_name, meter_number, MeterType, amount } = req.body;
    if (!disco_name || !meter_number || !MeterType || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || typeof user.balance !== "number") {
      return res
        .status(400)
        .json({ error: "User not found or invalid balance" });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Call provider API
    const response = await alrahuzApi.buyElectricity(
      disco_name,
      amount,
      meter_number,
      MeterType
    );
    const responseData = response.data as any;

    // Only debit wallet if provider succeeded
    if (!responseData.status) {
      return res.status(400).json({
        error: "Failed to purchase electricity from provider",
        response: responseData,
      });
    }

    const charge = await Charge.findOne({ type: "electricity" });
    const chargeAmount = charge?.amount || 0;

    user.balance -= amount + chargeAmount;
    await user.save();

    await Transaction.create({
      user: user._id,
      reference: responseData.data?.reference || "",
      type: "electricity",
      provider: disco_name,
      amount: `${amount}`,
      fee: chargeAmount,
      total: amount + chargeAmount,
      status: "pending", // webhook will finalize
      number: meter_number,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to buy electricity",
    });
  }
};

export const validateMeter = async (req: Request, res: Response) => {
  try {
    const { meternumber, disconame, mtype } = req.query as any;
    if (!meternumber || !disconame || !mtype) {
      return res.status(400).json({ error: "Meter number is required" });
    }

    const response = await alrahuzApi.validateMeter(
      meternumber,
      disconame,
      mtype
    );
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
    const { smart_card_number, cableplan, plan_key, cablename } = req.body;
    if (!smart_card_number || !cableplan || !plan_key || !cablename) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || typeof user.balance !== "number") {
      return res
        .status(400)
        .json({ error: "User not found or invalid balance" });
    }

    // Find plan price from PlanPrice model
    const planPrice = await PlanPrice.findOne({ plan_key });
    if (!planPrice) {
      return res.status(400).json({ error: "Plan price not found" });
    }
    const sellingPrice = planPrice.selling_price || 0;
    if (!sellingPrice) {
      return res.status(400).json({ error: "Plan price not found" });
    }
    if (user.balance < sellingPrice) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Call provider API
    const response = await alrahuzApi.buyCable(
      cablename,
      cableplan,
      smart_card_number
    );
    const responseData = response.data as any;

    // Only debit wallet if provider succeeded
    if (!responseData.status) {
      return res.status(400).json({
        error: "Failed to purchase cable subscription from provider",
        response: responseData,
      });
    }

    user.balance -= sellingPrice;
    await user.save();

    await Transaction.create({
      user: user._id,
      reference: responseData.data?.reference || "",
      type: "cable",
      provider: planPrice?.provider || "alrahuz",
      amount: `${planPrice.plan}`,
      fee: 0,
      total: sellingPrice,
      status: "pending", // webhook will finalize
      number: smart_card_number,
      response: responseData,
    });

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to buy cable subscription",
    });
  }
};

export const validateIUC = async (req: Request, res: Response) => {
  try {
    const { smart_card_number, cablename } = req.query as any;
    if (!smart_card_number) {
      return res.status(400).json({ error: "IUC number is required" });
    }

    const response = await alrahuzApi.validateIUC(smart_card_number, cablename);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to validate IUC",
    });
  }
};
