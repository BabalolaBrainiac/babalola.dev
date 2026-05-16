import type { LearningModule, LearningWeek } from '@/features/learning/types';

function makeWeek(
  id: string, slug: string, weekNum: number, title: string, theme: string, summary: string,
  days: Array<{ title: string; narrative: string; labId: string; labTitle: string; labObjective: string; mainPy: string; editPy: string; editPyPath: string; solutionPy: string; hint1: string; hint2: string; hint3: string; target: string; successMsg: string; quizPrompt: string; quizOptions: string[]; quizAnswer: string; quizExpl: string; refs: string[] }>,
  satNarrative: string, sunNarrative: string, outputs: string[]
): LearningWeek {
  const modules: LearningModule[] = days.map((day, i) => {
    const dayNames = ['day-1', 'day-2', 'day-3', 'day-4', 'day-5'];
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dSlug = dayNames[i];
    return {
      id: `${slug}-${dSlug}`,
      slug: dSlug,
      kind: 'day' as const,
      title: `${dayLabels[i]} — ${day.title}`,
      durationLabel: '2 hours',
      schedule: ['0:00–1:00 Reading and concept study', '1:00–1:45 Lab and notes', '1:45–2:00 Reflection'],
      summary: day.narrative.split('\n')[2]?.replace(/^#+ /, '') ?? `${dayLabels[i]} focus.`,
      narrative: day.narrative,
      outcomes: ['Understand the core concept deeply.', 'Complete the hands-on lab.', 'Write a reflection entry.'],
      tasks: [
        { id: `${slug}-${dSlug}-read`, label: 'Complete the reading block.', type: 'reading' as const, required: true },
        { id: `${slug}-${dSlug}-lab`, label: 'Finish the coding lab.', type: 'coding' as const, required: true },
        { id: `${slug}-${dSlug}-reflect`, label: 'Write the reflection.', type: 'reflection' as const, required: true },
      ],
      quiz: [{
        id: `${slug}-${dSlug}-q1`,
        prompt: day.quizPrompt,
        options: day.quizOptions,
        answer: day.quizAnswer,
        explanation: day.quizExpl,
      }],
      labs: [{
        id: day.labId,
        title: day.labTitle,
        objective: day.labObjective,
        language: 'python' as const,
        files: [
          { path: 'main.py', language: 'python', readOnly: true, content: day.mainPy },
          { path: day.editPyPath, language: 'python', content: day.editPy, solution: day.solutionPy },
        ],
        hints: [day.hint1, day.hint2, day.hint3],
        validation: { mode: 'python_output' as const, target: day.target, successMessage: day.successMsg },
      }],
      reflectionPrompts: ['What surprised you today?', 'Where would this break in a production system?'],
      deliverables: ['Lab completed', 'Reflection written'],
      references: day.refs.map(r => ({ title: r, kind: 'docs' as const, required: true })),
    };
  });

  modules.push({
    id: `${slug}-sat`,
    slug: 'saturday',
    kind: 'weekend' as const,
    title: 'Saturday — Deep Build',
    durationLabel: '6–8 hours',
    schedule: ['Block 1 (2 hrs): implement core system', 'Block 2 (2 hrs): extend and validate', 'Block 3 (2 hrs): debug and harden', 'Block 4 (1–2 hrs): refactor and document'],
    summary: 'Saturday turns theory into working software.',
    narrative: satNarrative,
    outcomes: ['Working build for the week.', 'Failure paths exercised.', 'System explained clearly.'],
    tasks: [
      { id: `${slug}-sat-build`, label: 'Finish the main build.', type: 'project' as const, required: true },
      { id: `${slug}-sat-debug`, label: 'Run debugging and hardening passes.', type: 'coding' as const, required: true },
    ],
    reflectionPrompts: ['Where did complexity appear faster than expected?'],
    deliverables: ['Updated project workspace', 'Debug notes'],
    references: [],
  });

  modules.push({
    id: `${slug}-sun`,
    slug: 'sunday',
    kind: 'weekend' as const,
    title: 'Sunday — Writing and System Review',
    durationLabel: '6–8 hours',
    schedule: ['Block 1 (2 hrs): failure simulation', 'Block 2 (2 hrs): writing the weekly artifact', 'Block 3 (2 hrs): documentation', 'Block 4 (1–2 hrs): next week prep'],
    summary: 'Sunday proves understanding through writing.',
    narrative: sunNarrative,
    outcomes: ['Written artifact produced.', 'Architecture and risks documented.', 'Decision to advance or repeat made.'],
    tasks: [
      { id: `${slug}-sun-write`, label: 'Write the weekly architecture or failure review.', type: 'writing' as const, required: true },
      { id: `${slug}-sun-docs`, label: 'Update README and operator notes.', type: 'writing' as const, required: true },
    ],
    reflectionPrompts: ['What would fail first if scale doubled tomorrow?'],
    deliverables: ['Weekly essay', 'Updated documentation'],
    references: [],
  });

  return {
    id, slug,
    title: `Week ${weekNum} — ${title}`,
    theme, summary,
    commitment: '2 hours on weekdays, 6–8 hours each weekend day',
    outputs,
    modules,
  };
}

export const mlopsWeek3: LearningWeek = makeWeek(
  'mlops-week-3', 'week-3', 3,
  'Pipelines and Orchestration',
  'DAGs, idempotency, retries, and pipeline failure recovery.',
  'Week 3 reframes ML work as orchestration: controlled state transitions, explicit dependencies, and safe reruns.',
  [
    {
      title: 'DAG Fundamentals',
      narrative: `# DAG Fundamentals

A Directed Acyclic Graph (DAG) is the right abstraction for any workflow where tasks have dependencies and you need safe reruns. In ML pipelines, every stage feeds the next: raw data → validation → feature extraction → training → evaluation → deployment. This is a DAG.

## Why Acyclic?

Acyclic means no cycles — no task can depend on itself, directly or transitively. This is the property that makes DAGs safe to execute: you can always find a valid execution order (topological sort). If your pipeline has a cycle, it deadlocks.

## Topological Sort

Given a DAG where each task lists its dependencies, a topological sort produces an execution order where every task runs after all its dependencies. The algorithm uses in-degree counting:

1. Compute in-degree for each node (how many tasks depend on it)
2. Start with all nodes that have in-degree 0 (no dependencies)
3. Execute each node, decrement in-degree of its dependents
4. When a dependent's in-degree hits 0, it is ready to run

**Backend analogy**: this is the same algorithm used in build systems (Make, Gradle) and package manager dependency resolution. ML pipelines are just another build system.

## Airflow's Implementation

Apache Airflow represents pipelines as DAGs of Operators. Each Operator is a unit of work. Airflow's scheduler runs a topological sort on the DAG, distributes tasks to workers, and handles retries. The key insight: Airflow is not an executor — it is a scheduler. The actual work happens in your code.

## The Principal-Level Takeaway

A DAG-based pipeline is safe to partial-rerun. If the feature extraction stage fails, you can rerun from that stage without re-running data ingestion. This is only safe if each stage is idempotent — which is tomorrow's topic.

### 💡 Trending in 2026: Declarative DAGs
> Both Prefect 2.0 and Dagster have moved toward Python-native DAG definition without YAML. You write Python functions decorated with @task and the framework infers the dependency graph from function call order. This makes DAGs testable as regular Python code.
`,
      labId: 'dag-runner-lab',
      labTitle: 'Lab — Minimal DAG Runner',
      labObjective: 'Implement a topological sort for a DAG of ML pipeline tasks and execute them in the correct dependency order.',
      mainPy: `from dag import DAGRunner

pipeline = DAGRunner()
pipeline.add_task("ingest_data", dependencies=[])
pipeline.add_task("validate_data", dependencies=["ingest_data"])
pipeline.add_task("extract_features", dependencies=["validate_data"])
pipeline.add_task("train_model", dependencies=["extract_features"])
pipeline.add_task("evaluate_model", dependencies=["train_model"])
pipeline.add_task("deploy_model", dependencies=["evaluate_model"])

if __name__ == "__main__":
    print("--- PIPELINE EXECUTION ORDER ---")
    pipeline.run()`,
      editPyPath: 'dag.py',
      editPy: `from collections import deque

class DAGRunner:
    def __init__(self):
        self.tasks: dict[str, list[str]] = {}

    def add_task(self, name: str, dependencies: list[str]) -> None:
        self.tasks[name] = dependencies

    def topological_sort(self) -> list[str]:
        """
        Return tasks in execution order using in-degree algorithm:
        1. Build in_degree dict: count how many tasks depend on each task
           (a task with 0 in_degree has no remaining dependencies)
        2. Start queue with all tasks that have in_degree == 0
        3. Pop from queue, append to order, decrement dependents' in_degrees
        4. If a dependent hits 0, add it to the queue
        """
        # ── Step 1: Build the in-degree map ────────────────────────
        # A dict comprehension is the cleanest way to count how many
        # dependencies each task currently has.
        # Example:
        #   counts = {task: len(deps) for task, deps in self.tasks.items()}
        # TODO: create in_degree

        # ── Step 2: Build a reverse lookup of dependents ───────────
        # You need to know which tasks should be updated after a task
        # is "completed". That means building dep -> [tasks that wait on dep].
        # TODO: create dependents

        # ── Step 3: Seed the queue with ready tasks ────────────────
        # deque([...]) is useful for FIFO processing.
        # TODO: create queue from tasks whose in_degree is 0

        # ── Step 4: Pop, append, decrement, enqueue ────────────────
        # This is the heart of topological sort:
        # - pop a ready task
        # - append it to execution order
        # - decrement each dependent's in_degree
        # - enqueue any dependent that reaches 0
        # TODO: implement the processing loop
        pass

    def run(self) -> None:
        order = self.topological_sort()
        if order is None:
            print("Pipeline has a cycle - cannot execute")
            return
        for task in order:
            print(f"EXECUTING: {task}")
        print("PIPELINE COMPLETE")`,
      solutionPy: `from collections import deque

class DAGRunner:
    def __init__(self):
        self.tasks: dict[str, list[str]] = {}

    def add_task(self, name: str, dependencies: list[str]) -> None:
        self.tasks[name] = dependencies

    def topological_sort(self) -> list[str]:
        in_degree = {task: len(deps) for task, deps in self.tasks.items()}
        dependents: dict[str, list[str]] = {task: [] for task in self.tasks}
        for task, deps in self.tasks.items():
            for dep in deps:
                dependents[dep].append(task)
        queue = deque([t for t, d in in_degree.items() if d == 0])
        order = []
        while queue:
            task = queue.popleft()
            order.append(task)
            for dependent in dependents[task]:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)
        return order if len(order) == len(self.tasks) else []

    def run(self) -> None:
        order = self.topological_sort()
        for task in order:
            print(f"EXECUTING: {task}")
        print("PIPELINE COMPLETE")`,
      hint1: 'Build in_degree by counting dependencies: in_degree = {task: len(deps) for task, deps in self.tasks.items()}.',
      hint2: 'Build a dependents map: for each task, record which other tasks list it as a dependency.',
      hint3: 'Start the queue with tasks where in_degree == 0. After processing each task, decrement the in_degree of its dependents.',
      target: 'PIPELINE COMPLETE',
      successMsg: 'DAG topological sort working. You have implemented the scheduling algorithm at the heart of Airflow, Prefect, and Make.',
      quizPrompt: 'Why must a pipeline DAG be acyclic?',
      quizOptions: ['Cycles cause deadlock — a task would wait forever for a dependency that also waits for it', 'Cycles use too much memory', 'Airflow does not support cycles due to licensing'],
      quizAnswer: 'Cycles cause deadlock — a task would wait forever for a dependency that also waits for it',
      quizExpl: 'In a cyclic dependency graph, there is no valid starting point for execution. Every task in the cycle has an unsatisfied dependency. This is why topological sort requires an acyclic graph.',
      refs: ['Airflow Concepts: DAGs, Tasks, Operators', 'Prefect 2.0 docs: flows and tasks'],
    },
    {
      title: 'Idempotency',
      narrative: `# Idempotency

Idempotency is the property that running an operation multiple times produces the same result as running it once. In HTTP, PUT is idempotent (setting a resource to a value twice is the same as setting it once). POST is not (posting twice creates two records).

In ML pipelines, idempotency is the difference between a pipeline that is safe to retry and one that accumulates garbage data.

## Why Idempotency Is Non-Negotiable

Imagine your training pipeline crashes at the evaluation stage. You rerun it. If the feature extraction stage is not idempotent, it might append new rows to an existing feature table, doubling the dataset. Your training now runs on corrupted data — without any error.

The fix: every pipeline stage should check if its output already exists before computing it. If the output exists and is valid (hash matches), skip the computation.

\`\`\`python
def extract_features(input_path: str, output_path: str) -> None:
    if Path(output_path).exists():
        print(f"SKIPPED: {output_path} already exists")
        return
    # ... compute features
\`\`\`

## The Check-Then-Write Pattern

The idiomatic pattern for idempotent pipeline tasks:
1. Check if the output already exists (file, table, artifact)
2. If yes and it passes a validity check (hash, row count, schema): skip
3. If no or invalid: compute and write
4. Write atomically: write to a temp path, then rename (rename is atomic on most filesystems)

The atomic rename prevents partial writes: if the process crashes while writing, you either have the old file or nothing — never a partially-written file that passes the existence check.

## The Principal-Level Takeaway

Idempotent pipelines are the only kind that are safe to operate at scale. At high throughput, retries are guaranteed. An orchestrator cannot safely retry a non-idempotent task — it has to treat every failure as potentially leaving the system in an unknown state.

### 💡 Trending in 2026: Idempotency in LLM Pipelines
> RAG pipelines face new idempotency challenges: re-indexing a document corpus should not create duplicate embeddings. Vector stores like Pinecone and Weaviate now support upsert-by-ID semantics specifically to make document ingestion pipelines idempotent.
`,
      labId: 'idempotent-task-lab',
      labTitle: 'Lab — Idempotent Feature Extractor',
      labObjective: 'Build a feature extractor that skips computation if the output already exists, using an in-memory cache as the output store.',
      mainPy: `from extractor import IdempotentExtractor

cache = {}
extractor = IdempotentExtractor(cache)

if __name__ == "__main__":
    print("--- IDEMPOTENCY TEST ---")
    extractor.extract("dataset_v1", [1.0, 2.0, 3.0])
    extractor.extract("dataset_v1", [1.0, 2.0, 3.0])  # should be skipped
    extractor.extract("dataset_v2", [4.0, 5.0, 6.0])  # new data, should run
    print(f"Cache size: {len(cache)}")`,
      editPyPath: 'extractor.py',
      editPy: `class IdempotentExtractor:
    def __init__(self, cache: dict):
        self.cache = cache

    def _compute_features(self, raw: list[float]) -> list[float]:
        return [x * 2 for x in raw]

    def extract(self, key: str, raw_data: list[float]) -> list[float]:
        """
        Idempotent extraction:
        1. Check if key is in self.cache
        2. If yes: print "SKIPPED: {key} already exists" and return cache[key]
        3. If no: compute features, store in cache, print "COMPUTED: {key}", return features
        """
        # TODO: implement
        pass`,
      solutionPy: `class IdempotentExtractor:
    def __init__(self, cache: dict):
        self.cache = cache

    def _compute_features(self, raw: list[float]) -> list[float]:
        return [x * 2 for x in raw]

    def extract(self, key: str, raw_data: list[float]) -> list[float]:
        if key in self.cache:
            print(f"SKIPPED: {key} already exists")
            return self.cache[key]
        features = self._compute_features(raw_data)
        self.cache[key] = features
        print(f"COMPUTED: {key}")
        return features`,
      hint1: 'Check if the key is already in self.cache with: if key in self.cache.',
      hint2: 'If found, print the SKIPPED message and return self.cache[key]. This is the core idempotency check.',
      hint3: 'If not found, call self._compute_features(raw_data), store in self.cache[key], print COMPUTED, then return the features.',
      target: 'SKIPPED: dataset_v1 already exists',
      successMsg: 'Idempotency working correctly. The second call was safely skipped. This pattern prevents data corruption in retried pipeline runs.',
      quizPrompt: 'Which part of the idempotent write pattern prevents partial file corruption on crash?',
      quizOptions: ['Writing to a temp path then atomically renaming to the final path', 'Using a database transaction', 'Checking the file size before writing'],
      quizAnswer: 'Writing to a temp path then atomically renaming to the final path',
      quizExpl: 'Rename (on POSIX systems) is atomic — it either completes or does not. This means the final path either has the old file or the complete new file, never a partial write.',
      refs: ['Dagster: software-defined assets', 'Airflow: task retries and idempotency'],
    },
    {
      title: 'Failure Recovery',
      narrative: `# Failure Recovery and Retry Logic

In production ML pipelines, failures are not exceptional — they are scheduled. Network blips, resource contention, transient API errors, and memory spikes happen regularly. Your pipeline must be designed to survive them.

## The Retry Landscape

Not all failures are equal:

**Transient failures**: temporary conditions that resolve themselves — a rate limit that resets in 60 seconds, a network timeout, a database lock. These should be retried with exponential backoff.

**Permanent failures**: the model artifact is corrupt, the input data schema is wrong, the config is invalid. Retrying these is waste. You need to fail fast, log the error, and alert.

**Cascading failures**: a downstream stage fails because an upstream stage produced invalid output that passed its own validation. These need to be caught by the downstream stage's input validation, not just retried.

## Exponential Backoff

The standard retry pattern for transient failures:
- Attempt 1: fail, wait 1s
- Attempt 2: fail, wait 2s
- Attempt 3: fail, wait 4s
- Attempt N: fail, wait 2^(N-1) seconds up to a max

Adding jitter (random delay within the backoff window) prevents the "thundering herd" problem where all failing instances retry at exactly the same time and overload the same resource.

## Dead Letter Queues

For queue-based pipelines, failed tasks should be moved to a dead letter queue (DLQ) rather than dropped. The DLQ lets an operator inspect what failed, understand why, and replay it after the root cause is fixed.

## The Principal-Level Takeaway

Retry logic belongs in the infrastructure layer, not the task code. Your pipeline tasks should be pure functions: given input, produce output. The orchestrator (Airflow, Prefect) handles retry policy. This separation keeps task code simple and retryability configurable without code changes.

### 💡 Trending in 2026: Structured Error Classification
> Modern orchestrators are moving toward structured error types. Instead of "retry all failures up to N times," you declare: retry TransientNetworkError 3 times; fail immediately on SchemaValidationError; alert on ModelDegradationError. This is the same type-safe error handling discipline that good backend systems use.
`,
      labId: 'retry-lab',
      labTitle: 'Lab — Retryable Task Decorator',
      labObjective: 'Implement a retry decorator that retries a failing function with exponential backoff and succeeds on the nth attempt.',
      mainPy: `from retry import with_retry

attempt_count = [0]

def flaky_data_fetch():
    attempt_count[0] += 1
    if attempt_count[0] < 3:
        raise ConnectionError(f"Network timeout (attempt {attempt_count[0]})")
    return "DATA_FETCHED_SUCCESSFULLY"

if __name__ == "__main__":
    print("--- RETRY TEST ---")
    result = with_retry(flaky_data_fetch, max_attempts=5, base_delay=0)
    print(f"Result: {result}")`,
      editPyPath: 'retry.py',
      editPy: `import time

def with_retry(fn, max_attempts: int = 3, base_delay: float = 1.0):
    """
    Call fn() up to max_attempts times.
    If fn raises, wait base_delay * (2 ** attempt) seconds before retrying.
    If all attempts fail, re-raise the last exception.
    Print "Attempt {n} failed: {error}" for each failure.
    Print "Succeeded on attempt {n}" when it works.
    """
    # TODO: implement retry loop with exponential backoff
    pass`,
      solutionPy: `import time

def with_retry(fn, max_attempts: int = 3, base_delay: float = 1.0):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            result = fn()
            print(f"Succeeded on attempt {attempt}")
            return result
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt} failed: {e}")
            if attempt < max_attempts:
                delay = base_delay * (2 ** (attempt - 1))
                if delay > 0:
                    time.sleep(delay)
    raise last_error`,
      hint1: 'Use a for loop: for attempt in range(1, max_attempts + 1). Call fn() inside a try/except.',
      hint2: 'On failure, print the error, then compute delay = base_delay * (2 ** (attempt - 1)) and sleep. Only sleep if attempt < max_attempts.',
      hint3: 'On success, print "Succeeded on attempt {attempt}" and return the result. After the loop ends (all attempts failed), raise the last_error.',
      target: 'Succeeded on attempt 3',
      successMsg: 'Retry logic working. This is the pattern used in Airflow retry_delay, in boto3\'s retry config, and in every production-grade API client.',
      quizPrompt: 'Why add random jitter to exponential backoff?',
      quizOptions: ['To prevent all failed instances from retrying at exactly the same time and overloading the system', 'To make logs harder to read for attackers', 'To vary the total number of retries'],
      quizAnswer: 'To prevent all failed instances from retrying at exactly the same time and overloading the system',
      quizExpl: 'Without jitter, 100 workers all failing at the same moment would all retry at t+1s, t+2s, t+4s — synchronized waves of load. Jitter spreads the retries across a window, smoothing the load.',
      refs: ['AWS exponential backoff and jitter blog post', 'Airflow retry and retry_delay task options'],
    },
    {
      title: 'Scheduling vs Event-Driven',
      narrative: `# Scheduling vs Event-Driven Pipelines

There are two fundamental ways to trigger a pipeline: by time (scheduled) or by event (event-driven). Each has its place, and choosing wrong creates operational problems that are hard to undo.

## Scheduled Pipelines

A scheduled pipeline runs at a fixed cadence: every hour, every day at 2am, every Monday. Airflow was built primarily for this model. The advantages: simple to reason about, easy to backfill historical runs, predictable resource usage.

The failure mode: scheduled pipelines assume the upstream data will be ready when the pipeline runs. If the upstream data pipeline is delayed, your scheduled job runs against stale data and produces stale features — silently.

## Event-Driven Pipelines

An event-driven pipeline runs when something happens: new data arrives in an S3 bucket, a database row is inserted, a Kafka message is published. The trigger is the data, not the clock.

The advantages: pipelines run as soon as data is available, not speculatively. No wasted computation on hours when no data arrived.

The operational cost: you need a message bus (Kafka, SQS, Pub/Sub) and event routing infrastructure. Local development is harder (you cannot just run the DAG manually without simulating events).

## The Hybrid Pattern

Most mature ML systems use both: a scheduled pipeline for regular retraining (daily at 3am), and an event-driven pipeline for real-time feature updates (triggered by each user action). The scheduled pipeline provides a floor of freshness. The event-driven pipeline provides near-real-time responsiveness where it matters.

## The Principal-Level Takeaway

The choice between scheduled and event-driven is a latency vs complexity tradeoff. If your SLA is "model must use data no older than 1 hour," you need event-driven or very frequent scheduling with freshness SLAs. If your SLA is "daily retraining is fine," scheduled is simpler and more reliable.

### 💡 Trending in 2026: Streaming ML Pipelines
> Flink and Kafka Streams are increasingly used for feature computation in real-time ML systems. Instead of batch feature extraction, features are computed as each event flows through the stream. This enables sub-second feature freshness but requires streaming-specific infrastructure.
`,
      labId: 'event-trigger-lab',
      labTitle: 'Lab — Event-Driven Pipeline Trigger',
      labObjective: 'Simulate an event-driven pipeline that triggers different stages based on incoming events using a queue.',
      mainPy: `from pipeline import EventDrivenPipeline

pipeline = EventDrivenPipeline()

events = [
    {"type": "data_arrived", "source": "s3://bucket/train.csv"},
    {"type": "data_arrived", "source": "s3://bucket/val.csv"},
    {"type": "training_complete", "model_version": "v42"},
    {"type": "evaluation_passed", "accuracy": 0.95},
    {"type": "unknown_event", "data": "ignored"},
]

if __name__ == "__main__":
    print("--- EVENT-DRIVEN PIPELINE ---")
    for event in events:
        pipeline.handle(event)`,
      editPyPath: 'pipeline.py',
      editPy: `class EventDrivenPipeline:
    def handle(self, event: dict) -> None:
        """
        Route events to pipeline stages:
        - "data_arrived": print "TRIGGERED: data validation for {source}"
        - "training_complete": print "TRIGGERED: evaluation for model {model_version}"
        - "evaluation_passed": print "TRIGGERED: deployment candidate (accuracy={accuracy})"
        - anything else: print "SKIPPED: unknown event type {type}"
        """
        event_type = event.get("type", "unknown")
        # TODO: implement event routing
        pass`,
      solutionPy: `class EventDrivenPipeline:
    def handle(self, event: dict) -> None:
        event_type = event.get("type", "unknown")
        if event_type == "data_arrived":
            print(f"TRIGGERED: data validation for {event.get('source')}")
        elif event_type == "training_complete":
            print(f"TRIGGERED: evaluation for model {event.get('model_version')}")
        elif event_type == "evaluation_passed":
            print(f"TRIGGERED: deployment candidate (accuracy={event.get('accuracy')})")
        else:
            print(f"SKIPPED: unknown event type {event_type}")`,
      hint1: 'event.get("type") gives you the event type string. Use if/elif/else to route.',
      hint2: 'event.get("source") gets the source field for data_arrived events.',
      hint3: 'The else clause handles unknown events — print the SKIPPED message with event.get("type").',
      target: 'TRIGGERED: deployment candidate',
      successMsg: 'Event routing working. This is the pattern used in Lambda triggers, Kafka consumers, and ML pipeline event buses.',
      quizPrompt: 'What is the main operational disadvantage of event-driven pipelines compared to scheduled ones?',
      quizOptions: ['They require message queue infrastructure and make local development harder to simulate', 'They cannot be retried when they fail', 'They always run slower than scheduled pipelines'],
      quizAnswer: 'They require message queue infrastructure and make local development harder to simulate',
      quizExpl: 'Scheduled pipelines can be triggered manually and tested with simple date parameters. Event-driven pipelines require simulating the upstream event, which means setting up a message bus or using a mock.',
      refs: ['Apache Kafka: event-driven architecture', 'AWS EventBridge: ML pipeline triggers'],
    },
    {
      title: 'Pipeline Project Setup',
      narrative: `# Pipeline Project Setup

Today you open the second project workspace: \`ml-pipeline-system\`. This project will grow through Week 3's weekend into a full pipeline: data ingestion → validation → training → evaluation → deployment.

## Project Structure

\`\`\`
ml-pipeline-system/
├── pipeline/
│   ├── dag.py          ← DAG runner from Day 1
│   ├── tasks.py        ← individual task implementations
│   ├── retry.py        ← retry decorator from Day 3
│   └── config.py       ← pipeline configuration
├── data/
│   └── raw_data.py     ← synthetic training data generator
├── main.py             ← orchestrates the full pipeline
└── README.md
\`\`\`

## What the Weekend Build Will Produce

By end of Sunday you will have a pipeline that:
1. Ingests data (checks for existence, idempotent)
2. Validates the schema (data contract from Week 1)
3. Extracts features (idempotent)
4. Trains a model (config-driven from Week 2)
5. Evaluates (pass/fail decision)
6. "Deploys" (prints deployment artifact path)

Each stage is a node in the DAG. The DAGRunner executes them in order.

## Today's Task

Open the project workspace. Review the starter files. Add \`pipeline/dag.py\` with the implementation from Day 1. Plan the task implementations.
`,
      labId: 'pipeline-setup-lab',
      labTitle: 'Lab — Pipeline Config',
      labObjective: 'Define a PipelineConfig that controls all pipeline stages in one place.',
      mainPy: `from pipeline_config import PipelineConfig, validate_pipeline_config

if __name__ == "__main__":
    cfg = PipelineConfig(
        raw_data_path="data/raw.csv",
        features_path="data/features.csv",
        model_path="artifacts/model.pkl",
        test_size=0.2,
        random_seed=42,
        min_accuracy_threshold=0.80,
    )
    validate_pipeline_config(cfg)`,
      editPyPath: 'pipeline_config.py',
      editPy: `from dataclasses import dataclass

@dataclass(frozen=True)
class PipelineConfig:
    raw_data_path: str
    features_path: str
    model_path: str
    test_size: float
    random_seed: int
    min_accuracy_threshold: float

def validate_pipeline_config(config: PipelineConfig) -> None:
    """
    Validate pipeline config:
    1. test_size must be in (0, 1)
    2. min_accuracy_threshold must be in (0, 1)
    3. random_seed must be >= 0
    On success: print "PIPELINE CONFIG VALIDATED"
    """
    # TODO: implement validation
    pass`,
      solutionPy: `from dataclasses import dataclass

@dataclass(frozen=True)
class PipelineConfig:
    raw_data_path: str
    features_path: str
    model_path: str
    test_size: float
    random_seed: int
    min_accuracy_threshold: float

def validate_pipeline_config(config: PipelineConfig) -> None:
    if not (0 < config.test_size < 1):
        raise ValueError(f"test_size must be in (0, 1), got {config.test_size}")
    if not (0 < config.min_accuracy_threshold < 1):
        raise ValueError(f"min_accuracy_threshold must be in (0, 1), got {config.min_accuracy_threshold}")
    if config.random_seed < 0:
        raise ValueError(f"random_seed must be >= 0, got {config.random_seed}")
    print("PIPELINE CONFIG VALIDATED")`,
      hint1: 'Same pattern as Week 2\'s TrainingConfig: if/raise ValueError for each constraint.',
      hint2: 'Use not (0 < config.test_size < 1) for range validation.',
      hint3: 'Print "PIPELINE CONFIG VALIDATED" at the end when all checks pass.',
      target: 'PIPELINE CONFIG VALIDATED',
      successMsg: 'Pipeline config validated. The full pipeline build starts this weekend.',
      quizPrompt: 'Why put all pipeline paths (raw_data_path, features_path, model_path) in one config object?',
      quizOptions: ['So you can change all paths for a new environment (dev vs prod) by swapping one config object', 'Because Python dataclasses require all fields together', 'To make paths faster to access at runtime'],
      quizAnswer: 'So you can change all paths for a new environment (dev vs prod) by swapping one config object',
      quizExpl: 'Config objects are environment contracts. In dev you point to local paths; in prod you point to S3 or GCS paths. Swapping the config object is the only change needed.',
      refs: ['Airflow DAG definition examples', 'Prefect: flows and tasks docs'],
    },
  ],
  `# Saturday — Build the ML Pipeline System

Build the full ingestion → validation → training → evaluation pipeline using your DAGRunner.

**Block 1**: Implement each pipeline task as a function in \`pipeline/tasks.py\`. Each task should be idempotent (check before computing) and use the retry decorator for any I/O operations.

**Block 2**: Wire the tasks into the DAGRunner. Run the full pipeline and verify the execution order matches the dependency graph.

**Block 3**: Test failure paths: what happens if validation fails? What happens if accuracy is below threshold? Each should fail loudly with a clear error, not silently.

**Block 4**: Refactor for clarity. Each task should have one clear responsibility. No global state.
`,
  `# Sunday — Document and Write

**Write: "How ML Pipelines Fail: A System-Level Analysis"**

Cover: what happens when idempotency is missing, when DAG dependencies are wrong, when retries are not configured, and when pipeline config is hardcoded. This is a 400–600 word technical argument for pipeline discipline.

After writing, update the project README with an architecture diagram (text-based is fine) and a runbook: how to diagnose and fix the three most common pipeline failures.
`,
  ['Working ml-pipeline-system with DAG execution', 'Idempotent tasks with retry logic', 'Essay: How ML Pipelines Fail'],
);

export const mlopsWeek4: LearningWeek = makeWeek(
  'mlops-week-4', 'week-4', 4,
  'Data Engineering for ML',
  'Feature stores, schema evolution, and data quality at the system level.',
  'Week 4 forces you to treat data systems as the ground truth layer of MLOps. Model quality is bounded by data quality.',
  [
    {
      title: 'Feature Stores — What and Why',
      narrative: `# Feature Stores

A feature store is a centralized system for managing, storing, and serving ML features. It sits between raw data sources and the ML models that consume features. At first glance, this sounds like "just a database." The critical difference is time.

## Point-in-Time Correctness

The most dangerous problem feature stores solve: **label leakage via time travel**.

Imagine predicting whether a loan will default. Your training data contains the loan application date. Your feature set includes "number of late payments in the last 30 days." If you are not careful, you might accidentally include late payments that happened AFTER the loan was already defaulted — information that was not available at prediction time. Your model appears to have 99% accuracy but it is cheating: it uses the future to predict the past.

Feature stores enforce point-in-time correctness by associating every feature value with a timestamp and only returning feature values that were available at (or before) the prediction timestamp.

## Training vs Serving Consistency

Without a feature store, training features are computed in Python by data scientists, and serving features are computed in Java/Go by the serving team. They drift apart. The code diverges. The results diverge. This is training-serving skew.

With a feature store, both training and serving use the same feature definitions. The feature engineering code runs once, in one place, and both paths call the same store.

## The Principal-Level Takeaway

A feature store is infrastructure that ensures the data your model was trained on is the same data it gets in production. Without it, training-serving skew is not a risk — it is a guarantee.

### 💡 Trending in 2026: Streaming Feature Stores
> Feast, Tecton, and Hopsworks now support streaming feature pipelines: features computed in real-time from Kafka topics and made available to models within milliseconds. This enables personalization systems where a user's "last 5 actions" feature is always current, not hours stale.
`,
      labId: 'feature-store-lab',
      labTitle: 'Lab — Minimal Feature Store with TTL',
      labObjective: 'Build a feature store that enforces freshness SLAs — features older than the TTL are considered stale.',
      mainPy: `from feature_store import FeatureStore
import time

store = FeatureStore(ttl_seconds=2)
store.set("user_123", "days_since_login", 1.0)
store.set("user_456", "days_since_login", 5.0)

if __name__ == "__main__":
    print("--- FEATURE FRESHNESS CHECK ---")
    print(store.get("user_123", "days_since_login"))
    print(store.get("user_999", "days_since_login"))
    print("Waiting for TTL...")
    time.sleep(3)
    result = store.get("user_123", "days_since_login")
    print(f"After TTL: {result}")`,
      editPyPath: 'feature_store.py',
      editPy: `import time

class FeatureStore:
    def __init__(self, ttl_seconds: float):
        self.ttl = ttl_seconds
        self._store: dict = {}

    def set(self, entity_id: str, feature: str, value: float) -> None:
        """Store feature with current timestamp."""
        key = (entity_id, feature)
        self._store[key] = {"value": value, "ts": time.time()}

    def get(self, entity_id: str, feature: str):
        """
        Return the feature value if it exists and is not stale.
        If entity_id/feature not found: return "FEATURE_NOT_FOUND"
        If the feature is older than self.ttl seconds: return "FEATURE_STALE"
        Otherwise: return the value
        """
        # TODO: implement
        pass`,
      solutionPy: `import time

class FeatureStore:
    def __init__(self, ttl_seconds: float):
        self.ttl = ttl_seconds
        self._store: dict = {}

    def set(self, entity_id: str, feature: str, value: float) -> None:
        key = (entity_id, feature)
        self._store[key] = {"value": value, "ts": time.time()}

    def get(self, entity_id: str, feature: str):
        key = (entity_id, feature)
        if key not in self._store:
            return "FEATURE_NOT_FOUND"
        entry = self._store[key]
        age = time.time() - entry["ts"]
        if age > self.ttl:
            return "FEATURE_STALE"
        return entry["value"]`,
      hint1: 'Check if (entity_id, feature) is in self._store first. If not, return "FEATURE_NOT_FOUND".',
      hint2: 'Compute age = time.time() - entry["ts"]. If age > self.ttl, return "FEATURE_STALE".',
      hint3: 'Otherwise return entry["value"]. The key insight: every feature has an age, and you enforce a freshness SLA.',
      target: 'FEATURE_STALE',
      successMsg: 'Feature TTL enforcement working. This is the core primitive that prevents stale features from silently poisoning model predictions.',
      quizPrompt: 'What is point-in-time correctness in ML feature engineering?',
      quizOptions: ['Only using feature values that were available at the time of the event being predicted, preventing label leakage', 'Using the most recent feature values for all training examples', 'Computing features at exactly midnight every day'],
      quizAnswer: 'Only using feature values that were available at the time of the event being predicted, preventing label leakage',
      quizExpl: 'Point-in-time correctness prevents you from accidentally including future information in your training features. Without it, your model learns to use information it cannot possibly have at prediction time.',
      refs: ['Feast feature store documentation', 'Tecton: the operational feature store', 'Chip Huyen: feature stores chapter'],
    },
    {
      title: 'Schema Evolution',
      narrative: `# Schema Evolution in ML Systems

Schemas change. A column gets renamed. A null field becomes required. A value range shifts. In traditional software, schema migrations are painful but manageable because the code explicitly handles the old and new schema. In ML systems, schema evolution is catastrophic because the model learned the old schema implicitly.

## The Three Types of Breaking Changes

**Column removal**: your model expects a "user_age" column. The upstream team renames it "age_years". The model gets NaN for every prediction. No error. Silent garbage.

**Type change**: "price" changes from float to string (e.g., "$12.99" instead of 12.99). Your normalization layer fails silently on NaN coercions.

**Distribution shift masquerading as schema change**: "income" column switches from annual to monthly. Values are still floats. Still in the right range. But the model's learned weights are wrong.

## Defensive Schema Validation

Your pipeline should validate incoming data schemas at every stage boundary:

\`\`\`python
expected_schema = {"age": float, "income": float, "is_employed": bool}

def validate_schema(df: dict, expected: dict) -> None:
    for col, dtype in expected.items():
        if col not in df:
            raise SchemaError(f"Missing column: {col}")
        if not isinstance(df[col], dtype):
            raise SchemaError(f"Column {col}: expected {dtype}, got {type(df[col])}")
\`\`\`

## The Principal-Level Takeaway

Schema contracts are the API contract for ML systems. Just as you would version and validate a REST API's request/response schema, you must version and validate the feature schema. Schema changes without coordination are ML incidents waiting to happen.

### 💡 Trending in 2026: Schema Registries
> Apache Avro and Confluent Schema Registry are increasingly used in ML feature pipelines. Every feature table has a registered schema version. When a producer publishes a new schema version, consumers are automatically notified and can validate compatibility before consuming.
`,
      labId: 'schema-validator-lab',
      labTitle: 'Lab — Schema Validator',
      labObjective: 'Build a schema validator that detects breaking changes when a new dataset schema differs from the expected schema.',
      mainPy: `from schema import SchemaValidator

expected = {"age": float, "income": float, "is_employed": bool}
valid_data = {"age": 32.0, "income": 55000.0, "is_employed": True}
invalid_data = {"age": "thirty-two", "income": 55000.0}  # wrong type + missing field

if __name__ == "__main__":
    print("--- SCHEMA VALIDATION ---")
    validator = SchemaValidator(expected)
    validator.validate(valid_data, "valid_data")
    validator.validate(invalid_data, "invalid_data")`,
      editPyPath: 'schema.py',
      editPy: `class SchemaValidator:
    def __init__(self, expected_schema: dict):
        self.schema = expected_schema

    def validate(self, data: dict, label: str) -> bool:
        """
        Check data against expected_schema:
        1. For each column in expected_schema:
           - If missing from data: print "SCHEMA VIOLATION in {label}: missing column {col}"
           - If wrong type: print "SCHEMA VIOLATION in {label}: {col} expected {expected}, got {actual}"
        2. If all checks pass: print "SCHEMA VALID: {label}"
        Return True if valid, False if any violation found.
        """
        # TODO: implement
        pass`,
      solutionPy: `class SchemaValidator:
    def __init__(self, expected_schema: dict):
        self.schema = expected_schema

    def validate(self, data: dict, label: str) -> bool:
        violations = []
        for col, expected_type in self.schema.items():
            if col not in data:
                violations.append(f"missing column {col}")
                print(f"SCHEMA VIOLATION in {label}: missing column {col}")
            elif not isinstance(data[col], expected_type):
                violations.append(f"{col} wrong type")
                print(f"SCHEMA VIOLATION in {label}: {col} expected {expected_type.__name__}, got {type(data[col]).__name__}")
        if not violations:
            print(f"SCHEMA VALID: {label}")
            return True
        return False`,
      hint1: 'Loop over self.schema.items() to get each (column_name, expected_type) pair.',
      hint2: 'Check column presence with: if col not in data. Check type with isinstance(data[col], expected_type).',
      hint3: 'Track violations in a list. If violations is empty at the end, print "SCHEMA VALID: {label}" and return True.',
      target: 'SCHEMA VIOLATION',
      successMsg: 'Schema validation working. This is the defensive layer that catches breaking schema changes before they reach your model.',
      quizPrompt: 'Which schema change is the most dangerous in an ML system?',
      quizOptions: ['A value range change that keeps the type the same (e.g., income switching from annual to monthly)', 'Adding a new optional column to the dataset', 'Changing a column name with a clear migration plan'],
      quizAnswer: 'A value range change that keeps the type the same (e.g., income switching from annual to monthly)',
      quizExpl: 'Type changes and missing columns produce errors that are catchable. A value range change with the same type passes all type checks and produces silent garbage predictions. The model was trained on values in range [0, 500000]; it now receives values in range [0, 42000] and misinterprets every prediction.',
      refs: ['Apache Avro schema evolution', 'Great Expectations: data validation docs', 'Delta Lake: schema enforcement'],
    },
    { title: 'Data Quality Assertions', narrative: `# Data Quality Assertions\n\nData quality in ML is not about data being "correct" in some abstract sense. It is about data meeting the operational assumptions your model was trained on.\n\n## What Great Expectations Does\n\nGreat Expectations (GE) is a Python library for data validation. You define "expectations" about your data — column-level assertions — and GE validates them. An expectation is a testable hypothesis: "the 'age' column should have values between 0 and 120," "the 'email' column should match an email regex," "there should be no null values in 'user_id'."\n\nGE runs these expectations against your actual data and produces a validation result: passed or failed, with row-level detail on failures.\n\n## The Four Categories of Useful Expectations\n\n**Completeness**: no nulls in required columns. A null in a required feature is a silent zero that poisons the model.\n\n**Range**: numeric columns within expected bounds. Age should not be -1 or 500.\n\n**Uniqueness**: primary keys should be unique. Duplicate rows mean the model trains on the same example multiple times.\n\n**Distribution**: the mean and standard deviation of key columns should be within N standard deviations of the training distribution. Significant distribution shift is an early warning of concept drift.\n\n## The Principal-Level Takeaway\n\nData quality assertions are the unit tests for your data pipeline. Just as you would not ship code without tests, you should not run a training pipeline on data without assertions. The cost of a false negative (bad data passes assertions) is a degraded model. The cost of a false positive (good data fails assertions) is a blocked pipeline. Tune your thresholds accordingly.\n\n### 💡 Trending in 2026: LLM-Powered Data Quality\n> Teams are now using LLMs to write data quality assertions from a natural language description of the expected data. You describe "this column contains US zip codes" and the LLM generates the regex expectation automatically. This lowers the barrier for defining quality checks on unstructured text features.`, labId: 'data-quality-lab', labTitle: 'Lab — Data Quality Assertions', labObjective: 'Implement a DataQualityPipeline that runs assertions on a dataset and reports violations.', mainPy: `from quality import DataQualityPipeline\n\ndataset = [\n    {"age": 25.0, "income": 45000.0, "label": 0},\n    {"age": -5.0, "income": 60000.0, "label": 1},  # invalid age\n    {"age": 33.0, "income": None, "label": 0},     # null income\n    {"age": 180.0, "income": 75000.0, "label": 1}, # age too high\n]\n\nif __name__ == "__main__":\n    print("--- DATA QUALITY AUDIT ---")\n    pipeline = DataQualityPipeline()\n    pipeline.add_range_check("age", min_val=0.0, max_val=120.0)\n    pipeline.add_not_null_check("income")\n    pipeline.run(dataset)`, editPyPath: 'quality.py', editPy: `class DataQualityPipeline:\n    def __init__(self):\n        self._checks = []\n\n    def add_range_check(self, column: str, min_val: float, max_val: float) -> None:\n        self._checks.append(("range", column, min_val, max_val))\n\n    def add_not_null_check(self, column: str) -> None:\n        self._checks.append(("not_null", column))\n\n    def run(self, dataset: list[dict]) -> None:\n        """\n        Run all checks against each row.\n        For range violation: print "VIOLATION row {i}: {col}={val} out of range [{min},{max})"\n        For null violation: print "VIOLATION row {i}: {col} is null"\n        At end: print "DATA QUALITY PASSED" if no violations, else "DATA QUALITY FAILED: {n} violations"\n        """\n        # TODO: implement\n        pass`, solutionPy: `class DataQualityPipeline:\n    def __init__(self):\n        self._checks = []\n\n    def add_range_check(self, column: str, min_val: float, max_val: float) -> None:\n        self._checks.append(("range", column, min_val, max_val))\n\n    def add_not_null_check(self, column: str) -> None:\n        self._checks.append(("not_null", column))\n\n    def run(self, dataset: list[dict]) -> None:\n        violations = 0\n        for i, row in enumerate(dataset):\n            for check in self._checks:\n                if check[0] == "range":\n                    _, col, min_val, max_val = check\n                    val = row.get(col)\n                    if val is not None and not (min_val <= val <= max_val):\n                        print(f"VIOLATION row {i}: {col}={val} out of range [{min_val},{max_val}]")\n                        violations += 1\n                elif check[0] == "not_null":\n                    _, col = check\n                    if row.get(col) is None:\n                        print(f"VIOLATION row {i}: {col} is null")\n                        violations += 1\n        if violations == 0:\n            print("DATA QUALITY PASSED")\n        else:\n            print(f"DATA QUALITY FAILED: {violations} violations")`, hint1: 'Loop over enumerate(dataset) to get row index and row dict.', hint2: 'For each row, loop over self._checks. Use check[0] to distinguish "range" from "not_null" checks.', hint3: 'Count violations. At the end, print "DATA QUALITY PASSED" if violations == 0, else "DATA QUALITY FAILED: {violations} violations".', target: 'DATA QUALITY FAILED', successMsg: 'Data quality pipeline working. 3 violations detected. This is the Great Expectations validation model at its core.', quizPrompt: 'Why are data quality assertions different from model evaluation metrics?', quizOptions: ['Assertions check input data properties; evaluation metrics check model output quality — both are needed', 'Assertions are only for production; metrics are only for development', 'Assertions are faster to compute than metrics'], quizAnswer: 'Assertions check input data properties; evaluation metrics check model output quality — both are needed', quizExpl: 'A model can pass all evaluation metrics on clean test data but fail in production if the production data has quality issues. Assertions catch the data quality problems before they reach the model.', refs: ['Great Expectations documentation', 'dbt: data testing', 'Apache Iceberg: data quality'] },
    { title: 'Batch vs Streaming Features', narrative: `# Batch vs Streaming Features\n\nFeature pipelines come in two flavors: batch and streaming. The choice affects latency, infrastructure complexity, and what kinds of ML use cases you can support.\n\n## Batch Features\n\nBatch features are computed periodically on a snapshot of data. A nightly job reads all user activity from the past 30 days and computes "total purchases" and "average session length" for each user. These features are then stored in a feature store and served to models.\n\nBatch features are simple: SQL queries, Spark jobs, pandas DataFrames. They have high throughput and can process historical backfills easily. Their latency is inherent: a feature computed at midnight is 23 hours stale by 11pm.\n\n## Streaming Features\n\nStreaming features are computed in real-time as events arrive. When a user adds an item to their cart, the "items in cart" feature updates immediately. This is done by processing the event stream (Kafka, Kinesis) and updating the feature store in real-time.\n\nStreaming features enable low-latency ML use cases: fraud detection (score each transaction within milliseconds), recommendation systems (update preferences based on the last click), and anomaly detection (detect drift in real-time).\n\nThe infrastructure cost is significant: you need a message broker, a stream processor (Flink, Kafka Streams), a low-latency serving store (Redis, DynamoDB), and operational expertise to run all of it.\n\n## The Principal-Level Takeaway\n\nMost ML systems start with batch features and add streaming features only when batch latency becomes a business problem. The mistake is building streaming infrastructure prematurely. Ask: "What is the maximum acceptable feature staleness for this use case?" If the answer is hours or days, batch is correct. If the answer is seconds, you need streaming.\n\n### 💡 Trending in 2026: Feature Freshness SLAs\n> Feature stores now support freshness SLA monitoring: if a feature table has not been updated within its SLA window, the feature store automatically returns STALE status and the model falls back to a default prediction rather than serving stale features silently.`, labId: 'batch-streaming-lab', labTitle: 'Lab — Freshness-Aware Feature Server', labObjective: 'Simulate a feature server that tracks feature freshness and enforces SLAs, returning different responses based on feature age.', mainPy: `from feature_server import FreshnessAwareServer\nimport time\n\nserver = FreshnessAwareServer()\nserver.update("user_A", "session_count", 12.0, freshness_sla_seconds=2)\nserver.update("user_B", "session_count", 8.0, freshness_sla_seconds=2)\n\nif __name__ == "__main__":\n    print("--- FRESHNESS SLA CHECK ---")\n    print(server.serve("user_A", "session_count"))\n    print(server.serve("user_C", "session_count"))\n    time.sleep(3)\n    print("\\nAfter SLA breach:")\n    print(server.serve("user_A", "session_count"))`, editPyPath: 'feature_server.py', editPy: `import time\n\nclass FreshnessAwareServer:\n    def __init__(self):\n        self._features: dict = {}\n\n    def update(self, entity: str, feature: str, value: float, freshness_sla_seconds: float) -> None:\n        """Store feature with timestamp and SLA."""\n        self._features[(entity, feature)] = {\n            "value": value, "ts": time.time(), "sla": freshness_sla_seconds\n        }\n\n    def serve(self, entity: str, feature: str) -> str:\n        """\n        Return feature value as string, or:\n        - "MISSING" if not found\n        - "SLA_BREACH: {feature} stale by {n:.1f}s" if older than SLA\n        """\n        # TODO: implement\n        pass`, solutionPy: `import time\n\nclass FreshnessAwareServer:\n    def __init__(self):\n        self._features: dict = {}\n\n    def update(self, entity: str, feature: str, value: float, freshness_sla_seconds: float) -> None:\n        self._features[(entity, feature)] = {\n            "value": value, "ts": time.time(), "sla": freshness_sla_seconds\n        }\n\n    def serve(self, entity: str, feature: str) -> str:\n        key = (entity, feature)\n        if key not in self._features:\n            return "MISSING"\n        entry = self._features[key]\n        age = time.time() - entry["ts"]\n        if age > entry["sla"]:\n            overage = age - entry["sla"]\n            return f"SLA_BREACH: {feature} stale by {overage:.1f}s"\n        return str(entry["value"])`, hint1: 'Check key = (entity, feature) in self._features first.', hint2: 'Compute age = time.time() - entry["ts"]. Compare against entry["sla"].', hint3: 'For SLA breach: overage = age - entry["sla"]. Return the formatted string with the overage.', target: 'SLA_BREACH', successMsg: 'Feature freshness SLA enforcement working. This is exactly what Feast and Tecton do with feature materialization deadlines.', quizPrompt: 'When should you NOT build a streaming feature pipeline?', quizOptions: ['When batch feature latency (hours) is acceptable for the use case', 'When you have more than 1 million users', 'When features are numeric rather than categorical'], quizAnswer: 'When batch feature latency (hours) is acceptable for the use case', quizExpl: 'Streaming infrastructure is significantly more complex to build and operate. If your use case can tolerate batch freshness, that complexity buys you nothing. Always start with batch and upgrade to streaming when latency becomes a business constraint.', refs: ['Feast: batch and streaming feature pipelines', 'Apache Flink: stream processing', 'Redis as a low-latency feature store'] },
    { title: 'Data Pipeline Integration', narrative: `# Integrating Data Engineering into Your ML System\n\nToday you integrate Week 4's data engineering concepts into your ml-system-basics project.\n\n## What to Add\n\n1. **Schema validation** at the data ingestion point — validate before features are computed\n2. **Data quality assertions** — at least 3 assertions on the Iris dataset features\n3. **Feature freshness tracking** — log when features were computed and from what dataset version\n\n## The Integration Pattern\n\nYour training pipeline now looks like:\n\n\`\`\`\nload_data() → validate_schema() → run_quality_checks() → extract_features() → train() → evaluate() → save_artifact()\n\`\`\`\n\nEach arrow is an interface. Each interface has a contract. A contract violation at any stage should produce a loud, specific error — not a silent NaN.\n\n## Weekend Build Targets\n\n- Feature validation and freshness tracking in the serving path\n- Schema contract enforced at data loading time\n- Data quality report saved alongside the model artifact\n- Essay: "Data Engineering Pitfalls I Would Fix on Day One"`, labId: 'integration-lab', labTitle: 'Lab — Data Pipeline Integration Check', labObjective: 'Combine schema validation and data quality assertions into one pipeline check function.', mainPy: `from pipeline_check import run_data_pipeline_checks\n\ndataset = [\n    {"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2, "label": 0},\n    {"sepal_length": -1.0, "sepal_width": 3.0, "petal_length": 1.5, "petal_width": 0.1, "label": 1},\n    {"sepal_length": 6.3, "sepal_width": None, "petal_length": 4.9, "petal_width": 1.5, "label": 2},\n]\n\nif __name__ == "__main__":\n    print("--- DATA PIPELINE CHECKS ---")\n    passed = run_data_pipeline_checks(dataset)\n    print(f"Pipeline checks passed: {passed}")`, editPyPath: 'pipeline_check.py', editPy: `def run_data_pipeline_checks(dataset: list[dict]) -> bool:\n    """\n    Run these checks:\n    1. Schema: all rows must have sepal_length, sepal_width, petal_length, petal_width, label\n    2. Range: sepal_length must be > 0\n    3. Not null: sepal_width must not be None\n\n    For each violation print: "CHECK FAILED: {description}"\n    If all pass print: "ALL CHECKS PASSED"\n    Return True if no violations, False otherwise.\n    """\n    # TODO: implement\n    pass`, solutionPy: `def run_data_pipeline_checks(dataset: list[dict]) -> bool:\n    required_cols = ["sepal_length", "sepal_width", "petal_length", "petal_width", "label"]\n    violations = 0\n    for i, row in enumerate(dataset):\n        for col in required_cols:\n            if col not in row:\n                print(f"CHECK FAILED: row {i} missing column {col}")\n                violations += 1\n        sl = row.get("sepal_length")\n        if sl is not None and sl <= 0:\n            print(f"CHECK FAILED: row {i} sepal_length={sl} must be > 0")\n            violations += 1\n        sw = row.get("sepal_width")\n        if sw is None:\n            print(f"CHECK FAILED: row {i} sepal_width is null")\n            violations += 1\n    if violations == 0:\n        print("ALL CHECKS PASSED")\n        return True\n    return False`, hint1: 'Check for required columns first: for col in required_cols: if col not in row.', hint2: 'Range check: sl = row.get("sepal_length"); if sl is not None and sl <= 0.', hint3: 'Null check: sw = row.get("sepal_width"); if sw is None. Count all violations and print summary at the end.', target: 'CHECK FAILED', successMsg: 'Data pipeline checks working. 2 violations caught before they could reach the model.', quizPrompt: 'Why should data quality checks run before feature extraction, not after?', quizOptions: ['Bad input data produces bad features; checking after means you have already wasted the computation', 'Feature extraction is faster than quality checks', 'Quality checks require the original raw data format'], quizAnswer: 'Bad input data produces bad features; checking after means you have already wasted the computation', quizExpl: 'Fail fast is a core engineering principle. If the data is bad, there is no point computing features from it. Check the data first, reject early, save the downstream computation.', refs: ['Great Expectations: pipeline integration', 'dbt: testing in data pipelines'] },
  ],
  `# Saturday — Data Engineering Integration\n\nIntegrate schema validation, data quality assertions, and feature freshness tracking into ml-system-basics.\n\n**Block 1**: Add schema validation to the data loading step in train.py.\n\n**Block 2**: Add 5 Great Expectations-style assertions (implement them manually in Python).\n\n**Block 3**: Add feature freshness logging — print the dataset version hash and timestamp when features are computed.\n\n**Block 4**: Test with intentionally bad data — does every violation produce a loud, specific error?`,
  `# Sunday — Document and Write\n\n**Write: "Data Engineering Pitfalls I Would Fix on Day One"**\n\nImagine you join a team and their ML system has none of the data engineering safeguards from this week. What are the 3 most dangerous things missing? What would you fix first and why? What is the cost of each risk if left unfixed?\n\nTarget: 400–600 words. Focus on operational consequences, not just technical descriptions.`,
  ['Schema validation in ml-system-basics', 'Data quality assertions running in the pipeline', 'Essay: Data Engineering Pitfalls'],
);

export const mlopsWeek5: LearningWeek = makeWeek(
  'mlops-week-5', 'week-5', 5,
  'Model Deployment and Serving',
  'Latency, throughput, canary deployments, and production serving behavior.',
  'Week 5 focuses on what happens after the model is trained — serving it reliably at scale.',
  [
    { title: 'Serving Architecture', narrative: `# Model Serving Architecture\n\nModel serving is the discipline of exposing a trained model as a reliable service. "Reliable" means low latency, high availability, graceful degradation, and safe rollout.\n\n## Stateless vs Stateful Serving\n\nThe most important architectural decision: is your serving layer stateless or stateful?\n\n**Stateless**: each prediction request is independent. The model weights are loaded once at startup, but request processing does not depend on previous requests. Stateless servers can be horizontally scaled trivially — add more instances, put a load balancer in front, done.\n\n**Stateful**: the model or its context changes based on prior requests — a session-based recommendation model that updates its state with each click, or an LLM with conversation history. Stateful serving requires sticky sessions (routing each user to the same server) or shared state (a Redis cache for conversation history). This is significantly harder to scale and recover from failures.\n\n**The principal guidance**: design for stateless serving by default. Push state management to a dedicated state store (Redis, DynamoDB). The model server itself should be the compute layer, not the state layer.\n\n## REST vs gRPC\n\nFor internal high-throughput serving (another service calling your model server), gRPC is better: binary protocol, lower overhead, strongly-typed schemas via Protocol Buffers, bidirectional streaming. For external APIs or human-facing dashboards, REST is more compatible.\n\nTriton Inference Server, NVIDIA's production serving platform, exposes both REST and gRPC endpoints. Triton also handles batching, model versioning, and hardware acceleration automatically.\n\n## The Principal-Level Takeaway\n\nModel serving infrastructure is not a simple FastAPI wrapper around model.predict(). Production serving requires batching for throughput, circuit breakers for fault tolerance, health checks for orchestration, graceful draining for rolling deployments, and metrics for observability. These are the concerns that differentiate production ML infra from a local demo.\n\n### 💡 Trending in 2026: Serverless Model Serving\n> AWS Inferentia, Google TPU v5, and Modal have made serverless ML inference viable. You pay per invocation, scale to zero when not in use, and get automatic scaling. The tradeoff: cold start latency of 1–5 seconds makes serverless unsuitable for real-time use cases but excellent for batch inference and low-traffic endpoints.`, labId: 'serving-lab', labTitle: 'Lab — Model Request Handler', labObjective: 'Build a request handler that validates input, calls a mock model, and returns structured responses with error handling.', mainPy: `from server import ModelServer\n\nserver = ModelServer(mock_accuracy=0.95)\n\nrequests = [\n    {"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2},\n    {"sepal_length": -1.0, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2},\n    {"sepal_length": 6.3, "petal_length": 4.9, "petal_width": 1.5},\n]\n\nif __name__ == "__main__":\n    print("--- MODEL SERVING TEST ---")\n    for i, req in enumerate(requests):\n        result = server.predict(req)\n        print(f"Request {i+1}: {result}")`, editPyPath: 'server.py', editPy: `class ModelServer:\n    REQUIRED_FIELDS = ["sepal_length", "sepal_width", "petal_length", "petal_width"]\n\n    def __init__(self, mock_accuracy: float = 0.9):\n        self.mock_accuracy = mock_accuracy\n\n    def _validate(self, payload: dict) -> str | None:\n        """Return error string if invalid, None if valid."""\n        for field in self.REQUIRED_FIELDS:\n            if field not in payload:\n                return f"missing field: {field}"\n        for field in self.REQUIRED_FIELDS:\n            if payload[field] <= 0:\n                return f"invalid value: {field}={payload[field]}\"\n        return None\n\n    def predict(self, payload: dict) -> dict:\n        """\n        1. Validate the payload using _validate()\n        2. If invalid: return {"status": "error", "message": <error>}\n        3. If valid: return {"status": "ok", "prediction": 0, "confidence": self.mock_accuracy}\n        """\n        # TODO: implement\n        pass`, solutionPy: `class ModelServer:\n    REQUIRED_FIELDS = ["sepal_length", "sepal_width", "petal_length", "petal_width"]\n\n    def __init__(self, mock_accuracy: float = 0.9):\n        self.mock_accuracy = mock_accuracy\n\n    def _validate(self, payload: dict) -> str | None:\n        for field in self.REQUIRED_FIELDS:\n            if field not in payload:\n                return f"missing field: {field}"\n        for field in self.REQUIRED_FIELDS:\n            val = payload.get(field, 1)\n            if val is not None and val <= 0:\n                return f"invalid value: {field}={val}"\n        return None\n\n    def predict(self, payload: dict) -> dict:\n        error = self._validate(payload)\n        if error:\n            return {"status": "error", "message": error}\n        return {"status": "ok", "prediction": 0, "confidence": self.mock_accuracy}`, hint1: 'Call error = self._validate(payload) first.', hint2: 'If error is not None, return the error dict. If None, return the success dict.', hint3: 'The success dict should have status="ok", prediction (any int), and confidence=self.mock_accuracy.', target: 'status', successMsg: 'Model serving handler working. Input validation, error handling, and structured responses — the three essentials of a production serving endpoint.', quizPrompt: 'Why should a model serving layer be stateless?', quizOptions: ['Stateless servers can be scaled horizontally by adding instances behind a load balancer', 'Stateless servers use less memory', 'Stateless servers are required by HTTP'], quizAnswer: 'Stateless servers can be scaled horizontally by adding instances behind a load balancer', quizExpl: 'Horizontal scaling (adding more identical instances) is the standard way to scale web services. Stateless servers work perfectly with this model because any instance can handle any request. Stateful servers require routing logic and shared state management.', refs: ['FastAPI production deployment', 'NVIDIA Triton Inference Server docs', 'Chip Huyen: model serving chapter'] },
    { title: 'Batching and Latency', narrative: `# Batching for Throughput\n\nA single model prediction is fast. A thousand sequential predictions are not. Batching — grouping multiple requests and processing them together — is the standard technique for maximizing GPU utilization and throughput.\n\n## Why Batching Works\n\nGPUs are massively parallel processors designed for matrix operations. A forward pass on a batch of 32 samples takes nearly the same time as a forward pass on a single sample because the GPU can process all 32 in parallel. Batching amortizes the GPU kernel launch overhead and memory transfer overhead across many predictions.\n\n## The Latency-Throughput Tradeoff\n\nBatching improves throughput at the cost of latency. A request that arrives when the batch is just starting to fill must wait for more requests before being processed. For a batch size of 32 with a 10ms inter-request interval, the maximum wait time is 320ms — which might exceed your latency SLA.\n\nThe solution: **dynamic batching** with a timeout. Collect requests into a batch, but execute the batch either when it is full OR when a timeout fires, whichever comes first. This bounds the maximum added latency while still capturing batching benefits.\n\n## Continuous Batching for LLMs\n\nFor LLM inference, standard batching breaks because different requests generate different numbers of tokens. Some finish in 10 tokens, others in 500. With static batching, the whole batch waits for the longest sequence.\n\nvLLM introduced **continuous batching**: once a sequence finishes, its slot is immediately filled with the next waiting request. The batch is never idle. This dramatically improves GPU utilization for LLM serving.\n\n## The Principal-Level Takeaway\n\nBatching strategy is a serving infrastructure decision, not a model decision. You tune batch size and timeout to hit your latency SLO at your throughput target. The model is unchanged.\n\n### 💡 Trending in 2026: Speculative Decoding\n> vLLM and TensorRT-LLM support speculative decoding: a small draft model generates candidate tokens, a larger verifier model accepts or rejects them in parallel. This can double throughput for auto-regressive LLMs without changing output quality.`, labId: 'batching-lab', labTitle: 'Lab — Request Batcher', labObjective: 'Build a request batcher that collects requests until a batch is full, then processes them together.', mainPy: `from batcher import RequestBatcher\n\nbatcher = RequestBatcher(batch_size=3)\n\nrequests = [\n    {"id": 1, "features": [1.0, 2.0]},\n    {"id": 2, "features": [3.0, 4.0]},\n    {"id": 3, "features": [5.0, 6.0]},\n    {"id": 4, "features": [7.0, 8.0]},\n]\n\nif __name__ == "__main__":\n    print("--- BATCH PROCESSING ---")\n    for req in requests:\n        batcher.add(req)\n    batcher.flush()`, editPyPath: 'batcher.py', editPy: `class RequestBatcher:\n    def __init__(self, batch_size: int):\n        self.batch_size = batch_size\n        self._queue: list = []\n\n    def _process_batch(self, batch: list) -> None:\n        ids = [r["id"] for r in batch]\n        print(f"BATCH PROCESSED: {len(batch)} requests, ids={ids}")\n\n    def add(self, request: dict) -> None:\n        """\n        Add request to queue.\n        If queue reaches batch_size, process and clear the queue.\n        """\n        # TODO: implement\n        pass\n\n    def flush(self) -> None:\n        """Process any remaining requests in the queue."""\n        # TODO: implement\n        pass`, solutionPy: `class RequestBatcher:\n    def __init__(self, batch_size: int):\n        self.batch_size = batch_size\n        self._queue: list = []\n\n    def _process_batch(self, batch: list) -> None:\n        ids = [r["id"] for r in batch]\n        print(f"BATCH PROCESSED: {len(batch)} requests, ids={ids}")\n\n    def add(self, request: dict) -> None:\n        self._queue.append(request)\n        if len(self._queue) >= self.batch_size:\n            self._process_batch(self._queue)\n            self._queue = []\n\n    def flush(self) -> None:\n        if self._queue:\n            self._process_batch(self._queue)\n            self._queue = []`, hint1: 'In add(), append the request to self._queue, then check if len(self._queue) >= self.batch_size.', hint2: 'If the batch is full, call self._process_batch(self._queue) then set self._queue = [].', hint3: 'flush() processes any remaining items in self._queue if it is not empty.', target: 'BATCH PROCESSED', successMsg: 'Request batching working. This is the core pattern in TorchServe, Triton, and vLLM\'s batching engines.', quizPrompt: 'What does dynamic batching add to simple fixed-size batching?', quizOptions: ['A timeout that forces batch execution even when the batch is not full, bounding maximum latency', 'Automatic scaling of the batch size based on GPU memory', 'Compression of the batch to reduce memory usage'], quizAnswer: 'A timeout that forces batch execution even when the batch is not full, bounding maximum latency', quizExpl: 'Without a timeout, low-traffic periods cause requests to wait indefinitely for a full batch. A timeout bounds the maximum latency added by batching, making the system behave predictably even at low request rates.', refs: ['NVIDIA Triton: dynamic batching', 'vLLM: continuous batching paper', 'TorchServe: batching guide'] },
    { title: 'Model Serialization', narrative: `# Model Serialization\n\nA trained model exists in memory as a Python object. To serve it or store it, you need to serialize it — convert it to a binary format that can be loaded later. The choice of serialization format matters more than most engineers realize.\n\n## The Three Options\n\n**Pickle/joblib**: Python-native serialization. Simple, supports any scikit-learn model. The problem: pickle is Python-only and version-sensitive. A model pickled with sklearn 1.2 might not load correctly in sklearn 1.4. Cannot be served by non-Python runtimes.\n\n**ONNX (Open Neural Network Exchange)**: a language-neutral model format supported by PyTorch, TensorFlow, sklearn, and many others. An ONNX model can be loaded by the ONNX Runtime in Python, C++, Java, or any other language. Significantly faster than Python runtimes for inference. The limitation: some custom layers and operations are not supported in ONNX's operator set.\n\n**TorchScript**: PyTorch's intermediate representation for production models. A TorchScript model is a statically-analyzable computation graph that can be loaded and run without Python. Faster than Python-mode PyTorch and serialization-safe. The limitation: only works for PyTorch models.\n\n## The Principal-Level Takeaway\n\nChoose your serialization format based on your serving infrastructure. If you are serving with Python (FastAPI, Flask), joblib is fine. If you are serving with a polyglot system (Java gateway, C++ game server, mobile app), you need ONNX or TorchScript.\n\n### 💡 Trending in 2026: GGUF for LLMs\n> GGUF (GGML Unified Format) has become the dominant serialization format for quantized LLMs for local inference. llama.cpp and Ollama use GGUF to run billion-parameter models on CPUs and consumer GPUs. Understanding quantization formats is now a core MLOps skill.`, labId: 'serialization-lab', labTitle: 'Lab — Model Artifact Manager', labObjective: 'Build a model artifact manager that saves and loads model metadata alongside the serialized weights.', mainPy: `from artifact import ModelArtifactManager\nimport json\n\nmanager = ModelArtifactManager()\n\nmodel_data = {"weights": [0.1, -0.5, 0.3], "intercept": 0.02}\nmetadata = {"accuracy": 0.97, "config_hash": "abc123", "dataset_version": "v2", "format": "mock_pkl"}\n\nif __name__ == "__main__":\n    print("--- ARTIFACT MANAGEMENT ---")\n    artifact_id = manager.save("iris_v1", model_data, metadata)\n    print(f"Saved artifact: {artifact_id}")\n    loaded = manager.load(artifact_id)\n    print(f"Loaded artifact: accuracy={loaded['metadata']['accuracy']}")\n    print(f"ARTIFACT LOADED SUCCESSFULLY")`, editPyPath: 'artifact.py', editPy: `import json\nimport hashlib\n\nclass ModelArtifactManager:\n    def __init__(self):\n        self._registry: dict = {}\n\n    def save(self, name: str, model_data: dict, metadata: dict) -> str:\n        """\n        Create an artifact_id = sha256 of name + metadata\n        Store: registry[artifact_id] = {"name": name, "model": model_data, "metadata": metadata}\n        Return the artifact_id\n        """\n        # TODO: implement\n        pass\n\n    def load(self, artifact_id: str) -> dict:\n        """\n        Return the stored artifact dict or raise KeyError if not found\n        """\n        # TODO: implement\n        pass`, solutionPy: `import json\nimport hashlib\n\nclass ModelArtifactManager:\n    def __init__(self):\n        self._registry: dict = {}\n\n    def save(self, name: str, model_data: dict, metadata: dict) -> str:\n        key_material = json.dumps({"name": name, "metadata": metadata}, sort_keys=True)\n        artifact_id = hashlib.sha256(key_material.encode()).hexdigest()[:16]\n        self._registry[artifact_id] = {"name": name, "model": model_data, "metadata": metadata}\n        return artifact_id\n\n    def load(self, artifact_id: str) -> dict:\n        if artifact_id not in self._registry:\n            raise KeyError(f"Artifact not found: {artifact_id}")\n        return self._registry[artifact_id]`, hint1: 'Create the artifact_id by hashing the name + metadata using hashlib.sha256. Take the first 16 chars for readability.', hint2: 'Store the artifact in self._registry[artifact_id] as a dict with keys "name", "model", "metadata".', hint3: 'In load(), check if artifact_id is in self._registry. If not, raise KeyError. Otherwise return self._registry[artifact_id].', target: 'ARTIFACT LOADED SUCCESSFULLY', successMsg: 'Artifact management working. Every production ML system needs a model registry that links artifact IDs to the metadata that explains what the model is and how it was produced.', quizPrompt: 'Why is ONNX preferred over pickle for cross-language model serving?', quizOptions: ['ONNX is a language-neutral format that can be loaded by C++, Java, or any language with an ONNX runtime', 'ONNX files are always smaller than pickle files', 'ONNX automatically converts Python code to C++'], quizAnswer: 'ONNX is a language-neutral format that can be loaded by C++, Java, or any language with an ONNX runtime', quizExpl: 'Pickle is Python-specific and version-sensitive. ONNX models can be served by the ONNX Runtime in any language, making them portable across infrastructure choices.', refs: ['ONNX: open neural network exchange', 'joblib: model persistence', 'TorchScript documentation'] },
    { title: 'Canary Deployments', narrative: `# Canary Deployments for ML Models\n\nA canary deployment routes a small percentage of traffic to a new model version while the old version handles the majority. If the new model performs well on the canary traffic, you gradually increase the percentage until it handles 100% of traffic. If the new model degrades, you roll back by routing all traffic back to the old version.\n\n## Why ML Canaries Are Different from Service Canaries\n\nIn traditional software, a canary deployment gates on response latency and error rate. If the new service has >5% error rate, roll back.\n\nIn ML serving, the error is silent. A model can return 200 OK with a confident prediction that is wrong. You need to gate on **ML metrics** — not just HTTP metrics. For a classification model: accuracy on a labeled holdout set, or human-labeled samples of the canary traffic. For a recommendation model: click-through rate on canary users vs control users.\n\nThis requires online evaluation infrastructure: the ability to label canary predictions and compare them to the control group in near-real-time.\n\n## The Shadow Mode Pattern\n\nBefore a canary, run in **shadow mode**: route all production traffic to both models, but only return the old model's predictions. Log both models' outputs. Compute offline metrics on the shadow log.\n\nShadow mode is zero-risk: users never see the new model's output. You get production-traffic metrics without any user impact. Only after shadow mode shows acceptable performance do you move to a canary.\n\n## The Principal-Level Takeaway\n\nML deployment safety requires a staged evaluation process: offline evaluation → shadow mode → canary → full rollout. Skipping stages increases risk proportionally. The serving infrastructure must support traffic splitting, output logging, and metric collection for this process to work.\n\n### 💡 Trending in 2026: LLM Canaries\n> LLM prompt engineering changes are now treated as deployments with canary traffic. A/B testing prompts on a % of users, collecting LLM-as-a-judge scores on canary outputs, and rolling back if quality drops is now standard practice at teams running LLM-powered products.`, labId: 'canary-lab', labTitle: 'Lab — Traffic Router', labObjective: 'Build a canary traffic router that splits requests between old and new model versions based on a configurable percentage.', mainPy: `from router import CanaryRouter\n\nrouter = CanaryRouter(canary_percentage=30)\n\nrequests = list(range(10))\ncounts = {"control": 0, "canary": 0}\n\nfor _ in requests:\n    version = router.route()\n    counts[version] += 1\n\nif __name__ == "__main__":\n    print("--- CANARY ROUTING ---")\n    print(f"Control: {counts['control']}, Canary: {counts['canary']}")\n    print(f"ROUTING OPERATIONAL: canary_pct={router.canary_percentage}%")`, editPyPath: 'router.py', editPy: `import random\n\nclass CanaryRouter:\n    def __init__(self, canary_percentage: int):\n        self.canary_percentage = canary_percentage\n\n    def route(self) -> str:\n        """\n        Return "canary" with probability canary_percentage/100\n        Return "control" otherwise\n        \"\"\"\n        # TODO: implement\n        pass`, solutionPy: `import random\n\nclass CanaryRouter:\n    def __init__(self, canary_percentage: int):\n        self.canary_percentage = canary_percentage\n\n    def route(self) -> str:\n        if random.randint(1, 100) <= self.canary_percentage:\n            return "canary"\n        return "control"`, hint1: 'Use random.randint(1, 100) to get a random number from 1 to 100.', hint2: 'If the random number <= canary_percentage, return "canary". Otherwise return "control".', hint3: 'This gives exactly canary_percentage% of requests to the canary over a large sample.', target: 'ROUTING OPERATIONAL', successMsg: 'Canary routing working. This percentage-based routing is how Kubernetes canary deployments, AWS weighted target groups, and Istio traffic splitting work.', quizPrompt: 'What makes shadow mode safer than a direct canary deployment?', quizOptions: ['Shadow mode serves users the old model\'s output only, so new model errors never reach users', 'Shadow mode uses a separate server so it cannot cause latency', 'Shadow mode only runs on weekends when traffic is lower'], quizAnswer: 'Shadow mode serves users the old model\'s output only, so new model errors never reach users', quizExpl: 'Shadow mode is purely observational. Users get the production model\'s output regardless. The new model runs in parallel and its outputs are logged but never served. Zero risk to user experience.', refs: ['Kubernetes: canary deployments', 'Istio: traffic management', 'Chip Huyen: deployment chapter'] },
    { title: 'Load Testing and Benchmarking', narrative: `# Load Testing Your Serving System\n\nA model that performs beautifully in isolation often falls apart under production load. Load testing is the practice of simulating real traffic patterns against your serving system before deploying it.\n\n## What to Measure\n\n**p50 latency**: the median response time. Half of requests are faster, half are slower.\n**p95 latency**: 95% of requests respond within this time. Your most common SLA metric.\n**p99 latency**: 99% of requests respond within this time. The "long tail" — important for user experience at scale.\n**Throughput**: requests per second your system can handle before degrading.\n**Error rate**: percentage of requests that fail under load.\n\n## The Throughput Knee\n\nEvery serving system has a "knee" — a throughput level above which latency degrades sharply. Below the knee, the system handles requests quickly. Above it, queues build up and latency explodes. Your operating point should be well below the knee (typically 70% of max throughput) to maintain headroom for traffic spikes.\n\n## Weekend Build Target\n\nThis week's project (ml-system-basics serving) should be load-tested with a simple Python simulation. Measure: how many sequential predictions per second can your FastAPI server handle? What is the latency at 10 RPS vs 100 RPS? At what point does it degrade?\n\n## The Principal-Level Takeaway\n\nYou should never deploy a model server without knowing its throughput ceiling and latency profile. This is table stakes for production serving. Load test results should be documented alongside the model's accuracy metrics — they are equally important for deployment decisions.`, labId: 'load-test-lab', labTitle: 'Lab — Latency Percentile Calculator', labObjective: 'Implement a latency analyzer that computes p50, p95, and p99 from a list of response times.', mainPy: `from latency import LatencyAnalyzer\nimport random\n\nrandom.seed(42)\nresponse_times = [random.uniform(5, 50) for _ in range(95)] + [random.uniform(200, 500) for _ in range(5)]\n\nif __name__ == "__main__":\n    print("--- LATENCY ANALYSIS ---")\n    analyzer = LatencyAnalyzer(response_times)\n    analyzer.report()`, editPyPath: 'latency.py', editPy: `class LatencyAnalyzer:\n    def __init__(self, times_ms: list[float]):\n        self.times = sorted(times_ms)\n\n    def percentile(self, p: float) -> float:\n        """\n        Return the p-th percentile of self.times.\n        p is in [0, 100].\n        Use: index = int(len(self.times) * p / 100)\n        """\n        # TODO: implement\n        pass\n\n    def report(self) -> None:\n        """Print p50, p95, p99 and throughput estimate."""\n        # TODO: call self.percentile() and print results\n        # Print "LATENCY PROFILE COMPLETE" at the end\n        pass`, solutionPy: `class LatencyAnalyzer:\n    def __init__(self, times_ms: list[float]):\n        self.times = sorted(times_ms)\n\n    def percentile(self, p: float) -> float:\n        index = min(int(len(self.times) * p / 100), len(self.times) - 1)\n        return self.times[index]\n\n    def report(self) -> None:\n        p50 = self.percentile(50)\n        p95 = self.percentile(95)\n        p99 = self.percentile(99)\n        avg = sum(self.times) / len(self.times)\n        print(f"p50:  {p50:.1f}ms")\n        print(f"p95:  {p95:.1f}ms")\n        print(f"p99:  {p99:.1f}ms")\n        print(f"mean: {avg:.1f}ms")\n        print(f"n:    {len(self.times)} requests")\n        print("LATENCY PROFILE COMPLETE")`, hint1: 'Sort self.times in __init__ (already done). For percentile(p), compute index = int(len(self.times) * p / 100).', hint2: 'Use min(index, len(self.times) - 1) to avoid an off-by-one at exactly 100th percentile.', hint3: 'In report(), call percentile(50), percentile(95), percentile(99). Print each with a label. Print "LATENCY PROFILE COMPLETE" at the end.', target: 'LATENCY PROFILE COMPLETE', successMsg: 'Latency analysis working. p99 is in the 200-500ms range due to the 5 slow outlier requests — exactly the kind of tail latency that degrades user experience.', quizPrompt: 'Why measure p99 latency in addition to p50?', quizOptions: ['p99 captures the worst-case experience for 1 in 100 users, which often indicates a systemic tail latency problem', 'p99 is required by HTTP standards', 'p99 is faster to compute than the mean'], quizAnswer: 'p99 captures the worst-case experience for 1 in 100 users, which often indicates a systemic tail latency problem', quizExpl: 'The mean and p50 can look healthy while p99 is terrible. 1 in 100 users experiencing 10x normal latency is a real user experience problem. p99 is the standard SLA metric in production systems.', refs: ['Chip Huyen: model serving chapter', 'Locust: load testing tool', 'Gatling: performance testing'] },
  ],
  `# Saturday — Build the Serving System\n\nBuild the production serving layer for ml-system-basics.\n\n**Block 1**: Implement model loading with artifact manager. The server should load the latest model artifact on startup.\n\n**Block 2**: Add request batching to the prediction endpoint (batch size 8, timeout 50ms).\n\n**Block 3**: Write a load test simulation that measures p50/p95/p99 latency for 100 sequential predictions.\n\n**Block 4**: Add canary routing — implement a /predict-canary endpoint that randomly routes 20% of requests to a mock "new model version".`,
  `# Sunday — Benchmark Report and Writing\n\n**Write: "Serving Failure Modes — What I Would Instrument on Day One"**\n\nCover: training-serving skew in the serving path, model artifact missing at startup, p99 latency explosions under load, and canary rollbacks. What would you monitor? What SLOs would you set? What alerts would you create?\n\nAfter writing, create a benchmark document in the project: latency numbers at 10 RPS, 50 RPS, and 100 RPS (simulated). This is the model's "serving performance spec."`,
  ['Batched serving API', 'Canary routing implementation', 'Latency benchmark report', 'Essay: Serving Failure Modes'],
);

function makeOutlineWeek(id: string, slug: string, weekNum: number, title: string, theme: string, summary: string, outputs: string[]): LearningWeek {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const modules: LearningModule[] = days.map((day, i) => ({
    id: `${slug}-day-${i + 1}`,
    slug: `day-${i + 1}`,
    kind: 'day' as const,
    title: `${day} — ${title}`,
    durationLabel: '2 hours',
    schedule: ['0:00–1:00 Reading and concept study', '1:00–1:45 Notes and lab', '1:45–2:00 Reflection'],
    summary: `${day} focus: ${theme}`,
    narrative: `# ${day} — ${title}\n\nThis module continues the week's theme of **${theme}**.\n\nOpen your notes from the previous day. Read one strong primary source today. Write down what breaks in production. Complete the lab. Do not skip the reflection.\n\n## Today's Focus\n\n${theme}\n\n## The Principal-Level Lens\n\nFor every concept today, ask: "How does this break? How do I detect it? How do I recover?" That is the operational mental model for principal-level engineers.`,
    outcomes: ['Understand the core concept.', 'Complete the lab.', 'Write a reflection.'],
    tasks: [
      { id: `${slug}-d${i + 1}-read`, label: 'Complete the reading block.', type: 'reading' as const, required: true },
      { id: `${slug}-d${i + 1}-notes`, label: 'Write notes in your own words.', type: 'notes' as const, required: true },
      { id: `${slug}-d${i + 1}-reflect`, label: 'Write the reflection entry.', type: 'reflection' as const, required: true },
    ],
    reflectionPrompts: ['What became clearer today?', 'What would break in production?'],
    deliverables: ['Notes entry', 'Reflection entry'],
    references: [{ title: `Primary reading for Week ${weekNum} ${theme}`, kind: 'docs' as const, required: true }],
  }));

  modules.push(
    {
      id: `${slug}-sat`,
      slug: 'saturday',
      kind: 'weekend' as const,
      title: 'Saturday — Deep Build',
      durationLabel: '6–8 hours',
      schedule: ['Block 1 (2 hrs): core implementation', 'Block 2 (2 hrs): extend and validate', 'Block 3 (2 hrs): debug', 'Block 4 (1–2 hrs): document'],
      summary: 'Saturday is where systems become software.',
      narrative: `# Saturday — Build\n\nApply this week's concepts in the project workspace. Build the target system for Week ${weekNum}. Document failure paths.`,
      outcomes: ['Working build.', 'Failure paths tested.'],
      tasks: [
        { id: `${slug}-sat-build`, label: 'Finish the main build.', type: 'project' as const, required: true },
        { id: `${slug}-sat-debug`, label: 'Debug and harden.', type: 'coding' as const, required: true },
      ],
      reflectionPrompts: ['What was harder than expected?'],
      deliverables: ['Build artifact', 'Debug notes'],
      references: [],
    },
    {
      id: `${slug}-sun`,
      slug: 'sunday',
      kind: 'weekend' as const,
      title: 'Sunday — Writing and Review',
      durationLabel: '6–8 hours',
      schedule: ['Block 1 (2 hrs): failure simulation', 'Block 2 (2 hrs): write the weekly artifact', 'Block 3 (2 hrs): documentation', 'Block 4 (1–2 hrs): next week prep'],
      summary: 'Sunday proves understanding through writing.',
      narrative: `# Sunday — Write\n\nWrite the weekly essay. Explain the system's failure modes in your own words. Update the project README.`,
      outcomes: ['Written artifact.', 'Updated documentation.'],
      tasks: [
        { id: `${slug}-sun-write`, label: 'Write the weekly essay.', type: 'writing' as const, required: true },
        { id: `${slug}-sun-docs`, label: 'Update README and operator notes.', type: 'writing' as const, required: true },
      ],
      reflectionPrompts: ['Are you ready to move to next week?'],
      deliverables: ['Weekly essay', 'Updated documentation'],
      references: [],
    }
  );

  return {
    id, slug,
    title: `Week ${weekNum} — ${title}`,
    theme, summary,
    commitment: '2 hours on weekdays, 6–8 hours each weekend day',
    outputs, modules,
  };
}

export const mlopsWeek6 = makeOutlineWeek('mlops-week-6', 'week-6', 6, 'Distributed Systems for ML', 'CAP theorem, Kafka, message queues, and coordination primitives for ML infrastructure.', 'Week 6 bridges backend distributed systems knowledge directly to ML infrastructure design.', ['Kafka consumer with graceful shutdown', 'DLQ for unprocessable events', 'CAP analysis notes']);
export const mlopsWeek7 = makeOutlineWeek('mlops-week-7', 'week-7', 7, 'Container Orchestration and Kubernetes for ML', 'Kubernetes, GPU scheduling, Helm, Kustomize, and ML workflow orchestration.', 'Week 7 teaches you to deploy and manage ML systems on Kubernetes.', ['Helm chart for inference server', 'Kustomize overlay for local deployment', 'GPU scheduling notes']);
export const mlopsWeek8 = makeOutlineWeek('mlops-week-8', 'week-8', 8, 'Data Parallelism and Distributed Training Fundamentals', 'PyTorch DDP, AllReduce, gradient synchronization, and scaling efficiency.', 'Week 8 teaches how multi-GPU and distributed training systems work at the systems level.', ['DDP training script', 'Speedup analysis', 'Gradient accumulation notes']);
export const mlopsWeek9 = makeOutlineWeek('mlops-week-9', 'week-9', 9, 'LLM Inference Systems', 'KV cache, continuous batching, speculative decoding, vLLM internals, and token economics.', 'Week 9 expands MLOps into modern LLM inference engineering — the fastest-moving area of AI infra.', ['LLM inference architecture memo', 'Throughput benchmark', 'Cost optimization analysis']);
export const mlopsWeek10 = makeOutlineWeek('mlops-week-10', 'week-10', 10, 'Principal-Level Architecture', 'Architecture review memos, platform roadmaps, build vs buy, and SLOs for ML systems.', 'Week 10 converts technical depth into principal-engineer artifacts: memos, tradeoffs, and platform design.', ['Architecture review memo', 'Platform roadmap', 'Operational maturity scorecard']);
