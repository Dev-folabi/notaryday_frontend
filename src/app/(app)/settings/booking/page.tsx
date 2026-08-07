"use client";

import BookingSetupForm from "@/components/booking/BookingSetupForm";

export default function BookingSettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Booking page</div>
      </div>
      <div className="con">
        <BookingSetupForm />
      </div>
    </div>
  );
}