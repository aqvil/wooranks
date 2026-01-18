import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import * as cheerio from "cheerio";
import { InsertReport, Report } from "@shared/schema";

// Simple analysis function (in a real app, this would be more robust/separate)
async function analyzeUrl(url: string): Promise<InsertReport> {
  const startTime = Date.now();
  let html = "";
  let responseTime = 0;
  let status = 0;
  let headers: Headers;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'SEOAnalyzer/1.0'
      }
    });
    
    clearTimeout(timeout);
    
    responseTime = Date.now() - startTime;
    status = res.status;
    html = await res.text();
    headers = res.headers;
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${(error as Error).message}`);
  }

  const $ = cheerio.load(html);
  
  // --- SEO Checks ---
  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || "";
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const canonical = $('link[rel="canonical"]').attr('href');
  const robots = $('meta[name="robots"]').attr('content');
  
  const seoChecks = [];
  let seoScore = 100;

  // Robots.txt simulation (meta robots)
  if (robots) {
    seoChecks.push({ passed: true, score: 5, title: "Robots Meta Tag", description: `Robots tag found: ${robots}` });
  } else {
    seoChecks.push({ passed: true, score: 5, title: "Robots Meta Tag", description: "No robots meta tag (defaults to index, follow)." });
  }

  // Canonical
  if (canonical) {
    seoChecks.push({ passed: true, score: 5, title: "Canonical Tag", description: "Canonical URL is specified." });
  } else {
    seoScore -= 5;
    seoChecks.push({ passed: false, score: 0, title: "Canonical Tag", description: "Missing canonical tag.", recommendation: "Add a canonical tag to prevent duplicate content issues." });
  }

  // Title
  if (title.length >= 10 && title.length <= 70) {
    seoChecks.push({ passed: true, score: 15, title: "Title Tag", description: "Title tag is present and optimal length.", details: [title] });
  } else if (title.length > 0) {
    seoScore -= 5;
    seoChecks.push({ passed: false, score: 0, title: "Title Tag", description: `Title tag exists but length is ${title.length} characters (10-70 recommended).`, recommendation: "Aim for 50-60 characters for best display in search results.", details: [title] });
  } else {
    seoScore -= 20;
    seoChecks.push({ passed: false, score: 0, title: "Title Tag", description: "Missing title tag.", recommendation: "The title tag is one of the most important SEO factors. Add a unique, keyword-rich title." });
  }

  // Meta Description
  if (metaDesc.length > 50 && metaDesc.length < 160) {
    seoChecks.push({ passed: true, score: 10, title: "Meta Description", description: "Meta description is present and optimal length.", details: [metaDesc] });
  } else if (metaDesc.length > 0) {
    seoScore -= 10;
    seoChecks.push({ passed: false, score: 0, title: "Meta Description", description: "Meta description exists but is not optimal length (50-160 chars).", recommendation: "Optimize description length.", details: [`Current length: ${metaDesc.length}`] });
  } else {
    seoScore -= 20;
    seoChecks.push({ passed: false, score: 0, title: "Meta Description", description: "Missing meta description.", recommendation: "Add a meta description to improve click-through rates." });
  }

  // Headings
  if (h1Count === 1) {
    seoChecks.push({ passed: true, score: 10, title: "H1 Heading", description: "Exactly one H1 tag found." });
  } else {
    seoScore -= 10;
    seoChecks.push({ passed: false, score: 0, title: "H1 Heading", description: `Found ${h1Count} H1 tags.`, recommendation: "Use exactly one H1 tag per page.", details: [`Count: ${h1Count}`] });
  }

  // Images Alt
  const images = $('img');
  let missingAlt = 0;
  images.each((_, el) => {
    if (!$(el).attr('alt')) missingAlt++;
  });
  
  if (missingAlt === 0 && images.length > 0) {
    seoChecks.push({ passed: true, score: 10, title: "Image Alt Attributes", description: "All images have alt attributes." });
  } else if (images.length === 0) {
    seoChecks.push({ passed: true, score: 10, title: "Image Alt Attributes", description: "No images found on page." });
  } else {
    seoScore -= 10;
    seoChecks.push({ passed: false, score: 0, title: "Image Alt Attributes", description: `${missingAlt} images missing alt attributes.`, recommendation: "Add alt text to all images for accessibility and SEO." });
  }

  // Links
  const links = $('a');
  const internalLinks = links.filter((_, el) => {
    const href = $(el).attr('href');
    return href?.startsWith('/') || href?.includes(url) || false;
  }).length;
  
  seoChecks.push({ passed: true, score: 5, title: "Link Count", description: `Found ${links.length} total links.`, details: [`Internal: ${internalLinks}`, `External: ${links.length - internalLinks}`] });


  // Social Meta Tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  
  if (ogTitle) {
    seoChecks.push({ passed: true, score: 5, title: "Open Graph", description: "Open Graph title is present." });
  } else {
    seoScore -= 5;
    seoChecks.push({ passed: false, score: 0, title: "Open Graph", description: "Missing Open Graph tags.", recommendation: "Add Open Graph tags for better social sharing." });
  }

  if (twitterCard) {
    seoChecks.push({ passed: true, score: 5, title: "Twitter Card", description: "Twitter Card meta tag is present." });
  } else {
    // Optional, smaller penalty
    seoChecks.push({ passed: false, score: 0, title: "Twitter Card", description: "Missing Twitter Card tags.", recommendation: "Add Twitter Card tags for Twitter optimization." });
  }


  // --- Performance Checks ---
  const performanceChecks = [];
  let performanceScore = 100;
  
  // TTFB (Simulated by total response time for now)
  if (responseTime < 300) {
    performanceChecks.push({ passed: true, score: 25, title: "Server Response Time", description: `Excellent response time: ${responseTime}ms` });
  } else if (responseTime < 800) {
    performanceScore -= 10;
    performanceChecks.push({ passed: true, score: 15, title: "Server Response Time", description: `Good response time: ${responseTime}ms` });
  } else {
    performanceScore -= 25;
    performanceChecks.push({ passed: false, score: 0, title: "Server Response Time", description: `Slow response time: ${responseTime}ms`, recommendation: "Slow response times can hurt your SEO and user experience. Consider optimizing your server or using a CDN." });
  }

  // HTML Size
  const htmlSize = html.length;
  if (htmlSize < 50 * 1024) { // 50KB
    performanceChecks.push({ passed: true, score: 15, title: "Page Size", description: `Perfect HTML size: ${(htmlSize/1024).toFixed(2)}KB` });
  } else if (htmlSize < 200 * 1024) {
    performanceChecks.push({ passed: true, score: 10, title: "Page Size", description: `Acceptable HTML size: ${(htmlSize/1024).toFixed(2)}KB` });
  } else {
    performanceScore -= 15;
    performanceChecks.push({ passed: false, score: 0, title: "Page Size", description: `Large HTML size: ${(htmlSize/1024).toFixed(2)}KB`, recommendation: "Reduce page weight by minifying HTML, CSS, and JS, and removing unnecessary scripts." });
  }

  // Gzip Compression (check headers)
  const contentEncoding = headers.get('content-encoding');
  if (contentEncoding?.includes('gzip') || contentEncoding?.includes('br')) {
    performanceChecks.push({ passed: true, score: 10, title: "Compression", description: "Gzip/Brotli compression is active." });
  } else {
    performanceScore -= 10;
    performanceChecks.push({ passed: false, score: 0, title: "Compression", description: "Compression is not enabled.", recommendation: "Enable Gzip or Brotli compression on your server to reduce file transfer sizes." });
  }

  // --- Security Checks ---
  const securityChecks = [];
  let securityScore = 100;

  // HTTPS
  if (url.startsWith('https')) {
    securityChecks.push({ passed: true, score: 40, title: "SSL Certificate", description: "Secure connection detected (HTTPS)." });
  } else {
    securityScore -= 60;
    securityChecks.push({ passed: false, score: 0, title: "SSL Certificate", description: "Unsecured connection (HTTP).", recommendation: "Install an SSL certificate to secure your site and improve search rankings." });
  }

  // Security Headers
  const hsts = headers.get('strict-transport-security');
  const xFrame = headers.get('x-frame-options');
  if (hsts) {
    securityChecks.push({ passed: true, score: 10, title: "HSTS Header", description: "Strict-Transport-Security header is present." });
  } else {
    securityScore -= 5;
    securityChecks.push({ passed: false, score: 0, title: "HSTS Header", description: "HSTS header is missing.", recommendation: "Implement HSTS to force browsers to use HTTPS." });
  }

  if (xFrame) {
    securityChecks.push({ passed: true, score: 10, title: "Clickjacking Protection", description: "X-Frame-Options header is present." });
  } else {
    securityScore -= 5;
    securityChecks.push({ passed: false, score: 0, title: "Clickjacking Protection", description: "X-Frame-Options header is missing.", recommendation: "Add X-Frame-Options to prevent clickjacking attacks." });
  }

  // --- Mobile Checks ---
  const mobileChecks = [];
  let mobileScore = 100;

  // Viewport
  const viewport = $('meta[name="viewport"]').attr('content');
  if (viewport && viewport.includes('width=device-width')) {
    mobileChecks.push({ passed: true, score: 40, title: "Mobile Viewport", description: "Website is optimized for mobile screen sizes." });
  } else {
    mobileScore -= 60;
    mobileChecks.push({ passed: false, score: 0, title: "Mobile Viewport", description: "Viewport tag is missing or incorrect.", recommendation: "Add a viewport meta tag to ensure your site is responsive on mobile devices." });
  }

  // Touch Icons
  const touchIcon = $('link[rel*="apple-touch-icon"]').attr('href') || $('link[rel="icon"]').attr('href');
  if (touchIcon) {
    mobileChecks.push({ passed: true, score: 10, title: "Favicon/Touch Icon", description: "Website has a favicon or apple-touch-icon." });
  } else {
    mobileScore -= 10;
    mobileChecks.push({ passed: false, score: 0, title: "Favicon/Touch Icon", description: "No favicon detected.", recommendation: "Add a favicon to improve brand recognition and user experience." });
  }


  // Final Calculations
  seoScore = Math.max(0, seoScore);
  performanceScore = Math.max(0, performanceScore);
  securityScore = Math.max(0, securityScore);
  mobileScore = Math.max(0, mobileScore);

  const overallScore = Math.round((seoScore + performanceScore + securityScore + mobileScore) / 4);

  return {
    url,
    overallScore,
    seoScore,
    performanceScore,
    securityScore,
    mobileScore,
    details: {
      seo: { score: seoScore, checks: seoChecks },
      performance: { score: performanceScore, checks: performanceChecks },
      security: { score: securityScore, checks: securityChecks },
      mobile: { score: mobileScore, checks: mobileChecks },
    } as any, // Type assertion for JSON structure
  };
}

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
