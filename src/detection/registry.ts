import { EntityCategory, FindingMetadata, SensitiveMatch } from '../types';
import { calculateShannonEntropy } from '../core/entropy';

export interface DetectorDefinition {
  id: string;
  category: EntityCategory;
  subcategory: string;
  base_severity: number;
  regex: RegExp;
  confidence: number;
  checkEntropy?: boolean;
  minEntropy?: number;
  replacementTag: string;
  isRelational?: boolean;
}

export const DETECTOR_REGISTRY: DetectorDefinition[] = [
  {
    id: 'SEC-01',
    category: EntityCategory.SECRET,
    subcategory: 'AWS_ACCESS_KEY',
    base_severity: 95.0,
    regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16})\b/g,
    confidence: 0.98,
    replacementTag: '[REDACTED_AWS_KEY]',
    isRelational: true,
  },
  {
    id: 'SEC-02',
    category: EntityCategory.SECRET,
    subcategory: 'AWS_SECRET_KEY',
    base_severity: 95.0,
    regex: /(?:aws_(?:secret_)?(?:access_)?key|SECRET_KEY)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi,
    confidence: 0.94,
    checkEntropy: true,
    minEntropy: 4.5,
    replacementTag: '[REDACTED_AWS_SECRET]',
    isRelational: true,
  },
  {
    id: 'SEC-03',
    category: EntityCategory.SECRET,
    subcategory: 'GITHUB_PAT',
    base_severity: 90.0,
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,255})\b/g,
    confidence: 0.99,
    replacementTag: '[REDACTED_GITHUB_TOKEN]',
  },
  {
    id: 'SEC-04',
    category: EntityCategory.SECRET,
    subcategory: 'OPENAI_KEY',
    base_severity: 90.0,
    regex: /\b(sk-[A-Za-z0-9]{20,48}|sk-proj-[A-Za-z0-9_-]{20,128})\b/g,
    confidence: 0.98,
    replacementTag: '[REDACTED_OPENAI_KEY]',
  },
  {
    id: 'SEC-04-SYNTH',
    category: EntityCategory.SECRET,
    subcategory: 'SYNTHETIC_DEMO_KEY',
    base_severity: 95.0,
    regex: /\b(TRACE_DEMO_API_KEY_\d{3}|DEMO_INTERNAL_TOKEN_\d{3}|DEMO_PASSWORD_\d{3})\b/g,
    confidence: 1.0,
    replacementTag: '[REDACTED_DEMO_KEY]',
  },
  {
    id: 'SEC-05',
    category: EntityCategory.SECRET,
    subcategory: 'JWT_TOKEN',
    base_severity: 85.0,
    regex: /\b(ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
    confidence: 0.92,
    replacementTag: '[REDACTED_JWT_TOKEN]',
  },
  {
    id: 'SEC-06',
    category: EntityCategory.SECRET,
    subcategory: 'PRIVATE_KEY',
    base_severity: 100.0,
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    confidence: 1.0,
    replacementTag: '[REDACTED_PRIVATE_KEY_BLOCK]',
  },
  {
    id: 'NET-01',
    category: EntityCategory.NETWORK,
    subcategory: 'RFC1918_IP',
    base_severity: 45.0,
    regex: /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    confidence: 0.96,
    replacementTag: '[INTERNAL_IP]',
    isRelational: true,
  },
  {
    id: 'NET-02',
    category: EntityCategory.NETWORK,
    subcategory: 'INTERNAL_URL',
    base_severity: 50.0,
    regex: /https?:\/\/[a-zA-Z0-9_.-]+\.(?:corp|internal|local|lan|intranet)\b[^\s"'<>]*/gi,
    confidence: 0.95,
    replacementTag: '[INTERNAL_HOST]',
    isRelational: true,
  },
  {
    id: 'NET-03',
    category: EntityCategory.NETWORK,
    subcategory: 'DB_CONN_STR',
    base_severity: 90.0,
    regex: /(?:postgres|postgresql|mysql|mongodb|redis):\/\/(?:[^:\s]+:[^@\s]+@)[^\s"']+/gi,
    confidence: 0.96,
    replacementTag: '[REDACTED_DB_URI]',
  },
  {
    id: 'PII-01',
    category: EntityCategory.PII,
    subcategory: 'EMAIL',
    base_severity: 40.0,
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    confidence: 0.93,
    replacementTag: '[REDACTED_EMAIL]',
    isRelational: true,
  },
  {
    id: 'PII-02',
    category: EntityCategory.PII,
    subcategory: 'PHONE_NUMBER',
    base_severity: 35.0,
    regex: /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{2,4}\)?[-. ]?\d{3,4}[-. ]?\d{3,4}\b/g,
    confidence: 0.82,
    replacementTag: '[REDACTED_PHONE]',
    isRelational: true,
  },
  {
    id: 'TECH-01',
    category: EntityCategory.TECHNICAL,
    subcategory: 'STACK_TRACE',
    base_severity: 20.0,
    regex: /^\s*at\s+[A-Za-z0-9_$.]+\s*\([^)]+:\d+:\d+\)/gm,
    confidence: 0.90,
    replacementTag: '[STACK_FRAME]',
  },
  {
    id: 'TECH-02',
    category: EntityCategory.TECHNICAL,
    subcategory: 'AUTH_HEADER',
    base_severity: 85.0,
    regex: /(?:authorization|auth):\s*(?:bearer|basic)\s+([A-Za-z0-9._~+/-]+=*)/gi,
    confidence: 0.95,
    replacementTag: '[REDACTED_AUTH_TOKEN]',
  },
];

export function runDetectionRegistry(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = [];
  if (!text) return matches;

  for (const def of DETECTOR_REGISTRY) {
    const rx = new RegExp(def.regex.source, def.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = rx.exec(text)) !== null) {
      const fullMatch = match[0];
      const matchIndex = match.index;
      const targetValue = match[1] || fullMatch;
      const targetStart = match[1] ? matchIndex + fullMatch.indexOf(match[1]) : matchIndex;
      const targetEnd = targetStart + targetValue.length;

      const ent = calculateShannonEntropy(targetValue);
      if (def.checkEntropy && def.minEntropy && ent < def.minEntropy) {
        continue;
      }

      const meta: FindingMetadata = {
        id: `${def.id}-${targetStart}`,
        category: def.category,
        subcategory: def.subcategory,
        start: targetStart,
        end: targetEnd,
        confidence: def.confidence,
        entropy: ent,
        base_severity: def.base_severity,
        context_modifier: 1.0,
        context_rationale: '',
        is_ambiguous: false,
        ai_context_applied: false,
        replacement_preview: def.replacementTag,
      };

      matches.push({
        metadata: meta,
        raw_value: targetValue,
      });
    }
  }

  // Scan standalone high entropy tokens (>= 24 chars)
  const words = text.split(/\s+/);
  let curOffset = 0;
  for (const w of words) {
    const wordClean = w.replace(/['":;,()<>[\]{}]/g, '');
    const wordIdx = text.indexOf(w, curOffset);
    curOffset = wordIdx + w.length;

    if (wordClean.length >= 24) {
      const ent = calculateShannonEntropy(wordClean);
      if (ent >= 4.75) {
        const isAlreadyMatched = matches.some(
          (m) => m.metadata.start <= wordIdx && m.metadata.end >= wordIdx + wordClean.length
        );
        if (!isAlreadyMatched) {
          const meta: FindingMetadata = {
            id: `SEC-07-${wordIdx}`,
            category: EntityCategory.SECRET,
            subcategory: 'HIGH_ENTROPY_TOKEN',
            start: wordIdx,
            end: wordIdx + wordClean.length,
            confidence: 0.85,
            entropy: ent,
            base_severity: 75.0,
            context_modifier: 1.0,
            context_rationale: `High Shannon Entropy (${ent.toFixed(2)}) detected.`,
            is_ambiguous: true,
            ai_context_applied: false,
            replacement_preview: '[HIGH_ENTROPY_SECRET]',
          };
          matches.push({
            metadata: meta,
            raw_value: wordClean,
          });
        }
      }
    }
  }

  // Sort ascending by start index
  matches.sort((a, b) => a.metadata.start - b.metadata.start);
  return matches;
}
