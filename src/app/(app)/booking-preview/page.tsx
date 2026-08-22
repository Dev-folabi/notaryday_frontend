"use client";

import { useRouter } from "next/navigation";
import BookingExperience from "@/components/booking/BookingExperience";
import { useAuth } from "@/hooks/useAuth";
import { getBookingUrl } from "@/lib/utils";
import { ChevronLeft, Eye, ExternalLink } from "lucide-react";

/**
 * Review-mode preview of the signed-in user's public booking page. Uses the
 * same public endpoints as /book/:username (works on Free too); the submit
 * action is disabled so no booking request can be sent.
 */
export default function BookingPreviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const bookingUrl = getBookingUrl(user?.username);

  if (!user?.username) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-back" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" /> Back
        </div>
        <div className="ph-title">
          <Eye className="w-4 h-4" /> Booking page preview
        </div>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm"
          title={bookingUrl}
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open live page
        </a>
      </div>

      <div className="px-4 pt-3 md:px-6">
        <div className="alert al-blue">
          <Eye className="w-4 h-4" />
          <div className="font-inter text-[11px] leading-[1.5]">
            <strong>Review mode.</strong> This is exactly how clients see your
            public booking page. Booking requests are disabled in preview.
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <BookingExperience username={user.username} preview />
      </div>
    </div>
  );
}
