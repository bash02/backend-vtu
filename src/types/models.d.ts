import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  pin?: string;
  balance?: number;
  isAdmin?: boolean;
  isActive?: boolean;
}

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  reference: string;
  type: "airtime" | "data" | "electricity" | "cable" | "wallet";
  provider: string; // MTN, Airtel, Glo, 9mobile, Ikeja-Electric, etc.

  amount: number;
  fee: number;
  total: number;

  status: "pending" | "success" | "failed" | "reversed";

  phone?: string;
  meterNumber?: string;
  smartCardNumber?: string;

  response?: any; // raw API response
  createdAt: Date;
  updatedAt: Date;
}

export interface IDVA extends Document {
  user: Types.ObjectId;
  customer_code: string;
  account_name?: string;
  account_number?: string;
  bank?: {
    name?: string;
    id?: number;
    slug?: string;
  };
  provider_slug?: string;
  currency?: string;
  active?: boolean;
  assigned?: boolean;
  assignment?: {
    assignee_id?: number;
    assignee_type?: string;
    account_type?: string;
    integration?: number;
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface IChange extends Document {
  user: Types.ObjectId;
  type: "funding" | "update" | "other";
  amount?: number;
  description?: string;
  status: "pending" | "approved" | "rejected";
  admin?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCustomerData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  [key: string]: any;
}

export interface IAssignDVAData {
  customer: string;
  preferred_bank?: string;
  country?: string;
  account_number?: string;
  bvn?: string;
  bank_code?: string;
  [key: string]: any;
}
