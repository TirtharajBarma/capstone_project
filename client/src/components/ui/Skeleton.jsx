import React from 'react';

export function Skeleton({ className = '', variant = 'default', ...props }) {
  const baseClasses = 'animate-pulse bg-primary/10 rounded';
  
  const variants = {
    default: '',
    circular: 'rounded-full',
    card: 'rounded-xl',
    text: 'rounded h-4',
    chart: 'rounded-lg',
  };
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl p-6 bg-bg-card border border-primary/10">
      <Skeleton variant="text" className="w-1/3 h-4" />
      <Skeleton variant="text" className="w-1/2 h-8" />
      <Skeleton variant="text" className="w-1/4 h-4" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/10 p-6 bg-bg-card">
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>
      <div className="flex items-end gap-3 h-[280px] p-4">
        {[65, 45, 80, 55, 70, 40, 60].map((height, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-primary/10 bg-bg-card">
      <table className="w-full">
        <thead className="bg-bg-card-subtle">
          <tr>
            {['Image', 'Breed', 'Confidence', 'Status', 'Date'].map((header, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <Skeleton variant="text" className="w-16 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-primary/10">
              <td className="p-4">
                <Skeleton className="w-24 h-16 rounded" />
              </td>
              {Array.from({ length: 4 }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <Skeleton variant="text" className="w-20 h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex cursor-pointer items-center gap-6 rounded-lg border border-primary/10 bg-bg-card p-6 min-h-[100px] justify-between">
      <div className="flex items-center gap-6">
        <Skeleton className="size-20 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

export function UploadSkeleton() {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-primary/20 bg-bg-card px-6 py-10">
        <Skeleton className="size-16 rounded-lg" />
        <div className="flex flex-col gap-2 items-center">
          <Skeleton variant="text" className="w-40 h-5" />
          <Skeleton variant="text" className="w-56 h-4" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="w-32 h-11 rounded-lg" />
          <Skeleton className="w-32 h-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </section>
  );
}

export default { Skeleton, CardSkeleton, ChartSkeleton, TableSkeleton, ListItemSkeleton, UploadSkeleton, StatsGridSkeleton };