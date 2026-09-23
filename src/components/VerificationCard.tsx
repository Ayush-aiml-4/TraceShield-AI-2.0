import React from 'react';
import { ReleaseStatus, RiskStatus, VerificationResult } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ShieldBan, Shield } from 'lucide-react';

interface VerificationCardProps {
  verification: VerificationResult | null;
  riskStatus: RiskStatus;
  releaseStatus: ReleaseStatus;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  verification,
  riskStatus,
  releaseStatus,
}) => {
  const isBlock = riskStatus === RiskStatus.BLOCK;

  if (!verification) {
    if (riskStatus === RiskStatus.ALLOW) {
      return (
        <div className="rounded-xl border border-emerald-900/40 bg-[#10131a]/95 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1e222d] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800/60 bg-[#0e2017] text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                    CLEAN TECHNICAL EVIDENCE
                  </h3>
                  <span className="rounded border border-zinc-800 bg-[#0a0c12] px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                    Rescan: Bypass
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Zero sensitive parameters detected. Input is certified safe for canonical release.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="inline-flex items-center gap-1 rounded border border-emerald-800/60 bg-[#0e2017] px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-300">
                <span className="opacity-60 text-[10px]">RELEASE:</span>
                <span>{releaseStatus}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Fast Exit Verified</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/95 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
            <span>Independent closed-loop verification rescan executes after sanitization.</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-[#0c0e14] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            <span className="opacity-60 text-[9px]">RELEASE:</span>
            <span>{releaseStatus}</span>
          </div>
        </div>
      </div>
    );
  }

  const { passed, checks_summary, failure_reason, execution_time_ms } = verification;

  return (
    <div
      className={`rounded-xl border p-4 shadow-xs transition-colors ${
        !passed
          ? 'border-amber-900/60 bg-[#12141c]'
          : isBlock
          ? 'border-rose-900/50 bg-[#10131a]'
          : 'border-emerald-900/40 bg-[#10131a]'
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b pb-3 border-[#1e222d]">
        <div className="flex items-center gap-3">
          {passed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-800/60 bg-[#0e2017] text-emerald-400 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-800/60 bg-[#22160d] text-amber-400 shadow-xs">
              <ShieldAlert className="h-6 w-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium">
                INDEPENDENT VERIFICATION
              </span>
              <span className="rounded border border-zinc-800 bg-[#0a0c12] px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                Rescan: {execution_time_ms} ms CPU
              </span>
            </div>
            <div
              className={`text-sm font-mono font-bold tracking-tight ${
                passed ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {passed ? 'VERIFICATION PASSED' : 'VERIFICATION HOLD'}
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5 leading-snug">
              {passed
                ? 'Deterministic rescan confirmed zero residual secrets or raw token bleeding.'
                : 'Residual sensitive tokens or validation defects detected. Release suspended.'}
            </p>
          </div>
        </div>

        {/* Dedicated Release Status Badge */}
        <div className="flex flex-col items-end gap-1">
          <div
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-mono font-bold ${
              releaseStatus === ReleaseStatus.BLOCKED
                ? 'border-rose-900/70 bg-[#220d13] text-rose-300'
                : releaseStatus === ReleaseStatus.ALLOWED
                ? 'border-emerald-800/60 bg-[#0e2017] text-emerald-300'
                : 'border-amber-800/60 bg-[#22160d] text-amber-300'
            }`}
          >
            <span className="opacity-60 text-[10px]">RELEASE:</span>
            <span>{releaseStatus}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {isBlock
              ? 'Policy Egress Blocked'
              : passed
              ? '4/4 Checks Clean'
              : 'Audit Discrepancy'}
          </span>
        </div>
      </div>

      {/* Critical Release Block Warning when verification passed but risk is BLOCK */}
      {isBlock && passed && (
        <div className="mt-3 rounded border border-rose-900/60 bg-[#1c0c11] p-2.5 text-xs text-rose-200">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-400">
            <ShieldBan className="h-3.5 w-3.5 shrink-0" />
            <span>SECURITY POLICY RESTRICTION</span>
          </div>
          <div className="mt-0.5 text-xs font-mono text-rose-200/90">
            VERIFICATION PASSED • RELEASE BLOCKED BY SECURITY POLICY
          </div>
        </div>
      )}

      {/* 4-Point Independent Audit Checks */}
      <div className="mt-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
          Independent Closed-Loop Audit Checks
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs font-mono">
          <div className="flex items-center gap-2 rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
            {checks_summary.no_residual_secrets ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Secrets Rescan</span>
              <span
                className={`text-[11px] font-bold ${
                  checks_summary.no_residual_secrets ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {checks_summary.no_residual_secrets ? 'CLEAN' : 'FAILED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
            {checks_summary.no_raw_tokens_bleed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Token Bleed</span>
              <span
                className={`text-[11px] font-bold ${
                  checks_summary.no_raw_tokens_bleed ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {checks_summary.no_raw_tokens_bleed ? 'ZERO' : 'DETECTED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
            {checks_summary.no_residual_pii ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">PII Scrub</span>
              <span
                className={`text-[11px] font-bold ${
                  checks_summary.no_residual_pii ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {checks_summary.no_residual_pii ? 'CONFIRMED' : 'FAILED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
            {checks_summary.no_entropy_anomalies ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Entropy Check</span>
              <span
                className={`text-[11px] font-bold ${
                  checks_summary.no_entropy_anomalies ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {checks_summary.no_entropy_anomalies ? 'VERIFIED' : 'ANOMALY'}
              </span>
            </div>
          </div>
        </div>

        {/* Quarantine reason if failed */}
        {!passed && failure_reason && (
          <div className="mt-2.5 rounded border border-amber-900/60 bg-[#22160d] p-2 text-xs font-mono text-amber-200">
            <span className="font-bold text-amber-300">Quarantine Reason: </span>
            <span>{failure_reason}</span>
          </div>
        )}
      </div>
    </div>
  );
};

