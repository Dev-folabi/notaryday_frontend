export function Testimonials() {
  const testimonials = [
    {
      q: '"After mileage I sometimes made almost nothing on a signing. I had no way to know that before accepting. I needed the number before I committed."',
      name: "Carline S.",
      role: "LSA · Anaheim, CA · 8–10 signings/day",
      init: "CS",
    },
    {
      q: '"I screenshot the address, drop it in Maps, estimate the drive, multiply by 67 cents, do the subtraction in my head. Every single job. There has to be a better way."',
      name: "Sarah G.",
      role: "LSA · Houston, TX · 5–6 signings/day",
      init: "SG",
    },
    {
      q: '"I do 14 signings on a good day. By signing 6 I have no idea if I\'m even making money. I need something that tells me the route and the number at the same time."',
      name: "Anonymous",
      role: "LSA · Los Angeles metro · 12–14 signings/day",
      init: "LA",
    },
  ];

  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          From notaries like you
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          They were using Google Maps and a spreadsheet
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Real notaries, real problems. This is what they told us before we
          built a single line of code.
        </p>
      </div>
      <div className="mt-[36px] grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="rounded-[14px] border border-border bg-slate-50 p-[22px]"
          >
            <div className="mb-4 text-sm italic leading-[1.7] text-slate-600">
              {t.q}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {t.init}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-navy">
                  {t.name}
                </div>
                <div className="text-[11px] text-slate-400">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
