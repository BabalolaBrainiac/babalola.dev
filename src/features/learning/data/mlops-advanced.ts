import type { LearningModule, LearningWeek, ReferenceItem } from '@/features/learning/types';

interface AdvancedTopic {
  title: string;
  mentalModel: string;
  concepts: string[];
  failureModes: string[];
  drill: string;
  evidence: string;
  question: string;
  answer: string;
  distractors: [string, string];
  references: ReferenceItem[];
}

interface AdvancedWeekSpec {
  id: string;
  slug: string;
  number: number;
  title: string;
  theme: string;
  summary: string;
  build: string;
  review: string;
  outputs: string[];
  topics: [AdvancedTopic, AdvancedTopic, AdvancedTopic, AdvancedTopic, AdvancedTopic];
}

const ref = (title: string, url: string, kind: ReferenceItem['kind'] = 'docs', note?: string): ReferenceItem => ({
  title,
  url,
  kind,
  required: true,
  note,
});

function topicNarrative(topic: AdvancedTopic, week: AdvancedWeekSpec) {
  return `# ${topic.title}

## Operating mental model

${topic.mentalModel}

This is not vocabulary work. You should be able to derive the system behavior from first principles, estimate its limits before deployment, and identify the measurement that would prove your estimate wrong.

## Deep systems study

${topic.concepts.map((concept) => `- ${concept}`).join('\n')}

For each item, write down the resource being consumed, the queue or synchronization point involved, and the scaling limit. If you cannot name all three, your model of the system is incomplete.

## Failure analysis

${topic.failureModes.map((failure) => `- ${failure}`).join('\n')}

Do not stop at naming a failure. Describe the symptom, the telemetry that distinguishes it from adjacent failures, the immediate mitigation, and the long-term control.

## Practical drill

${topic.drill}

## Completion evidence

${topic.evidence}

## Principal-engineer standard

Connect today's work to **${week.theme}**. Your recommendation must include assumptions, a measurable target, a rejected alternative, and the condition that would make you revisit the decision.
`;
}

function buildAdvancedWeek(spec: AdvancedWeekSpec): LearningWeek {
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const modules: LearningModule[] = spec.topics.map((topic, index) => {
    const slug = `day-${index + 1}`;
    return {
      id: `${spec.slug}-${slug}`,
      slug,
      kind: 'day',
      title: `${dayLabels[index]} - ${topic.title}`,
      durationLabel: '2 hours',
      schedule: [
        '0:00-0:20 derive the system model and write initial estimates',
        '0:20-0:55 study the primary source and annotate the critical path',
        '0:55-1:30 complete the practical drill or profiler analysis',
        '1:30-1:50 write the failure analysis and decision record',
        '1:50-2:00 answer the checkpoint and define the next experiment',
      ],
      summary: topic.mentalModel,
      narrative: topicNarrative(topic, spec),
      outcomes: [
        `Explain ${topic.title.toLowerCase()} from first principles.`,
        'Quantify the dominant resource, bottleneck, or scaling limit.',
        'Design an experiment that validates the proposed optimization.',
        'Distinguish likely failure modes using concrete telemetry.',
      ],
      tasks: [
        { id: `${spec.slug}-d${index + 1}-model`, label: 'Write the first-principles system model and assumptions.', type: 'notes', required: true },
        { id: `${spec.slug}-d${index + 1}-source`, label: 'Study and annotate the required primary source.', type: 'reading', required: true },
        { id: `${spec.slug}-d${index + 1}-drill`, label: 'Complete the practical drill and record measurements.', type: 'coding', required: true },
        { id: `${spec.slug}-d${index + 1}-decision`, label: 'Write a short decision record with a rejected alternative.', type: 'writing', required: true },
      ],
      quiz: [{
        id: `${spec.slug}-d${index + 1}-q1`,
        prompt: topic.question,
        options: [topic.answer, ...topic.distractors],
        answer: topic.answer,
        explanation: `The correct answer follows from the operating model: ${topic.mentalModel}`,
      }],
      reflectionPrompts: [
        'Which assumption dominates your conclusion, and how would you test it?',
        'What optimization would look good in a microbenchmark but fail at system level?',
      ],
      deliverables: ['System model', 'Measured drill result', 'Failure analysis', 'Decision record'],
      references: topic.references,
    };
  });

  modules.push(
    {
      id: `${spec.slug}-saturday`,
      slug: 'saturday',
      kind: 'weekend',
      title: `Saturday - Systems Build: ${spec.title}`,
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1: establish baseline, workload, and measurement method',
        'Block 2: implement the critical path and one optimization',
        'Block 3: profile, load test, and exercise failure paths',
        'Block 4: compare alternatives and document the result',
      ],
      summary: spec.build,
      narrative: `# Systems build

${spec.build}

## Required method

1. Define the workload and success metric before changing the system.
2. Capture a baseline with reproducible commands and environment details.
3. Change one important variable at a time.
4. Report p50, p95, p99, throughput, utilization, and cost where applicable.
5. Include at least one negative result. Expert performance work records what did not help.
6. Exercise one overload or partial-failure scenario and document recovery.

## Review gate

The build is incomplete without a benchmark report, profiler evidence, operational limits, and a recommendation tied to measured data.
`,
      outcomes: ['Produce a reproducible benchmark.', 'Implement and validate one meaningful optimization.', 'Exercise overload or failure behavior.', 'Write an operator-grade report.'],
      tasks: [
        { id: `${spec.slug}-sat-baseline`, label: 'Capture the reproducible baseline and workload definition.', type: 'project', required: true },
        { id: `${spec.slug}-sat-optimize`, label: 'Implement and measure one critical-path optimization.', type: 'coding', required: true },
        { id: `${spec.slug}-sat-failure`, label: 'Exercise overload or partial failure and record recovery.', type: 'coding', required: true },
      ],
      reflectionPrompts: ['What did the profiler or benchmark disprove?', 'Where is the next bottleneck after your optimization?'],
      deliverables: ['Working system slice', 'Benchmark report', 'Profiler evidence', 'Failure test'],
      references: spec.topics.flatMap((topic) => topic.references).slice(0, 5),
    },
    {
      id: `${spec.slug}-sunday`,
      slug: 'sunday',
      kind: 'assessment',
      title: `Sunday - Architecture Review: ${spec.title}`,
      durationLabel: '6-8 hours',
      schedule: [
        'Block 1: inspect results and challenge assumptions',
        'Block 2: write the architecture and performance review',
        'Block 3: produce runbook, capacity model, and next experiments',
      ],
      summary: spec.review,
      narrative: `# Architecture and performance review

${spec.review}

## Required review sections

- workload, SLO, and constraints
- architecture and critical path
- resource and capacity model
- benchmark methodology and results
- failure modes and operational controls
- security and multi-tenancy considerations
- rejected alternatives and tradeoffs
- next experiment with expected result

Your review should be strong enough for another senior engineer to challenge, reproduce, and operate the system.
`,
      outcomes: ['Defend the architecture with evidence.', 'Translate benchmark results into capacity and cost.', 'Leave a usable runbook and next experiment.'],
      tasks: [
        { id: `${spec.slug}-sun-review`, label: 'Write and self-review the architecture document.', type: 'writing', required: true },
        { id: `${spec.slug}-sun-capacity`, label: 'Produce the capacity and cost model.', type: 'writing', required: true },
        { id: `${spec.slug}-sun-runbook`, label: 'Write the operational runbook and next experiment.', type: 'writing', required: true },
      ],
      reflectionPrompts: ['Could you defend this design in a principal-level review?', 'Which claim is least supported by evidence?'],
      deliverables: ['Architecture review', 'Capacity model', 'Runbook', 'Next-experiment plan'],
      references: spec.topics.flatMap((topic) => topic.references).slice(0, 5),
    },
  );

  return {
    id: spec.id,
    slug: spec.slug,
    title: `Week ${spec.number} - ${spec.title}`,
    theme: spec.theme,
    summary: spec.summary,
    commitment: '2 hours on weekdays, 6-8 hours each weekend day',
    outputs: spec.outputs,
    modules,
  };
}

const advancedWeeks: AdvancedWeekSpec[] = [
  {
    id: 'mlops-week-6', slug: 'week-6', number: 6, title: 'Distributed Systems for ML',
    theme: 'Make state, delivery semantics, coordination, and backpressure explicit.',
    summary: 'Apply distributed-systems rigor to feature pipelines, training metadata, event-driven inference, and recovery.',
    build: 'Build an event-driven inference pipeline with deterministic IDs, bounded queues, retries, a dead-letter path, and replay-safe writes.',
    review: 'Defend the consistency model and delivery semantics. Explain exactly what happens during duplicate delivery, partition loss, and consumer lag.',
    outputs: ['Replay-safe event pipeline', 'Backpressure benchmark', 'Consistency decision record', 'Failure-recovery runbook'],
    topics: [
      {
        title: 'State, Consistency, and ML Correctness',
        mentalModel: 'An ML platform is a distributed state machine whose correctness depends on which version of data, features, code, and model each decision observed.',
        concepts: ['Map strong, eventual, read-your-writes, and monotonic-read consistency to ML workflows.', 'Separate control-plane metadata from high-volume data-plane payloads.', 'Model lineage as immutable identifiers and explicit state transitions.'],
        failureModes: ['A serving node observes a new model before its required feature schema.', 'A training job reads a partially published dataset snapshot.', 'A rollback changes the model but leaves incompatible cached features.'],
        drill: 'Draw the state transitions for model promotion and rollback. Assign a consistency requirement to every read and write, then identify where eventual consistency is acceptable.',
        evidence: 'A state-transition diagram and a table of consistency decisions with failure consequences.',
        question: 'Which state requires the strongest consistency during model promotion?', answer: 'The compatibility decision linking model, feature schema, and serving configuration',
        distractors: ['Raw request logs written for offline analytics', 'The dashboard refresh interval'],
        references: [ref('Designing Data-Intensive Applications', 'https://dataintensive.net/', 'book'), ref('ML Metadata', 'https://www.tensorflow.org/tfx/guide/mlmd')],
      },
      {
        title: 'Delivery Semantics and Idempotent Effects',
        mentalModel: 'Exactly-once processing is usually implemented as at-least-once delivery plus idempotent, transactional effects.',
        concepts: ['Distinguish delivery from processing and side-effect semantics.', 'Use deterministic event IDs, deduplication windows, and transactional outbox patterns.', 'Reason about replay, poison messages, and dead-letter queues.'],
        failureModes: ['A retried prediction event charges a customer twice.', 'A dedupe store expires before a delayed duplicate arrives.', 'A poison message blocks an entire partition.'],
        drill: 'Design an idempotency key and state table for an asynchronous batch-inference request. Define retention and replay behavior.',
        evidence: 'A sequence diagram covering success, retry, duplicate, and poison-message paths.',
        question: 'What is the practical route to exactly-once effects?', answer: 'At-least-once delivery combined with idempotent or transactional side effects',
        distractors: ['Disable all consumer retries', 'Use a larger message broker'],
        references: [ref('Kafka Design: Delivery Semantics', 'https://kafka.apache.org/documentation/#semantics'), ref('Transactional Outbox', 'https://microservices.io/patterns/data/transactional-outbox.html', 'blog')],
      },
      {
        title: 'Partitioning, Ordering, and Backpressure',
        mentalModel: 'Partition keys define your parallelism ceiling, ordering guarantees, skew behavior, and blast radius.',
        concepts: ['Derive throughput from partition count, service time, and consumer concurrency.', 'Measure hot-key skew and distinguish queueing delay from compute time.', 'Use bounded queues, admission control, and load shedding to protect latency.'],
        failureModes: ['One tenant becomes a hot partition while fleet utilization looks low.', 'Unbounded queues convert overload into hours of stale predictions.', 'Increasing consumers does nothing because partition count is the bottleneck.'],
        drill: 'Create a capacity model for 20k events/s with skewed tenants. Choose a partition key and calculate required headroom.',
        evidence: 'Partition strategy, queue budget, overload policy, and a lag-based alert.',
        question: 'Why can adding consumers fail to increase throughput?', answer: 'Consumers cannot exceed the useful parallelism provided by partitions and keys',
        distractors: ['Consumers always need more memory first', 'Message brokers serialize every topic globally'],
        references: [ref('Kafka Consumer Design', 'https://kafka.apache.org/documentation/#consumerapi'), ref('The Tail at Scale', 'https://research.google/pubs/the-tail-at-scale/', 'paper')],
      },
      {
        title: 'Coordination, Leases, and Distributed Jobs',
        mentalModel: 'Distributed training and orchestration need explicit ownership, fencing, and failure detection; a lock without a fencing token is not enough.',
        concepts: ['Compare leases, leader election, heartbeats, and fencing tokens.', 'Understand split brain and stale-worker writes.', 'Design job state transitions that survive coordinator failure.'],
        failureModes: ['A paused worker resumes after lease expiry and overwrites a newer checkpoint.', 'Network partition creates two active coordinators.', 'Heartbeat timeout kills a slow but healthy worker.'],
        drill: 'Specify a lease and fencing protocol for a distributed checkpoint writer. Include timeout selection and stale-writer rejection.',
        evidence: 'Protocol steps, invariants, timeout rationale, and split-brain test.',
        question: 'What prevents a stale lock holder from writing after lease expiry?', answer: 'A monotonically increasing fencing token checked by the storage system',
        distractors: ['A longer heartbeat interval', 'A process-local mutex'],
        references: [ref('Martin Kleppmann: How to do distributed locking', 'https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html', 'blog'), ref('etcd concurrency API', 'https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/')],
      },
      {
        title: 'Failure Injection and Recovery Design',
        mentalModel: 'Recovery is a designed code path that must be tested under the same concurrency and data conditions as normal execution.',
        concepts: ['Define recovery point objective and recovery time objective for ML jobs.', 'Design replay, checkpoint, and partial-result cleanup strategies.', 'Use fault injection to validate invariants, not merely availability.'],
        failureModes: ['Recovery replays data against a different model version.', 'Checkpoint restore succeeds but optimizer state is inconsistent.', 'A partial output is mistaken for a complete artifact.'],
        drill: 'Write a fault-injection plan for broker outage, worker crash, stale checkpoint, and metadata-store unavailability.',
        evidence: 'A failure matrix with detection, automated response, manual response, and correctness invariant.',
        question: 'What is the first goal of a recovery test?', answer: 'Prove that correctness invariants still hold after interruption and replay',
        distractors: ['Maximize CPU utilization during recovery', 'Avoid recording partial failures'],
        references: [ref('Principles of Chaos Engineering', 'https://principlesofchaos.org/'), ref('Google SRE Workbook', 'https://sre.google/workbook/table-of-contents/', 'book')],
      },
    ],
  },
  {
    id: 'mlops-week-7', slug: 'week-7', number: 7, title: 'Kubernetes and GPU Fleet Operations',
    theme: 'Operate accelerators as a topology-sensitive, expensive, shared fleet.',
    summary: 'Go beyond manifests into scheduling, device plugins, autoscaling, data locality, security, and GPU-fleet economics.',
    build: 'Deploy a topology-aware inference workload with resource requests, readiness gates, queue-based autoscaling, disruption controls, and a cost dashboard.',
    review: 'Explain how the platform behaves during node loss, image pull delay, GPU fragmentation, noisy-neighbor load, and a traffic spike.',
    outputs: ['GPU-aware deployment spec', 'Autoscaling policy', 'Node-loss game day', 'Fleet cost model'],
    topics: [
      {
        title: 'Kubernetes Resource and Scheduling Model',
        mentalModel: 'The scheduler places pods from declared constraints; it does not understand your application critical path unless you encode it.',
        concepts: ['Requests drive placement; limits drive enforcement; accelerators are extended resources.', 'Readiness, startup, and liveness probes express different failure contracts.', 'Priority, preemption, disruption budgets, affinity, and topology spread shape availability.'],
        failureModes: ['Liveness probes restart a model during long cold start.', 'Missing requests overcommit CPU and destroy tail latency.', 'A disruption drains all replicas in one zone.'],
        drill: 'Review an inference Deployment and identify every unstated assumption the scheduler cannot infer.',
        evidence: 'Corrected manifest and a placement/failure explanation.',
        question: 'Which value primarily informs Kubernetes scheduling?', answer: 'Resource requests',
        distractors: ['Resource limits only', 'Observed average utilization from last week'],
        references: [ref('Kubernetes Scheduling', 'https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/'), ref('Kubernetes Resource Management', 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/')],
      },
      {
        title: 'GPU Scheduling, Topology, and Fragmentation',
        mentalModel: 'A GPU is not a scalar resource: model fit, interconnect topology, NUMA locality, MIG layout, and peer bandwidth determine useful placement.',
        concepts: ['Understand device plugins, GPU Operator, MIG, time slicing, and exclusive allocation.', 'Compare PCIe, NVLink, NVSwitch, and cross-node fabric implications.', 'Measure fragmentation: free capacity that cannot satisfy real requests.'],
        failureModes: ['A multi-GPU job spans weak links and loses scaling efficiency.', 'Small jobs strand memory across full GPUs.', 'CPU and NIC locality bottleneck a nominally GPU-bound workload.'],
        drill: 'Design placement rules for latency inference, batch inference, and eight-GPU training on a mixed fleet.',
        evidence: 'Topology diagram, scheduling rules, and fragmentation metric.',
        question: 'Why is aggregate free GPU count insufficient for scheduling?', answer: 'Useful placement depends on memory fit, topology, locality, and allocation shape',
        distractors: ['GPU clocks are always identical', 'Kubernetes cannot schedule accelerators'],
        references: [ref('NVIDIA GPU Operator', 'https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/'), ref('Kubernetes Device Plugins', 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/')],
      },
      {
        title: 'Queue-Based Autoscaling and Cold Starts',
        mentalModel: 'Autoscaling reacts to delayed signals; queue depth and work age often predict user pain better than average utilization.',
        concepts: ['Apply Little’s Law to queue depth, throughput, and latency.', 'Separate pod scaling, node scaling, and model-loading time constants.', 'Use warm pools, prefetch, and admission control to manage cold start.'],
        failureModes: ['HPA scales on CPU while requests wait for GPU service.', 'Node provisioning takes longer than the SLO budget.', 'Scale-down evicts hot model replicas and creates a cold-start loop.'],
        drill: 'Calculate replicas required for an arrival-rate spike given service time, batch size, cold-start time, and latency SLO.',
        evidence: 'Autoscaling equation, thresholds, and overload behavior.',
        question: 'Which signal best captures an overloaded asynchronous inference service?', answer: 'Queue age combined with queue depth and measured service rate',
        distractors: ['Average CPU alone', 'Number of Kubernetes namespaces'],
        references: [ref('KEDA Concepts', 'https://keda.sh/docs/latest/concepts/'), ref('Queueing Theory and Little’s Law', 'https://sre.google/sre-book/handling-overload/', 'book')],
      },
      {
        title: 'Model Storage, Images, and Data Locality',
        mentalModel: 'Cold-start latency is a data-movement problem across registry, network, disk, CPU decompression, and accelerator memory.',
        concepts: ['Decompose image pull, artifact fetch, deserialization, compilation, and GPU transfer.', 'Compare baked images, object-store loading, node caches, and peer-to-peer distribution.', 'Design immutable artifacts with provenance and verification.'],
        failureModes: ['A 40GB artifact stampedes object storage during scale-up.', 'Mutable tags deploy different weights across replicas.', 'Slow decompression dominates model startup while GPU sits idle.'],
        drill: 'Build a cold-start budget and choose a model-distribution strategy for a 70B model.',
        evidence: 'Critical-path timeline, cache strategy, and integrity checks.',
        question: 'What should a cold-start investigation measure first?', answer: 'A stage-by-stage timeline from image and artifact fetch through first successful inference',
        distractors: ['Only total pod startup time', 'Only GPU utilization after startup'],
        references: [ref('OCI Image Spec', 'https://github.com/opencontainers/image-spec'), ref('KServe Model Storage', 'https://kserve.github.io/website/latest/modelserving/storage/storagecontainers/')],
      },
      {
        title: 'Multi-Tenancy, Security, and Fleet Economics',
        mentalModel: 'A shared GPU platform must isolate data and resources while exposing enough controls to achieve utilization and cost targets.',
        concepts: ['Use namespaces, quotas, policy, workload identity, and network boundaries.', 'Attribute accelerator-seconds, idle memory, and queue delay to tenants.', 'Define fair sharing and priority without allowing starvation.'],
        failureModes: ['One tenant reserves GPUs indefinitely with low utilization.', 'A compromised workload reaches model artifacts from another tenant.', 'Aggressive packing causes noisy-neighbor latency regressions.'],
        drill: 'Write a tenancy and chargeback policy for research, batch, and production inference workloads.',
        evidence: 'Isolation model, quota policy, utilization target, and escalation path.',
        question: 'What makes a GPU chargeback model useful?', answer: 'It attributes reserved and consumed accelerator capacity while preserving service-level context',
        distractors: ['It charges every team the same amount', 'It ignores idle reservation time'],
        references: [ref('Kubernetes Multi-tenancy', 'https://kubernetes.io/docs/concepts/security/multi-tenancy/'), ref('NVIDIA DCGM Exporter', 'https://github.com/NVIDIA/dcgm-exporter')],
      },
    ],
  },
  {
    id: 'mlops-week-8', slug: 'week-8', number: 8, title: 'Distributed Training Performance',
    theme: 'Use measurement and communication math to scale training efficiently.',
    summary: 'Understand roofline limits, DDP, collectives, mixed precision, sharding, checkpointing, and failure recovery.',
    build: 'Profile a training loop, establish a single-device baseline, then model and test data-parallel scaling with communication and checkpoint overhead.',
    review: 'Explain achieved throughput, scaling efficiency, memory use, communication fraction, and the next optimization in priority order.',
    outputs: ['Training profiler trace', 'Scaling-efficiency report', 'Memory model', 'Checkpoint-recovery test'],
    topics: [
      {
        title: 'Roofline Model and Training Critical Path',
        mentalModel: 'Performance is bounded by compute throughput or memory bandwidth; optimization starts by identifying which roof you are hitting.',
        concepts: ['Calculate arithmetic intensity and compare achieved versus peak throughput.', 'Separate input pipeline, host-to-device, forward, backward, optimizer, and synchronization time.', 'Use warmup and synchronized timing to avoid false measurements.'],
        failureModes: ['A faster kernel exposes a starving input pipeline.', 'Unsynchronized CUDA timing reports impossible speedups.', 'Peak FLOPS assumptions ignore low occupancy and memory stalls.'],
        drill: 'Create a critical-path timing model for one training step and classify each stage as compute, memory, communication, or I/O bound.',
        evidence: 'A timing table and roofline-based optimization hypothesis.',
        question: 'What determines whether an operation is memory-bandwidth bound?', answer: 'Its arithmetic intensity relative to the hardware roofline',
        distractors: ['The number of Python functions', 'The model accuracy'],
        references: [ref('Roofline Model', 'https://crd.lbl.gov/assets/pubs_presos/roofline.pdf', 'paper'), ref('PyTorch Profiler', 'https://pytorch.org/tutorials/recipes/recipes/profiler_recipe.html')],
      },
      {
        title: 'DDP, AllReduce, and Communication Overlap',
        mentalModel: 'Data parallel training scales only when useful compute overlaps enough gradient communication to amortize synchronization.',
        concepts: ['Derive ring AllReduce bandwidth cost and latency sensitivity.', 'Understand gradient buckets, overlap, stragglers, and effective batch size.', 'Measure scaling efficiency rather than reporting raw speedup.'],
        failureModes: ['Small buckets create latency-dominated collectives.', 'One slow rank stalls every rank at synchronization.', 'Global batch growth silently changes convergence.'],
        drill: 'Estimate AllReduce time and scaling efficiency for 1, 2, 4, and 8 GPUs under two interconnects.',
        evidence: 'Communication model and a bucket-size experiment plan.',
        question: 'Why does one slow rank reduce DDP throughput?', answer: 'Synchronous collective operations wait for every participating rank',
        distractors: ['Each rank trains a different model', 'DDP always runs on one CPU thread'],
        references: [ref('PyTorch Distributed Overview', 'https://pytorch.org/tutorials/beginner/dist_overview.html'), ref('NCCL User Guide', 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/')],
      },
      {
        title: 'Mixed Precision and Numerical Stability',
        mentalModel: 'Lower precision trades representation range and accuracy for bandwidth, memory, and tensor-core throughput.',
        concepts: ['Compare FP32, TF32, FP16, BF16, and FP8 range and precision.', 'Understand loss scaling, accumulation precision, and numerically sensitive operations.', 'Validate optimization with convergence and quality metrics, not throughput alone.'],
        failureModes: ['FP16 gradients underflow without scaling.', 'A reduction in low precision accumulates unacceptable error.', 'Higher throughput masks degraded convergence.'],
        drill: 'Choose precision policies for activations, weights, gradients, reductions, and optimizer state, with rationale.',
        evidence: 'Precision map, expected speedup, and quality guardrails.',
        question: 'Why is BF16 often easier to train with than FP16?', answer: 'BF16 preserves FP32-like exponent range, reducing overflow and underflow risk',
        distractors: ['BF16 always uses less memory than FP16', 'BF16 has more mantissa precision than FP32'],
        references: [ref('PyTorch AMP', 'https://pytorch.org/docs/stable/amp.html'), ref('NVIDIA Mixed Precision Training', 'https://docs.nvidia.com/deeplearning/performance/mixed-precision-training/')],
      },
      {
        title: 'FSDP, ZeRO, and Memory Sharding',
        mentalModel: 'Sharding reduces per-device state at the cost of communication, complexity, and stricter lifecycle management.',
        concepts: ['Account for parameters, gradients, optimizer states, activations, and temporary buffers.', 'Compare ZeRO stages and FSDP all-gather/reduce-scatter behavior.', 'Choose wrapping and checkpoint formats based on model and network.'],
        failureModes: ['Fine-grained wrapping creates excessive collectives.', 'Peak temporary memory still causes OOM despite average fit.', 'Checkpoint format cannot restore under a different world size.'],
        drill: 'Build a per-GPU memory budget for a model under DDP, ZeRO-2, and full sharding.',
        evidence: 'Memory equation, communication tradeoff, and chosen strategy.',
        question: 'What does full parameter sharding primarily buy?', answer: 'Lower per-device model-state memory at the cost of additional communication',
        distractors: ['Elimination of all checkpoint storage', 'Guaranteed linear scaling'],
        references: [ref('PyTorch FSDP', 'https://pytorch.org/docs/stable/fsdp.html'), ref('DeepSpeed ZeRO', 'https://www.deepspeed.ai/tutorials/zero/')],
      },
      {
        title: 'Checkpointing, Preemption, and Training Recovery',
        mentalModel: 'Checkpoint cadence is an economic and reliability decision balancing write cost against expected lost work.',
        concepts: ['Capture model, optimizer, scheduler, RNG, sampler, and data position.', 'Use asynchronous and sharded checkpoints carefully.', 'Model optimal cadence from failure rate and checkpoint duration.'],
        failureModes: ['Restored model weights diverge because RNG or sampler state was omitted.', 'All ranks write the same checkpoint and overload storage.', 'Checkpoint pause dominates step time.'],
        drill: 'Calculate checkpoint cadence for a preemptible fleet and design a restore validation test.',
        evidence: 'Recovery objective, state inventory, cadence equation, and restore test.',
        question: 'Which omitted state commonly breaks exact training resume?', answer: 'Optimizer, RNG, scheduler, sampler, or data-position state',
        distractors: ['The README title', 'The HTTP server port'],
        references: [ref('PyTorch Distributed Checkpoint', 'https://pytorch.org/docs/stable/distributed.checkpoint.html'), ref('TorchTitan', 'https://github.com/pytorch/torchtitan')],
      },
    ],
  },
  {
    id: 'mlops-week-9', slug: 'week-9', number: 9, title: 'LLM Inference Systems',
    theme: 'Optimize tokens per second and time to useful output under memory and latency constraints.',
    summary: 'Model prefill/decode behavior, KV-cache capacity, continuous batching, scheduling, speculative decoding, and serving economics.',
    build: 'Create an inference capacity simulator and benchmark harness that reports TTFT, inter-token latency, throughput, queueing, memory occupancy, and cost per million tokens.',
    review: 'Recommend a serving configuration for interactive and batch workloads, including overload and admission-control behavior.',
    outputs: ['Inference capacity model', 'Scheduler benchmark', 'KV-cache analysis', 'Cost-performance recommendation'],
    topics: [
      {
        title: 'Prefill, Decode, and Latency Decomposition',
        mentalModel: 'Prefill is parallel and often compute-heavy; decode is sequential and often memory-bandwidth bound. They need different scheduling decisions.',
        concepts: ['Separate queue time, tokenization, prefill, decode, sampling, and streaming overhead.', 'Use TTFT, time per output token, and end-to-end latency correctly.', 'Understand why prompt and output lengths change capacity differently.'],
        failureModes: ['Long prompts block short interactive requests.', 'Average latency hides poor inter-token latency.', 'Tokenization becomes a CPU bottleneck at scale.'],
        drill: 'Build a latency budget for three workload shapes and identify the dominant stage for each.',
        evidence: 'Latency decomposition and workload-specific SLOs.',
        question: 'Why should prefill and decode be measured separately?', answer: 'They have different parallelism, bottlenecks, and effects on user-perceived latency',
        distractors: ['They use different HTTP methods', 'Decode does not use the model'],
        references: [ref('NVIDIA LLM Inference Performance', 'https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/'), ref('vLLM Paper', 'https://arxiv.org/abs/2309.06180', 'paper')],
      },
      {
        title: 'KV Cache Memory and PagedAttention',
        mentalModel: 'KV cache is a dynamic memory-allocation problem whose size grows with active sequence length and often determines concurrency.',
        concepts: ['Derive KV bytes from layers, heads, head dimension, sequence length, precision, and concurrency.', 'Understand fragmentation and block-based allocation.', 'Compare multi-head, multi-query, and grouped-query attention cache costs.'],
        failureModes: ['Memory fragmentation rejects requests despite apparent free memory.', 'Unbounded context lengths collapse concurrency.', 'Cache eviction destroys latency for long-lived sessions.'],
        drill: 'Calculate maximum concurrent sequences for two model configurations and two context-length distributions.',
        evidence: 'KV-cache equation, fragmentation allowance, and admission limit.',
        question: 'What usually happens to serving concurrency as context length grows?', answer: 'Concurrency falls because each active sequence consumes more KV-cache memory',
        distractors: ['Concurrency rises because prompts contain more work', 'Concurrency is independent of memory'],
        references: [ref('vLLM PagedAttention', 'https://arxiv.org/abs/2309.06180', 'paper'), ref('FlashInfer', 'https://docs.flashinfer.ai/')],
      },
      {
        title: 'Continuous Batching and Request Scheduling',
        mentalModel: 'The scheduler converts variable-length requests into GPU work while trading utilization against fairness and latency.',
        concepts: ['Compare static, dynamic, and continuous batching.', 'Reason about head-of-line blocking, chunked prefill, priorities, and fairness.', 'Use queue age and token budgets for admission control.'],
        failureModes: ['Large prefills starve decode and cause visible output stalls.', 'Throughput optimization violates premium-tier latency SLOs.', 'Unbounded batching causes memory exhaustion.'],
        drill: 'Design a scheduler policy for mixed interactive and offline requests with explicit token and latency budgets.',
        evidence: 'Scheduling algorithm, fairness policy, and overload response.',
        question: 'Why can maximum batch size reduce user experience?', answer: 'Waiting to form or execute large batches can increase queueing and head-of-line blocking',
        distractors: ['Larger batches always reduce GPU utilization', 'Batching disables KV cache'],
        references: [ref('vLLM Scheduler', 'https://docs.vllm.ai/en/latest/'), ref('NVIDIA Triton Dynamic Batcher', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html')],
      },
      {
        title: 'Speculative Decoding and Parallel Decoding',
        mentalModel: 'Speculative decoding trades extra draft-model compute for fewer expensive target-model serial decode steps.',
        concepts: ['Model acceptance rate, draft cost, verification cost, and speedup ceiling.', 'Understand when speculation loses due to poor acceptance or resource contention.', 'Compare draft models, n-gram speculation, and multi-token prediction.'],
        failureModes: ['Draft model steals memory needed for target concurrency.', 'Low acceptance adds work without reducing target steps.', 'Benchmark ignores changed output distribution or quality.'],
        drill: 'Build a break-even calculation for speculative decoding across three acceptance rates.',
        evidence: 'Speedup model, break-even point, and benchmark design.',
        question: 'What most directly determines speculative decoding benefit?', answer: 'Accepted draft tokens relative to draft and verification overhead',
        distractors: ['Prompt font size', 'Number of API endpoints'],
        references: [ref('Speculative Decoding', 'https://arxiv.org/abs/2211.17192', 'paper'), ref('Medusa', 'https://arxiv.org/abs/2401.10774', 'paper')],
      },
      {
        title: 'Inference Benchmarking and Token Economics',
        mentalModel: 'A valid serving benchmark preserves workload distribution and reports quality, latency, throughput, utilization, and cost together.',
        concepts: ['Use open-loop and closed-loop load tests correctly.', 'Report TTFT, TPOT, tokens/s, goodput, saturation, and cost per useful token.', 'Separate benchmark wins from production wins using workload traces.'],
        failureModes: ['Closed-loop testing hides overload because clients slow down.', 'Synthetic fixed-length requests overstate batching efficiency.', 'Tokens/s improves while SLO-compliant goodput falls.'],
        drill: 'Write a benchmark plan with workload distributions, warmup, saturation sweep, and regression gates.',
        evidence: 'Benchmark specification and a cost-per-million-token model.',
        question: 'Why is goodput often more useful than raw throughput?', answer: 'Goodput counts work completed within required quality and latency constraints',
        distractors: ['Goodput ignores SLOs', 'Goodput is the GPU clock frequency'],
        references: [ref('MLPerf Inference', 'https://mlcommons.org/benchmarks/inference/'), ref('GenAI-Perf', 'https://github.com/triton-inference-server/perf_analyzer/tree/main/genai-perf')],
      },
    ],
  },
  {
    id: 'mlops-week-10', slug: 'week-10', number: 10, title: 'Principal-Level ML Platform Architecture',
    theme: 'Turn technical depth into durable interfaces, SLOs, roadmaps, and organizational leverage.',
    summary: 'Design platform boundaries and governance using evidence, explicit contracts, and adoption economics.',
    build: 'Produce a platform RFC and thin vertical slice for model onboarding, deployment, observability, and ownership.',
    review: 'Run a simulated architecture review that challenges requirements, failure modes, cost, security, and migration strategy.',
    outputs: ['Platform RFC', 'Golden-path API', 'Maturity scorecard', 'Roadmap and migration plan'],
    topics: [
      {
        title: 'Platform Boundaries and Golden Paths', mentalModel: 'A platform is a product that reduces repeated cognitive load through stable contracts and paved paths, not a pile of shared infrastructure.',
        concepts: ['Identify users, jobs-to-be-done, interfaces, and escape hatches.', 'Separate control plane, data plane, and developer experience.', 'Design the thinnest useful vertical slice.'],
        failureModes: ['The platform centralizes all decisions and blocks teams.', 'Escape hatches become the default path.', 'The control plane owns workload data it cannot safely govern.'],
        drill: 'Define a golden path from repository to monitored deployment and list every contract.',
        evidence: 'User journey, API boundaries, ownership map, and non-goals.',
        question: 'What is the clearest sign of a useful internal platform?', answer: 'Teams can complete common safe workflows with less cognitive and operational load',
        distractors: ['It has the most services', 'It prevents all customization'],
        references: [ref('Team Topologies', 'https://teamtopologies.com/', 'book'), ref('CNCF Platforms Whitepaper', 'https://tag-app-delivery.cncf.io/whitepapers/platforms/')],
      },
      {
        title: 'SLOs, Error Budgets, and Model Quality', mentalModel: 'ML SLOs must join service reliability with delayed or uncertain quality signals.',
        concepts: ['Define availability, latency, freshness, and quality indicators.', 'Use error budgets to control release velocity and risk.', 'Handle delayed labels and proxy metrics.'],
        failureModes: ['A service meets uptime SLO while model quality collapses.', 'A proxy metric is optimized until it no longer correlates with business value.', 'Error budgets ignore high-impact low-volume cohorts.'],
        drill: 'Define an SLO stack for one ML service, including quality and cohort safeguards.',
        evidence: 'SLIs, objectives, windows, burn alerts, and release policy.',
        question: 'Why is uptime alone insufficient for an ML service?', answer: 'The service can respond successfully while predictions are stale, biased, or wrong',
        distractors: ['ML services do not use HTTP', 'Models never fail silently'],
        references: [ref('Google SRE Book', 'https://sre.google/sre-book/table-of-contents/', 'book'), ref('ML Test Score', 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/', 'paper')],
      },
      {
        title: 'Build, Buy, and Adoption Economics', mentalModel: 'The correct platform decision minimizes total organizational cost under strategic constraints, not licensing cost alone.',
        concepts: ['Model total cost of ownership, switching cost, and operational expertise.', 'Distinguish commodity capability from strategic differentiation.', 'Use reversible decisions and staged adoption.'],
        failureModes: ['A custom platform consumes the entire team roadmap.', 'Vendor lock-in blocks critical performance tuning.', 'A tool is purchased without migration or ownership capacity.'],
        drill: 'Write a build-versus-buy matrix for experiment tracking, orchestration, and model serving.',
        evidence: 'Decision matrix with costs, risks, trigger points, and exit plan.',
        question: 'What should dominate a build-versus-buy decision?', answer: 'Strategic differentiation, total ownership cost, constraints, and reversibility',
        distractors: ['Which option has the longest feature list', 'Which option was released most recently'],
        references: [ref('AWS Builders Library', 'https://aws.amazon.com/builders-library/'), ref('Thoughtworks Technology Radar', 'https://www.thoughtworks.com/radar')],
      },
      {
        title: 'Governance, Lineage, and Multi-Tenant Controls', mentalModel: 'Governance should make provenance, ownership, risk, and policy executable without turning the platform into a ticket queue.',
        concepts: ['Define model cards, lineage, approvals, retention, and audit trails.', 'Automate policy checks at artifact and deployment boundaries.', 'Use risk tiers to avoid one-size-fits-all process.'],
        failureModes: ['No owner exists when a model causes harm.', 'Approval captures paperwork but not reproducibility.', 'Sensitive training data leaks through artifacts or logs.'],
        drill: 'Design a risk-tiered promotion policy with automated evidence collection.',
        evidence: 'Policy-as-code outline, ownership model, and audit event schema.',
        question: 'What makes governance scalable?', answer: 'Automated evidence and controls proportional to workload risk',
        distractors: ['Manual approval for every experiment', 'Keeping lineage only in team memory'],
        references: [ref('NIST AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework'), ref('OpenLineage', 'https://openlineage.io/docs/')],
      },
      {
        title: 'Architecture Reviews and Roadmaps', mentalModel: 'A principal engineer converts uncertainty into explicit decisions, staged experiments, and a roadmap tied to measurable outcomes.',
        concepts: ['Write requirements, constraints, alternatives, risks, and migration stages.', 'Use architecture fitness functions and maturity scorecards.', 'Separate irreversible foundations from replaceable tools.'],
        failureModes: ['A roadmap lists projects without outcomes.', 'Architecture diagrams omit operations and failure paths.', 'A migration has no rollback or adoption strategy.'],
        drill: 'Write a one-page architecture review and a 90-day roadmap with measurable exit criteria.',
        evidence: 'Review memo, scorecard, roadmap, and decision log.',
        question: 'What makes a platform roadmap credible?', answer: 'Each stage has measurable outcomes, owners, dependencies, and exit criteria',
        distractors: ['It names every possible future feature', 'It avoids stating risks'],
        references: [ref('Architecture Decision Records', 'https://adr.github.io/'), ref('Google Cloud Architecture Framework', 'https://cloud.google.com/architecture/framework')],
      },
    ],
  },
  {
    id: 'mlops-week-11', slug: 'week-11', number: 11, title: 'CUDA and Triton Kernel Engineering',
    theme: 'Reason from GPU execution and memory behavior before writing custom kernels.',
    summary: 'Develop the performance intuition needed to profile, optimize, fuse, and validate GPU kernels.',
    build: 'Implement and benchmark a Triton fused operation against a framework baseline, with profiler evidence and numerical validation.',
    review: 'Explain why the kernel is faster or slower using memory traffic, occupancy, launch count, and achieved throughput.',
    outputs: ['Triton fused kernel', 'Nsight or profiler report', 'Numerical correctness suite', 'Optimization decision record'],
    topics: [
      {
        title: 'GPU Execution Model', mentalModel: 'GPU throughput comes from exposing enough independent warps to hide latency while respecting SIMT execution constraints.',
        concepts: ['Map grids, blocks, warps, threads, and streaming multiprocessors.', 'Understand divergence, synchronization, and launch overhead.', 'Estimate parallel work and latency hiding.'],
        failureModes: ['Branch divergence serializes warp paths.', 'Tiny kernels spend more time launching than computing.', 'Insufficient parallelism leaves SMs idle.'],
        drill: 'Map a vector operation and matrix tile onto blocks, warps, and threads. Estimate active warps.',
        evidence: 'Execution mapping and predicted bottleneck.',
        question: 'What does warp divergence do?', answer: 'It serializes different branch paths taken by threads in the same warp',
        distractors: ['It increases memory capacity', 'It combines multiple kernels automatically'],
        references: [ref('CUDA C Programming Guide', 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/'), ref('CUDA Best Practices Guide', 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/')],
      },
      {
        title: 'Memory Hierarchy and Coalescing', mentalModel: 'Most useful kernel optimization reduces expensive memory traffic or makes access patterns easier for hardware to serve.',
        concepts: ['Reason about registers, shared memory, L1/L2, HBM, and transfer paths.', 'Design coalesced accesses and tiled reuse.', 'Count bytes moved per useful operation.'],
        failureModes: ['Uncoalesced access multiplies memory transactions.', 'Shared-memory bank conflicts serialize accesses.', 'Host-device copies erase kernel gains.'],
        drill: 'Compare naive and tiled matrix multiplication memory traffic and arithmetic intensity.',
        evidence: 'Byte-count model and access-pattern diagram.',
        question: 'Why does tiling improve matrix multiplication?', answer: 'It reuses data from faster on-chip memory and reduces repeated global-memory traffic',
        distractors: ['It removes all floating-point operations', 'It increases PCIe bandwidth'],
        references: [ref('CUDA Memory Optimization', 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/#memory-optimizations'), ref('Nsight Compute Profiling Guide', 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/')],
      },
      {
        title: 'Occupancy, Registers, and Tile Selection', mentalModel: 'Occupancy is a means to hide latency, not a goal; larger tiles can improve reuse while reducing active warps through register pressure.',
        concepts: ['Understand register allocation, shared-memory limits, and occupancy.', 'Explore tile size, num_warps, and pipeline stages.', 'Distinguish theoretical occupancy from achieved utilization.'],
        failureModes: ['Register spilling turns a compute kernel into a memory-bound kernel.', 'Maximum occupancy uses a poor tile and runs slower.', 'A tile performs well for one shape and badly for another.'],
        drill: 'Create a tile-size experiment matrix and predict register, occupancy, and reuse tradeoffs.',
        evidence: 'Experiment plan and profiler counters to inspect.',
        question: 'Why is maximum occupancy not always fastest?', answer: 'A lower-occupancy configuration may gain more from reuse, instruction efficiency, or fewer spills',
        distractors: ['Occupancy measures model accuracy', 'Maximum occupancy disables shared memory'],
        references: [ref('CUDA Occupancy Calculator', 'https://docs.nvidia.com/cuda/cuda-occupancy-calculator/'), ref('Triton Matrix Multiplication Tutorial', 'https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html')],
      },
      {
        title: 'Profiling and Performance Diagnosis', mentalModel: 'Profiler counters are evidence used to test a bottleneck hypothesis; collecting traces without a question is not performance engineering.',
        concepts: ['Use timeline traces before kernel counters.', 'Interpret achieved bandwidth, tensor-core utilization, stalls, occupancy, and launch gaps.', 'Apply controlled experiments and synchronize measurements.'],
        failureModes: ['Profiling overhead changes the workload materially.', 'A hot kernel is optimized even though it is not on the critical path.', 'Benchmark variance is mistaken for improvement.'],
        drill: 'Write a profiler decision tree from end-to-end symptom to kernel-level counter.',
        evidence: 'Hypothesis, selected counters, expected observation, and decision rule.',
        question: 'What should happen before opening kernel-level counters?', answer: 'Use an end-to-end timeline to confirm the kernel is on the critical path',
        distractors: ['Rewrite the kernel immediately', 'Increase batch size without measurement'],
        references: [ref('Nsight Systems User Guide', 'https://docs.nvidia.com/nsight-systems/UserGuide/'), ref('Nsight Compute Profiling Guide', 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/')],
      },
      {
        title: 'Triton Fusion and Kernel Validation', mentalModel: 'Fusion wins by removing launches and intermediate memory traffic, but it must preserve numerical behavior across shapes and dtypes.',
        concepts: ['Use Triton program instances, block pointers, masks, and autotuning.', 'Select fusion boundaries around memory traffic and reuse.', 'Validate tolerances, edge shapes, and performance distributions.'],
        failureModes: ['A fused kernel increases register pressure and loses.', 'Incorrect masks corrupt tail elements.', 'Fast-path assumptions fail on irregular shapes.'],
        drill: 'Design a fused softmax or normalization kernel, including launch grid, masks, validation, and autotune keys.',
        evidence: 'Kernel design, correctness matrix, benchmark sweep, and fallback conditions.',
        question: 'What is the primary benefit of useful kernel fusion?', answer: 'It removes intermediate memory traffic and kernel-launch overhead',
        distractors: ['It always increases numerical precision', 'It eliminates the need for validation'],
        references: [ref('Triton Tutorials', 'https://triton-lang.org/main/getting-started/tutorials/'), ref('FlashAttention', 'https://arxiv.org/abs/2205.14135', 'paper')],
      },
    ],
  },
  {
    id: 'mlops-week-12', slug: 'week-12', number: 12, title: 'Transformer Systems and Attention Optimization',
    theme: 'Understand transformer execution deeply enough to select kernels, parallelism, and serving architecture.',
    summary: 'Study attention memory, FlashAttention, PagedAttention, parallelism strategies, and production schedulers.',
    build: 'Produce a transformer execution and memory model, then benchmark alternative attention or serving configurations.',
    review: 'Defend kernel, parallelism, cache, and scheduling choices for a specific model and workload.',
    outputs: ['Transformer memory model', 'Attention benchmark', 'Parallelism plan', 'Serving architecture review'],
    topics: [
      {
        title: 'Transformer Compute and Memory Accounting', mentalModel: 'Transformer performance decisions start with exact parameter, activation, KV-cache, and FLOP accounting.',
        concepts: ['Estimate training and inference FLOPs by sequence length and model shape.', 'Account for weights, activations, optimizer states, gradients, and temporary buffers.', 'Distinguish prefill and decode arithmetic intensity.'],
        failureModes: ['Capacity model ignores temporary workspace.', 'Sequence-length growth produces quadratic attention cost.', 'Parameter memory fits but activations OOM.'],
        drill: 'Build a spreadsheet-level memory and FLOP model for a decoder transformer.',
        evidence: 'Equations, assumptions, and fit analysis for two accelerators.',
        question: 'Why can a model whose weights fit still OOM during training?', answer: 'Activations, gradients, optimizer state, and temporary buffers also consume memory',
        distractors: ['Weights are duplicated by HTTP', 'The tokenizer occupies all GPU memory'],
        references: [ref('Megatron-LM', 'https://github.com/NVIDIA/Megatron-LM'), ref('Transformer FLOPs', 'https://arxiv.org/abs/2203.15556', 'paper')],
      },
      {
        title: 'FlashAttention and IO-Aware Algorithms', mentalModel: 'FlashAttention is fast because it changes the memory-access algorithm, not because it approximates attention.',
        concepts: ['Understand online softmax and tiled exact attention.', 'Compare HBM traffic of standard and IO-aware attention.', 'Recognize shape and hardware constraints.'],
        failureModes: ['A fallback path silently uses a slower kernel.', 'Benchmark excludes padding or causal-mask behavior.', 'Numerical tolerances are not validated.'],
        drill: 'Explain online softmax and derive why full attention-score materialization is avoided.',
        evidence: 'Algorithm walkthrough, traffic comparison, and validation plan.',
        question: 'Why is FlashAttention faster while remaining exact?', answer: 'It tiles attention to reduce expensive memory traffic and avoids materializing the full score matrix',
        distractors: ['It removes the softmax operation', 'It uses fewer transformer layers'],
        references: [ref('FlashAttention', 'https://arxiv.org/abs/2205.14135', 'paper'), ref('FlashAttention-2', 'https://arxiv.org/abs/2307.08691', 'paper')],
      },
      {
        title: 'PagedAttention and Cache Management', mentalModel: 'PagedAttention applies virtual-memory ideas to KV cache so serving can allocate non-contiguous blocks and reduce fragmentation.',
        concepts: ['Map logical sequence blocks to physical cache blocks.', 'Reason about block size, fragmentation, copy-on-write, and prefix sharing.', 'Connect cache policy to scheduler behavior.'],
        failureModes: ['Small blocks increase metadata and lookup overhead.', 'Large blocks waste memory on sequence tails.', 'Prefix sharing violates isolation or lifecycle assumptions.'],
        drill: 'Choose block size and eviction behavior for chat and batch workloads.',
        evidence: 'Allocation example, waste estimate, and cache policy.',
        question: 'What problem does PagedAttention primarily address?', answer: 'KV-cache allocation and fragmentation for variable-length active sequences',
        distractors: ['Training-data labeling', 'Model-weight quantization'],
        references: [ref('vLLM Paper', 'https://arxiv.org/abs/2309.06180', 'paper'), ref('vLLM Documentation', 'https://docs.vllm.ai/en/latest/')],
      },
      {
        title: 'Tensor, Pipeline, Sequence, and Expert Parallelism', mentalModel: 'Parallelism strategy partitions compute and state differently; the best choice follows model shape, network topology, and workload.',
        concepts: ['Compare data, tensor, pipeline, sequence, context, and expert parallelism.', 'Model communication volume and pipeline bubbles.', 'Map parallel groups to physical topology.'],
        failureModes: ['Pipeline bubbles waste expensive accelerators.', 'Tensor parallelism crosses slow links.', 'Expert routing creates load imbalance.'],
        drill: 'Choose a parallelism layout for a model larger than one node and calculate major communication paths.',
        evidence: 'Topology mapping, memory fit, and efficiency estimate.',
        question: 'Why should tensor-parallel groups usually remain on fast links?', answer: 'Tensor parallelism communicates frequently on the layer critical path',
        distractors: ['Tensor parallelism only communicates at checkpoint time', 'Fast links reduce model accuracy'],
        references: [ref('Megatron-LM', 'https://arxiv.org/abs/1909.08053', 'paper'), ref('DeepSpeed Pipeline Parallelism', 'https://www.deepspeed.ai/tutorials/pipeline/')],
      },
      {
        title: 'Production Transformer Serving Architecture', mentalModel: 'Serving architecture coordinates tokenization, routing, scheduling, cache, workers, streaming, and observability as one critical path.',
        concepts: ['Separate API gateway, tokenizer, scheduler, workers, and cache concerns.', 'Design request affinity, prefix caching, and graceful draining.', 'Define overload, cancellation, timeout, and fairness behavior.'],
        failureModes: ['Client cancellation does not release KV cache.', 'Rolling restart drops long-running generations.', 'Scheduler failure loses all in-flight work.'],
        drill: 'Design a multi-node serving architecture with explicit state ownership and failure paths.',
        evidence: 'Architecture diagram, request lifecycle, and runbook.',
        question: 'What state must be reclaimed immediately after request cancellation?', answer: 'Scheduler entries and allocated KV-cache or execution resources',
        distractors: ['Training optimizer state', 'The model card'],
        references: [ref('NVIDIA Triton Inference Server', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/'), ref('TensorRT-LLM', 'https://nvidia.github.io/TensorRT-LLM/')],
      },
    ],
  },
  {
    id: 'mlops-week-13', slug: 'week-13', number: 13, title: 'Quantization and Model Compression',
    theme: 'Trade numerical representation and model capacity for measured efficiency without losing required quality.',
    summary: 'Learn precision formats, PTQ, calibration, weight-only methods, QAT, distillation, pruning, and evaluation.',
    build: 'Run a compression study that compares quality, latency, throughput, memory, and cost across at least three configurations.',
    review: 'Recommend a compression strategy with explicit quality guardrails, hardware assumptions, and fallback conditions.',
    outputs: ['Compression benchmark', 'Calibration study', 'Quality regression suite', 'Deployment recommendation'],
    topics: [
      {
        title: 'Numerics and Quantization Fundamentals', mentalModel: 'Quantization maps a high-precision distribution into a smaller discrete representation; scale, zero point, granularity, and outliers determine error.',
        concepts: ['Compare symmetric and asymmetric mapping.', 'Understand per-tensor, per-channel, and group-wise quantization.', 'Measure clipping, rounding, saturation, and accumulation error.'],
        failureModes: ['Outliers dominate scale and waste representable range.', 'Low-precision accumulation overflows.', 'A global quality score hides cohort regressions.'],
        drill: 'Quantize a small tensor by hand under two schemes and calculate reconstruction error.',
        evidence: 'Numerical walkthrough and error comparison.',
        question: 'Why does per-channel quantization often improve accuracy?', answer: 'Each channel receives a scale suited to its own value distribution',
        distractors: ['It increases bit width automatically', 'It removes calibration'],
        references: [ref('PyTorch Quantization', 'https://pytorch.org/docs/stable/quantization.html'), ref('LLM.int8()', 'https://arxiv.org/abs/2208.07339', 'paper')],
      },
      {
        title: 'Post-Training Quantization and Calibration', mentalModel: 'Calibration estimates representative activation ranges; poor calibration creates a fast model optimized for the wrong workload.',
        concepts: ['Compare min-max, percentile, and histogram calibration.', 'Choose representative datasets and detect coverage gaps.', 'Evaluate static versus dynamic activation quantization.'],
        failureModes: ['Calibration omits rare but important inputs.', 'Activation ranges shift in production.', 'Small benchmark sets overstate quality.'],
        drill: 'Design a calibration dataset and acceptance test for a domain-specific model.',
        evidence: 'Sampling plan, range method, and regression gates.',
        question: 'What makes a calibration dataset useful?', answer: 'It represents the activation distributions and important edge cases expected in deployment',
        distractors: ['It contains only the shortest inputs', 'It maximizes training loss'],
        references: [ref('TensorRT Quantization', 'https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/work-quantized-types.html'), ref('ONNX Runtime Quantization', 'https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html')],
      },
      {
        title: 'Weight-Only Quantization: GPTQ and AWQ', mentalModel: 'Weight-only methods reduce memory traffic and model footprint while preserving sensitive weights or minimizing reconstruction error.',
        concepts: ['Understand group size, zero points, packing, and dequantization kernels.', 'Compare GPTQ error compensation and AWQ activation-aware scaling.', 'Match quantization format to available kernels and hardware.'],
        failureModes: ['A compact checkpoint uses a slow dequantization kernel.', 'Group size improves quality but reduces throughput.', 'Unsupported shapes trigger fallback kernels.'],
        drill: 'Create a decision matrix for INT8, INT4 GPTQ, and AWQ on two serving runtimes.',
        evidence: 'Format, kernel, quality, memory, and throughput comparison.',
        question: 'Why can a smaller quantized model fail to run faster?', answer: 'Runtime speed depends on efficient supported kernels, dequantization overhead, and hardware',
        distractors: ['Smaller models always use more memory', 'Quantization disables batching'],
        references: [ref('GPTQ', 'https://arxiv.org/abs/2210.17323', 'paper'), ref('AWQ', 'https://arxiv.org/abs/2306.00978', 'paper')],
      },
      {
        title: 'QAT, Distillation, and Pruning', mentalModel: 'Compression methods change different parts of the system: numerical representation, learned function, or structure.',
        concepts: ['Use quantization-aware training when PTQ quality is insufficient.', 'Understand teacher-student objectives and distillation data.', 'Separate unstructured sparsity from hardware-usable structured sparsity.'],
        failureModes: ['Sparse weights do not accelerate without matching kernels.', 'Distillation transfers teacher bias or failure modes.', 'QAT overfits the calibration domain.'],
        drill: 'Choose a compression strategy for edge deployment and one for high-throughput server inference.',
        evidence: 'Decision with training cost, quality risk, and runtime support.',
        question: 'Why might unstructured pruning not improve latency?', answer: 'Hardware and kernels may not exploit the irregular sparsity pattern efficiently',
        distractors: ['Pruning always increases parameter count', 'Pruning prevents model loading'],
        references: [ref('Distilling the Knowledge in a Neural Network', 'https://arxiv.org/abs/1503.02531', 'paper'), ref('NVIDIA Structured Sparsity', 'https://developer.nvidia.com/blog/exploiting-ampere-structured-sparsity-with-cusparselt/')],
      },
      {
        title: 'Quality-Performance Evaluation', mentalModel: 'Compression is successful only when measured against workload-specific quality, latency, throughput, memory, energy, and cost constraints.',
        concepts: ['Build task and cohort regression suites.', 'Measure perplexity alongside downstream quality where appropriate.', 'Report Pareto frontiers rather than one winner.'],
        failureModes: ['Average quality hides catastrophic tail regressions.', 'Benchmark uses a kernel unavailable in production.', 'Memory savings are reported without concurrency gains.'],
        drill: 'Design a compression benchmark and define a Pareto-based deployment rule.',
        evidence: 'Metric matrix, workload definition, and acceptance thresholds.',
        question: 'What is the right output of a compression study?', answer: 'A quality-performance Pareto frontier tied to deployment constraints',
        distractors: ['The smallest checkpoint regardless of quality', 'One perplexity number only'],
        references: [ref('lm-evaluation-harness', 'https://github.com/EleutherAI/lm-evaluation-harness'), ref('MLPerf Inference', 'https://mlcommons.org/benchmarks/inference/')],
      },
    ],
  },
  {
    id: 'mlops-week-14', slug: 'week-14', number: 14, title: 'Observability and ML Reliability',
    theme: 'Make service, data, model, and business behavior traceable in one operational model.',
    summary: 'Instrument the full prediction lifecycle, define quality-aware SLOs, detect drift, and run incidents.',
    build: 'Instrument an inference path with trace context, structured logs, service metrics, model metadata, quality signals, and drift alerts.',
    review: 'Conduct an incident review where infrastructure remains healthy while prediction quality degrades.',
    outputs: ['Instrumented inference path', 'OpenObserve dashboard design', 'Quality SLOs', 'Incident review'],
    topics: [
      {
        title: 'The ML Observability Model', mentalModel: 'Reliable ML requires joining service health, data health, model behavior, and business outcomes by version and trace.',
        concepts: ['Define telemetry for request, feature, model, prediction, and outcome.', 'Control cardinality and sensitive-data exposure.', 'Attach model, feature, config, and experiment versions.'],
        failureModes: ['Metrics are healthy while predictions degrade.', 'High-cardinality labels make telemetry unusable.', 'Logs leak prompts or sensitive features.'],
        drill: 'Design the telemetry schema for one prediction request from ingress through delayed outcome.',
        evidence: 'Signal map, join keys, cardinality policy, and privacy controls.',
        question: 'What makes ML telemetry actionable?', answer: 'It connects service behavior, inputs, model version, predictions, and outcomes',
        distractors: ['It records only CPU utilization', 'It stores every raw payload forever'],
        references: [ref('OpenTelemetry', 'https://opentelemetry.io/docs/'), ref('OpenObserve', 'https://openobserve.ai/docs/')],
      },
      {
        title: 'Distributed Tracing for AI Systems', mentalModel: 'A trace should reveal where latency, cost, retries, and quality-affecting transformations occurred across the request path.',
        concepts: ['Propagate W3C trace context across sync and async boundaries.', 'Model spans for retrieval, feature fetch, model execution, and post-processing.', 'Use sampling that preserves errors and high-latency exemplars.'],
        failureModes: ['Async work loses trace context.', 'Every token becomes a span and overwhelms storage.', 'Sampling drops the rare failures under investigation.'],
        drill: 'Create a span tree and attribute schema for an LLM RAG request.',
        evidence: 'Trace design, sampling rules, and example investigation.',
        question: 'What should tracing optimize for?', answer: 'Reconstructing the critical path and causal context of representative or problematic requests',
        distractors: ['Recording every loop iteration as a span', 'Replacing all metrics'],
        references: [ref('W3C Trace Context', 'https://www.w3.org/TR/trace-context/'), ref('OpenTelemetry Traces', 'https://opentelemetry.io/docs/concepts/signals/traces/')],
      },
      {
        title: 'Drift, Data Quality, and Delayed Labels', mentalModel: 'Drift detection is hypothesis generation; a distribution change is not automatically harmful, and no drift does not prove quality.',
        concepts: ['Distinguish data, concept, prediction, and label drift.', 'Select baselines, windows, cohorts, and statistical tests.', 'Handle delayed or sparse outcomes with proxies carefully.'],
        failureModes: ['Alert fatigue from harmless seasonal drift.', 'Global metrics hide one damaged cohort.', 'Proxy metric decouples from real quality.'],
        drill: 'Design drift and quality monitoring for a model with labels delayed by seven days.',
        evidence: 'Signals, thresholds, cohorts, response policy, and validation loop.',
        question: 'What should happen after a drift alert?', answer: 'Investigate impact and cause before deciding whether to retrain, block, or accept',
        distractors: ['Automatically retrain every time', 'Ignore it until accuracy reaches zero'],
        references: [ref('Evidently ML Monitoring', 'https://docs.evidentlyai.com/'), ref('TensorFlow Data Validation', 'https://www.tensorflow.org/tfx/data_validation/get_started')],
      },
      {
        title: 'Quality SLOs and Burn-Rate Alerts', mentalModel: 'Quality-aware SLOs turn acceptable model behavior into an operational contract with release and incident consequences.',
        concepts: ['Combine availability, latency, freshness, and quality SLOs.', 'Use multi-window burn rates and cohort safeguards.', 'Define fallback, degradation, and human-review modes.'],
        failureModes: ['Alert thresholds fire too late to protect users.', 'Fallback is unavailable when the model is degraded.', 'A global error budget permits harm to a small cohort.'],
        drill: 'Create SLOs and burn alerts for a fraud or recommendation service.',
        evidence: 'SLIs, windows, thresholds, fallback policy, and escalation.',
        question: 'What does a fast burn-rate alert indicate?', answer: 'The service is consuming its allowed error budget rapidly and needs prompt action',
        distractors: ['The model is training faster', 'Telemetry storage is cheaper'],
        references: [ref('Google SRE Alerting on SLOs', 'https://sre.google/workbook/alerting-on-slos/'), ref('OpenSLO', 'https://openslo.com/')],
      },
      {
        title: 'Incident Response and Postmortems', mentalModel: 'ML incidents require preserving evidence across data, model, configuration, and service changes while restoring safe behavior quickly.',
        concepts: ['Triage service failure versus silent quality degradation.', 'Use rollback, traffic isolation, fallback, and feature disablement.', 'Write blameless postmortems with systemic actions.'],
        failureModes: ['Rollback restores code but not compatible features.', 'Retraining during incident destroys evidence.', 'Incident response lacks a safe degraded mode.'],
        drill: 'Run a tabletop incident for quality degradation with green infrastructure metrics.',
        evidence: 'Timeline, hypotheses, evidence requests, mitigation, and corrective actions.',
        question: 'What is the first priority during a silent quality incident?', answer: 'Limit user impact while preserving evidence needed to identify the cause',
        distractors: ['Immediately delete all telemetry', 'Tune GPU kernels first'],
        references: [ref('Google SRE Incident Management', 'https://sre.google/workbook/incident-response/'), ref('Howie: Postmortems', 'https://sre.google/sre-book/postmortem-culture/')],
      },
    ],
  },
  {
    id: 'mlops-week-15', slug: 'week-15', number: 15, title: 'Safe Deployment and ML Platform Operations',
    theme: 'Promote models through evidence-driven, reversible, secure deployment stages.',
    summary: 'Design artifact supply chains, shadow and canary evaluation, rollout statistics, platform control planes, and tenant isolation.',
    build: 'Implement a promotion controller that validates artifact evidence, runs shadow comparison, gates canary rollout, and supports rollback.',
    review: 'Defend the deployment policy under delayed labels, model supply-chain risk, and partial platform failure.',
    outputs: ['Promotion controller', 'Shadow/canary evaluation plan', 'Rollback runbook', 'Supply-chain controls'],
    topics: [
      {
        title: 'Artifact Supply Chain and Reproducible Promotion', mentalModel: 'A deployable model is a signed bundle of weights, runtime, configuration, schema, evaluation evidence, and lineage.',
        concepts: ['Use immutable digests, SBOMs, provenance, signatures, and policy gates.', 'Separate artifact creation from environment promotion.', 'Validate runtime and hardware compatibility.'],
        failureModes: ['Mutable artifact tags change after approval.', 'A model passes evaluation under a different preprocessing version.', 'Unsigned artifacts enter production.'],
        drill: 'Define a model-bundle manifest and promotion evidence policy.',
        evidence: 'Manifest schema, verification steps, and rejection conditions.',
        question: 'Why promote immutable digests rather than mutable tags?', answer: 'A digest identifies the exact artifact that was evaluated and approved',
        distractors: ['Digests make models train faster', 'Tags cannot contain text'],
        references: [ref('SLSA', 'https://slsa.dev/'), ref('Sigstore Cosign', 'https://docs.sigstore.dev/cosign/overview/')],
      },
      {
        title: 'Shadow Evaluation and Counterfactual Comparison', mentalModel: 'Shadowing observes candidate behavior on production inputs without allowing candidate outputs to affect users.',
        concepts: ['Design traffic duplication, output joins, and resource isolation.', 'Handle nondeterminism and candidate timeouts.', 'Compare predictions by cohort and confidence.'],
        failureModes: ['Shadow load harms production latency.', 'Outputs cannot be joined reliably.', 'The candidate sees different features than production.'],
        drill: 'Design a shadow pipeline with isolation, join keys, and comparison metrics.',
        evidence: 'Request path, storage model, resource budget, and promotion criteria.',
        question: 'What is shadow deployment unable to prove?', answer: 'How users will respond when the candidate output actually changes their experience',
        distractors: ['Whether the candidate can process production-shaped inputs', 'Whether candidate latency is acceptable'],
        references: [ref('KServe InferenceGraph', 'https://kserve.github.io/website/latest/modelserving/inference_graph/'), ref('Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml')],
      },
      {
        title: 'Canary Statistics and Rollout Control', mentalModel: 'A canary is an experiment with user impact; rollout decisions need guardrails, sufficient evidence, and automatic rollback.',
        concepts: ['Define randomization units, guardrail metrics, and minimum sample sizes.', 'Avoid peeking and novelty effects.', 'Use staged traffic ramps and abort thresholds.'],
        failureModes: ['User-level contamination invalidates comparison.', 'Canary is too small to detect meaningful degradation.', 'Infrastructure metrics pass while quality guardrail fails.'],
        drill: 'Write a staged rollout policy with metric gates and rollback conditions.',
        evidence: 'Experiment design, thresholds, ramp schedule, and abort behavior.',
        question: 'Why must canary randomization often be sticky by user?', answer: 'Repeated exposure to different variants can contaminate outcomes and user experience',
        distractors: ['Sticky routing increases GPU memory', 'HTTP requires sticky routing'],
        references: [ref('Trustworthy Online Controlled Experiments', 'https://experimentguide.com/', 'book'), ref('Argo Rollouts', 'https://argo-rollouts.readthedocs.io/')],
      },
      {
        title: 'Platform Control Plane and Reconciliation', mentalModel: 'A reliable platform continuously reconciles declared desired state with observed runtime state.',
        concepts: ['Use declarative APIs, controllers, reconciliation, and status conditions.', 'Make operations idempotent and resumable.', 'Separate user intent from provider-specific execution.'],
        failureModes: ['Controller crash leaves ambiguous partial state.', 'Two reconcilers race on ownership.', 'Status reports success before runtime readiness.'],
        drill: 'Design a model-deployment custom resource and reconciliation loop.',
        evidence: 'API schema, state machine, idempotency strategy, and status conditions.',
        question: 'Why are reconciliation loops resilient?', answer: 'They repeatedly drive observed state toward declared desired state using idempotent operations',
        distractors: ['They execute only once', 'They avoid storing status'],
        references: [ref('Kubernetes Controller Pattern', 'https://kubernetes.io/docs/concepts/architecture/controller/'), ref('Crossplane', 'https://docs.crossplane.io/latest/')],
      },
      {
        title: 'Secure Multi-Tenant Operations', mentalModel: 'Platform convenience must not weaken tenant isolation, secret handling, artifact access, or auditability.',
        concepts: ['Apply workload identity, least privilege, network policy, and secret rotation.', 'Separate tenant quotas and blast radius.', 'Audit privileged platform actions and artifact access.'],
        failureModes: ['A training workload exfiltrates another tenant’s data.', 'Broad service credentials leak through a notebook.', 'Shared cache exposes private model state.'],
        drill: 'Threat-model the platform and define controls at identity, network, data, artifact, and runtime layers.',
        evidence: 'Threat model, trust boundaries, controls, and residual risks.',
        question: 'What should replace shared long-lived cloud credentials?', answer: 'Short-lived workload identity scoped to the minimum required permissions',
        distractors: ['Credentials embedded in model files', 'One administrator password for all workloads'],
        references: [ref('SPIFFE', 'https://spiffe.io/docs/latest/'), ref('Kubernetes Pod Security Standards', 'https://kubernetes.io/docs/concepts/security/pod-security-standards/')],
      },
    ],
  },
  {
    id: 'mlops-week-16', slug: 'week-16', number: 16, title: 'Capstone: Production AI Infrastructure',
    theme: 'Integrate architecture, performance, reliability, security, and economics into one defensible platform.',
    summary: 'Build and defend a production AI platform slice with measured performance and operator-grade evidence.',
    build: 'Complete the production ML platform with a measured serving path, promotion workflow, telemetry, capacity model, and failure recovery.',
    review: 'Present the platform as if facing a principal-engineer review and an on-call handoff.',
    outputs: ['Complete platform slice', 'Performance and capacity report', 'Architecture defense', 'On-call and disaster-recovery runbooks'],
    topics: [
      {
        title: 'Requirements, Workloads, and Capacity', mentalModel: 'Architecture begins with workload distributions, SLOs, growth, failure assumptions, and cost constraints.',
        concepts: ['Convert product demand into arrival rate, token volume, storage, and accelerator requirements.', 'Model peak, steady state, headroom, and failure capacity.', 'Define quality and latency SLOs by workload tier.'],
        failureModes: ['Capacity uses averages and fails at peak.', 'Failover capacity does not exist.', 'Cost model ignores idle reservation and data movement.'],
        drill: 'Produce the capstone workload and capacity model with three growth scenarios.',
        evidence: 'Requirements, assumptions, equations, headroom, and cost.',
        question: 'Why should capacity planning use workload distributions instead of averages?', answer: 'Averages hide peaks, tails, skew, and workload shapes that drive resource requirements',
        distractors: ['Distributions are only for data scientists', 'Averages always equal peaks'],
        references: [ref('Google SRE Capacity Planning', 'https://sre.google/sre-book/software-engineering-in-sre/'), ref('AWS Well-Architected Performance Efficiency', 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/')],
      },
      {
        title: 'Architecture and Critical-Path Defense', mentalModel: 'A strong architecture makes critical paths, state ownership, failure domains, and operational responsibilities explicit.',
        concepts: ['Draw request, training, promotion, and telemetry paths.', 'Identify synchronous dependencies and failure domains.', 'Define ownership and escalation boundaries.'],
        failureModes: ['A metadata dependency sits unknowingly on the serving critical path.', 'No component owns in-flight request state.', 'Cross-region failover violates data requirements.'],
        drill: 'Create the final architecture diagram and run a hostile review against it.',
        evidence: 'Architecture, critical paths, failure domains, and ownership map.',
        question: 'What should an architecture diagram make obvious?', answer: 'Critical paths, state ownership, trust boundaries, dependencies, and failure domains',
        distractors: ['Only service logos', 'Only the happy path'],
        references: [ref('C4 Model', 'https://c4model.com/'), ref('Google Cloud Architecture Framework', 'https://cloud.google.com/architecture/framework')],
      },
      {
        title: 'Performance Qualification and Regression Gates', mentalModel: 'Performance becomes an engineering property when workloads, environments, metrics, and regression thresholds are reproducible.',
        concepts: ['Establish baseline, saturation, and endurance tests.', 'Gate on latency, goodput, utilization, memory, quality, and cost.', 'Control variance and compare statistically meaningful results.'],
        failureModes: ['Benchmark environment differs from production.', 'A throughput gain violates quality or memory limits.', 'Regression threshold is smaller than natural variance.'],
        drill: 'Write the capstone performance qualification suite and CI gate policy.',
        evidence: 'Benchmark commands, environment manifest, results, and regression rules.',
        question: 'What makes a performance regression gate trustworthy?', answer: 'A reproducible workload and environment with thresholds larger than measured variance',
        distractors: ['Running one request', 'Ignoring hardware details'],
        references: [ref('MLPerf Inference', 'https://mlcommons.org/benchmarks/inference/'), ref('Google Benchmark', 'https://github.com/google/benchmark')],
      },
      {
        title: 'Chaos, Disaster Recovery, and On-Call Readiness', mentalModel: 'Operational readiness means known failure behavior, tested recovery, preserved correctness, and a human-usable runbook.',
        concepts: ['Test node loss, dependency outage, bad model, drift, and credential failure.', 'Define RTO, RPO, backup, restore, and fallback.', 'Build actionable alerts and runbooks.'],
        failureModes: ['Backup exists but restore is untested.', 'Failover serves an incompatible model version.', 'Alerts identify symptoms but not owner or action.'],
        drill: 'Run a capstone game day and record recovery time, data loss, and correctness.',
        evidence: 'Game-day report, runbooks, recovery measurements, and corrective actions.',
        question: 'What proves a disaster-recovery plan works?', answer: 'A tested restore or failover that meets defined recovery and correctness objectives',
        distractors: ['A backup-success log alone', 'A diagram labeled highly available'],
        references: [ref('Google SRE Disaster Recovery', 'https://sre.google/sre-book/handling-overload/'), ref('Principles of Chaos Engineering', 'https://principlesofchaos.org/')],
      },
      {
        title: 'Principal Review and Continuing Mastery', mentalModel: 'Expertise is the ability to form correct models, measure reality, communicate tradeoffs, and improve systems repeatedly.',
        concepts: ['Defend assumptions and change your mind when evidence disagrees.', 'Communicate to operators, developers, security, finance, and leadership.', 'Create a continuing study and benchmark program.'],
        failureModes: ['Architecture confidence exceeds evidence.', 'Optimization expertise becomes tied to one tool.', 'Knowledge is not transferred to the operating team.'],
        drill: 'Deliver a 30-minute architecture defense, answer hostile questions, and create a six-month mastery plan.',
        evidence: 'Presentation, decision log, open risks, benchmark backlog, and study plan.',
        question: 'What best distinguishes expert performance engineering?', answer: 'Accurate mental models validated by measurement and translated into durable system decisions',
        distractors: ['Memorizing the most tool names', 'Always writing custom kernels'],
        references: [ref('Systems Performance', 'https://www.brendangregg.com/systems-performance-2nd-edition-book.html', 'book'), ref('Designing Data-Intensive Applications', 'https://dataintensive.net/', 'book')],
      },
    ],
  },
];

export const [
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
] = advancedWeeks.map(buildAdvancedWeek);
