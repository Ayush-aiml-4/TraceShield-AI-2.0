import React, { useState } from 'react';
import { SanitizationResult, VerificationResult, ReleaseStatus } from '../types';
import {
  FileCode2,
  Copy,
  Check,
  ShieldBan,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface TransformationWorkspaceProps {
  originalPreview: string;
  sanitization: SanitizationResult | null;
  verification: VerificationResult | null;
  releaseStatus: ReleaseStatus;
  verifiedSafeText?: string | null;
}

export const TransformationWorkspace: React.FC<TransformationWorkspaceProps> = ({
  originalPreview,
  sanitization,
  verification,
  releaseStatus,
  verifiedSafeText,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullDiff, setShowFullDiff] = useState<boolean>(false);
  const [showDictionary, setShowDictionary] = useState<boolean>(false);

  const isCopyAllowed = releaseStatus === ReleaseStatus.ALLOWED && !!verifiedSafeText;
  const isBlockedOrHeld = !isCopyAllowed;
  const isSanitized = sanitization !== null && sanitization.tokens_replaced > 0;
  const isVerifiedPassed = verification?.passed === true;

  const handleCopySafe = async () => {
    if (!isCopyAllowed || !verifiedSafeText) return;
    try {
      await navigator.clipboard.writeText(verifiedSafeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Browser permissions fallback
    }
  };

  const displayText = sanitization?.sanitized_text || originalPreview;

  return (
    <div className="relative group">
      {/* Subtle local teal atmosphere when sanitization is active (not heavy neon) */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-teal-900/[0.08] to-transparent blur-xl pointer-events-none opacity-60 transition-opacity duration-300" />

      <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D1118]/75 p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all">
        {/* Subtle white top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        {/* Title & Release Gate Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#141A23] text-[#B7C0CB]">
                <FileCode2 className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B7C0CB]">
                Evidence Transformation
              </h2>
              <InfoPopover
                title="Evidence Transformation"
                description="Replaces sensitive tokens with consistent relational placeholders while preserving syntax structure, stack traces, and technical readability."
              />
            </div>
            <p className="text-[11px] text-[#7D8794] mt-1 font-sans">
              Maintain operational utility while eliminating release liabilities.
            </p>
          </div>

          {/* Release Status & Primary Release Action */}
          <div className="flex items-center gap-3">
            {releaseStatus === ReleaseStatus.BLOCKED && (
              <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-[#250810] px-3.5 py-1.5 font-sans text-xs font-medium text-rose-200">
                <ShieldBan className="h-3.5 w-3.5 text-rose-400" />
                <span>Export Blocked by Policy</span>
                <InfoPopover
                  title="Export Gating Enforced"
                  description="TraceShield halts release to protect against critical exposure according to destination risk rules."
                />
              </div>
            )}

            {releaseStatus === ReleaseStatus.VERIFICATION_HOLD && (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-[#251b08] px-3.5 py-1.5 font-sans text-xs font-medium text-amber-200">
                <ShieldBan className="h-3.5 w-3.5 text-amber-400" />
                <span>Verification Hold Active</span>
                <InfoPopover
                  title="Verification Hold Enforced"
                  description="Sanitization verifier caught residual findings or anomalies. Content release is held."
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleCopySafe}
              disabled={isBlockedOrHeld}
              aria-label={isBlockedOrHeld ? 'Release restricted by policy or verification hold' : 'Copy protected evidence to clipboard'}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 ${
                isBlockedOrHeld
                  ? 'border border-white/[0.06] bg-[#141A23]/50 text-[#7D8794] cursor-not-allowed'
                  : copied
                  ? 'border border-emerald-500/50 bg-[#0C2417] text-emerald-200'
                  : 'border border-white/15 bg-[#181F29] hover:bg-[#1E2734] hover:border-white/25 text-[#F2F5F8] cursor-pointer'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Copied Protected Evidence</span>
                </>
              ) : isBlockedOrHeld ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-[#7D8794]" />
                  <span>Release Restricted</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#B7C0CB]" />
                  <span>Copy Protected Evidence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transformation Highlights Summary Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#141A23]/80 px-4 py-2 text-xs font-sans">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-medium text-[#F2F5F8]">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>
                {isSanitized
                  ? `${sanitization.tokens_replaced} sensitive values protected`
                  : 'No sensitive tokens detected for redaction'}
              </span>
            </span>
            {isSanitized && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-[#7D8794] font-mono text-[11px]">
                  Execution: {sanitization.execution_time_ms.toFixed(1)} ms CPU
                </span>
              </>
            )}
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-2">
            {isSanitized && (
              <button
                type="button"
                onClick={() => setShowDictionary(!showDictionary)}
                aria-expanded={showDictionary}
                aria-label="Toggle transformation map"
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-sans transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 ${
                  showDictionary
                    ? 'border-white/25 bg-[#181F29] text-[#F2F5F8]'
                    : 'border-white/[0.08] bg-[#141A23] text-[#B7C0CB] hover:bg-[#181F29] hover:text-[#F2F5F8]'
                }`}
              >
                <Layers className="h-3 w-3 text-[#7D8794]" />
                <span>Transformation Map</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFullDiff(!showFullDiff)}
              aria-label="Toggle comparison view"
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-sans transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 ${
                showFullDiff
                  ? 'border-white/25 bg-[#181F29] text-[#F2F5F8]'
                  : 'border-white/[0.08] bg-[#141A23] text-[#B7C0CB] hover:bg-[#181F29] hover:text-[#F2F5F8]'
              }`}
            >
              <Eye className="h-3 w-3 text-[#7D8794]" />
              <span>{showFullDiff ? 'Simple View' : 'Side-by-Side Comparison'}</span>
            </button>
          </div>
        </div>

        {/* Ephemeral Relational Dictionary (Progressive Disclosure) */}
        {showDictionary && isSanitized && sanitization.safe_mappings && (
          <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0E1520] p-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2 text-[#F2F5F8] font-semibold">
              <span className="text-[11px] uppercase tracking-wider text-[#B7C0CB]">
                Ephemeral Redaction Mappings
              </span>
              <InfoPopover
                title="Ephemeral Dictionary"
                description="Relational tokens maintain structural consistency without retaining unhashed raw values in memory."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
              {sanitization.safe_mappings.map((mapping, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#05070B] px-2.5 py-1.5"
                >
                  <span className="text-[#7D8794] truncate max-w-[150px]">{mapping.original_type}</span>
                  <ArrowRight className="h-3 w-3 text-[#7D8794] shrink-0" />
                  <span className="text-teal-300 font-medium truncate max-w-[170px]">{mapping.replacement_token}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary View: Single Clean View OR Full Side-by-Side Diff */}
        {!showFullDiff ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B7C0CB]">
                Protected Technical Output
              </span>
              <span className="text-[11px] font-sans text-[#7D8794]">
                Ready for release • Syntax Intact
              </span>
            </div>
            <div className="relative rounded-xl border border-white/[0.06] bg-[#05070B] shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] p-4 font-mono text-xs text-[#F2F5F8] leading-relaxed overflow-x-auto max-h-64">
              <pre className="whitespace-pre-wrap font-mono text-[#F2F5F8]">{displayText}</pre>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Original Evidence (Redacted/Filtered View) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-rose-300">
                  Raw Original Input
                </span>
                <span className="text-[11px] font-sans text-[#7D8794]">Contains Sensitive Spans</span>
              </div>
              <div className="rounded-xl border border-rose-950/40 bg-[#070305] shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] p-4 font-mono text-xs text-[#B7C0CB] leading-relaxed overflow-x-auto max-h-64">
                <pre className="whitespace-pre-wrap font-mono text-[#B7C0CB]">{originalPreview}</pre>
              </div>
            </div>

            {/* Sanitized Output */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-teal-300">
                  Protected Evidence
                </span>
                <span className="text-[11px] font-sans text-[#7D8794]">Relational Token Injection</span>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#05070B] shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] p-4 font-mono text-xs text-[#F2F5F8] leading-relaxed overflow-x-auto max-h-64">
                <pre className="whitespace-pre-wrap font-mono text-[#F2F5F8]">{displayText}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
