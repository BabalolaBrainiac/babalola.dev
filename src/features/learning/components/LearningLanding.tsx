import Link from 'next/link';

import { learningCatalog } from '@/features/learning/data/catalog';
import { getDefaultModuleRoute, getProjectRoute } from '@/features/learning/server';

export default function LearningLanding() {
  return (
    <div className="min-h-screen bg-[#090d12] text-[#e5edf5] w-full overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 w-full">
        <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-[#71839a] break-words">learning.babalola.dev</p>
        <h1 className="mt-3 sm:mt-4 max-w-4xl text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-white break-words w-full">
          Fully guided, hands-on courses for principal-level MLOps, AI infra, and Rust systems work.
        </h1>
        <p className="mt-4 sm:mt-6 max-w-3xl text-base sm:text-lg leading-6 sm:leading-8 text-[#9fb0c4] break-words">
          This learning surface is built to be your operating system for study: roadmap, reading, coding labs,
          saved projects, reflections, assessments, and weekly briefings in one place.
        </p>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 lg:grid-cols-2 w-full">
          {learningCatalog.map((course) => (
            <section key={course.id} className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6 sm:p-8 w-full overflow-hidden">
              <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-[#71839a] break-words">{course.level}</p>
              <h2 className="mt-2 sm:mt-3 text-lg sm:text-2xl font-semibold text-white break-words">{course.title}</h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-7 text-[#a4b3c4] break-words">{course.subtitle}</p>

              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {course.focus.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#223041] px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs uppercase tracking-[0.2em] text-[#8fa1b8] break-words"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#18212d] bg-[#0a1016] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-[#71839a]">Duration</p>
                  <p className="mt-2 text-xs sm:text-sm text-white break-words">{course.duration}</p>
                </div>
                <div className="rounded-2xl border border-[#18212d] bg-[#0a1016] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-[#71839a]">Weeks</p>
                  <p className="mt-2 text-xs sm:text-sm text-white">{course.weeks.length} structured weeks</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3 w-full">
                <Link
                  href={`/learning/${course.slug}`}
                  className="rounded-xl bg-[#2563eb] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-[#1d4ed8] whitespace-nowrap"
                >
                  Open course
                </Link>
                <Link
                  href={getDefaultModuleRoute(course.slug)}
                  className="rounded-xl border border-[#223041] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#b4c1d0] hover:border-[#3b82f6] hover:text-white whitespace-nowrap"
                >
                  Start first module
                </Link>
                {course.projects[0] && (
                  <Link
                    href={getProjectRoute(course.slug, course.projects[0].slug)}
                    className="rounded-xl border border-[#223041] px-4 py-3 text-sm text-[#b4c1d0] hover:border-[#3b82f6] hover:text-white"
                  >
                    Open project workspace
                  </Link>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
