import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute"; // matches filename exactly
import userRoutes from "./routes/userRoutes";
import codeRoutes from "./routes/codeRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import dvaRoutes from "./routes/dvaRoutes";
import chargeRoutes from "./routes/chargeRoutes";

import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();

app.use(express.json());

const isProd = process.env.NODE_ENV === "production";
const mongoUri = isProd
  ? process.env.MONGODB_URI_PROD
  : process.env.MONGODB_URI_DEV;

mongoose
  .connect(mongoUri as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/dva", dvaRoutes);
app.use("/api/charge", chargeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
