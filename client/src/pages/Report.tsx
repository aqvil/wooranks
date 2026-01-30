import { useEffect, useState, useRef } from "react";
import { useReport } from "@/hooks/use-reports";
import { useRoute } from "wouter";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CheckItem } from "@/components/CheckItem";
import { ReportHeader } from "@/components/ReportHeader";
import { Report as ReportType, AnalysisResult } from "@shared/schema";
import {
  ArrowLeft, Download, Share2,
  Search, Zap, Smartphone, ShieldCheck,
  AlertTriangle, CheckCircle2,
  MousePointerClick, Layers
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportPage() {
  const [, params] = useRoute("/report/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: report, isLoading, error } = useReport(id);
  const [activeTab, setActiveTab] = useState<"overview" | "seo" | "performance" | "mobile" | "security" | "technologies" | "social" | "usability">("seo");

  const overviewRef = useRef<HTMLDivElement>(null);
  const seoRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);

  const technologiesRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const usabilityRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    overview: overviewRef,
    seo: seoRef,
    performance: performanceRef,
    usability: usabilityRef,
    mobile: mobileRef,
    technologies: technologiesRef,
    social: socialRef,
    security: securityRef,
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerOffset = 250; // Trigger line approx 250px down (good for reading)
      let currentActiveId: any = "seo"; // Default to top

      // Order matches DOM order
      const sections = [
        { id: "seo", ref: seoRef },
        { id: "performance", ref: performanceRef },
        { id: "usability", ref: usabilityRef },
        { id: "mobile", ref: mobileRef },
        { id: "technologies", ref: technologiesRef },
        { id: "social", ref: socialRef },
        { id: "security", ref: securityRef },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          // If the top of the section has scrolled up past the trigger line
          if (rect.top <= headerOffset) {
            currentActiveId = section.id;
          }
        }
      }

      setActiveTab(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: keyof typeof sectionRefs) => {
    const element = sectionRefs[sectionId].current;
    if (element) {
      const offset = element.offsetTop - 100;
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading analysis report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center px-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested analysis could not be found. It may have expired or the ID is incorrect.</p>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Handle legacy reports that might be missing new sections
  const rawDetails = report.details as any;
  const details: AnalysisResult = {
    ...rawDetails,
    seo: rawDetails.seo || { score: 0, checks: [] },
    performance: rawDetails.performance || { score: 0, checks: [] },
    security: rawDetails.security || { score: 0, checks: [] },
    mobile: rawDetails.mobile || { score: 0, checks: [] },
    // New sections with defaults for old reports
    usability: rawDetails.usability || { score: 0, checks: [] },
    technologies: rawDetails.technologies || { score: 0, checks: [] },
    social: rawDetails.social || { score: 0, checks: [] },
  };

  const tabs = [
    { id: "seo", label: "SEO", icon: Search },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "usability", label: "Usability", icon: MousePointerClick },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "technologies", label: "Technologies", icon: Layers },
    { id: "social", label: "Social", icon: Share2 },
    { id: "security", label: "Security", icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-foreground selection:text-background">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="dark:hidden fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>

            <a href={report.url} target="_blank" rel="noopener" className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors truncate max-w-md">
              {report.url}
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* NEW HEADER COMPONENT */}
        <ReportHeader report={report} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap lg:w-full border-l-2",
                        activeTab === tab.id
                          ? "border-foreground text-foreground bg-secondary/50"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area - Scrolling Sections */}
          <div className="lg:col-span-9 space-y-16 pb-24">
            {/* Note: Overview section removed as it's replaced by Header */}

            {/* SEO Section */}
            <section id="seo" ref={seoRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">SEO</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_SEO_OPTIMIZATION</p>
              </div>
              <div className="bg-card border border-border">
                {details.seo.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Performance Section */}
            <section id="performance" ref={performanceRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Performance</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_PERFORMANCE_METRICS</p>
              </div>
              <div className="bg-card border border-border">
                {details.performance.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Usability Section */}
            <section id="usability" ref={usabilityRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Usability</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_USER_EXPERIENCE</p>
              </div>
              <div className="bg-card border border-border">
                {details.usability.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Mobile Section */}
            <section id="mobile" ref={mobileRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Mobile</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_RESPONSIVENESS</p>
              </div>
              <div className="bg-card border border-border">
                {details.mobile.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Technologies Section */}
            <section id="technologies" ref={technologiesRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Technologies</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_TECH_STACK</p>
              </div>
              <div className="bg-card border border-border">
                {details.technologies.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Social Section */}
            <section id="social" ref={socialRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Social</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_SOCIAL_PRESENCE</p>
              </div>
              <div className="bg-card border border-border">
                {details.social.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

            {/* Security Section */}
            <section id="security" ref={securityRef} className="scroll-mt-24">
              <div className="mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Security</h2>
                <p className="text-muted-foreground font-mono text-sm mt-1">MODULE_SECURITY_PROTOCOLS</p>
              </div>
              <div className="bg-card border border-border">
                {details.security.checks.map((check, i) => (
                  <CheckItem key={i} check={check} />
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
