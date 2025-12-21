import { create } from "apisauce";

const BASE_URL = "https://smeplug.ng/api/v1";
const SECRET_KEY = process.env.SMEPLUG_SECRET_KEY || "";

const apiClient = create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export const smePlugApi = {
  getWalletBalance: () => apiClient.get("/account/balance"),

  getNetworks: () => apiClient.get("/networks"),

  getDataPlans: () => apiClient.get("/data/plans"),

  purchaseDataPlan: (
    network_id: number,
    phone_number: string,
    plan_id: number
  ) => apiClient.post("/data/purchase", { network_id, phone_number, plan_id }),

  airtimePurchase: (network_id: number, phone_number: string, amount: number) =>
    apiClient.post("/airtime/purchase", { network_id, phone_number, amount }),

  vtuTopup: (network_id: number, phone_number: string, amount: number) =>
    apiClient.post("/vtu", { network_id, phone_number, amount }),

  getTransaction: (reference: string) =>
    apiClient.get(`/transactions/${reference}`),
  getTransactions: () => apiClient.get(`/transactions`),

  fetchDevices: () => apiClient.get("/devices"),
};
