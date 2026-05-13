import {
  FlattenedModule,
  LearningCourse,
  LearningModule,
  LearningWeek,
  ProjectTemplate,
} from '@/features/learning/types';
import { mlopsWeek2 } from './mlops-week2';
import {
  mlopsWeek3,
  mlopsWeek4,
  mlopsWeek5,
  mlopsWeek6,
  mlopsWeek7,
  mlopsWeek8,
  mlopsWeek9,
  mlopsWeek10,
} from './mlops-weeks3to10';
import { rustWeek1 } from './rust-week1';

const mlSystemBasicsTemplate: ProjectTemplate = {
  slug: 'ml-system-basics',
  title: 'ml-system-basics',
  description:
    'A minimal but production-shaped ML system: training script, metrics, FastAPI serving layer, validation, and Docker packaging.',
  language: 'python',
  downloadName: 'ml-system-basics-workspace.json',
  validation: {
    mode: 'source_contains',
    patterns: ['FastAPI', 'joblib', 'predict'],
    successMessage:
      'The project now contains the core production path: train, persist, load, and serve.',
  },
  files: [
    {
      path: 'README.md',
      language: 'markdown',
      content: `# ml-system-basics

Build a small but real ML service:

1. Train a classifier.
2. Save the model artifact.
3. Expose a FastAPI prediction endpoint.
4. Add failure handling and Docker support.
`,
    },
    {
      path: 'src/train.py',
      language: 'python',
      content: `from pathlib import Path
import joblib
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


def train_model() -> None:
    data = load_iris()
    x_train, x_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42,
    )

    model = LogisticRegression(max_iter=200)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    print(f"accuracy={accuracy_score(y_test, preds):.3f}")

    artifacts_dir = Path("artifacts")
    artifacts_dir.mkdir(exist_ok=True)
    joblib.dump(model, artifacts_dir / "model.joblib")


if __name__ == "__main__":
    train_model()
`,
    },
    {
      path: 'src/app.py',
      language: 'python',
      content: `from pathlib import Path
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    sepal_length: float = Field(..., gt=0)
    sepal_width: float = Field(..., gt=0)
    petal_length: float = Field(..., gt=0)
    petal_width: float = Field(..., gt=0)


app = FastAPI(title="ml-system-basics")
MODEL_PATH = Path("artifacts/model.joblib")


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model artifact missing. Run training first.")
    return joblib.load(MODEL_PATH)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: PredictionRequest):
    try:
        model = load_model()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    features = [[
        payload.sepal_length,
        payload.sepal_width,
        payload.petal_length,
        payload.petal_width,
    ]]
    prediction = model.predict(features)[0]
    return {"prediction": int(prediction)}
`,
    },
    {
      path: 'src/config.py',
      language: 'python',
      content: `from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    random_state: int = 42
    test_size: float = 0.2
    model_path: str = "artifacts/model.joblib"
`,
    },
    {
      path: 'Dockerfile',
      language: 'dockerfile',
      content: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]
`,
    },
    {
      path: 'requirements.txt',
      language: 'text',
      content: `fastapi==0.115.0
uvicorn==0.30.6
joblib==1.4.2
scikit-learn==1.5.2
pydantic==2.9.2
`,
    },
  ],
};

const rustMlTemplate: ProjectTemplate = {
  slug: 'rust-ml-cli',
  title: 'rust-ml-cli',
  description:
    'A Rust CLI for fast data inspection and lightweight numeric preprocessing, designed to teach systems thinking for ML infra.',
  language: 'rust',
  downloadName: 'rust-ml-cli-workspace.json',
  validation: {
    mode: 'source_contains',
    patterns: ['fn main()', 'match', 'Result'],
    successMessage:
      'The Rust workspace contains the critical ergonomics: entrypoint, error handling, and branching logic.',
  },
  files: [
    {
      path: 'Cargo.toml',
      language: 'toml',
      content: `[package]
name = "rust-ml-cli"
version = "0.1.0"
edition = "2021"

[dependencies]
`,
    },
    {
      path: 'src/main.rs',
      language: 'rust',
      content: `use std::error::Error;

fn summarize(values: &[f64]) -> f64 {
    values.iter().sum::<f64>() / values.len() as f64
}

fn main() -> Result<(), Box<dyn Error>> {
    let values = vec![2.0, 4.0, 6.0, 8.0];
    let mean = summarize(&values);

    match mean > 4.0 {
        true => println!("high-signal batch: {mean}"),
        false => println!("steady batch: {mean}"),
    }

    Ok(())
}
`,
    },
  ],
};

function buildOutlineWeek(
  id: string,
  slug: string,
  title: string,
  theme: string,
  summary: string,
  commitment: string,
  outputs: string[],
  weekdayTopic: string,
  weekendBuild: string,
  references: string[],
): LearningWeek {
  const dayNames = [
    ['mon', 'Monday'],
    ['tue', 'Tuesday'],
    ['wed', 'Wednesday'],
    ['thu', 'Thursday'],
    ['fri', 'Friday'],
  ] as const;

  const modules: LearningModule[] = dayNames.map(([short, label], index) => ({
    id: `${slug}-${short}`,
    slug: short,
    kind: 'day',
    title: `${label} — ${weekdayTopic}`,
    durationLabel: '2 hours',
    schedule: [
      '60 min reading and concept compression',
      '45 min notes, diagramming, or light coding',
      '15 min reflection and next-step planning',
    ],
    summary: `${label} keeps the weekly theme moving while preserving the strict 2-hour cap.`,
    narrative: `# ${label}

This module is intentionally structured for focused weekday work. Your goal is to advance the week's systems intuition without turning the day into a build marathon.

## What to do

- Read one strong source deeply, not five shallow ones.
- Convert what you read into operational language.
- Write down one thing that would break in production.
- If code is included, keep it small and targeted.

## This day's lens

Focus on **${weekdayTopic.toLowerCase()}** and connect it to the weekly theme: **${theme}**.

## Suggested references

${references.map((item) => `- ${item}`).join('\n')}
`,
    outcomes: [
      `Explain ${theme.toLowerCase()} in production language.`,
      'Capture at least one concrete failure mode or design tradeoff.',
      'Leave the day with a short written reflection.',
    ],
    tasks: [
      { id: `${slug}-${short}-read`, label: 'Complete the primary reading block.', type: 'reading', required: true },
      { id: `${slug}-${short}-notes`, label: 'Write distilled notes in your own words.', type: 'notes', required: true },
      { id: `${slug}-${short}-reflect`, label: 'Answer the reflection prompt.', type: 'reflection', required: true },
    ],
    reflectionPrompts: [
      'What became clearer today?',
      'What still feels fuzzy enough to break under production pressure?',
    ],
    deliverables: ['One page of notes', 'One reflection entry'],
    references: references.map((ref) => ({ title: ref, kind: 'docs', required: true })),
  }));

  modules.push(
    {
      id: `${slug}-sat`,
      slug: 'sat',
      kind: 'weekend',
      title: `Saturday Deep Work — ${weekendBuild}`,
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1: implement the core system',
        'Block 2: extend and validate',
        'Block 3: debug and harden',
        'Block 4: refactor and document',
      ],
      summary: 'Saturday is where systems understanding becomes working software.',
      narrative: `# Saturday Deep Work

The goal is to turn this week's theory into a functioning system. Do not optimize for novelty; optimize for finishing a technically coherent slice.

## Build target

${weekendBuild}

## Expected behavior

- the system should run end to end
- major failure paths should be exercised
- configuration should be explicit
`,
      outcomes: [
        'Finish the build slice for the week.',
        'Exercise failure paths intentionally.',
        'Leave with a system that can be explained clearly.',
      ],
      tasks: [
        { id: `${slug}-sat-build`, label: 'Finish the main implementation block.', type: 'project', required: true },
        { id: `${slug}-sat-debug`, label: 'Run debugging and hardening passes.', type: 'coding', required: true },
      ],
      reflectionPrompts: ['Where did complexity appear faster than expected?'],
      deliverables: ['Updated project workspace', 'Debug notes'],
      references: references.map((ref) => ({ title: ref, kind: 'docs' })),
    },
    {
      id: `${slug}-sun`,
      slug: 'sun',
      kind: 'weekend',
      title: 'Sunday Deep Work — Writing and system review',
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1: failure simulation or review',
        'Block 2: writing and architecture explanation',
        'Block 3: documentation and next-week preparation',
      ],
      summary: 'Sunday converts implementation into engineering judgment.',
      narrative: `# Sunday Deep Work

The objective is to prove understanding. You do that by writing, documenting, and naming the system's weak points.
`,
      outcomes: [
        'Produce a written artifact that captures tradeoffs.',
        'Document architecture and operational risks.',
        'Decide whether you are ready to move on.',
      ],
      tasks: [
        { id: `${slug}-sun-write`, label: 'Write the weekly architecture or failure review.', type: 'writing', required: true },
        { id: `${slug}-sun-docs`, label: 'Update README and operator notes.', type: 'writing', required: true },
      ],
      reflectionPrompts: ['What would fail first if traffic or scale doubled tomorrow?'],
      deliverables: ['Architecture memo', 'Updated docs'],
      references: references.map((ref) => ({ title: ref, kind: 'docs' })),
    },
  );

  return {
    id,
    slug,
    title,
    theme,
    summary,
    commitment,
    outputs,
    modules,
  };
}

const mlopsWeek1: LearningWeek = {
  id: 'mlops-week-1',
  slug: 'week-1',
  title: 'Week 1 — ML Systems Foundations and Failure Modes',
  theme: 'Build mental models first, then build the minimal production-shaped system.',
  summary:
    'This week establishes the core principal-level MLOps reflex: think in terms of dependencies, failure surfaces, reproducibility, and operational behavior, not just model code.',
  commitment: '2 hours on weekdays, 6-8 hours on Saturday and Sunday',
  outputs: [
    'Working project: ml-system-basics',
    'Essay: Why ML Systems Fail in Production',
    'Essay: Failure Modes in My System',
    'Clear explanation of training-serving skew, data dependency, and failure points',
  ],
  modules: [
    {
      id: 'week-1-day-1',
      slug: 'day-1',
      kind: 'day',
      title: 'Day 1 — ML Systems Intro',
      durationLabel: '2 hours',
      schedule: [
        '0:00-1:00 Read Hidden Technical Debt in ML Systems (first half)',
        '1:00-1:45 Notes: types of ML technical debt, why ML != traditional software',
        '1:45-2:00 Reflection: what surprised you, what feels unclear',
      ],
      summary:
        'The first day resets the frame: principal MLOps work is mostly about managing the 95% of the system outside the model.',
      narrative: `# Day 1 — ML Systems Intro

You are not training to be "the person who can fit a model." You are training to become the engineer who can build the system that safely turns data into production behavior.

## The key mental shift

In normal software, code paths are explicit and mostly deterministic. In ML systems, **data becomes a hidden dependency graph**. The model learns relationships you did not directly write. That is why the paper *Hidden Technical Debt in ML Systems* matters so much: it explains why apparently small changes create wide, hard-to-predict breakage.

## What matters today

- Why ML systems resist ordinary software abstractions
- Why "changing anything changes everything" is not a slogan but an operating constraint
- Why data contracts and clear boundaries are part of infra, not just application code

## Layman-to-senior-backend framing

If a normal backend service starts returning malformed JSON, you notice quickly. If an upstream team changes a nullable data field in an ML pipeline, the model may still serve happily while silently getting worse. That silence is exactly what makes MLOps difficult.

## Coding lab

You will write a basic validation contract in Python so the pipeline fails loudly instead of poisoning the training or serving path.
`,
      outcomes: [
        'Explain the 5% model code illusion.',
        'Name at least three types of ML technical debt.',
        'Implement a simple Python data contract.',
      ],
      tasks: [
        { id: 'w1d1-read', label: 'Read the first half of Hidden Technical Debt in ML Systems.', type: 'reading', required: true },
        { id: 'w1d1-notes', label: 'Write notes on technical debt types and why ML is different.', type: 'notes', required: true },
        { id: 'w1d1-lab', label: 'Complete the data contract coding lab.', type: 'coding', required: true },
        { id: 'w1d1-reflect', label: 'Record your short reflection before ending the session.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w1d1-q1',
          prompt: 'Why is ML technical debt harder to detect than ordinary code dependency breakage?',
          options: [
            'Because data dependencies can fail silently while code still runs',
            'Because Python is dynamically typed',
            'Because models always have too many parameters',
          ],
          answer: 'Because data dependencies can fail silently while code still runs',
          explanation:
            'The operational danger is not only breakage; it is degraded behavior that looks healthy at first glance.',
        },
      ],
      labs: [
        {
          id: 'data-contract-lab',
          title: 'Lab — Defensive Data Contract',
          objective:
            'Validate incoming data so the pipeline halts before bad upstream changes leak into the ML system.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from data_contract import validate_payload

raw_payload = {
    "user_id": "10485",
    "age": -1,
    "features": [0.4, 0.8, "error", 0.1],
}

if __name__ == "__main__":
    print("--- ML INGESTION PIPELINE START ---")
    try:
        validated_data = validate_payload(raw_payload)
        print("SUCCESS")
        print(validated_data)
    except Exception as exc:
        print("CRITICAL INGESTION HALTED")
        print(str(exc))
`,
            },
            {
              path: 'data_contract.py',
              language: 'python',
              content: `def validate_payload(raw_data: dict) -> dict:
    # ── Step 1: Read a value safely from a dict ───────────────────
    # Use .get() so a missing key returns None instead of raising KeyError.
    # Syntax:
    #   value = my_dict.get("key")
    #   value = my_dict.get("key", default_value)
    # TODO: read age from raw_data

    # ── Step 2: Reject invalid numeric values loudly ──────────────
    # Raise an exception with:
    #   raise ValueError("your message")
    # Guard against None first so you do not evaluate None < 0.
    # TODO: if age is present and negative, raise ValueError("Age cannot be negative")

    # ── Step 3: Read a list with a safe default ───────────────────
    # A default empty list avoids crashes if "features" is missing.
    # TODO: read features from raw_data with [] as the fallback

    # ── Step 4: Validate every item in the list ───────────────────
    # all(predicate(item) for item in collection) returns True only
    # when every item passes the check.
    # Example:
    #   all(isinstance(x, float) for x in [1.0, 2.0])  -> True
    #   all(isinstance(x, float) for x in [1.0, "x"])  -> False
    # TODO: raise ValueError("Features must be floats") if any item is not a float
    return raw_data
`,
              solution: `def validate_payload(raw_data: dict) -> dict:
    age = raw_data.get("age")
    if age is not None and age < 0:
        raise ValueError("Age cannot be negative")

    features = raw_data.get("features", [])
    if not all(isinstance(item, float) for item in features):
        raise ValueError("Features must be floats")

    return raw_data
`,
            },
          ],
          hints: [
            'Use `dict.get` instead of direct indexing so missing keys do not crash the lab.',
            'Use `all()` with `isinstance(item, float)` for the features array.',
            'Raise a loud `ValueError` instead of trying to "fix" bad data silently.',
          ],
          validation: {
            mode: 'python_output',
            target: 'CRITICAL INGESTION HALTED',
            successMessage:
              'You enforced the contract correctly. This is the right instinct for ML data boundaries.',
          },
        },
      ],
      reflectionPrompts: [
        'What surprised you about how much of an ML system is not model code?',
        'Which kind of silent data dependency feels most dangerous?',
      ],
      deliverables: ['Notes entry', 'Completed data contract lab', 'Reflection entry'],
      references: [
        { title: 'Hidden Technical Debt in Machine Learning Systems', kind: 'paper', required: true },
        { title: 'Designing Machine Learning Systems, Chapters 1-3', author: 'Chip Huyen', kind: 'book' },
      ],
    },
    {
      id: 'week-1-day-2',
      slug: 'day-2',
      kind: 'day',
      title: 'Day 2 — Failure Modes',
      durationLabel: '2 hours',
      schedule: [
        '0:00-1:00 Finish Hidden Technical Debt in ML Systems',
        '1:00-1:45 Write top 5 failure modes and realistic examples',
        '1:45-2:00 Reflection: which failure is hardest to detect?',
      ],
      summary: 'Today is about learning how ML systems fail quietly, persistently, and expensively.',
      narrative: `# Day 2 — Failure Modes

Principal MLOps work starts with operational paranoia. Do not ask "can this model predict?" Ask "how does this system degrade when data, assumptions, or operators drift?"

## Failure modes you must understand

- training-serving skew
- concept drift
- data drift
- stale features
- upstream schema changes
- misaligned offline and online metrics

## Infra framing

Your job is to build observability and safety rails around these failure modes. You are not waiting for a pager after the fact. You are building systems that make hidden failures visible.
`,
      outcomes: [
        'Name and explain five common ML failure modes.',
        'Write realistic production examples.',
        'Design a simple batch-drift detector in Python.',
      ],
      tasks: [
        { id: 'w1d2-read', label: 'Finish the paper and annotate the failure modes.', type: 'reading', required: true },
        { id: 'w1d2-notes', label: 'Write your top 5 failure modes with examples.', type: 'notes', required: true },
        { id: 'w1d2-lab', label: 'Implement the drift detector lab.', type: 'coding', required: true },
        { id: 'w1d2-reflect', label: 'Answer the hardest-to-detect failure reflection.', type: 'reflection', required: true },
      ],
      labs: [
        {
          id: 'drift-detector-lab',
          title: 'Lab — Mean Shift Drift Detector',
          objective:
            'Compare a production batch against a training baseline and trigger an alert when the mean shifts beyond the threshold.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from monitor import detect_drift

baseline = 0.55
threshold = 0.20
production_batch = [1.1, 0.9, 0.85, 0.95]

print(detect_drift(production_batch, baseline, threshold))
`,
            },
            {
              path: 'monitor.py',
              language: 'python',
              content: `def detect_drift(production_batch: list[float], baseline: float, threshold: float) -> str:
    # ── Step 1: Compute the batch mean ────────────────────────────
    # You already have a list of floats, so use Python built-ins:
    #   mean_val = sum(values) / len(values)
    # TODO: compute mean_val from production_batch

    # ── Step 2: Measure the distance from the baseline ────────────
    # abs(x) gives the absolute value, which is useful when you care
    # about "how far" the number moved rather than direction.
    # TODO: compute abs_diff using abs(mean_val - baseline)

    # ── Step 3: Return the correct status string ──────────────────
    # if condition:
    #     return "ALERT: drift detected"
    # return "OK: stable"
    # TODO: compare abs_diff to threshold and return the right message
    return "TODO"
`,
              solution: `def detect_drift(production_batch: list[float], baseline: float, threshold: float) -> str:
    mean_val = sum(production_batch) / len(production_batch)
    abs_diff = abs(mean_val - baseline)

    if abs_diff > threshold:
        return "ALERT: drift detected"

    return "OK: stable"
`,
            },
          ],
          hints: [
            'Use Python built-ins: `sum`, `len`, and `abs`.',
            'This lab is intentionally simple. The point is the infra reflex: compare live behavior against a reference baseline.',
          ],
          validation: {
            mode: 'python_output',
            target: 'ALERT: drift detected',
            successMessage:
              'The detector triggered as expected. You now have the skeleton of a monitoring primitive.',
          },
        },
      ],
      reflectionPrompts: [
        'Which failure mode would be easiest to miss in a fast-moving team?',
        'What would you instrument first if this system were already in production?',
      ],
      deliverables: ['Top 5 failure modes note', 'Drift detector lab', 'Reflection entry'],
      references: [
        { title: 'Hidden Technical Debt in Machine Learning Systems', kind: 'paper', required: true },
        { title: 'Designing Machine Learning Systems, evaluation chapters', kind: 'book' },
      ],
    },
    {
      id: 'week-1-day-3',
      slug: 'day-3',
      kind: 'day',
      title: 'Day 3 — Rules of ML',
      durationLabel: '2 hours',
      schedule: [
        '0:00-1:00 Read the first half of Rules of ML',
        '1:00-1:45 Extract 5 key rules and explain why they exist',
        '1:45-2:00 Reflection: which rule would you be tempted to ignore?',
      ],
      summary: 'The point of Rules of ML is not memorization. It is learning why experienced teams put structure ahead of premature complexity.',
      narrative: `# Day 3 — Rules of ML

Many ML teams fail because they reach for sophistication too early. The practical wisdom in *Rules of ML* is that operational leverage usually comes from strong baselines, clear metrics, and fast iteration loops.

Today you will translate that wisdom into engineering language:

- what should stay simple at first
- what should be instrumented early
- why system learning loops matter more than model cleverness
`,
      outcomes: [
        'Extract and explain five rules.',
        'Connect each rule to a real system risk.',
        'Build intuition for disciplined iteration.',
      ],
      tasks: [
        { id: 'w1d3-read', label: 'Read the first half of Rules of ML.', type: 'reading', required: true },
        { id: 'w1d3-notes', label: 'Capture five rules and why they exist.', type: 'notes', required: true },
        { id: 'w1d3-quiz', label: 'Answer the checkpoint question.', type: 'quiz', required: true },
        { id: 'w1d3-reflect', label: 'Write your reflection.', type: 'reflection', required: true },
      ],
      quiz: [
        {
          id: 'w1d3-q1',
          prompt: 'What is the safest early-stage strategy for an ML system?',
          options: [
            'Start with the simplest model and strongest measurement loop',
            'Start with the deepest model you can afford',
            'Delay evaluation until the model is complex enough',
          ],
          answer: 'Start with the simplest model and strongest measurement loop',
          explanation:
            'The rule exists because operational learning and baseline clarity compound faster than premature complexity.',
        },
      ],
      reflectionPrompts: [
        'Which rule do you think experienced backend engineers most often underestimate in ML?',
      ],
      deliverables: ['Five-rule note', 'Quiz completion', 'Reflection entry'],
      references: [{ title: 'Rules of ML', kind: 'paper', required: true }],
    },
    {
      id: 'week-1-day-4',
      slug: 'day-4',
      kind: 'day',
      title: 'Day 4 — System Thinking',
      durationLabel: '2 hours',
      schedule: [
        '0:00-1:00 Finish Rules of ML',
        '1:00-1:45 Draw an end-to-end ML system: data → train → evaluate → serve → monitor',
        '1:45-2:00 Reflection: where can things break?',
      ],
      summary: 'You shift from isolated ideas into system design: every stage hands risk to the next.',
      narrative: `# Day 4 — System Thinking

By now you have enough vocabulary to stop thinking of ML as a model-in-a-box. Today you map the full system and label where assumptions can rot.

## Your design target

Draw and explain:

data -> validation -> feature prep -> training -> evaluation -> artifact registry -> serving -> monitoring -> retraining

For each box, ask:

- what enters here?
- what can go stale?
- what can become inconsistent?
- what evidence do we need that it still works?
`,
      outcomes: [
        'Explain the end-to-end system path from data to monitoring.',
        'Identify breakpoints and dependencies at each stage.',
        'Prepare for Friday project setup with a systems-first lens.',
      ],
      tasks: [
        { id: 'w1d4-read', label: 'Finish Rules of ML.', type: 'reading', required: true },
        { id: 'w1d4-diagram', label: 'Create an end-to-end ML system diagram.', type: 'notes', required: true },
        { id: 'w1d4-reflect', label: 'Record where the system can break.', type: 'reflection', required: true },
      ],
      reflectionPrompts: [
        'Which stage is most likely to hide a quiet operational failure?',
        'Where would you enforce contracts versus monitoring?',
      ],
      deliverables: ['System diagram', 'Failure annotations'],
      references: [{ title: 'Rules of ML', kind: 'paper', required: true }],
    },
    {
      id: 'week-1-day-5',
      slug: 'day-5',
      kind: 'day',
      title: 'Day 5 — Project Setup',
      durationLabel: '2 hours',
      schedule: [
        '0:00-0:30 Create the ml-system-basics repo structure',
        '0:30-1:30 Start the training script and load a dataset',
        '1:30-2:00 Write a precise weekend build plan',
      ],
      summary: 'Friday transitions from concepts to the concrete project you will finish over the weekend.',
      narrative: `# Day 5 — Project Setup

Today you open the persistent project workspace. The goal is not to finish everything. The goal is to make the weekend inevitable by removing setup friction now.

## What the project must become by Sunday

- train a model
- save an artifact
- serve predictions
- handle failure cases
- run in Docker
- explain its own weaknesses
`,
      outcomes: [
        'Create or open the ml-system-basics workspace.',
        'Understand the project file layout.',
        'Write the exact weekend plan before leaving the day.',
      ],
      tasks: [
        { id: 'w1d5-project', label: 'Open or create the ml-system-basics project workspace.', type: 'project', required: true },
        { id: 'w1d5-light-code', label: 'Review the starter files and begin the training script.', type: 'coding', required: true },
        { id: 'w1d5-plan', label: 'Write the weekend build plan.', type: 'notes', required: true },
      ],
      reflectionPrompts: ['What looks most likely to slow you down this weekend?'],
      deliverables: ['Initialized project workspace', 'Weekend plan'],
      references: [
        { title: 'FastAPI docs', kind: 'docs' },
        { title: 'scikit-learn getting started', kind: 'docs' },
      ],
    },
    {
      id: 'week-1-sat',
      slug: 'saturday',
      kind: 'weekend',
      title: 'Saturday — Build the System',
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1 (2 hrs): finish training system and model artifact save',
        'Block 2 (2 hrs): build FastAPI serving API with /predict',
        'Block 3 (2 hrs): test predictions, debug, and validate inputs',
        'Block 4 (1-2 hrs): refactor into a config-driven shape',
      ],
      summary: 'Saturday is the build-heavy day: training, serving, validation, and refactoring.',
      narrative: `# Saturday — Real Work

This is where the week becomes real. You will work inside the persistent project workspace and leave with a functioning system skeleton.

## Required build path

1. Finish the training script
2. Save the model artifact
3. Expose a \`/predict\` endpoint
4. Add input validation
5. Clean obvious duplication

Do not chase breadth. Finish the path.
`,
      outcomes: [
        'Produce a functioning train-save-serve workflow.',
        'Handle the obvious failure paths.',
        'Leave the project in a cleaner state than you found it.',
      ],
      tasks: [
        { id: 'w1sat-train', label: 'Finish the training and artifact save path.', type: 'project', required: true },
        { id: 'w1sat-serve', label: 'Add the FastAPI serving API and /predict route.', type: 'project', required: true },
        { id: 'w1sat-debug', label: 'Test and debug the system.', type: 'coding', required: true },
        { id: 'w1sat-refactor', label: 'Refactor toward configuration-driven structure.', type: 'coding', required: true },
      ],
      reflectionPrompts: [
        'Which part of the train-versus-serve path feels most fragile right now?',
      ],
      deliverables: ['Working service path', 'Debug notes', 'Refactored project files'],
      references: [
        { title: 'FastAPI docs', kind: 'docs', required: true },
        { title: 'Dockerfile best practices', kind: 'docs' },
      ],
    },
    {
      id: 'week-1-sun',
      slug: 'sunday',
      kind: 'weekend',
      title: 'Sunday — Dockerize, Simulate Failure, and Write',
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1 (2 hrs): Dockerize and run the system',
        'Block 2 (2 hrs): simulate failures and edge cases',
        'Block 3 (2 hrs): write both required documents',
        'Block 4 (1-2 hrs): README and architecture explanation',
      ],
      summary: 'Sunday proves understanding through failure simulation and writing.',
      narrative: `# Sunday — Prove Understanding

You are not done because the endpoint works. You are done when you can explain why it will fail, how you would detect that failure, and what operational boundaries you put in place.
`,
      outcomes: [
        'Dockerize the project.',
        'Simulate and name failure modes.',
        'Produce the two required written artifacts.',
      ],
      tasks: [
        { id: 'w1sun-docker', label: 'Write or refine the Dockerfile and validate the container path.', type: 'project', required: true },
        { id: 'w1sun-failure', label: 'Simulate bad inputs, missing model, and edge cases.', type: 'coding', required: true },
        { id: 'w1sun-essay1', label: 'Write Why ML Systems Fail in Production.', type: 'writing', required: true },
        { id: 'w1sun-essay2', label: 'Write Failure Modes in My System.', type: 'writing', required: true },
        { id: 'w1sun-docs', label: 'Finish README and architecture explanation.', type: 'writing', required: true },
      ],
      reflectionPrompts: [
        'Do you truly understand your own system failures well enough to move to Week 2?',
      ],
      deliverables: ['Dockerized project', 'Two essays', 'README and architecture note'],
      references: [{ title: 'Docker docs', kind: 'docs' }],
    },
  ],
};

const mlopsCourse: LearningCourse = {
  id: 'course-mlops',
  slug: 'mlops',
  title: 'Principal MLOps and AI Infra',
  subtitle: 'A guided path from backend engineering intuition to principal-level ML systems judgment.',
  level: 'Senior backend engineer → Principal MLOps / AI infra engineer',
  duration: '10 weeks core path + continuing weekly briefings',
  focus: ['Python', 'MLOps', 'distributed systems', 'GPU systems', 'LLM infrastructure'],
  description:
    'This course is built for a strong backend engineer who needs a rigorous, systems-first path into ML production engineering, infrastructure, reliability, and scale.',
  audience: [
    'You already know how to design services and APIs.',
    'You can write Python, but ML systems still feel fuzzy.',
    'You want operational depth, not shallow model tutorials.',
  ],
  principles: [
    'Learn the system before optimizing the model.',
    'Write and reflect every week; understanding should survive away from the keyboard.',
    'Always tie concepts to failure modes, observability, and operator behavior.',
  ],
  projects: [mlSystemBasicsTemplate],
  briefings: [
    {
      weekOf: '2026-04-20',
      title: 'Weekly Briefing — Evaluation, cost control, and serving discipline',
      summary:
        'Use this section to capture recent model-serving, observability, and evaluation shifts before starting the week.',
      bullets: [
        'Track evaluation discipline, not only model capability announcements.',
        'Watch for changes in inference cost and serving ergonomics.',
        'Translate new tooling into architecture consequences before adopting it.',
      ],
    },
  ],
  weeks: [
    mlopsWeek1,
    mlopsWeek2,
    mlopsWeek3,
    mlopsWeek4,
    mlopsWeek5,
    mlopsWeek6,
    mlopsWeek7,
    mlopsWeek8,
    mlopsWeek9,
    mlopsWeek10,
  ],
};

const rustMlCourse: LearningCourse = {
  id: 'course-rust-ml',
  slug: 'rust-ml',
  title: 'Rust for ML Infrastructure',
  subtitle: 'Use Rust where systems sharpness matters: CLIs, data tooling, performance paths, and serving utilities.',
  level: 'Backend engineer → systems-minded ML infra engineer',
  duration: '8 weeks core path',
  focus: ['Rust', 'systems programming', 'data tooling', 'ML infrastructure ergonomics'],
  description:
    'This course teaches Rust in the context that matters for MLOps and AI infrastructure: performance-critical tooling, safety, and operational clarity.',
  audience: [
    'You already think like a backend engineer.',
    'You need a systems language for sharp edges in ML infrastructure.',
    'You want Rust taught through infra use cases, not toy language drills.',
  ],
  principles: [
    'Map ownership and borrowing to resource lifetime and system boundaries.',
    'Prefer explicit failure handling over magic.',
    'Treat Rust as a leverage tool for reliability and performance-critical components.',
  ],
  projects: [rustMlTemplate],
  briefings: [
    {
      weekOf: '2026-04-20',
      title: 'Weekly Briefing — Why Rust belongs in ML infra',
      summary: 'Use this space to track where Rust is actually buying leverage in tooling, runtimes, and service edges.',
      bullets: [
        'Reach for Rust when correctness and latency both matter.',
        'Use Python for orchestration and iteration; use Rust for critical edges and tooling.',
      ],
    },
  ],
  weeks: [
    rustWeek1,
    buildOutlineWeek(
      'rust-week-2',
      'week-2',
      'Week 2 — Ownership, Borrowing, and Memory Layout',
      'Resource lifetime, references, slices, and performance intuition',
      'Week 2 builds the memory discipline that makes Rust useful in infra.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Borrowing notes', 'Memory safety examples', 'Refactor review'],
      'Ownership and memory',
      'Refactor the CLI to use borrowed data paths and cleaner error handling',
      ['The Rust Book ownership chapters', 'Rust by Example'],
    ),
    buildOutlineWeek(
      'rust-week-3',
      'week-3',
      'Week 3 — Error Handling and Robust Tooling',
      'Result, Option, pattern matching, and operational failure paths',
      'Week 3 maps Rust error handling directly to operator trust.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Error handling checklist', 'CLI failure cases', 'User-facing diagnostics'],
      'Resilient tooling',
      'Add argument validation, errors, and structured command handling',
      ['The Rust Book error handling chapters', 'Command-line UX references'],
    ),
    buildOutlineWeek(
      'rust-week-4',
      'week-4',
      'Week 4 — Concurrency and Async',
      'Threads, channels, async tasks, and throughput thinking',
      'Week 4 introduces concurrency in service of infra tooling and data paths.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Concurrency notes', 'Worker prototype', 'Tradeoff memo'],
      'Concurrency and throughput',
      'Build a parallel file or batch processor',
      ['Tokio docs', 'Rust channels references'],
    ),
    buildOutlineWeek(
      'rust-week-5',
      'week-5',
      'Week 5 — Data Pipelines and Serialization',
      'Serde, file formats, and structured data movement',
      'Week 5 makes Rust useful for data movement and transformation tasks.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Serialization notes', 'Data transformer prototype', 'Schema review'],
      'Data tooling',
      'Build a structured data ingestion and validation CLI',
      ['Serde docs', 'CSV/JSON references'],
    ),
    buildOutlineWeek(
      'rust-week-6',
      'week-6',
      'Week 6 — Python and Rust Together',
      'FFI, pyo3, and where the language boundary should sit',
      'Week 6 is about composing Python ergonomics with Rust performance.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Interop design note', 'Boundary decision memo', 'Prototype wrapper'],
      'Python/Rust interoperability',
      'Wrap a Rust helper for use in a Python-centric ML workflow',
      ['pyo3 docs', 'FFI references'],
    ),
    buildOutlineWeek(
      'rust-week-7',
      'week-7',
      'Week 7 — High-Performance Serving Utilities',
      'Fast parsing, validation, and systems edges',
      'Week 7 turns Rust into a serving-side tool for critical hot paths.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Serving utility design', 'Latency notes', 'Observability checklist'],
      'Performance-oriented service edges',
      'Build a high-signal serving-side utility or validator',
      ['Tracing docs', 'Rust performance notes'],
    ),
    buildOutlineWeek(
      'rust-week-8',
      'week-8',
      'Week 8 — Packaging, Observability, and Deployable Tools',
      'Logs, metrics, releases, and maintainable delivery',
      'Week 8 closes the loop by turning Rust code into operational tooling.',
      '2 hours weekdays, 6-8 hours each weekend day',
      ['Packaging notes', 'Observability setup', 'Release checklist'],
      'Operationalizing Rust tooling',
      'Package and document a deployable ML infra utility',
      ['Cargo packaging docs', 'Tracing and telemetry references'],
    ),
  ],
};

export const learningCatalog: LearningCourse[] = [mlopsCourse, rustMlCourse];

export function getCourseBySlug(courseSlug: string) {
  return learningCatalog.find((course) => course.slug === courseSlug);
}

export function getWeekBySlug(courseSlug: string, weekSlug: string) {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  return course.weeks.find((week) => week.slug === weekSlug);
}

export function getFlattenedModule(courseSlug: string, weekSlug: string, moduleSlug: string): FlattenedModule | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;

  const flattened = course.weeks.flatMap((week) =>
    week.modules.map((module) => ({ course, week, module })),
  );
  const index = flattened.findIndex(
    (item) => item.week.slug === weekSlug && item.module.slug === moduleSlug,
  );
  if (index === -1) return undefined;

  const current = flattened[index];
  const previousItem = flattened[index - 1];
  const nextItem = flattened[index + 1];

  return {
    ...current,
    index,
    total: flattened.length,
    previous: previousItem
      ? { weekSlug: previousItem.week.slug, moduleSlug: previousItem.module.slug }
      : undefined,
    next: nextItem
      ? { weekSlug: nextItem.week.slug, moduleSlug: nextItem.module.slug }
      : undefined,
  };
}

export function getProjectTemplate(courseSlug: string, projectSlug: string) {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  return course.projects.find((project) => project.slug === projectSlug);
}
