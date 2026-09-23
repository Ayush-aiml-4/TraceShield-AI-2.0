import { VerificationResult } from '../types';
import { runDetectionRegistry } from '../detection/registry';
import { calculateShannonEntropy } from '../core/entropy';

/**
 * Closed-Loop Independent Rescan Verifier
 * Treats the sanitizer as untrusted and verifies that no configured findings remain.
 */
export function verifySanitization(
  sanitizedText: string,
  originalTokenMap: Record<string, string>
): VerificationResult {
  const t0 = performance.now();
  if (!sanitizedText) {
    return {
      passed: true,
      residual_findings_detected: [],
      entropy_violations_detected: [],
      syntax_valid: true,
      leak_detected: false,
      failure_reason: null,
      checks_summary: {
        no_residual_secrets: true,
        no_residual_pii: true,
        no_raw_tokens_bleed: true,
        no_entropy_anomalies: true,
        syntax_integrity: true,
      },
      execution_time_ms: 0.1,
    };
  }

  // CHECK 1 & 2: Independent Rescan using detection registry
  const rescanMatches = runDetectionRegistry(sanitizedText);
  const residualSecrets: string[] = [];
  const residualPII: string[] = [];

  for (const m of rescanMatches) {
    // Check if finding is a valid replacement token like [INTERNAL_IP_1]
    const val = m.raw_value;
    if (val.startsWith('[') && val.endsWith(']')) {
      continue;
    }
    if (m.metadata.category === 'SECRET') {
      residualSecrets.push(`${m.metadata.subcategory} [REDACTED_RESIDUAL_SECRET]`);
    } else if (m.metadata.category === 'PII') {
      residualPII.push(`${m.metadata.subcategory} [REDACTED_RESIDUAL_PII]`);
    }
  }

  // CHECK 3: Raw Token Map Bleed (Assert no original sensitive string remains in output)
  const leakedRawTokens: string[] = [];
  for (const rawToken of Object.keys(originalTokenMap)) {
    if (rawToken.length >= 4 && sanitizedText.includes(rawToken)) {
      leakedRawTokens.push(`[DETECTED_RAW_TOKEN_BLEED]`);
    }
  }

  // CHECK 4: Residual Shannon Entropy Anomalies on tokens >= 24 chars
  const words = sanitizedText.split(/\s+/);
  const entropyViolations: string[] = [];
  for (const w of words) {
    // Strip valid bracketed redaction tags (e.g. [REDACTED_...], [INTERNAL_IP_1]) before entropy check
    const withoutTags = w.replace(/\[[A-Z0-9_]+\]/g, '');
    const cleanWord = withoutTags.replace(/['":;,()<>[\]{}]/g, '');
    if (cleanWord.length >= 24) {
      const ent = calculateShannonEntropy(cleanWord);
      if (ent >= 4.8) {
        entropyViolations.push(`EntropyAnomaly (Score: ${ent})`);
      }
    }
  }

  // CHECK 5: Syntax integrity (if JSON or ENV)
  let syntaxValid = true;
  if (sanitizedText.trim().startsWith('{') && sanitizedText.trim().endsWith('}')) {
    try {
      JSON.parse(sanitizedText);
    } catch {
      syntaxValid = false;
    }
  }

  const checksSummary = {
    no_residual_secrets: residualSecrets.length === 0,
    no_residual_pii: residualPII.length === 0,
    no_raw_tokens_bleed: leakedRawTokens.length === 0,
    no_entropy_anomalies: entropyViolations.length === 0,
    syntax_integrity: syntaxValid,
  };

  const hasFailed =
    !checksSummary.no_residual_secrets ||
    !checksSummary.no_residual_pii ||
    !checksSummary.no_raw_tokens_bleed ||
    !checksSummary.no_entropy_anomalies;

  let failureReason: string | null = null;
  if (hasFailed) {
    const reasons: string[] = [];
    if (!checksSummary.no_residual_secrets) {
      reasons.push(`Residual secrets detected: ${residualSecrets.join(', ')}`);
    }
    if (!checksSummary.no_raw_tokens_bleed) {
      reasons.push(`Pre-sanitization raw token bleed detected`);
    }
    if (!checksSummary.no_residual_pii) {
      reasons.push(`Unredacted PII detected: ${residualPII.join(', ')}`);
    }
    if (!checksSummary.no_entropy_anomalies) {
      reasons.push(`High entropy remnants detected`);
    }
    failureReason = reasons.join(' | ');
  }

  const executionTime = Math.max(0.1, performance.now() - t0);

  return {
    passed: !hasFailed,
    residual_findings_detected: [...residualSecrets, ...residualPII, ...leakedRawTokens],
    entropy_violations_detected: entropyViolations,
    syntax_valid: syntaxValid,
    leak_detected: leakedRawTokens.length > 0,
    failure_reason: failureReason,
    checks_summary: checksSummary,
    execution_time_ms: Math.round(executionTime * 100) / 100,
  };
}
