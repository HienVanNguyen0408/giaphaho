export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="h-4 bg-stone-200 rounded w-40 mb-8 animate-pulse" />
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
          <div className="bg-gradient-to-r from-stone-200 to-stone-300 px-8 py-10 flex gap-6 items-center">
            <div className="w-28 h-28 rounded-full bg-stone-300 flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-7 bg-stone-300 rounded w-3/4" />
              <div className="h-4 bg-stone-300 rounded w-1/3" />
            </div>
          </div>
          <div className="px-8 py-8 space-y-6">
            <div className="space-y-2">
              <div className="h-3 bg-stone-200 rounded w-32" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-stone-100 rounded-xl" />
                <div className="h-16 bg-stone-100 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-stone-200 rounded w-20" />
              <div className="h-4 bg-stone-100 rounded w-full" />
              <div className="h-4 bg-stone-100 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
