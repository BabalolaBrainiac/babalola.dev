# Learning Platform v2 — Full Implementation Plan
**Target**: learning.babalola.dev  
**Handoff**: Gemini (Claude authored this plan after full codebase audit)  
**Date**: 2026-04-25  
**Priority**: High — primary personal learning environment

---

## 0. CONTEXT: What Already Exists

This is a Next.js 13.5 (App Router) project at:
`/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev`

### Existing learning infrastructure:
- `src/features/learning/` — feature folder (types, catalog, server utils, components)
- `src/app/learning/` — route pages (layout, landing, course slug, week slug, module slug, project slug)
- `src/app/api/learning/state/route.ts` — POST endpoint that saves to Supabase
- `src/features/learning/components/LearningWorkspaceClient.tsx` — the main IDE workspace component (1 file, ~900 lines)
- `src/features/learning/data/catalog.ts` — all course content (~1165 lines; Week 1 of MLOps fully detailed, all other weeks are stubs via `buildOutlineWeek()`)
- Supabase tables already exist: `learning_user_task_progress`, `learning_notes`, `learning_submissions`, `learning_projects`, `learning_project_files`
- Monaco Editor already integrated via `@monaco-editor/react`
- Python execution via Pyodide (browser WASM)

### Current URLs (existing routing):
- `/learning` → landing
- `/learning/[courseSlug]` → course home
- `/learning/[courseSlug]/[weekSlug]/[moduleSlug]` → module workspace
- `/learning/[courseSlug]/projects/[projectSlug]` → project workspace

**Target URLs** (no change needed to routing, just course slugs):
- `learning.babalola.dev/learning/mlops` → MLOps course home
- `learning.babalola.dev/learning/rust-ml` → Rust ML course home

---

## 1. PROBLEMS TO FIX (Priority Order)

### P1 — Sidebar is not collapsible
Current: sidebar is `xl:col-span-2` with no toggle. When collapsed the workspace gets no extra room.  
Fix: Add a collapse toggle button. When collapsed, sidebar shrinks to 0 width and the workspace expands to fill.

### P2 — Workspace panel shows too much
Current: The middle panel (col-span-4) shows guide, notes, reflection, checks, all visible simultaneously via tabs.  
Fix: Only show the content directly relevant to what the user is doing RIGHT NOW. On reading-type modules, show guide + references. On coding labs, show the lab objective + hints panel. On reflection, show the reflection prompts. Use context to auto-switch tab to the right mode.

### P3 — "Open Project" button is confusing
Current: A button labelled "Open Project" appears on every module and links to the course's persistent project workspace. Users don't know what it is.  
Fix: Rename to "Project Workspace →" and add a tooltip: "The persistent workspace where you build the week's capstone system (ml-system-basics). You can work here any time."

### P4 — Export downloads JSON
Current: `downloadWorkspace()` exports all files as a single JSON object.  
Fix: Export as a `.zip` file with real directory structure. Each file becomes a real file at its declared path. Use the `fflate` library (already available or add it) for in-browser zip creation. For project exports, preserve folder structure (`src/train.py` → actual `src/` subfolder inside the zip).

### P5 — Sessions not persisted per IP/device
Current: State is saved per `user_id` only in Supabase. No multi-device awareness. Reloading works if authenticated, but there's no session list UI or IP tracking.  
Fix: Add `learning_sessions` Supabase table (see Section 4). On page load, upsert a session row with IP + user agent. Show a "Your sessions" indicator in the workspace header.

### P6 — IDE not VS Code-like enough
Current: Uses `vs-dark` theme in Monaco. File tree is small and unstyled. No breadcrumb. Terminal is a plain pre tag.  
Fix: Register a custom "OneDark Pro"-style Monaco theme. Add VS Code-style tab bar, file tree with icons, terminal styling with ANSI color support.

### P7 — Content is stub only for weeks 2–16 (MLOps) and 1–8 (Rust)
Current: All weeks except MLOps Week 1 are generated via `buildOutlineWeek()` which produces generic placeholder content.  
Fix: Replace every `buildOutlineWeek()` call with fully authored `LearningWeek` objects that have: real `narrative`, real `quiz`, real `labs`, real `reflectionPrompts`, real `references`, real `deliverables`.

---

## 2. LAYOUT & UX SPECIFICATION

### 2.1 Workspace Layout (3-column)

```
┌──────────┬─────────────────────────┬──────────────────────────────────────────┐
│ Sidebar  │   Guide / Content Panel  │          IDE Workspace                   │
│ (toggle) │   (collapsible, 30%)     │   (fills remaining space, min 50%)       │
│          │                          │                                          │
│ Week nav │  [Guide] [Notes] [Quiz]  │  ┌──────────────────────────────────┐   │
│ with     │  [Reflection] [Checks]   │  │  Tab bar (file tabs)              │   │
│ progress │                          │  ├──────────────────────────────────┤   │
│ dots     │  Narrative / Lab         │  │                                   │   │
│          │  objective shown here    │  │   Monaco Editor                   │   │
│  [←] [→] │                          │  │                                   │   │
│  arrows  │  References at bottom    │  ├──────────────────────────────────┤   │
│          │                          │  │  Terminal / Output (resizable)    │   │
└──────────┴─────────────────────────┴──────────────────────────────────────────┘
```

### 2.2 Sidebar Collapse

- Add a `<button>` with a `‹` / `›` chevron at the top-right corner of the sidebar
- When collapsed: sidebar width = 0, button floats at left edge of content panel
- Animate with `transition-all duration-200`
- State: `const [sidebarCollapsed, setSidebarCollapsed] = useState(false)`
- Persist preference in localStorage key: `learning:sidebar:collapsed`

### 2.3 Guide Panel Contextual Auto-Switch

Logic (applied on module navigation):
```ts
useEffect(() => {
  if (currentLab) setSelectedTab('guide');       // coding lab → show instructions
  else if (module?.kind === 'weekend') setSelectedTab('checks'); // weekend → show checklist
  else setSelectedTab('guide');                   // default
}, [module?.id]);
```

Show a subtle indicator on each tab if it has unsaved/unchecked content (e.g., red dot on "checks" if tasks incomplete).

### 2.4 IDE Chrome — VS Code One Dark Pro Theme

Register this theme in `handleMonacoBeforeMount`:

```ts
monaco.editor.defineTheme('one-dark-pro', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c678dd' },
    { token: 'string', foreground: '98c379' },
    { token: 'number', foreground: 'd19a66' },
    { token: 'type', foreground: 'e5c07b' },
    { token: 'function', foreground: '61afef' },
    { token: 'variable', foreground: 'e06c75' },
    { token: 'operator', foreground: '56b6c2' },
    { token: 'delimiter', foreground: 'abb2bf' },
  ],
  colors: {
    'editor.background': '#282c34',
    'editor.foreground': '#abb2bf',
    'editor.lineHighlightBackground': '#2c313a',
    'editor.selectionBackground': '#3e4451',
    'editorCursor.foreground': '#528bff',
    'editorLineNumber.foreground': '#495162',
    'editorLineNumber.activeForeground': '#abb2bf',
    'editor.inactiveSelectionBackground': '#3a3f4b',
    'editorIndentGuide.background': '#3b4048',
    'editorIndentGuide.activeBackground': '#4b5263',
    'editorWidget.background': '#21252b',
    'editorSuggestWidget.background': '#21252b',
    'editorSuggestWidget.border': '#3e4452',
    'editorSuggestWidget.selectedBackground': '#2c313a',
    'tab.activeBackground': '#282c34',
    'tab.inactiveBackground': '#21252b',
    'tab.border': '#181a1f',
    'editorGroupHeader.tabsBackground': '#21252b',
    'sideBar.background': '#21252b',
    'sideBarSectionHeader.background': '#282c34',
    'statusBar.background': '#21252b',
    'titleBar.activeBackground': '#21252b',
    'activityBar.background': '#21252b',
    'activityBarBadge.background': '#528bff',
    'terminal.background': '#282c34',
    'terminal.foreground': '#abb2bf',
    'terminal.ansiGreen': '#98c379',
    'terminal.ansiRed': '#e06c75',
    'terminal.ansiYellow': '#e5c07b',
    'terminal.ansiBlue': '#61afef',
    'terminal.ansiMagenta': '#c678dd',
    'terminal.ansiCyan': '#56b6c2',
  },
});
```

Set `theme="one-dark-pro"` on the Monaco Editor.

### 2.5 File Tree with Icons

Replace the plain file list with a VS Code-like tree. Add icons per file extension:
- `.py` → snake emoji or Python icon (SVG)
- `.rs` → gear icon (Rust)
- `.md` → document icon
- `.toml` → settings icon
- `.dockerfile` / no extension → container icon

Add a `+` new file button (for project mode only — adds a blank file to the workspace).

### 2.6 Terminal Improvements

- Make the terminal panel vertically resizable via a drag handle
- Use `font-family: 'JetBrains Mono', monospace` inside the terminal pre
- Colorize output: lines starting with `❌` or `Error` → red, `✅` or `SUCCESS` → green, `ALERT` → yellow
- Add a `⏱ Ran in Xms` timestamp at the end of each run

### 2.7 Export Fix — Zip Download

Install `fflate` (`npm install fflate`):

```ts
import { strToU8, zipSync } from 'fflate';

function downloadWorkspaceAsZip() {
  const fileMap: Record<string, Uint8Array> = {};
  for (const file of workspaceFiles) {
    fileMap[file.path] = strToU8(file.content);
  }
  const zipped = zipSync(fileMap);
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = projectTemplate?.slug ?? `${course.slug}-workspace`;
  anchor.download += '.zip';
  anchor.click();
  URL.revokeObjectURL(url);
}
```

Change the "Export" button to call `downloadWorkspaceAsZip()`. The zip will contain real files at their real paths (e.g., `src/train.py`, `Dockerfile`, etc.).

---

## 3. CONTENT SPECIFICATION

### 3.1 Content Architecture

Each `LearningWeek` must have:
- `narrative`: minimum 600-word professor-style explanation targeted at a senior backend dev with no ML background
- `quiz`: minimum 1 question per day module, 3 options, with explanation
- `labs`: at least 1 Python or Rust coding lab per day (with `files`, `hints`, `validation`, `solution`)
- `reflectionPrompts`: 2 prompts per module, designed to force operational thinking
- `references`: books, papers, blog posts with `required: true` for essential ones
- `deliverables`: explicit, measurable outputs

### 3.2 MLOps Course — Week-by-Week Content Requirements

**Week 1 (already complete)**: Keep as-is. Day 1 and Day 2 have full content. Days 3–5 and weekend need full narrative upgrades.

**Day 3 — Rules of ML** (needs full content):
- Narrative: Explain Google's Rules of ML through the lens of "what breaks if you ignore them". Frame each rule as an operational decision. Explain Rule #1 (don't use ML when heuristics work) through the lens of a backend engineer who might over-engineer solutions.
- Lab: Write a Python function `evaluate_baseline(predictions, labels)` that computes accuracy and returns whether a heuristic (>80% accuracy with a simple rule) beats an ML model. Target output: "HEURISTIC WINS"
- Quiz: "When should you NOT use ML?" with options
- References: Rules of ML paper (required), Chip Huyen Ch 1 

**Day 4 — System Thinking** (needs full content):
- Narrative: Walk through the full ML system diagram stage-by-stage. For each stage: what enters, what can go stale, what contract is needed. Use backend analogies (data → API request contract, feature store → database schema migration risk).
- Lab: Write a Python `SystemHealthCheck` class that validates 5 system assumptions (data freshness, model version match, serving schema match, etc.). Target: "ALL CHECKS PASSED"
- No coding required, but a markdown/diagram-as-text exercise

**Day 5 — Project Setup** (needs full content):
- Narrative: Explain the ml-system-basics project structure, why each file exists, what the Saturday/Sunday build will produce
- Lab: The project workspace (ml-system-basics) is the deliverable — open it and add the training script skeleton
- This day should auto-redirect users to the project workspace

**Saturday/Sunday Weekends**: 
- Narrative: Detailed block-by-block instructions. Each Block (1-4) gets a paragraph explaining WHAT to build, WHY the design choice was made, and WHAT failure to watch out for
- Labs: Weekend modules use the persistent project workspace, not isolated lab files
- Checklist: Each block has checkboxes in the `tasks` array

---

**Week 2 — Reproducibility and Experimentation**

Full content required for every day:

_Day 1 (Mon)_: 
- Concept: What is determinism in ML? Why is `random_seed=42` not enough?
- Narrative: Walk through all sources of non-determinism (GPU floating-point order, Python dict ordering pre-3.7, dataloader shuffle, CUDA kernel selection). Explain model lineage: like Git for models but harder.
- Lab: Write a `ReproducibilityChecker` in Python that hashes a dataset, records the seed, and checks if two training runs produce the same accuracy within ε. Target: "REPRODUCIBILITY VERIFIED"
- References: MLflow docs, DVC docs, Chip Huyen Ch 4

_Day 2 (Tue)_:
- Concept: Experiment tracking internals — what MLflow actually stores and how
- Narrative: Explain the experiment → run → artifact → metric hierarchy. Compare to a database schema. Show what happens when you have 200 experiments and no tracking.
- Lab: Simulate MLflow logging by writing a `TrackingClient` class in Python that saves metrics and params to a local dict and can compare two "runs". Target: output showing run comparison

_Day 3 (Wed)_:
- Concept: Data versioning — why you can't just Git the data
- Narrative: Explain DVC's approach (content-addressable storage, `.dvc` pointer files). Compare to Git LFS. Explain when you need it (>1MB datasets, when data changes independent of code).
- Lab: Write a `DataVersioner` that computes a deterministic SHA256 hash of a dataset dict and detects when the dataset changed. Target: "DATASET VERSION MISMATCH DETECTED"

_Day 4 (Thu)_:
- Concept: Config-driven training — why hardcoded values kill reproducibility
- Narrative: Explain 12-factor app config principles applied to ML. Show how `dataclasses` + YAML configs work. Explain the difference between hyperparameters (tuned), system config (infrastructure), and experiment config (one-time).
- Lab: Refactor a training script to use a `TrainingConfig` dataclass. Target: "CONFIG LOADED AND VALIDATED"

_Day 5 (Fri)_: 
- Concept: Project integration — connecting tracking to the ml-system-basics project
- Lab: Add config tracking stubs to the project workspace

Weekend:
- Saturday: Add MLflow-style tracking to ml-system-basics (or manual tracking if MLflow not available in Pyodide)
- Sunday: Write "Why Reproducibility is a First-Class Engineering Concern"

---

**Week 3 — Pipelines and Orchestration**

_Day 1 (Mon)_:
- Concept: What is a DAG? Why is it the right abstraction for data pipelines?
- Narrative: Explain DAG (Directed Acyclic Graph) from first principles — compare to a Makefile, to an event-sourced system, to a microservice dependency graph. Explain why acyclic is critical (no circular dependencies = reproducible reruns). Use Airflow's architecture as the canonical example.
- Lab: Write a mini `DAGRunner` in Python that takes a dict of tasks with dependencies and runs them in topological order. Target: output showing correct execution order

_Day 2 (Tue)_:
- Concept: Idempotency — why pipeline tasks must produce the same output when run twice
- Narrative: Explain idempotency from the HTTP spec (PUT vs POST), then apply to ML pipelines. Show the `if output_exists: skip` pattern. Explain why idempotent pipelines are the only ones safe to retry.
- Lab: Write an idempotent `FeatureExtractor` class that checks if output already exists before recomputing. Target: "SKIPPED: output already exists"

_Day 3 (Wed)_:
- Concept: Failure recovery and retry logic
- Narrative: Explain exponential backoff, dead letter queues, and checkpointing in ML context. Show how a corrupted intermediate artifact can cascade.
- Lab: Write a `RetryableTask` decorator that retries a failing function up to N times with delay. Target: "Task succeeded after 3 retries"

_Day 4 (Thu)_:
- Concept: Event-driven vs scheduled pipelines
- Narrative: Compare cron-triggered (e.g., daily retraining) vs event-triggered (e.g., "retrain when new data arrives"). Explain why event-driven requires more infrastructure (message queues) but scales better.
- Lab: Simulate an event-driven pipeline trigger using a Python queue (use `collections.deque`). Target: "PIPELINE TRIGGERED by data_arrived event"

_Day 5 (Fri)_:
- Setup the pipeline project workspace: `ml-pipeline-system`

Weekend build: A full ingestion → validation → training → evaluation → deploy (stub) pipeline with retry logic and DAG execution

---

**Week 4 — Data Engineering for ML**

Full content following the same pattern:
- Feature stores: what they are, why a database isn't enough (freshness SLAs, point-in-time correctness)
- Schema evolution: the ML equivalent of database migrations
- Data quality: Great Expectations-style assertions
- Feature consistency: training vs serving feature computation must be identical

Labs:
- Write a `FeatureStore` class that enforces TTL (time-to-live) on features
- Write a `SchemaValidator` that detects breaking schema changes
- Write a `DataQualityPipeline` that runs assertions on a dataset

---

**Week 5 — Deployment and Serving**

Deep content on:
- Latency vs throughput tradeoff (explain with queuing theory — Little's Law)
- Stateless serving (why it's required for horizontal scaling)
- Canary deployments in ML: the shadow mode pattern
- Model serialization: why ONNX exists, what TorchScript does, when to use each

Labs:
- Write a `BatchPredictor` that simulates batching requests for efficiency
- Write a `CanaryRouter` that routes X% of traffic to new model
- Load test simulation using Python `time.perf_counter`

---

**Week 6 — Distributed Systems Basics**

Bridge lesson connecting backend knowledge to ML infra:
- CAP theorem applied: why your feature store can't be both consistent and available during a network partition
- Message queues: Kafka as the nervous system of distributed ML pipelines
- RPC: how Triton Inference Server uses gRPC under the hood

Labs:
- Simulate a distributed key-value store with consistency guarantees
- Write a `MessageQueue` class with producer/consumer pattern
- Write an RPC-style request/response simulation

---

**Weeks 7–10 (Distributed Training, GPU, LLM, Principal)**: 
Follow the same pattern. Each week needs the full treatment. Content becomes progressively more advanced. Week 9 (LLM inference) should include a deep dive on:
- The token generation loop (autoregressive decoding)
- KV cache: what it is, why it exists, memory implications
- PagedAttention (vLLM's innovation): compare to virtual memory paging in OS
- Continuous batching vs static batching

Week 10 (Principal-level): Focus on:
- How to write an architecture review memo
- How to evaluate build vs buy decisions
- How to design platform roadmaps
- Platform reliability: SLOs for ML systems

---

### 3.3 Rust ML Course — Full Content for All 8 Weeks

**Teaching approach**: Map every Rust concept to a system or backend concept the user already understands.

**Week 1 — Rust Fundamentals**:

_Day 1 (Mon)_:
- Concept: Why Rust exists for ML infra — the niche between Python (ergonomic but slow) and C++ (fast but unsafe)
- Narrative: Explain ownership as a compile-time borrow checker. Use the analogy: it's like a code reviewer that prevents use-after-free, data races, and double frees at compile time instead of runtime. A senior backend dev analogy: it's like TypeScript's null checking but for memory.
- Lab: Write a Rust function `fn summarize(values: &[f64]) -> f64` that computes the mean. Target: the function compiles and produces the right output. Teach: slices, references, ownership basics.

_Day 2 (Tue)_:
- Concept: Ownership transfer vs borrowing
- Narrative: Use the analogy of passing a `Box<T>` vs a `&T`. If you give away a box (move), you can't use it again. If you lend it (borrow), you get it back. The compiler enforces the lending rules so two borrowers can't both think they own it.
- Lab: Write a function that takes ownership and one that borrows. Show the compiler error when you try to use a moved value.

_Day 3 (Wed)_:
- Concept: `Result<T, E>` and the `?` operator
- Narrative: Compare to Go's `err, val := fn()` pattern. Explain why `panic!` is the wrong answer for production infra. Show `?` as syntactic sugar for `match result { Ok(v) => v, Err(e) => return Err(e) }`.
- Lab: Write a file parser that returns `Result<Vec<f64>, String>` and uses `?` throughout. Target: parse a CSV-like string and return parsed floats.

_Day 4 (Thu)_:
- Concept: Structs, impl blocks, and trait basics
- Narrative: Compare structs to Python dataclasses. Explain how `impl Struct` is like defining methods on a class. Introduce `Display` trait as the Rust equivalent of `__str__`.
- Lab: Write a `Dataset` struct with an `impl` that has a `summary()` method. Target: print dataset stats using `{:?}` debug formatting.

_Day 5 (Fri)_:
- Setup the `rust-ml-cli` project workspace

**Week 2 — Ownership and Memory**:
- Deep dive on lifetimes
- Stack vs heap allocation
- `Vec<T>` vs slices
- Lab: Write a data processing pipeline using owned vs borrowed paths, compare memory behavior

**Weeks 3–8**: Follow the full learning arc through error handling, concurrency, serialization, Python/Rust interop (pyo3), high-performance serving, and packaging.

---

## 4. SUPABASE — NEW TABLE: `learning_sessions`

### SQL Migration

Create file: `supabase/migrations/20260426000000_learning_sessions.sql`

```sql
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_label TEXT,  -- "Chrome on Mac", "Safari on iPhone", etc.
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, ip_address, user_agent)
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.learning_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);
```

### API Route: `src/app/api/learning/session/route.ts`

```ts
// POST /api/learning/session
// Body: { courseSlug: string, deviceLabel: string }
// Action: upsert session row with IP from headers

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !supabase) {
    return NextResponse.json({ ok: false });
  }

  const body = await request.json();
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const userAgent = request.headers.get('user-agent') ?? 'unknown';

  await supabase.from('learning_sessions').upsert({
    user_id: session.user.id,
    course_slug: body.courseSlug,
    ip_address: ip.split(',')[0].trim(),
    user_agent: userAgent,
    device_label: body.deviceLabel,
    last_active_at: new Date().toISOString(),
  }, { onConflict: 'user_id,course_slug,ip_address,user_agent' });

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !supabase) {
    return NextResponse.json({ sessions: [] });
  }

  const url = new URL(request.url);
  const courseSlug = url.searchParams.get('courseSlug');
  if (!courseSlug) return NextResponse.json({ sessions: [] });

  const { data } = await supabase
    .from('learning_sessions')
    .select('id,ip_address,device_label,last_active_at,created_at')
    .eq('user_id', session.user.id)
    .eq('course_slug', courseSlug)
    .order('last_active_at', { ascending: false });

  return NextResponse.json({ sessions: data ?? [] });
}
```

### Client-side session ping

In `LearningWorkspaceClient.tsx`, on mount, ping the session endpoint:

```ts
useEffect(() => {
  const deviceLabel = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android') 
    ? 'Mobile' 
    : `${getBrowserName()} on ${getOSName()}`;
  
  fetch('/api/learning/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseSlug: course.slug, deviceLabel }),
  }).catch(() => {});
}, [course.slug]);
```

Show sessions in the workspace header as small dots: "● Mac · ● iPhone · ● Work PC" (pulled from GET /api/learning/session).

---

## 5. FILE-BY-FILE CHANGES

### 5.1 `src/features/learning/components/LearningWorkspaceClient.tsx`

**Changes required:**
1. Add collapsible sidebar state + toggle button
2. Add One Dark Pro Monaco theme registration
3. Change Export to use fflate zip
4. Add session ping on mount
5. Add context-aware tab auto-switch
6. Rename "Open Project" to "Project Workspace →" with tooltip
7. Add resizable terminal panel (use a `resize` handle)
8. Add ANSI color classes to terminal output
9. Add file icons to the file tree
10. Add "new file" button in project mode
11. Use `activeFile.solution` reveal button only when not in project mode

**Key state additions:**
```ts
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [terminalHeight, setTerminalHeight] = useState(200);
const [sessions, setSessions] = useState<SessionRow[]>([]);
```

### 5.2 `src/features/learning/data/catalog.ts`

**All `buildOutlineWeek()` calls must be replaced** with fully authored `LearningWeek` objects.

The file will grow significantly (target: ~5000–8000 lines). This is acceptable; it's static data.

Structure template for each week's day:
```ts
{
  id: 'mlops-week-N-day-D',
  slug: 'day-N',
  kind: 'day',
  title: 'Day N — [Topic]',
  durationLabel: '2 hours',
  schedule: [
    '0:00–1:00 [Reading block description]',
    '1:00–1:45 [Notes/coding block description]',
    '1:45–2:00 [Reflection block description]',
  ],
  summary: '[2–3 sentence summary]',
  narrative: `[Full professor-style markdown explanation, 600+ words]`,
  outcomes: ['...', '...', '...'],
  tasks: [
    { id: 'wNdD-read', label: '...', type: 'reading', required: true },
    { id: 'wNdD-notes', label: '...', type: 'notes', required: true },
    { id: 'wNdD-lab', label: '...', type: 'coding', required: true },
    { id: 'wNdD-reflect', label: '...', type: 'reflection', required: true },
  ],
  quiz: [{ id: 'wNdD-q1', prompt: '...', options: ['...', '...', '...'], answer: '...', explanation: '...' }],
  labs: [{
    id: '[unique-lab-id]',
    title: 'Lab — [Title]',
    objective: '[What the student will build and why it matters]',
    language: 'python',
    files: [
      { path: 'main.py', language: 'python', readOnly: true, content: `...` },
      { path: '[module].py', language: 'python', content: `...`, solution: `...` },
    ],
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    validation: {
      mode: 'python_output',
      target: '[exact string the correct solution prints]',
      successMessage: '[confirmation message showing the student got it]',
    },
  }],
  reflectionPrompts: ['[Operational/critical thinking question 1]', '[Question 2]'],
  deliverables: ['[Measurable output 1]', '[Measurable output 2]'],
  references: [
    { title: '[Title]', author: '[Author]', kind: 'paper' | 'book' | 'blog' | 'docs', required: true | false },
  ],
}
```

### 5.3 New file: `src/features/learning/components/FileIcon.tsx`

```tsx
export function FileIcon({ path }: { path: string }) {
  const ext = path.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    py: '🐍', rs: '⚙️', md: '📄', toml: '🔧', txt: '📝',
    json: '{}', dockerfile: '🐳',
  };
  const name = path.includes('Dockerfile') ? 'dockerfile' : ext ?? '';
  return <span className="mr-1.5 text-xs">{icons[name] ?? '📄'}</span>;
}
```

### 5.4 `src/app/learning/[courseSlug]/[weekSlug]/[moduleSlug]/page.tsx`

Add `export const dynamic = 'force-dynamic'` to ensure fresh data on each load. The page passes `initialState` from `getInitialLearningState()` which requires authentication.

### 5.5 New migration file: `supabase/migrations/20260426000000_learning_sessions.sql`

Content as specified in Section 4.

---

## 6. URL STRUCTURE VERIFICATION

Current routing already supports the target URLs:
- `/learning/mlops` → course home (slugs match `mlopsCourse.slug = 'mlops'`) ✓
- `/learning/rust-ml` → course home (slugs match `rustMlCourse.slug = 'rust-ml'`) ✓
- `/learning/mlops/week-1/day-1` → module workspace ✓
- `/learning/mlops/projects/ml-system-basics` → project workspace ✓
- `/learning/rust-ml/week-1/day-1` → Rust module workspace ✓
- `/learning/rust-ml/projects/rust-ml-cli` → Rust project workspace ✓

No routing changes needed. Just ensure the course landing pages (`CourseHome.tsx`, `WeekOverview.tsx`) link to the correct first module.

---

## 7. INTELLISENSE EXPANSION

The current Monaco setup has 2 Python snippets (`ifmain`, `dataclass`) and 2 Rust snippets (`result_main`, `match`). This needs to be significantly expanded.

### Python — add to `registerCompletionItemProvider('python', ...)`:

```ts
// MLOps-specific snippets
{ label: 'validate_payload', detail: 'ML data validation function', insertText: 'def validate_payload(raw_data: dict) -> dict:\n    ${1:pass}\n    return raw_data' },
{ label: 'detect_drift', detail: 'Mean drift detector', insertText: 'def detect_drift(batch: list[float], baseline: float, threshold: float) -> str:\n    mean = sum(batch) / len(batch)\n    if abs(mean - baseline) > threshold:\n        return "ALERT: drift detected"\n    return "OK: stable"' },
{ label: 'train_model', detail: 'sklearn training boilerplate', insertText: 'from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = LogisticRegression(max_iter=200)\nmodel.fit(X_train, y_train)' },
{ label: 'fastapi_app', detail: 'FastAPI app boilerplate', insertText: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass PredictRequest(BaseModel):\n    ${1:features}: list[float]\n\n@app.post("/predict")\ndef predict(payload: PredictRequest):\n    return {"prediction": ${2:None}}' },
{ label: 'dataclass_config', detail: 'Frozen config dataclass', insertText: 'from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Config:\n    ${1:field}: ${2:str} = ${3:"default"}' },
{ label: 'sha256_hash', detail: 'SHA256 dataset hash', insertText: 'import hashlib\nimport json\n\ndef hash_dataset(data: dict) -> str:\n    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()' },
```

### Rust — add to `registerCompletionItemProvider('rust', ...)`:

```ts
{ label: 'struct_impl', detail: 'Struct with impl block', insertText: 'struct ${1:Name} {\n    ${2:field}: ${3:f64},\n}\n\nimpl ${1:Name} {\n    fn new(${2:field}: ${3:f64}) -> Self {\n        Self { ${2:field} }\n    }\n}' },
{ label: 'result_fn', detail: 'Function returning Result', insertText: 'fn ${1:name}(${2:}) -> Result<${3:()}, Box<dyn std::error::Error>> {\n    ${4:todo!()}\n}' },
{ label: 'vec_mean', detail: 'Compute mean of Vec<f64>', insertText: 'let mean = values.iter().sum::<f64>() / values.len() as f64;' },
{ label: 'enum_error', detail: 'Custom error enum', insertText: '#[derive(Debug)]\nenum ${1:AppError} {\n    ${2:ParseError}(String),\n    ${3:IoError}(std::io::Error),\n}\n\nimpl std::fmt::Display for ${1:AppError} {\n    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {\n        match self {\n            ${1:AppError}::${2:ParseError}(msg) => write!(f, "Parse error: {}", msg),\n            ${1:AppError}::${3:IoError}(e) => write!(f, "IO error: {}", e),\n        }\n    }\n}' },
```

---

## 8. WEEKLY BRIEFING SYSTEM

### Concept
Each course has a `briefings: WeeklyBriefing[]` array. Currently only one stub entry exists per course.

### Enhancement
Add a "This Week's Field Report" section at the top of each course's week overview page. The briefing should:
- Be shown only for the current/most recent week
- Include 3–5 bullets on what happened in ML/Rust this week relevant to the course topic
- Include a "Generated" timestamp and note that content can be refreshed by the user asking Claude/Gemini to "generate this week's briefing for MLOps"

This is NOT auto-generated — it's manually authored per week. The user can ask Claude/Gemini to generate a new one by saying "generate this week's content" and the AI adds a new entry to `briefings[]`.

Add a `WeeklyBriefingBanner` component to `WeekOverview.tsx` that renders the latest briefing.

---

## 9. PROGRESS TRACKING UX

### Current state
Progress is tracked via `taskProgress` record in `LearningStatePayload`. No visual progress bar exists on the sidebar nav.

### Enhancement

1. **Week-level progress bar** in the sidebar nav: show a small progress bar under each week showing `completedTasks / totalTasks * 100%`
2. **Module-level dot indicators**: Green dot = all tasks complete, Yellow dot = in progress, Gray dot = not started
3. **Course-level completion** at the top of the sidebar: "Week 1 complete · Week 2 in progress · Week 3 locked"
4. **Locked modules** stay visually dimmed until previous module is complete (soft lock — can still navigate but visually discouraged)

These require computing progress from `learningState.taskProgress` on the client. No backend changes needed.

---

## 10. DEPLOYMENT CHECKLIST

### Vercel deployment
The project deploys to Vercel. The following env vars must be set:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` = `https://learning.babalola.dev` (or the subdomain it's deployed to)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase migrations
Run the new migration via the Supabase CLI or dashboard SQL editor:
```
supabase/migrations/20260426000000_learning_sessions.sql
```

### `fflate` package
```
npm install fflate
```

---

## 11. IMPLEMENTATION ORDER (for Gemini)

Execute in this order to avoid breaking the existing working state:

1. **Add `fflate` dependency** and fix the export function (isolated, no side effects)
2. **Add the One Dark Pro Monaco theme** (isolated, CSS-only change)
3. **Add `FileIcon` component** (new file, no existing code broken)
4. **Add collapsible sidebar toggle** to `LearningWorkspaceClient.tsx`
5. **Add context-aware tab auto-switch** to `LearningWorkspaceClient.tsx`
6. **Rename "Open Project"** to "Project Workspace →" in `LearningWorkspaceClient.tsx`
7. **Expand Monaco intellisense** snippets (add to existing `handleMonacoBeforeMount`)
8. **Add terminal resizing** (drag handle on terminal panel)
9. **Add terminal ANSI colorization**
10. **Create `learning_sessions` SQL migration**
11. **Create `/api/learning/session` route**
12. **Add session ping + session display** in workspace header
13. **Add week/module progress indicators** to sidebar nav
14. **Replace MLOps Week 1 Days 3–5 stub content** with full authored content
15. **Author full content for MLOps Weeks 2–10** (largest task)
16. **Author full content for Rust Weeks 1–8**
17. **Test all labs end-to-end** using Pyodide
18. **Deploy to Vercel and run Supabase migration**

---

## 12. CONTENT QUALITY STANDARDS

Every piece of course content must meet these standards:

### Narrative quality
- Minimum 600 words per module narrative
- Every concept explained in 2 layers: (1) abstract definition, (2) concrete production example
- Every concept mapped to a backend engineering analogy the user already understands
- Every section ends with "The Principal-Level Takeaway" — what this means at the engineering decision-making level, not just implementation
- Current field awareness: include a "Trending in 2026" callout per day that connects the day's topic to current developments (LLMOps, AgentOps, vLLM, etc.)

### Lab quality
- Every lab must be completable in 15–30 minutes
- Every lab must have: a clear objective, 3 progressive hints (don't give away the answer), a clean solution, a specific output to match for validation
- Labs use Pyodide-compatible Python (no pip installs of unavailable packages). Safe packages: `numpy`, `json`, `hashlib`, `collections`, `dataclasses`, `typing`, `math`, `functools`, `itertools`. Avoid `sklearn`, `mlflow`, `fastapi` in labs (they don't load in Pyodide)
- Rust labs cannot be executed in the browser — use `source_contains` validation mode for Rust files

### Quiz quality
- Every quiz question tests understanding, not memorization
- 3 options (avoid 4 — keeps it focused)
- The explanation must explain WHY the wrong answers are wrong, not just why the right one is right

### References quality
- At least one `required: true` reference per module
- Include exact chapter ranges for books (e.g., "Designing Machine Learning Systems, Ch 1–3")
- Include arXiv IDs or URLs for papers where possible
- Mix: papers, books, blog posts, official docs

---

## 13. OPEN QUESTIONS / DECISIONS FOR GEMINI

1. **Pyodide numpy**: `numpy` is available in Pyodide v0.25.0 via `await pyodide.loadPackage('numpy')`. Labs that need numpy should call `loadPackage` before running. Add this to the `runPython` function.

2. **Rust execution**: Rust cannot run in the browser. For Rust labs, use `source_contains` validation only. Consider adding a note in the UI: "Rust code validates structure — run locally with `cargo run` for full execution."

3. **Project download format**: The zip export should name the root folder after the project slug (e.g., `ml-system-basics/src/train.py`). This makes it immediately usable as a local project.

4. **Content generation cadence**: The weekly briefing system means the user will periodically ask for new content. The architecture supports this (just add a new `WeeklyBriefing` object to the array). Consider adding a "Request this week's field report" button that opens a pre-filled prompt for the user to copy to Claude/Gemini.

5. **Sidebar persistence**: When the user collapses the sidebar, save to `localStorage('learning:sidebar:collapsed')`. Restore on mount.

---

## APPENDIX: Existing Tables Reference

```
learning_user_task_progress (id, user_id, course_slug, task_id, status)
learning_notes              (id, user_id, course_slug, module_id, note_type, content)  
learning_submissions        (id, user_id, course_slug, module_id, submission_type, answer_json, status, score)
learning_projects           (id, user_id, course_slug, slug, title, language)
learning_project_files      (id, project_id, user_id, course_slug, path, content)
learning_sessions           (id, user_id, course_slug, ip_address, user_agent, device_label, last_active_at)  ← NEW
```

All tables have RLS enabled. Service role key used in server-side routes only.
