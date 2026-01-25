import { InsertReport, AnalysisSection, CheckResult } from "@shared/schema";
import * as cheerio from "cheerio";

// Helper for check creation
const createCheck = (
    passed: boolean,
    score: number, // 0-100 impact
    title: string,
    description: string,
    recommendation?: string,
    details?: string[]
): CheckResult => ({
    passed,
    score,
    title,
    description,
    recommendation,
    details,
});

export async function analyzeUrl(url: string): Promise<InsertReport> {
    const startTime = Date.now();
    let html = "";
    let responseTime = 0;
    let status = 0;
    let headers: Headers;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0; +http://siteaudit.io/bot)'
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

    // ==========================================
    // SEO Checks
    // ==========================================
    const seoChecks: CheckResult[] = [];
    let seoScore = 100;

    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || "";
    const h1Count = $('h1').length;
    const canonical = $('link[rel="canonical"]').attr('href');
    const robots = $('meta[name="robots"]').attr('content');
    const keywords = $('meta[name="keywords"]').attr('content');

    // Title
    if (title.length >= 10 && title.length <= 60) {
        seoChecks.push(createCheck(true, 10, "Title Tag", `Perfect length: ${title.length} chars`, undefined, [title]));
    } else if (title.length > 0) {
        seoScore -= 5;
        seoChecks.push(createCheck(false, 0, "Title Tag", `Length is ${title.length} chars (10-60 recommended)`, "Aim for 10-60 characters.", [title]));
    } else {
        seoScore -= 20;
        seoChecks.push(createCheck(false, 0, "Title Tag", "Missing title tag", "Add a descriptive title tag."));
    }

    // Meta Description
    if (metaDesc.length >= 50 && metaDesc.length <= 160) {
        seoChecks.push(createCheck(true, 10, "Meta Description", `Perfect length: ${metaDesc.length} chars`, undefined, [metaDesc]));
    } else if (metaDesc.length > 0) {
        seoScore -= 5;
        seoChecks.push(createCheck(false, 0, "Meta Description", `Length is ${metaDesc.length} chars (50-160 recommended)`, "Optimize description length.", [metaDesc]));
    } else {
        seoScore -= 20;
        seoChecks.push(createCheck(false, 0, "Meta Description", "Missing meta description", "Add a meta description to improve CTR."));
    }

    // Headings
    if (h1Count === 1) {
        seoChecks.push(createCheck(true, 10, "Headings", "Exactly one H1 tag found."));
    } else {
        seoScore -= 10;
        seoChecks.push(createCheck(false, 0, "Headings", `Found ${h1Count} H1 tags`, "Use exactly one H1 tag per page."));
    }

    // Canonical
    if (canonical) {
        seoChecks.push(createCheck(true, 5, "Canonical Tag", "Canonical tag is present."));
    } else {
        seoScore -= 5;
        seoChecks.push(createCheck(false, 0, "Canonical Tag", "Missing canonical tag", "Add a canonical tag to prevent duplicate content."));
    }

    // Robots
    if (robots) {
        seoChecks.push(createCheck(true, 5, "Robots.txt", `Robots meta tag found: ${robots}`));
    } else {
        seoChecks.push(createCheck(true, 5, "Robots.txt", "No robots meta tag (defaults to index, follow)"));
    }

    // Alt Attributes
    const images = $('img');
    let missingAlt = 0;
    images.each((_, el) => { if (!$(el).attr('alt')) missingAlt++; });

    if (missingAlt === 0 && images.length > 0) {
        seoChecks.push(createCheck(true, 10, "Image Alt Attributes", "All images have alt text."));
    } else if (images.length === 0) {
        seoChecks.push(createCheck(true, 10, "Image Alt Attributes", "No images found."));
    } else {
        seoScore -= 10;
        seoChecks.push(createCheck(false, 0, "Image Alt Attributes", `${missingAlt} images missing alt text`, "Add alt text to all images."));
    }

    // INTERNAL/EXTERNAL LINKS
    const links = $('a');
    const internalLinks = links.filter((_, el) => {
        const href = $(el).attr('href');
        return href?.startsWith('/') || href?.includes(new URL(url).hostname) || false;
    }).length;

    seoChecks.push(createCheck(true, 5, "Link Analysis", `Found ${links.length} total links`, undefined, [`Internal: ${internalLinks}`, `External: ${links.length - internalLinks}`]));


    // ==========================================
    // PERFORMANCE Checks
    // ==========================================
    const performanceChecks: CheckResult[] = [];
    let performanceScore = 100;

    // Response Time
    if (responseTime < 500) {
        performanceChecks.push(createCheck(true, 20, "Server Response Time", `Fast: ${responseTime}ms`));
    } else if (responseTime < 1000) {
        performanceScore -= 10;
        performanceChecks.push(createCheck(true, 10, "Server Response Time", `Acceptable: ${responseTime}ms`));
    } else {
        performanceScore -= 20;
        performanceChecks.push(createCheck(false, 0, "Server Response Time", `Slow: ${responseTime}ms`, "Optimize server backend or use caching."));
    }

    // Page Size
    const htmlSize = html.length;
    if (htmlSize < 50 * 1024) performanceChecks.push(createCheck(true, 15, "Page Size", `Small: ${(htmlSize / 1024).toFixed(1)}KB`));
    else if (htmlSize < 150 * 1024) performanceChecks.push(createCheck(true, 10, "Page Size", `Medium: ${(htmlSize / 1024).toFixed(1)}KB`));
    else {
        performanceScore -= 15;
        performanceChecks.push(createCheck(false, 0, "Page Size", `Large: ${(htmlSize / 1024).toFixed(1)}KB`, "Minify HTML/CSS/JS."));
    }

    // Compression
    const contentEncoding = headers.get('content-encoding');
    if (contentEncoding?.includes('gzip') || contentEncoding?.includes('br')) {
        performanceChecks.push(createCheck(true, 10, "Compression", "Compression enabled."));
    } else {
        performanceScore -= 10; // Actually not always detectable via fetch if behind proxy, but good enough hint
        performanceChecks.push(createCheck(false, 0, "Compression", "Compression not detected", "Enable Gzip/Brotli."));
    }

    // ==========================================
    // SECURITY Checks
    // ==========================================
    const securityChecks: CheckResult[] = [];
    let securityScore = 100;

    if (url.startsWith('https')) {
        securityChecks.push(createCheck(true, 40, "SSL/HTTPS", "Secure connection used."));
    } else {
        securityScore -= 40;
        securityChecks.push(createCheck(false, 0, "SSL/HTTPS", "Insecure connection (HTTP)", "Enable HTTPS."));
    }

    // Headers
    if (headers.get('strict-transport-security')) securityChecks.push(createCheck(true, 10, "HSTS", "HSTS header present."));
    else { securityScore -= 5; securityChecks.push(createCheck(false, 0, "HSTS", "HSTS header missing", "Enable HSTS.")); }

    if (headers.get('x-frame-options')) securityChecks.push(createCheck(true, 10, "X-Frame-Options", "Clickjacking protection present."));
    else { securityScore -= 5; securityChecks.push(createCheck(false, 0, "X-Frame-Options", "Clickjacking protection missing", "Add X-Frame-Options header.")); }

    if (headers.get('x-content-type-options')) securityChecks.push(createCheck(true, 5, "X-Content-Type-Options", "MIME sniffing protection present."));
    else { securityScore -= 5; securityChecks.push(createCheck(false, 0, "X-Content-Type-Options", "MIME sniffing protection missing", "Add X-Content-Type-Options header.")); }


    // ==========================================
    // MOBILE Checks
    // ==========================================
    const mobileChecks: CheckResult[] = [];
    let mobileScore = 100;

    const viewport = $('meta[name="viewport"]').attr('content');
    if (viewport && viewport.includes('width=device-width')) {
        mobileChecks.push(createCheck(true, 40, "Viewport", "Mobile viewport tag present."));
    } else {
        mobileScore -= 40;
        mobileChecks.push(createCheck(false, 0, "Viewport", "Viewport tag missing/incorrect", "Add width=device-width viewport tag."));
    }

    // ==========================================
    // USABILITY Checks
    // ==========================================
    const usabilityChecks: CheckResult[] = [];
    let usabilityScore = 100;

    // Favicon
    const favicon = $('link[rel*="icon"]').attr('href');
    if (favicon) {
        usabilityChecks.push(createCheck(true, 20, "Favicon", "Favicon found."));
    } else {
        usabilityScore -= 20;
        usabilityChecks.push(createCheck(false, 0, "Favicon", "Favicon missing", "Add a favicon for branding."));
    }

    // Language
    const lang = $('html').attr('lang');
    if (lang) {
        usabilityChecks.push(createCheck(true, 20, "Language", `Language specified: ${lang}`));
    } else {
        usabilityScore -= 20;
        usabilityChecks.push(createCheck(false, 0, "Language", "Language attribute missing", "Specify language in html tag."));
    }

    // 404 Page (simulated check if generic) - hard to test without another request, skipping for now or assume existing
    // Print Friendly (search for print css)
    const printCss = $('link[media="print"]').length > 0 || html.includes('@media print');
    if (printCss) {
        usabilityChecks.push(createCheck(true, 10, "Print Friendly", "Print stylesheet detected."));
    } else {
        // Optional, no penalty
        usabilityChecks.push(createCheck(true, 0, "Print Friendly", "No print stylesheet found (optional)"));
    }


    // ==========================================
    // TECHNOLOGIES Checks
    // ==========================================
    const techChecks: CheckResult[] = [];
    const techScore = 100; // Informational mostly

    // Server
    const serverHeader = headers.get('server');
    if (serverHeader) techChecks.push(createCheck(true, 0, "Server", `Server: ${serverHeader}`));

    // Frameworks / Libs detection (naive)
    const scripts = $('script').map((_, el) => $(el).attr('src') || "").get().join(' ');
    const fullHtml = html.toLowerCase();

    if (fullHtml.includes('react') || scripts.includes('react')) techChecks.push(createCheck(true, 0, "Framework", "React detected"));
    if (fullHtml.includes('vue') || scripts.includes('vue')) techChecks.push(createCheck(true, 0, "Framework", "Vue.js detected"));
    if (fullHtml.includes('angular') || scripts.includes('angular')) techChecks.push(createCheck(true, 0, "Framework", "Angular detected"));
    if (fullHtml.includes('jquery') || scripts.includes('jquery')) techChecks.push(createCheck(true, 0, "Library", "jQuery detected"));
    if (fullHtml.includes('bootstrap') || html.includes('bootstrap')) techChecks.push(createCheck(true, 0, "UI Framework", "Bootstrap detected"));
    if (fullHtml.includes('tailwindcss')) techChecks.push(createCheck(true, 0, "CSS Framework", "Tailwind CSS detected"));

    // Analytics
    if (fullHtml.includes('google-analytics') || fullHtml.includes('gtag')) techChecks.push(createCheck(true, 0, "Analytics", "Google Analytics detected"));
    if (fullHtml.includes('facebook-pixel') || fullHtml.includes('fbevents')) techChecks.push(createCheck(true, 0, "Analytics", "Facebook Pixel detected"));


    // ==========================================
    // SOCIAL Checks
    // ==========================================
    const socialChecks: CheckResult[] = [];
    let socialScore = 100; // mostly existence

    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
    const foundSocials: string[] = [];

    links.each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
            for (const domain of socialDomains) {
                if (href.includes(domain) && !foundSocials.includes(domain)) {
                    foundSocials.push(domain);
                }
            }
        }
    });

    if (foundSocials.length > 0) {
        socialChecks.push(createCheck(true, 20, "Social Accounts", `Found links to: ${foundSocials.join(', ')}`));
    } else {
        socialScore -= 20;
        socialChecks.push(createCheck(false, 0, "Social Accounts", "No social media links found", "Link your social media profiles."));
    }

    // Meta Tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) {
        socialChecks.push(createCheck(true, 10, "Open Graph", "Open Graph tags present."));
    } else {
        socialScore -= 10;
        socialChecks.push(createCheck(false, 0, "Open Graph", "Open Graph tags missing", "Add OG tags for better sharing."));
    }


    // ==========================================
    // AGGREGATION
    // ==========================================

    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    seoScore = clamp(seoScore);
    performanceScore = clamp(performanceScore);
    securityScore = clamp(securityScore);
    mobileScore = clamp(mobileScore);
    usabilityScore = clamp(usabilityScore);
    // Social score is binary-ish, lets clamp
    socialScore = clamp(socialScore);


    const overallScore = Math.round(
        (seoScore + performanceScore + securityScore + mobileScore + usabilityScore) / 5
    );

    return {
        url,
        overallScore,
        seoScore,
        performanceScore,
        securityScore,
        mobileScore,
        technologiesScore: 100, // Tech is informational
        socialScore,
        usabilityScore,
        details: {
            seo: { score: seoScore, checks: seoChecks },
            performance: { score: performanceScore, checks: performanceChecks },
            security: { score: securityScore, checks: securityChecks },
            mobile: { score: mobileScore, checks: mobileChecks },
            usability: { score: usabilityScore, checks: usabilityChecks },
            technologies: { score: 100, checks: techChecks },
            social: { score: socialScore, checks: socialChecks },
        } as any,
    };
}
