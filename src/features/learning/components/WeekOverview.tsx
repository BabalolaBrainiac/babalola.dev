import Link from 'next/link';

import { LearningCourse, LearningWeek } from '@/features/learning/types';

interface WeekOverviewProps {
  course: LearningCourse;
  week: LearningWeek;
}

function getWeekReferences(week: LearningWeek) {
  const refs = new Map<string, LearningWeek['modules'][number]['references'][number]>();

  for (const module of week.modules) {
    for (const reference of module.references) {
      if (!reference.url || refs.has(reference.title)) continue;
      refs.set(reference.title, reference);
    }
  }

  return Array.from(refs.values()).slice(0, 8);
}

export default function WeekOverview({ course, week }: WeekOverviewProps) {
  const references = getWeekReferences(week);

  return (
    <div className="min-h-screen bg-black text-[#d0ccc4] font-mono">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
        <Link href={`/learning/${course.slug}`} className="text-xs text-[#888] hover:text-[#e8a000]">
          {'<-'} Back to {course.title}
        </Link>

        <section className="mt-8 border-l border-[#222] bg-[#111] p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{week.slug}</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-tight text-[#d0ccc4] sm:text-5xl">
            {week.title}
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-[#888]">{week.summary}</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-t border-[#222] pt-4">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">theme</p>
              <p className="mt-2 text-xs leading-6 text-[#d0ccc4]">{week.theme}</p>
            </div>
            <div className="border-t border-[#222] pt-4">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">commitment</p>
              <p className="mt-2 text-xs leading-6 text-[#d0ccc4]">{week.commitment}</p>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label mb-2">// expected outputs</p>
            <h2 className="text-2xl font-bold text-[#d0ccc4]">what must exist</h2>
            <div className="mt-6 space-y-3">
              {week.outputs.map((item) => (
                <p key={item} className="border-l border-[#222] bg-[#111] p-4 text-xs leading-6 text-[#888]">
                  <span className="text-[#e8a000]">&gt;</span> {item}
                </p>
              ))}
            </div>
          </div>

          {references.length > 0 && (
            <div>
              <p className="section-label mb-2">// sources</p>
              <h2 className="text-2xl font-bold text-[#d0ccc4]">week references</h2>
              <div className="mt-6 space-y-3">
                {references.map((reference) => (
                  <a
                    key={reference.title}
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-l border-[#222] bg-[#111] p-4 transition-colors hover:border-l-[#e8a000]"
                  >
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#e8a000]">{reference.kind}</span>
                    <p className="mt-2 text-xs font-semibold leading-6 text-[#d0ccc4]">{reference.title}</p>
                    {reference.author && <p className="mt-1 text-[11px] text-[#666]">{reference.author}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[#222] pt-12">
          <p className="section-label mb-2">// modules</p>
          <h2 className="text-2xl font-bold text-[#d0ccc4]">daily sequence</h2>

          <div className="mt-6 grid gap-4">
            {week.modules.map((module, index) => (
              <section key={module.id} className="border-l border-[#222] bg-[#111] p-6 transition-colors hover:border-l-[#e8a000]">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-4xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">
                      {String(index + 1).padStart(2, '0')} / {module.durationLabel}
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-[#d0ccc4]">{module.title}</h3>
                    <p className="mt-3 text-xs leading-6 text-[#888]">{module.summary}</p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      {module.schedule.slice(0, 3).map((item) => (
                        <p key={item} className="border-t border-[#222] pt-3 text-[11px] leading-5 text-[#777]">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  <Link href={`/learning/${course.slug}/${week.slug}/${module.slug}`} className="btn btn-primary shrink-0">
                    open module
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
