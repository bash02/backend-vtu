import type { Request, Response } from "express";
import {
  checkUserDetail,
  buyData as alrahuzBuyData,
} from "./alrahuz.controller";

import { getDataPlans, purchaseDataPlan } from "./smePlug.Controller";

export const buyData = async (req: Request, res: Response) => {
  try {
    const { network, plan_id, mobile_number, plan_key } = req.body;
    
    if (!network || !plan_id || !mobile_number || !plan_key) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Determine provider from plan_key
    const provider = plan_key.split(":")[0];

    if (provider === "alrahuz") {
      // Call Alrahuz purchase
      return alrahuzBuyData(req, res);
    } else if (provider === "smeplug") {
      // Call SMEPlug purchase
      return purchaseDataPlan(req, res);
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Unknown provider in plan_key" });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to purchase data plan",
    });
  }
};

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    // Get Alrahuz plans using its controller
    let alrahuzResult: any = {};
    await new Promise((resolve) => {
      const fakeRes = {
        status: (code: number) => fakeRes,
        json: (data: any) => {
          alrahuzResult = data;
          resolve(null);
        },
      } as unknown as Response;
      checkUserDetail(req, fakeRes);
    });

    // Get SmePlug plans using its controller
    let smeplugResult: any = {};
    await new Promise((resolve) => {
      const fakeRes = {
        status: (code: number) => fakeRes,
        json: (data: any) => {
          smeplugResult = data;
          resolve(null);
        },
      } as unknown as Response;
      getDataPlans(req, fakeRes);
    });

    // Merge results into array as requested
    const result = [
      {
        provider: "alrahuz",
        dataplans: alrahuzResult.dataplans || [],
        cableplans: alrahuzResult.cableplans || [],
        // Exam: alrahuzResult.Exam || [],
      },
      { provider: "smeplug", dataplans: smeplugResult.data || [] },
    ];
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user data plans",
    });
  }
};
