import Link from 'next/link';

import { learningCatalog } from '@/features/learning/data/catalog';
import { getDefaultModuleRoute, getProjectRoute } from '@/features/learning/server';
import { LearningCourse } from '@/features/learning/types';

const operatingContract = [
  { label: 'weekday load', value: '2h/day', detail: 'reading, notes, small lab, reflection' },
  { label: 'weekend load', value: '6-8h/day', detail: 'system build, failure review, architecture memo' },
  { label: 'core path', value: '16 weeks', detail: 'MLOps through LLM and GPU infrastructure' },
  { label: 'standard', value: 'publishable', detail: 'projects and essays should survive external review' },
];

const systemsLadder = [
  'data contracts',
  'experiment lineage',
  'orchestration',
  'feature platforms',
  'serving paths',
  'observability',
  'distributed training',
  'LLM inference',
];

const readingSpine = [
  {
    title: 'Hidden Technical Debt in Machine Learning Systems',
    source: 'Google / NeurIPS',
    kind: 'paper',
    url: 'https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf',
  },
  {
    title: 'Rules of Machine Learning',
    source: 'Google',
    kind: 'guide',
    url: 'https://developers.google.com/machine-learning/guides/rules-of-ml/',
  },
  {
    title: 'Designing Machine Learning Systems',
    source: 'Chip Huyen / OReilly',
    kind: 'book',
    url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  },
  {
    title: 'The ML Test Score',
    source: 'Google Research',
    kind: 'paper',
    url: 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/',
  },
  {
    title: 'TFX production ML platform paper',
    source: 'Google Research',
    kind: 'paper',
    url: 'https://research.google/pubs/tfx-a-tensorflow-based-production-scale-machine-learning-platform/',
  },
  {
    title: 'Designing Data-Intensive Applications',
    source: 'Martin Kleppmann',
    kind: 'book',
    url: 'https://martin.kleppmann.com/2017/03/27/designing-data-intensive-applications.html',
  },
  {
    title: 'vLLM and PagedAttention',
    source: 'arXiv',
    kind: 'paper',
    url: 'https://arxiv.org/abs/2309.06180',
  },
  {
    title: 'OpenTelemetry documentation',
    source: 'CNCF',
    kind: 'docs',
    url: 'https://opentelemetry.io/docs/',
  },
];

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

export default function LearningLanding() {
  const projects = learningCatalog.flatMap((course) =>
    course.projects.map((project) => ({ course, project })),
  );

  return (
    <div className="min-h-screen bg-black text-[#d0ccc4] font-mono overflow-x-hidden">
      <section className="min-h-[92vh] px-5 sm:px-10 pt-24 pb-16 flex items-center border-b border-[#222]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">
              <span className="text-[#e8a000]">&gt;</span>&nbsp;learning.babalola.dev
            </p>
            <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-tight text-[#d0ccc4] sm:text-5xl lg:text-6xl">
              MLOps and AI infra training for principal-level engineering.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#888]">
              A private operating system for becoming the engineer who can design, build, serve, observe, and explain
              production ML systems under real constraints. No prompt-hacking posture, no shallow tooling tour.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/learning/mlops" className="btn btn-primary">
                open mlops track
              </Link>
              <Link href={getDefaultModuleRoute('mlops')} className="btn btn-secondary">
                start week 1
              </Link>
              <a href="#projects" className="btn btn-ghost">
                projects -&gt;
              </a>
            </div>
          </div>

          <div className="border-l border-[#222] bg-[#111] p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#e8a000]">systems map</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {systemsLadder.map((item, index) => (
                <div key={item} className="border border-[#222] bg-black px-3 py-3">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">0{index + 1}</p>
                  <p className="mt-2 text-xs font-semibold text-[#d0ccc4]">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-[#222] pt-5">
              {operatingContract.map((item) => (
                <div key={item.label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-[#222] py-3 last:border-0">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#555]">{item.label}</p>
                  <div>
                    <p className="text-sm font-bold text-[#e8a000]">{item.value}</p>
                    <p className="text-[11px] leading-5 text-[#777]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="section-label mb-2">// 01.</p>
          <h2 className="text-3xl font-bold text-[#d0ccc4] sm:text-4xl">course tracks</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666]">
            The curriculum is organized as a build loop: read a strong source, compress the idea, implement the smallest
            useful system, then write the operational tradeoff plainly.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {learningCatalog.map((course) => (
              <section key={course.id} className="border-l border-[#222] bg-[#111] p-6 transition-colors hover:border-l-[#e8a000]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{course.level}</p>
                <h3 className="mt-3 text-2xl font-bold text-[#d0ccc4]">{course.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#888]">{course.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'duration', value: course.duration },
                    { label: 'modules', value: `${countModules(course)} guided modules` },
                    { label: 'tasks', value: `${countRequiredTasks(course)} required checks` },
                  ].map((item) => (
                    <div key={item.label} className="border-t border-[#222] pt-3">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[#333]">{item.label}</p>
                      <p className="mt-1 text-[11px] leading-5 text-[#d0ccc4]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {course.focus.slice(0, 7).map((item) => (
                    <span key={item} className="project-tag">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-[#222] pt-5">
                  <Link href={`/learning/${course.slug}`} className="btn btn-primary">
                    open course
                  </Link>
                  <Link href={getDefaultModuleRoute(course.slug)} className="btn btn-secondary">
                    first module
                  </Link>
                  {course.projects[0] && (
                    <Link href={getProjectRoute(course.slug, course.projects[0].slug)} className="btn btn-ghost">
                      project -&gt;
                    </Link>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#222] bg-[#111] px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="section-label mb-2">// 02.</p>
          <h2 className="text-3xl font-bold text-[#d0ccc4] sm:text-4xl">source-backed reading</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666]">
            The spine is books, production papers, and primary documentation that force systems judgment: data quality,
            reproducibility, serving reliability, observability, distributed execution, and inference economics.
          </p>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {readingSpine.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-l border-[#222] bg-black p-5 transition-colors hover:border-l-[#e8a000]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#e8a000]">{item.kind}</span>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#333]">{item.source}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#d0ccc4]">{item.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="border-t border-[#222] px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="section-label mb-2">// 03.</p>
          <h2 className="text-3xl font-bold text-[#d0ccc4] sm:text-4xl">systems to build</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666]">
            Projects are the proof. Each one should end with a runnable artifact, a failure-mode review, and a short
            architecture memo that could be read by another senior engineer.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {projects.map(({ course, project }) => (
              <Link
                key={`${course.slug}-${project.slug}`}
                href={getProjectRoute(course.slug, project.slug)}
                className="border-l border-[#222] bg-[#111] p-6 transition-colors hover:border-l-[#e8a000]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#333]">{course.title}</p>
                <h3 className="mt-3 text-lg font-bold text-[#d0ccc4]">{project.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#888]">{project.description}</p>
                <p className="mt-5 text-[10px] uppercase tracking-[0.15em] text-[#e8a000]">open workspace -&gt;</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
