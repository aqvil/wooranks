import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeUrl } from "./services/analyzer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.reports.analyze.path, async (req, res) => {
    try {
      const { url } = api.reports.analyze.input.parse(req.body);

      // Simple validation for internal/localhost URLs to prevent abuse in this demo
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return res.status(400).json({ message: "Analysis of local networks is not supported." });
      }

      // 1. Perform Analysis
      const analysisResult = await analyzeUrl(url);

      // 2. Save to DB
      const savedReport = await storage.createReport(analysisResult);

      res.status(200).json(savedReport);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      res.status(500).json({ message });
    }
  });

  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  });

  // Seed Data
  const existingReports = await storage.getReports();
  if (existingReports.length === 0) {
    // No hardcoded data here to ensure user sees only real reports they generate
  }

  return httpServer;
}
