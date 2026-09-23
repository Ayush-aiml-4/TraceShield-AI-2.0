import React from 'react';
import { CanonicalDestination } from '../types';
import { DESTINATIONS } from '../risk/engine';
import { Globe, Bot, Building2, Terminal, ArrowUpRight } from 'lucide-react';

interface DestinationSelectorProps {
  selectedDestination: CanonicalDestination;
  onSelect: (destination: CanonicalDestination) => void;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  selectedDestination,
  onSelect,
}) => {
  const getIcon = (id: CanonicalDestination) => {
    switch (id) {
      case CanonicalDestination.PUBLIC_GITHUB:
        return <Globe className="h-4 w-4 text-zinc-300" />;
      case CanonicalDestination.PUBLIC_AI:
        return <Bot className="h-4 w-4 text-zinc-300" />;
      case CanonicalDestination.INTERNAL_SYSTEM:
        return <Building2 className="h-4 w-4 text-zinc-300" />;
      case CanonicalDestination.LOCAL_IDE:
        return <Terminal className="h-4 w-4 text-zinc-300" />;
    }
  };

  const getExposureLabel = (mult: number) => {
    if (mult >= 1.5) return 'Highest Exposure';
    if (mult >= 1.2) return 'Higher Exposure';
    if (mult >= 0.5) return 'Controlled';
    return 'Local Only';
  };

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/90 p-3.5 shadow-xs">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-200">
            Target Destination
          </label>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Egress Risk Factor</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.values(DESTINATIONS).map((dest) => {
          const isSelected = selectedDestination === dest.id;
          return (
            <button
              key={dest.id}
              onClick={() => onSelect(dest.id)}
              className={`group relative flex flex-col items-start rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-zinc-500/80 bg-[#161b26] shadow-sm'
                  : 'border-[#1e2330] bg-[#0c0e14] hover:border-zinc-700 hover:bg-[#121620]'
              }`}
            >
              {/* Subtle top indicator for selected */}
              {isSelected && (
                <div className="absolute top-0 left-3 right-3 h-[2px] bg-zinc-300 rounded-full" />
              )}

              <div className="flex w-full items-center justify-between">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-zinc-600 bg-[#1a202c]'
                      : 'border-[#222735] bg-[#11141c]'
                  }`}
                >
                  {getIcon(dest.id)}
                </div>
                <span
                  className={`rounded border px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    dest.exposure_multiplier >= 1.2
                      ? 'border-rose-900/60 bg-rose-950/30 text-rose-300'
                      : dest.exposure_multiplier >= 0.6
                      ? 'border-amber-900/60 bg-amber-950/30 text-amber-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                  }`}
                >
                  {dest.exposure_multiplier}x
                </span>
              </div>

              <div className="mt-2 w-full">
                <div className={`text-xs font-semibold font-mono truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                  {dest.display_name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {dest.subtitle}
                </div>
                <div className="text-[9px] font-mono mt-1 text-zinc-500">
                  {getExposureLabel(dest.exposure_multiplier)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


