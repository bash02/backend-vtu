import type { Request, Response } from "express";
import { checkUserDetail } from "./alrahuz.controller";
import { getDataPlans } from "./smePlug.Controller";

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
      { provider: "alrahuz", plans: alrahuzResult.dataplans || [] },
      { provider: "smeplug", plans: smeplugResult.data || [] },
    ];
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user data plans",
    });
  }
};
