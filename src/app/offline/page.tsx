import Image from "next/image";

export default function OfflinePage() {
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
      </section>
    </main>
  );
}
