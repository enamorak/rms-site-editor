import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExportMap } from "./routes/export-map";
import { handleImportMap } from "./routes/import-map";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // RMF Map API routes
  app.post("/api/export-map", handleExportMap);
  app.post("/api/import-map", handleImportMap);

  return app;
}
