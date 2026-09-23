import React from 'react';
import { PipelineResult, ReleaseStatus, RiskStatus } from '../types';
import { ShieldCheck, Search, Brain, Scale, RefreshCw, CheckCircle2, ShieldBan, AlertTriangle } from 'lucide-react';

interface PipelineVisualizerProps {
  result: PipelineResult;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ result }) => {
  const { telemetry, risk, sanitization, verification, release_status } = result;
  const isAiInvoked = telemetry.ai_invoked;
  const isSanitized = sanitization !== null && sanitization.tokens_replaced > 0;
  const isClean = risk.status === RiskStatus.ALLOW;
  const isVerified = verification?.passed === true;

  const stages = [
    {
      id: 'detect',
      label: 'DETECT',
      subtext: `${telemetry.prefilter_latency_ms?.toFixed(1) ?? '0.1'} ms`,
      status: 'completed',
      icon: Search,
    },
    {
      id: 'understand',
      label: 'UNDERSTAND',
      subtext: isAiInvoked
        ? `${telemetry.ai_latency_ms} ms ${telemetry.execution_backend}`
        : 'Fast Path',
      status: isAiInvoked ? 'completed' : 'bypassed',
      icon: Brain,
    },
    {
      id: 'decide',
      label: 'DECIDE',
      subtext: `${risk.status} (${risk.overall_score})`,
      status: 'completed',
      icon: Scale,
    },
    {
      id: 'sanitize',
      label: 'SANITIZE',
      subtext: isSanitized ? `${sanitization.tokens_replaced} spans` : isClean ? 'Clean' : 'Bypass',
      status: isSanitized ? 'completed' : 'bypassed',
      icon: RefreshCw,
    },
    {
      id: 'verify',
      label: 'VERIFY',
      subtext: verification
        ? isVerified
          ? 'Passed'
          : 'Hold'
        : isClean
        ? 'Clean'
        : 'Audit',
      status: verification ? (isVerified ? 'verified' : 'failed') : isClean ? 'verified' : 'bypassed',
      icon: CheckCircle2,
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
      status:
        release_status === ReleaseStatus.ALLOWED
          ? 'allowed'
          : release_status === ReleaseStatus.BLOCKED
          ? 'blocked'
          : 'hold',
      icon:
        release_status === ReleaseStatus.ALLOWED
          ? ShieldCheck
          : release_status === ReleaseStatus.BLOCKED
          ? ShieldBan
          : AlertTriangle,
    },
  ];

  return (
    <div className="rounded-lg border border-[#1e222d] bg-[#0f1118]/80 px-4 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Pipeline Execution Flow
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          Latency: <span className="text-zinc-300 font-medium">{telemetry.total_pipeline_latency_ms} ms</span>
        </span>
      </div>

      {/* Progression Track */}
      <div className="relative flex items-center justify-between">
        {/* Connecting Track Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-[#222736] z-0" />

        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isAllowed = stage.status === 'allowed';
          const isBlocked = stage.status === 'blocked';
          const isHold = stage.status === 'hold' || stage.status === 'failed';
          const isVerifiedStage = stage.status === 'verified';
          const isBypassed = stage.status === 'bypassed';

          let nodeBg = 'bg-[#141822] border-[#293042] text-zinc-400';
          let textColor = 'text-zinc-300';
          let subColor = 'text-zinc-500';

          if (isAllowed || isVerifiedStage) {
            nodeBg = 'bg-[#0e2017] border-emerald-500/40 text-emerald-400';
            textColor = 'text-emerald-300';
            subColor = 'text-emerald-500';
          } else if (isBlocked) {
            nodeBg = 'bg-[#220d13] border-rose-500/50 text-rose-400';
            textColor = 'text-rose-300';
            subColor = 'text-rose-400';
          } else if (isHold) {
            nodeBg = 'bg-[#22160d] border-amber-500/50 text-amber-400';
            textColor = 'text-amber-300';
            subColor = 'text-amber-400';
          } else if (isBypassed) {
            nodeBg = 'bg-[#10121a] border-[#1e222d] text-zinc-600';
            textColor = 'text-zinc-500';
            subColor = 'text-zinc-600';
          }

          return (
            <div
              key={stage.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs shadow-xs transition-colors ${nodeBg}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`mt-1 text-[10px] font-mono font-bold tracking-tight ${textColor}`}>
                {stage.label}
              </span>
              <span className={`text-[9px] font-mono ${subColor} hidden sm:block`}>
                {stage.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

