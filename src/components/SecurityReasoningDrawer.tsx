import React, { useEffect } from 'react';
import { RiskAssessment } from '../types';
import { X, ShieldAlert, Scale, AlertOctagon, CheckCircle, Info } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface SecurityReasoningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskAssessment;
  destinationDisplayName: string;
  policyDisplayName: string;
}

export const SecurityReasoningDrawer: React.FC<SecurityReasoningDrawerProps> = ({
  isOpen,
  onClose,
  risk,
  destinationDisplayName,
  policyDisplayName,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contentPct = Math.min(100, Math.max(5, risk.score_breakdown.content));
  const originPct = Math.min(100, Math.round((risk.score_breakdown.origin / 1.5) * 100));
  const destPct = Math.min(100, Math.round((risk.score_breakdown.destination / 1.5) * 100));
  const policyPct = Math.min(100, Math.round((risk.score_breakdown.policy / 1.5) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Security Reasoning Drawer"
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#07090D]/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#141A23] text-[#B7C0CB]">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-sans font-semibold uppercase tracking-wider text-[#F2F5F8]">
                  Security Reasoning
                </h3>
                <InfoPopover
                  title="Contextual Reasoning"
                  description="Detailed breakdown showing how content sensitivity, source origin, destination exposure multiplier, and governance policy mathematically calculate final risk."
                />
              </div>
              <p className="text-xs font-sans text-[#7D8794]">Deterministic calculation formula & policy triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close security reasoning drawer"
            className="rounded-xl p-1.5 text-[#7D8794] hover:bg-white/[0.08] hover:text-[#F2F5F8] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4 font-sans text-xs text-[#B7C0CB]">
          {/* Top Score Box */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase mb-1.5">
              <span className="font-semibold tracking-wider">Overall Risk Score</span>
              <span className="rounded-md border border-white/15 bg-[#141A23] px-2 py-0.5 font-semibold text-[#F2F5F8] text-xs">{risk.status}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-sans text-[#F2F5F8] tracking-tight">{risk.overall_score}</span>
              <span className="text-[#7D8794] text-sm">/ 100</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7D8794] font-sans leading-relaxed">
              Calculated for target: <strong className="text-[#F2F5F8] font-mono">{destinationDisplayName}</strong> under policy:{' '}
              <strong className="text-[#F2F5F8] font-mono">{policyDisplayName}</strong>
            </div>
          </div>

          {/* Hard Rules Warning if any */}
          {risk.hard_rule_triggered && (
            <div className="rounded-2xl border border-rose-500/40 bg-[#1E070C] p-4 text-rose-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-rose-300 mb-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Deterministic Hard Rule Activated</span>
              </div>
              <div className="text-[11px] leading-relaxed font-mono text-rose-200/90">
                {risk.hard_rule_triggered}
              </div>
            </div>
          )}

          {/* Multiplier Breakdown Sliders / Bars */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.4)] space-y-4">
            <div className="text-[11px] uppercase font-semibold text-[#F2F5F8] tracking-wider border-b border-white/[0.06] pb-2.5">
              Composite Calculation Factors
            </div>

            {/* 1. Content Sensitivity */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="text-[#7D8794]">1. Content Sensitivity (Base Findings):</span>
                <span className="font-semibold text-[#F2F5F8] font-mono">{risk.score_breakdown.content} pts</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#141A23] overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full"
                  style={{ width: `${contentPct}%` }}
                />
              </div>
            </div>

            {/* 2. Source Origin */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="text-[#7D8794]">2. Source Origin Multiplier:</span>
                <span className="font-semibold text-[#F2F5F8] font-mono">{risk.score_breakdown.origin.toFixed(2)}x</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#141A23] overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${originPct}%` }}
                />
              </div>
            </div>

            {/* 3. Destination Exposure */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="text-[#7D8794]">3. Destination Exposure Multiplier:</span>
                <span className="font-semibold text-amber-300 font-mono">{risk.score_breakdown.destination.toFixed(2)}x</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#141A23] overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${destPct}%` }}
                />
              </div>
            </div>

            {/* 4. Policy Profile */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="text-[#7D8794]">4. Governance Policy Multiplier:</span>
                <span className="font-semibold text-rose-300 font-mono">{risk.score_breakdown.policy.toFixed(2)}x</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#141A23] overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${policyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Structured Reasons */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.4)] space-y-3">
            <div className="text-[11px] uppercase font-semibold text-[#F2F5F8] tracking-wider border-b border-white/[0.06] pb-2.5">
              Adjudication Rationales
            </div>
            <div className="space-y-2">
              {risk.structured_reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[#B7C0CB] text-xs">
                  <span className="text-[#7D8794] font-bold leading-relaxed">•</span>
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/[0.06] text-center">
          <span className="text-[11px] font-mono text-[#7D8794]">
            Deterministic Decision Engine • Audited Context Rules
          </span>
        </div>
      </div>
    </div>
  );
};
