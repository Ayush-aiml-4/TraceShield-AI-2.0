import React from 'react';
import { PipelineResult, ReleaseStatus } from '../types';
import { Search, Brain, Scale, RefreshCw, CheckCircle2, ShieldBan, AlertTriangle } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface PipelineFlowProps {
  result: PipelineResult;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({ result }) => {
  const { telemetry, risk, sanitization, verification, release_status } = result;
  const isAiInvoked = telemetry.ai_invoked;
  const isSanitized = sanitization !== null && sanitization.tokens_replaced > 0;
  const isVerified = verification?.passed === true;

  const stages = [
    {
      id: 'detect',
      label: 'DETECT',
      subtext: `${telemetry.prefilter_latency_ms?.toFixed(1) ?? '0.1'} ms`,
      icon: Search,
      popoverTitle: 'Stage 1: Detect',
      popoverDesc: 'Finds secrets, credentials, network identifiers, personal information, and technical indicators via CPU pattern matching and entropy.',
      status: 'completed',
    },
    {
      id: 'understand',
      label: 'UNDERSTAND',
      subtext: isAiInvoked ? `${telemetry.ai_latency_ms} ms ${telemetry.execution_backend}` : 'Deterministic Path',
      icon: Brain,
      popoverTitle: 'Stage 2: Understand (Local AI / NPU)',
      popoverDesc: 'Provides contextual disambiguation only when ambiguous tokens exist and a validated local model is active. Fast deterministic rules resolve standard patterns.',
      status: isAiInvoked ? 'completed' : 'bypassed',
    },
    {
      id: 'decide',
      label: 'DECIDE',
      subtext: `${risk.status} (${risk.overall_score})`,
      icon: Scale,
      popoverTitle: 'Stage 3: Decide (Risk Engine)',
      popoverDesc: 'Combines evidence, source, destination, and policy to determine the security action (ALLOW, REVIEW, SANITIZE, BLOCK).',
      status: 'completed',
    },
    {
      id: 'sanitize',
      label: 'SANITIZE',
      subtext: isSanitized ? `${sanitization.tokens_replaced} spans` : 'Bypass',
      icon: RefreshCw,
      popoverTitle: 'Stage 4: Sanitize',
      popoverDesc: 'Replaces sensitive values with consistent relational tokens while preserving useful technical context.',
      status: isSanitized ? 'completed' : 'bypassed',
    },
    {
      id: 'verify',
      label: 'VERIFY',
      subtext: verification ? (isVerified ? 'Passed' : 'Hold') : 'Clean',
      icon: CheckCircle2,
      popoverTitle: 'Stage 5: Verify (Independent Rescan)',
      popoverDesc: 'Scans the protected result again for remaining sensitive values or syntax corruption before release.',
      status: verification ? (isVerified ? 'verified' : 'failed') : 'verified',
    },
    {
      id: 'release',
      label: 'RELEASE',
      subtext:
        release_status === ReleaseStatus.ALLOWED
          ? 'Allowed'
          : release_status === ReleaseStatus.BLOCKED
          ? 'Blocked'
          : 'Hold',
      icon:
        release_status === ReleaseStatus.ALLOWED
          ? CheckCircle2
          : release_status === ReleaseStatus.BLOCKED
          ? ShieldBan
          : AlertTriangle,
      popoverTitle: 'Stage 6: Release Gate',
      popoverDesc: 'Enforces final release policy. If blocked by security rules, export to clipboard is restricted.',
      status:
        release_status === ReleaseStatus.ALLOWED
          ? 'allowed'
          : release_status === ReleaseStatus.BLOCKED
          ? 'blocked'
          : 'hold',
    },
  ];

  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D1118]/70 px-4 sm:px-6 py-3.5 backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Subtle top reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B7C0CB] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            <span>Execution Pipeline</span>
          </span>
          <InfoPopover
            title="Pipeline Architecture"
            description="The deterministic pipeline flow: DETECT → UNDERSTAND → DECIDE → SANITIZE → VERIFY → RELEASE."
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#7D8794] font-sans">
            <span>Latency:</span>
            <span className="font-mono text-[11px] font-semibold text-[#F2F5F8]">{(telemetry.total_pipeline_latency_ms ?? 0.8).toFixed(1)} ms</span>
          </span>
        </div>
      </div>

      {/* Connected Stage Rail */}
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        {/* Horizontal Connector Line for Desktop */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-px bg-white/[0.08] hidden md:block -z-0" />

        {stages.map((stage) => {
          const Icon = stage.icon;

          let nodeClasses = 'border-white/[0.08] bg-[#141A23] text-[#7D8794]';
          let textClasses = 'text-[#7D8794]';

          if (stage.status === 'completed') {
            nodeClasses = 'border-white/15 bg-[#18202C] text-[#F2F5F8] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]';
            textClasses = 'text-[#F2F5F8] font-semibold';
          } else if (stage.status === 'verified' || stage.status === 'allowed') {
            nodeClasses = 'border-emerald-500/40 bg-[#0E1E16] text-emerald-300 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]';
            textClasses = 'text-emerald-300 font-semibold';
          } else if (stage.status === 'blocked' || stage.status === 'failed') {
            nodeClasses = 'border-rose-500/40 bg-[#210D12] text-rose-300 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]';
            textClasses = 'text-rose-300 font-semibold';
          } else if (stage.status === 'hold') {
            nodeClasses = 'border-amber-500/40 bg-[#21170A] text-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]';
            textClasses = 'text-amber-300 font-semibold';
          }

          return (
            <div
              key={stage.id}
              className="relative z-10 flex items-center md:flex-col gap-2 rounded-xl p-1.5 md:p-2 transition-all group/node cursor-default"
            >
              <div
                className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border ${nodeClasses} transition-all duration-200 group-hover/node:scale-104`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left md:text-center">
                <div className="flex items-center justify-start md:justify-center gap-1">
                  <span className={`text-[11px] font-sans tracking-tight ${textClasses}`}>
                    {stage.label}
                  </span>
                  <InfoPopover title={stage.popoverTitle} description={stage.popoverDesc} />
                </div>
                <div className="text-[10px] font-mono text-[#7D8794] mt-0.5">{stage.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
