import { useState } from "react";
import { CheckResult } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, AlertCircle, Info, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CheckItemProps {
  check: CheckResult;
}

export function CheckItem({ check }: CheckItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Small status icon
  const getStatusIcon = () => {
    if (check.passed) return <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />;
    if (check.score < 50) return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
  };

  return (
    <div className="border-b border-border last:border-0 bg-white group">
      <div
        className={cn(
          "flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50",
          isOpen && "bg-slate-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Icon Column */}
        <div className="w-8 flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Title Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold text-slate-700">{check.title}</h4>
            {/* Dotted spacer could go here if we wanted strictly exactly like image, usually flex-grow is enough */}
          </div>
        </div>

        {/* Right Info Column (Badges + Chevron) */}
        <div className="flex items-center gap-4">
          {/* Show summary if closed? Or just badges */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Preview of impact/difficulty for quick scanning */}
            <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-slate-500 bg-slate-100")}>
              {check.impact} Impact
            </span>
          </div>

          {isOpen ?
            <ChevronUp className="w-4 h-4 text-slate-400" /> :
            <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="px-4 pb-6 pt-2 ml-12 lg:mr-12 border-t border-dashed border-border/50">
              {/* Description */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Description
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">{check.description}</p>
                </div>

                {check.explanation && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> Concept
                    </h5>
                    <p className="text-sm text-slate-600 leading-relaxed">{check.explanation}</p>
                  </div>
                )}
              </div>

              {/* Fix Advice */}
              {(check.howToFix || check.recommendation) && (
                <div className="bg-white rounded-lg border border-border p-5 mb-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 mb-1">How to fix</h5>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {check.howToFix || check.recommendation}
                      </p>
                      {check.learnMoreUrl && (
                        <a
                          href={check.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Read detailed guide <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              {check.details && check.details.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Details</h5>
                  <div className="bg-white rounded-lg border border-border divide-y divide-border">
                    {check.details.map((detail, idx) => (
                      <div key={idx} className="px-4 py-2 text-sm font-mono text-slate-600">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
