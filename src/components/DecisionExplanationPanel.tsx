import React from 'react';
import { ReleaseStatus, RiskAssessment, RiskStatus } from '../types';
import { AlertOctagon, CheckCircle2, ShieldBan, ShieldCheck, HelpCircle, Shield, AlertTriangle } from 'lucide-react';

interface DecisionExplanationPanelProps {
  risk: RiskAssessment;
  releaseStatus?: ReleaseStatus;
}

export const DecisionExplanationPanel: React.FC<DecisionExplanationPanelProps> = ({
  risk,
  releaseStatus,
}) => {
  const getDecisionVisuals = (status: RiskStatus) => {
    switch (status) {
      case RiskStatus.ALLOW:
        return {
          label: 'ALLOW',
          sub: 'Zero sensitive credentials or high-entropy tokens detected.',
          accentColor: 'text-emerald-400',
          badgeStyle: 'border-emerald-800/60 bg-[#0e2017] text-emerald-300',
          containerBorder: 'border-emerald-900/40',
          barColor: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case RiskStatus.REVIEW:
        return {
          label: 'REVIEW',
          sub: 'Moderate sensitivity or ambiguous tokens require engineer sign-off.',
          accentColor: 'text-amber-400',
          badgeStyle: 'border-amber-800/60 bg-[#22160d] text-amber-300',
          containerBorder: 'border-amber-900/40',
          barColor: 'bg-amber-500',
          icon: HelpCircle,
        };
      case RiskStatus.SANITIZE:
        return {
          label: 'SANITIZE',
          sub: 'Sensitive parameters detected; deterministic redaction available.',
          accentColor: 'text-cyan-400',
          badgeStyle: 'border-cyan-800/60 bg-[#0c1c24] text-cyan-300',
          containerBorder: 'border-cyan-900/40',
          barColor: 'bg-cyan-500',
          icon: ShieldCheck,
        };
      case RiskStatus.BLOCK:
        return {
          label: 'BLOCK',
          sub: 'Critical policy violation or credential targeting public egress.',
          accentColor: 'text-rose-400',
          badgeStyle: 'border-rose-900/70 bg-[#220d13] text-rose-300',
          containerBorder: 'border-rose-900/50',
          barColor: 'bg-rose-500',
          icon: ShieldBan,
        };
    }
  };

  const decisionVisual = getDecisionVisuals(risk.status);
  const StatusIcon = decisionVisual.icon;

  const contentPct = Math.min(100, Math.max(5, risk.score_breakdown.content));
  const originPct = Math.min(100, Math.round((risk.score_breakdown.origin / 1.5) * 100));
  const destPct = Math.min(100, Math.round((risk.score_breakdown.destination / 1.5) * 100));
  const policyPct = Math.min(100, Math.round((risk.score_breakdown.policy / 1.5) * 100));

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/95 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1e222d] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Security Adjudication
            </span>
          </div>

          {releaseStatus && (
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
          )}
        </div>

        {/* Hero Decision Centerpiece */}
        <div className={`mt-4 rounded-lg border ${decisionVisual.containerBorder} bg-[#0a0c12] p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg border ${decisionVisual.badgeStyle} shadow-xs`}
              >
                <StatusIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium">
                  Primary Adjudication
                </div>
                <div className={`text-3xl font-black font-mono tracking-tight ${decisionVisual.accentColor}`}>
                  {decisionVisual.label}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Risk Score</div>
              <div className={`text-3xl font-black font-mono ${decisionVisual.accentColor}`}>
                {risk.overall_score}
                <span className="text-sm font-normal text-zinc-600">/100</span>
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-zinc-300 leading-snug">
            {decisionVisual.sub}
          </p>

          {/* Hard Rule Display */}
          {risk.hard_rule_triggered && (
            <div className="mt-3 rounded border border-rose-900/70 bg-[#220d13] p-2.5 text-xs text-rose-200">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wide text-rose-400">
                <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                <span>HARD RULE TRIGGERED</span>
              </div>
              <div className="mt-1 font-mono font-semibold text-rose-200 text-xs">
                {risk.hard_rule_triggered}
              </div>
            </div>
          )}
        </div>

        {/* Structured Factual Reasons */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400">
              Audit Findings & Rationale
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {risk.findings_count} {risk.findings_count === 1 ? 'Finding' : 'Findings'} Detected
            </span>
          </div>

          <ul className="space-y-1.5">
            {risk.structured_reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded border border-[#1b1f2b] bg-[#0c0e14] px-3 py-2 text-xs text-zinc-300"
              >
                <span className="mt-0.5 text-zinc-500 font-mono font-bold text-[10px]">›</span>
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Signal Breakdown Meter */}
      <div className="mt-4 border-t border-[#1e222d] pt-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
          Signal Component Breakdown
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="rounded border border-[#1c202c] bg-[#0c0e14] p-2">
            <div className="flex justify-between text-zinc-400 mb-1 text-[10px]">
              <span>CONTENT</span>
              <span className="text-zinc-200 font-bold">{risk.score_breakdown.content}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className={`h-full ${decisionVisual.barColor}`} style={{ width: `${contentPct}%` }} />
            </div>
          </div>

          <div className="rounded border border-[#1c202c] bg-[#0c0e14] p-2">
            <div className="flex justify-between text-zinc-400 mb-1 text-[10px]">
              <span>ORIGIN</span>
              <span className="text-zinc-200 font-bold">{risk.score_breakdown.origin}x</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-400" style={{ width: `${originPct}%` }} />
            </div>
          </div>

          <div className="rounded border border-[#1c202c] bg-[#0c0e14] p-2">
            <div className="flex justify-between text-zinc-400 mb-1 text-[10px]">
              <span>DESTINATION</span>
              <span className="text-zinc-200 font-bold">{risk.score_breakdown.destination}x</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-400" style={{ width: `${destPct}%` }} />
            </div>
          </div>

          <div className="rounded border border-[#1c202c] bg-[#0c0e14] p-2">
            <div className="flex justify-between text-zinc-400 mb-1 text-[10px]">
              <span>POLICY</span>
              <span className="text-zinc-200 font-bold">{risk.score_breakdown.policy}x</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-400" style={{ width: `${policyPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


