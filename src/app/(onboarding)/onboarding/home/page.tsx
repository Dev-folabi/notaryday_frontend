"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MapPin, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingHomePage() {
  const router = useRouter();
  const { saveHomeBase } = useOnboarding();
  const { setOnboardingStep } = useUIStore();

  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ display: string; place_id: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<{ address?: string }>({});
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set initial step on mount
  useState(() => {
    setOnboardingStep(1);
  });

  // Nominatim address search
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setSuggestions(
        data.map((item: { display_name: string; place_id: string }) => ({
          display: item.display_name,
          place_id: item.place_id,
        }))
      );
      setShowSuggestions(true);
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setLat(null);
    setLng(null);
    setErrors((e) => ({ ...e, address: undefined }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchAddress(value), 350);
  };

  const selectSuggestion = async (suggestion: { display: string; place_id: string }) => {
    setAddress(suggestion.display);
    setShowSuggestions(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&place_id=${suggestion.place_id}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
      }
    } catch {
      // proceed without coordinates
    }
  };

  const handleSubmit = async () => {
    if (!address.trim()) {
      setErrors({ address: "Home base address is required" });
      return;
    }

    saveHomeBase.mutate({
      username: username || `user_${Math.floor(Math.random() * 10000)}`, // Fallback if no username field in S-03
      home_base_address: address.trim(),
      home_base_lat: lat ?? 0,
      home_base_lng: lng ?? 0,
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-white lg:bg-bg">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm lg:shadow-none">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-bg flex items-center justify-center mb-6 text-interactive-blue shadow-sm shadow-blue-500/5">
          <MapPin className="w-8 h-8" />
        </div>

        <h1 className="font-sora font-extrabold text-[32px] text-primary-navy mb-4 leading-tight tracking-tight">
          Where do you <br className="hidden sm:block" /> start your day?
        </h1>
        <p className="font-inter text-base text-slate-secondary leading-relaxed mb-10">
          The address you drive from each morning. We use this to calculate your first and last drive of the day.
        </p>

        <div className="flex flex-col gap-6">
          {/* Address field */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="font-inter font-bold text-xs text-primary-navy uppercase tracking-widest">
                Home base address
              </label>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-bg border border-teal-b font-inter text-[10px] font-bold text-teal-success uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Private
              </div>
            </div>
            
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-interactive-blue transition-colors">
                <MapPin className="w-5 h-5" />
              </span>
              <input
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Start typing your address…"
                className={cn(
                  "h-14 w-full pl-12 pr-4 text-base border-2 rounded-16px bg-white text-primary-navy font-inter font-medium",
                  "placeholder:text-muted/60 placeholder:font-normal",
                  "focus:border-interactive-blue focus:ring-4 focus:ring-blue-100 focus:outline-none",
                  "transition-all duration-200",
                  errors.address ? "border-red-danger bg-red-50/10" : "border-border hover:border-slate-300"
                )}
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted animate-spin" />
              )}
            </div>
            {errors.address && (
              <span className="font-inter text-sm text-red-danger font-medium mt-2 block">{errors.address}</span>
            )}

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-border rounded-16px shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((s, i) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className={cn(
                      "w-full text-left px-5 py-4 text-base text-slate hover:bg-bg transition-colors",
                      "border-b border-border last:border-b-0 group"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted group-hover:text-interactive-blue transition-colors" />
                      <div>
                        <strong className="text-primary-navy font-bold">
                          {s.display.split(",")[0]}
                        </strong>
                        {s.display.includes(",") && (
                          <span className="text-muted text-sm ml-1 font-medium">
                            {s.display.slice(s.display.indexOf(","))}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p className="font-inter text-[11px] text-muted font-medium mt-3 leading-relaxed">
              This address is never shared with clients or listed on your booking page.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={saveHomeBase.isPending}
            disabled={!address || saveHomeBase.isPending}
            className={cn(
              "w-full h-14 text-base font-extrabold rounded-16px transition-all shadow-lg",
              !address 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-interactive-blue text-white hover:bg-blue-hover shadow-blue-500/25 active:scale-[0.98]"
            )}
          >
            Set home base
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="font-inter text-xs text-muted text-center mt-2 font-medium">
            You can change this any time in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
