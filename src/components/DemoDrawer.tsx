import React, { useEffect } from 'react';
import { DemoScenario, DEMO_SCENARIOS } from './DemoScenarios';
import { X, Play, FileText, Image as ImageIcon, CheckCircle, Bug, Sparkles } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface DemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  onSelectScenario: (sc: DemoScenario) => void;
}

export const DemoDrawer: React.FC<DemoDrawerProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  onSelectScenario,
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

  const getScenarioIcon = (type: DemoScenario['icon']) => {
    switch (type) {
      case 'log':
        return <FileText className="h-4 w-4 text-rose-400" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-cyan-400" />;
      case 'code':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'fail':
        return <Bug className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Demo Scenarios Drawer"
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#07090D]/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#141A23] text-[#B7C0CB]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-sans font-semibold uppercase tracking-wider text-[#F2F5F8]">
                  Demo Scenarios
                </h3>
                <InfoPopover
                  title="Demo Scenarios"
                  description="Pre-configured benchmarks testing multi-leak detection, OCR vision streams, fast allow path, and closed-loop verification hold."
                />
              </div>
              <p className="text-xs font-sans text-[#7D8794]">
                1-Click real evaluation benchmarks for testing and judging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo scenarios drawer"
            className="rounded-xl p-1.5 text-[#7D8794] hover:bg-white/[0.08] hover:text-[#F2F5F8] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isActive
                    ? 'border-white/20 bg-[#141A23] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'border-white/[0.07] bg-[#0D1118]/80 hover:border-white/15 hover:bg-[#141A23]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#07090D] font-mono text-xs font-semibold text-[#B7C0CB]">
                      {sc.badge}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getScenarioIcon(sc.icon)}
                      <span className="font-sans text-xs font-semibold text-[#F2F5F8]">
                        {sc.title}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="rounded-lg border border-emerald-500/40 bg-[#0C2417] px-2 py-0.5 text-[9px] font-mono font-medium text-emerald-300">
                      LOADED
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-sans font-medium text-[#B7C0CB]">
                  {sc.subtitle}
                </div>
                <p className="mt-1 text-xs text-[#7D8794] leading-relaxed font-sans">
                  {sc.description}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-sans text-[#7D8794]">
                  <span className="font-mono">Dest: <span className="text-[#B7C0CB] font-semibold">{sc.destinationId}</span></span>
                  <button
                    onClick={() => {
                      onSelectScenario(sc);
                      onClose();
                    }}
                    aria-label={`${isActive ? 'Reload' : 'Load'} ${sc.title}`}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-sans font-medium transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 ${
                      isActive
                        ? 'border border-white/20 bg-[#181F29] text-[#F2F5F8]'
                        : 'border border-white/[0.08] bg-[#141A23] text-[#B7C0CB] hover:bg-[#181F29] hover:text-[#F2F5F8]'
                    }`}
                  >
                    <Play className="h-3 w-3 text-[#7D8794]" />
                    <span>{isActive ? 'Reload' : 'Load Benchmark'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
