import Link from 'next/link';

import { LearningCourse } from '@/features/learning/types';
import { getDefaultModuleRoute, getProjectRoute } from '@/features/learning/server';

interface CourseHomeProps {
  course: LearningCourse;
}

export default function CourseHome({ course }: CourseHomeProps) {
  return (
    <div className="min-h-screen bg-[#090d12] text-[#e5edf5]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Link href="/learning" className="text-sm text-[#8ca0b8] hover:text-white">
          ← Back to courses
        </Link>

        <div className="mt-6 rounded-[2rem] border border-[#1b2530] bg-[#0d131b] p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">{course.level}</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">{course.title}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#a3b2c4]">{course.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={getDefaultModuleRoute(course.slug)}
              className="rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-medium text-white hover:bg-[#1d4ed8]"
            >
              Continue into the curriculum
            </Link>
            {course.projects[0] && (
              <Link
                href={getProjectRoute(course.slug, course.projects[0].slug)}
                className="rounded-xl border border-[#223041] px-4 py-3 text-sm text-[#b4c1d0] hover:border-[#3b82f6] hover:text-white"
              >
                Open primary project workspace
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">Audience</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#dce6f2]">
              {course.audience.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">Principles</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#dce6f2]">
              {course.principles.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">Weekly briefing</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#dce6f2]">
              <p className="font-medium text-white">{course.briefings[0]?.title}</p>
              <p>{course.briefings[0]?.summary}</p>
              {course.briefings[0]?.bullets.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {course.weeks.map((week) => (
            <section key={week.id} className="rounded-3xl border border-[#1b2530] bg-[#0d131b] p-6">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#71839a]">{week.slug}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{week.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#9db0c3]">{week.summary}</p>

              <div className="mt-5 rounded-2xl border border-[#18212d] bg-[#0a1016] p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#71839a]">Commitment</p>
                <p className="mt-2 text-sm text-white">{week.commitment}</p>
              </div>

              <div className="mt-5 space-y-2 text-sm leading-7 text-[#dce6f2]">
                {week.outputs.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/learning/${course.slug}/${week.slug}`}
                  className="rounded-xl border border-[#223041] px-4 py-3 text-sm text-[#b4c1d0] hover:border-[#3b82f6] hover:text-white"
                >
                  View week
                </Link>
                <Link
                  href={`/learning/${course.slug}/${week.slug}/${week.modules[0]?.slug}`}
                  className="rounded-xl bg-[#1f3b62] px-4 py-3 text-sm font-medium text-white hover:bg-[#214777]"
                >
                  Open first module
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
