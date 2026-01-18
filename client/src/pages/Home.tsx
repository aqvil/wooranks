import { UrlInput } from "@/components/UrlInput";
import { ReportCard } from "@/components/ReportCard";
import { useReports } from "@/hooks/use-reports";
import { BarChart3, ShieldCheck, Zap, Globe, Smartphone, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: reports, isLoading } = useReports();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navbar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SiteAudit<span className="text-primary">.io</span></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Features</a>
            <a href="#recent" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Recent</a>
            <button className="text-sm font-semibold bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-700" />
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                Optimize your website for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">peak performance</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Get a comprehensive analysis of your SEO, performance, security, and mobile responsiveness in seconds. actionable insights included.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UrlInput />
            </motion.div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>SSL Security Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Core Web Vitals</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>SEO Audit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reports Section */}
        <section id="recent" className="py-20 bg-secondary/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Recent Analyses</h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.slice(0, 6).map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground">Be the first to analyze a website!</p>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Coverage</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We check over 50 data points to ensure your website is performing at its best across all major categories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Search, title: "SEO", desc: "Title tags, meta descriptions, headings hierarchy, and keyword consistency." },
                { icon: Zap, title: "Performance", desc: "Page load speed, resource sizes, caching policies, and Core Web Vitals." },
                { icon: Smartphone, title: "Mobile", desc: "Responsiveness, touch targets, viewport configuration, and font legibility." },
                { icon: ShieldCheck, title: "Security", desc: "SSL certification, HTTPS usage, and secure headers configuration." },
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <BarChart3 className="w-5 h-5 text-primary" />
             <span className="font-bold text-lg">SiteAudit.io</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 SiteAudit.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
