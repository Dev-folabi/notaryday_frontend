"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { calendarApi } from "@/api/calendar.api";
import { queryKeys } from "@/lib/queryClient";
import { unwrap } from "@/lib/utils";
import ProGate, { useProGate } from "@/components/ui/ProGate";
import { CalendarDays, Check, Copy, ExternalLink, Link2, Unlink } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default function CalendarTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const gated = useProGate();

  const isConnected = user?.settings?.google_calendar_connected === true;

  const [copied, setCopied] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const { data: feed } = useQuery({
    queryKey: ["calendar", "feed-token"],
    queryFn: async () => {
      const res = await calendarApi.getFeedToken();
      return unwrap<{ token: string; url: string }>(res);
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!user,
  });

  const feedUrl = feed?.token
    ? `${API_BASE}/calendar/${feed.token}/feed.ics`
    : "";

  const connect = async () => {
    if (gated) return;
    setConnecting(true);
    try {
      const res = await calendarApi.getGoogleAuthUrl();
      const data = unwrap<{ url: string }>(res);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        addToast({ type: "error", title: "Could not start calendar connection" });
      }
    } catch {
      addToast({ type: "error", title: "Could not start calendar connection" });
      setConnecting(false);
    }
  };

  const copyFeedUrl = async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      addToast({ type: "success", title: "Calendar link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ type: "error", title: "Could not copy link" });
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await calendarApi.disconnect();
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      addToast({ type: "success", title: "Google Calendar disconnected" });
    } catch {
      addToast({ type: "error", title: "Could not disconnect calendar" });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <ProGate feature="Calendar sync">
      <div className="flex flex-col gap-4">
        {/* Google Calendar */}
        <div className="card p-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center">
            <CalendarDays className="w-4 h-4" /> Google Calendar
          </div>
          <p className="font-inter text-[11px] text-slate-secondary mb-3 leading-[1.4]">
            When you confirm a job, it is pushed to your Google Calendar as an
            event with the address, fee, duration and scanback block.
          </p>

          {isConnected ? (
            <div className="flex items-center gap-2 mb-3">
              <span
                className="chip"
                style={{
                  background: "var(--teal-bg)",
                  color: "#0E7B6C",
                  border: "1px solid var(--teal-border)",
                }}
              >
                <Check className="w-3 h-3" /> Connected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <span
                className="chip"
                style={{
                  background: "var(--bg)",
                  color: "var(--slate2)",
                  border: "1px solid var(--border)",
                }}
              >
                Not connected
              </span>
            </div>
          )}

          {isConnected ? (
            <button
              className="btn-gh"
              onClick={disconnect}
              disabled={disconnecting || gated}
              style={{ opacity: disconnecting ? 0.7 : 1 }}
            >
              <Unlink className="w-4 h-4" />
              {disconnecting ? "Disconnecting…" : "Disconnect Google Calendar"}
            </button>
          ) : (
            <button
              className="btn-p"
              onClick={connect}
              disabled={gated || connecting}
              style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px", opacity: connecting ? 0.7 : 1 }}
            >
              {connecting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}{" "}
              {connecting ? "Connecting…" : "Connect Google Calendar"}
            </button>
          )}
        </div>

        {/* ICS subscription URL */}
        <div className="card p-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center">
            <ExternalLink className="w-4 h-4" /> Calendar subscription link (.ics)
          </div>
          <p className="font-inter text-[11px] text-slate-secondary mb-3 leading-[1.4]">
            Add this link to Apple Calendar, Google Calendar or Outlook to see
            your jobs as a read-only calendar. Polls every ~15 minutes. Works in
            your car via CarPlay.
          </p>
          {feedUrl ? (
            <button
              className="btn-p"
              onClick={copyFeedUrl}
              disabled={gated}
              style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link copied" : "Copy calendar link"}
            </button>
          ) : (
            <p className="font-inter text-[11px] text-slate-secondary">
              Loading your calendar link…
            </p>
          )}
        </div>
      </div>
    </ProGate>
  );
}
