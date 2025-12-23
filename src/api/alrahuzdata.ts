import { create } from "apisauce";

const BASE_URL = "https://alrahuzdata.com.ng/api";
const TOKEN = process.env.ALRAHUZDATA_TOKEN || "";

const apiClient = create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Token ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const alrahuzApi = {
  // USER //
  getUser: () => apiClient.get("/user"),

  // DATA //
  buyData: (payload: {
    network: number;
    mobile_number: string;
    plan_id: number;
  }) =>
    apiClient.post("/data", {
      network: payload.network,
      mobile_number: payload.mobile_number,
      plan: payload.plan_id,
      Ported_number: true,
    }),

  getAllDataTransactions: () => apiClient.get("/data"),

  // AIRTIME //
  buyAirtime: (payload: {
    network: number;
    mobile_number: string;
    amount: number;
  }) => apiClient.post("/topup", payload),

  // EDUCATION PIN //
  buyEducationPin: (payload: {
    exam_name: "WAEC" | "NECO" | "NABTEB";
    quantity: number;
  }) => apiClient.post("/epin", payload),

  // ELECTRICITY //
  buyElectricity: (payload: {
    disco: string;
    meter_number: string;
    meter_type: "prepaid" | "postpaid";
    amount: number;
  }) => apiClient.post("/billpayment", payload),

  validateMeter: (meter: string) =>
    apiClient.get(`/validate-meter/?meter=${meter}`),

  // CABLE //
  buyCable: (payload: { provider: string; iuc: string; plan: string }) =>
    apiClient.post("/cablesub", payload),

  validateIUC: (iuc: string) => apiClient.get(`/validate-iuc/?iuc=${iuc}`),
};
