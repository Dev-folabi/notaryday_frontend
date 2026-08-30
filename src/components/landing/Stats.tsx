import { stats } from "@/config/marketing";

export function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-navy p-6 md:px-12 md:py-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center justify-center p-4 text-center md:border-r md:border-white/10 last:border-0 ${
            index < 2
              ? "border-b border-white/10 md:border-b-0"
              : index % 2 === 0
                ? "border-r border-white/10 md:border-r"
                : ""
          }`}
        >
          <span className="font-sora text-[32px] font-bold tracking-[-0.5px] text-white">
            {stat.value}
          </span>
          <span className="mt-1 text-xs text-white/50">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
