import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger for API calls
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Revora API v1
app.use("/api/v1", apiRouter);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(`
===========================================================
  🚀 REVORA — AI Revenue Recovery Agent API Server
  🌐 Port: ${env.PORT}
  📡 Environment: ${env.NODE_ENV}
  🔗 API Base: http://localhost:${env.PORT}/api/v1
  📊 Status: http://localhost:${env.PORT}/api/v1/health
===========================================================
    `);
  });
}

export default app;
