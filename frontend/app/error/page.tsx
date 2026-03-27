"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[DACS Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
            <AlertTriangle size={28} className="text-danger" />
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-text-primary mb-2 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary font-body leading-relaxed mb-2">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Go to dashboard
          </Button>
          <Button onClick={reset}>
            <RefreshCw size={14} /> Try again
          </Button>
        </div>
      </div>
    </div>
  );
}