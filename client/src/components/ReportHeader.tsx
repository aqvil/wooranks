import { Report, AnalysisResult, CheckResult } from "@shared/schema";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CheckCircle2, AlertTriangle, XCircle, Download, ExternalLink, RotateCw, Loader2 } from "lucide-react";
import { useAnalyze } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";

interface ReportHeaderProps {
    report: Report;
}

export function ReportHeader({ report }: ReportHeaderProps) {
    const details = report.details as unknown as AnalysisResult;
    const { mutate: analyze, isPending: isRefreshing } = useAnalyze();

    // Aggregate all checks
    // Aggregate all checks safely (legacy reports might miss sections)
    const getChecks = (section: any) => section?.checks || [];

    const allChecks: CheckResult[] = [
        ...getChecks(details.seo),
        ...getChecks(details.performance),
        ...getChecks(details.mobile),
        ...getChecks(details.security),
        ...getChecks(details.usability),
        ...getChecks(details.social),
        ...getChecks(details.technologies),
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
        <div className="bg-card border border-border p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left: Screenshot Monitor Mockup */}
                <div className="flex-shrink-0 w-full max-w-[280px]">
                    <div className="relative aspect-video bg-secondary border border-border overflow-hidden">
                        {/* Browser Bar */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-muted border-b border-border flex items-center px-1.5 gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                        </div>
                        {/* Screenshot Preview */}
                        <div className="w-full h-full pt-4 flex items-center justify-center overflow-hidden bg-white">
                            <img
                                src={`https://image.thum.io/get/width/600/crop/800/noanimate/${report.url}`}
                                alt="Site Preview"
                                className="w-full h-full object-cover"
                                key={report.url}
                                loading="eager"
                            />
                        </div>
                    </div>
                    {/* Retro Monitor Stand */}
                    <div className="h-2 w-1/3 bg-muted border border-border border-t-0 mx-auto"></div>
                    <div className="h-1 w-1/2 bg-muted border border-border border-t-0 mx-auto"></div>
                </div>

                {/* Middle: Info & Stats */}
                <div className="flex-1 min-w-0 w-full pt-2">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold truncate tracking-tight mb-2">
                            {new URL(report.url).hostname}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            <span>ID: {report.id.toString().padStart(6, '0')}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt!).toLocaleString()}</span>
                            <span>•</span>
                            <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                Visit Site <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        {/* Passed Bar */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono w-24 uppercase">Passed</span>
                            <div className="h-2 flex-1 bg-secondary overflow-hidden">
                                <div className="h-full bg-green-600" style={{ width: `${passedPercent}%` }} />
                            </div>
                            <span className="text-xs font-mono tabular-nums">{Math.round(passedPercent)}%</span>
                        </div>

                        {/* To Improve Bar */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono w-24 uppercase">To Improve</span>
                            <div className="h-2 flex-1 bg-secondary overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${warningPercent}%` }} />
                            </div>
                            <span className="text-xs font-mono tabular-nums">{Math.round(warningPercent)}%</span>
                        </div>

                        {/* Errors Bar */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono w-24 uppercase">Errors</span>
                            <div className="h-2 flex-1 bg-secondary overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${errorPercent}%` }} />
                            </div>
                            <span className="text-xs font-mono tabular-nums">{Math.round(errorPercent)}%</span>
                        </div>
                    </div>
                </div>

                {/* Right: Score */}
                <div className="flex-shrink-0 flex flex-col items-center gap-4 pt-2">
                    <ScoreGauge score={report.overallScore} size="xl" showLabel={false} />

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-2 print:hidden">
                        <button
                            onClick={() => analyze({ url: report.url })}
                            disabled={isRefreshing}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed w-full"
                        >
                            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                            Refresh
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-border text-sm font-medium hover:bg-secondary transition-colors w-full"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
