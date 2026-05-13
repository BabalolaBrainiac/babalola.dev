# learning.babalola.dev — Principal MLOps / AI Infra Learning Platform Implementation Plan

**Date:** 2026-04-25  
**Status:** Ready for handoff and phased implementation  
**Scope:** Replace the current `/learning` week-one prototype with a persistent, multi-course, IDE-centric learning platform for:

1. `learning.babalola.dev/mlops`
2. `learning.babalola.dev/rust-ml`

This plan is grounded in the current repository state:

- Current learning UI is a local-only prototype in [src/app/learning](/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev/src/app/learning)
- Current course content is hardcoded in [src/app/learning/data/mlopsWeek1.ts](/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev/src/app/learning/data/mlopsWeek1.ts)
- Current persistence is minimal in [supabase/migrations/20260424000000_learning_platform.sql](/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev/supabase/migrations/20260424000000_learning_platform.sql)
- Source roadmap is [mlops.md](/Users/opeyemibabalola/Desktop/Workspace/opeyemi/learning/mlops/mlops.md)

## 1. Executive Summary

Build `learning.babalola.dev` as a dedicated product surface inside this Next.js app, backed by Supabase for identity, persistence, progress, notes, submissions, and project storage.

The platform should feel like a constrained mix of:

- a curriculum platform
- a lab environment
- a documentation system
- a lightweight IDE

The first-class experience is not "read content". It is:

1. open today’s module
2. read structured explanation
3. write code in-browser
4. run tests/checks
5. submit and unlock progress
6. keep notes and reflections
7. persist projects across reloads
8. continue from the same workspace later

The current `/learning` implementation should be treated as a reference prototype only. The final platform should be rebuilt around a course engine, persistent workspaces, and an execution architecture that supports Python and Rust progressively.

## 2. Product Goals

### Primary goal

Make `learning.babalola.dev` the only place needed to:

- follow the MLOps principal-engineer roadmap
- learn interactively through daily guided modules
- complete coding labs and assessments
- build and save projects
- review solutions and explanations
- track progress over weeks
- keep up with current MLOps/AI infra developments through regularly generated weekly content

### User profile this platform must serve

You are a senior backend engineer with Python familiarity, weak ML systems intuition, and an ambition to become a principal MLOps / AI infrastructure engineer. The teaching level must therefore:

- avoid beginner-software-engineering fluff
- explain ML and infra concepts from first principles
- connect concepts to production systems
- remain concrete, detailed, and engineering-heavy

### Non-goals for v1

- Real-time multiplayer coding
- AI autocomplete or AI pair programming inside the IDE
- Full VS Code parity
- Arbitrary untrusted container execution inside Vercel itself

## 3. Current State Assessment

### What exists today

- Next.js 13 app with Tailwind, Monaco, NextAuth, Supabase
- A learning route mounted at `/learning`
- Monaco editor embedded in a single-page learning workspace
- Pyodide-based browser execution for toy Python exercises
- LocalStorage-based learning state
- Minimal Supabase tables for progress and code saves

### Main gaps

1. Content architecture is hardcoded per day, not course-driven.
2. Progress is not modeled at course/week/day/task granularity.
3. Projects are not persistent as real multi-file workspaces.
4. The current "IDE" is not a real project workspace with test runner semantics.
5. There is no durable notes, reflections, grading, or submissions model.
6. There is no Rust path or modular course authoring system.
7. There is no clean learning subdomain information architecture.
8. The execution story is insufficient for principal-level labs.

## 4. Recommended Target Experience

### URL structure

- `learning.babalola.dev/`
  - landing page for available academies
- `learning.babalola.dev/mlops`
  - course home
- `learning.babalola.dev/mlops/week-1`
  - week overview
- `learning.babalola.dev/mlops/week-1/day-1`
  - daily guided workspace
- `learning.babalola.dev/mlops/projects/ml-system-basics`
  - persistent project workspace
- `learning.babalola.dev/rust-ml`
  - Rust-for-ML path home
- `learning.babalola.dev/rust-ml/week-1/day-1`
  - daily Rust module

### Daily workspace layout

Single-screen "learn + build" interface:

1. Left rail:
   - course map
   - week/day navigation
   - completion state
2. Center reading pane:
   - lecture
   - diagrams
   - tasks
   - checkpoints
   - reading links
3. Right IDE pane:
   - Monaco editor
   - file explorer
   - tabs
   - terminal/output
   - tests panel
4. Bottom or side utility pane:
   - notes
   - reflection prompts
   - hints
   - solution reveal
   - assessment status

### Course mechanics

Each day should include:

- time-boxed structure matching your 2-hour weekday plan
- concept teaching
- comprehension checks
- guided coding
- a reflection prompt
- a required output before unlock

Each weekend module should include:

- multi-block build sessions
- persistent project workspaces
- acceptance tests
- writing assignments
- architecture review checklist

## 5. Curriculum Strategy

## 5.1 MLOps course

Base the full MLOps path on `mlops.md`, but upgrade it from a topic list into a formal program.

### Phase structure

1. `Phase 1: ML systems foundations`
2. `Phase 2: Reproducibility and experimentation`
3. `Phase 3: pipelines and orchestration`
4. `Phase 4: data systems and feature platforms`
5. `Phase 5: deployment and serving`
6. `Phase 6: distributed systems for ML infra`
7. `Phase 7: distributed training and GPU systems`
8. `Phase 8: inference optimization and LLM systems`
9. `Phase 9: production reliability, observability, and cost`
10. `Phase 10: principal-level architecture and leadership artifacts`

### Week 1 must strictly follow your stated schedule

Use your exact weekday/weekend structure as the learning contract:

- Mon-Fri: 2 hours max
- Sat-Sun: 6-8 hours deep work

Each day must expose:

- `Reading / Concepts`
- `Notes / Thinking / Light coding`
- `Reflection`

Each weekend block must expose:

- `Build block`
- `Debug block`
- `Writing block`
- `Documentation block`

### Week 1 module deliverables

By the end of Week 1 the platform must force completion of:

1. `ml-system-basics` project
2. `Why ML Systems Fail in Production` writing artifact
3. `Failure Modes in My System` writing artifact
4. explicit competency checks for:
   - training-serving skew
   - data dependency debt
   - concept drift
   - failure points in an end-to-end ML system

## 5.2 Rust-ML course

This should not be a generic Rust course. It should be "Rust for systems-minded ML/infra engineers".

### Rust-ML path goals

- become fluent enough in Rust to build performance-critical ML infra components
- understand ownership/borrowing in systems terms
- connect Rust to model serving, data tooling, CLI tooling, and inference runtimes

### Recommended phases

1. Rust fundamentals for backend engineers
2. Ownership, borrowing, and memory layout
3. Error handling and robust CLI tools
4. Concurrency and async
5. Data pipelines and serialization
6. Numerical computing basics
7. Python/Rust interoperability with `pyo3` or FFI
8. High-performance inference/service utilities
9. Observability, packaging, and deployable tools

## 6. Content Model

Do not keep content hardcoded in TS files. Move to a declarative course format.

### Recommended authoring model

Use versioned structured content in repo-local files:

- `content/courses/mlops/course.json`
- `content/courses/mlops/weeks/week-1/day-1.mdx`
- `content/courses/mlops/weeks/week-1/day-1.lab.json`
- `content/courses/rust-ml/...`

### Suggested schema

Each course should define:

- metadata
- prerequisites
- estimated duration
- target competencies
- weeks
- unlock rules

Each day should define:

- `id`
- `title`
- `slug`
- `duration_minutes`
- `daily_template`
- `sections`
- `tasks`
- `quiz_questions`
- `coding_labs`
- `reflection_prompts`
- `required_outputs`
- `references`
- `news_context`

Each lab should define:

- starter files
- hidden tests
- visible checks
- hint ladder
- solution files
- grading rubric

## 7. Platform Architecture

### Recommended architecture split

1. `Next.js app`
   - rendering
   - authenticated app shell
   - curriculum UI
   - IDE shell
2. `Supabase`
   - auth
   - relational progress data
   - notes
   - submissions
   - saved projects metadata
   - storage buckets for project archives/artifacts
3. `Code execution service`
   - not Vercel functions for serious execution
   - use a separate sandbox service or remote runner
4. `Content layer`
   - MDX + structured lab configs from repo
5. `Background generation/admin tooling`
   - weekly content generation and curation workflow

### Why a separate execution service is necessary

Vercel is fine for the web app and CRUD APIs. It is the wrong place for:

- Python package installs
- Rust compilation
- long-running jobs
- untrusted code execution
- persistent project workspace processes

Recommended execution design:

1. Browser IDE in Next.js
2. Save files to Supabase-backed project state
3. Submit run/test command to a sandbox service
4. Service executes in ephemeral isolated container
5. Stream logs/status back to UI

### Practical v1/v2 execution plan

#### v1

- Python basics in browser via Pyodide for short exercises
- Rust syntax drills via WASM-based tooling only if reliable, otherwise deferred
- server-graded exercises for deterministic checks
- persistent multi-file project editing without full live local process model

#### v1.5

- remote code runner for Python project labs
- hidden tests and command-based validation

#### v2

- remote containerized runner for Python + Rust projects
- workspace snapshots
- downloadable projects
- richer terminal semantics

## 8. IDE Strategy

### Core recommendation

Use Monaco as the base, but do not promise "full VS Code". Instead, ship a focused learning IDE with:

- Monaco editor
- file explorer
- tabs
- unsaved state markers
- output panel
- test results panel
- markdown instructions panel
- keyboard shortcuts

### IntelliSense strategy

No AI suggestions. Use language-service-backed IntelliSense only.

#### Python

Options:

1. Monaco basic syntax + snippets in v1
2. Pyright/LSP integration later
3. Remote analysis service for richer completions in advanced phase

#### Rust

Use `monaco-languageclient` only if implementation cost is acceptable. Otherwise:

1. syntax highlighting in v1
2. structured hints/snippets/checks
3. proper LSP-backed Rust Analyzer integration in v2

### Recommendation for handoff

Do not block the platform on perfect in-browser IntelliSense. Ship:

- reliable editor UX
- file persistence
- deterministic tests
- strong scaffolding

Then add richer language intelligence in a later milestone.

## 9. Persistence Model

The current two-table design is insufficient. Replace it with a normalized learning schema.

### New Supabase tables

1. `learning_courses`
   - `id`
   - `slug`
   - `title`
   - `description`
   - `theme`
   - `published`

2. `learning_modules`
   - `id`
   - `course_id`
   - `parent_module_id`
   - `type` (`week`, `day`, `weekend_block`, `project`, `assessment`)
   - `slug`
   - `title`
   - `order_index`
   - `duration_minutes`
   - `unlock_rule`

3. `learning_user_module_progress`
   - `id`
   - `user_id`
   - `module_id`
   - `status`
   - `score`
   - `started_at`
   - `completed_at`
   - `last_accessed_at`

4. `learning_tasks`
   - `id`
   - `module_id`
   - `type`
   - `label`
   - `required`
   - `order_index`

5. `learning_user_task_progress`
   - `id`
   - `user_id`
   - `task_id`
   - `status`
   - `response_json`
   - `completed_at`

6. `learning_projects`
   - `id`
   - `user_id`
   - `course_id`
   - `slug`
   - `title`
   - `project_type`
   - `template_version`
   - `active_module_id`

7. `learning_project_files`
   - `id`
   - `project_id`
   - `path`
   - `language`
   - `content`
   - `is_readonly`
   - `updated_at`

8. `learning_project_runs`
   - `id`
   - `project_id`
   - `module_id`
   - `run_type` (`run`, `test`, `submit`)
   - `status`
   - `stdout`
   - `stderr`
   - `result_json`
   - `runner_ref`

9. `learning_notes`
   - `id`
   - `user_id`
   - `course_id`
   - `module_id`
   - `note_type` (`notes`, `reflection`, `summary`)
   - `content`

10. `learning_submissions`
    - `id`
    - `user_id`
    - `module_id`
    - `project_id`
    - `submission_type` (`quiz`, `lab`, `essay`, `checkpoint`)
    - `answer_json`
    - `status`
    - `score`

11. `learning_reference_items`
    - `id`
    - `course_id`
    - `module_id`
    - `kind` (`paper`, `blog`, `book`, `video`, `doc`, `news`)
    - `title`
    - `url`
    - `annotation`
    - `is_required`

12. `learning_weekly_briefings`
    - `id`
    - `course_id`
    - `week_of`
    - `title`
    - `content`
    - `sources_json`

### Storage buckets

Add Supabase Storage buckets for:

- `learning-project-archives`
- `learning-artifacts`
- `learning-attachments`

## 10. Auth and access model

The current app uses custom credentials + `blog_users`. That is usable short-term but not ideal for a dedicated learner platform.

### Recommendation

Short-term:

- reuse existing auth stack to avoid blocking implementation
- ensure learning users map cleanly to a single internal user ID

Medium-term:

- move learning platform auth to Supabase Auth or unify auth model across the app

## 11. Design System Direction

You asked for dark theme with simple colors and a strong IDE feel. Keep it restrained.

### Recommended visual direction

- background: charcoal/graphite
- panels: slightly lifted dark neutrals
- accent: one cool-blue or green-cyan system accent
- semantic colors for pass/warn/fail
- sharp or lightly rounded corners
- mono + sans pairing

### Avoid

- glassmorphism
- noisy gradients
- multiple accent colors
- "AI" styling clichés

### Experience references

Aim for the compositional clarity of:

- Linear
- VS Code
- GitHub dark
- modern docs platforms

But tuned for a study workflow.

## 12. Information Architecture

### Primary app sections

1. `Home`
2. `Courses`
3. `My Progress`
4. `Projects`
5. `Notes`
6. `Weekly Briefing`
7. `Settings`

### Per-course sections

1. `Overview`
2. `Roadmap`
3. `Weeks`
4. `Projects`
5. `References`
6. `Assessments`

## 13. Week 1 Detailed Productization Plan

Convert your Week 1 plan into an app-native workflow.

### Monday: ML systems intro

Build:

- reading panel summarizing first half of "Hidden Technical Debt"
- glossary drawer
- note-taking area with required prompt fields
- short quiz on:
  - technical debt types
  - why ML differs from traditional software

Required completion:

- notes submitted
- reflection answered

### Tuesday: failure modes

Build:

- paper continuation
- interactive failure mode map
- scenario-writing exercise
- graded short-answer prompts

Required completion:

- top 5 failure modes entered
- one hardest-to-detect failure reflection

### Wednesday: Rules of ML

Build:

- guided reading
- "extract the rules" exercise
- explain-in-your-own-words checkpoint

### Thursday: system thinking

Build:

- end-to-end ML system diagram activity
- clickable system nodes
- failure annotation exercise

### Friday: project setup

Build:

- spawn `ml-system-basics` project from template
- scaffold files
- guided first implementation steps
- weekend plan worksheet

### Saturday: build day

Build:

- training script tasks
- metrics tasks
- FastAPI serving tasks
- test/debug checklist
- config refactor task

### Sunday: hardening day

Build:

- Dockerization walkthrough
- failure simulation test suite
- 2 writing assignments
- README/architecture review task

## 14. Project Templates

Create course-owned project templates stored in repo.

### Example structure

- `templates/ml-system-basics/`
- `templates/rust-ml-cli-basics/`

Each template should include:

- starter files
- teacher files
- test manifests
- hidden evaluation config
- downloadable project archive generation support

## 15. Assessment Model

Each module should support at least one of:

- multiple choice
- short answer
- structured reflection
- code checkpoint
- end-of-module submission

### Grading rules

- objective checks auto-grade immediately
- reflective writing stores completion and optional rubric score
- labs unlock hints progressively
- reveal solution requires explicit user action and should record that event

## 16. Weekly Up-to-Date Content Generation

You want to ask for "generate this week’s content" later and get current ML infra developments included.

### Recommended workflow

Build an internal admin/content workflow:

1. fetch latest sources from official docs, blogs, papers, announcements
2. curate into weekly briefing + course deltas
3. store as draft
4. review and publish

### Important constraint

Do not auto-publish generated technical claims without review. Weekly briefings should be:

- sourced
- dated
- clearly separated from evergreen curriculum

### Product shape

Each week should include:

- `Evergreen material`
- `This week in ML infra`
- `What changed recently`
- `Why it matters architecturally`

## 17. Deployment Plan

### Web app

Deploy the Next.js app to Vercel.

### Learning subdomain

Configure `learning.babalola.dev` to point to this app, then route:

- `/mlops`
- `/rust-ml`

### Runner service

Do not deploy the code runner to Vercel if it needs containers, compilation, or long execution windows.

Use one of:

1. Fly.io
2. Railway
3. Render
4. self-hosted isolated runner

## 18. Recommended Implementation Phases

### Phase 0: Foundation and refactor

Goal:

- replace prototype assumptions
- establish clean architecture

Tasks:

- create app routes for `learning` product
- define content schema
- define data access layer
- create reusable learning shell
- create design tokens specific to learning

### Phase 1: Persistent course engine

Goal:

- support multiple courses, weeks, days, and progress

Tasks:

- course/module/task schema in Supabase
- content loader for MDX + lab JSON
- progress APIs
- notes/reflection APIs
- course map UI

### Phase 2: Real project workspace

Goal:

- persistent multi-file coding experience

Tasks:

- project templates
- project/file persistence
- file explorer and tabs
- output panel
- run/test status model
- download/archive endpoint

### Phase 3: Week 1 MLOps production-quality content

Goal:

- fully guided interactive week matching your 2-hour/day plan

Tasks:

- author week 1 MDX
- create quizzes/checkpoints
- create `ml-system-basics` project
- create weekend labs
- create writing prompts and rubric

### Phase 4: Rust-ML foundational path

Goal:

- standalone Rust learning path integrated with same engine

Tasks:

- author Rust path week 1-2
- build syntax and project exercises
- create first Rust project template

### Phase 5: Remote execution

Goal:

- move beyond browser toy execution

Tasks:

- build runner service
- sandbox Python execution
- queue run/test jobs
- stream results back

### Phase 6: Weekly briefing workflow

Goal:

- keep platform current

Tasks:

- briefing schema
- admin draft workflow
- source tracking
- publish UI

## 19. Repo-Level Implementation Recommendations

### New directories

- `src/app/(learning)/`
- `src/features/learning/`
- `src/features/learning/components/`
- `src/features/learning/server/`
- `src/features/learning/types/`
- `content/courses/`
- `templates/`
- `supabase/migrations/`

### Suggested route structure

- `src/app/(learning)/layout.tsx`
- `src/app/(learning)/page.tsx`
- `src/app/(learning)/mlops/page.tsx`
- `src/app/(learning)/mlops/[week]/[day]/page.tsx`
- `src/app/(learning)/rust-ml/page.tsx`
- `src/app/(learning)/rust-ml/[week]/[day]/page.tsx`
- `src/app/api/learning/...`

### Existing code to retire or replace

- localStorage-only state in [LearningContext.tsx](/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev/src/app/learning/context/LearningContext.tsx)
- hardcoded `mlopsWeek1` content file
- simulated execute-code endpoint for anything beyond demo use

## 20. Acceptance Criteria

The implementation is successful when:

1. `learning.babalola.dev/mlops` exists as a dedicated course home.
2. Week 1 is fully modeled in the app with daily and weekend modules.
3. Progress persists across reloads and devices.
4. A user can create and continue a saved `ml-system-basics` project.
5. Monaco-based IDE supports multi-file editing and basic IntelliSense.
6. Labs have visible checks, hints, and solution reveal.
7. Notes and reflections persist.
8. Rust-ML path exists as a separate course.
9. Vercel deployment works for the app shell.
10. The plan for remote execution is defined and implementable without re-architecting the UI.

## 21. Key Risks

1. Over-promising a full VS Code clone in-browser.
2. Trying to run serious Python/Rust execution inside Vercel serverless.
3. Writing all course content as JSX instead of an authorable content system.
4. Building remote execution before the course engine and project persistence exist.
5. Not separating evergreen learning content from weekly up-to-date briefings.

## 22. Recommended Build Order for Gemini

Give Gemini the work in this order:

1. Refactor routing and learning shell.
2. Implement Supabase schema and data access.
3. Build course/module/task engine.
4. Build persistent workspace/project system.
5. Author MLOps Week 1 completely.
6. Add Rust-ML course scaffolding.
7. Improve IntelliSense and runner integration.
8. Add weekly briefing/admin workflow.

## 23. Gemini Handoff Prompt

Use the following as the handoff brief:

```text
You are implementing a major rewrite of the learning platform inside this Next.js repo.

Read these first:
1. docs/plan/learning-platform-principal-mlops.md
2. /Users/opeyemibabalola/Desktop/Workspace/opeyemi/learning/mlops/mlops.md
3. src/app/learning/*
4. supabase/migrations/20260424000000_learning_platform.sql

Goal:
Build learning.babalola.dev as a persistent interactive learning platform with two courses:
- /mlops
- /rust-ml

Requirements:
- Replace the current hardcoded /learning prototype with a course engine
- Use Supabase for persistence
- Support progress, tasks, notes, reflections, projects, and saved files
- Keep Monaco as the editor foundation
- Provide a real IDE-like workspace with file explorer, tabs, output, tests, and hints
- Do not add AI autocomplete
- Week 1 of MLOps must strictly follow the 2-hour weekday + weekend deep work plan
- Create the ml-system-basics project template and guided labs
- Add a separate rust-ml course scaffold
- Prepare the architecture for a future remote runner; do not depend on Vercel for serious code execution
- Preserve the dark, focused IDE aesthetic

Implementation priorities:
1. architecture and routes
2. schema and APIs
3. persistent IDE/workspace
4. MLOps week 1 content
5. Rust-ML scaffolding

When implementing, optimize for maintainability and authorability. Do not leave course content trapped in TS constants if MDX/JSON content files are more appropriate.
```

## 24. Validation Notes

This plan intentionally changes the scope from "improve the current page" to "build a learning product". That is the correct interpretation of your request.

The current codebase is capable of supporting this direction, but only if implementation is staged. The critical technical decision is this:

- keep Vercel for app hosting
- move serious code execution to a separate sandboxed service later

That avoids the most common failure mode in interactive coding platforms: coupling the web tier to the runner tier too early and too loosely.
