import { Report, AnalysisResult, CheckResult } from "@shared/schema";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CheckCircle2, AlertTriangle, XCircle, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportHeaderProps {
    report: Report;
}

export function ReportHeader({ report }: ReportHeaderProps) {
    const details = report.details as unknown as AnalysisResult;

    // Aggregate all checks
    const allChecks: CheckResult[] = [
        ...details.seo.checks,
        ...details.performance.checks,
        ...details.mobile.checks,
        ...details.security.checks,
        ...details.usability.checks,
        ...details.social.checks,
        ...details.technologies.checks,
    ];

    const passedCount = allChecks.filter(c => c.passed).length;
    // Errors: Critical (score < 50) and not passed
    const errorCount = allChecks.filter(c => !c.passed && c.score < 50).length;
    // To Improve: Warning (score >= 50) and not passed
    const warningCount = allChecks.filter(c => !c.passed && c.score >= 50).length;
    const totalCount = allChecks.length;

    const passedPercent = (passedCount / totalCount) * 100;
    const errorPercent = (errorCount / totalCount) * 100;
    const warningPercent = (warningCount / totalCount) * 100;

    return (
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">

                {/* Left: Screenshot Monitor Mockup */}
                <div className="flex-shrink-0 w-full max-w-[280px]">
                    <div className="relative aspect-video bg-slate-900 rounded-t-xl border-8 border-slate-800 border-b-0 overflow-hidden shadow-xl">
                        {/* Screenshot Preview */}
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img
                                src={`https://s0.wordpress.com/mshots/v1/${encodeURIComponent(report.url)}?w=800&h=500`}
                                alt="Site Preview"
                                className="w-full h-full object-cover"
                                key={report.url}
                            />
                        </div>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-b-xl mx-auto w-full relative">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-8 bg-slate-700/50 clip-path-monitor-stand" />
                    </div>
                </div>

                {/* Middle: Info & Stats */}
                <div className="flex-1 min-w-0 w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold truncate text-slate-800 mb-1">
                            {new URL(report.url).hostname}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(report.createdAt!).toLocaleString()}</span>
                            <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                Visit Site <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        {/* Passed Bar */}
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium w-24 text-slate-600">Passed</span>
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${passedPercent}%` }} />
                            </div>
                        </div>

                        {/* To Improve Bar */}
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm font-medium w-24 text-slate-600">To Improve</span>
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${warningPercent}%` }} />
                            </div>
                        </div>

                        {/* Errors Bar */}
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium w-24 text-slate-600">Errors</span>
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${errorPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Score */}
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                    <ScoreGauge score={report.overallScore} size="xl" showLabel={false} />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors">
                            <Download className="w-4 h-4" />
                            PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
