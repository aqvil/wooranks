import { InsertReport, AnalysisSection, CheckResult } from "@shared/schema";
import * as cheerio from "cheerio";

// Helper for check creation
const createCheck = (
    passed: boolean,
    score: number, // 0-100 impact
    title: string,
    description: string,
    impact: "high" | "medium" | "low",
    difficulty: "hard" | "medium" | "easy",
    explanation: string,
    howToFix: string,
    recommendation?: string,
    details?: string[],
    learnMoreUrl?: string
): CheckResult => ({
    passed,
    score,
    title,
    description,
    impact,
    difficulty,
    explanation,
    howToFix,
    recommendation,
    details,
    learnMoreUrl
});

function calculateAverageScore(checks: CheckResult[]): number {
    if (checks.length === 0) return 0;
    const total = checks.reduce((sum, check) => sum + check.score, 0);
    return Math.round(total / checks.length);
}

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
        seoChecks.push(createCheck(true, 10, "Title Tag", `Perfect length: ${title.length} chars`, "high", "easy",
            "The title tag is the most important on-page SEO element. It appears in search results and browser tabs.",
            "You're doing great! Keep keywords near the front.",
            undefined, [title]));
    } else if (title.length > 0) {
        seoScore -= 5;
        seoChecks.push(createCheck(false, 60, "Title Tag", `Length is ${title.length} chars (10-60 recommended)`, "high", "easy",
            "The title tag is the clickable headline in Google search results. If it's too long, it gets cut off (truncated). If it's too short, it wastes opportunity.",
            `Update your HTML head:
\`\`\`html
<head>
  <title>Your Keyword - Your Brand</title>
</head>
\`\`\`
Aim for 50-60 characters.`,
            "Optimize title length.", [title]));
    } else {
        seoChecks.push(createCheck(false, 0, "Title Tag", "Missing title tag", "high", "easy",
            "Without a title tag, search engines have to guess what your page is about, often resulting in \"Untitled\" or unrelated text links.",
            "Add this inside your `<head>` tag immediately:\n```html\n<title>Primary Keyword | Brand Name</title>\n```",
            "Add a descriptive title tag."));
    }

    // Meta Description
    if (metaDesc.length >= 50 && metaDesc.length <= 160) {
        seoChecks.push(createCheck(true, 100, "Meta Description", `Perfect length: ${metaDesc.length} chars`, "high", "easy",
            "Meta descriptions summarize your page content for search engines and users.",
            "Excellent. Ensure it includes a call-to-action to maximize clicks.",
            undefined, [metaDesc]));
    } else if (metaDesc.length > 0) {
        seoChecks.push(createCheck(false, 60, "Meta Description", `Length is ${metaDesc.length} chars (50-160 recommended)`, "high", "easy",
            "Meta descriptions provide a summary in SERPs. Descriptions under 50 chars are too vague; over 160 get cut off.",
            `Edit your page header:
\`\`\`html
<meta name="description" content="A brief, 160-character summary of your page content including keywords.">
\`\`\`
`,
            "Optimize description length.", [metaDesc]));
    } else {
        seoChecks.push(createCheck(false, 0, "Meta Description", "Missing meta description", "high", "easy",
            "Missing descriptions mean Google will pull random text from your page, which looks messy in search results.",
            "Add this to your `<head>`:\n```html\n<meta name=\"description\" content=\"Buy the best widgets online. Free shipping on all orders.\">\n```",
            "Add a meta description to improve CTR."));
    }

    // Headings
    if (h1Count === 1) {
        seoChecks.push(createCheck(true, 100, "Headings", "Exactly one H1 tag found.", "medium", "easy",
            "H1 tags indicate the main topic of your page. Having exactly one helps search engines understand the primary subject.",
            "Perfect structure.",
            undefined, [$("h1").first().text().substring(0, 50) + "..."]));
    } else {
        seoChecks.push(createCheck(false, 50, "Headings", `Found ${h1Count} H1 tags`, "medium", "easy",
            "A page should have exactly one H1 tag to signal the main topic. Multiple H1s dilute relevance.",
            `**Fix:**
1. Find your main title and wrap it in \`<h1>...</h1>\`.
2. Change other headings (subtitles) to \`<h2>\`, \`<h3>\`, etc.
`,
            "Use exactly one H1 tag per page."));
    }

    // Canonical
    if (canonical) {
        seoChecks.push(createCheck(true, 100, "Canonical Tag", "Canonical tag is present.", "medium", "medium",
            "Canonical tags tell Google 'this is the main version of this page', preventing duplicate content penalties.",
            "Good job.",
            undefined, [canonical]));
    } else {
        seoChecks.push(createCheck(false, 0, "Canonical Tag", "Missing canonical tag", "medium", "medium",
            "If users can access your site via `http`, `https`, `www`, and `non-www`, Google sees 4 duplicate sites.",
            `Add this to your \`<head>\`:
\`\`\`html
<link rel="canonical" href="https://example.com/current-page" />
\`\`\`
`,
            "Add a canonical tag to prevent duplicate content."));
    }

    // Robots
    if (robots) {
        seoChecks.push(createCheck(true, 100, "Robots Meta Tag", `Robots meta tag found: ${robots}`, "medium", "easy",
            "The robots meta tag controls how search engines crawl and index your page.",
            "Verify that the directives (index, follow) match your intentions."));
    } else {
        seoChecks.push(createCheck(true, 100, "Robots Meta Tag", "No robots meta tag (defaults to index, follow)", "medium", "easy",
            "Without a robots meta tag, search engines default to indexing the page and following links.",
            "No action needed unless you want to hide this page."));
    }

    // NEW: Sitemap Detection (Heuristic Check in Logic - usually needs separate fetch)
    // We can't easily check robots.txt file without another fetch, so we'll skip or simulate.
    // We'll skip for now to avoid complexity of multiple fetches, but we CAN check for sitemap link in footer.
    const sitemapLink = $('a[href*="sitemap.xml"]').length > 0 || $('a[href*="sitemap.html"]').length > 0;
    if (sitemapLink) {
        seoChecks.push(createCheck(true, 100, "Sitemap Link", "Sitemap link detection in HTML", "low", "easy",
            "Linking to a sitemap helps users and crawlers navigate your site.",
            "Ensure your sitemap is also submitted to Google Search Console."));
    } else {
        // Don't penalize too much as it might be in robots.txt
        seoChecks.push(createCheck(true, 0, "Sitemap Link", "No sitemap link found in HTML (check robots.txt)", "low", "easy",
            "A sitemap helps index your content. It is usually linked in the footer or declared in robots.txt.",
            `Ensure you have a line in your \`robots.txt\`:
\`\`\`
Sitemap: https://example.com/sitemap.xml
\`\`\`
`, "Ensure you have a sitemap.xml and it is referenced in your robots.txt."));
    }

    // NEW: Structured Data (JSON-LD)
    const jsonLd = $('script[type="application/ld+json"]').length > 0;
    if (jsonLd) {
        seoChecks.push(createCheck(true, 100, "Structured Data", "Schema.org (JSON-LD) detected.", "high", "hard",
            "Structured data helps search engines understand your content and can lead to rich snippets (stars, prices, etc.) in results.",
            "Validate your schema using Google's Rich Results Test tool."));
    } else {
        seoChecks.push(createCheck(false, 0, "Structured Data", "No Schema.org data detected", "high", "hard",
            "Structured data allows you to provide explicit clues about the meaning of a page to Google.",
            `Use a tool closer to your stack (e.g. \`schema-dts\`) or add a script tag:
\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "url": "${url}",
  "logo": "https://www.example.com/logo.png"
}
</script>
\`\`\`
`,
            "Implement Schema.org structured data."));
    }


    // Alt Attributes
    const images = $('img');
    let missingAlt = 0;
    images.each((_, el) => { if (!$(el).attr('alt')) missingAlt++; });

    if (missingAlt === 0 && images.length > 0) {
        seoChecks.push(createCheck(true, 100, "Image Alt Attributes", "All images have alt text.", "medium", "easy",
            "Alt text describes images to search engines and screen readers.",
            "Keep alt text descriptive and relevant."));
    } else if (images.length === 0) {
        seoChecks.push(createCheck(true, 100, "Image Alt Attributes", "No images found.", "medium", "easy",
            "Images enrich content, but having none is not technically an error.", "Consider adding visual content."));
    } else {
        seoChecks.push(createCheck(false, 0, "Image Alt Attributes", `${missingAlt} images missing alt text`, "medium", "easy",
            "Search engines cannot 'see' images. They rely on the alt attribute to understand the image context.",
            `Find your \`<img>\` tags and add the alt attribute:
\`\`\`html
<!-- Bad -->
<img src="dog.jpg">

<!-- Good -->
<img src="dog.jpg" alt="A golden retriever playing fetch">
\`\`\`
`,
            "Add alt text to all images."));
    }

    // INTERNAL/EXTERNAL LINKS
    const links = $('a');
    const internalLinks = links.filter((_, el) => {
        const href = $(el).attr('href');
        return href?.startsWith('/') || href?.includes(new URL(url).hostname) || false;
    }).length;

    seoChecks.push(createCheck(true, 100, "Link Analysis", `Found ${links.length} total links`, "low", "medium",
        "Links determine the structure of your site and how value (link juice) flows.",
        "Ensure a healthy ratio of internal to external links.",
        undefined, [`Internal: ${internalLinks}`, `External: ${links.length - internalLinks}`]));


    // ==========================================
    // PERFORMANCE Checks
    // ==========================================
    const performanceChecks: CheckResult[] = [];

    // Response Time
    if (responseTime < 500) {
        performanceChecks.push(createCheck(true, 100, "Server Response Time", `Fast: ${responseTime}ms`, "high", "hard",
            "Time to First Byte (TTFB) is a key metric for user experience and SEO.",
            "Great job! Keep monitoring response times."));
    } else if (responseTime < 1000) {
        performanceChecks.push(createCheck(false, 75, "Server Response Time", `Acceptable: ${responseTime}ms`, "high", "hard",
            "Response time is acceptable but could be better.",
            "Optimize database queries, install a caching plugin, or upgrade your hosting plan."));
    } else {
        performanceChecks.push(createCheck(false, 0, "Server Response Time", `Slow: ${responseTime}ms`, "high", "hard",
            "Slow server response times frustrate users and hurt rankings.",
            "Enable page caching, optimize backend code, use a CDN, or upgrade server resources.",
            "Optimize server backend or use caching."));
    }

    // Page Size
    const htmlSize = html.length;
    if (htmlSize < 50 * 1024) performanceChecks.push(createCheck(true, 100, "Page Size", `Small: ${(htmlSize / 1024).toFixed(1)}KB`, "medium", "medium",
        "Smaller pages load faster and use less data.", "Excellent work keeping page size down."));
    else if (htmlSize < 150 * 1024) performanceChecks.push(createCheck(false, 80, "Page Size", `Medium: ${(htmlSize / 1024).toFixed(1)}KB`, "medium", "medium",
        "Page size is reasonable.", "Monitor size as you add more content."));
    else {
        performanceChecks.push(createCheck(false, 0, "Page Size", `Large: ${(htmlSize / 1024).toFixed(1)}KB`, "medium", "medium",
            "Large HTML files take longer to download and parse.",
            "Minify HTML, remove inline CSS/JS, and clean up code.",
            "Minify HTML/CSS/JS."));
    }

    // NEW: Asset Minification (Heuristic)
    const nonMinified: string[] = [];
    $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || "";
        if (src.includes('.js') && !src.includes('.min.js') && !src.includes('cdn')) nonMinified.push(src);
    });
    $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href') || "";
        if (href.includes('.css') && !href.includes('.min.css') && !href.includes('cdn')) nonMinified.push(href);
    });

    if (nonMinified.length === 0) {
        performanceChecks.push(createCheck(true, 100, "Asset Minification", "All detected assets appear minified.", "medium", "medium",
            "Minification removes whitespace and comments from code files to reduce size.",
            "Keep using build tools that auto-minify your assets."));
    } else {
        performanceChecks.push(createCheck(false, 60, "Asset Minification", `${nonMinified.length} assets potentially not minified.`, "medium", "medium",
            "Minified files download faster.",
            `**How to fix:**
If using **Webpack/Vite**: Ensure you run the \`build\` command (e.g. \`npm run build\`) for production, which auto-minifies.
If using raw CSS/JS: Use a tool like [Minifier.org](https://minifier.org).`,
            "Minify your CSS and JS assets.", nonMinified.slice(0, 5)));
    }


    // Compression
    const contentEncoding = headers.get('content-encoding');
    if (contentEncoding?.includes('gzip') || contentEncoding?.includes('br')) {
        performanceChecks.push(createCheck(true, 100, "Compression", "Compression enabled.", "high", "hard",
            "Compression significantly reduces the size of files sent from your server.", "Great! Gzip or Brotli is active."));
    } else {
        performanceChecks.push(createCheck(false, 0, "Compression", "Compression not detected", "high", "hard",
            "Text-based resources (HTML, CSS, JS) should be compressed to save bandwidth. This is usually a server config.",
            `**Nginx:**
\`\`\`nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
\`\`\`

**Apache:**
\`\`\`apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
</IfModule>
\`\`\`
`,
            "Enable Gzip/Brotli."));
    }

    // ==========================================
    // SECURITY Checks
    // ==========================================
    const securityChecks: CheckResult[] = [];

    if (url.startsWith('https')) {
        securityChecks.push(createCheck(true, 100, "SSL/HTTPS", "Secure connection used.", "high", "hard",
            "HTTPS encrypts data between the user's browser and your server, ensuring privacy and security.",
            "Your site is secure."));
    } else {
        securityChecks.push(createCheck(false, 0, "SSL/HTTPS", "Insecure connection (HTTP)", "high", "hard",
            "Google penalizes non-secure sites. Users will see a 'Not Secure' warning.",
            "Install a free SSL certificate from **Let's Encrypt** or use **Cloudflare**'s free tier to handle SSL for you.",
            "Enable HTTPS."));
    }

    // Headers
    if (headers.get('strict-transport-security')) securityChecks.push(createCheck(true, 100, "HSTS", "HSTS header present.", "medium", "hard",
        "HSTS tells browsers to only interact with your site using HTTPS, preventing downgrade attacks.",
        "Configuration is good."));
    else {
        securityChecks.push(createCheck(false, 0, "HSTS", "HSTS header missing", "medium", "hard",
            "HTTP Strict Transport Security (HSTS) strengthens your SSL implementation.",
            `Add this header to your server response:
\`Strict-Transport-Security: max-age=31536000; includeSubDomains\`
`,
            "Enable HSTS."));
    }

    if (headers.get('x-frame-options')) securityChecks.push(createCheck(true, 100, "X-Frame-Options", "Clickjacking protection present.", "medium", "medium",
        "This header prevents your site from being embedded in iframes on other sites.",
        "Site is protected against clickjacking."));
    else {
        securityChecks.push(createCheck(false, 0, "X-Frame-Options", "Clickjacking protection missing", "medium", "medium",
            "Without this header, malicious sites could embed your site to trick users.",
            `Add this header:
\`X-Frame-Options: SAMEORIGIN\`
`,
            "Add X-Frame-Options header."));
    }

    if (headers.get('x-content-type-options')) securityChecks.push(createCheck(true, 100, "X-Content-Type-Options", "MIME sniffing protection present.", "low", "easy",
        "Prevents browsers from interpreting files as a different MIME type than what is specified.",
        "Configuration matches best practices."));
    else {
        securityChecks.push(createCheck(false, 0, "X-Content-Type-Options", "MIME sniffing protection missing", "low", "easy",
            "This reduces exposure to drive-by downloads and media type confusion attacks.",
            `Add this header:
\`X-Content-Type-Options: nosniff\`
`,
            "Add X-Content-Type-Options header."));
    }


    // ==========================================
    // MOBILE Checks
    // ==========================================
    const mobileChecks: CheckResult[] = [];

    const viewport = $('meta[name="viewport"]').attr('content');
    if (viewport && viewport.includes('width=device-width')) {
        mobileChecks.push(createCheck(true, 100, "Viewport", "Mobile viewport tag present.", "high", "easy",
            "The viewport tag tells browsers how to adjust dimensions and scaling for mobile devices.",
            "Mobile optimization is active."));
    } else {
        mobileChecks.push(createCheck(false, 0, "Viewport", "Viewport tag missing/incorrect", "high", "easy",
            "Without a viewport tag, mobile browsers will render the desktop version and shrink it down, making it unreadable.",
            `Add this inside \`<head>\`:
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1">
\`\`\`
`,
            "Add width=device-width viewport tag."));
    }

    // ==========================================
    // USABILITY Checks
    // ==========================================
    const usabilityChecks: CheckResult[] = [];

    // Favicon
    const favicon = $('link[rel*="icon"]').attr('href');
    if (favicon) {
        usabilityChecks.push(createCheck(true, 100, "Favicon", "Favicon found.", "low", "easy",
            "Favicons help users identify your tab in their browser.", "Favicon is present."));
    } else {
        usabilityChecks.push(createCheck(false, 0, "Favicon", "Favicon missing", "low", "easy",
            "Missing favicons look unprofessional and make it hard to find tabs.",
            `Add a link to your icon in \`<head>\`:
\`\`\`html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
\`\`\`
`, "Add a favicon."));
    }

    // Language
    const lang = $('html').attr('lang');
    if (lang) {
        usabilityChecks.push(createCheck(true, 100, "Language", `Language specified: ${lang}`, "medium", "easy",
            "Declaring a language helps screen readers and translation tools.",
            "Language is correctly set."));
    } else {
        usabilityChecks.push(createCheck(false, 0, "Language", "Language attribute missing", "medium", "easy",
            "Without a language tag, browsers/tools assume default (often English) which might be wrong.",
            `Update your opening HTML tag:
\`\`\`html
<html lang="en">
\`\`\`
`,
            "Specify language in html tag."));
    }

    // Print Friendly (search for print css)
    const printCss = $('link[media="print"]').length > 0 || html.includes('@media print');
    if (printCss) {
        usabilityChecks.push(createCheck(true, 100, "Print Friendly", "Print stylesheet detected.", "low", "medium",
            "Print stylesheets ensure your page looks good when printed (hiding navs, adjusting colors).",
            "Print optimization is active."));
    } else {
        // Optional, no penalty
        usabilityChecks.push(createCheck(true, 100, "Print Friendly", "No print stylesheet found (optional)", "low", "medium",
            "Not strictly required, but good for articles/recipes.",
            `Add a print block to your CSS:
\`\`\`css
@media print {
  nav, footer, .ad { display: none; }
  body { color: black; background: white; }
}
\`\`\`
`));
    }


    // ==========================================
    // TECHNOLOGIES Checks
    // ==========================================
    const techChecks: CheckResult[] = [];

    // Server
    const serverHeader = headers.get('server');
    if (serverHeader) techChecks.push(createCheck(true, 100, "Server", `Server: ${serverHeader}`, "low", "hard", "The web server software used.", "Information only."));

    // Frameworks / Libs detection (naive)
    const scripts = $('script').map((_, el) => $(el).attr('src') || "").get().join(' ');
    const fullHtml = html.toLowerCase();

    if (fullHtml.includes('react') || scripts.includes('react')) techChecks.push(createCheck(true, 100, "Framework", "React detected", "medium", "medium", "Modern JS library for building UIs.", "No action needed."));
    if (fullHtml.includes('vue') || scripts.includes('vue')) techChecks.push(createCheck(true, 100, "Framework", "Vue.js detected", "medium", "medium", "Progressive JS framework.", "No action needed."));
    if (fullHtml.includes('angular') || scripts.includes('angular')) techChecks.push(createCheck(true, 100, "Framework", "Angular detected", "medium", "medium", "Platform for building web apps.", "No action needed."));
    if (fullHtml.includes('jquery') || scripts.includes('jquery')) techChecks.push(createCheck(true, 100, "Library", "jQuery detected", "low", "easy", "Legacy JS library.", "Consider migrating to modern vanilla JS if possible."));
    if (fullHtml.includes('bootstrap') || html.includes('bootstrap')) techChecks.push(createCheck(true, 100, "UI Framework", "Bootstrap detected", "low", "medium", "CSS framework.", "No action needed."));
    if (fullHtml.includes('tailwindcss')) techChecks.push(createCheck(true, 100, "CSS Framework", "Tailwind CSS detected", "low", "medium", "Utility-first CSS framework.", "No action needed."));

    // Analytics
    if (fullHtml.includes('google-analytics') || fullHtml.includes('gtag')) techChecks.push(createCheck(true, 100, "Analytics", "Google Analytics detected", "medium", "easy", "Traffic tracking tool.", "No action needed."));
    if (fullHtml.includes('facebook-pixel') || fullHtml.includes('fbevents')) techChecks.push(createCheck(true, 100, "Analytics", "Facebook Pixel detected", "medium", "easy", "Conversion tracking tool.", "No action needed."));


    // ==========================================
    // SOCIAL Checks
    // ==========================================
    const socialChecks: CheckResult[] = [];

    const socialDomains = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'github.com', 'threads.net', 'discord.com'];
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
        socialChecks.push(createCheck(true, 100, "Social Accounts", `Found links to: ${foundSocials.join(', ')}`, "medium", "easy",
            "Social media drives traffic and builds brand authority.", "Great, you are linking to social profiles."));
    } else {
        socialChecks.push(createCheck(false, 0, "Social Accounts", "No social media links found", "medium", "easy",
            "Social signals are indirect ranking factors.",
            "Add links to your active social media profiles in the header or footer.",
            "Link your social media profiles."));
    }

    // Meta Tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) {
        socialChecks.push(createCheck(true, 100, "Open Graph", "Open Graph tags present.", "medium", "easy",
            "Open Graph protocols control how your content is displayed when shared on social media.",
            "Implementation is correct."));
    } else {
        socialChecks.push(createCheck(false, 0, "Open Graph", "Open Graph tags missing", "medium", "easy",
            "Without OG tags, social networks guess which image and title to use.",
            `Add these tags to \`<head>\`:
\`\`\`html
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/thumb.jpg">
\`\`\`
`,
            "Add OG tags for better sharing."));
    }

    // ==========================================
    // LOCAL SEO Checks (New)
    // ==========================================
    // Basic heuristic for phone/email
    const phonePattern = /(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;

    const hasPhone = phonePattern.test(html);
    const hasEmail = emailPattern.test(html);

    if (hasPhone || hasEmail) {
        usabilityChecks.push(createCheck(true, 100, "Contact Info", "Contact information found.", "medium", "easy",
            "Displaying contact info builds trust and helps local SEO.", "Contact info is visible."));
    } else {
        // Don't penalty too hard, maybe they use a form
        usabilityChecks.push(createCheck(true, 100, "Contact Info", "No phone or email detected directly.", "medium", "easy",
            "Clear contact info improves trust.", "Ensure phone or email is visible if applicable."));
    }


    // ==========================================
    // AGGREGATION
    // ==========================================

    // Dynamic Score Calculation
    const overallScore = Math.round(
        (calculateAverageScore(seoChecks) +
            calculateAverageScore(mobileChecks) +
            calculateAverageScore(performanceChecks) +
            calculateAverageScore(securityChecks) +
            calculateAverageScore(usabilityChecks) +
            calculateAverageScore(socialChecks) +
            calculateAverageScore(techChecks)) / 7
    );

    return {
        url,
        overallScore,
        seoScore: calculateAverageScore(seoChecks),
        performanceScore: calculateAverageScore(performanceChecks),
        securityScore: calculateAverageScore(securityChecks),
        mobileScore: calculateAverageScore(mobileChecks),
        technologiesScore: calculateAverageScore(techChecks),
        socialScore: calculateAverageScore(socialChecks),
        usabilityScore: calculateAverageScore(usabilityChecks),
        details: {
            seo: { score: calculateAverageScore(seoChecks), checks: seoChecks },
            performance: { score: calculateAverageScore(performanceChecks), checks: performanceChecks },
            security: { score: calculateAverageScore(securityChecks), checks: securityChecks },
            mobile: { score: calculateAverageScore(mobileChecks), checks: mobileChecks },
            usability: { score: calculateAverageScore(usabilityChecks), checks: usabilityChecks },
            technologies: { score: calculateAverageScore(techChecks), checks: techChecks },
            social: { score: calculateAverageScore(socialChecks), checks: socialChecks },
        } as any,
    };
}
