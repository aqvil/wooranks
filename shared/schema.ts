import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  overallScore: integer("overall_score").notNull(),
  seoScore: integer("seo_score").notNull(),
  performanceScore: integer("performance_score").notNull(),
  securityScore: integer("security_score").notNull(),
  mobileScore: integer("mobile_score").notNull(),
  technologiesScore: integer("technologies_score").notNull().default(0),
  socialScore: integer("social_score").notNull().default(0),
  usabilityScore: integer("usability_score").notNull().default(0),
  details: jsonb("details").notNull(), // Stores the detailed check results
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Detailed types for the analysis data
export type CheckResult = {
  passed: boolean;
  score: number; // 0-100 impact
  title: string;
  description: string;
  recommendation?: string;
  details?: string[]; // List of specific items (e.g., broken links)
  // Rich Content
  impact: "high" | "medium" | "low";
  difficulty: "hard" | "medium" | "easy";
  explanation: string;
  howToFix: string;
  learnMoreUrl?: string;
};

export type AnalysisSection = {
  score: number;
  checks: CheckResult[];
};

export type AnalysisResult = {
  url: string;
  timestamp: string;
  scores: {
    overall: number;
    seo: number;
    performance: number;
    security: number;
    mobile: number;
  };
  seo: AnalysisSection;
  performance: AnalysisSection;
  security: AnalysisSection;
  mobile: AnalysisSection;
  technologies: AnalysisSection;
  social: AnalysisSection;
  usability: AnalysisSection;
};

export type CreateAnalysisRequest = {
  url: string;
};
