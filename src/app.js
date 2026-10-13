import express from "express";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import stockMovementRoutes from "./routes/stock-movement.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";

import { errorMiddleware } from "./middleware/error/error.middleware.js";
import { requestLogger } from "./middleware/logger/request-logger.middleware.js";
import { requestId } from "./middleware/api/requestId.middleware.js";
import { rateLimitMiddleware } from "./middleware/api/rate-limit.middleware.js";

import { corsMiddleware } from "./config/cors.js";
import { notFoundMiddleware } from "./middleware/error/not-found.middleware.js";

const app = express();

app.use(corsMiddleware);
app.use(requestId);

app.use(rateLimitMiddleware);

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/stock/movements", stockMovementRoutes);
app.use("/api/recipes", recipeRoutes);

app.use(notFoundMiddleware)

app.use(errorMiddleware);

export default app;