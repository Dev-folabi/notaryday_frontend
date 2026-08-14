"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { queryKeys } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X, User, DollarSign } from "lucide-react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

type PaymentInfo = {
  zelle: string;
  venmo: string;
  paypal: string;
  bank_name: string;
  account_last4: string;
  routing_last4: string;
  other: string;
};

export default function ProfileTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const username = user?.username ?? "";
  const email = user?.email ?? "";
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [state, setState] = useState(
    (user?.settings as { state?: string } | null)?.state ?? "California",
  );
  const [bio, setBio] = useState(user?.bio ?? "");
  const [payment, setPayment] = useState<PaymentInfo>(() => {
    const raw = user?.settings?.payment_info;
    return {
      zelle: "",
      venmo: "",
      paypal: "",
      bank_name: "",
      account_last4: "",
      routing_last4: "",
      other: "",
      ...(typeof raw === "object" &&
      raw !== null &&
      !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {}),
    };
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const setPay = <K extends keyof PaymentInfo>(k: K, v: string) =>
    setPayment((p) => ({ ...p, [k]: v }));

  const saveProfile = async () => {
    try {
      await usersApi.updateProfile({ fullName, phone, bio, state });
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      addToast({ type: "success", title: "Profile saved" });
    } catch {
      addToast({ type: "error", title: "Could not save profile" });
    }
  };

  const savePayment = async () => {
    try {
      await usersApi.updateSettings({ paymentInfo: payment });
      addToast({ type: "success", title: "Payment details saved" });
    } catch {
      addToast({ type: "error", title: "Could not save payment details" });
    }
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteBusy(true);
    try {
      await usersApi.deleteAccount();
      addToast({ type: "success", title: "Account deletion scheduled" });
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
      router.push("/login");
    } catch {
      addToast({ type: "error", title: "Could not delete account" });
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <div className="card p-4 mb-4">
        <div className="font-inter text-[12px] font-semibold text-navy mb-3 flex gap-1.5 items-center"><User className="w-4 h-4" /> Profile</div>
        <div className="g2">
          <div className="field"><label className="lbl">Full name</label><input className="inp" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="field"><label className="lbl">Username</label><input className="inp" value={username} readOnly style={{ background: "#F8FAFC", cursor: "not-allowed" }} /><span className="hint">Username cannot be changed.</span></div>
        </div>
        <div className="field"><label className="lbl">Email address</label><input className="inp" value={email} readOnly style={{ background: "#F8FAFC", cursor: "not-allowed" }} /><span className="hint">Email cannot be changed.</span></div>
        <div className="g2">
          <div className="field"><label className="lbl">Phone number</label><input className="inp" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="field"><label className="lbl">US state</label>
            <select className="sel" value={state} onChange={(e) => setState(e.target.value)}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label className="lbl">Short bio</label><textarea className="ta" value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        <div className="flex justify-end mt-2"><button onClick={saveProfile} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save profile</button></div>
      </div>

      <div className="card p-4 mb-4">
        <div className="font-inter text-[12px] font-semibold text-navy mb-1.5 flex gap-1.5 items-center"><DollarSign className="w-4 h-4" /> Payment details</div>
        <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">Shown on invoice PDFs so clients can pay you directly. Notary Day is never involved in the transaction.</p>
        <div className="g2">
          <div className="field"><label className="lbl">Zelle</label><input className="inp" placeholder="email or phone" value={payment.zelle} onChange={(e) => setPay("zelle", e.target.value)} /></div>
          <div className="field"><label className="lbl">Venmo</label><input className="inp" placeholder="@username" value={payment.venmo} onChange={(e) => setPay("venmo", e.target.value)} /></div>
        </div>
        <div className="g2">
          <div className="field"><label className="lbl">PayPal</label><input className="inp" placeholder="email or PayPal.me link" value={payment.paypal} onChange={(e) => setPay("paypal", e.target.value)} /></div>
          <div className="field"><label className="lbl">Bank name</label><input className="inp" placeholder="e.g. Chase" value={payment.bank_name} onChange={(e) => setPay("bank_name", e.target.value)} /></div>
        </div>
        <div className="g2">
          <div className="field"><label className="lbl">Account (last 4)</label><input className="inp" maxLength={4} placeholder="1234" value={payment.account_last4} onChange={(e) => setPay("account_last4", e.target.value)} /></div>
          <div className="field"><label className="lbl">Routing (last 4)</label><input className="inp" maxLength={4} placeholder="5678" value={payment.routing_last4} onChange={(e) => setPay("routing_last4", e.target.value)} /></div>
        </div>
        <div className="field"><label className="lbl">Other payment info</label><input className="inp" placeholder="e.g. Cash, Check payable to…" value={payment.other} onChange={(e) => setPay("other", e.target.value)} /></div>
        <div className="flex justify-end mt-2"><button onClick={savePayment} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save payment details</button></div>
      </div>

      <div className="card p-4 mb-4 border" style={{ borderColor: "var(--red-b)" }}>
        <div className="font-inter text-[12px] font-semibold text-red mb-2.5 flex gap-1.5 items-center"><Trash2 className="w-4 h-4" /> Danger zone</div>
        <div className="flex justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="font-inter text-[12px] font-semibold text-navy">Delete account</div>
            <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">Permanently delete your account and all associated data within 30 days. Your Pro subscription is cancelled immediately. This cannot be undone.</div>
          </div>
          <div className="flex-shrink-0"><button className="btn-danger-gh" onClick={() => setShowDeleteModal(true)}><Trash2 className="w-3.5 h-3.5" /> Delete account</button></div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(9,18,30,.45)" }}>
          <div className="bg-white rounded-[16px] w-full max-w-[440px] overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2 text-red"><Trash2 className="w-5 h-5" /><span className="font-sora font-bold text-[16px]">Delete your account</span></div>
              <div className="alert al-red mb-4">
                <span className="text-red flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></span>
                <div className="font-inter text-[11px] leading-[1.4]">This permanently deletes your account. Your Pro subscription is cancelled immediately with no refund. All data is permanently deleted within 30 days. This cannot be undone.</div>
              </div>
              <div className="field">
                <label className="lbl">Type DELETE to confirm</label>
                <input className="inp" placeholder="DELETE" style={{ fontFamily: "monospace", letterSpacing: 2, fontSize: 15, color: "var(--red)" }} value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
                <span className="hint">All data will be permanently deleted within 30 days.</span>
              </div>
              <div className="flex flex-col gap-2.5 mt-1">
                <button onClick={confirmDeleteAccount} disabled={deleteConfirm !== "DELETE" || deleteBusy} className="btn-danger" style={{ width: "100%" }}><Trash2 className="w-3.5 h-3.5" /> {deleteBusy ? "Deleting…" : "Delete my account permanently"}</button>
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }} className="btn-gh" style={{ width: "100%" }}><X className="w-3.5 h-3.5" /> Cancel — keep my account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}