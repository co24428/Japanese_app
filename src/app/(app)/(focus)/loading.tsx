/** Placeholder for the full-screen lesson player while a session is built. */
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]" role="status" aria-label="Loading">
      <div className="flex items-center gap-3 pb-2">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 flex-1 rounded-full" />
      </div>
      <div className="mt-6 space-y-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    </div>
  );
}
