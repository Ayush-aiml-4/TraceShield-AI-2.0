import React, { useState } from 'react';
import { ReleaseStatus, RiskStatus, SanitizationResult, VerificationResult } from '../types';
import { Copy, Check, ShieldCheck, AlertOctagon, ArrowRight, Code, Lock, ShieldBan, FileCode2 } from 'lucide-react';

interface DiffViewerProps {
  originalPreview: string;
  sanitization: SanitizationResult | null;
  verification: VerificationResult | null;
  verifiedSafeText: string | null;
  riskStatus: RiskStatus;
  releaseStatus: ReleaseStatus;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalPreview,
  sanitization,
  verification,
  verifiedSafeText,
  riskStatus,
  releaseStatus,
}) => {
  const [copied, setCopied] = useState(false);

  // Release permission strictly requires BOTH verification pass AND finalDecision !== BLOCK
  const isCopyAllowed = releaseStatus === ReleaseStatus.ALLOWED && !!verifiedSafeText;

  const handleCopy = () => {
    if (!isCopyAllowed || !verifiedSafeText) return;
    navigator.clipboard.writeText(verifiedSafeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/95 p-4 shadow-xs">
      {/* Title & Release / Copy Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e222d] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-zinc-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              Evidence Transformation & Verified Buffer
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Preserves relational syntax structure; audited by independent rescan prior to release.
          </p>
        </div>

        {/* Release Status Badge & Copy Action */}
        <div className="flex items-center gap-2">
          {releaseStatus === ReleaseStatus.BLOCKED && (
            <span className="inline-flex items-center gap-1.5 rounded border border-rose-900/70 bg-[#220d13] px-2.5 py-1 text-[11px] font-mono font-bold text-rose-300">
              <ShieldBan className="h-3.5 w-3.5 text-rose-400" />
              <span>RELEASE BLOCKED</span>
            </span>
          )}
          {releaseStatus === ReleaseStatus.VERIFICATION_HOLD && (
            <span className="inline-flex items-center gap-1.5 rounded border border-amber-800/60 bg-[#22160d] px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300">
              <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
              <span>VERIFICATION HOLD</span>
            </span>
          )}
          {releaseStatus === ReleaseStatus.ALLOWED && (
            <span className="inline-flex items-center gap-1.5 rounded border border-emerald-800/60 bg-[#0e2017] px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>RELEASE ALLOWED</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            disabled={!isCopyAllowed}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
              isCopyAllowed
                ? 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95'
                : 'cursor-not-allowed bg-zinc-900 text-zinc-600 border border-zinc-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : isCopyAllowed ? (
              <>
                <Copy className="h-4 w-4" />
                <span>COPY VERIFIED BUFFER</span>
              </>
            ) : releaseStatus === ReleaseStatus.BLOCKED ? (
              <>
                <ShieldBan className="h-4 w-4 text-rose-400" />
                <span>EGRESS BLOCKED</span>
              </>
            ) : (
              <>
                <AlertOctagon className="h-4 w-4 text-amber-400" />
                <span>HOLD (VERIFYING)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Relational Token Legend */}
      {sanitization && sanitization.safe_mappings && sanitization.safe_mappings.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#1e222d] bg-[#0c0e14] p-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-300 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-zinc-400" />
              <span>Ephemeral Relational Replacement Dictionary</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-normal">
              {sanitization.tokens_replaced} spans safely transformed
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sanitization.safe_mappings.map((entry, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded border border-[#232a3b] bg-[#101420] px-2 py-0.5 text-[11px] font-mono"
              >
                <span className="text-zinc-400 font-sans text-[10px]">
                  {entry.original_type}
                </span>
                <ArrowRight className="h-3 w-3 text-zinc-500" />
                <span className="font-bold text-zinc-200">{entry.replacement_token}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Diff Windows */}
      <div className="mt-3.5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Left: Raw Evidence */}
        <div className="flex flex-col rounded-lg border border-[#1e222d] bg-[#0a0c12]">
          <div className="flex items-center justify-between border-b border-[#1e222d] bg-[#10131a] px-3 py-1.5 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-semibold text-zinc-200">Raw Evidence (Protected Preview)</span>
            </div>
            <span className="text-[10px] text-zinc-500">{originalPreview.length} bytes</span>
          </div>
          <pre className="max-h-64 min-h-40 overflow-auto p-3 font-mono text-xs text-zinc-300 whitespace-pre-wrap select-text leading-relaxed">
            {originalPreview || '// Paste or load evidence to begin analysis'}
          </pre>
        </div>

        {/* Right: Sanitized / Release Candidate */}
        <div
          className={`flex flex-col rounded-lg border ${
            releaseStatus === ReleaseStatus.BLOCKED
              ? 'border-rose-900/50 bg-[#0a0c12]'
              : verification?.passed
              ? 'border-emerald-900/40 bg-[#0a0c12]'
              : verification?.passed === false
              ? 'border-amber-900/50 bg-[#0a0c12]'
              : 'border-[#1e222d] bg-[#0a0c12]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#1e222d] bg-[#10131a] px-3 py-1.5 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5">
              {releaseStatus === ReleaseStatus.BLOCKED ? (
                <ShieldBan className="h-3.5 w-3.5 text-rose-400" />
              ) : verification?.passed ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              ) : verification?.passed === false ? (
                <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span className="font-semibold text-zinc-200">
                {releaseStatus === ReleaseStatus.BLOCKED
                  ? 'Sanitized Preview (Release Blocked)'
                  : 'Sanitized & Rescanned Release Candidate'}
              </span>
            </div>
            {sanitization && (
              <span className="text-[10px] font-mono text-zinc-400 font-medium">
                {sanitization.tokens_replaced} tokens replaced
              </span>
            )}
          </div>
          <pre
            className={`max-h-64 min-h-40 overflow-auto p-3 font-mono text-xs whitespace-pre-wrap select-text leading-relaxed ${
              releaseStatus === ReleaseStatus.BLOCKED
                ? 'text-rose-300/80'
                : 'text-zinc-200'
            }`}
          >
            {sanitization?.sanitized_text || originalPreview || '// Sanitized output will appear here'}
          </pre>
        </div>
      </div>
    </div>
  );
};

