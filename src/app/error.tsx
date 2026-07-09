"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-14px border border-border p-8 text-center max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-red-danger/10 border border-red-danger/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-danger" />
        </div>
        <h2 className="font-sora font-bold text-lg text-primary-navy mb-2">
          Something went wrong
        </h2>
        <p className="font-inter text-sm text-slate-secondary mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="h-11 px-6 bg-primary-navy text-white rounded-8px font-inter font-semibold text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
