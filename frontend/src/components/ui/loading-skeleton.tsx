"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function LoadingSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}
      role="status"
      aria-label="Loading card"
    >
      <Skeleton className="mb-4 h-48 w-full rounded-lg" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <span className="sr-only">Loading card...</span>
    </div>
  );
}

export function TableSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading table">
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
      <span className="sr-only">Loading table...</span>
    </div>
  );
}

export function PageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-8", className)} role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <span className="sr-only">Loading page...</span>
    </div>
  );
}

export function FormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-label="Loading form">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
      <span className="sr-only">Loading form...</span>
    </div>
  );
}
