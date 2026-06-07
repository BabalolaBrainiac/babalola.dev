import Link from 'next/link';

import { LearningCourse } from '@/features/learning/types';
import { getDefaultModuleRoute, getProjectRoute } from '@/features/learning/server';

interface CourseHomeProps {
  course: LearningCourse;
}

function countModules(course: LearningCourse) {
  return course.weeks.reduce((total, week) => total + week.modules.length, 0);
}

function countRequiredTasks(course: LearningCourse) {
  return course.weeks.reduce(
    (total, week) =>
      total + week.modules.reduce((weekTotal, module) => weekTotal + module.tasks.filter((task) => task.required).length, 0),
    0,
  );
}

function getCoreReferences(course: LearningCourse) {
  const refs = new Map<string, NonNullable<LearningCourse['weeks'][number]['modules'][number]['references'][number]>>();

  for (const week of course.weeks) {
    for (const module of week.modules) {
      for (const reference of module.references) {
        if (!reference.url || refs.has(reference.title)) continue;
        refs.set(reference.title, reference);
      }
    }
  }

  return Array.from(refs.values()).slice(0, 10);
}

export default function CourseHome({ course }: CourseHomeProps) {
  const coreReferences = getCoreReferences(course);

  return (
    <div className="min-h-screen bg-black text-[#d0ccc4] font-mono">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
        <Link href="/learning" className="text-xs text-[#888] hover:text-[#e8a000]">
          {'<-'} Back to tracks
        </Link>

        <section className="mt-8 border-l border-[#222] bg-[#111] p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{course.level}</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-tight text-[#d0ccc4] sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-[#888]">{course.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'duration', value: course.duration },
              { label: 'weeks', value: `${course.weeks.length} structured weeks` },
              { label: 'modules', value: `${countModules(course)} guided modules` },
              { label: 'checks', value: `${countRequiredTasks(course)} required tasks` },
            ].map((item) => (
              <div key={item.label} className="border-t border-[#222] pt-3">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#d0ccc4]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={getDefaultModuleRoute(course.slug)} className="btn btn-primary">
              continue curriculum
            </Link>
            {course.projects[0] && (
              <Link href={getProjectRoute(course.slug, course.projects[0].slug)} className="btn btn-secondary">
                primary project
              </Link>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label mb-2">// profile</p>
            <h2 className="text-2xl font-bold text-[#d0ccc4]">target engineer</h2>
            <div className="mt-6 space-y-3">
              {course.audience.map((item) => (
                <p key={item} className="border-l border-[#222] bg-[#111] p-4 text-xs leading-6 text-[#888]">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-2">// operating rules</p>
            <h2 className="text-2xl font-bold text-[#d0ccc4]">principles</h2>
            <div className="mt-6 space-y-3">
              {course.principles.map((item) => (
                <p key={item} className="border-l border-[#222] bg-[#111] p-4 text-xs leading-6 text-[#888]">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        {course.projects.length > 0 && (
          <section className="mt-14 border-t border-[#222] pt-12">
            <p className="section-label mb-2">// project workspaces</p>
            <h2 className="text-2xl font-bold text-[#d0ccc4]">build targets</h2>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {course.projects.map((project) => (
                <Link
                  key={project.slug}
                  href={getProjectRoute(course.slug, project.slug)}
                  className="border-l border-[#222] bg-[#111] p-6 transition-colors hover:border-l-[#e8a000]"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{project.language}</p>
                  <h3 className="mt-3 text-lg font-bold text-[#d0ccc4]">{project.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-[#888]">{project.description}</p>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.15em] text-[#e8a000]">open workspace -&gt;</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {coreReferences.length > 0 && (
          <section className="mt-14 border-t border-[#222] pt-12">
            <p className="section-label mb-2">// reading spine</p>
            <h2 className="text-2xl font-bold text-[#d0ccc4]">primary sources</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {coreReferences.map((reference) => (
                <a
                  key={reference.title}
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-l border-[#222] bg-[#111] p-5 transition-colors hover:border-l-[#e8a000]"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#e8a000]">{reference.kind}</span>
                    {reference.required && (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#555]">required</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#d0ccc4]">{reference.title}</p>
                  {reference.author && <p className="mt-1 text-[11px] text-[#666]">{reference.author}</p>}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 border-t border-[#222] pt-12">
          <p className="section-label mb-2">// curriculum</p>
          <h2 className="text-2xl font-bold text-[#d0ccc4]">week plan</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {course.weeks.map((week) => (
              <section key={week.id} className="border-l border-[#222] bg-[#111] p-6 transition-colors hover:border-l-[#e8a000]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{week.slug}</p>
                <h3 className="mt-3 text-xl font-bold text-[#d0ccc4]">{week.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#888]">{week.summary}</p>

                <div className="mt-5 border-t border-[#222] pt-4">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">outputs</p>
                  <div className="mt-2 space-y-1.5">
                    {week.outputs.slice(0, 4).map((item) => (
                      <p key={item} className="text-[11px] leading-5 text-[#888]">
                        <span className="text-[#e8a000]">&gt;</span> {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/learning/${course.slug}/${week.slug}`} className="btn btn-secondary">
                    view week
                  </Link>
                  <Link href={`/learning/${course.slug}/${week.slug}/${week.modules[0]?.slug}`} className="btn btn-ghost">
                    first module -&gt;
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
