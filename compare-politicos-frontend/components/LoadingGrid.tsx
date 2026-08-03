export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mx-auto mb-4 size-20 rounded-2xl bg-[#d9e3ed]" />
          <div className="mb-2 h-4 rounded bg-[#d9e3ed]" />
          <div className="mx-auto mb-4 h-4 w-3/4 rounded bg-[#d9e3ed]" />
          <div className="mx-auto h-6 w-2/3 rounded-full bg-[#d5eee2]" />
        </div>
      ))}
    </div>
  );
}
