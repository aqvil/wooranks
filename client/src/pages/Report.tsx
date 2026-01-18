import { useEffect, useState } from "react";
import { useReport } from "@/hooks/use-reports";
import { useRoute } from "wouter";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CheckItem } from "@/components/CheckItem";
import { Report as ReportType, AnalysisResult } from "@shared/schema";
import { 
  ArrowLeft, Download, Share2, 
  Search, Zap, Smartphone, ShieldCheck, 
  AlertTriangle, CheckCircle2 
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ReportPage() {
  const [, params] = useRoute("/report/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: report, isLoading, error } = useReport(id);
  const [activeTab, setActiveTab] = useState<"overview" | "seo" | "performance" | "mobile" | "security">("overview");

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

  // Type assertion for details since it's stored as jsonb
  const details = report.details as unknown as AnalysisResult;

  const tabs = [
    { id: "overview", label: "Overview", icon: null },
    { id: "seo", label: "SEO", icon: Search },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "security", label: "Security", icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{new URL(report.url).hostname}</h1>
                <a href={report.url} target="_blank" rel="noopener" className="text-sm text-muted-foreground hover:text-primary truncate block">
                  {report.url}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation (Mobile: Horizontal Scroll, Desktop: Vertical Stack) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Overall Score Card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Overall Score</h3>
                <ScoreGauge score={report.overallScore} size="xl" showLabel={false} />
                <div className="mt-4 text-sm text-muted-foreground">
                  Analyzed on {new Date(report.createdAt!).toLocaleDateString()}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
                        activeTab === tab.id 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                          : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
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

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" ? (
                <div className="space-y-8">
                  {/* Category Scores Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "SEO", score: report.seoScore, icon: Search },
                      { label: "Performance", score: report.performanceScore, icon: Zap },
                      { label: "Mobile", score: report.mobileScore, icon: Smartphone },
                      { label: "Security", score: report.securityScore, icon: ShieldCheck },
                    ].map((item) => (
                      <div key={item.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab(item.label.toLowerCase() as any)}>
                        <item.icon className="w-6 h-6 text-muted-foreground" />
                        <div className="text-center">
                          <div className={cn("text-2xl font-bold mb-1", 
                            item.score >= 80 ? "text-score-good" : 
                            item.score >= 50 ? "text-score-average" : "text-score-poor"
                          )}>
                            {item.score}
                          </div>
                          <div className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Critical Issues Section */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-score-poor" />
                      Critical Issues to Fix
                    </h2>
                    <div className="space-y-3">
                      {/* Collect all failed checks from all sections */}
                      {[
                        ...details.seo.checks,
                        ...details.performance.checks,
                        ...details.security.checks,
                        ...details.mobile.checks,
                      ].filter(check => !check.passed && check.score < 50).length === 0 ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-green-800">Amazing job!</h3>
                          <p className="text-green-700">No critical issues found on your website.</p>
                        </div>
                      ) : (
                        [
                          ...details.seo.checks,
                          ...details.performance.checks,
                          ...details.security.checks,
                          ...details.mobile.checks,
                        ]
                        .filter(check => !check.passed && check.score < 50)
                        .map((check, i) => (
                          <CheckItem key={i} check={check} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold capitalize">{activeTab} Analysis</h2>
                      <p className="text-muted-foreground mt-1">Detailed breakdown of {activeTab} factors</p>
                    </div>
                    <div className="hidden md:block">
                      <ScoreGauge 
                        score={
                          activeTab === 'seo' ? report.seoScore :
                          activeTab === 'performance' ? report.performanceScore :
                          activeTab === 'mobile' ? report.mobileScore :
                          report.securityScore
                        } 
                        size="md" 
                        showLabel={false} 
                      />
                    </div>
                  </div>

                  {/* Checks List */}
                  <div className="space-y-4">
                    {(details[activeTab as keyof typeof details] as any).checks.map((check: any, i: number) => (
                      <CheckItem key={i} check={check} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
