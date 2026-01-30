import { UrlInput } from "@/components/UrlInput";
import { ReportCard } from "@/components/ReportCard";
import { useReports } from "@/hooks/use-reports";
import { BarChart3, ShieldCheck, Zap, Globe, Smartphone, Search, Terminal, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: reports, isLoading } = useReports();

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

      {/* Navbar */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-foreground text-background p-1.5 rounded-none">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">SiteAudit<span className="opacity-50">.io</span></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Features</a>
            <a href="#recent" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Recent</a>
            <button className="text-sm font-semibold bg-foreground text-background px-5 py-2 hover:opacity-90 transition-opacity rounded-none border border-transparent">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs font-medium text-muted-foreground mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
                </span>
                System Operational
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-8 text-balance">
                Instant Website Audit & <br />
                <span className="text-muted-foreground">Performance Metrics</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Comprehensive analysis of SEO, performance, security, and mobile responsiveness. No fluff, just data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="p-1 bg-secondary/50 border border-border rounded-lg backdrop-blur-sm">
                <UrlInput />
              </div>
            </motion.div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>SSL Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Core Web Vitals</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>SEO Audit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reports Section */}
        <section id="recent" className="py-24 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Recent Analyses</h2>
                <p className="text-muted-foreground mt-2">Latest public reports generated by users.</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.slice(0, 6).map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-border border-dashed bg-card/50">
                <div className="w-16 h-16 bg-secondary flex items-center justify-center mx-auto mb-4 rounded-none">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground">Be the first to analyze a website!</p>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Comprehensive Coverage</h2>
              <p className="text-lg text-muted-foreground">
                We check over 50 data points to ensure your website is performing at its best across all major categories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
              {[
                { icon: Search, title: "SEO", desc: "Title tags, meta descriptions, headings hierarchy, and keyword consistency." },
                { icon: Zap, title: "Performance", desc: "Page load speed, resource sizes, caching policies, and Core Web Vitals." },
                { icon: Smartphone, title: "Mobile", desc: "Responsiveness, touch targets, viewport configuration, and font legibility." },
                { icon: ShieldCheck, title: "Security", desc: "SSL certification, HTTPS usage, and secure headers configuration." },
              ].map((feature, i) => (
                <div key={i} className="bg-card p-10 hover:bg-secondary/40 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center mb-6 text-foreground border border-border bg-secondary/20">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <span className="font-bold text-lg tracking-tight">SiteAudit.io</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 SiteAudit.io. Open Source.</p>
        </div>
      </footer>
    </div>
  );
}
