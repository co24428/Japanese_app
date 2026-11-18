/**
 * Grey placeholder shapes shown while a page loads (see the loading.tsx
 * files). They have the rough layout of the real page, so nothing jumps
 * when the content arrives.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** A generic page: a title and a few cards. */
export function PageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-44 w-full rounded-3xl" />
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}
