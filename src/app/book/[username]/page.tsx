"use client";

import { useParams } from "next/navigation";
import BookingExperience from "@/components/booking/BookingExperience";

export default function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  return <BookingExperience username={username} />;
}
