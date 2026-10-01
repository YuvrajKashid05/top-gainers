import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import "./database/init.js";
import api from "./routes/api.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      methods: ["GET", "POST", "PUT"],
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(morgan("tiny", { skip: (req) => req.path === "/api/health" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  app.use("/api", api);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
