import { formatCurrency } from "@/lib/utils";

interface ProfitabilityRowProps {
  fee: number;
  mileageCost?: number;
  mileageDetail?: string;
  netEarnings?: number;
  netDetail?: string;
  variant: "detail" | "review" | "placeholder";
}

export default function ProfitabilityRow({
  fee,
  mileageCost,
  mileageDetail,
  netEarnings,
  netDetail,
  variant,
}: ProfitabilityRowProps) {
  if (variant === "detail") {
    return (
      <div className="em" style={{ marginBottom: 16 }}>
        <div className="em-c">
          <span className="em-l">Offered fee</span>
          <span className="em-v" style={{ color: "#475569" }}>{formatCurrency(fee)}</span>
        </div>
        <div className="em-c" style={{ borderLeft: "1px solid #E2E8F0" }}>
          <span className="em-l">Mileage cost</span>
          <span className="em-v" style={{ color: "#D97706" }}>-{formatCurrency(mileageCost ?? 0)}</span>
          <span style={{ fontSize: 9, color: "#64748B", display: "block", marginTop: 2 }}>{mileageDetail}</span>
        </div>
        <div className="em-c" style={{ borderLeft: "1px solid #E2E8F0" }}>
          <span className="em-l">Net earnings</span>
          <span className="em-v" style={{ color: "#0E7B6C" }}>{formatCurrency(netEarnings ?? 0)}</span>
        </div>
      </div>
    );
  }

  const compact = variant === "placeholder";
  const net = netEarnings ?? 0;
  const netColor = net >= 30 ? "text-teal" : net >= 10 ? "text-amber" : "text-red";
  const cell = compact ? "bg-white p-2 text-center" : "bg-white p-3.5 text-center flex flex-col";
  const label = compact
    ? "text-[9px] font-semibold text-slate-secondary uppercase mb-1"
    : "text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.4px] mb-1.5";

  return (
    <div
      className={compact
        ? "grid grid-cols-3 gap-px border border-border rounded-lg overflow-hidden"
        : "grid grid-cols-3 gap-px border border-border rounded-[10px] overflow-hidden bg-border mb-2"}
      style={compact ? { background: "var(--border)" } : undefined}
    >
      <div className={cell}>
        <span className={label}>Offered fee</span>
        <span className={compact ? "font-sora text-[13px] font-bold text-slate" : "font-sora text-[18px] font-bold text-slate leading-none"}>{formatCurrency(fee)}</span>
        {!compact && <span className="text-[10px] text-slate-secondary mt-1.5">gross</span>}
      </div>
      <div className={`${cell} border-l border-border`}>
        <span className={label}>Mileage cost</span>
        <span className={compact ? "font-sora text-[13px] font-bold text-amber" : "font-sora text-[18px] font-bold text-amber leading-none"}>{compact ? "—" : `-${formatCurrency(mileageCost ?? 0)}`}</span>
        {!compact && <span className="text-[10px] text-slate-secondary mt-1.5">{mileageDetail}</span>}
      </div>
      <div className={`${cell} border-l border-border`}>
        <span className={label}>Net earnings</span>
        <span className={compact ? "font-sora text-[13px] font-bold text-teal" : `font-sora text-[18px] font-bold leading-none ${netColor}`}>{compact ? "—" : formatCurrency(net)}</span>
        {!compact && <span className="text-[10px] text-slate-secondary mt-1.5">{netDetail}</span>}
      </div>
    </div>
  );
}
