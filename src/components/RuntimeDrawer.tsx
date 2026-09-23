import React, { useEffect } from 'react';
import { TelemetryRecord } from '../types';
import { X, Gauge, Terminal, HardDrive, Network, Cpu, ShieldCheck } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface RuntimeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryRecord;
  onOpenDiagnostics?: () => void;
}

export const RuntimeDrawer: React.FC<RuntimeDrawerProps> = ({
  isOpen,
  onClose,
  telemetry,
  onOpenDiagnostics,
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

  const formatMs = (val: number | null) => (val !== null ? `${val.toFixed(2)} ms` : '-- ms');

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Runtime Instrumentation Drawer"
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#07090D]/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#141A23] text-[#B7C0CB]">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-sans font-semibold uppercase tracking-wider text-[#F2F5F8]">
                  Runtime Instrumentation
                </h3>
                <InfoPopover
                  title="Runtime Probes"
                  description="Empirical hardware telemetry, latency timing, memory heap readings, and isolated network audits. Zero simulated metrics."
                />
              </div>
              <p className="text-xs font-sans text-[#7D8794]">Live hardware telemetry and execution timing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close runtime drawer"
            className="rounded-xl p-1.5 text-[#7D8794] hover:bg-white/[0.08] hover:text-[#F2F5F8] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 font-mono text-xs">
          {/* Total Latency Summary */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase mb-1.5 font-sans">
              <span className="font-semibold tracking-wider">Total Pipeline Latency</span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                End-to-End
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#F2F5F8] tracking-tight">
              {formatMs(telemetry.total_pipeline_latency_ms)}
            </div>
            <div className="text-[11px] text-[#7D8794] mt-1.5 font-sans leading-relaxed">
              Deterministic pre-filter, sanitization, and closed-loop rescan verification
            </div>
          </div>

          {/* Execution Backend */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase mb-1.5 font-sans">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-[#B7C0CB]" />
                <span className="font-semibold tracking-wider">Backend Provider</span>
              </span>
              <span className="text-cyan-300 font-bold font-mono">{telemetry.execution_backend}</span>
            </div>
            <div className="text-[#B7C0CB] text-xs font-sans">
              Display: <span className="text-[#F2F5F8] font-semibold font-mono">{telemetry.backend_display}</span>
            </div>
            <div className="text-[10px] text-[#7D8794] mt-1 font-sans">
              QNN Validation State: {telemetry.qnn_validated ? <span className="text-emerald-300 font-mono font-bold">VALIDATED ✓</span> : 'NOT VALIDATED (Local CPU)'}
            </div>
          </div>

          {/* AI Context Invocations */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase mb-1.5 font-sans">
              <span className="font-semibold tracking-wider">AI Context Engine</span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  telemetry.ai_invoked
                    ? 'border border-cyan-500/50 bg-cyan-950/70 text-cyan-200'
                    : 'border border-white/10 bg-[#141A23] text-[#7D8794]'
                }`}
              >
                {telemetry.ai_invoked ? 'INVOKED' : 'NOT INVOKED'}
              </span>
            </div>
            {telemetry.ai_invoked ? (
              <>
                <div className="text-lg font-bold text-cyan-300 font-mono">
                  {formatMs(telemetry.ai_latency_ms)}
                </div>
                <div className="text-[10px] text-cyan-400 mt-0.5 font-sans">
                  Backend: {telemetry.execution_backend}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold text-[#F2F5F8] mt-1 font-sans">
                  Deterministic Fast Path
                </div>
                <div className="text-[10px] text-[#7D8794] mt-0.5 font-sans">
                  {telemetry.ai_reason || 'Regex & entropy rules resolved all tokens; zero ambiguity.'}
                </div>
              </>
            )}
          </div>

          {/* Breakdown Steps */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)] space-y-2.5">
            <div className="text-[11px] uppercase text-[#F2F5F8] font-semibold border-b border-white/[0.06] pb-2 tracking-wider font-sans">
              Pipeline Stage Latencies
            </div>
            <div className="flex justify-between items-center text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">1. Prefilter / Regex:</span>
              <span className="font-semibold text-[#F2F5F8]">{formatMs(telemetry.prefilter_latency_ms)}</span>
            </div>
            <div className="flex justify-between items-center text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">2. Context Understanding:</span>
              <span className="font-semibold text-cyan-300">
                {telemetry.ai_invoked ? formatMs(telemetry.ai_latency_ms) : 'Bypassed'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">3. Sanitization & Tokens:</span>
              <span className="font-semibold text-[#F2F5F8]">{formatMs(telemetry.sanitization_latency_ms)}</span>
            </div>
            <div className="flex justify-between items-center text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">4. Independent Rescan:</span>
              <span className="font-semibold text-emerald-300">{formatMs(telemetry.verification_latency_ms)}</span>
            </div>
          </div>

          {/* Memory Heap */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)] space-y-2">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase font-sans">
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-[#7D8794]" />
                <span className="font-semibold tracking-wider">Memory Telemetry</span>
              </span>
              <span className="text-[10px] text-[#7D8794]">Heap Probe</span>
            </div>
            <div className="flex justify-between text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">JS Heap Usage:</span>
              <span className="font-semibold text-[#F2F5F8]">
                {telemetry.js_heap_mb !== null ? `${telemetry.js_heap_mb.toFixed(1)} MB` : 'Browser Protected'}
              </span>
            </div>
            <div className="flex justify-between text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">Peak Memory:</span>
              <span className="font-semibold text-[#F2F5F8]">
                {telemetry.peak_memory_mb !== null ? `${telemetry.peak_memory_mb.toFixed(1)} MB` : 'Browser Sandbox / Unexposed'}
              </span>
            </div>
          </div>

          {/* Network Audit */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1118]/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)] space-y-2">
            <div className="flex items-center justify-between text-[#7D8794] text-[11px] uppercase font-sans">
              <span className="flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold tracking-wider">Application Network Audit</span>
              </span>
              <span
                className={`rounded-md px-2 py-0.5 font-bold text-[10px] ${
                  telemetry.network_instrumented
                    ? 'border border-emerald-500/40 bg-emerald-950/70 text-emerald-300'
                    : 'border border-white/10 bg-[#141A23] text-[#7D8794]'
                }`}
              >
                {telemetry.network_instrumented ? 'INSTRUMENTED — APPLICATION BOUNDARY' : 'UNINSTRUMENTED — BROWSER EGRESS NOT OBSERVED'}
              </span>
            </div>
            <div className="flex justify-between text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">Observed App Requests:</span>
              <span className="font-semibold text-emerald-300">
                {telemetry.network_instrumented ? `${telemetry.outbound_network_requests ?? 0} requests` : 'UNINSTRUMENTED'}
              </span>
            </div>
            <div className="flex justify-between text-[#B7C0CB]">
              <span className="text-[#7D8794] font-sans">Observed App Bytes:</span>
              <span className="font-semibold text-emerald-300">
                {telemetry.network_instrumented ? `${telemetry.outbound_network_bytes ?? 0} bytes` : 'UNINSTRUMENTED'}
              </span>
            </div>
            <div className="text-[10px] text-[#7D8794] font-sans pt-1 border-t border-white/[0.04]">
              Application boundary audited. Machine-wide host network is not claimed.
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/[0.06] text-center">
          <span className="text-[11px] font-mono text-[#7D8794]">
            Hardware target: Qualcomm Snapdragon X Series
          </span>
        </div>
      </div>
    </div>
  );
};
