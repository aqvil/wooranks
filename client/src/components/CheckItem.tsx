import { useState } from "react";
import { CheckResult } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CheckItemProps {
  check: CheckResult;
}

export function CheckItem({ check }: CheckItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    if (check.passed) return <CheckCircle2 className="w-6 h-6 text-score-good flex-shrink-0" />;
    if (check.score < 50) return <XCircle className="w-6 h-6 text-score-poor flex-shrink-0" />;
    return <AlertTriangle className="w-6 h-6 text-score-average flex-shrink-0" />;
  };

  const getStatusBorder = () => {
    if (check.passed) return "border-l-score-good";
    if (check.score < 50) return "border-l-score-poor";
    return "border-l-score-average";
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md",
        "border-l-4",
        getStatusBorder()
      )}
    >
      <div
        className="p-5 flex items-start gap-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="mt-1">{getStatusIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-semibold text-foreground leading-tight">{check.title}</h4>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold",
                check.passed ? "bg-green-100 text-green-700" :
                  check.score < 50 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              )}>
                {check.passed ? "PASSED" : check.score < 50 ? "CRITICAL" : "WARNING"}
              </span>
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm line-clamp-1">{check.description}</p>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 ml-10 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <span className={cn("w-2 h-2 rounded-full",
                    check.impact === "high" ? "bg-red-500" :
                      check.impact === "medium" ? "bg-yellow-500" : "bg-blue-500"
                  )} />
                  {check.impact} Impact
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <span className={cn("w-2 h-2 rounded-full",
                    check.difficulty === "hard" ? "bg-red-500" :
                      check.difficulty === "medium" ? "bg-yellow-500" : "bg-green-500"
                  )} />
                  {check.difficulty} Fix
                </div>
              </div>

              {check.explanation && (
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <h5 className="font-semibold text-foreground mb-1">Concept</h5>
                  {check.explanation}
                </div>
              )}

              {(check.howToFix || check.recommendation) && (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <AlertCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-foreground mb-1">How to fix</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {check.howToFix || check.recommendation}
                      </p>
                      {check.learnMoreUrl && (
                        <a
                          href={check.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs font-bold text-primary hover:underline"
                        >
                          Read more guide →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {check.details && check.details.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-border/50">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Technical Details</h5>
                  <ul className="space-y-1">
                    {check.details.map((detail, idx) => (
                      <li key={idx} className="text-sm font-mono text-slate-700 flex items-start gap-2">
                        <span className="select-none text-slate-400">•</span>
                        <span className="break-all">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
