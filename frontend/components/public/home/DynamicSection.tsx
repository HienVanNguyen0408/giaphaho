import type { Section } from '@/types';

export default function DynamicSection({ sections }: { sections: Section[] }) {
  const activeSections = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeSections.length === 0) return null;

  return (
    <section className="py-12 bg-amber-50/60 border-t border-amber-100" aria-label="Các chuyên mục">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Chuyên Mục</h2>
          <span className="flex-1 h-px bg-amber-200" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeSections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl px-6 py-5 shadow-sm shadow-stone-100 border border-stone-100 hover:border-amber-200 hover:shadow-amber-50 transition-all duration-200 flex items-center gap-3"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <span className="text-stone-700 font-medium text-sm">{section.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
