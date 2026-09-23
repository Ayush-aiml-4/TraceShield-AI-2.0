import {
  CanonicalDestination,
  DestinationContext,
  FindingMetadata,
  OriginContext,
  PolicyProfile,
  PolicyProfileId,
  RiskAssessment,
  RiskStatus,
} from '../types';

export const POLICY_PROFILES: Record<PolicyProfileId, PolicyProfile> = {
  [PolicyProfileId.CLOUDOPS]: {
    id: PolicyProfileId.CLOUDOPS,
    display_name: 'Cloud / DevOps',
    description: 'Zero tolerance for production credentials & strict relational network scrub',
    policy_modifier: 1.2,
    allow_internal_ips: false,
    strict_credentials: true,
  },
  [PolicyProfileId.OPENSOURCE]: {
    id: PolicyProfileId.OPENSOURCE,
    display_name: 'Public Open Source',
    description: 'Strict removal of all internal infrastructure, author PII, and credentials',
    policy_modifier: 1.5,
    allow_internal_ips: false,
    strict_credentials: true,
  },
  [PolicyProfileId.CYBERSECURITY]: {
    id: PolicyProfileId.CYBERSECURITY,
    display_name: 'Cybersecurity Lab',
    description: 'Permits technical stack frames and incident indicators; scrubs internal credentials',
    policy_modifier: 0.8,
    allow_internal_ips: true,
    strict_credentials: false,
  },
};

export const DESTINATIONS: Record<CanonicalDestination, DestinationContext> = {
  [CanonicalDestination.LOCAL_IDE]: {
    id: CanonicalDestination.LOCAL_IDE,
    display_name: 'Local IDE',
    subtitle: 'VS Code, bash terminal, local test harness',
    exposure_multiplier: 0.2,
  },
  [CanonicalDestination.INTERNAL_SYSTEM]: {
    id: CanonicalDestination.INTERNAL_SYSTEM,
    display_name: 'Internal System',
    subtitle: 'Internal Slack, Jira, corporate Confluence',
    exposure_multiplier: 0.6,
  },
  [CanonicalDestination.PUBLIC_AI]: {
    id: CanonicalDestination.PUBLIC_AI,
    display_name: 'Public AI Tool',
    subtitle: 'ChatGPT, Claude, external AI web paste',
    exposure_multiplier: 1.2,
  },
  [CanonicalDestination.PUBLIC_GITHUB]: {
    id: CanonicalDestination.PUBLIC_GITHUB,
    display_name: 'Public GitHub',
    subtitle: 'Public repo, pull request, public issue/gist',
    exposure_multiplier: 1.6,
  },
};

/**
 * Hard Security Rules: Deterministic Invariants that take precedence over numerical scores
 */
export function evaluateHardSecurityRules(
  findings: FindingMetadata[],
  destination: DestinationContext,
  _policy: PolicyProfile
): { hardDecision: RiskStatus | null; ruleTriggered: string | null } {
  // Hard Rule 1: Private key to external
  const hasPrivateKey = findings.some((f) => f.subcategory === 'PRIVATE_KEY');
  if (
    hasPrivateKey &&
    (destination.id === CanonicalDestination.PUBLIC_GITHUB ||
      destination.id === CanonicalDestination.PUBLIC_AI)
  ) {
    return {
      hardDecision: RiskStatus.BLOCK,
      ruleTriggered: 'Hard Rule 1: Private Key targeting Public Destination (Mandatory Block)',
    };
  }

  // Hard Rule 2: High severity secret (>=90) targeting Public GitHub
  const hasHighSecret = findings.some((f) => f.base_severity >= 90.0);
  if (hasHighSecret && destination.id === CanonicalDestination.PUBLIC_GITHUB) {
    return {
      hardDecision: RiskStatus.SANITIZE,
      ruleTriggered: 'Hard Rule 2: Critical Credential targeting Public GitHub (Mandatory Sanitize/Block)',
    };
  }

  // Hard Rule 3: Credential targeting Public AI Tool with sanitization available
  const hasAnySecret = findings.some((f) => f.category === 'SECRET');
  if (hasAnySecret && destination.id === CanonicalDestination.PUBLIC_AI) {
    return {
      hardDecision: RiskStatus.SANITIZE,
      ruleTriggered: 'Hard Rule 3: Credential targeting Public AI Tool (Mandatory Sanitize)',
    };
  }

  return { hardDecision: null, ruleTriggered: null };
}

/**
 * Explicit Mathematical Risk Formula:
 * BaseRisk = BaseSeverity * ContextModifier * OriginModifier * DestinationModifier * PolicyModifier
 * RiskScore = clamp(BaseRisk, 0, 100)
 */
export function evaluateRiskEngine(
  findings: FindingMetadata[],
  origin: OriginContext,
  destination: DestinationContext,
  policy: PolicyProfile
): RiskAssessment {
  const structuredReasons: string[] = [];

  if (findings.length === 0) {
    return {
      overall_score: 0,
      status: RiskStatus.ALLOW,
      hard_rule_triggered: null,
      findings_count: 0,
      score_breakdown: {
        content: 0,
        context: 1.0,
        origin: 1.0,
        destination: destination.exposure_multiplier,
        policy: policy.policy_modifier,
      },
      structured_reasons: ['No configured sensitive findings detected in evidence.'],
    };
  }

  // Check hard rules first
  const { hardDecision, ruleTriggered } = evaluateHardSecurityRules(findings, destination, policy);

  // Content Severity Calculation
  let sumWeightedContent = 0;
  for (const f of findings) {
    sumWeightedContent += f.base_severity * (f.context_modifier || 1.0);
  }
  const contentSeverity = Math.min(100.0, sumWeightedContent);

  // Origin Modifier
  let originModifier = 1.0;
  if (origin.is_test_file) originModifier = 0.3;
  else if (origin.source_type === 'ENV_FILE') originModifier = 1.3;
  else if (origin.source_type === 'LOG_FILE') originModifier = 1.15;
  else if (origin.source_type === 'SCREENSHOT') originModifier = 1.1;

  // Destination Modifier
  const destinationModifier = destination.exposure_multiplier;

  // Policy Modifier
  const policyModifier = policy.policy_modifier;

  // Formula Execution
  const baseRisk = contentSeverity * originModifier * destinationModifier * policyModifier;
  const clampedScore = Math.max(0.0, Math.min(100.0, Math.round(baseRisk * 10) / 10));

  // Determine Status based on Thresholds
  let status: RiskStatus = RiskStatus.ALLOW;
  if (clampedScore < 25.0) {
    status = RiskStatus.ALLOW;
  } else if (clampedScore < 50.0) {
    status = RiskStatus.REVIEW;
  } else if (clampedScore < 80.0) {
    status = RiskStatus.SANITIZE;
  } else {
    status = RiskStatus.BLOCK;
  }

  // Precedence hierarchy:
  // 1. Deterministic hard security rule
  // 2. Numerical/contextual risk calculation
  // 3. Normal decision threshold
  let finalStatus = status;
  if (hardDecision) {
    if (hardDecision === RiskStatus.BLOCK) {
      finalStatus = RiskStatus.BLOCK;
    } else if (hardDecision === RiskStatus.SANITIZE) {
      // Hard Rule 3 explicitly mandates SANITIZE for credentials targeting Public AI:
      // A deterministic hard rule takes precedence over numerical score.
      // For Hard Rule 2 (Public GitHub), the rule defines a floor of SANITIZE while allowing
      // numerical score >= 80 to enforce BLOCK for critical credentials exposed to public repos.
      if (destination.id === CanonicalDestination.PUBLIC_AI) {
        finalStatus = RiskStatus.SANITIZE;
      } else if (finalStatus !== RiskStatus.BLOCK) {
        finalStatus = RiskStatus.SANITIZE;
      }
    }
  }

  // Structured justifications for DecisionExplanationPanel ("WHY?")
  const secretsFound = findings.filter((f) => f.category === 'SECRET');
  const networkFound = findings.filter((f) => f.category === 'NETWORK');
  const piiFound = findings.filter((f) => f.category === 'PII');

  if (secretsFound.length > 0) {
    structuredReasons.push(`${secretsFound.length} credential/secret pattern(s) identified (Severity: High)`);
  }
  if (networkFound.length > 0) {
    structuredReasons.push(`${networkFound.length} internal infrastructure/network identifier(s) detected`);
  }
  if (piiFound.length > 0) {
    structuredReasons.push(`${piiFound.length} personal information record(s) flagged`);
  }
  structuredReasons.push(`Destination exposure: ${destination.display_name} (${destinationModifier}x multiplier)`);
  structuredReasons.push(`Policy profile applied: ${policy.display_name} (${policyModifier}x modifier)`);

  if (ruleTriggered) {
    structuredReasons.unshift(`Active Hard Security Rule: ${ruleTriggered}`);
  }

  return {
    overall_score: clampedScore,
    status: finalStatus,
    hard_rule_triggered: ruleTriggered,
    findings_count: findings.length,
    score_breakdown: {
      content: Math.round(contentSeverity),
      context: 1.0,
      origin: originModifier,
      destination: destinationModifier,
      policy: policyModifier,
    },
    structured_reasons: structuredReasons,
  };
}
