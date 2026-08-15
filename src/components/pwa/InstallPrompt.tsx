"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    window.matchMedia("(display-mode: standalone)").matches || iosStandalone
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed || isStandalone()) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const showAndroid = Boolean(deferredPrompt);
  const showIOS = isIOS && !deferredPrompt;

  if (!showAndroid && !showIOS) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed left-3 right-3 lg:left-auto lg:right-6 lg:w-[360px] bottom-[calc(68px+env(safe-area-inset-bottom))] lg:bottom-6 z-50 bg-white border border-border rounded-[16px] shadow-[0_12px_40px_rgba(9,18,30,0.2)] p-4 flex items-start gap-3">
      <Image
        src="/icons/notaryday-icon-192.png"
        alt="Notary Day"
        width={44}
        height={44}
        className="rounded-[10px] flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-sora text-[13px] font-bold text-primary-navy">
          Install Notary Day
        </div>
        <p className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">
          {showIOS
            ? "Tap Share, then \u201CAdd to Home Screen\u201D for one-tap access on the go."
            : "Get one-tap access from your home screen, even offline."}
        </p>
        {showAndroid ? (
          <button
            onClick={handleInstall}
            className="btn-p mt-2"
            style={{ width: "100%", height: 32, fontSize: 12, padding: "0 12px" }}
          >
            Install app
          </button>
        ) : null}
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
        className="flex-shrink-0 text-slate-secondary hover:text-primary-navy transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
