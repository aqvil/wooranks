import { useState } from "react";
import { CheckResult } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, AlertCircle, Info, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            className="overflow-hidden"
          >
            <div className={cn(
              "m-4 ml-12 lg:mr-12 p-6 rounded-r-lg border-l-4 bg-slate-50",
              check.passed ? "border-green-500" :
                check.score < 50 ? "border-red-500" : "border-yellow-500"
            )}>
              {/* Description */}
              <div className="mb-6">
                {/* Standard Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{check.description}</p>

                {/* Expanded Explanation if available */}
                {check.explanation && (
                  <p className="text-sm text-slate-600 leading-relaxed">{check.explanation}</p>
                )}
              </div>

              {/* Fix Advice */}
              {(check.howToFix || check.recommendation) && (
                <div className="mb-4">
                  <h5 className="text-sm font-bold text-slate-800 mb-2">How to fix</h5>
                  <div className="prose prose-sm max-w-none text-slate-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {check.howToFix || check.recommendation || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {check.learnMoreUrl && (
                <a
                  href={check.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  Read detailed guide <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Technical Details */}
              {check.details && check.details.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Details</h5>
                  <div className="bg-white rounded border border-border text-xs font-mono text-slate-600 divide-y divide-border">
                    {check.details.map((detail, idx) => (
                      <div key={idx} className="px-3 py-2 truncate">
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
