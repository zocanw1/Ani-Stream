import { Sparkles } from "lucide-react";

export default function LoadingPage() {
  return (
    <section role="status" aria-live="polite" className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="sr-only">Memuat halaman AniStream...</span>

      {/* Premium Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-3 h-3 rounded-full animate-pulse" style={{background: "var(--primary)"}} />
        <span className="w-3 h-3 rounded-full animate-pulse" style={{background: "var(--secondary)", animationDelay: "0.2s"}} />
        <span className="w-3 h-3 rounded-full animate-pulse" style={{background: "var(--accent)", animationDelay: "0.4s"}} />
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="skeleton aspect-[2/3] w-full max-w-[220px] rounded-2xl" />
        <div className="space-y-5 pt-4">
          <div className="skeleton h-4 w-28 rounded-lg" />
          <div className="skeleton h-10 w-full max-w-2xl rounded-xl" />
          <div className="skeleton h-10 w-3/4 max-w-xl rounded-xl" />
          <div className="flex gap-3">
            <div className="skeleton h-10 w-28 rounded-xl" />
            <div className="skeleton h-10 w-24 rounded-xl" />
          </div>
          <div className="grid max-w-3xl grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <div className="skeleton h-7 w-44 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton aspect-[2/3] rounded-xl" />
              <div className="skeleton h-3 w-full rounded-lg" />
              <div className="skeleton h-3 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
