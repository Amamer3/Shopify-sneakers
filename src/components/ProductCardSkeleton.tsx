import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="group relative rounded-lg border p-3 space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
      <div className="space-y-1 text-sm">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
