"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProGate from "@/components/ui/ProGate";
import { ArrowLeft } from "lucide-react";

export default function PublicBookingPreviewPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full bg-bg">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-border flex-shrink-0 gap-3 flex-wrap">
          <div className="font-sora text-[16px] font-bold text-primary-navy flex items-center gap-2">
            Public page preview
          </div>
          <button
            onClick={() => router.push("/bookings")}
            className="ph-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to bookings
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {user?.username ? (
            <iframe
              title="Public booking page preview"
              src={`/book/${user.username}`}
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </ProGate>
  );
}