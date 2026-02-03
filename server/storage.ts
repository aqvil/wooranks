import { db } from "./db";
import {
  reports,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReports(limit?: number): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async createReport(report: InsertReport): Promise<Report> {
    const [existing] = await db
      .select()
      .from(reports)
      .where(eq(reports.url, report.url));

    if (existing) {
      const [updated] = await db
        .update(reports)
        .set({
          ...report,
          createdAt: new Date(),
        })
        .where(eq(reports.id, existing.id))
        .returning();
      return updated;
    }

    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async getReports(limit: number = 10): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
