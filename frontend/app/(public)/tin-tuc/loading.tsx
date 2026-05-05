export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="h-9 bg-stone-200 rounded-xl w-56 mx-auto animate-pulse" />
          <div className="h-4 bg-stone-200 rounded w-80 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
              <div className="h-48 bg-stone-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-stone-200 rounded w-24" />
                <div className="h-4 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
