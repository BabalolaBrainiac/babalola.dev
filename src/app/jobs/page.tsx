import Link from 'next/link'

export const metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://jobs.babalola.dev' : 'http://localhost:3000'),
  title: 'Jobs - Babalola Opeyemi | Open Roles',
  description: 'Open contract roles at Babalola Opeyemi — Personal Assistant & Social Media Manager. Fully remote, flexible hours.',
  openGraph: {
    title: 'Jobs - Babalola Opeyemi | Open Roles',
    description: 'Open contract roles — Personal Assistant & Social Media Manager. Fully remote, flexible hours.',
    url: 'https://jobs.babalola.dev',
    type: 'website',
  },
}

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono">

      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="https://babalola.dev" className="text-[var(--accent)] hover:opacity-80 transition-opacity text-sm tracking-widest lowercase">
            ← babalola.dev
          </Link>
          <span className="text-[var(--muted)] text-xs tracking-widest lowercase">jobs.babalola.dev</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {/* Page heading */}
        <div className="mb-16">
          <p className="text-[var(--accent)] text-xs tracking-widest lowercase mb-3">open roles</p>
          <h1 className="text-3xl sm:text-4xl font-bold lowercase tracking-wide mb-4">
            work with me
          </h1>
          <p className="text-[var(--muted)] text-sm leading-relaxed max-w-xl">
            i build in public. i run multiple projects simultaneously. i need people who can keep things moving while i stay focused on building.
          </p>
        </div>

        {/* Role card */}
        <article className="border border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-lg overflow-hidden">

          {/* Role header */}
          <div className="border-b border-[var(--glass-border)] px-8 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-block text-xs tracking-widest lowercase text-[var(--accent)] border border-[var(--accent)] px-2 py-0.5 rounded mb-3">
                  contract · remote
                </span>
                <h2 className="text-2xl font-bold lowercase tracking-wide">
                  personal assistant &amp; social media manager
                </h2>
              </div>
              <div className="text-right text-sm text-[var(--muted)] space-y-1">
                <p>≤ 24 hrs / week</p>
                <p>flexible hours</p>
                <p>fully remote</p>
              </div>
            </div>

            <p className="text-[var(--muted)] text-sm leading-relaxed">
              this is a dual-function contract role. you will act as my personal assistant — keeping my schedule, inbox, and priorities organised — while also handling social media and online presence for a portfolio of early-stage tech projects. if you thrive in organised chaos, can context-switch fast, and love getting things done without being told twice, read on.
            </p>
          </div>

          <div className="px-8 py-8 space-y-10">

            {/* About the work */}
            <section>
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">about the work</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                i am a software engineer and "founder" running a portfolio of early-stage, bootstrapped tech projects. currently 7 active projects across different verticals — this number may increase or decrease depending on traction. i don't particularly like the label, but here we are. alongside this, i lead the machine learning community for liverpool, which involves organising events, coordinating speakers, and managing logistics.
              </p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                hours are capped at 24 per week across both functions. projects are early-stage, so social media posting does not need to be daily or rigidly scheduled — quality and consistency matter more than volume.
              </p>
            </section>

            {/* PA responsibilities */}
            <section>
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">personal assistant responsibilities</h3>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                {[
                  'manage and organise my calendar — schedule meetings, block focus time, send reminders',
                  'monitor, sort, and respond to emails across project inboxes (following my templates and tone)',
                  'draft and send routine communications on my behalf',
                  'keep a running log of tasks, deadlines, and outstanding items across projects',
                  'research, summarise, and prepare briefings for meetings or decisions',
                  'coordinate with external collaborators, communities, or vendors when needed',
                  'help plan and execute ml community liverpool events — speaker outreach, venue coordination, promotion, logistics',
                  'flag blockers, time conflicts, or anything that needs my direct attention',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[var(--accent)] mt-0.5 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Social media responsibilities */}
            <section>
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">social media &amp; content responsibilities</h3>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                {[
                  'manage social media accounts for all active projects (twitter/x, linkedin, instagram where applicable)',
                  'create and schedule posts that reflect each project\'s voice and stage',
                  'engage with audiences, respond to comments and dms in a timely manner',
                  'monitor mentions, tags, and relevant conversations in each project\'s space',
                  'repurpose existing content (updates, milestones, launches) into social posts',
                  'track basic analytics and flag what is working and what is not',
                  'keep account bios, links, and profile info up to date across platforms',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[var(--accent)] mt-0.5 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* You are */}
            <section>
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">you are</h3>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                {[
                  'extremely organised and proactive — you anticipate needs before they are stated',
                  'a strong written communicator in english — clear, concise, professional',
                  'comfortable working across multiple projects with different contexts and tones',
                  'reliable and self-managing — you do not need to be micromanaged',
                  'tech-savvy — comfortable with tools like notion, google workspace, calendly, buffer/hootsuite or similar',
                  'genuinely interested in tech startups, ml, or the builder ecosystem (nice to have)',
                  'available for async communication with occasional real-time check-ins',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[var(--accent)] mt-0.5 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Terms */}
            <section>
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">terms</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'type', value: 'contract (part-time)' },
                  { label: 'hours', value: 'up to 24 hrs / week' },
                  { label: 'schedule', value: 'flexible — async-first' },
                  { label: 'location', value: 'fully remote' },
                  { label: 'start', value: 'asap' },
                  { label: 'rate', value: 'negotiable — state your expectation' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-sm">
                    <span className="text-[var(--accent)] w-20 shrink-0 lowercase">{label}</span>
                    <span className="text-[var(--muted)]">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Apply */}
            <section className="border-t border-[var(--glass-border)] pt-8">
              <h3 className="text-xs tracking-widest lowercase text-[var(--accent)] mb-4">how to apply</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                send an email to <a href="mailto:me@babalola.dev" className="text-[var(--accent)] hover:opacity-80 underline underline-offset-2">me@babalola.dev</a> with the subject line <span className="text-[var(--foreground)]">pa + smm application</span>. include a short note on why you are a good fit, your experience with calendar and inbox management, and links to any social media accounts you have managed. no lengthy cover letters needed — show me you can communicate clearly and briefly.
              </p>
              <a
                href="mailto:me@babalola.dev?subject=PA%20%2B%20SMM%20Application"
                className="inline-block bg-[var(--accent)] text-[var(--background)] text-sm font-semibold lowercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity"
              >
                apply now →
              </a>
            </section>

          </div>
        </article>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-[var(--muted)] tracking-widest lowercase">
          only one role is open at this time · no agencies please
        </p>

      </main>

      <footer className="border-t border-[var(--glass-border)] mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[var(--muted)] lowercase tracking-widest">
          © {new Date().getFullYear()} babalola opeyemi · <Link href="https://babalola.dev" className="hover:text-[var(--accent)] transition-colors">babalola.dev</Link>
        </div>
      </footer>

    </div>
  )
}
