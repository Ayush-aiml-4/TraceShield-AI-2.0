import React, { useState, useEffect } from 'react';
import { ExecutionBackend } from '../types';
import { SnapdragonValidationReport } from '../validation/runtimeProbe';
import { runBenchmarkSuite, BenchmarkSuiteResult } from '../benchmark/benchmarkHarness';
import { X, Play, Copy, Check, Terminal, Cpu, ShieldCheck } from 'lucide-react';

interface ValidationReportModalProps {
  report: SnapdragonValidationReport;
  activeBackend?: ExecutionBackend;
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({
  report,
  activeBackend,
  isOpen,
  onClose,
}) => {
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkSuiteResult | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentBackend = activeBackend || report.status.recommendedBackend || ExecutionBackend.CPU;

  // Distinguish between AVAILABLE, ACTIVE, UNAVAILABLE, NOT VALIDATED
  const cpuStatusText = report.runtime.providers.cpu === 'AVAILABLE'
    ? currentBackend === ExecutionBackend.CPU
      ? 'AVAILABLE • ACTIVE'
      : 'AVAILABLE • NOT ACTIVE'
    : 'UNAVAILABLE';

  const directMlStatusText = report.runtime.providers.directMl === 'AVAILABLE'
    ? currentBackend === ExecutionBackend.DIRECTML
      ? 'AVAILABLE • ACTIVE'
      : 'AVAILABLE • NOT ACTIVE'
    : 'UNAVAILABLE';

  const qnnStatusText = report.status.qnn === 'VALIDATED'
    ? currentBackend === ExecutionBackend.QNN_NPU
      ? 'AVAILABLE • ACTIVE'
      : 'AVAILABLE • NOT ACTIVE'
    : report.runtime.providers.qnnExecutionProvider === 'AVAILABLE'
    ? 'AVAILABLE • NOT VALIDATED'
    : 'UNAVAILABLE / NOT VALIDATED';

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setTimeout(() => {
      try {
        const res = runBenchmarkSuite(20);
        setBenchmarkResult(res);
      } finally {
        setIsRunningBenchmark(false);
      }
    }, 50);
  };

  const handleCopyReport = () => {
    let fullText = report.rawReportText;
    if (benchmarkResult) {
      fullText += '\n\n' + benchmarkResult.summaryText;
    }
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Snapdragon Hardware Diagnostics Report"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-white/[0.12] bg-[#090d16]/95 shadow-[0_20px_70px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-[#1c2438] to-[#101624] text-cyan-300 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-extrabold uppercase tracking-wider text-slate-100">
                Snapdragon / Hardware Diagnostics Report
              </h2>
              <p className="text-xs text-slate-400">
                Host inspection & execution verification • Zero fabricated metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close diagnostics report"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/[0.1] hover:text-white transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-xs font-mono text-slate-300">
          {/* Target vs Actual Host Context */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d131f] p-3 px-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Target Architecture:</span>
              <span className="font-bold text-cyan-300">Snapdragon X Series (ARM64 / Oryon / Hexagon NPU)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Actual Host Detected:</span>
              <span className="font-bold text-slate-100">
                {report.hardware.cpu} ({report.hardware.architecture}) on {report.hardware.windows}
              </span>
            </div>
          </div>

          {/* Status Summary Banner */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#121826]/90 p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Physical Snapdragon</div>
              <div className="mt-1 font-semibold text-slate-100 truncate">{report.hardware.platform.replace(/_/g, ' ')}</div>
              <div className={`text-[10px] font-bold mt-1.5 ${report.status.hardware === 'VALIDATED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {report.status.hardware === 'VALIDATED' ? 'VALIDATED ✓' : 'NOT VALIDATED'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121826]/90 p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="text-[10px] uppercase font-bold text-slate-400">QNN Engine</div>
              <div className="mt-1 font-semibold text-slate-100 truncate">{report.status.activeBackendDisplay}</div>
              <div className={`text-[10px] font-bold mt-1.5 ${report.status.qnn === 'VALIDATED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {report.status.qnn === 'VALIDATED' ? 'VALIDATED ✓' : 'NOT VALIDATED'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121826]/90 p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="text-[10px] uppercase font-bold text-slate-400">AI Model</div>
              <div className="mt-1 font-semibold text-slate-100 truncate">
                {report.status.localAi === 'AVAILABLE' ? 'Available' : 'UNAVAILABLE'}
              </div>
              <div className={`text-[10px] font-bold mt-1.5 ${report.status.aiModel === 'VALIDATED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {report.status.aiModel === 'VALIDATED' ? 'VALIDATED ✓' : 'NOT VALIDATED'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121826]/90 p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Validation Environment</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-200 truncate">
                {report.environmentLabel}
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5">
                {report.environmentLabel === 'PHYSICAL WINDOWS MACHINE' ? 'Physical Target' : 'Container Sandbox'}
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Hardware & Runtime */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 p-3.5 bg-[#121824]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-slate-400" />
                  <span>Hardware & OS Platform</span>
                </span>
                <span className="text-[10px] text-slate-400">{report.hardware.platform}</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU Identifier:</span>
                  <span className="text-slate-100 truncate max-w-[180px]">{report.hardware.cpu}</span>
                </div>
                {report.hardware.cpuManufacturer && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="text-slate-100">{report.hardware.cpuManufacturer}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">GPU Device:</span>
                  <span className="text-slate-100 truncate max-w-[180px]">{report.hardware.gpu || 'None / Not exposed'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Architecture:</span>
                  <span className="text-slate-100 font-semibold">{report.hardware.architecture} ({report.hardware.architectureCategory || 'x64'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">64-Bit OS:</span>
                  <span className="text-slate-100">{report.hardware.is64Bit ? 'Yes (64-bit)' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">OS Platform:</span>
                  <span className="text-slate-100">{report.hardware.windows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ARM64 Native:</span>
                  <span className="text-slate-100">{report.hardware.isArm64 ? 'Yes (Native)' : 'No (x86_64)'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-3.5 bg-[#121824]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Execution Providers</span>
                </span>
                <span className="text-[10px] text-slate-400">ORT-Web Probes</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CPU Execution Provider:</span>
                  <span className="text-emerald-400 font-bold">{cpuStatusText}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">DirectML (GPU/NPU):</span>
                  <span className="text-slate-300">{directMlStatusText}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">QNN EP (Snapdragon NPU):</span>
                  <span className="text-slate-300">{qnnStatusText}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Pipeline Target:</span>
                  <span className="text-cyan-300 font-bold">{currentBackend}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: QNN Libraries & Provider Test */}
          <div className="rounded-xl border border-white/10 p-3.5 bg-[#121824]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold text-slate-200">
              <span>QNN Runtime & Provider Probes</span>
              <span className="text-slate-400 text-[10px]">{report.qnnRuntime.overall}</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">QnnHtp.dll:</span>
                <span className="text-slate-100 font-semibold">{report.qnnRuntime.qnnHtp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">QnnHtpPrepare.dll:</span>
                <span className="text-slate-100 font-semibold">{report.qnnRuntime.qnnHtpPrepare}</span>
              </div>
              <div>
                <span className="text-slate-400 block">QnnSystem.dll:</span>
                <span className="text-slate-100 font-semibold">{report.qnnRuntime.qnnSystem}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Provider Test:</span>
                <span className="text-slate-100 font-semibold">{report.providerTest.inferenceStatus}</span>
              </div>
            </div>
          </div>

          {/* Benchmark Section */}
          <div className="rounded-xl border border-white/10 p-3.5 bg-[#121824]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div>
                <span className="font-bold text-slate-200">Live Hardware Benchmark Runner</span>
                <p className="text-[11px] text-slate-400">
                  Executes 20 real pipeline iterations measuring end-to-end CPU latency, pre-filter, and rescan timing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/60 px-3 py-1.5 font-bold text-cyan-300 hover:bg-cyan-900/60 cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3 w-3" />
                <span>{isRunningBenchmark ? 'Benchmarking...' : 'Run 20 Iterations'}</span>
              </button>
            </div>

            {benchmarkResult && (
              <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {benchmarkResult.metrics.map((m, idx) => (
                    <div key={idx} className="rounded-lg bg-[#0a0f18] p-2.5 border border-white/5">
                      <span className="text-slate-400 block truncate">{m.name}</span>
                      <span className="text-cyan-300 font-bold text-xs mt-0.5 block">
                        {m.averageMs !== null ? `${m.averageMs} ms avg` : 'N/A'}
                      </span>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>Med: {m.medianMs !== null ? `${m.medianMs} ms` : '--'}</span>
                        <span>P95: {m.p95Ms !== null ? `${m.p95Ms} ms` : '--'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-3.5 bg-[#0a0e16]">
          <span className="text-[11px] font-mono text-slate-400">
            Truthful Hardware Probes • Snapdragon Dev Kit Specification
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#141b27] px-3 py-1.5 font-mono text-xs font-semibold text-slate-200 hover:border-white/20 hover:text-white transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? 'Copied Full Report' : 'Copy Diagnostics'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-[#141b27] px-3.5 py-1.5 font-mono text-xs font-semibold text-slate-200 hover:border-white/20 hover:text-white transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
