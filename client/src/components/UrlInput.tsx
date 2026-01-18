import { useState } from "react";
import { useAnalyze } from "@/hooks/use-reports";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const { mutate: analyze, isPending } = useAnalyze();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Simple frontend fix for URL if user forgets protocol
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    
    analyze({ url: finalUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
        <Search className={`w-6 h-6 transition-colors duration-200 ${isPending ? 'text-primary' : 'text-muted-foreground group-focus-within:text-primary'}`} />
      </div>
      
      <input
        type="text"
        placeholder="Enter website URL (e.g. example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isPending}
        className="w-full pl-16 pr-32 py-5 text-lg rounded-2xl border-2 border-border shadow-lg shadow-primary/5 bg-background
                   focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300
                   placeholder:text-muted-foreground/60 disabled:opacity-70 disabled:cursor-not-allowed"
      />
      
      <div className="absolute inset-y-2 right-2 flex items-center">
        <button
          type="submit"
          disabled={isPending || !url}
          className="h-full px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md 
                     hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0
                     disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all duration-200
                     flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
      
      {/* Decorative glow effect behind input */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10" />
    </form>
  );
}
