import type { LearningWeek } from '@/features/learning/types';

export const rustWeek1: LearningWeek = {
  id: 'rust-week-1',
  slug: 'week-1',
  title: 'Week 1 — Rust Fundamentals for Backend Engineers',
  theme: 'Map Rust ownership and explicit state to systems you already understand.',
  summary:
    'This week reframes Rust for the experienced backend engineer. Ownership is not a language quirk; it is a formalization of the resource-lifetime discipline you already practise informally in Python and Go. By Sunday you will have working mental models and a runnable CLI.',
  commitment: '2 hours on weekdays, 6-8 hours each weekend day',
  outputs: [
    'Rust toolchain installed and working',
    'rust-ml-cli project skeleton',
    'Ownership and borrowing mental model journal entry',
    'Essay: Why Rust Ownership is Just Explicit Resource Management',
  ],
  modules: [
    {
      id: 'rust-week-1-day-1',
      slug: 'day-1',
      kind: 'day',
      title: 'Monday — Rust Toolchain, Cargo, and the Ownership Mental Model',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Read: The Rust Book Chapter 1-2 (install, Hello World, cargo basics)',
        '1:00–1:45 Lab: write a type-safe numeric batch summarizer',
        '1:45–2:00 Reflection: what does "ownership" mean before you read a definition?',
      ],
      summary:
        'Day 1 gets the toolchain working and plants the ownership seed. The key insight is that Rust makes the implicit explicit: every value has exactly one owner, and the compiler enforces that.',
      narrative: `# Monday — Toolchain, Cargo, and the First Mental Model

You already know how memory behaves. Python uses reference counting plus a garbage collector. Go uses a tracing GC. C requires you to manage it manually. Rust takes the fourth path: it enforces correct ownership at compile time, with zero runtime overhead.

## Why this matters for ML infra

Your typical ML serving system makes hot-path decisions under tight latency budgets. The GC pause you never noticed at p50 will show up at p99 when the model is loaded and traffic spikes. Rust removes that risk category entirely.

## The ownership axiom

Every value in Rust has exactly one owner. When that owner goes out of scope, the value is dropped. No GC, no reference counting, no dangling pointers.

\`\`\`rust
fn main() {
    let s = String::from("payload");  // s owns the heap string
    process(s);                        // ownership moves to process()
    // println!("{}", s);             // compile error: s was moved
}

fn process(data: String) {
    println!("processing: {}", data);
}   // data drops here — heap memory freed
\`\`\`

## Backend framing

In Python, when you pass a dict to a function, you pass a reference. The dict is still live. In Rust, passing a \`String\` moves ownership. The caller can no longer use it. This sounds restrictive. The payoff is that the compiler guarantees you never have two live references to mutable state — the root cause of a wide class of concurrency bugs.

## Cargo: the build tool you already wanted

\`\`\`bash
cargo new rust-ml-cli    # creates project with src/main.rs + Cargo.toml
cargo build              # compile
cargo run                # compile + run
cargo check              # typecheck only — fast iteration loop
\`\`\`

Cargo is to Rust what \`npm\` is to Node but without version conflicts and with deterministic builds by default.

## Day 1 lab

You will write a function that takes a slice of \`f64\` values and returns their mean. The borrow checker will force you to think about whether you own the data or borrow it.
`,
      outcomes: [
        'Cargo installed and first project compiles.',
        'Understand the single-owner axiom.',
        'Write a working function using slices and iterators.',
      ],
      tasks: [
        { id: 'rust-w1d1-install', label: 'Install Rust via rustup and verify with `rustc --version`.', type: 'reading', required: true },
        { id: 'rust-w1d1-read', label: 'Read The Rust Book Chapters 1-2.', type: 'reading', required: true },
        { id: 'rust-w1d1-lab', label: 'Complete the batch summarizer lab.', type: 'coding', required: true },
        { id: 'rust-w1d1-reflect', label: 'Write your first ownership reflection.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'rust-w1d1-q1',
          prompt: 'What happens when you pass a String to a function in Rust without a reference?',
          options: [
            'Ownership moves into the function; the caller can no longer use the String',
            'A reference-counted pointer is shared automatically',
            'The String is cloned and both the caller and function have a copy',
          ],
          answer: 'Ownership moves into the function; the caller can no longer use the String',
          explanation:
            'Rust moves ownership by default. To lend without moving, you pass a reference (&String or &str). This is compile-time-enforced and has no runtime cost.',
        },
      ],
      labs: [
        {
          id: 'rust-batch-summarizer-lab',
          title: 'Lab — Batch Statistics (Rust)',
          objective:
            'Write a function that borrows a slice of f64 values and computes mean, min, and max without taking ownership of the data.',
          language: 'rust',
          files: [
            {
              path: 'src/main.rs',
              language: 'rust',
              readOnly: true,
              content: `mod stats;
use stats::summarize;

fn main() {
    let batch: Vec<f64> = vec![2.0, 4.0, 6.0, 8.0, 10.0];
    let (mean, min, max) = summarize(&batch);
    println!("mean={:.2} min={:.2} max={:.2}", mean, min, max);
    // batch is still usable here because we only borrowed it
    println!("batch length: {}", batch.len());
}
`,
            },
            {
              path: 'src/stats.rs',
              language: 'rust',
              content: `// Implement summarize: borrow a slice of f64, return (mean, min, max)
// Use: values.iter().sum::<f64>() for sum
// Use: values.iter().cloned().fold(f64::INFINITY, f64::min) for min
pub fn summarize(values: &[f64]) -> (f64, f64, f64) {
    // TODO: implement mean, min, max
    (0.0, 0.0, 0.0)
}
`,
              solution: `pub fn summarize(values: &[f64]) -> (f64, f64, f64) {
    let n = values.len() as f64;
    let mean = values.iter().sum::<f64>() / n;
    let min = values.iter().cloned().fold(f64::INFINITY, f64::min);
    let max = values.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    (mean, min, max)
}
`,
            },
          ],
          hints: [
            'Use `&[f64]` not `Vec<f64>` as the parameter type — a slice reference borrows without taking ownership.',
            '`values.iter().sum::<f64>()` sums the iterator. You need the turbofish `::<f64>` because Rust needs to know the accumulator type.',
            'For min/max: `f64::INFINITY` is safe as the initial fold value for min; `f64::NEG_INFINITY` for max.',
          ],
          validation: {
            mode: 'source_contains',
            patterns: ['&[f64]', 'iter()', 'sum::<f64>'],
            successMessage:
              'You borrowed the slice correctly and used iterator adapters. This is idiomatic Rust: no copies, no ownership transfer, guaranteed safe.',
          },
        },
      ],
      reflectionPrompts: [
        'Before reading the ownership definition: how did you manage resource lifetimes in Python or Go?',
        'What problem would ownership-at-compile-time have solved in a past project?',
      ],
      deliverables: ['Cargo project created', 'stats.rs lab complete', 'Reflection entry'],
      references: [
        { title: 'The Rust Book chapters 1-2', kind: 'docs', required: true },
        { title: 'Cargo docs', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-day-2',
      slug: 'day-2',
      kind: 'day',
      title: 'Tuesday — Ownership in Depth: Move, Clone, and Drop',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Read: The Rust Book Chapter 4 (ownership, moves, clones, drop)',
        '1:00–1:45 Lab: implement a value pipeline that moves data through stages',
        '1:45–2:00 Reflection: where in your current systems does data move versus get shared?',
      ],
      summary:
        'Move semantics are not a handicap; they are the mechanism Rust uses to make impossible states unrepresentable. Today you build the move-clone-drop reflex.',
      narrative: `# Tuesday — Ownership in Depth

Yesterday you saw the axiom. Today you live it.

## Move semantics under the hood

When you assign a \`String\` to another variable, Rust moves the heap data. The original variable becomes invalid. This is a compile-time operation — no memcpy, no refcount bump.

\`\`\`rust
let a = String::from("model-v1");
let b = a;          // ownership moves to b
println!("{}", a);  // COMPILE ERROR: value borrowed here after move
\`\`\`

## Why not just copy everything?

Heap data (String, Vec, HashMap) is expensive to copy. Rust is honest about that cost: you must call \`.clone()\` explicitly. Copy types (integers, floats, bool, fixed-size arrays) implement the \`Copy\` trait and are implicitly copied — they live on the stack.

\`\`\`rust
let x: f64 = 3.14;
let y = x;           // copy — both x and y are valid
println!("{} {}", x, y);  // works fine
\`\`\`

## Drop and RAII

When a variable goes out of scope, Rust calls \`drop\`. For a \`File\`, this closes the file handle. For a mutex guard, this releases the lock. No \`defer\` (Go), no \`finally\` (Python/Java), no \`defer/Drop\` ceremony. It is automatic and predictable.

## The backend engineer mental model

Think of it as: **owning a resource is the only time you can destroy or mutate it.** Every other access is a read-only loan (immutable reference) or a single exclusive loan (mutable reference). Sound familiar? It is the read/write lock protocol, enforced statically.

## Day 2 lab

You will write a simple data pipeline that moves a record through three stages: validation, enrichment, and serialization. Each stage takes ownership and returns a new (transformed) value.
`,
      outcomes: [
        'Distinguish Copy types from move types.',
        'Understand when to clone versus borrow.',
        'Design a value pipeline using move semantics.',
      ],
      tasks: [
        { id: 'rust-w1d2-read', label: 'Read The Rust Book Chapter 4 on ownership.', type: 'reading', required: true },
        { id: 'rust-w1d2-lab', label: 'Complete the value pipeline lab.', type: 'coding', required: true },
        { id: 'rust-w1d2-reflect', label: 'Write where move semantics would have helped you.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'rust-w1d2-q1',
          prompt: 'Why does Rust require explicit `.clone()` for heap data?',
          options: [
            'Because heap allocation is expensive and Rust wants to make that cost visible in code',
            'Because Rust does not support implicit memory management',
            'Because stack data is too small to clone',
          ],
          answer: 'Because heap allocation is expensive and Rust wants to make that cost visible in code',
          explanation:
            'Rust is honest about costs. A `.clone()` call is a signal in a code review: "this copies heap data." That explicitness is a feature, not a limitation.',
        },
      ],
      labs: [
        {
          id: 'rust-value-pipeline-lab',
          title: 'Lab — Value Pipeline (Move Semantics)',
          objective:
            'Build a three-stage pipeline where each stage consumes the input and returns a transformed version, demonstrating move semantics as a safe data-flow model.',
          language: 'rust',
          files: [
            {
              path: 'src/main.rs',
              language: 'rust',
              readOnly: true,
              content: `mod pipeline;
use pipeline::{RawRecord, validate, enrich, serialize};

fn main() {
    let raw = RawRecord {
        id: String::from("rec-001"),
        value: 42.0,
        label: None,
    };

    // Each function takes ownership and returns a new type
    let validated = validate(raw);
    let enriched  = enrich(validated);
    let output    = serialize(enriched);

    println!("{}", output);
}
`,
            },
            {
              path: 'src/pipeline.rs',
              language: 'rust',
              content: `pub struct RawRecord {
    pub id: String,
    pub value: f64,
    pub label: Option<String>,
}

pub struct ValidRecord {
    pub id: String,
    pub value: f64,
}

pub struct EnrichedRecord {
    pub id: String,
    pub value: f64,
    pub normalized: f64,
}

// Consume RawRecord, return ValidRecord (or panic on invalid)
pub fn validate(raw: RawRecord) -> ValidRecord {
    // TODO: assert raw.value >= 0.0 with panic!("negative value")
    // Return ValidRecord { id: raw.id, value: raw.value }
    ValidRecord { id: raw.id, value: raw.value }
}

// Consume ValidRecord, return EnrichedRecord
pub fn enrich(record: ValidRecord) -> EnrichedRecord {
    // TODO: set normalized = record.value / 100.0
    // Return EnrichedRecord { id, value, normalized }
    EnrichedRecord { id: record.id, value: record.value, normalized: 0.0 }
}

// Consume EnrichedRecord, return JSON-like String
pub fn serialize(record: EnrichedRecord) -> String {
    // TODO: return format!("{{\\"id\\":\\"{}\\",\\"value\\":{},\\"normalized\\":{}}}", ...)
    String::new()
}
`,
              solution: `pub struct RawRecord {
    pub id: String,
    pub value: f64,
    pub label: Option<String>,
}

pub struct ValidRecord {
    pub id: String,
    pub value: f64,
}

pub struct EnrichedRecord {
    pub id: String,
    pub value: f64,
    pub normalized: f64,
}

pub fn validate(raw: RawRecord) -> ValidRecord {
    assert!(raw.value >= 0.0, "negative value");
    ValidRecord { id: raw.id, value: raw.value }
}

pub fn enrich(record: ValidRecord) -> EnrichedRecord {
    let normalized = record.value / 100.0;
    EnrichedRecord { id: record.id, value: record.value, normalized }
}

pub fn serialize(record: EnrichedRecord) -> String {
    format!(
        "{{\"id\":\"{}\",\"value\":{},\"normalized\":{}}}",
        record.id, record.value, record.normalized
    )
}
`,
            },
          ],
          hints: [
            'Each function takes ownership of its input struct. That means the caller cannot use the old variable after calling the function.',
            'For the assertion: `assert!(raw.value >= 0.0, "negative value");` — the second argument is the panic message.',
            'For `serialize`, use `format!` with escaped braces: `{{` and `}}` produce literal `{` and `}` in the output.',
          ],
          validation: {
            mode: 'source_contains',
            patterns: ['validate(raw)', 'enrich(validated)', 'serialize(enriched)', 'format!'],
            successMessage:
              'Move semantics enforced at each stage. Each transform consumed its input and produced a new value — zero copies, zero shared mutable state.',
          },
        },
      ],
      reflectionPrompts: [
        'Where in your current Python or Go services does shared mutable state cause bugs that are hard to reproduce?',
        'Could move semantics have made those bugs impossible?',
      ],
      deliverables: ['Value pipeline lab complete', 'Reflection entry'],
      references: [
        { title: 'The Rust Book Chapter 4 — Ownership', kind: 'docs', required: true },
        { title: 'Rust by Example — ownership', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-day-3',
      slug: 'day-3',
      kind: 'day',
      title: 'Wednesday — Borrowing: Shared References and the Borrow Checker',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Read: The Rust Book Chapter 4 section 2 (references and borrowing)',
        '1:00–1:45 Lab: audit and fix a borrow-checker-failing module',
        '1:45–2:00 Reflection: how does the borrow checker map to read/write locks?',
      ],
      summary:
        'Borrowing is the mechanism that lets you inspect or use a value without taking ownership. The two rules — many shared references OR one exclusive mutable reference — are the borrow checker\'s entire contract.',
      narrative: `# Wednesday — References and the Borrow Checker

## The two rules

Rust enforces, at compile time, that at any given moment you either have:

- **any number of immutable references** (\`&T\`) — read-only loans, all valid simultaneously
- **exactly one mutable reference** (\`&mut T\`) — exclusive write access

This is the read/write lock protocol you already know from concurrent systems — except the Rust compiler enforces it statically, at zero runtime cost.

\`\`\`rust
fn main() {
    let mut data = vec![1.0, 2.0, 3.0];

    let r1 = &data;    // immutable borrow
    let r2 = &data;    // second immutable borrow — fine
    println!("{:?} {:?}", r1, r2);
    // r1 and r2 are no longer used after this point

    let r3 = &mut data;  // mutable borrow — OK because r1/r2 are gone
    r3.push(4.0);
}
\`\`\`

## Slices

A slice is a reference to a contiguous sequence in a collection. \`&str\` is a string slice. \`&[f64]\` is a float slice.

\`\`\`rust
fn mean(values: &[f64]) -> f64 {
    values.iter().sum::<f64>() / values.len() as f64
}

fn main() {
    let v = vec![1.0, 2.0, 3.0];
    let result = mean(&v);   // borrow v as a slice
    println!("{}", result);  // v still valid here
}
\`\`\`

## Why backend engineers love this

In Go, a goroutine can read from a channel while another writes to a shared map — and you will not find out until the race detector fires in staging. In Rust, that code does not compile. The borrow checker does not wait for a race condition.

## Day 3 lab

You will be given a module with several borrow-checker violations. Annotate each violation, fix it, and explain why each fix was the right one.
`,
      outcomes: [
        'Explain the two borrow rules from memory.',
        'Diagnose and fix common borrow-checker errors.',
        'Map the borrow model to concurrent read/write semantics.',
      ],
      tasks: [
        { id: 'rust-w1d3-read', label: 'Read Chapter 4 section 2 on references.', type: 'reading', required: true },
        { id: 'rust-w1d3-lab', label: 'Fix the borrow-checker module.', type: 'coding', required: true },
        { id: 'rust-w1d3-reflect', label: 'Write how borrow rules map to locks.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'rust-w1d3-q1',
          prompt: 'Which is true about Rust\'s borrow rules?',
          options: [
            'You can have many immutable references OR one mutable reference — never both at the same time',
            'You can have both a mutable and an immutable reference as long as they are in different functions',
            'Borrowing always copies the data to avoid conflicts',
          ],
          answer: 'You can have many immutable references OR one mutable reference — never both at the same time',
          explanation:
            'This is the core contract. It eliminates the entire class of read-write data races — at compile time.',
        },
      ],
      labs: [
        {
          id: 'rust-borrow-audit-lab',
          title: 'Lab — Borrow Checker Audit',
          objective:
            'Fix a Rust module with borrow-checker violations and add a working append function that mutably borrows a Vec.',
          language: 'rust',
          files: [
            {
              path: 'src/main.rs',
              language: 'rust',
              readOnly: true,
              content: `mod audit;
use audit::{inspect, append_threshold};

fn main() {
    let mut batch: Vec<f64> = vec![0.5, 1.2, 3.8, 0.9];

    let above = inspect(&batch);
    println!("values above 1.0: {:?}", above);

    append_threshold(&mut batch, 2.5);
    println!("batch after append: {:?}", batch);
}
`,
            },
            {
              path: 'src/audit.rs',
              language: 'rust',
              content: `// inspect: borrow a slice, return values above 1.0
pub fn inspect(values: &[f64]) -> Vec<f64> {
    // TODO: use values.iter().filter(|&&v| v > 1.0).cloned().collect()
    vec![]
}

// append_threshold: mutably borrow a Vec, push the threshold value
pub fn append_threshold(batch: &mut Vec<f64>, threshold: f64) {
    // TODO: batch.push(threshold)
}
`,
              solution: `pub fn inspect(values: &[f64]) -> Vec<f64> {
    values.iter().filter(|&&v| v > 1.0).cloned().collect()
}

pub fn append_threshold(batch: &mut Vec<f64>, threshold: f64) {
    batch.push(threshold);
}
`,
            },
          ],
          hints: [
            'For `inspect`: `values.iter()` yields `&&f64` inside the filter closure. The double reference `&&v` destructures both. `.cloned()` converts `&f64` to `f64`.',
            'For `append_threshold`: `batch.push(threshold)` — because you have `&mut Vec<f64>`, you can call mutating methods directly.',
            'The function signatures tell the story: `&[f64]` = read-only borrow, `&mut Vec<f64>` = exclusive write access.',
          ],
          validation: {
            mode: 'source_contains',
            patterns: ['&[f64]', '&mut Vec<f64>', '.filter(', '.push(threshold)'],
            successMessage:
              'Correct reference signatures. You are now reasoning about borrow vs. mutable borrow as intentional design decisions, not accidents.',
          },
        },
      ],
      reflectionPrompts: [
        'How does `&T` vs `&mut T` map to read-lock vs write-lock in a multi-threaded system?',
        'Name one place in a current project where a borrow checker would have prevented a bug.',
      ],
      deliverables: ['Borrow audit lab complete', 'Reflection entry'],
      references: [
        { title: 'The Rust Book Chapter 4.2 — References and Borrowing', kind: 'docs', required: true },
        { title: 'Rust by Example — borrowing', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-day-4',
      slug: 'day-4',
      kind: 'day',
      title: 'Thursday — Structs, Enums, and Pattern Matching',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Read: The Rust Book Chapters 5-6 (structs, enums, match)',
        '1:00–1:45 Lab: model a feature store record with enums and match',
        '1:45–2:00 Reflection: how do algebraic types change how you think about state?',
      ],
      summary:
        'Rust\'s enums are not C-style integer constants — they are algebraic data types that can carry values. Combined with `match`, they let you write exhaustive, impossible-to-forget-a-case logic that maps directly to state machine designs you already use in infra.',
      narrative: `# Thursday — Structs, Enums, and Pattern Matching

## Structs

Rust structs are familiar. If you can write a Python dataclass or a Go struct, you can write a Rust struct.

\`\`\`rust
#[derive(Debug)]
struct FeatureRecord {
    id:        String,
    value:     f64,
    timestamp: u64,
}
\`\`\`

\`#[derive(Debug)]\` is a macro that generates a debug formatter. Think of it as \`__repr__\` in Python.

## Enums as state machines

In Python or Go, you often use string constants or int codes to model state:

\`\`\`python
status = "stale"   # hope the caller remembers all valid states
\`\`\`

Rust enums are structural. Each variant can carry data:

\`\`\`rust
#[derive(Debug)]
enum FeatureStatus {
    Fresh,
    Stale { staleness_seconds: u64 },
    Missing(String),  // tuple variant with an error message
}
\`\`\`

## Pattern matching

\`match\` is exhaustive — the compiler refuses to compile code that does not handle every variant:

\`\`\`rust
fn describe(status: FeatureStatus) -> String {
    match status {
        FeatureStatus::Fresh => String::from("OK"),
        FeatureStatus::Stale { staleness_seconds } => {
            format!("stale by {}s", staleness_seconds)
        }
        FeatureStatus::Missing(reason) => {
            format!("missing: {}", reason)
        }
    }
}
\`\`\`

## Why this matters in ML infra

Feature stores have complex status semantics: fresh, stale, missing, expired, schema-mismatch. In Python, you model this with strings. You forget to handle one case. It reaches production. Rust enums make the missing case a compile error.

## Day 4 lab

You will model a feature store record with an enum status and use \`match\` to produce a human-readable summary.
`,
      outcomes: [
        'Define and use Rust structs with derive macros.',
        'Model state with enums that carry data.',
        'Write exhaustive match expressions.',
      ],
      tasks: [
        { id: 'rust-w1d4-read', label: 'Read Chapters 5-6 on structs and enums.', type: 'reading', required: true },
        { id: 'rust-w1d4-lab', label: 'Complete the feature store record lab.', type: 'coding', required: true },
        { id: 'rust-w1d4-reflect', label: 'Write how enums change state modeling.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'rust-w1d4-q1',
          prompt: 'What does exhaustive pattern matching mean in Rust?',
          options: [
            'The compiler requires you to handle every enum variant; missing branches cause a compile error',
            'Match expressions run all branches and return the last result',
            'Pattern matching is only for enums that have exactly two variants',
          ],
          answer: 'The compiler requires you to handle every enum variant; missing branches cause a compile error',
          explanation:
            'Exhaustiveness is enforced by the compiler. Adding a new variant to an enum forces every match site in the codebase to either handle it or use a wildcard. That is the state-machine discipline you want in infra code.',
        },
      ],
      labs: [
        {
          id: 'rust-feature-status-lab',
          title: 'Lab — Feature Store Status Enum',
          objective:
            'Model feature record status as a Rust enum and use match to produce a human-readable health summary.',
          language: 'rust',
          files: [
            {
              path: 'src/main.rs',
              language: 'rust',
              readOnly: true,
              content: `mod features;
use features::{FeatureRecord, FeatureStatus, summarize_record};

fn main() {
    let records = vec![
        FeatureRecord { id: String::from("feat-01"), value: 0.85, status: FeatureStatus::Fresh },
        FeatureRecord { id: String::from("feat-02"), value: 0.30, status: FeatureStatus::Stale { staleness_seconds: 3600 } },
        FeatureRecord { id: String::from("feat-03"), value: 0.00, status: FeatureStatus::Missing(String::from("upstream timeout")) },
    ];

    for record in &records {
        println!("{}", summarize_record(record));
    }
}
`,
            },
            {
              path: 'src/features.rs',
              language: 'rust',
              content: `#[derive(Debug)]
pub enum FeatureStatus {
    Fresh,
    Stale { staleness_seconds: u64 },
    Missing(String),
}

#[derive(Debug)]
pub struct FeatureRecord {
    pub id:     String,
    pub value:  f64,
    pub status: FeatureStatus,
}

// Return a human-readable summary string
// e.g. "feat-01 [OK] value=0.85"
// e.g. "feat-02 [STALE 3600s] value=0.30"
// e.g. "feat-03 [MISSING: upstream timeout] value=0.00"
pub fn summarize_record(record: &FeatureRecord) -> String {
    // TODO: match on record.status and return the appropriate string
    String::new()
}
`,
              solution: `#[derive(Debug)]
pub enum FeatureStatus {
    Fresh,
    Stale { staleness_seconds: u64 },
    Missing(String),
}

#[derive(Debug)]
pub struct FeatureRecord {
    pub id:     String,
    pub value:  f64,
    pub status: FeatureStatus,
}

pub fn summarize_record(record: &FeatureRecord) -> String {
    let status_str = match &record.status {
        FeatureStatus::Fresh => String::from("OK"),
        FeatureStatus::Stale { staleness_seconds } => format!("STALE {}s", staleness_seconds),
        FeatureStatus::Missing(reason) => format!("MISSING: {}", reason),
    };
    format!("{} [{}] value={:.2}", record.id, status_str, record.value)
}
`,
            },
          ],
          hints: [
            'Match on `&record.status` not `record.status` — you are borrowing the record so you must borrow its field too.',
            'For the `Stale` variant: `FeatureStatus::Stale { staleness_seconds }` destructures the struct variant to bind the inner value.',
            'For `Missing(reason)`: `reason` binds to the inner `String` reference. Use `format!("MISSING: {}", reason)`.',
          ],
          validation: {
            mode: 'source_contains',
            patterns: ['match &record.status', 'FeatureStatus::Fresh', 'FeatureStatus::Stale', 'FeatureStatus::Missing'],
            successMessage:
              'Exhaustive enum match with struct and tuple variants. The compiler verified you handled every state — no silent gaps.',
          },
        },
      ],
      reflectionPrompts: [
        'How would you rewrite a Python status string system using Rust enums?',
        'Which of your existing state machines would benefit most from exhaustive matching?',
      ],
      deliverables: ['Feature status lab complete', 'Reflection entry'],
      references: [
        { title: 'The Rust Book Chapters 5-6 — Structs and Enums', kind: 'docs', required: true },
        { title: 'Rust by Example — enums', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-day-5',
      slug: 'day-5',
      kind: 'day',
      title: 'Friday — Result, Option, and Error Handling',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Read: The Rust Book Chapter 9 (recoverable errors, Result, the ? operator)',
        '1:00–1:45 Lab: add error-propagating file parsing to the CLI project',
        '1:45–2:00 Set up weekend build plan for rust-ml-cli',
      ],
      summary:
        'Rust has no exceptions. All errors are values. `Result<T, E>` is either a successful `T` or an error `E`. The `?` operator propagates errors up the call stack automatically. This is the error model you wished Python had.',
      narrative: `# Friday — Result, Option, and Explicit Error Paths

## No exceptions — all errors are values

In Python, an exception can appear from anywhere and propagate invisibly through call stacks. In Go, you have \`if err != nil\` everywhere. Rust uses \`Result<T, E>\` — an enum with two variants:

\`\`\`rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
\`\`\`

Functions that can fail return \`Result\`. Callers must handle both variants.

## The ? operator

Writing \`match result { Ok(v) => ..., Err(e) => return Err(e) }\` everywhere is verbose. The \`?\` operator is syntactic sugar:

\`\`\`rust
fn read_config(path: &str) -> Result<String, std::io::Error> {
    let content = std::fs::read_to_string(path)?;  // return Err if it fails
    Ok(content)
}
\`\`\`

\`?\` unwraps the \`Ok\` value or returns the error to the caller. This is exactly Go's \`if err != nil { return err }\` but with less ceremony.

## Option<T>

For values that might not exist (nullable in other languages):

\`\`\`rust
fn find_threshold(values: &[f64]) -> Option<f64> {
    values.iter().find(|&&v| v > 1.0).copied()
}
\`\`\`

Calling code must explicitly handle the \`None\` case. No null pointer exceptions.

## Why this is better for ML infra

Config loading, model artifact loading, and feature lookups all have failure paths. In Python you might return \`None\` and forget to check, or let an exception propagate to a serving endpoint. In Rust, the type system makes every failure path visible to every caller.

## Friday plan

Today you add file-based config loading to the CLI project using \`Result\` and \`?\`. Over the weekend you will build the full CLI.
`,
      outcomes: [
        'Use Result and Option to model fallible operations.',
        'Apply the ? operator to propagate errors without boilerplate.',
        'Write a file-reading function with explicit error handling.',
      ],
      tasks: [
        { id: 'rust-w1d5-read', label: 'Read Chapter 9 on error handling.', type: 'reading', required: true },
        { id: 'rust-w1d5-lab', label: 'Add config loader with Result to the CLI.', type: 'coding', required: true },
        { id: 'rust-w1d5-plan', label: 'Write the weekend build plan for rust-ml-cli.', type: 'notes', required: true },
      ],
      quiz: [
        {
          id: 'rust-w1d5-q1',
          prompt: 'What does the `?` operator do inside a function that returns `Result`?',
          options: [
            'Unwraps an Ok value or returns the Err to the caller — equivalent to manual match-and-early-return',
            'Panics on Err and returns the Ok value unconditionally',
            'Converts the error to a warning and continues execution',
          ],
          answer: 'Unwraps an Ok value or returns the Err to the caller — equivalent to manual match-and-early-return',
          explanation:
            '`?` is the ergonomic form of: if Err, return that error; if Ok, unwrap and continue. It forces error paths to be visible in the function signature without verbose boilerplate.',
        },
      ],
      labs: [
        {
          id: 'rust-config-loader-lab',
          title: 'Lab — Config Loader with Result',
          objective:
            'Write a config loader that reads a JSON-like string, parses a float threshold, and returns a structured Result — propagating all errors to main.',
          language: 'rust',
          files: [
            {
              path: 'src/main.rs',
              language: 'rust',
              readOnly: true,
              content: `mod config;
use config::load_threshold;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let raw_config = "{\"threshold\": 0.75, \"batch_size\": 128}";

    let threshold = load_threshold(raw_config)?;
    println!("threshold loaded: {}", threshold);

    Ok(())
}
`,
            },
            {
              path: 'src/config.rs',
              language: 'rust',
              content: `// Parse the threshold from a simple JSON-like string
// Input format: {"threshold": 0.75, ...}
// Return Ok(f64) or Err(Box<dyn std::error::Error>)
pub fn load_threshold(raw: &str) -> Result<f64, Box<dyn std::error::Error>> {
    // Hint: find "\"threshold\":" in the string, then parse the next token as f64
    // You can use raw.find(...) and raw[start..].split_whitespace().next()
    // Return Err("threshold key not found".into()) if missing
    // Return the parsed f64 inside Ok(...)
    Err("not implemented".into())
}
`,
              solution: `pub fn load_threshold(raw: &str) -> Result<f64, Box<dyn std::error::Error>> {
    let key = "\"threshold\":";
    let start = raw.find(key).ok_or("threshold key not found")?;
    let after_key = &raw[start + key.len()..].trim_start();
    let token = after_key.split(|c: char| c == ',' || c == '}')
        .next()
        .ok_or("could not parse threshold value")?
        .trim();
    let value: f64 = token.parse()?;
    Ok(value)
}
`,
            },
          ],
          hints: [
            '`raw.find("key")` returns `Option<usize>`. Use `.ok_or("error message")` to convert `None` into an `Err`.',
            'String slicing with `&raw[start..]` gives you the rest of the string from that position.',
            '`token.parse::<f64>()` returns a `Result<f64, _>`. Apply `?` to propagate the error.',
          ],
          validation: {
            mode: 'source_contains',
            patterns: ['Result<f64,', '.ok_or(', 'Ok(value)', '.parse()'],
            successMessage:
              'Explicit error propagation with Result and ?. Every failure path is named in the return type and handled at the call site.',
          },
        },
      ],
      reflectionPrompts: [
        'How does the Result/? pattern compare to Go\'s `if err != nil` in terms of expressiveness?',
        'Where in the CLI will you use Result vs Option over the weekend?',
      ],
      deliverables: ['Config loader lab complete', 'Weekend build plan written'],
      references: [
        { title: 'The Rust Book Chapter 9 — Error Handling', kind: 'docs', required: true },
        { title: 'Rust by Example — error handling', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-sat',
      slug: 'saturday',
      kind: 'weekend',
      title: 'Saturday — Build: rust-ml-cli numeric batch analyzer',
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1 (2 hrs): implement CLI argument parsing with std::env::args',
        'Block 2 (2 hrs): add file input reading with Result propagation',
        'Block 3 (2 hrs): add batch statistics (mean, std dev, percentiles)',
        'Block 4 (1-2 hrs): add threshold alerting and clean up output',
      ],
      summary:
        'Saturday converts the week\'s concepts into a working CLI tool. By end of day you will have a Rust binary that reads numeric data from stdin or a file and outputs a statistical summary with threshold alerting.',
      narrative: `# Saturday — Build the rust-ml-cli

The tool you are building today is not a toy. A fast Rust CLI for batch data inspection is genuinely useful in ML infra: it can process millions of rows faster than pandas, with no interpreter overhead, and produce structured output for monitoring pipelines.

## Build targets

1. \`cargo run -- --file data.txt\` reads floats, one per line
2. Computes mean, std deviation, min, max, p50, p90, p99
3. Outputs structured lines: \`STAT mean=... std=... min=... max=...\`
4. Accepts a \`--threshold\` flag; prints \`ALERT: N values exceed threshold\` if triggered

## Key patterns you need

\`\`\`rust
let args: Vec<String> = std::env::args().collect();
// parse flags from args
\`\`\`

\`\`\`rust
let content = std::fs::read_to_string(&path)?;
let values: Vec<f64> = content.lines()
    .filter_map(|l| l.trim().parse::<f64>().ok())
    .collect();
\`\`\`

## Focus

Get a working binary first. Then add the threshold alert. Then add percentiles. Do not optimize early.
`,
      outcomes: [
        'A runnable rust-ml-cli binary with file input.',
        'Correct statistical output: mean, std, min, max.',
        'Threshold alerting from a CLI flag.',
      ],
      tasks: [
        { id: 'rust-w1sat-args', label: 'Implement CLI argument parsing.', type: 'project', required: true },
        { id: 'rust-w1sat-file', label: 'Add file reading with error propagation.', type: 'project', required: true },
        { id: 'rust-w1sat-stats', label: 'Implement batch statistics.', type: 'coding', required: true },
        { id: 'rust-w1sat-alert', label: 'Add threshold alerting.', type: 'coding', required: true },
      ],
      reflectionPrompts: [
        'Where did the borrow checker slow you down, and what did the error message teach you?',
        'What would you do differently if the input file were 100 GB?',
      ],
      deliverables: ['Working rust-ml-cli binary', 'Debug notes'],
      references: [
        { title: 'The Rust Book Chapter 12 — CLI project', kind: 'docs', required: true },
        { title: 'Rust by Example — file I/O', kind: 'docs' },
      ],
    },
    {
      id: 'rust-week-1-sun',
      slug: 'sunday',
      kind: 'weekend',
      title: 'Sunday — Harden, Test, and Write',
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1 (2 hrs): add unit tests and handle edge cases (empty file, non-numeric lines)',
        'Block 2 (2 hrs): write the ownership essay',
        'Block 3 (2 hrs): refactor toward modules and clean error messages',
        'Block 4 (1-2 hrs): README and weekly review',
      ],
      summary:
        'Sunday proves understanding by hardening the CLI and writing the ownership essay. If you can explain ownership to a skeptical Go engineer in plain language, you own the concept.',
      narrative: `# Sunday — Harden and Explain

## Testing in Rust

\`\`\`rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mean_empty() {
        let result = mean_of(&[]);
        assert!(result.is_none());
    }

    #[test]
    fn test_mean_values() {
        let result = mean_of(&[2.0, 4.0, 6.0]);
        assert_eq!(result, Some(4.0));
    }
}
\`\`\`

## Edge cases to handle

- empty input file
- lines with whitespace
- non-numeric lines (skip them with \`filter_map\`)
- threshold flag not provided (use \`Option<f64>\`)

## Essay prompt

Write 400-600 words answering: "Why Rust Ownership Is Just Explicit Resource Management."

Frame it for a skeptical senior Go engineer. Do not use Rust jargon without explanation. Ground every claim in a concrete example from a ML serving system.
`,
      outcomes: [
        'Passing unit tests for edge cases.',
        'Ownership essay written and coherent.',
        'README documents how to build and run the CLI.',
      ],
      tasks: [
        { id: 'rust-w1sun-tests', label: 'Write unit tests for edge cases.', type: 'coding', required: true },
        { id: 'rust-w1sun-essay', label: 'Write the ownership essay.', type: 'writing', required: true },
        { id: 'rust-w1sun-readme', label: 'Write README with build instructions.', type: 'writing', required: true },
        { id: 'rust-w1sun-review', label: 'Weekly self-review: am I ready for Week 2?', type: 'reflection', required: true },
      ],
      reflectionPrompts: [
        'Could you explain Rust ownership to a team member in 2 minutes?',
        'What in the CLI design do you still not fully understand?',
      ],
      deliverables: ['Passing unit tests', 'Ownership essay', 'README'],
      references: [
        { title: 'The Rust Book Chapter 11 — Testing', kind: 'docs', required: true },
        { title: 'Rust by Example — testing', kind: 'docs' },
      ],
    },
  ],
};
