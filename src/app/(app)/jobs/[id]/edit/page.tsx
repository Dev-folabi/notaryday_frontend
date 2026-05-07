"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJob, useUpdateJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import JobForm from "@/components/jobs/JobForm";
import { ChevronLeft } from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: job, isLoading } = useJob(id);
  const updateJob = useUpdateJob();
  const { addToast } = useUIStore();

  const handleSubmit = async (values: any) => {
    try {
      await updateJob.mutateAsync({
        id,
        data: {
          ...values,
          appointment_time: new Date(values.appointment_time).toISOString(),
        },
      });
      addToast({ type: "success", title: "Job updated successfully" });
      router.push(`/jobs/${id}`);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Failed to update job",
        message: err?.message ?? "Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-secondary">Job not found</div>
    );
  }

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
        <h1 className="font-sora font-bold text-lg text-primary-navy">Edit job</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-lg mx-auto bg-white border border-border rounded-[14px] p-5 shadow-sm">
          <JobForm
            initialValues={job as any}
            onSubmit={handleSubmit}
            isSubmitting={updateJob.isPending}
          />
        </div>
      </div>
    </div>
  );
}
