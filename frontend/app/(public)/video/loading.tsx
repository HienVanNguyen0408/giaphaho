export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="h-9 bg-stone-200 rounded-xl w-48 mx-auto animate-pulse" />
          <div className="h-4 bg-stone-200 rounded w-80 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
              <div className="relative w-full bg-stone-200" style={{ paddingBottom: '56.25%' }} />
              <div className="p-4">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
