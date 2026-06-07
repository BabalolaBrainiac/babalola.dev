import {
  FlattenedModule,
  LearningCourse,
  LearningModule,
  LearningWeek,
  ProjectTemplate,
  ReferenceItem,
} from '@/features/learning/types';
import { mlopsWeek2 } from './mlops-week2';
import {
  mlopsWeek3,
  mlopsWeek4,
  mlopsWeek5,
} from './mlops-weeks3to10';
import {
  mlopsWeek6,
  mlopsWeek7,
  mlopsWeek8,
  mlopsWeek9,
  mlopsWeek10,
  mlopsWeek11,
  mlopsWeek12,
  mlopsWeek13,
  mlopsWeek14,
  mlopsWeek15,
  mlopsWeek16,
} from './mlops-advanced';
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

const productionMlPlatformTemplate: ProjectTemplate = {
  slug: 'production-ml-platform',
  title: 'production-ml-platform',
  description:
    'A production AI platform slice with reproducible training, measured serving performance, capacity planning, promotion controls, tracing, drift checks, and operator runbooks.',
  language: 'python',
  downloadName: 'production-ml-platform-workspace.json',
  validation: {
    mode: 'source_contains',
    patterns: ['mlflow', 'FastAPI', 'traceparent', 'detect_drift', 'capacity', 'benchmark', 'triton'],
    successMessage:
      'The platform slice now includes tracked training, served inference, tracing, drift monitoring, benchmarking, and capacity planning.',
  },
  files: [
    {
      path: 'README.md',
      language: 'markdown',
      content: `# production-ml-platform

Build a production-shaped MLOps platform slice, not a notebook.

## System goal

Train a model with traceable inputs, register the artifact, serve it behind an API, monitor live batches for drift, and leave an operator with enough documentation to debug the system under pressure.

## Architecture

1. \`src/train.py\` trains a model and logs params, metrics, artifacts, and tags to MLflow.
2. \`src/serve.py\` loads the selected artifact and exposes health and prediction endpoints.
3. \`src/monitor.py\` compares production batches against a training baseline.
4. \`src/config.py\` centralizes runtime settings.
5. \`docker-compose.yml\` runs the API with a local MLflow service.
6. \`src/benchmark.py\` defines a reproducible latency and goodput benchmark.
7. \`docs/capacity-plan.md\` turns workload assumptions into replica, memory, and cost requirements.
8. \`kernels/fused_silu.py\` is the GPU-kernel workshop used for the CUDA and Triton performance phase.

## Acceptance criteria

- every run has a config hash
- every model artifact has lineage back to a run
- every request accepts and returns \`traceparent\`
- drift checks can block or alert on bad batches
- performance qualification reports p50, p95, p99, throughput, and SLO-compliant goodput
- capacity planning states workload distribution, headroom, failure capacity, and cost assumptions
- deployment promotion requires explicit quality and performance evidence
- the runbook explains rollback, missing artifact, and degraded input paths
`,
    },
    {
      path: 'src/config.py',
      language: 'python',
      content: `from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    experiment_name: str = "production-ml-platform"
    model_path: Path = Path("artifacts/model.joblib")
    baseline_path: Path = Path("artifacts/baseline.json")
    random_state: int = 42
    test_size: float = 0.2
    drift_threshold: float = 0.25
    service_name: str = "ml-inference-api"
`,
    },
    {
      path: 'src/train.py',
      language: 'python',
      content: `from __future__ import annotations

import hashlib
import json
from pathlib import Path

import joblib
import mlflow
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from config import Settings


def config_hash(settings: Settings) -> str:
    payload = {
        "random_state": settings.random_state,
        "test_size": settings.test_size,
        "model_type": "LogisticRegression",
    }
    encoded = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def train() -> None:
    settings = Settings()
    data = load_iris()
    x_train, x_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=settings.test_size,
        random_state=settings.random_state,
    )

    model = LogisticRegression(max_iter=300)

    mlflow.set_experiment(settings.experiment_name)
    with mlflow.start_run() as run:
        mlflow.set_tag("system", "production-ml-platform")
        mlflow.set_tag("config_hash", config_hash(settings))
        mlflow.log_param("model_type", "LogisticRegression")
        mlflow.log_param("random_state", settings.random_state)
        mlflow.log_param("test_size", settings.test_size)

        model.fit(x_train, y_train)
        predictions = model.predict(x_test)
        accuracy = accuracy_score(y_test, predictions)
        mlflow.log_metric("accuracy", accuracy)

        settings.model_path.parent.mkdir(exist_ok=True)
        joblib.dump(model, settings.model_path)

        baseline = {
            "feature_means": x_train.mean(axis=0).tolist(),
            "feature_names": data.feature_names,
            "run_id": run.info.run_id,
        }
        settings.baseline_path.write_text(json.dumps(baseline, indent=2))
        mlflow.log_artifact(str(settings.model_path))
        mlflow.log_artifact(str(settings.baseline_path))

        print(f"run_id={run.info.run_id}")
        print(f"accuracy={accuracy:.4f}")


if __name__ == "__main__":
    train()
`,
    },
    {
      path: 'src/serve.py',
      language: 'python',
      content: `from __future__ import annotations

from pathlib import Path
from typing import Annotated

import joblib
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from config import Settings


class PredictionRequest(BaseModel):
    features: list[float] = Field(..., min_length=4, max_length=4)


settings = Settings()
app = FastAPI(title=settings.service_name)


def load_model():
    model_path = Path(settings.model_path)
    if not model_path.exists():
        raise FileNotFoundError(f"model artifact missing at {model_path}")
    return joblib.load(model_path)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.service_name}


@app.post("/predict")
def predict(
    payload: PredictionRequest,
    traceparent: Annotated[str | None, Header()] = None,
):
    try:
        model = load_model()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    prediction = int(model.predict([payload.features])[0])
    return {
        "prediction": prediction,
        "traceparent": traceparent or "missing",
        "model_path": str(settings.model_path),
    }
`,
    },
    {
      path: 'src/monitor.py',
      language: 'python',
      content: `from __future__ import annotations

import json
from pathlib import Path

from config import Settings


def detect_drift(batch_means: list[float], baseline_means: list[float], threshold: float) -> dict:
    deltas = [abs(current - baseline) for current, baseline in zip(batch_means, baseline_means)]
    max_delta = max(deltas)
    return {
        "status": "alert" if max_delta > threshold else "ok",
        "max_delta": max_delta,
        "deltas": deltas,
    }


def load_baseline(path: Path) -> list[float]:
    payload = json.loads(path.read_text())
    return [float(value) for value in payload["feature_means"]]


if __name__ == "__main__":
    settings = Settings()
    baseline = load_baseline(settings.baseline_path)
    production_batch_means = [5.7, 3.1, 4.9, 1.7]
    result = detect_drift(production_batch_means, baseline, settings.drift_threshold)
    print(json.dumps(result, indent=2))
`,
    },
    {
      path: 'src/benchmark.py',
      language: 'python',
      content: `from __future__ import annotations

from dataclasses import dataclass
from math import ceil


@dataclass(frozen=True)
class BenchmarkResult:
    latencies_ms: list[float]
    completed_requests: int
    duration_seconds: float
    slo_ms: float


def percentile(values: list[float], percentile_value: float) -> float:
    ordered = sorted(values)
    index = min(ceil((percentile_value / 100) * len(ordered)) - 1, len(ordered) - 1)
    return ordered[index]


def benchmark_report(result: BenchmarkResult) -> dict:
    within_slo = sum(latency <= result.slo_ms for latency in result.latencies_ms)
    return {
        "p50_ms": percentile(result.latencies_ms, 50),
        "p95_ms": percentile(result.latencies_ms, 95),
        "p99_ms": percentile(result.latencies_ms, 99),
        "throughput_rps": result.completed_requests / result.duration_seconds,
        "goodput_rps": within_slo / result.duration_seconds,
        "slo_attainment": within_slo / len(result.latencies_ms),
    }


if __name__ == "__main__":
    sample = BenchmarkResult(
        latencies_ms=[12, 13, 14, 15, 18, 21, 25, 31, 70, 140],
        completed_requests=10,
        duration_seconds=1.0,
        slo_ms=50,
    )
    print(benchmark_report(sample))
`,
    },
    {
      path: 'docs/capacity-plan.md',
      language: 'markdown',
      content: `# Capacity and Performance Plan

## Workload definition

- request arrival distribution:
- input and output size distribution:
- steady-state and peak requests per second:
- latency and quality SLO:
- expected growth:

## Measured baseline

- hardware and runtime:
- p50 / p95 / p99:
- saturation throughput:
- SLO-compliant goodput:
- CPU, memory, accelerator, and network utilization:

## Capacity model

Document the equations and assumptions used to calculate:

- replicas required at steady state and peak
- headroom for burst and one-node failure
- model and cache memory per replica
- cold-start and scale-up budget
- monthly infrastructure cost

## Regression gates

Define the performance, quality, memory, and cost regressions that block promotion.
`,
    },
    {
      path: 'docs/promotion-policy.md',
      language: 'markdown',
      content: `# Model Promotion Policy

Promotion requires immutable artifact identity and evidence for:

1. data and configuration lineage
2. offline quality and cohort regressions
3. performance qualification under production-shaped load
4. shadow comparison against the current model
5. staged canary with automatic rollback thresholds
6. operator approval for unresolved risks

Every promotion must remain reversible.
`,
    },
    {
      path: 'docs/performance-method.md',
      language: 'markdown',
      content: `# Performance Engineering Method

## Rule

Never optimize without a workload definition, baseline, profiler hypothesis, correctness guardrail, and before/after measurement.

## Benchmark record

- objective and SLO:
- production-shaped workload distribution:
- hardware, driver, runtime, model, and configuration:
- warmup and measurement duration:
- concurrency and batching:
- p50 / p95 / p99:
- throughput and SLO-compliant goodput:
- CPU, memory, accelerator, network, and storage utilization:
- quality or numerical-correctness result:
- cost per useful unit:
- variance and confidence:

## Profiler workflow

1. Measure end to end and locate the critical path.
2. Decompose queueing, I/O, host work, transfers, kernels, collectives, and synchronization.
3. Form one bottleneck hypothesis.
4. Select the smallest set of counters that can prove or disprove it.
5. Change one important variable.
6. Repeat the benchmark and report negative results.

## Optimization review

State why the optimization works, where it stops working, what complexity it adds, and what evidence would justify reverting it.
`,
    },
    {
      path: 'kernels/fused_silu.py',
      language: 'python',
      content: `"""Week 11 workshop: implement and benchmark a fused SiLU kernel.

This file is intentionally incomplete. Run it on a CUDA-capable environment
with PyTorch and Triton installed. Do not claim a speedup without validating
numerical correctness across shapes and reporting benchmark variance.
"""

import torch
import triton
import triton.language as tl


@triton.jit
def fused_silu_kernel(
    input_ptr,
    output_ptr,
    n_elements: tl.constexpr,
    BLOCK_SIZE: tl.constexpr,
):
    offsets = tl.program_id(axis=0) * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
    mask = offsets < n_elements
    x = tl.load(input_ptr + offsets, mask=mask)

    # TODO: compute x * sigmoid(x) without writing an intermediate tensor.
    output = x

    tl.store(output_ptr + offsets, output, mask=mask)


def fused_silu(x: torch.Tensor) -> torch.Tensor:
    output = torch.empty_like(x)
    grid = (triton.cdiv(x.numel(), 256),)
    fused_silu_kernel[grid](x, output, x.numel(), BLOCK_SIZE=256)
    return output


def validate() -> None:
    for size in [1, 127, 256, 1025, 1_000_000]:
        x = torch.randn(size, device="cuda", dtype=torch.float16)
        expected = torch.nn.functional.silu(x)
        actual = fused_silu(x)
        torch.testing.assert_close(actual, expected, rtol=1e-2, atol=1e-2)


if __name__ == "__main__":
    validate()
    print("KERNEL CORRECTNESS PASSED")
`,
      solution: `import torch
import triton
import triton.language as tl


@triton.jit
def fused_silu_kernel(input_ptr, output_ptr, n_elements: tl.constexpr, BLOCK_SIZE: tl.constexpr):
    offsets = tl.program_id(axis=0) * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
    mask = offsets < n_elements
    x = tl.load(input_ptr + offsets, mask=mask)
    output = x * tl.sigmoid(x)
    tl.store(output_ptr + offsets, output, mask=mask)


def fused_silu(x: torch.Tensor) -> torch.Tensor:
    output = torch.empty_like(x)
    grid = (triton.cdiv(x.numel(), 256),)
    fused_silu_kernel[grid](x, output, x.numel(), BLOCK_SIZE=256)
    return output
`,
    },
    {
      path: 'docs/kernel-benchmark-plan.md',
      language: 'markdown',
      content: `# Kernel Benchmark Plan

Compare the Triton fused SiLU kernel against the framework baseline.

## Correctness matrix

- dtypes: FP32, FP16, BF16 where supported
- sizes: boundary, irregular, small, medium, and large
- values: random, zero, large positive, large negative, NaN/Inf policy

## Performance matrix

- report median and high-percentile runtime after warmup
- sweep tensor sizes and block sizes
- record achieved memory bandwidth and kernel launches
- identify where launch overhead dominates
- identify where the fused kernel stops winning

## Review

Explain the speedup using removed intermediate memory traffic and launch overhead. Check whether register pressure, occupancy, or unsupported shapes create regressions.
`,
    },
    {
      path: 'docker-compose.yml',
      language: 'yaml',
      content: `services:
  api:
    build: .
    command: uvicorn src.serve:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    environment:
      MLFLOW_TRACKING_URI: http://mlflow:5000
    depends_on:
      - mlflow

  mlflow:
    image: ghcr.io/mlflow/mlflow:v3.5.0
    command: mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:////mlflow/mlflow.db --default-artifact-root /mlflow/artifacts
    ports:
      - "5000:5000"
    volumes:
      - mlflow-data:/mlflow

volumes:
  mlflow-data:
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

CMD ["uvicorn", "src.serve:app", "--host", "0.0.0.0", "--port", "8000"]
`,
    },
    {
      path: 'requirements.txt',
      language: 'text',
      content: `fastapi==0.115.0
uvicorn==0.30.6
joblib==1.4.2
scikit-learn==1.5.2
mlflow==3.5.0
pydantic==2.9.2
`,
    },
    {
      path: 'docs/operator-runbook.md',
      language: 'markdown',
      content: `# Operator Runbook

## Missing model artifact

Symptom: \`/predict\` returns 503.

Action:

1. Check that \`artifacts/model.joblib\` exists.
2. Re-run \`python src/train.py\`.
3. Confirm the MLflow run logged the artifact and baseline.

## Drift alert

Symptom: \`src/monitor.py\` returns \`"status": "alert"\`.

Action:

1. Confirm the batch is from the expected source and time window.
2. Compare feature-level deltas against the baseline file.
3. Decide whether to block the batch, retrain, or raise an incident.

## Trace missing

Symptom: API response contains \`"traceparent": "missing"\`.

Action:

1. Check upstream gateway/service instrumentation.
2. Confirm the caller forwards W3C \`traceparent\`.
3. Add a regression test for header propagation.
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
      title: 'Day 1 — The ML System Is the Product',
      durationLabel: '2 hours',
      schedule: [
        '0:00-0:20 Build the system map and establish the operating vocabulary',
        '0:20-0:55 Read the core paper with a failure-mode lens',
        '0:55-1:15 Write an incident pre-mortem and dependency inventory',
        '1:15-1:50 Implement and test a defensive data contract',
        '1:50-2:00 Complete the checkpoint and record your exit reflection',
      ],
      summary:
        'Reset the frame: the model is one component inside a socio-technical production system whose data, contracts, operators, and feedback loops determine whether it is useful.',
      narrative: `# The model is not the product

Your product is a **reliable decision system**. A trained model is only one artifact moving through that system.

An ML service can return HTTP 200, stay below its latency SLO, and still be materially wrong. That is the central operating problem for MLOps: ordinary service health does not prove model health.

## Start with the system map

A production prediction usually travels through this path:

\`\`\`text
source -> validation -> features -> training -> evaluation -> registry
       -> deployment -> online features -> prediction -> feedback -> retraining
\`\`\`

Every arrow is a contract. Every contract can drift. Every stage needs an owner, a version, an observable signal, and a failure policy.

## The 5% illusion

Model code is usually the small, visible part. The expensive part is the surrounding system:

- collecting and labeling data
- reproducing features across training and serving
- evaluating whether a candidate is actually better
- promoting, serving, monitoring, and rolling back artifacts
- tracing decisions back to code, data, config, and model versions

This is why a notebook result is evidence, not a deployable product.

## Three failure classes to learn today

### 1. Data dependency debt

An upstream team changes a default age from \`null\` to \`-1\`. The pipeline still runs, but the learned relationship changes. This is worse than a crash because the failure can remain invisible.

### 2. Entanglement and CACE

In ML, changing one feature can alter how the model uses every other feature. **Changing Anything Changes Everything** means isolated-looking changes require system-level evaluation.

### 3. Feedback loops

A recommender influences what users click. Those clicks become future training data. The system is now learning partly from behavior it created itself.

## Incident pre-mortem

Assume the model's business metric falls 15% while API latency, error rate, and CPU remain normal. Before coding, write down:

1. Which upstream dependencies could cause this?
2. Which signals would distinguish schema drift, data drift, and a bad model release?
3. What must be versioned to reproduce the decision path?
4. Where should the system fail closed instead of continuing?

## Applied lab: enforce the boundary

You will implement a data contract for an inference payload. The contract must reject malformed identity, impossible age, unsupported schema versions, wrong feature shape, and non-finite values.

This is intentionally more than type checking. A useful contract encodes the assumptions the model needs in order to behave predictably.

### Acceptance criteria

- invalid cases fail with a useful \`ValueError\`
- the valid case is normalized to floating-point features
- the caller can distinguish rejection from acceptance
- the full test harness prints \`CONTRACT CHECKS PASSED\`

## Exit standard

Do not mark the session complete because you read the material. Mark it complete when you can explain where silent failure enters the system, name the signal that would expose it, and enforce one boundary in code.
`,
      outcomes: [
        'Explain why healthy infrastructure metrics do not prove healthy ML behavior.',
        'Map the major contracts and failure surfaces in an end-to-end ML system.',
        'Distinguish data dependency debt, entanglement, and feedback loops.',
        'Implement and test a production-shaped Python data contract.',
      ],
      tasks: [
        { id: 'w1d1-read', label: 'Read the core paper and annotate each production failure mechanism.', type: 'reading', required: true },
        { id: 'w1d1-notes', label: 'Write the incident pre-mortem and dependency inventory.', type: 'notes', required: true },
        { id: 'w1d1-lab', label: 'Make every contract test pass without weakening the test harness.', type: 'coding', required: true },
        { id: 'w1d1-reflect', label: 'Record the first signal you would add to a real ML system.', type: 'reflection', required: true },
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
            'Encode the model input assumptions as an executable boundary and prove that invalid payloads cannot enter the system.',
          language: 'python',
          files: [
            {
              path: 'main.py',
              language: 'python',
              readOnly: true,
              content: `from data_contract import validate_payload

CASES = [
    ("bad identity", {"schema_version": "v1", "user_id": "", "age": 31, "features": [0.2, 0.3, 0.4, 0.5]}, False),
    ("impossible age", {"schema_version": "v1", "user_id": "u-42", "age": -1, "features": [0.2, 0.3, 0.4, 0.5]}, False),
    ("wrong feature shape", {"schema_version": "v1", "user_id": "u-42", "age": 31, "features": [0.2, 0.3]}, False),
    ("non-finite feature", {"schema_version": "v1", "user_id": "u-42", "age": 31, "features": [0.2, float("nan"), 0.4, 0.5]}, False),
    ("unsupported schema", {"schema_version": "v2", "user_id": "u-42", "age": 31, "features": [0.2, 0.3, 0.4, 0.5]}, False),
    ("valid payload", {"schema_version": "v1", "user_id": "u-42", "age": 31, "features": [1, 2.0, 3, 4.0]}, True),
]

for name, payload, should_pass in CASES:
    try:
        result = validate_payload(payload)
        assert should_pass, f"{name} should have been rejected"
        assert result["features"] == [1.0, 2.0, 3.0, 4.0]
        print(f"ACCEPTED: {name}")
    except ValueError as exc:
        assert not should_pass, f"{name} should have passed: {exc}"
        print(f"REJECTED: {name} -> {exc}")

print("CONTRACT CHECKS PASSED")
`,
            },
            {
              path: 'data_contract.py',
              language: 'python',
              content: `import math

SUPPORTED_SCHEMA = "v1"
FEATURE_COUNT = 4


def validate_payload(raw_data: dict) -> dict:
    """Validate and normalize one inference payload."""
    # TODO 1: schema_version must equal SUPPORTED_SCHEMA
    # TODO 2: user_id must be a non-empty string
    # TODO 3: age must be an int from 0 through 120 (bool is not valid)
    # TODO 4: features must be a list with exactly FEATURE_COUNT items
    # TODO 5: every feature must be int/float, but not bool, and math.isfinite
    # TODO 6: return a copy of raw_data with features normalized to floats
    return raw_data
`,
              solution: `import math

SUPPORTED_SCHEMA = "v1"
FEATURE_COUNT = 4


def validate_payload(raw_data: dict) -> dict:
    if raw_data.get("schema_version") != SUPPORTED_SCHEMA:
        raise ValueError("Unsupported schema_version")

    user_id = raw_data.get("user_id")
    if not isinstance(user_id, str) or not user_id.strip():
        raise ValueError("user_id must be a non-empty string")

    age = raw_data.get("age")
    if isinstance(age, bool) or not isinstance(age, int) or not 0 <= age <= 120:
        raise ValueError("age must be an integer from 0 through 120")

    features = raw_data.get("features")
    if not isinstance(features, list) or len(features) != FEATURE_COUNT:
        raise ValueError(f"features must contain exactly {FEATURE_COUNT} values")

    if not all(
        not isinstance(value, bool)
        and isinstance(value, (int, float))
        and math.isfinite(value)
        for value in features
    ):
        raise ValueError("features must contain only finite numbers")

    return {**raw_data, "features": [float(value) for value in features]}
`,
            },
          ],
          hints: [
            'Validate the schema version first. It defines how every later field should be interpreted.',
            'In Python, `bool` is a subclass of `int`, so explicitly reject booleans before accepting numeric values.',
            'Use `math.isfinite(value)` to reject `nan`, positive infinity, and negative infinity.',
            'Normalize only after validation: return `{**raw_data, "features": [float(value) for value in features]}`.',
          ],
          validation: {
            mode: 'python_output',
            target: 'CONTRACT CHECKS PASSED',
            successMessage:
              'The boundary rejects malformed payloads and normalizes the valid path without weakening the test harness.',
          },
        },
      ],
      reflectionPrompts: [
        'If API health stayed green while prediction quality degraded, what signal would you inspect first and why?',
        'Which assumption in today\'s contract is most likely to change, and how would you version that change safely?',
      ],
      deliverables: ['Incident pre-mortem', 'ML dependency inventory', 'Passing data contract lab', 'Exit reflection'],
      references: [
        {
          title: 'Hidden Technical Debt in Machine Learning Systems',
          author: 'Sculley et al.',
          kind: 'paper',
          url: 'https://papers.nips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf',
          required: true,
          note: 'Read sections 1-4 today. Annotate each debt pattern with an operational signal or control.',
        },
        {
          title: 'Designing Machine Learning Systems',
          author: 'Chip Huyen',
          kind: 'book',
          url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
          note: 'Use chapters 1-2 to connect the paper to modern production ML architecture.',
        },
        {
          title: 'Rules of ML',
          author: 'Google',
          kind: 'docs',
          url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
          note: 'Skim rules 1-10 after the lab. They reinforce the value of simple, observable first systems.',
        },
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
  level: 'Senior backend engineer to principal MLOps, AI infra, and performance engineer',
  duration: '16 weeks core path + continuing weekly briefings',
  focus: ['Python', 'distributed systems', 'GPU performance', 'LLM serving', 'CUDA and Triton', 'reliability', 'platform architecture'],
  description:
    'A systems-first path for a senior backend engineer becoming an elite MLOps and AI infrastructure engineer. The course moves from production ML foundations into distributed control planes, GPU fleet operations, distributed training, LLM inference, CUDA and Triton kernel reasoning, quantization, reliability, and principal-level platform architecture. Every advanced module requires measured evidence, not tool-name familiarity.',
  audience: [
    'You already know how to design services and APIs.',
    'You want to reason about model behavior, distributed state, accelerators, and performance from first principles.',
    'You want operational and optimization depth, not shallow model tutorials or framework recipes.',
  ],
  principles: [
    'Learn the system before optimizing the model.',
    'Measure before and after every optimization; report negative results.',
    'Tie every architecture decision to workload, SLO, failure mode, security boundary, and cost.',
    'Treat profiler traces, benchmark methodology, capacity equations, and runbooks as required engineering artifacts.',
    'Write and defend decisions until your understanding survives away from the keyboard and tool.',
  ],
  projects: [mlSystemBasicsTemplate, productionMlPlatformTemplate],
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
    mlopsWeek11,
    mlopsWeek12,
    mlopsWeek13,
    mlopsWeek14,
    mlopsWeek15,
    mlopsWeek16,
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

const referenceUrlsByTitle: Record<string, string> = {
  'Hidden Technical Debt in Machine Learning Systems':
    'https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf',
  'Rules of ML': 'https://developers.google.com/machine-learning/guides/rules-of-ml/',
  'The ML Test Score': 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/',
  'TFX: A TensorFlow-Based Production-Scale Machine Learning Platform':
    'https://research.google/pubs/tfx-a-tensorflow-based-production-scale-machine-learning-platform/',
  'TensorFlow Data Validation: Data Analysis and Validation in Continuous ML Pipelines':
    'https://research.google/pubs/tensorflow-data-validation-data-analysis-and-validation-in-continuous-ml-pipelines/',
  'Designing Machine Learning Systems, Chapters 1-3':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Machine Learning Systems, evaluation chapters':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Machine Learning Systems, Ch 4-6':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Machine Learning Systems, Ch 4–6':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Machine Learning Systems, Ch 4':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Machine Learning Systems, feature stores':
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
  'Designing Data-Intensive Applications':
    'https://martin.kleppmann.com/2017/03/27/designing-data-intensive-applications.html',
  'Reliable Machine Learning': 'https://www.oreilly.com/library/view/reliable-machine-learning/9781098106218/',
  'PyTorch Reproducibility docs': 'https://docs.pytorch.org/docs/stable/notes/randomness.html',
  'MLflow Concepts: Experiments, Runs, Artifacts': 'https://mlflow.org/docs/latest/ml/tracking/',
  'MLflow Quickstart and Concepts': 'https://mlflow.org/docs/latest/getting-started/',
  'MLflow quickstart': 'https://mlflow.org/docs/latest/getting-started/',
  'DVC documentation: data versioning concepts': 'https://dvc.org/doc/user-guide/data-management',
  'DVC quickstart': 'https://dvc.org/doc/start',
  '12-Factor App: Configuration': 'https://12factor.net/config',
  'Hydra: a framework for elegant ML configuration': 'https://hydra.cc/docs/intro/',
  'Python dataclasses docs': 'https://docs.python.org/3/library/dataclasses.html',
  'scikit-learn: model persistence': 'https://scikit-learn.org/stable/model_persistence.html',
  'scikit-learn getting started': 'https://scikit-learn.org/stable/getting_started.html',
  'FastAPI docs': 'https://fastapi.tiangolo.com/',
  'FastAPI: dependency injection for config': 'https://fastapi.tiangolo.com/tutorial/dependencies/',
  'FastAPI production deployment': 'https://fastapi.tiangolo.com/deployment/',
  'Docker docs': 'https://docs.docker.com/',
  'Dockerfile best practices': 'https://docs.docker.com/build/building/best-practices/',
  'Airflow architecture overview (for Week 3 prep)': 'https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/scheduler.html',
  'Great Expectations documentation': 'https://docs.greatexpectations.io/',
  'dbt: data testing': 'https://docs.getdbt.com/docs/build/data-tests',
  'Apache Iceberg: data quality': 'https://iceberg.apache.org/docs/latest/',
  'Feast feature store concepts': 'https://docs.feast.dev/getting-started/concepts/overview',
  'NVIDIA Triton Inference Server docs': 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/',
  'NVIDIA Triton: dynamic batching': 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html',
  'vLLM: continuous batching paper': 'https://arxiv.org/abs/2309.06180',
  'TorchServe: batching guide': 'https://pytorch.org/serve/batch_inference_with_ts.html',
  'KServe docs': 'https://kserve.github.io/website/docs/',
  'Ray Serve docs': 'https://docs.ray.io/en/latest/serve/',
  'OpenTelemetry docs': 'https://opentelemetry.io/docs/',
  'The Rust Book chapters 1-2': 'https://doc.rust-lang.org/book/',
  'The Rust Book Chapter 4 — Ownership': 'https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html',
  'The Rust Book Chapter 4.2 — References and Borrowing': 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html',
  'The Rust Book Chapters 5-6 — Structs and Enums': 'https://doc.rust-lang.org/book/ch05-00-structs.html',
  'The Rust Book Chapter 9 — Error Handling': 'https://doc.rust-lang.org/book/ch09-00-error-handling.html',
  'The Rust Book Chapter 11 — Testing': 'https://doc.rust-lang.org/book/ch11-00-testing.html',
  'The Rust Book Chapter 12 — CLI project': 'https://doc.rust-lang.org/book/ch12-00-an-io-project.html',
  'Cargo docs': 'https://doc.rust-lang.org/cargo/',
  'Rust by Example': 'https://doc.rust-lang.org/stable/rust-by-example/',
  'Rust by Example — ownership': 'https://doc.rust-lang.org/stable/rust-by-example/scope/move.html',
  'Rust by Example — borrowing': 'https://doc.rust-lang.org/stable/rust-by-example/scope/borrow.html',
  'Rust by Example — enums': 'https://doc.rust-lang.org/stable/rust-by-example/custom_types/enum.html',
  'Rust by Example — error handling': 'https://doc.rust-lang.org/stable/rust-by-example/error.html',
  'Rust by Example — file I/O': 'https://doc.rust-lang.org/stable/rust-by-example/std_misc/file.html',
  'Rust by Example — testing': 'https://doc.rust-lang.org/stable/rust-by-example/testing.html',
  'Tokio docs': 'https://tokio.rs/tokio/tutorial',
  'pyo3 docs': 'https://pyo3.rs/',
  'Cargo packaging docs': 'https://doc.rust-lang.org/cargo/reference/publishing.html',
  'Tracing and telemetry references': 'https://docs.rs/tracing/latest/tracing/',
};

function enrichReference(reference: ReferenceItem): ReferenceItem {
  return {
    ...reference,
    url: reference.url ?? referenceUrlsByTitle[reference.title],
  };
}

function enrichCourseReferences(course: LearningCourse): LearningCourse {
  return {
    ...course,
    weeks: course.weeks.map((week) => ({
      ...week,
      modules: week.modules.map((module) => ({
        ...module,
        references: module.references.map(enrichReference),
      })),
    })),
  };
}

export const learningCatalog: LearningCourse[] = [
  enrichCourseReferences(mlopsCourse),
  enrichCourseReferences(rustMlCourse),
];

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
