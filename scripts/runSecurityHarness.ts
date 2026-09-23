import * as fs from 'fs';
import * as path from 'path';
import { runFunctionalSecurityHarness } from '../src/validation/securityHarness';

export function runCliHarness(): void {
  console.log('================================================================');
  console.log('TRACE SHIELD AI 2.0 — PHASE 2 FUNCTIONAL SECURITY HARNESS');
  console.log('Deterministic Security Verification & Invariant Regression Suite');
  console.log('================================================================\n');

  const report = runFunctionalSecurityHarness();

  console.log(`Execution Timestamp: ${report.timestamp}`);
  console.log(`Total Tests Executed: ${report.totalTests}`);
  console.log(`Passed: ${report.passedCount}`);
  console.log(`Failed: ${report.failedCount}`);
  console.log(`Observed Limitations: ${report.limitationCount}\n`);

  console.log('----------------------------------------------------------------');
  console.log('TEST CASE EXECUTION LOG');
  console.log('----------------------------------------------------------------');

  let currentSuite = '';
  for (const t of report.tests) {
    if (t.suite !== currentSuite) {
      currentSuite = t.suite;
      console.log(`\n[SUITE: ${currentSuite.toUpperCase()}]`);
    }
    const statusTag = t.status === 'PASS' ? '[PASS]' : t.status === 'OBSERVED_LIMITATION' ? '[OBSV]' : '[FAIL]';
    console.log(`  ${statusTag} ${t.id}: ${t.name}`);
    console.log(`         Expected: ${t.expected}`);
    console.log(`         Actual:   ${t.actual}`);
    if (t.status !== 'PASS') {
      console.log(`         Module:   ${t.relevantModule}`);
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log('CORE VALIDATION MATRIX RESULTS (TS-001 to TS-007)');
  console.log('----------------------------------------------------------------');
  for (const row of report.matrixRows) {
    const statusTag = row.status === 'PASS' ? 'PASS' : row.status === 'OBSERVED_LIMITATION' ? 'OBSV' : 'FAIL';
    console.log(`  | ${row.id} | ${row.scenario.padEnd(35)} | ${row.expected.padEnd(25)} | ${row.actual.padEnd(45)} | ${statusTag} |`);
  }

  console.log('\n----------------------------------------------------------------');
  console.log('MANDATORY SECURITY INVARIANTS (INV-01 to INV-10)');
  console.log('----------------------------------------------------------------');
  for (const inv of report.invariants) {
    console.log(`  [${inv.status}] ${inv.id}: ${inv.name}`);
    console.log(`         Rationale: ${inv.rationale}`);
  }

  if (report.implementationLimitations.length > 0) {
    console.log('\n----------------------------------------------------------------');
    console.log('OBSERVED IMPLEMENTATION LIMITATIONS / NOTICES');
    console.log('----------------------------------------------------------------');
    for (const lim of report.implementationLimitations) {
      console.log(`  * ${lim}`);
    }
  }

  // Save machine-readable JSON
  try {
    const validationDir = path.resolve(process.cwd(), 'validation');
    if (!fs.existsSync(validationDir)) {
      fs.mkdirSync(validationDir, { recursive: true });
    }
    const outputPath = path.join(validationDir, 'functional-validation-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nMachine-readable validation report written to: ${outputPath}`);
  } catch (err: unknown) {
    console.error(`Failed to write validation json: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('\n================================================================');
  console.log(`OVERALL HARNESS RESULT: ${report.failedCount === 0 ? 'SUCCESS' : 'FAILED'}`);
  console.log('================================================================\n');

  if (report.failedCount > 0) {
    process.exit(1);
  }
}

// Run CLI directly if invoked as script
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runSecurityHarness')) {
  runCliHarness();
}
