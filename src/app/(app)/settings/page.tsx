"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { calendarApi } from "@/api/booking.api";
import { Calendar, Link2, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function SettingsPage() {
  const { addToast } = useUIStore();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<any>(null);
  const [feedToken, setFeedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/users/settings").then((res: any) => {
      const s = (res as any).data?.data ?? (res as any).data ?? res;
      setSettings(s);
    });
    calendarApi
      .getFeedToken()
      .then((res: any) => {
        const p = (res as any).data ?? res;
        setFeedToken((p.data ?? p)?.token);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("calendar") === "connected") {
      addToast({ type: "success", title: "Google Calendar connected!" });
    }
  }, [searchParams, addToast]);

  const icsUrl = feedToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/cal/${feedToken}/feed.ics`
    : null;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="font-sora font-bold text-xl text-primary-navy mb-6">
        Settings
      </h1>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <Link
          href="/settings/booking"
          className="bg-white border border-border rounded-12px p-4 hover:border-slate-secondary transition-colors"
        >
          <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
            Booking Page
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Configure your public booking page
          </div>
        </Link>
        <Link
          href="/settings/billing"
          className="bg-white border border-border rounded-12px p-4 hover:border-slate-secondary transition-colors"
        >
          <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
            Plan & Billing
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Manage subscription
          </div>
        </Link>
        <Link
          href="/settings/notifications"
          className="bg-white border border-border rounded-12px p-4 hover:border-slate-secondary transition-colors"
        >
          <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
            Notifications
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Email and push preferences
          </div>
        </Link>
        <Link
          href="/settings/email-templates"
          className="bg-white border border-border rounded-12px p-4 hover:border-slate-secondary transition-colors"
        >
          <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
            Email Templates
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Customize client emails
          </div>
        </Link>
      </div>

      {/* Google Calendar */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-interactive-blue" />
          <div>
            <div className="font-inter text-sm font-semibold text-primary-navy">
              Google Calendar
            </div>
            <div className="font-inter text-xs text-slate-secondary">
              {settings?.google_calendar_connected
                ? "Connected"
                : "Sync jobs to your calendar"}
            </div>
          </div>
        </div>
        {settings?.google_calendar_connected ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-bg text-teal-success rounded text-xs font-semibold">
              <Check className="w-3 h-3" /> Connected
            </span>
          </div>
        ) : (
          <a
            href={`${apiBase}/calendar/auth/google`}
            className="inline-flex items-center gap-2 h-9 px-4 bg-primary-navy text-white rounded-8px font-inter text-xs font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Connect Google Calendar
          </a>
        )}
      </div>

      {/* ICS Feed */}
      {icsUrl && (
        <div className="bg-white border border-border rounded-12px p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="w-5 h-5 text-violet" />
            <div>
              <div className="font-inter text-sm font-semibold text-primary-navy">
                ICS Calendar Feed
              </div>
              <div className="font-inter text-xs text-slate-secondary">
                Subscribe from any calendar app (Apple, Outlook)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-bg border border-border rounded-8px px-3 py-2 font-mono text-[11px] text-slate-secondary truncate">
              {icsUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(icsUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="h-9 px-3 border border-border rounded-8px text-xs font-medium flex items-center gap-1"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-teal-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
