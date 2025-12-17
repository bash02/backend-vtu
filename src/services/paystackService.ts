import { create } from "apisauce";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

const paystackApi = create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

// Create a customer
type PaystackCustomerData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
};

export type AssignDedicatedAccountData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  preferred_bank?: string;
  country?: string;
  account_number?: string;
  bvn?: string;
  bank_code?: string;
  subaccount?: string;
  split_code?: string;
};

// Type for DVA Bank Provider response
export type DvaBankProvider = {
  provider_slug: string;
  bank_id: number;
  bank_name: string;
  id: number;
};

export type DvaBankProvidersResponse = {
  status: boolean;
  message: string;
  data: DvaBankProvider[];
};

export const createPaystackCustomer = async (data: PaystackCustomerData) => {
  return paystackApi.post("/customer", data);
};

// Assign/Create a DVA (single-step)
export const assignDedicatedAccount = async (
  data: AssignDedicatedAccountData
) => {
  return paystackApi.post("/dedicated_account/assign", data);
};

// Create a DVA for an existing customer (multi-step)
export const createDedicatedAccount = async (data: any) => {
  return paystackApi.post("/dedicated_account", data);
};

// Fetch supported banks for DVA
export const fetchDvaBanks = async () => {
  return paystackApi.get("/dedicated_account/available_providers");
};

// Fetch a customer's DVA
export const fetchCustomer = async (customerCodeOrId: string) => {
  return paystackApi.get(`/customer/${customerCodeOrId}`);
};

// Requery a DVA
export const requeryDedicatedAccount = async (
  account_number: string,
  provider_slug: string,
  date: string
) => {
  return paystackApi.get(`/dedicated_account/requery`, {
    account_number,
    provider_slug,
    date,
  });
};
