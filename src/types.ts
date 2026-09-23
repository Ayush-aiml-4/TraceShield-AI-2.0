export enum EntityCategory {
  SECRET = 'SECRET',
  NETWORK = 'NETWORK',
  PII = 'PII',
  TECHNICAL = 'TECHNICAL',
}

export enum RiskStatus {
  ALLOW = 'ALLOW',
  REVIEW = 'REVIEW',
  SANITIZE = 'SANITIZE',
  BLOCK = 'BLOCK',
}

export enum ReleaseStatus {
  ALLOWED = 'ALLOWED',
  BLOCKED = 'BLOCKED',
  VERIFICATION_HOLD = 'VERIFICATION HOLD',
}

export enum ExecutionBackend {
  QNN_NPU = 'QNN_NPU',
  DIRECTML = 'DIRECTML',
  CPU = 'CPU',
  MOCK = 'MOCK',
  UNVALIDATED = 'UNVALIDATED',
}

export enum HardwarePlatform {
  SNAPDRAGON_X_ELITE = 'Snapdragon_X_Elite',
  SNAPDRAGON_X_PLUS = 'Snapdragon_X_Plus',
  OTHER = 'Other',
}

export enum CanonicalDestination {
  LOCAL_IDE = 'LOCAL_IDE',
  INTERNAL_SYSTEM = 'INTERNAL_SYSTEM',
  PUBLIC_AI = 'PUBLIC_AI',
  PUBLIC_GITHUB = 'PUBLIC_GITHUB',
}

export enum PolicyProfileId {
  CLOUDOPS = 'CLOUDOPS',
  OPENSOURCE = 'OPENSOURCE',
  CYBERSECURITY = 'CYBERSECURITY',
}

// LAYER A: Safe-to-log structured finding metadata (No raw secrets!)
export interface FindingMetadata {
  id: string;
  category: EntityCategory;
  subcategory: string;
  start: number;
  end: number;
  confidence: number;
  entropy: number;
  base_severity: number;
  context_modifier: number;
  context_rationale: string;
  is_ambiguous: boolean;
  ai_context_applied: boolean;
  replacement_preview?: string;
}

// LAYER B: Transient in-memory processing object
export interface SensitiveMatch {
  metadata: FindingMetadata;
  raw_value: string; // Ephemeral; never put in telemetry or logs
}

export interface OriginContext {
  source_type: 'CLIPBOARD' | 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE' | 'ENV_FILE' | 'UNKNOWN';
  file_name?: string;
  is_test_file: boolean;
}

export interface DestinationContext {
  id: CanonicalDestination;
  display_name: string;
  subtitle: string;
  exposure_multiplier: number;
}

export interface PolicyProfile {
  id: PolicyProfileId;
  display_name: string;
  description: string;
  policy_modifier: number;
  allow_internal_ips: boolean;
  strict_credentials: boolean;
}

export interface RiskAssessment {
  overall_score: number;
  status: RiskStatus;
  hard_rule_triggered: string | null;
  findings_count: number;
  score_breakdown: {
    content: number;
    context: number;
    origin: number;
    destination: number;
    policy: number;
  };
  structured_reasons: string[];
}

export interface SafeMappingEntry {
  original_type: string;
  replacement_token: string;
}

export interface SanitizationResult {
  original_length: number;
  sanitized_text: string;
  tokens_replaced: number;
  relational_map: Record<string, string>;
  safe_mappings: SafeMappingEntry[];
  execution_time_ms: number;
}

export interface VerificationResult {
  passed: boolean;
  residual_findings_detected: string[];
  entropy_violations_detected: string[];
  syntax_valid: boolean;
  leak_detected: boolean;
  failure_reason: string | null;
  checks_summary: {
    no_residual_secrets: boolean;
    no_residual_pii: boolean;
    no_raw_tokens_bleed: boolean;
    no_entropy_anomalies: boolean;
    syntax_integrity: boolean;
  };
  execution_time_ms: number;
}

export interface TelemetryRecord {
  prefilter_latency_ms: number | null;
  ai_invoked: boolean;
  ai_latency_ms: number | null;
  ai_reason?: string;
  sanitization_latency_ms: number | null;
  verification_latency_ms: number | null;
  total_pipeline_latency_ms: number | null;
  hardware_platform: HardwarePlatform;
  execution_backend: ExecutionBackend;
  qnn_validated: boolean;
  backend_display: string;
  js_heap_mb: number | null;
  peak_memory_mb: number | null;
  network_instrumented: boolean;
  outbound_network_bytes: number | null;
  outbound_network_requests: number | null;
}

export interface PipelineResult {
  input_type: string;
  original_content_available: boolean;
  original_preview: string;
  risk: RiskAssessment;
  findings_metadata: FindingMetadata[];
  sanitization: SanitizationResult | null;
  verification: VerificationResult | null;
  verified_safe_text: string | null;
  release_status: ReleaseStatus;
  release_status_reason: string;
  telemetry: TelemetryRecord;
  error?: string | null;
}
