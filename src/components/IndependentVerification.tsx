import React, { useState } from 'react';
import { VerificationResult, ReleaseStatus, RiskStatus } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface IndependentVerificationProps {
  verification: VerificationResult | null;
  riskStatus: RiskStatus;
  releaseStatus: ReleaseStatus;
}

export const IndependentVerification: React.FC<IndependentVerificationProps> = ({
  verification,
  riskStatus,
  releaseStatus,
}) => {
  const [showDetailedChecks, setShowDetailedChecks] = useState<boolean>(false);

  if (!verification) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d121c]/90 p-5 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Independent verification will execute following transformation.</span>
        </div>
      </div>
    );
  }

  const {
    passed,
    residual_findings_detected,
    entropy_violations_detected,
    syntax_valid,
    leak_detected,
    failure_reason,
    checks_summary,
    execution_time_ms,
  } = verification;

  const isBlock = releaseStatus === ReleaseStatus.BLOCKED;

  return (
    <div className="relative">
      {/* Enterprise Audit Seal Container: Subordinate to Decision Hero, Calm Smoked Glass */}
      <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D1118]/75 p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all">
        {/* Subtle white top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        {/* Top Banner & Audit Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#141A23] text-emerald-400">
              {passed ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B7C0CB]">
                  Independent Verification
                </span>
                <InfoPopover
                  title="Independent Verification"
                  description="Scan the protected result again before release. Performs second-pass pattern matching, token bleed tests, entropy auditing, and AST syntax validation."
                />
                <span className="rounded-md border border-white/[0.08] bg-[#141A23] px-2 py-0.5 text-[10px] font-mono text-[#7D8794]">
                  Rescan: {execution_time_ms.toFixed(1)} ms CPU
                </span>
              </div>
              <div className="text-lg sm:text-xl font-sans font-bold tracking-tight mt-0.5 text-[#F2F5F8]">
                {passed ? 'Verification Passed' : 'Verification Hold'}
              </div>
              <p className="text-[11px] text-[#7D8794] mt-0.5 font-sans">
                Deterministic post-transformation audit before destination dispatch.
              </p>
            </div>
          </div>

          {/* Release Gate Indicator - Quiet Audit Badge */}
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#7D8794]">Gating Status</div>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              {isBlock ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-[#250810] px-3 py-1 text-xs font-sans font-medium text-rose-200">
                  <Lock className="h-3 w-3 text-rose-400" />
                  <span>Release Blocked by Policy</span>
                </div>
              ) : passed ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-[#0C2417] px-3 py-1 text-xs font-sans font-medium text-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Release Authorized</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-[#261A0A] px-3 py-1 text-xs font-sans font-medium text-amber-200">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  <span>Release on Hold</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4-Point High-Level Precision Instrument Indicators */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
          {/* Check 1 */}
          <div className="rounded-xl border border-white/[0.06] bg-[#141A23]/70 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB] text-[11px] font-medium">No Raw Secrets</span>
              {checks_summary.no_residual_secrets ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#7D8794] mt-1">
              {checks_summary.no_residual_secrets ? '0 Found ✓' : 'Detected !'}
            </div>
          </div>

          {/* Check 2 */}
          <div className="rounded-xl border border-white/[0.06] bg-[#141A23]/70 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB] text-[11px] font-medium">No Token Bleed</span>
              {checks_summary.no_raw_tokens_bleed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#7D8794] mt-1">
              {checks_summary.no_raw_tokens_bleed ? 'Clean Isolation ✓' : 'Bleed Found !'}
            </div>
          </div>

          {/* Check 3 */}
          <div className="rounded-xl border border-white/[0.06] bg-[#141A23]/70 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB] text-[11px] font-medium">Entropy Audit</span>
              {checks_summary.no_residual_pii ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#7D8794] mt-1">
              {checks_summary.no_residual_pii ? 'Clean Entropy ✓' : 'Anomalous !'}
            </div>
          </div>

          {/* Check 4 */}
          <div className="rounded-xl border border-white/[0.06] bg-[#141A23]/70 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB] text-[11px] font-medium">Format Preserved</span>
              {checks_summary.syntax_integrity ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#7D8794] mt-1">
              {checks_summary.syntax_integrity ? 'Valid Syntax ✓' : 'Malformed'}
            </div>
          </div>
        </div>

        {/* Failure Explanation Banner if held */}
        {!passed && failure_reason && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-[#1E1508] p-3.5 text-xs font-sans text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Independent Verification Reason:</span>
            </div>
            <p className="mt-1 text-amber-200/90 leading-relaxed">{failure_reason}</p>
          </div>
        )}

        {/* Detailed Findings Collapsible Toggle */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-sans">
          <button
            type="button"
            onClick={() => setShowDetailedChecks(!showDetailedChecks)}
            aria-expanded={showDetailedChecks}
            aria-label="Toggle independent verification audit details"
            className="flex items-center gap-1 text-[#7D8794] hover:text-[#B7C0CB] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 rounded px-1"
          >
            <span>{showDetailedChecks ? 'Hide Verification Audit Details' : 'View Verification Audit Details'}</span>
            {showDetailedChecks ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <span className="text-[11px] text-[#7D8794] font-mono">Deterministic Verification</span>
        </div>

        {/* Collapsible Detailed Audit Table */}
        {showDetailedChecks && (
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#05070B] p-4 text-xs font-sans space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] text-[#7D8794] font-medium">
              <span>Audit Metric</span>
              <span>Result</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB]">Entropy Anomalies (Shannon Entropy Check)</span>
              <span className="text-[#F2F5F8] font-mono font-medium">
                {entropy_violations_detected.length === 0
                  ? 'None (Clean)'
                  : `${entropy_violations_detected.length} anomalous strings`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB]">Residual Raw Spans Audit</span>
              <span className="text-[#F2F5F8] font-mono font-medium">
                {residual_findings_detected.length === 0
                  ? '0 unredacted spans'
                  : residual_findings_detected.join(', ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB]">Syntax AST Structure</span>
              <span className="text-[#F2F5F8] font-mono font-medium">
                {syntax_valid ? 'Valid Syntax Verified' : 'Parsing Warning'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#B7C0CB]">Leak Detected Flag</span>
              <span
                className={`font-mono font-medium ${
                  leak_detected ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {leak_detected ? 'LEAK DETECTED' : 'CLEAR'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
