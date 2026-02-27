import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import authRoute from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import saleRoutes from "./routes/saleRoutes";
import productRoutes from "./routes/productRoutes";
import syncRoutes from "./routes/syncRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

import { PrismaClient } from "@prisma/client"; // ✅ correct import
import { admin } from "./middleware/admin";
import { auth } from "./middleware/auth";
import swaggerRoute from "./routes/swagger";
import categoryRoutes from "./routes/categoryRoutes";

dotenv.config();

const app = express();
app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";
const corsOptions = process.env.NODE_ENV === "production"
  ? { origin: FRONTEND_URL, credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));



const prisma = new PrismaClient();

async function main() {
  // Test DB connection
  await prisma.$connect();
  console.log("Connected to database");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


app.use("/api/auth", authRoute);
app.use("/api/users", auth, admin, userRoutes);
app.use("/api/sales", auth, admin, saleRoutes);
app.use("/api/products", auth, admin, productRoutes);
app.use("/api/categories", auth, admin, categoryRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/docs", swaggerRoute);

app.use(notFound);
app.use(errorHandler);

export default app;