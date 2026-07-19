"use client";

import { Download } from "lucide-react";
import ExpensesView from "@/components/reports/ExpensesView";
import { useUIStore } from "@/store/uiStore";

export default function ExpensesPage() {
  const { addToast } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Expenses</div>
        <button
          className="btn-sm"
          onClick={() => addToast({ title: "Exporting CSV", type: "info" })}
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      <div className="con">
        <ExpensesView />
      </div>
    </div>
  );
}
