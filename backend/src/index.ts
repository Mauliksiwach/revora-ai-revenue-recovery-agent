import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve Frontend Static Assets if built
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving frontend static assets from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for all non-API web routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

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
