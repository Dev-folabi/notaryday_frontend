"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function OfflinePage() {
  useEffect(() => {
    const onOnline = () => window.location.reload();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <section className="max-w-md text-center">
        <Image
          src="/icons/notaryday-icon-badge.svg"
          alt="Notary Day"
          width={64}
          height={64}
          className="mx-auto mb-5"
        />
        <h1 className="font-sora text-2xl font-bold text-navy">
          You&apos;re offline
        </h1>
        <p className="mt-2 font-inter text-sm leading-6 text-slate-secondary">
          Notary Day will reconnect automatically when your internet connection
          returns.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-p mt-6"
          style={{ width: "auto", padding: "0 20px" }}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
