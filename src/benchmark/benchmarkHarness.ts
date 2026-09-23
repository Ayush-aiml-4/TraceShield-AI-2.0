import { CanonicalDestination, PolicyProfileId } from '../types';
import { runDetectionRegistry } from '../detection/registry';
import { sanitizeEvidence } from '../sanitization/sanitizer';
import { verifySanitization } from '../verification/verifier';
import { runTraceShieldPipeline } from '../core/pipeline';

export interface BenchmarkMetric {
  name: string;
  iterations: number;
  averageMs: number | null;
  medianMs: number | null;
  minMs: number | null;
  maxMs: number | null;
  p95Ms: number | null;
  status: 'COMPLETED' | 'NOT MEASURED';
  note?: string;
}

export interface BenchmarkSuiteResult {
  timestamp: string;
  totalDurationMs: number;
  metrics: BenchmarkMetric[];
  summaryText: string;
}

function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.floor(sortedValues.length * percentile))
  );
  return sortedValues[index];
}

function computeStats(name: string, samples: number[]): BenchmarkMetric {
  if (samples.length === 0) {
    return {
      name,
      iterations: 0,
      averageMs: null,
      medianMs: null,
      minMs: null,
      maxMs: null,
      p95Ms: null,
      status: 'NOT MEASURED',
    };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = Math.round((sum / sorted.length) * 100) / 100;
  const min = Math.round(sorted[0] * 100) / 100;
  const max = Math.round(sorted[sorted.length - 1] * 100) / 100;
  const median = Math.round(calculatePercentile(sorted, 0.5) * 100) / 100;
  const p95 = Math.round(calculatePercentile(sorted, 0.95) * 100) / 100;

  return {
    name,
    iterations: samples.length,
    averageMs: avg,
    medianMs: median,
    minMs: min,
    maxMs: max,
    p95Ms: p95,
    status: 'COMPLETED',
  };
}

/**
 * Runs the TraceShield benchmark harness using synthetic strings only.
 * High-resolution timer (performance.now) measurements over 20 iterations.
 * Strictly avoids hardcoded numbers.
 */
export function runBenchmarkSuite(iterations = 20): BenchmarkSuiteResult {
  const tSuiteStart = performance.now();

  // Synthetic Test Inputs (Zero real credentials or production secrets)
  const syntheticCleanText = `
function computeOrderSubtotal(items: { id: string; price: number; quantity: number }[]): number {
  return items.reduce((accum, curr) => accum + (curr.price * curr.quantity), 0);
}
export const DEFAULT_CURRENCY = 'USD';
  `.trim();

  const syntheticDirtyText = `
[SYSTEM_AUDIT_LOG - STAGING GATEWAY]
Connection failed to upstream cluster.
aws_access_key_id = "AKIAIOSFODNN7EXAMPLE"
client_token = "ghp_SyntheticSampleGitHubPersonalTokenForTest12345"
host = "192.168.1.105"
auth_bearer = "sk-live-0123456789abcdef0123456789abcdef01234567"
Error trace: Connection reset by peer at /srv/app/auth.ts:42
  `.trim();

  // A. Clean Input Benchmark
  const cleanSamples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    runDetectionRegistry(syntheticCleanText);
    cleanSamples.push(performance.now() - t0);
  }
  const cleanMetric = computeStats('A. Clean Input Processing', cleanSamples);

  // B. Deterministic Secret Detection Benchmark
  const detectionSamples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    runDetectionRegistry(syntheticDirtyText);
    detectionSamples.push(performance.now() - t0);
  }
  const detectionMetric = computeStats('B. Deterministic Secret Detection', detectionSamples);

  // Pre-generate findings for Sanitization & Verification benchmarks
  const matches = runDetectionRegistry(syntheticDirtyText);

  // C. Sanitization Benchmark
  const sanitizationSamples: number[] = [];
  let lastSanitizationResult = null;
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    lastSanitizationResult = sanitizeEvidence(syntheticDirtyText, matches);
    sanitizationSamples.push(performance.now() - t0);
  }
  const sanitizationMetric = computeStats('C. Evidence Sanitization', sanitizationSamples);

  // D. Independent Verification Benchmark
  const verificationSamples: number[] = [];
  if (lastSanitizationResult) {
    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      verifySanitization(
        lastSanitizationResult.sanitized_text,
        lastSanitizationResult.relational_map
      );
      verificationSamples.push(performance.now() - t0);
    }
  }
  const verificationMetric = computeStats('D. Independent Rescan Verification', verificationSamples);

  // E. Full Pipeline Benchmark
  const pipelineSamples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    runTraceShieldPipeline({
      text: syntheticDirtyText,
      sourceType: 'LOG_FILE',
      destinationId: CanonicalDestination.PUBLIC_GITHUB,
      policyId: PolicyProfileId.CLOUDOPS,
    });
    pipelineSamples.push(performance.now() - t0);
  }
  const pipelineMetric = computeStats('E. Full TraceShield Pipeline', pipelineSamples);

  // F. AI Context Inference Benchmark
  // Per Section 8: "If no validated model exists: AI invoked: NO. Reason: No validated local model available."
  // Do NOT fabricate or benchmark simulated AI models
  const aiMetric: BenchmarkMetric = {
    name: 'F. AI Context Inference',
    iterations: 0,
    averageMs: null,
    medianMs: null,
    minMs: null,
    maxMs: null,
    p95Ms: null,
    status: 'NOT MEASURED',
    note: 'NOT MEASURED — No validated local model available.',
  };

  const metrics = [
    cleanMetric,
    detectionMetric,
    sanitizationMetric,
    verificationMetric,
    pipelineMetric,
    aiMetric,
  ];

  const totalDuration = Math.round((performance.now() - tSuiteStart) * 10) / 10;

  // Format textual summary
  const summaryLines: string[] = [
    '================================================',
    `TRACE SHIELD AI 2.0 BENCHMARK REPORT (${iterations} runs per stage)`,
    '================================================',
  ];

  for (const m of metrics) {
    if (m.status === 'COMPLETED') {
      summaryLines.push(
        `${m.name}`,
        `  Iterations: ${m.iterations} runs`,
        `  Average:    ${m.averageMs} ms`,
        `  Median:     ${m.medianMs} ms`,
        `  Min:        ${m.minMs} ms`,
        `  Max:        ${m.maxMs} ms`,
        `  P95:        ${m.p95Ms} ms`,
        ''
      );
    } else {
      summaryLines.push(
        `${m.name}`,
        `  Status:     ${m.note || 'NOT MEASURED'}`,
        ''
      );
    }
  }

  summaryLines.push(`Total Benchmark Wall-Clock Duration: ${totalDuration} ms`);

  return {
    timestamp: new Date().toISOString(),
    totalDurationMs: totalDuration,
    metrics,
    summaryText: summaryLines.join('\n'),
  };
}
