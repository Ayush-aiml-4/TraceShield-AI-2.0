import React from 'react';
import { TelemetryRecord } from '../types';
import { Gauge, Network, HardDrive, Terminal } from 'lucide-react';

interface TelemetryPanelProps {
  telemetry: TelemetryRecord;
  onOpenReport?: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry, onOpenReport }) => {
  const formatMs = (val: number | null) => (val !== null ? `${val.toFixed(1)} ms` : '-- ms');

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/95 p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e222d] pb-2.5 mb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-zinc-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
            Hardware Telemetry & Runtime Probes
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500">
            Empirical runtime measurements • Zero simulated values
          </span>
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 rounded border border-[#262c3d] bg-[#141824] px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300 hover:bg-[#1a2030] hover:text-white transition-colors cursor-pointer"
            >
              <Terminal className="h-3 w-3 text-zinc-400" />
              <span>Full Diagnostics</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 text-xs font-mono">
        {/* Pre-filter Latency */}
        <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
            <span>Pre-Filter</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1 text-[9px] text-zinc-400 font-bold">CPU</span>
          </div>
          <div className="text-sm font-bold text-white">
            {formatMs(telemetry.prefilter_latency_ms)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 truncate">Regex & Entropy sweep</div>
        </div>

        {/* AI / Context Latency */}
        {telemetry.ai_invoked && telemetry.ai_latency_ms !== null ? (
          <div className="rounded border border-[#232a3b] bg-[#101522] p-2">
            <div className="flex items-center justify-between text-zinc-300 text-[10px] uppercase mb-0.5">
              <span>AI Context</span>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-1 text-[9px] text-zinc-200 font-bold">
                {telemetry.execution_backend}
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-100">
              {telemetry.ai_latency_ms.toFixed(1)} ms
            </div>
            <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
              Backend: {telemetry.execution_backend}
            </div>
          </div>
        ) : (
          <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
              <span>AI Context</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-1 text-[9px] text-zinc-500">
                BYPASS
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-500">
              Not Invoked
            </div>
            <div className="text-[9px] text-zinc-500 truncate mt-0.5" title={telemetry.ai_reason || 'Deterministic path'}>
              {telemetry.ai_reason || 'Deterministic fast path'}
            </div>
          </div>
        )}

        {/* Sanitizer Latency */}
        <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
            <span>Sanitizer</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1 text-[9px] text-zinc-400 font-bold">CPU</span>
          </div>
          <div className="text-sm font-bold text-white">
            {formatMs(telemetry.sanitization_latency_ms)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 truncate">Span replacement</div>
        </div>

        {/* Verification Latency */}
        <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
            <span>Rescan Verifier</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1 text-[9px] text-zinc-400 font-bold">CPU</span>
          </div>
          <div className="text-sm font-bold text-white">
            {formatMs(telemetry.verification_latency_ms)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 truncate">Closed-loop audit</div>
        </div>

        {/* JS Heap Allocation */}
        <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3 text-zinc-500" />
              <span>JS Heap</span>
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.js_heap_mb !== null ? `${telemetry.js_heap_mb} MB` : 'Protected'}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 truncate">V8 Browser Heap</div>
        </div>

        {/* Network Monitor */}
        <div className="rounded border border-[#1b1f2b] bg-[#0c0e14] p-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase mb-0.5">
            <span className="flex items-center gap-1">
              <Network className="h-3 w-3 text-zinc-500" />
              <span>Network</span>
            </span>
            <span className={`text-[9px] font-medium ${telemetry.network_instrumented ? 'text-emerald-400' : 'text-amber-400'}`}>
              {telemetry.network_instrumented ? 'Audited' : 'Uninstrumented'}
            </span>
          </div>
          <div className="text-sm font-bold text-zinc-200">
            {telemetry.network_instrumented ? (
              `${telemetry.outbound_network_bytes ?? 0} B observed`
            ) : (
              'UNINSTRUMENTED'
            )}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 truncate" title={telemetry.network_instrumented ? 'Application boundary audited' : 'Browser egress not observed'}>
            {telemetry.network_instrumented
              ? 'INSTRUMENTED — APP BOUNDARY'
              : 'UNINSTRUMENTED — BROWSER EGRESS NOT OBSERVED'}
          </div>
        </div>
      </div>
    </div>
  );
};

