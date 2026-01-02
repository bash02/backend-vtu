import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoute from "./routes/auth"; // matches filename exactly
import userRoutes from "./routes/userRoutes";
import codeRoutes from "./routes/codeRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import chargeRoutes from "./routes/chargeRoutes";
import smePlugRoutes from "./routes/smePlugRoutes";
import alrahuzRoutes from "./routes/alrahuz.routes";
import smePlugWebhookRoutes from "./routes/smePlugWebhookRoutes";
import providerRoutes from "./routes/provider.routes";
import utilityRoutes from "./routes/utilityRoutes";
import examRoutes from "./routes/examRoutes";
import notificationRoutes from "./routes/notificationRoutes";

import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();

app.use(express.json());

// CORS configuration: allow specific frontend origin in production, allow all in development
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";
const corsOptions = process.env.NODE_ENV === "production"
  ? { origin: FRONTEND_URL, credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

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
app.use("/api/charges", chargeRoutes);
app.use("/api/smeplug", smePlugRoutes);
app.use("/api/alrahuz", alrahuzRoutes);
app.use("/api/webhook", smePlugWebhookRoutes);
app.use("/api/admin/providers", providerRoutes); // Example admin route
app.use("/api/utility", utilityRoutes); // Utility routes to be added here
app.use("/api/exams", examRoutes);
app.use("/api/notification", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
