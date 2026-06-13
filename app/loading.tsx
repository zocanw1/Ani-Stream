export default function LoadingPage() {
  return (
    <section role="status" aria-live="polite" className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="sr-only">Memuat halaman AniStream...</span>

      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="skeleton aspect-[2/3] w-full max-w-[220px] rounded-lg" />
        <div className="space-y-5 pt-4">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-10 w-full max-w-2xl rounded" />
          <div className="skeleton h-10 w-3/4 max-w-xl rounded" />
          <div className="flex gap-3">
            <div className="skeleton h-8 w-24 rounded" />
            <div className="skeleton h-8 w-20 rounded" />
          </div>
          <div className="grid max-w-3xl grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <div className="skeleton h-7 w-44 rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton aspect-[2/3] rounded-lg" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
