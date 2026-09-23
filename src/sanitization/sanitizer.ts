import { SafeMappingEntry, SanitizationResult, SensitiveMatch } from '../types';

/**
 * Deterministic Span-Based Sanitizer with Relational Mapping
 * Preserves relational technical context (e.g. 10.20.14.5 -> [INTERNAL_IP_1], 10.20.14.6 -> [INTERNAL_IP_2])
 */
export function sanitizeEvidence(
  text: string,
  matches: SensitiveMatch[]
): SanitizationResult {
  const t0 = performance.now();
  if (!text || matches.length === 0) {
    return {
      original_length: text ? text.length : 0,
      sanitized_text: text,
      tokens_replaced: 0,
      relational_map: {},
      safe_mappings: [],
      execution_time_ms: 0.1,
    };
  }

  // 1. Sort matches ascending by start offset
  const sorted = [...matches].sort((a, b) => a.metadata.start - b.metadata.start);

  // 2. Resolve overlaps by Severity Priority
  const filtered: SensitiveMatch[] = [];
  let lastEnd = -1;

  for (const m of sorted) {
    if (m.metadata.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.metadata.end;
    } else {
      // Overlap: compare severity
      const prev = filtered[filtered.length - 1];
      if (prev && m.metadata.base_severity > prev.metadata.base_severity) {
        filtered[filtered.length - 1] = m;
        lastEnd = m.metadata.end;
      }
      // Otherwise keep prev
    }
  }

  // 3. Relational Mapping Dictionary
  const relationalMap: Record<string, string> = {};
  const categoryCounters: Record<string, number> = {};

  for (const item of filtered) {
    const raw = item.raw_value;
    if (!relationalMap[raw]) {
      const sub = item.metadata.subcategory;
      if (sub === 'RFC1918_IP') {
        categoryCounters['IP'] = (categoryCounters['IP'] || 0) + 1;
        relationalMap[raw] = `[INTERNAL_IP_${categoryCounters['IP']}]`;
      } else if (sub === 'INTERNAL_URL') {
        categoryCounters['HOST'] = (categoryCounters['HOST'] || 0) + 1;
        relationalMap[raw] = `[INTERNAL_HOST_${categoryCounters['HOST']}]`;
      } else if (sub === 'EMAIL') {
        categoryCounters['EMAIL'] = (categoryCounters['EMAIL'] || 0) + 1;
        relationalMap[raw] = `[REDACTED_EMAIL_${categoryCounters['EMAIL']}]`;
      } else if (sub === 'AWS_ACCESS_KEY') {
        categoryCounters['AWS'] = (categoryCounters['AWS'] || 0) + 1;
        relationalMap[raw] = `[REDACTED_AWS_KEY_${categoryCounters['AWS']}]`;
      } else if (sub === 'AWS_SECRET_KEY') {
        relationalMap[raw] = `[REDACTED_AWS_SECRET]`;
      } else if (sub === 'OPENAI_KEY') {
        relationalMap[raw] = `[REDACTED_OPENAI_KEY]`;
      } else if (sub === 'GITHUB_PAT') {
        relationalMap[raw] = `[REDACTED_GITHUB_TOKEN]`;
      } else if (sub === 'SYNTHETIC_DEMO_KEY') {
        relationalMap[raw] = `[REDACTED_DEMO_SECRET]`;
      } else if (sub === 'PRIVATE_KEY') {
        relationalMap[raw] = `[REDACTED_PRIVATE_KEY_BLOCK]`;
      } else if (sub === 'DB_CONN_STR') {
        relationalMap[raw] = `[REDACTED_DB_URI]`;
      } else if (sub === 'PHONE_NUMBER') {
        categoryCounters['PHONE'] = (categoryCounters['PHONE'] || 0) + 1;
        relationalMap[raw] = `[REDACTED_PHONE_${categoryCounters['PHONE']}]`;
      } else if (sub === 'AUTH_HEADER') {
        relationalMap[raw] = `[REDACTED_AUTH_TOKEN]`;
      } else {
        relationalMap[raw] = item.metadata.replacement_preview || `[REDACTED_${sub}]`;
      }
    }
  }

  // 4. Right-to-Left Surgical Splice
  // Sorting descending by start index guarantees downstream replacements don't shift offsets!
  filtered.sort((a, b) => b.metadata.start - a.metadata.start);

  // Generate safe mapping entries without leaking raw values
  const safeMappings: SafeMappingEntry[] = [];
  const seenTags = new Set<string>();
  for (const item of filtered) {
    const replacement = relationalMap[item.raw_value] || `[REDACTED]`;
    if (!seenTags.has(replacement)) {
      seenTags.add(replacement);
      safeMappings.push({
        original_type: item.metadata.subcategory || item.metadata.category,
        replacement_token: replacement,
      });
    }
  }

  let result = text;
  let replacedCount = 0;

  for (const item of filtered) {
    const start = item.metadata.start;
    const end = item.metadata.end;
    const replacement = relationalMap[item.raw_value] || `[REDACTED]`;

    // Controlled DEMO-4 validation fixture:
    // Deliberately preserve a residual secret token in output to test closed-loop independent
    // verifier quarantine. Explicitly scoped strictly to the DEMO-4 fault injection trigger.
    if (
      text.includes('[TEST_INJECT: VERIFICATION_HOLD_TRIGGER]') &&
      item.metadata.subcategory === 'SYNTHETIC_DEMO_KEY' &&
      item.raw_value.includes('TRACE_DEMO_API_KEY')
    ) {
      continue;
    }

    if (start >= 0 && end <= result.length && start <= end) {
      result = result.slice(0, start) + replacement + result.slice(end);
      replacedCount++;
    }
  }

  const executionTime = Math.max(0.1, performance.now() - t0);

  return {
    original_length: text.length,
    sanitized_text: result,
    tokens_replaced: replacedCount,
    relational_map: relationalMap,
    safe_mappings: safeMappings,
    execution_time_ms: Math.round(executionTime * 100) / 100,
  };
}
