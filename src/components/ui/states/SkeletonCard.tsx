import React from "react";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export default function SkeletonCard({ count = 1, className = "grid grid-cols-1 md:grid-cols-2 gap-[16px]" }: SkeletonCardProps) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-[12px] border border-border-theme bg-surface"
        >
          <div className="relative h-[132px] bg-border-theme animate-pulse p-4">
            <div className="absolute left-3 top-3 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-surface-secondary animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-surface-secondary animate-pulse" />
            </div>
            <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-surface/80" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-[22px] w-[22px] rounded-[5px] bg-border-theme animate-pulse" />
                <div className="h-3 w-24 rounded bg-border-theme animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-surface-secondary animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-border-theme animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <div className="h-6 w-16 rounded-full bg-border-theme animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-border-theme animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-2">
                <div className="min-h-[58px] rounded-lg border border-border-theme bg-surface-secondary/70 animate-pulse px-2.5 py-2.5">
                  <div className="mb-2 h-2.5 w-12 rounded bg-surface-secondary animate-pulse" />
                  <div className="h-4 w-16 rounded bg-border-theme animate-pulse" />
                </div>
                <div className="min-h-[72px] rounded-xl border border-border-theme bg-surface-secondary animate-pulse px-3.5 py-3">
                  <div className="mb-2 h-2.5 w-12 rounded bg-surface-secondary animate-pulse" />
                  <div className="h-4 w-16 rounded bg-border-theme animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border-theme pt-3">
              <div className="h-3 w-20 rounded bg-border-theme animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-border-theme animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
