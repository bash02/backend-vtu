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
}

export type PaystackBank = {
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  country: string;
  currency: string;
  type?: string;
  pay_with_bank: boolean;
  active?: boolean;
};

export type PaystackBankListResponse = {
  status: boolean;
  message: string;
  data: PaystackBank[];
};



// Assign/Create a DVA (single-step)
export const assignDedicatedAccount = async (
  data: AssignDedicatedAccountData
) => {
  return paystackApi.post("/dedicated_account/assign", data);
}

// Fetch supported banks for DVA
export const fetchDvaBanks = async () => {
  return paystackApi.get("/dedicated_account/available_providers");
}

export const getBankList = async (
  country: string = "nigeria"
): Promise<{ ok: boolean; data?: PaystackBankListResponse }> => {
  const response = await paystackApi.get<PaystackBankListResponse>(
    `/bank?country=${country}`
  );

  return {
    ok: response.ok,
    data: response.data,
  };
};
