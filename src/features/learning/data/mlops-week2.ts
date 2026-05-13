import type { LearningWeek } from '@/features/learning/types';

export const mlopsWeek2: LearningWeek = {
  id: 'mlops-week-2',
  slug: 'week-2',
  title: 'Week 2 — Reproducibility and Experimentation',
  theme: 'Turn one-off training scripts into reproducible, trackable engineering workflows.',
  summary:
    'This week you learn that "it worked on my machine" is the most expensive sentence in ML engineering. You will build the habits and tooling to make every training run deterministic, traceable, and comparable.',
  commitment: '2 hours on weekdays, 6–8 hours each weekend day',
  outputs: [
    'Reproducible training pipeline with config-driven execution',
    'Experiment tracker with run comparison',
    'Dataset versioning system',
    'Essay: Why Reproducibility Is a First-Class Engineering Concern',
  ],
  modules: [
    {
      id: 'week-2-day-1',
      slug: 'day-1',
      kind: 'day',
      title: 'Day 1 — Determinism and Why It Breaks',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Reading: what is determinism in ML, all sources of non-determinism',
        '1:00–1:45 Lab: implement a config hasher to lock experiment identity',
        '1:45–2:00 Reflection: where in your system are random decisions invisible?',
      ],
      summary: 'Determinism is the foundation of reproducibility. Today you learn why it is harder than setting a random seed.',
      narrative: `# Day 1 — Determinism and Why It Breaks

You have probably seen this before: you train a model, get 94% accuracy, write it down, and then rerun the exact same script an hour later and get 93.1%. The code did not change. The data did not change. But the result did.

This is the determinism problem, and at the principal level, it is not an annoyance — it is an engineering failure.

## What Makes a Training Run Non-Deterministic

### 1. Random Seeds Are Not Enough

Setting \`random_seed=42\` is the bare minimum, not the solution. In a real training pipeline, randomness enters from multiple independent sources:

- **Python's \`random\` module**: global state, not tied to NumPy or PyTorch
- **NumPy's RNG**: separate state from PyTorch's
- **PyTorch's CUDA operations**: many GPU kernels are non-deterministic by default for performance (e.g., atomic adds in convolutions)
- **DataLoader shuffle**: if shuffle=True and you do not set a generator seed, every run reorders the training data differently
- **Model weight initialization**: any call to kaiming or xavier initialization uses the RNG at the time of calling

Setting \`torch.manual_seed(42)\` only seeds the CPU RNG. For full determinism you need \`torch.cuda.manual_seed_all(42)\`, \`torch.use_deterministic_algorithms(True)\`, and \`CUBLAS_WORKSPACE_CONFIG=:4096:8\` as an environment variable.

**The backend analogy**: this is like having a REST handler that sometimes returns different results for the same input depending on which thread picked it up, which connection pool slot was used, and what was already in the L1 cache. You would never ship that.

### 2. Floating-Point Order Matters

GPUs use massive parallelism. When you sum a million floating-point numbers, the order in which partial sums are computed changes the result at the last few significant digits due to floating-point associativity rules. This is not a bug — it is physics. The implication: two different hardware configurations (different GPU count, different batch sizes leading to different chunk boundaries) can produce different loss values for the same math.

**The principal-level implication**: you cannot compare two training runs unless you control for hardware configuration and batch size. Changing from 4 GPUs to 8 GPUs is not just a parallelism change — it is potentially a model quality change.

### 3. Data Pipeline Ordering

If your data pipeline reads from a database, a distributed filesystem, or a message queue, the order of records may vary between runs. Even if you set shuffle=False in your DataLoader, if the upstream source returns records in a different order, you have non-determinism.

**The fix**: always hash the dataset before training and store that hash with the model artifact. If the hashes differ between runs, you have a data ordering issue.

### 4. Library Version Drift

sklearn 1.2 and sklearn 1.3 produce different decision tree splits for the same random seed due to algorithm improvements. PyTorch version bumps sometimes change default initialization schemes. **The fix**: lock all dependencies with a hash-pinned \`requirements.txt\` or \`Pipfile.lock\`.

## Config Identity: Hashing Your Experiment

The most practical tool for managing reproducibility is config hashing. Every training run should produce a single config hash that uniquely identifies the combination of: dataset version, model architecture params, training hyperparameters, and library versions. If two runs have the same config hash but different outcomes, you have found a true non-determinism bug. If they have different hashes, the experiments are not comparable by design.

## The Principal-Level Takeaway

At the principal level, reproducibility is not about being able to repeat a single experiment. It is about having an audit trail so that when a model degrades in production six months from now, you can identify exactly which training run, which dataset snapshot, and which configuration produced the model that was deployed. Without this, debugging production ML is archaeological work.

---

### 💡 Trending in 2026: Deterministic Serving

> Beyond training, 2026 has seen growing focus on inference determinism. LLM sampling with temperature > 0 is inherently non-deterministic, but systems like vLLM now support **deterministic replay mode** for debugging: given the same prompt and the same RNG seed, you get the same tokens. This is essential for reproducing production failures in LLM-based systems.
`,
      outcomes: [
        'Name at least four independent sources of non-determinism in an ML training run.',
        'Explain why setting one random seed is not sufficient for determinism.',
        'Implement a config hasher that produces a stable, canonical hash for a training configuration.',
      ],
      tasks: [
        { id: 'w2d1-read', label: 'Understand all four sources of non-determinism covered in the reading.', type: 'reading', required: true },
        { id: 'w2d1-lab', label: 'Complete the config hasher lab.', type: 'coding', required: true },
        { id: 'w2d1-reflect', label: 'Write your reflection on invisible randomness in your own systems.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w2d1-q1',
          prompt: 'You set torch.manual_seed(42) and still get different results on different runs. What is the most likely cause?',
          options: [
            'GPU CUDA operations are non-deterministic by default for performance reasons',
            'The seed number 42 is too small to ensure uniqueness',
            'Python dictionaries are always randomly ordered',
          ],
          answer: 'GPU CUDA operations are non-deterministic by default for performance reasons',
          explanation: 'Many CUDA operations (like atomicAdd in reductions) use non-deterministic ordering for speed. You need torch.use_deterministic_algorithms(True) and the CUBLAS environment variable to enforce full GPU determinism.',
        },
      ],
      labs: [
        {
          id: 'config-hasher-lab',
          title: 'Lab — Config Identity Hasher',
          objective: 'Implement a function that produces a canonical, order-independent SHA256 hash of a training configuration dict, then verify that dict key order does not affect the hash.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from hasher import hash_config, verify_reproducibility

config_a = {"model_type": "logistic_regression", "learning_rate": 0.01, "seed": 42, "epochs": 100}
config_b = {"epochs": 100, "seed": 42, "model_type": "logistic_regression", "learning_rate": 0.01}
config_c = {"model_type": "logistic_regression", "learning_rate": 0.02, "seed": 42, "epochs": 100}

if __name__ == "__main__":
    print("--- CONFIG IDENTITY AUDIT ---")
    verify_reproducibility(config_a, config_b, "v1 vs v2 (same params, different key order)")
    verify_reproducibility(config_a, config_c, "v1 vs v3 (different learning_rate)")
`,
            },
            {
              path: 'hasher.py',
              language: 'python',
              content: `import hashlib
import json

def hash_config(config: dict) -> str:
    """
    Produce a canonical SHA256 hash of a training config dict.

    Steps:
    1. Serialize to JSON with sort_keys=True (makes dict ordering irrelevant)
    2. Encode to UTF-8 bytes
    3. Return the hex digest of the SHA256 hash

    Why sort_keys? {"a": 1, "b": 2} and {"b": 2, "a": 1} must produce
    the same hash — they represent the same experiment config.
    """
    # ── Step 1: Create a canonical JSON string ────────────────────
    # json.dumps(data, sort_keys=True) gives you a stable string even
    # when the original dict key order is different.
    # TODO: assign the canonical JSON string to a variable

    # ── Step 2: Convert the string to bytes ───────────────────────
    # Hash functions consume bytes, not Python str objects.
    # Syntax:
    #   some_bytes = some_string.encode("utf-8")
    # TODO: encode the canonical JSON string

    # ── Step 3: Hash and return the hex digest ────────────────────
    # Use hashlib.sha256(bytes_value).hexdigest()
    # TODO: return the SHA256 hex digest
    pass


def verify_reproducibility(config_a: dict, config_b: dict, label: str):
    hash_a = hash_config(config_a)
    hash_b = hash_config(config_b)
    if hash_a is None:
        print(f"hash_config returned None — implement the function first")
        return
    if hash_a == hash_b:
        print(f"REPRODUCIBILITY VERIFIED: {label}")
    else:
        print(f"MISMATCH DETECTED: {label} (hashes differ as expected)")
`,
              solution: `import hashlib
import json

def hash_config(config: dict) -> str:
    canonical = json.dumps(config, sort_keys=True).encode('utf-8')
    return hashlib.sha256(canonical).hexdigest()


def verify_reproducibility(config_a: dict, config_b: dict, label: str):
    hash_a = hash_config(config_a)
    hash_b = hash_config(config_b)
    if hash_a == hash_b:
        print(f"REPRODUCIBILITY VERIFIED: {label}")
    else:
        print(f"MISMATCH DETECTED: {label} (hashes differ as expected)")
`,
            },
          ],
          hints: [
            'Use json.dumps(config, sort_keys=True) — the sort_keys flag is the key insight here. Without it, two dicts with the same content but different key insertion order produce different JSON strings.',
            'Encode the JSON string to bytes before hashing: .encode("utf-8"). hashlib.sha256() expects bytes, not a string.',
            'Return hashlib.sha256(canonical).hexdigest() — hexdigest() gives you the readable hex string (64 chars), not raw bytes.',
          ],
          validation: {
            mode: 'python_output',
            target: 'REPRODUCIBILITY VERIFIED',
            successMessage: 'Config identity hashing works correctly. You can now attach this hash to every model artifact as a tamper-evident experiment fingerprint.',
          },
        },
      ],
      reflectionPrompts: [
        'Where in your current systems (ML or otherwise) do you suspect hidden non-determinism that you have never explicitly audited?',
        'What would it take to add config hashing to every training run you have access to?',
      ],
      deliverables: ['Config hasher lab completed', 'Reflection entry written'],
      references: [
        { title: 'PyTorch Reproducibility docs', kind: 'docs', required: true },
        { title: 'Designing Machine Learning Systems, Ch 4–6', author: 'Chip Huyen', kind: 'book' },
        { title: 'MLflow Concepts: Experiments, Runs, Artifacts', kind: 'docs' },
      ],
    },
    {
      id: 'week-2-day-2',
      slug: 'day-2',
      kind: 'day',
      title: 'Day 2 — Experiment Tracking Internals',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Reading: what MLflow actually stores, the experiment → run → artifact hierarchy',
        '1:00–1:45 Lab: build a minimal experiment tracker with run comparison',
        '1:45–2:00 Reflection: what does your current workflow lose when you have no tracking?',
      ],
      summary: 'Experiment tracking is version control for the scientific process of model building.',
      narrative: `# Day 2 — Experiment Tracking Internals

Imagine you have trained 200 models over six weeks. You need to answer: which model performed best on the validation set when the learning rate was below 0.005 and the dataset size was over 50,000 samples? Without experiment tracking, this is an exercise in archaeology — checking old log files, Jupyter notebooks with unclear timestamps, and Slack messages where someone shared a screenshot of a terminal.

Experiment tracking systems like MLflow, Weights & Biases, and Neptune exist to make this kind of query trivial.

## The MLflow Data Model

MLflow organizes data in a hierarchy:

**Experiment** → a named group of related runs. "iris-classifier-v2" or "churn-model-q3-2026". Experiments are persistent: they don't disappear when a run ends.

**Run** → a single execution of your training code within an experiment. A run has a unique ID, a start time, an end time, and a status (RUNNING, FINISHED, FAILED). Each run tracks:
- **Parameters** (\`log_param\`): the inputs that defined this run — learning rate, batch size, model architecture. These are set once at the start and never change.
- **Metrics** (\`log_metric\`): numerical outputs measured during or after training — loss curves, accuracy, F1 score, latency. Metrics can be logged at multiple steps (step=0, step=100, step=200) to produce curves.
- **Artifacts**: files saved by the run — model weights, plots, evaluation reports, confusion matrices.
- **Tags**: key-value metadata — user name, git commit hash, deployment target.

**Model Registry** (optional): a curated store for production-ready models with stage labels (Staging, Production, Archived) and lineage back to the run that produced them.

## Why This Architecture Matters for Infra Engineers

The separation of Parameters and Metrics is load-bearing. Parameters are immutable — you set them once. Metrics are mutable — they can be appended as training progresses. This makes it safe to query the experiment store mid-run and see partially-logged metrics without confusing them with final values.

The \`run_id\` links a model artifact to the exact config that produced it. When a model is promoted to production, the run_id is your evidence trail: you can rerun that exact experiment to verify it, audit it, or reproduce a model that was later corrupted.

## What MLflow Is Not

MLflow is not a training orchestrator — it does not run your code or schedule jobs. It is a logging library + a storage backend + a UI. For scheduling and orchestration, you need Airflow, Prefect, or Dagster (Week 3). Many teams layer MLflow logging on top of an Airflow DAG: Airflow runs the training job, the training job logs to MLflow.

## The Principal-Level Takeaway

At the principal level, the question is not "should we track experiments?" (obviously yes). The question is "where does experiment metadata live, who owns it, how long do we retain it, and how do we connect run IDs to deployed models in the serving system?" You are designing the audit trail for your organization's ML decisions.

---

### 💡 Trending in 2026: Experiment Tracking for LLM Evals

> Traditional experiment tracking was for numeric metrics. In 2026, teams are tracking LLM evaluation runs using the same paradigm: each eval run logs the prompt template version, the model version (by hash), the eval dataset version, and the LLM-as-a-judge scores. This gives you a proper A/B history for prompts — not just "the new prompt is better" but a statistically verifiable trail.
`,
      outcomes: [
        'Explain the MLflow data model: experiment, run, parameters, metrics, artifacts.',
        'Implement a minimal experiment tracker in pure Python.',
        'Use run comparison to identify the best-performing configuration.',
      ],
      tasks: [
        { id: 'w2d2-read', label: 'Understand the experiment → run → artifact hierarchy and why parameters and metrics are separated.', type: 'reading', required: true },
        { id: 'w2d2-lab', label: 'Complete the experiment tracker lab.', type: 'coding', required: true },
        { id: 'w2d2-reflect', label: 'Write your reflection on the gap in your current workflow.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w2d2-q1',
          prompt: 'Why are MLflow parameters logged separately from metrics?',
          options: [
            'Parameters are immutable inputs set once; metrics are mutable outputs that can be appended over time',
            'Parameters are stored in a database; metrics are stored in files',
            'Parameters can only be strings; metrics must be numbers',
          ],
          answer: 'Parameters are immutable inputs set once; metrics are mutable outputs that can be appended over time',
          explanation: 'This separation allows safe mid-run queries, step-level metric curves, and prevents accidentally overwriting the configuration that defined the experiment.',
        },
      ],
      labs: [
        {
          id: 'experiment-tracker-lab',
          title: 'Lab — Minimal Experiment Tracker',
          objective: 'Build a pure-Python experiment tracker that logs parameters and metrics per run, then finds the best run by a given metric.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from tracker import ExperimentTracker

exp = ExperimentTracker("iris-classification")

run1 = exp.start_run("baseline")
run1.log_param("algorithm", "logistic_regression")
run1.log_param("max_iter", 100)
run1.log_metric("accuracy", 0.93)
run1.log_metric("f1_score", 0.91)
exp.end_run(run1)

run2 = exp.start_run("tuned")
run2.log_param("algorithm", "logistic_regression")
run2.log_param("max_iter", 300)
run2.log_metric("accuracy", 0.97)
run2.log_metric("f1_score", 0.96)
exp.end_run(run2)

run3 = exp.start_run("fast")
run3.log_param("algorithm", "linear_svc")
run3.log_param("max_iter", 50)
run3.log_metric("accuracy", 0.88)
run3.log_metric("f1_score", 0.85)
exp.end_run(run3)

if __name__ == "__main__":
    print("--- EXPERIMENT RESULTS ---")
    exp.print_summary()
    best = exp.best_run(metric="accuracy")
    print(f"\\nBEST RUN: {best}")
`,
            },
            {
              path: 'tracker.py',
              language: 'python',
              content: `class Run:
    def __init__(self, name: str):
        self.name = name
        self.params: dict = {}
        self.metrics: dict = {}

    def log_param(self, key: str, value) -> None:
        """Store an immutable parameter. Params define the run's identity."""
        # ── Step 1: Write into a dict by key ───────────────────────
        # Syntax:
        #   some_dict[key] = value
        # TODO: store key/value in self.params
        pass

    def log_metric(self, key: str, value: float) -> None:
        """Store a numeric metric produced by the run."""
        # ── Step 1: Metrics are also plain dict assignments ────────
        # Keep the API symmetrical with log_param().
        # TODO: store key/value in self.metrics
        pass


class ExperimentTracker:
    def __init__(self, experiment_name: str):
        self.name = experiment_name
        self.runs: list[Run] = []

    def start_run(self, run_name: str) -> Run:
        """Create and return a new Run object."""
        # ── Step 1: Instantiate the Run class ──────────────────────
        # Syntax:
        #   run = Run(run_name)
        # TODO: create a Run and return it
        pass

    def end_run(self, run: Run) -> None:
        """Mark a run as complete and store it."""
        # ── Step 1: Append to the tracker's run list ───────────────
        # Lists grow with:
        #   my_list.append(item)
        # TODO: append run to self.runs
        pass

    def best_run(self, metric: str) -> str:
        """Return the name of the run with the highest value for the given metric."""
        # ── Step 1: Select the run with the highest metric value ───
        # max(collection, key=...) lets you pick the "largest" object
        # using a derived comparison value.
        # Example:
        #   best = max(runs, key=lambda r: r.metrics.get("accuracy", 0))
        # TODO: find the best run and return best.name
        pass

    def print_summary(self) -> None:
        for run in self.runs:
            metrics_str = ", ".join(f"{k}={v:.3f}" for k, v in run.metrics.items())
            print(f"  {run.name}: {metrics_str}")
`,
              solution: `class Run:
    def __init__(self, name: str):
        self.name = name
        self.params: dict = {}
        self.metrics: dict = {}

    def log_param(self, key: str, value) -> None:
        self.params[key] = value

    def log_metric(self, key: str, value: float) -> None:
        self.metrics[key] = value


class ExperimentTracker:
    def __init__(self, experiment_name: str):
        self.name = experiment_name
        self.runs: list[Run] = []

    def start_run(self, run_name: str) -> Run:
        return Run(run_name)

    def end_run(self, run: Run) -> None:
        self.runs.append(run)

    def best_run(self, metric: str) -> str:
        if not self.runs:
            return "no runs"
        best = max(self.runs, key=lambda r: r.metrics.get(metric, 0))
        return best.name

    def print_summary(self) -> None:
        for run in self.runs:
            metrics_str = ", ".join(f"{k}={v:.3f}" for k, v in run.metrics.items())
            print(f"  {run.name}: {metrics_str}")
`,
            },
          ],
          hints: [
            'log_param and log_metric are both just dict assignments: self.params[key] = value and self.metrics[key] = value.',
            'start_run just needs to return a Run(run_name) object. end_run appends that object to self.runs.',
            'For best_run, use Python\'s built-in max() with a key function: max(self.runs, key=lambda r: r.metrics.get(metric, 0)). Then return .name from the result.',
          ],
          validation: {
            mode: 'python_output',
            target: 'BEST RUN: tuned',
            successMessage: 'Experiment tracker working correctly. You have built the core data model that MLflow, W&B, and Neptune all implement at scale.',
          },
        },
      ],
      reflectionPrompts: [
        'Without a tracking system, what happens to the institutional knowledge about which experiments failed and why?',
        'How would you connect a run_id to a deployed model in a production serving system?',
      ],
      deliverables: ['Experiment tracker lab completed', 'Reflection entry written'],
      references: [
        { title: 'MLflow Quickstart and Concepts', kind: 'docs', required: true },
        { title: 'Designing Machine Learning Systems, Ch 4', author: 'Chip Huyen', kind: 'book' },
      ],
    },
    {
      id: 'week-2-day-3',
      slug: 'day-3',
      kind: 'day',
      title: 'Day 3 — Data Versioning',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Reading: why you cannot Git the data, content-addressable storage, DVC pointer files',
        '1:00–1:45 Lab: build a data versioner that detects dataset changes',
        '1:45–2:00 Reflection: what happens when a model is trained on an unknown dataset version?',
      ],
      summary: 'Data versioning is harder than code versioning and the consequences of getting it wrong are worse.',
      narrative: `# Day 3 — Data Versioning

Code versioning with Git is solved. Every commit is a snapshot. You can check out any version from any point in history and rebuild the state of the world exactly as it was.

Data versioning is not solved, and the failure modes are much worse. When a model trained on "the June dataset" is compared to one trained on "the September dataset," the difference in performance might not be model quality — it might be that the September dataset has a silent data quality issue, contains leaked labels, or has a shifted feature distribution. Without versioning, you cannot know.

## Why You Cannot Just Git the Data

Git is designed for text files. It stores full snapshots on the first commit, then diffs on subsequent commits. A 2GB training dataset committed to Git means 2GB in the repo. A second version of that dataset means 4GB. After ten versions you have 20GB of history for what is semantically a small delta.

Git LFS (Large File Storage) solves the storage problem by replacing large files with text pointers and storing the actual content in a remote LFS server. But it does not give you semantic versioning of the data — you still need to manage what "version 3 of the training set" means.

## DVC's Approach: Content-Addressable Storage

DVC (Data Version Control) takes a different approach. The data files live in a separate storage backend (S3, GCS, local cache). The Git repository stores \`.dvc\` pointer files — small text files that contain the SHA256 hash of the data file and its location in the remote.

\`\`\`
# train_data.csv.dvc
outs:
- md5: 3d8e0fb9a15b0c4d...
  size: 4194304
  path: train_data.csv
\`\`\`

When you run \`dvc pull\`, DVC looks at the pointer file, computes the remote path from the hash, and downloads the correct version. Git tracks the pointer file. DVC tracks the data.

The critical property: **the hash is the version**. If the hash of your dataset matches the hash stored in the pointer file at the time of training, you have the exact same data. No hash collision possible.

## Point-in-Time Correctness

There is a subtler problem: **training-serving feature skew** caused by dataset versioning. Imagine you train a churn prediction model on user features computed as of last Monday. Your feature engineering uses "days since last purchase" as a raw number. This week, the data team updates their feature pipeline and now normalizes that column. The model was trained with raw values. The serving pipeline feeds it normalized values. The predictions are now garbage, silently.

The fix: lock the feature schema (column names, data types, value ranges) as part of your dataset version. Not just the rows — the shape and meaning of the data.

## The Principal-Level Takeaway

Every model artifact should have a dataset fingerprint attached to it. When you promote a model to production, the artifact registry entry should say: "trained on dataset version abc123, feature schema version v7, at 2026-04-20T14:32:00Z." If the serving pipeline's feature schema does not match v7, deployment fails at the contract level, not after it is live.

---

### 💡 Trending in 2026: Dataset Diff for LLM Fine-Tuning

> Fine-tuning datasets for LLMs have introduced new data versioning challenges. Teams are now versioning not just the data files, but the **annotation guidelines** used to create them. Two datasets with identical text but different rubrics for RLHF annotations produce different fine-tuned model personalities. LlamaIndex and LangChain are building dataset provenance tools to track this.
`,
      outcomes: [
        'Explain why Git is not the right tool for data versioning.',
        'Describe how DVC uses content-addressable pointers.',
        'Build a dataset versioner that computes stable hashes and detects schema changes.',
      ],
      tasks: [
        { id: 'w2d3-read', label: 'Understand content-addressable storage and DVC pointer files.', type: 'reading', required: true },
        { id: 'w2d3-lab', label: 'Complete the data versioner lab.', type: 'coding', required: true },
        { id: 'w2d3-reflect', label: 'Write your reflection on unknown dataset versions.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w2d3-q1',
          prompt: 'What is the core property that makes content-addressable storage reliable for data versioning?',
          options: [
            'The hash uniquely identifies the content — identical hash means identical data, always',
            'Content-addressable storage uses compression, making files smaller',
            'The hash changes when you rename the file, catching accidental overwrites',
          ],
          answer: 'The hash uniquely identifies the content — identical hash means identical data, always',
          explanation: 'SHA256 collisions are computationally infeasible. If the hash matches, the data is identical. This is why you can use a hash as a version identifier — it is a cryptographic proof, not just a label.',
        },
      ],
      labs: [
        {
          id: 'data-versioner-lab',
          title: 'Lab — Dataset Version Tracker',
          objective: 'Build a DataVersioner that hashes datasets, stores versions by name, and detects when a dataset changes between versions.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from versioner import DataVersioner

versioner = DataVersioner()

dataset_v1 = {
    "features": [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]],
    "labels": [0, 1, 0],
    "n_samples": 3,
    "schema": {"features": "float64", "labels": "int32"}
}

dataset_v2 = {
    "features": [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [7.0, 8.0]],
    "labels": [0, 1, 0, 1],
    "n_samples": 4,
    "schema": {"features": "float64", "labels": "int32"}
}

if __name__ == "__main__":
    print("--- DATASET VERSION AUDIT ---")
    versioner.register("training_data", dataset_v1, "v1")
    versioner.register("training_data", dataset_v2, "v2")
    versioner.compare("training_data", "v1", "v2")
`,
            },
            {
              path: 'versioner.py',
              language: 'python',
              content: `import hashlib
import json

class DataVersioner:
    def __init__(self):
        # Store: {dataset_name: {version_label: hash}}
        self._store: dict[str, dict[str, str]] = {}

    def _hash(self, data: dict) -> str:
        """
        Produce a stable SHA256 hash of the data dict.
        Hint: use json.dumps(data, sort_keys=True).encode('utf-8')
        then hashlib.sha256(...).hexdigest()
        """
        # TODO: implement
        pass

    def register(self, name: str, data: dict, version: str) -> str:
        """Hash the dataset and store it under name → version."""
        h = self._hash(data)
        if name not in self._store:
            self._store[name] = {}
        self._store[name][version] = h
        print(f"Registered {name} {version}: {h[:12]}...")
        return h

    def compare(self, name: str, version_a: str, version_b: str) -> None:
        """Compare two versions of a dataset by their hashes."""
        if name not in self._store:
            print(f"Unknown dataset: {name}")
            return
        hash_a = self._store[name].get(version_a)
        hash_b = self._store[name].get(version_b)
        if hash_a is None or hash_b is None:
            print("One or both versions not registered.")
            return
        # TODO: compare hash_a and hash_b
        # If equal: print "DATASET IDENTICAL: ..."
        # If different: print "DATASET VERSION MISMATCH DETECTED: ..."
        pass
`,
              solution: `import hashlib
import json

class DataVersioner:
    def __init__(self):
        self._store: dict[str, dict[str, str]] = {}

    def _hash(self, data: dict) -> str:
        canonical = json.dumps(data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(canonical).hexdigest()

    def register(self, name: str, data: dict, version: str) -> str:
        h = self._hash(data)
        if name not in self._store:
            self._store[name] = {}
        self._store[name][version] = h
        print(f"Registered {name} {version}: {h[:12]}...")
        return h

    def compare(self, name: str, version_a: str, version_b: str) -> None:
        if name not in self._store:
            print(f"Unknown dataset: {name}")
            return
        hash_a = self._store[name].get(version_a)
        hash_b = self._store[name].get(version_b)
        if hash_a is None or hash_b is None:
            print("One or both versions not registered.")
            return
        if hash_a == hash_b:
            print(f"DATASET IDENTICAL: {name} {version_a} == {version_b}")
        else:
            print(f"DATASET VERSION MISMATCH DETECTED: {name} {version_a} vs {version_b}")
`,
            },
          ],
          hints: [
            '_hash() uses the same pattern as yesterday\'s config hasher: json.dumps(data, sort_keys=True).encode("utf-8") then hashlib.sha256(canonical).hexdigest().',
            'In compare(), you just compare hash_a == hash_b. If they are equal, the datasets are identical. If not, they differ.',
            'The key point: you are not comparing the data directly — you are comparing their SHA256 hashes. This is O(1) to compare even for a 100GB dataset, as long as the hash was pre-computed.',
          ],
          validation: {
            mode: 'python_output',
            target: 'DATASET VERSION MISMATCH DETECTED',
            successMessage: 'Dataset versioner working. You now have the core primitive used by DVC, Delta Lake, and Apache Iceberg for detecting data changes.',
          },
        },
      ],
      reflectionPrompts: [
        'If a model that was in production for 6 months suddenly starts degrading, what dataset version information would you need to start debugging?',
        'How would you design a system that automatically fails a deployment if the serving feature schema does not match the training dataset schema?',
      ],
      deliverables: ['Data versioner lab completed', 'Reflection entry written'],
      references: [
        { title: 'DVC documentation: data versioning concepts', kind: 'docs', required: true },
        { title: 'Delta Lake: data versioning at scale', kind: 'blog' },
        { title: 'Designing Machine Learning Systems, feature stores', author: 'Chip Huyen', kind: 'book' },
      ],
    },
    {
      id: 'week-2-day-4',
      slug: 'day-4',
      kind: 'day',
      title: 'Day 4 — Config-Driven Training',
      durationLabel: '2 hours',
      schedule: [
        '0:00–1:00 Reading: 12-factor app config principles applied to ML, dataclasses vs YAML vs env vars',
        '1:00–1:45 Lab: build a validated TrainingConfig dataclass',
        '1:45–2:00 Reflection: what configuration is currently hardcoded in your training scripts?',
      ],
      summary: 'Hardcoded training parameters are technical debt. Config-driven pipelines are reproducible by design.',
      narrative: `# Day 4 — Config-Driven Training

In traditional software engineering, the 12-factor app methodology says: store config in the environment, not in the code. A database URL should not be committed to source control. A feature flag should not be a hardcoded constant. This principle exists because code is versioned, deployed, and tested — but config needs to change across environments without triggering a deploy.

In ML pipelines, the problem is more acute because configuration is also scientific. The batch size is not just an operational setting — it directly affects the model's training dynamics, the gradient noise, and the final accuracy. When batch size is hardcoded, you cannot run a hyperparameter sweep without editing source files. When it is configured, you can run 100 experiments by changing 100 config files.

## The Three Layers of ML Configuration

### Layer 1: Hyperparameters
The scientific variables you are experimenting with: learning rate, batch size, number of layers, dropout rate. These belong in a config file per experiment, or in a sweep configuration for automated search. They should be **logged with every run** (MLflow log_param).

### Layer 2: System Config
Infrastructure settings: how many GPUs, what checkpoint directory, whether to enable mixed precision, the S3 bucket for artifacts. These should come from **environment variables** or a deployment-specific config file that is not committed. They should not be logged per run (they are not scientific variables).

### Layer 3: Experiment Metadata
Labels that help you find runs later: experiment name, dataset version hash, git commit hash, user name, team. These should be **tags** in your experiment tracker, not params.

## Python Dataclasses as Config Objects

Python's \`dataclass\` is the cleanest way to define config in pure Python:

\`\`\`python
from dataclasses import dataclass

@dataclass(frozen=True)
class TrainingConfig:
    model_type: str = "logistic_regression"
    learning_rate: float = 0.01
    max_iter: int = 200
    test_size: float = 0.2
    random_seed: int = 42
\`\`\`

\`frozen=True\` makes the config immutable after creation — you cannot accidentally mutate it mid-training. This is the same guarantee that \`const\` gives in TypeScript: the config is what it was when the run started.

## Validation Is Non-Optional

A config object is an interface contract. If someone passes \`learning_rate=-0.5\`, the training will likely diverge silently. Your config validation should be as strict as your data contract:

\`\`\`python
def validate_config(config: TrainingConfig) -> None:
    if config.learning_rate <= 0:
        raise ValueError(f"learning_rate must be positive, got {config.learning_rate}")
    if not (0 < config.test_size < 1):
        raise ValueError(f"test_size must be in (0, 1), got {config.test_size}")
\`\`\`

## The Principal-Level Takeaway

A config-driven pipeline is not just easier to experiment with — it is safer to operate. When a model degrades in production and you need to retrain with the exact same configuration as six months ago, your only source of truth is the config that was logged with that training run. If parameters were hardcoded, that source of truth does not exist. Config-driven training is reproducibility insurance.

---

### 💡 Trending in 2026: Structured Configs for Agents

> As agentic systems become more complex (tool choice, memory strategies, routing thresholds), teams are applying the same config-driven discipline to agent behavior. Frameworks like LangGraph and AutoGen support config objects that define agent personalities, tool access levels, and self-correction budgets. These configs are now versioned and logged alongside model configs in experiment trackers.
`,
      outcomes: [
        'Explain the three layers of ML configuration and where each belongs.',
        'Implement a frozen dataclass-based config with validation.',
        'Describe why frozen configs are safer than mutable ones for training pipelines.',
      ],
      tasks: [
        { id: 'w2d4-read', label: 'Understand the three config layers and 12-factor principles applied to ML.', type: 'reading', required: true },
        { id: 'w2d4-lab', label: 'Complete the TrainingConfig lab.', type: 'coding', required: true },
        { id: 'w2d4-reflect', label: 'Audit what configuration is currently hardcoded in your thinking.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w2d4-q1',
          prompt: 'Why use @dataclass(frozen=True) for a training config rather than a regular dict?',
          options: [
            'Frozen dataclasses are immutable — you cannot accidentally change config mid-training, and they are type-safe at creation',
            'Frozen dataclasses are faster to serialize than dicts',
            'Frozen dataclasses automatically log themselves to MLflow',
          ],
          answer: 'Frozen dataclasses are immutable — you cannot accidentally change config mid-training, and they are type-safe at creation',
          explanation: 'Immutability is the key guarantee. Once the training run starts with a config, that config cannot change. This is essential for reproducibility: the config that was logged is the config that was used, period.',
        },
      ],
      labs: [
        {
          id: 'training-config-lab',
          title: 'Lab — Validated Training Config',
          objective: 'Define a frozen TrainingConfig dataclass and a validate_config function that enforces operational constraints.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from config import TrainingConfig, validate_config

if __name__ == "__main__":
    cfg = TrainingConfig(
        model_type="logistic_regression",
        learning_rate=0.01,
        max_iter=200,
        test_size=0.2,
        random_seed=42,
    )
    validate_config(cfg)
    print(f"model_type={cfg.model_type}, lr={cfg.learning_rate}, seed={cfg.random_seed}")

    print("\\nTesting invalid config:")
    try:
        bad_cfg = TrainingConfig(learning_rate=-0.1, model_type="svm", max_iter=100, test_size=0.2, random_seed=42)
        validate_config(bad_cfg)
    except ValueError as e:
        print(f"Caught expected error: {e}")
`,
            },
            {
              path: 'config.py',
              language: 'python',
              content: `from dataclasses import dataclass

@dataclass(frozen=True)
class TrainingConfig:
    model_type: str
    learning_rate: float
    max_iter: int
    test_size: float
    random_seed: int


def validate_config(config: TrainingConfig) -> None:
    """
    Validate the config against operational constraints.

    Rules to enforce:
    1. learning_rate must be > 0
    2. max_iter must be >= 10
    3. test_size must be in (0, 1) exclusive
    4. random_seed must be >= 0

    Raise ValueError with a descriptive message for each violation.
    When all checks pass, print "CONFIG LOADED AND VALIDATED"
    """
    # TODO: implement validation rules
    pass
`,
              solution: `from dataclasses import dataclass

@dataclass(frozen=True)
class TrainingConfig:
    model_type: str
    learning_rate: float
    max_iter: int
    test_size: float
    random_seed: int


def validate_config(config: TrainingConfig) -> None:
    if config.learning_rate <= 0:
        raise ValueError(f"learning_rate must be positive, got {config.learning_rate}")
    if config.max_iter < 10:
        raise ValueError(f"max_iter must be >= 10, got {config.max_iter}")
    if not (0 < config.test_size < 1):
        raise ValueError(f"test_size must be in (0, 1), got {config.test_size}")
    if config.random_seed < 0:
        raise ValueError(f"random_seed must be >= 0, got {config.random_seed}")
    print("CONFIG LOADED AND VALIDATED")
`,
            },
          ],
          hints: [
            'validate_config uses a series of if statements, each raising ValueError with a descriptive message. This is exactly how pydantic validators work under the hood.',
            'For learning_rate: if config.learning_rate <= 0: raise ValueError(...). For test_size: if not (0 < config.test_size < 1): raise ValueError(...).',
            'The happy path (all checks pass) just calls print("CONFIG LOADED AND VALIDATED") at the end of the function. No return value needed.',
          ],
          validation: {
            mode: 'python_output',
            target: 'CONFIG LOADED AND VALIDATED',
            successMessage: 'Config validation working. You now have a type-safe, validated, immutable config object — the foundation for reproducible, auditable training runs.',
          },
        },
      ],
      reflectionPrompts: [
        'What configuration in a system you have built is currently hardcoded? What would it take to extract it?',
        'How does config-driven training connect to the config hashing you did on Day 1?',
      ],
      deliverables: ['Training config lab completed', 'Reflection entry written'],
      references: [
        { title: '12-Factor App: Configuration', kind: 'docs', required: true },
        { title: 'Hydra: a framework for elegant ML configuration', kind: 'docs' },
        { title: 'Python dataclasses docs', kind: 'docs' },
      ],
    },
    {
      id: 'week-2-day-5',
      slug: 'day-5',
      kind: 'day',
      title: 'Day 5 — Integration and Weekend Plan',
      durationLabel: '2 hours',
      schedule: [
        '0:00–0:45 Open the ml-system-basics project workspace and review what you built in Week 1',
        '0:45–1:30 Add config-driven training to train.py and a dataset hash to the training output',
        '1:30–2:00 Write the exact weekend plan: what you will add to the project',
      ],
      summary: 'Friday turns this week\'s concepts into a concrete plan for the weekend build.',
      narrative: `# Day 5 — Integration and Weekend Plan

Today you connect this week's learning to the ml-system-basics project you started in Week 1. The goal is not to finish — the goal is to set up the weekend by removing friction now.

## What ml-system-basics Needs After Week 2

By the end of this weekend, your ml-system-basics system should:

1. Use a \`TrainingConfig\` dataclass (frozen, validated) instead of hardcoded values in train.py
2. Print the dataset hash at training time: \`dataset_version=abc123...\`
3. Log the config hash alongside the model artifact
4. Have a simple experiment registry in the README: a table of run names, config hashes, and accuracy numbers

## How to Connect the Pieces

**train.py changes:**
\`\`\`python
from config import TrainingConfig, validate_config
from hasher import hash_config

def train_model(config: TrainingConfig) -> None:
    validate_config(config)
    cfg_hash = hash_config(vars(config))
    print(f"config_hash={cfg_hash[:12]}")
    # ... rest of training
\`\`\`

**Add dataset hashing to train.py:**
\`\`\`python
import hashlib, json
def hash_dataset(data) -> str:
    raw = json.dumps(data.tolist(), sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()
\`\`\`

## Weekend Build Targets

Open the project workspace (click "Project Workspace →" above). The build targets for this weekend are:
1. Refactor train.py to use TrainingConfig
2. Add dataset and config hashing to training output
3. Build a minimal experiment log in README.md
4. Run two training experiments with different configs and compare

## The Writing Deadline

By end of Sunday, you must have written: **"Why Reproducibility Is a First-Class Engineering Concern"**

This is not optional. The writing is where the thinking crystallizes. A 400-word essay is fine. The prompt: what would a 6-month-old ML system without reproducibility look like when it first breaks in production?
`,
      outcomes: [
        'Open and review the ml-system-basics project.',
        'Add config-driven training stubs to train.py.',
        'Write a specific weekend plan.',
      ],
      tasks: [
        { id: 'w2d5-project', label: 'Open the ml-system-basics project workspace.', type: 'project', required: true },
        { id: 'w2d5-integrate', label: 'Add TrainingConfig to train.py.', type: 'coding', required: true },
        { id: 'w2d5-plan', label: 'Write the weekend build plan with explicit targets.', type: 'notes', required: true },
      ],
      reflectionPrompts: [
        'What is the single most likely blocker to your weekend build plan?',
      ],
      deliverables: ['Updated project workspace', 'Weekend build plan written'],
      references: [
        { title: 'scikit-learn: model persistence', kind: 'docs' },
        { title: 'FastAPI: dependency injection for config', kind: 'docs' },
      ],
    },
    {
      id: 'week-2-sat',
      slug: 'saturday',
      kind: 'weekend',
      title: 'Saturday — Reproducible Training System',
      durationLabel: '6–8 hours',
      schedule: [
        'Block 1 (2 hrs): Refactor train.py to use TrainingConfig; add config and dataset hashing',
        'Block 2 (2 hrs): Add a minimal experiment log — run two configs, compare accuracy',
        'Block 3 (2 hrs): Test and debug the config-driven pipeline end to end',
        'Block 4 (1–2 hrs): Clean up and document the changes',
      ],
      summary: 'Saturday converts this week\'s concepts into a reproducible training system.',
      narrative: `# Saturday — Build the Reproducible Pipeline

The target for today: a training pipeline where every run produces: a trained model, a config hash, a dataset hash, and an accuracy score — and these are all printed and could be logged to an experiment tracker.

## Block 1: Refactor to Config-Driven

In the ml-system-basics project workspace, open \`src/train.py\`. Replace the hardcoded values with a \`TrainingConfig\` dataclass. Move \`test_size=0.2\` and \`random_state=42\` into the config object.

## Block 2: Add Hashing

Add \`hash_config\` and \`hash_dataset\` functions. Print them at the start of training:
\`config_hash=abc12345, dataset_version=def67890\`

## Block 3: Run Two Experiments

Create two configs: one with \`max_iter=100\`, one with \`max_iter=500\`. Train both, record the accuracy. Add a comparison table to README.md.

## Block 4: Clean Up

Make the code readable. No dead code. Config clearly commented with what each field controls.
`,
      outcomes: [
        'Config-driven train.py with frozen dataclass.',
        'Config and dataset hashes printed at training time.',
        'Two experiments compared in README.',
      ],
      tasks: [
        { id: 'w2sat-config', label: 'Refactor train.py to use TrainingConfig.', type: 'project', required: true },
        { id: 'w2sat-hash', label: 'Add config hash and dataset hash to training output.', type: 'coding', required: true },
        { id: 'w2sat-experiments', label: 'Run two experiments and compare results.', type: 'project', required: true },
      ],
      reflectionPrompts: ['What would you need to add to this system to make it match a real MLflow setup?'],
      deliverables: ['Reproducible training pipeline', 'README with experiment comparison'],
      references: [{ title: 'DVC quickstart', kind: 'docs' }, { title: 'MLflow quickstart', kind: 'docs' }],
    },
    {
      id: 'week-2-sun',
      slug: 'sunday',
      kind: 'weekend',
      title: 'Sunday — Versioning, Writing, and Week 3 Prep',
      durationLabel: '6–8 hours',
      schedule: [
        'Block 1 (2 hrs): Add dataset versioning to the project',
        'Block 2 (2 hrs): Write "Why Reproducibility Is a First-Class Engineering Concern"',
        'Block 3 (2 hrs): Review and document the full reproducibility surface of your system',
        'Block 4 (1–2 hrs): Week 3 preview — read the Airflow architecture overview',
      ],
      summary: 'Sunday closes Week 2 with the critical writing deliverable and a forward look at pipeline orchestration.',
      narrative: `# Sunday — Prove Your Understanding Through Writing

You are not done until you can write the essay. The essay is where you find out if you actually understood the week or just followed the labs.

## The Essay Prompt

**"Why Reproducibility Is a First-Class Engineering Concern"**

Angle: You are writing this for a CTO who is asking why the team needs to invest in experiment tracking and data versioning infrastructure. The CTO thinks "just save the model weights and the accuracy number."

Your essay must answer:
- What does "we cannot reproduce this result" cost in practice?
- What are the three things you need to reproduce a model?
- What breaks first when you skip reproducibility?
- What does a 6-month-old ML system without it look like when it first degrades?

Target length: 400–600 words. Quality over length.
`,
      outcomes: [
        'Dataset versioning added to project.',
        'Essay written and saved.',
        'Full reproducibility surface of the system documented.',
      ],
      tasks: [
        { id: 'w2sun-version', label: 'Add dataset versioning to ml-system-basics.', type: 'project', required: true },
        { id: 'w2sun-essay', label: 'Write "Why Reproducibility Is a First-Class Engineering Concern".', type: 'writing', required: true },
        { id: 'w2sun-docs', label: 'Document the reproducibility surface of your system.', type: 'writing', required: true },
      ],
      reflectionPrompts: [
        'Can you reproduce your Week 1 model exactly, right now? If not, what is missing?',
        'What would you tell a new team member about the non-negotiables for ML system reliability?',
      ],
      deliverables: ['Dataset versioning in project', 'Essay written', 'System documentation updated'],
      references: [{ title: 'Airflow architecture overview (for Week 3 prep)', kind: 'docs' }],
    },
  ],
};
