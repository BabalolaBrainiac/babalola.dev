import type { LearningModule, LearningWeek } from '@/features/learning/types';

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

export const mlopsWeek11 = makeOutlineWeek('mlops-week-11', 'week-11', 11, 'CUDA Kernels and Triton', 'CUDA programming model, fused kernels, Triton tile-based programming, and Flash Attention.', 'Week 11 teaches custom kernel authoring for performance-critical ML operations.', ['Triton kernel implementation', 'Throughput comparison', 'Profiling notes']);
export const mlopsWeek12 = makeOutlineWeek('mlops-week-12', 'week-12', 12, 'Transformer Systems and Attention Optimizations', 'KV cache, PagedAttention, speculative decoding, and vLLM internals.', 'Week 12 covers modern LLM inference engineering — the fastest-moving area of AI infra.', ['vLLM serving script', 'Benchmark results', 'Memory layout analysis']);
export const mlopsWeek13 = makeOutlineWeek('mlops-week-13', 'week-13', 13, 'LLM Quantization and Compression', 'Post-training quantization, QAT, distillation, and pruning.', 'Week 13 teaches model compression for efficient deployment.', ['Quantized model checkpoint', 'Perplexity comparison', 'Throughput comparison']);
export const mlopsWeek14 = makeOutlineWeek('mlops-week-14', 'week-14', 14, 'Observability and Production ML Monitoring', 'OpenTelemetry, OpenObserve, Prometheus, drift detection, and SLOs.', 'Week 14 teaches how to make silent ML failures visible.', ['Instrumented FastAPI server', 'OpenObserve dashboard', 'Drift simulation script']);
export const mlopsWeek15 = makeOutlineWeek('mlops-week-15', 'week-15', 15, 'Deployment Strategies and MLOps Platforms', 'Canary, shadow, blue-green deployments, A/B testing, and ML platform design.', 'Week 15 teaches safe model deployment and platform architecture.', ['Blue-green switching logic', 'Health endpoint with version', 'Deployment runbook']);
export const mlopsWeek16 = makeOutlineWeek('mlops-week-16', 'week-16', 16, 'Capstone: End-to-End MLOps Platform', 'Complete platform architecture, capacity planning, on-call runbooks, and interview prep.', 'Week 16 integrates everything into a complete MLOps platform.', ['Complete observability stack', 'Deployment runbooks', 'Architecture diagram', 'Interview prep notes']);
