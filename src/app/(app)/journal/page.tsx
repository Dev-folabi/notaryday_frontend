import { Search, Filter, Download, Plus, MapPin, Users, Calendar, Banknote, Briefcase, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const MOCK_ENTRIES = [
  {
    id: "J-001",
    date: "Dec 12, 2026",
    time: "9:30 AM",
    type: "Loan Refi",
    signers: ["Sarah Johnson", "Mark Johnson"],
    address: "3847 Wilshire Blvd, Los Angeles, CA",
    fee: "$150.00",
    net: "$132.50",
    status: "Signed",
  },
  {
    id: "J-002",
    date: "Dec 12, 2026",
    time: "1:45 PM",
    type: "Hybrid",
    signers: ["David Chen"],
    address: "942 N Broadway, Los Angeles, CA",
    fee: "$125.00",
    net: "$114.20",
    status: "Signed",
  },
  {
    id: "J-003",
    date: "Dec 11, 2026",
    time: "11:00 AM",
    type: "GNW",
    signers: ["Elena Rodriguez"],
    address: "1200 S Figueroa St, Los Angeles, CA",
    fee: "$45.00",
    net: "$38.50",
    status: "Signed",
  },
];

export default function JournalPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <header className="bg-white border-b border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-sora font-extrabold text-3xl text-primary-navy tracking-tight mb-2">
              Notarial Journal
            </h1>
            <p className="font-inter text-sm text-slate-secondary font-medium uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-success" />
              Legally compliant records
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-6 border-2 font-bold text-primary-navy bg-white hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button className="h-11 px-6 bg-interactive-blue hover:bg-blue-hover text-white font-extrabold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="px-6 py-6 border-b border-border bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-12 gap-y-4">
          <div className="flex flex-col">
            <span className="font-sora font-extrabold text-xl text-primary-navy leading-none mb-1">1,248</span>
            <span className="font-inter text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Total Entries</span>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="font-sora font-extrabold text-xl text-primary-navy leading-none mb-1">2,410</span>
            <span className="font-inter text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Signers</span>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="font-sora font-extrabold text-xl text-primary-navy leading-none mb-1">3,892</span>
            <span className="font-inter text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Signatures</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <input 
                placeholder="Search by signer, address, or type…"
                className="h-12 w-full pl-12 pr-4 bg-white border-2 border-border rounded-16px font-inter text-sm text-primary-navy placeholder:text-muted/60 focus:border-interactive-blue focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="h-12 bg-white border-2 border-border rounded-16px px-4 flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                <Calendar className="w-4 h-4 text-primary-navy" />
                <span className="font-inter text-sm font-bold text-primary-navy whitespace-nowrap">All dates</span>
              </div>
              <div className="h-12 bg-white border-2 border-border rounded-16px px-4 flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                <Filter className="w-4 h-4 text-primary-navy" />
                <span className="font-inter text-sm font-bold text-primary-navy whitespace-nowrap">Filter entries</span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {MOCK_ENTRIES.map((entry) => (
              <div 
                key={entry.id}
                className="group bg-white border-2 border-border rounded-[24px] p-6 lg:p-8 hover:border-interactive-blue hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-2">
                  <div className="font-inter text-[10px] font-extrabold text-muted uppercase tracking-widest">
                    Entry {entry.id}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-interactive-blue transition-all group-hover:translate-x-1" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  {/* Left: Time/Type */}
                  <div className="flex items-center gap-5 min-w-[200px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-bg flex flex-col items-center justify-center text-interactive-blue shadow-sm shadow-blue-500/5">
                      <span className="font-sora font-extrabold text-sm uppercase leading-none">{entry.date.split(" ")[0]}</span>
                      <span className="font-sora font-extrabold text-xl leading-none mt-1">{entry.date.split(" ")[1].replace(",", "")}</span>
                    </div>
                    <div>
                      <div className="font-inter text-base font-extrabold text-primary-navy mb-1">{entry.time}</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-inter text-[10px] font-bold text-slate-secondary uppercase tracking-wider">
                        <Briefcase className="w-3 h-3" />
                        {entry.type}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Signer & Address */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-navy" />
                      </div>
                      <div className="font-inter text-base font-bold text-primary-navy">
                        {entry.signers.join(" & ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-navy" />
                      </div>
                      <div className="font-inter text-sm text-slate-secondary font-medium">
                        {entry.address}
                      </div>
                    </div>
                  </div>

                  {/* Right: Earnings */}
                  <div className="lg:text-right flex flex-row lg:flex-col gap-8 lg:gap-2">
                    <div className="flex flex-col lg:items-end">
                      <span className="font-inter text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Fee Received</span>
                      <span className="font-sora font-extrabold text-lg text-primary-navy">{entry.fee}</span>
                    </div>
                    <div className="flex flex-col lg:items-end">
                      <span className="font-inter text-[10px] font-bold text-teal-success uppercase tracking-widest mb-1">Net (IRS Rate)</span>
                      <span className="font-sora font-extrabold text-xl text-teal-success">{entry.net}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="font-inter text-sm text-muted font-medium mb-6">Showing 3 of 1,248 entries</p>
            <Button variant="outline" className="h-12 px-8 border-2 font-bold text-primary-navy rounded-12px hover:bg-white transition-all">
              Load more entries
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
