"use client";

import { useRouter } from "next/navigation";
import { useCreateJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import JobForm from "@/components/jobs/JobForm";
import { ChevronLeft } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const { addToast } = useUIStore();

  const handleSubmit = async (values: any) => {
    try {
      await createJob.mutateAsync({
        ...values,
        appointment_time: new Date(values.appointment_time).toISOString(),
      });
      addToast({ type: "success", title: "Job added successfully" });
      router.push("/today");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Failed to add job",
        message: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 text-slate-secondary hover:text-primary-navy"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sora font-bold text-lg text-primary-navy">Add job</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-lg mx-auto bg-white border border-border rounded-[14px] p-5 shadow-sm">
          <JobForm
            onSubmit={handleSubmit}
            isSubmitting={createJob.isPending}
          />
        </div>
      </div>
    </div>
  );
}
