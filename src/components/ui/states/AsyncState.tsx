import React, { ReactNode } from "react";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import SkeletonCard from "./SkeletonCard";

interface AsyncStateProps {
  loading: boolean;
  error?: string | null;
  empty: boolean;
  onRetry?: () => void;
  retrying?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export default function AsyncState({
  loading,
  error,
  empty,
  onRetry,
  retrying = false,
  skeletonCount = 6,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: AsyncStateProps) {
  if (loading) return <SkeletonCard count={skeletonCount} />;

  if (error) {
    return (
      <ErrorState
        description={error}
        onRetry={onRetry}
        retrying={retrying}
      />
    );
  }

  if (empty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
