import React from 'react';
import { ReleaseStatus, RiskAssessment, RiskStatus } from '../types';
import { ShieldBan, ShieldCheck, ArrowRight, HelpCircle, Shield, ChevronRight, AlertOctagon } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface DecisionHeroProps {
  risk: RiskAssessment;
  releaseStatus: ReleaseStatus;
  destinationDisplayName: string;
  policyDisplayName: string;
  onOpenReasoning: () => void;
}

export const DecisionHero: React.FC<DecisionHeroProps> = ({
  risk,
  releaseStatus,
  destinationDisplayName,
  policyDisplayName,
  onOpenReasoning,
}) => {
  const getDecisionConfig = (status: RiskStatus) => {
    switch (status) {
      case RiskStatus.ALLOW:
        return {
          title: 'ALLOW',
          subtext: `Safe for canonical release to ${destinationDisplayName}`,
          borderClass: 'border-emerald-500/35 hover:border-emerald-500/50',
          bgClass: 'bg-gradient-to-b from-[#091C12]/90 via-[#06140D]/90 to-[#030A06]/95',
          textClass: 'text-emerald-300',
          scoreBadgeClass: 'border-emerald-500/35 bg-emerald-950/60 text-emerald-200',
          badgeClass: 'border-emerald-400/40 bg-[#0C2417] text-emerald-200 shadow-[0_4px_24px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]',
          icon: ShieldCheck,
          accentGlow: 'shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_-5px_rgba(16,185,129,0.15)]',
          localAmbientGlow: 'from-emerald-500/10 via-transparent to-transparent',
        };
      case RiskStatus.REVIEW:
        return {
          title: 'REVIEW',
          subtext: `Moderate sensitivity requiring human review for ${destinationDisplayName}`,
          borderClass: 'border-amber-500/35 hover:border-amber-500/50',
          bgClass: 'bg-gradient-to-b from-[#1E1508]/90 via-[#140E05]/90 to-[#0B0702]/95',
          textClass: 'text-amber-300',
          scoreBadgeClass: 'border-amber-500/35 bg-amber-950/60 text-amber-200',
          badgeClass: 'border-amber-400/40 bg-[#261A0A] text-amber-200 shadow-[0_4px_24px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]',
          icon: HelpCircle,
          accentGlow: 'shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_-5px_rgba(245,158,11,0.15)]',
          localAmbientGlow: 'from-amber-500/10 via-transparent to-transparent',
        };
      case RiskStatus.SANITIZE:
        return {
          title: 'SANITIZE',
          subtext: `Sensitive parameters detected; deterministic redaction applied`,
          borderClass: 'border-cyan-500/35 hover:border-cyan-500/50',
          bgClass: 'bg-gradient-to-b from-[#081820]/90 via-[#051117]/90 to-[#03090D]/95',
          textClass: 'text-cyan-300',
          scoreBadgeClass: 'border-cyan-500/35 bg-cyan-950/60 text-cyan-200',
          badgeClass: 'border-cyan-400/40 bg-[#0A202B] text-cyan-200 shadow-[0_4px_24px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]',
          icon: ShieldCheck,
          accentGlow: 'shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_-5px_rgba(6,182,212,0.15)]',
          localAmbientGlow: 'from-cyan-500/10 via-transparent to-transparent',
        };
      case RiskStatus.BLOCK:
        return {
          title: 'BLOCK',
          subtext: `Critical credential targeting ${destinationDisplayName}`,
          borderClass: 'border-rose-500/40 hover:border-rose-500/55',
          bgClass: 'bg-gradient-to-b from-[#1C070C]/90 via-[#130408]/90 to-[#0A0204]/95',
          textClass: 'text-[#FFA4B3]',
          scoreBadgeClass: 'border-rose-500/40 bg-rose-950/60 text-rose-200',
          badgeClass: 'border-rose-400/40 bg-[#250810] text-[#FF9EAE] shadow-[0_4px_24px_rgba(244,63,94,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
          icon: ShieldBan,
          accentGlow: 'shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_35px_-5px_rgba(244,63,94,0.2)]',
          localAmbientGlow: 'from-rose-500/12 via-transparent to-transparent',
        };
    }
  };

  const config = getDecisionConfig(risk.status);
  const Icon = config.icon;

  return (
    <div className="relative group">
      {/* Restrained local atmospheric glow behind the primary hero */}
      <div
        className={`absolute -inset-1 rounded-3xl bg-gradient-to-b ${config.localAmbientGlow} blur-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Hero Glass Surface: Level 3 Elevated Hero Glass */}
      <div
        className={`relative overflow-hidden rounded-2xl border ${config.borderClass} ${config.bgClass} ${config.accentGlow} p-6 lg:p-7 backdrop-blur-3xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`}
      >
        {/* Subtle white edge highlight across the top inner border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#141A23] text-[#B7C0CB]">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-sans font-semibold tracking-wider uppercase text-[#B7C0CB]">
              Security Decision
            </span>
            <InfoPopover
              title="Security Decision"
              description="Autonomous adjudication derived from combining evidence findings, destination exposure multiplier, and active policy rules."
            />
          </div>

          {/* Final Release Gating Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-sans text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-colors ${
              releaseStatus === ReleaseStatus.BLOCKED
                ? 'border-rose-500/50 bg-[#250810] text-rose-200'
                : releaseStatus === ReleaseStatus.ALLOWED
                ? 'border-emerald-500/50 bg-[#0C2417] text-emerald-200'
                : 'border-amber-500/50 bg-[#261A0A] text-amber-200'
            }`}
          >
            <span className="opacity-60 text-[10px] font-mono">RELEASE:</span>
            <span>{releaseStatus}</span>
          </div>
        </div>

        {/* Primary Hero Section with Dominant Scale */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl border ${config.badgeClass} transition-transform duration-300 group-hover:scale-104`}
            >
              <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2
                  className={`text-4xl sm:text-5xl font-black font-sans tracking-tight ${config.textClass} drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]`}
                >
                  {config.title}
                </h2>
                <span
                  className={`rounded-lg border ${config.scoreBadgeClass} px-2.5 py-1 text-xs font-mono font-bold shadow-xs`}
                >
                  Score: {risk.overall_score} / 100
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#B7C0CB] font-sans font-medium leading-relaxed max-w-sm">
                {config.subtext}
              </p>
            </div>
          </div>

          {/* Why this decision action button */}
          <button
            type="button"
            onClick={onOpenReasoning}
            className="flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/20 px-4 py-2.5 text-xs font-sans font-semibold text-[#F2F5F8] transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] self-stretch sm:self-auto justify-center focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <span>Why this decision?</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#B7C0CB]" />
          </button>
        </div>

        {/* Hard Rule / Trigger Information (if present) */}
        {risk.hard_rule_triggered && (
          <div className="mt-5 rounded-xl border border-rose-500/35 bg-[#180509] p-3.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-xs font-bold text-rose-300">
                  Critical Policy Triggered:
                </span>
                <span className="ml-1.5 font-mono text-xs text-rose-200">
                  {risk.hard_rule_triggered}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Structured Reasons List */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] space-y-2">
          <div className="text-xs font-sans uppercase tracking-wider text-[#7D8794] font-medium flex items-center justify-between">
            <span>Primary Contributing Factors</span>
            <span className="text-[11px] text-[#7D8794] font-normal font-sans">Context-Weighted</span>
          </div>
          <div className="space-y-1.5">
            {risk.structured_reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-sans text-[#B7C0CB]">
                <span className="text-[#7D8794] shrink-0 font-bold">•</span>
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
