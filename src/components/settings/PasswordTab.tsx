"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { Lock, KeyRound } from "lucide-react";

export default function PasswordTab() {
  const { addToast } = useUIStore();

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const updatePassword = async () => {
    if (pwNew.length < 8) {
      addToast({ type: "error", title: "New password must be at least 8 characters" });
      return;
    }
    if (pwNew !== pwConfirm) {
      addToast({ type: "error", title: "New passwords do not match" });
      return;
    }
    setPwBusy(true);
    try {
      await usersApi.changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
      addToast({ type: "success", title: "Password updated" });
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (e) {
      addToast({
        type: "error",
        title: (e as { message?: string })?.message ?? "Could not update password",
      });
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <div className="font-inter text-[12px] font-semibold text-navy mb-3 flex gap-1.5 items-center"><KeyRound className="w-4 h-4" /> Password</div>
      <div className="field"><label className="lbl">Current password</label><input className="inp" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} placeholder="Current password" /></div>
      <div className="g2">
        <div className="field"><label className="lbl">New password</label><input className="inp" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="New password" /></div>
        <div className="field"><label className="lbl">Confirm new password</label><input className="inp" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="Confirm new password" /></div>
      </div>
      <div className="flex justify-end mt-2"><button onClick={updatePassword} disabled={pwBusy} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Lock className="w-4 h-4" /> Update password</button></div>
    </div>
  );
}