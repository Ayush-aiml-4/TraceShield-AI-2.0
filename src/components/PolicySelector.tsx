import React from 'react';
import { PolicyProfileId } from '../types';
import { POLICY_PROFILES } from '../risk/engine';
import { Cloud, GitBranch, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PolicySelectorProps {
  selectedPolicy: PolicyProfileId;
  onSelect: (policy: PolicyProfileId) => void;
}

export const PolicySelector: React.FC<PolicySelectorProps> = ({ selectedPolicy, onSelect }) => {
  const getIcon = (id: PolicyProfileId) => {
    switch (id) {
      case PolicyProfileId.CLOUDOPS:
        return <Cloud className="h-4 w-4 text-zinc-300" />;
      case PolicyProfileId.OPENSOURCE:
        return <GitBranch className="h-4 w-4 text-zinc-300" />;
      case PolicyProfileId.CYBERSECURITY:
        return <ShieldAlert className="h-4 w-4 text-zinc-300" />;
    }
  };

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/90 p-3.5 shadow-xs">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-200">
            Active Security Policy
          </label>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Threshold Sensitivity</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {Object.values(POLICY_PROFILES).map((policy) => {
          const isSelected = selectedPolicy === policy.id;
          return (
            <button
              key={policy.id}
              onClick={() => onSelect(policy.id)}
              className={`group relative flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-zinc-500/80 bg-[#161b26] shadow-sm'
                  : 'border-[#1e2330] bg-[#0c0e14] hover:border-zinc-700 hover:bg-[#121620]'
              }`}
            >
              {/* Subtle top indicator for selected */}
              {isSelected && (
                <div className="absolute top-0 left-3 right-3 h-[2px] bg-zinc-300 rounded-full" />
              )}

              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
                  isSelected
                    ? 'border-zinc-600 bg-[#1a202c]'
                    : 'border-[#222735] bg-[#11141c]'
                }`}
              >
                {getIcon(policy.id)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold font-mono truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {policy.display_name}
                  </span>
                  <span className="rounded border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.2 text-[9px] font-mono font-bold text-zinc-400">
                    {policy.policy_modifier}x
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400 line-clamp-1 leading-snug">
                  {policy.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


