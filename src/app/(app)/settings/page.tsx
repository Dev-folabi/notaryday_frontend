"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { billingApi } from "@/api/billing.api";
import { cn } from "@/lib/utils";
import { User, Bell, CreditCard, Check, Lock, Mail, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";

const SERVICES = ["General", "Loan Refi", "Hybrid", "Purchase Closing", "Field Inspection", "Apostille"];
const NOTIFS = [
  ["Pre-signing reminder", "30 minutes before each signing.", "Push + SMS", true, false],
  ["Scanback reminder", "Fires when you mark a Loan Refi or Hybrid complete.", "Push", true, false],
  ["New booking received", "A client submitted a request through your booking page.", "Push", true, false],
  ["Job imported", "An email was forwarded and parsed successfully.", "Push", true, false],
  ["Payment received", "A client has paid an invoice via Stripe.", "Push", true, false],
  ["Plan expiring", "3 days before your annual plan renews.", "Email", true, true],
  ["Payment failed", "A Stripe renewal payment was declined.", "Email + Push", true, true],
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [tab, setTab] = useState<"profile" | "notifications" | "billing">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [notifPrefs, setNotifPrefs] = useState<boolean[]>(NOTIFS.map(() => true));

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.full_name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        state: "California",
        bio: user.bio ?? "",
        homeBase: user.settings?.home_base_address ?? "",
        scanback: (user.settings as any)?.scanback_duration_mins ?? 30,
        types: user.signing_defaults?.map((s) => s.signing_type) ?? SERVICES,
        navPref: user.settings?.preferred_nav_app ?? "GOOGLE_MAPS",
      });
    }
  }, [user]);

  useEffect(() => {
    billingApi.getStatus().catch(() => {});
  }, []);

  const saveProfile = async () => {
    try {
      await usersApi.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        bio: profile.bio,
      });
      addToast({ type: "success", title: "Profile saved" });
    } catch {
      addToast({ type: "error", title: "Could not save profile" });
    }
  };

  const sel = (k: keyof typeof profile, v: any) => setProfile((p: any) => ({ ...p, [k]: v }));
  const toggleType = (t: string) =>
    setProfile((p: any) => ({
      ...p,
      types: p.types.includes(t) ? p.types.filter((x: string) => x !== t) : [...p.types, t],
    }));

  if (!profile) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Account settings</div>
      </div>

      <div className="tabs">
        {([
          ["profile", "Profile", User],
          ["notifications", "Notifications", Bell],
          ["billing", "Billing", CreditCard],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            className={cn("tab", tab === key && "on")}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="con">
        {tab === "profile" && (
          <>
            <div className="card p-4 mb-4">
              <div className="font-inter text-[12px] font-semibold text-navy mb-3 flex gap-1.5 items-center"><User className="w-4 h-4" /> Profile</div>
              <div className="g2">
                <div className="field"><label className="lbl">Full name</label><input className="inp" value={profile.fullName} onChange={(e) => sel("fullName", e.target.value)} /></div>
                <div className="field"><label className="lbl">Username</label><input className="inp" value={profile.username} readOnly style={{ background: "#F8FAFC", cursor: "not-allowed" }} /><span className="hint">Username cannot be changed.</span></div>
              </div>
              <div className="field"><label className="lbl">Email address</label><input className="inp" value={profile.email} readOnly style={{ background: "#F8FAFC", cursor: "not-allowed" }} /><span className="hint">Email cannot be changed.</span></div>
              <div className="g2">
                <div className="field"><label className="lbl">Phone number</label><input className="inp" value={profile.phone} onChange={(e) => sel("phone", e.target.value)} /></div>
                <div className="field"><label className="lbl">US state</label>
                  <select className="sel" value={profile.state} onChange={(e) => sel("state", e.target.value)}>
                    <option>California</option><option>Texas</option><option>Florida</option>
                  </select>
                </div>
              </div>
              <div className="field"><label className="lbl">Short bio</label><textarea className="ta" value={profile.bio} onChange={(e) => sel("bio", e.target.value)} /></div>
              <div className="flex justify-end mt-2"><button onClick={saveProfile} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save profile</button></div>
            </div>

            <div className="card p-4 mb-4">
              <div className="font-inter text-[12px] font-semibold text-navy mb-3 flex gap-1.5 items-center"><Mail className="w-4 h-4" /> Operational settings</div>
              <div className="field">
                <label className="lbl">Home base address</label>
                <div className="icw"><span className="ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
                  <input className="inp has-icon" value={profile.homeBase} onChange={(e) => sel("homeBase", e.target.value)} /></div>
                <span className="hint">Used to calculate drive time to your first signing. Never shown to clients.</span>
              </div>
              <div className="dvdr" />
              <div className="field">
                <label className="lbl">Default scanback duration</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input className="inp" style={{ width: 64, textAlign: "center" }} value={profile.scanback} onChange={(e) => sel("scanback", e.target.value)} />
                  <span className="font-inter text-[11px] text-slate-secondary">minutes after each Loan Refi, Hybrid, Purchase Closing</span>
                </div>
                <span className="hint">Overridable per job. Changes recalculate all future scheduled days.</span>
              </div>
              <div className="dvdr" />
              <label className="lbl mb-2">Signing types you accept</label>
              <div className="flex gap-1.5 flex-wrap">
                {SERVICES.map((t) => (
                  <div key={t} className={cn("tpill", profile.types.includes(t) && "on")} onClick={() => toggleType(t)}>{t}</div>
                ))}
              </div>
              <div className="flex justify-end mt-3.5"><button onClick={saveProfile} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save operational</button></div>
            </div>

            <div className="card p-4 mb-4">
              <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Sparkles className="w-4 h-4" /> Navigation app preference</div>
              <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">When you tap Navigate on a job card, which app should open?</p>
              <div className="grid grid-cols-3 gap-2">
                {["Google Maps", "Apple Maps", "Waze"].map((n) => {
                  const val = n.toUpperCase().replace(" ", "_");
                  return (
                    <div
                      key={n}
                      onClick={() => sel("navPref", val)}
                      className="p-2 rounded-[8px] font-inter text-[12px] text-center cursor-pointer border"
                      style={{
                        borderColor: profile.navPref === val ? "var(--navy)" : "var(--border)",
                        background: profile.navPref === val ? "var(--blue-bg)" : "#fff",
                        color: profile.navPref === val ? "var(--navy)" : "var(--slate)",
                        fontWeight: profile.navPref === val ? 600 : 500,
                      }}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-4 mb-4 border" style={{ borderColor: "var(--red-b)" }}>
              <div className="font-inter text-[12px] font-semibold text-red mb-2.5 flex gap-1.5 items-center"><Trash2 className="w-4 h-4" /> Danger zone</div>
              <div className="flex justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-inter text-[12px] font-semibold text-navy">Delete account</div>
                  <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">Permanently delete your account and all associated data within 30 days. Your Pro subscription is cancelled immediately. This cannot be undone.</div>
                </div>
                <div className="flex-shrink-0"><button className="btn-danger-gh"><Trash2 className="w-3.5 h-3.5" /> Delete account</button></div>
              </div>
            </div>
          </>
        )}

        {tab === "notifications" && (
          <>
            <div className="alert al-blue mb-3.5">
              <span className="text-blue flex-shrink-0 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span>
              <div className="font-inter text-[11px] leading-[1.4]">Payment failure and plan expiry notifications are always sent, they cannot be disabled. All others are optional.</div>
            </div>
            <div className="card p-4 mb-4">
              <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Bell className="w-4 h-4" /> Your notifications</div>
              {NOTIFS.map(([title, desc, ch, , lock], i) => (
                <div key={title as string} className="flex justify-between gap-3 py-2.5 border-b border-border">
                  <div className="flex-1 min-w-[180px]">
                    <div className="font-inter text-[12px] font-semibold text-navy">{title as string}{lock ? <span className="font-inter text-[9px] text-muted font-normal ml-1">Always on</span> : null}</div>
                    <div className="font-inter text-[11px] text-slate-secondary leading-[1.3] mt-0.5">{desc as string}</div>
                    <div className="mt-1"><span className="font-inter text-[9px] font-semibold text-muted bg-background border border-border rounded-[4px] px-1.5 py-0.5">{ch as string}</span></div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => { if (!lock) { const next = [...notifPrefs]; next[i] = !next[i]; setNotifPrefs(next); } }}
                      className="w-[38px] h-5 rounded-full relative"
                      style={{ background: notifPrefs[i] ? "var(--navy)" : "var(--border)", opacity: lock ? 0.5 : 1 }}
                    >
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5" style={{ left: notifPrefs[i] ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-3"><button onClick={() => addToast({ type: "success", title: "Notification preferences saved" })} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save preferences</button></div>
            </div>
          </>
        )}

        {tab === "billing" && (
          <>
            <div className="card p-4 mb-4 border" style={{ borderColor: "var(--navy)", background: "linear-gradient(135deg,#EFF6FF 0%,#fff 100%)" }}>
              <div className="flex justify-between gap-2.5 mb-2.5 flex-wrap">
                <div>
                  <div className="flex gap-1.5 mb-1 flex-wrap">
                    <span className={cn("chip", isPro ? "c-pro" : "c-free")}>{isPro ? "pro" : "free"}</span>
                    <span className="font-inter text-[11px] text-teal-success font-semibold flex gap-1 items-center"><Check className="w-3 h-3" /> Active</span>
                  </div>
                  <div className="font-sora text-[18px] font-bold text-navy">
                    ${isPro ? "19" : "0"} <span className="font-inter text-[12px] font-normal text-slate-secondary">{isPro ? "/month" : "/forever"}</span>
                  </div>
                  <div className="font-inter text-[11px] text-slate-secondary mt-0.5">
                    Next renewal: <strong className="text-navy">April 18, 2026</strong>
                  </div>
                </div>
                <button className="btn-sm flex-shrink-0" onClick={() => addToast({ type: "info", title: "Switching to annual" })}>
                  Switch to Annual, save $99
                </button>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between py-2.5 border-b border-border gap-2"><span className="font-inter text-[11px] text-slate-secondary">Plan</span><span className="font-inter text-[11px] font-semibold text-navy">{isPro ? "Pro Monthly" : "Free"}</span></div>
              <div className="flex justify-between py-2.5 border-b border-border gap-2"><span className="font-inter text-[11px] text-slate-secondary">Billing cycle</span><span className="font-inter text-[11px] font-semibold text-navy">{isPro ? "Monthly, renews Apr 18" : "—"}</span></div>
              <div className="flex justify-between py-2.5 border-b border-border gap-2"><span className="font-inter text-[11px] text-slate-secondary">Payment method</span><span className="font-inter text-[11px] font-semibold text-navy flex items-center gap-1"><Lock className="w-3 h-3" /> Visa ending 4242</span></div>
            </div>

            <div className="card p-4 mb-4">
              <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Lock className="w-4 h-4" /> Manage billing</div>
              <div className="flex justify-between gap-2.5 py-2.5 border-b border-border flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <div className="font-inter text-[12px] font-semibold text-navy">Update payment method</div>
                  <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Change or update the card on file via Stripe portal.</div>
                </div>
                <button className="btn-sm" onClick={() => addToast({ type: "info", title: "Opening Stripe portal" })}>Update card</button>
              </div>
              <div className="flex justify-between gap-2.5 py-2.5 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <div className="font-inter text-[12px] font-semibold text-navy">View invoice history</div>
                  <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Download receipts for all past payments.</div>
                </div>
                <button className="btn-sm" onClick={() => addToast({ type: "info", title: "Opening invoices" })}>View invoices</button>
              </div>
            </div>

            {!isPro && (
              <div className="card p-4 mb-4">
                <div className="font-inter text-[12px] font-semibold text-navy mb-2">Upgrade to Pro</div>
                <p className="font-inter text-[12px] text-slate-secondary mb-3">Unlock route optimisation, booking page, email import, auto invoicing and more.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => { window.location.href = "/billing?plan=pro_monthly"; }} className="btn-pro flex-1"><Sparkles className="w-4 h-4" /> Upgrade to Pro</button>
                  <Link href="/settings/billing" className="btn-s flex-1">Compare plans</Link>
                </div>
              </div>
            )}

            {isPro && (
              <div className="card p-4 mb-4">
                <div className="flex justify-between gap-2.5 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <div className="font-inter text-[12px] font-semibold text-navy">Cancel Pro plan</div>
                    <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">Your Pro access continues until April 18. After that, account moves to Free. All data stays.</div>
                  </div>
                  <button className="btn-danger-gh"><X className="w-3.5 h-3.5" /> Cancel plan</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
