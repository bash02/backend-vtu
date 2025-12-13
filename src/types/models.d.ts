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
