import { Link } from "wouter";
import { Report } from "@shared/schema";
import { formatDistance } from "date-fns";
import { ScoreGauge } from "./ScoreGauge";
import { ExternalLink, ArrowRight } from "lucide-react";

export function ReportCard({ report }: { report: Report }) {
  const date = report.createdAt ? new Date(report.createdAt) : new Date();

  return (
    <div className="group relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-foreground truncate">{new URL(report.url).hostname}</h3>
            <a 
              href={report.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyzed {formatDistance(date, new Date(), { addSuffix: true })}
          </p>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">SEO</span>
              <span className={`font-mono font-bold ${report.seoScore > 70 ? 'text-green-600' : 'text-foreground'}`}>
                {report.seoScore}
              </span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Perf</span>
              <span className={`font-mono font-bold ${report.performanceScore > 70 ? 'text-green-600' : 'text-foreground'}`}>
                {report.performanceScore}
              </span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Sec</span>
              <span className={`font-mono font-bold ${report.securityScore > 70 ? 'text-green-600' : 'text-foreground'}`}>
                {report.securityScore}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ScoreGauge score={report.overallScore} size="sm" showLabel={false} />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-sm font-medium text-primary">View Full Report</span>
        <ArrowRight className="w-4 h-4 text-primary transform group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Full card link overlay */}
      <Link href={`/report/${report.id}`} className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
    </div>
  );
}
