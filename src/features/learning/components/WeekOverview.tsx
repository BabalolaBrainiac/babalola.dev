import Link from 'next/link';

import { LearningCourse, LearningWeek } from '@/features/learning/types';

interface WeekOverviewProps {
  course: LearningCourse;
  week: LearningWeek;
}

export default function WeekOverview({ course, week }: WeekOverviewProps) {
  return (
    <div className="min-h-screen bg-[#090d12] text-[#e5edf5]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Link href={`/learning/${course.slug}`} className="text-sm text-[#8ca0b8] hover:text-white">
          ← Back to {course.title}
        </Link>

        <section className="mt-6 rounded-[2rem] border border-[#1b2530] bg-[#0d131b] p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">{week.slug}</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{week.title}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#a3b2c4]">{week.summary}</p>

          <div className="mt-6 rounded-2xl border border-[#18212d] bg-[#0a1016] p-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#71839a]">Theme</p>
            <p className="mt-2 text-sm leading-7 text-white">{week.theme}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#18212d] bg-[#0a1016] p-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#71839a]">Expected outputs</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[#dce6f2]">
              {week.outputs.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4">
          {week.modules.map((module) => (
            <section key={module.id} className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#71839a]">{module.durationLabel}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{module.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#9fb0c4]">{module.summary}</p>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-[#dce6f2]">
                    {module.schedule.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/learning/${course.slug}/${week.slug}/${module.slug}`}
                  className="rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-medium text-white hover:bg-[#1d4ed8]"
                >
                  Open module
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
