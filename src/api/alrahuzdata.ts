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
  buyAirtime: (
    network: number,
    mobile_number: string,
    amount: number,
    Ported_number = true,
    airtime_type = "VTU"
  ) =>
    apiClient.post("/topup", {
      network,
      amount,
      mobile_number,
      Ported_number,
      airtime_type,
    }),

  // EDUCATION PIN //
  buyEducationPin: (payload: {
    exam_name: "WAEC" | "NECO" | "NABTEB";
    quantity: number;
  }) => apiClient.post("/epin", payload),

  // ELECTRICITY //
  buyElectricity: (
    disco_name: string,
    amount: string,
    meter_number: string,
    MeterType: "prepaid" | "postpaid"
  ) =>
    apiClient.post("/billpayment", {
      disco_name,
      amount,
      meter_number,
      MeterType,
    }),

  validateMeter: (meternumber: string, disconame: string, mtype: string) =>
    apiClient.get(
      `/validatemeter/?meternumber=${meternumber}&disconame=${disconame}&mtype=${mtype}`
    ),

  // CABLE //
  buyCable: (cablename: string, cableplan: string, smart_card_number: string) =>
    apiClient.post("/cablesub", { cablename, cableplan, smart_card_number }),

  validateIUC: (smart_card_number: string, cablename: string) =>
    apiClient.get(
      `/validateiuc?smart_card_number=${smart_card_number}&cablename=${cablename}`
    ),
};
