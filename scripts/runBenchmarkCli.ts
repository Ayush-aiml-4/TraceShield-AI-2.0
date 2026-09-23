import { runBenchmarkSuite } from '../src/benchmark/benchmarkHarness';
import { probeHardwareEnvironment } from '../src/validation/hardwareProbe';
import { generateValidationReport } from '../src/validation/runtimeProbe';
import { HardwarePlatform } from '../src/types';

export function runBenchmarkCli(iterations = 20): void {
  const hw = probeHardwareEnvironment();
  const report = generateValidationReport(hw);

  console.log('================================================');
  console.log('TRACE SHIELD AI 2.0 BENCHMARK EXECUTION');
  console.log('================================================');
  console.log(`Validation Environment: ${report.environmentLabel}`);
  console.log(`Benchmark Hardware:     ${hw.rawCpuModelSafe || 'Generic CPU'}`);
  console.log(`Benchmark OS:           ${hw.isWindows ? (hw.osVersion.includes('11') ? 'Windows 11' : 'Windows') : hw.osName} (${hw.isArm64 ? 'ARM64' : 'x86_64'})`);
  console.log(`Benchmark Backend:      ${report.status.qnn === 'VALIDATED' ? 'QNN_NPU' : 'CPU'}`);
  console.log('------------------------------------------------');

  if (!hw.isArm64 || hw.platform === HardwarePlatform.OTHER) {
    console.log('[NOTICE] Executing on non-Snapdragon / non-target environment.');
    console.log('         Measurements reflect host CPU execution only.');
    console.log('         DO NOT present these numbers as Snapdragon performance.');
    console.log('------------------------------------------------');
  }

  console.log(`Executing ${iterations} iterations per stage...\n`);
  const benchmarkResult = runBenchmarkSuite(iterations);

  console.log(benchmarkResult.summaryText);
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runBenchmarkCli')) {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 20;
  runBenchmarkCli(isNaN(count) ? 20 : count);
}
