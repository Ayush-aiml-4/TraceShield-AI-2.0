import React from 'react';
import { ExecutionBackend, HardwarePlatform } from '../types';
import { Shield, Cpu, Gauge, Terminal } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface HeaderProps {
  hardwarePlatform: HardwarePlatform;
  executionBackend: ExecutionBackend;
  backendDisplay?: string;
  qnnValidated?: boolean;
  onToggleBackend: () => void;
  onOpenDemo: () => void;
  onOpenRuntime: () => void;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hardwarePlatform,
  executionBackend,
  backendDisplay,
  qnnValidated,
  onToggleBackend,
  onOpenDemo,
  onOpenRuntime,
  onOpenDiagnostics,
}) => {
  const isQnn = executionBackend === ExecutionBackend.QNN_NPU;
  const displayString =
    backendDisplay ||
    (isQnn
      ? qnnValidated
        ? 'QNN NPU ✓'
        : 'QNN NPU (NOT VALIDATED)'
      : executionBackend === ExecutionBackend.CPU
      ? 'CPU'
      : executionBackend === ExecutionBackend.MOCK
      ? 'MOCK'
      : 'UNVALIDATED');

  return (
    <header className="border-b border-white/[0.07] bg-[#07090D]/90 px-5 sm:px-8 py-3 backdrop-blur-2xl sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Top subtle rim highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* Brand & System Definition - Sophisticated & Product-Focused */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-[#0D1118] text-white shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <Shield className="h-5 w-5 text-[#E0E7EE]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-base font-extrabold tracking-tight text-[#F2F5F8] font-sans flex items-center gap-2">
                <span>TRACE SHIELD</span>
                <span className="text-[#B7C0CB] font-mono font-medium px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[11px] tracking-normal">
                  AI 2.0
                </span>
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">•</span>
              <span className="text-xs font-sans text-[#B7C0CB] font-medium tracking-normal hidden md:inline">
                Context-Aware Evidence Security
              </span>
              <InfoPopover
                title="TraceShield AI 2.0"
                description="Autonomous on-device security workspace designed to understand, sanitize, and independently verify technical evidence before release."
              />
            </div>
            <p className="text-[11px] text-[#7D8794] mt-0.5 font-sans">
              Understand locally. Sanitize intelligently. Verify before you share.
            </p>
          </div>
        </div>

        {/* Right Navigation & Status Group - Quieter, Engineered Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
          {/* Target Challenge Badge (Clearly contextual) */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0D1118]/80 px-2.5 py-1.5 text-[#B7C0CB] backdrop-blur-md">
            <span className="text-[#7D8794] text-[11px] font-sans">Target:</span>
            <span className="text-[#F2F5F8] font-medium text-[11px] font-sans">Snapdragon X Series</span>
            <InfoPopover
              title="Target Hardware Profile"
              description="Challenge target platform is Qualcomm Snapdragon X Series. The current host inspection detects whether you are running on Snapdragon or host container."
            />
          </div>

          {/* Local Runtime Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-950/30 px-2.5 py-1.5 text-emerald-300 font-sans text-[11px] font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide">LOCAL</span>
          </div>

          {/* Backend Selector */}
          <button
            type="button"
            onClick={onToggleBackend}
            title="Click to cycle execution backend (CPU, QNN_NPU, DIRECTML, MOCK, UNVALIDATED)"
            aria-label={`Cycle execution backend. Currently ${displayString}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0D1118]/80 hover:bg-[#141A23] hover:border-white/15 px-2.5 py-1.5 text-[#B7C0CB] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <Cpu className="h-3.5 w-3.5 text-[#7D8794]" />
            <span className="text-[#7D8794] text-[11px] font-sans">Backend:</span>
            <span
              className={`font-mono text-[11px] font-medium ${
                isQnn && qnnValidated
                  ? 'text-emerald-400'
                  : isQnn
                  ? 'text-amber-300'
                  : 'text-[#F2F5F8]'
              }`}
            >
              {displayString}
            </span>
          </button>

          {/* Demo Action */}
          <button
            type="button"
            onClick={onOpenDemo}
            aria-label="Open demo scenarios drawer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0D1118]/80 hover:bg-[#141A23] hover:border-white/15 px-3 py-1.5 font-sans font-medium text-[#B7C0CB] hover:text-[#F2F5F8] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <Terminal className="h-3.5 w-3.5 text-[#7D8794]" />
            <span>Demo</span>
          </button>

          {/* Runtime Action */}
          <button
            type="button"
            onClick={onOpenRuntime}
            aria-label="Open runtime telemetry drawer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0D1118]/80 hover:bg-[#141A23] hover:border-white/15 px-3 py-1.5 font-sans font-medium text-[#B7C0CB] hover:text-[#F2F5F8] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <Gauge className="h-3.5 w-3.5 text-[#7D8794]" />
            <span>Runtime</span>
          </button>

          {/* Diagnostics Action */}
          <button
            type="button"
            onClick={onOpenDiagnostics}
            aria-label="Open hardware diagnostics modal"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#141A23] hover:bg-[#181F29] hover:border-white/20 px-3 py-1.5 font-sans font-semibold text-[#F2F5F8] shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <span>Diagnostics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
