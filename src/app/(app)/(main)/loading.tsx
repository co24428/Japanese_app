/**
 * Shown instantly while a page with navigation loads its data, so taps feel
 * immediate even when the database is slow to wake up.
 */
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return <PageSkeleton />;
}
