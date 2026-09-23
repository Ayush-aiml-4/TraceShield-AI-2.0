import React from 'react';
import { CanonicalDestination, PolicyProfileId } from '../types';
import { DESTINATIONS, POLICY_PROFILES } from '../risk/engine';
import { FileText, ArrowRight, ShieldCheck, ChevronDown, Layers, Terminal, Sparkles } from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface ContextBarProps {
  sourceType: 'CLIPBOARD' | 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE';
  destinationId: CanonicalDestination;
  policyId: PolicyProfileId;
  onSelectSourceType: (type: 'CLIPBOARD' | 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE') => void;
  onSelectDestination: (dest: CanonicalDestination) => void;
  onSelectPolicy: (policy: PolicyProfileId) => void;
  activeScenarioId?: string;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  sourceType,
  destinationId,
  policyId,
  onSelectSourceType,
  onSelectDestination,
  onSelectPolicy,
  activeScenarioId,
}) => {
  const currentDest = DESTINATIONS[destinationId];
  const currentPolicy = POLICY_PROFILES[policyId];

  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D1118]/75 p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      {/* Top subtle rim highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      {/* Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#141A23] text-[#B7C0CB]">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B7C0CB]">
            Evaluation Context
          </span>
          <InfoPopover
            title="Context & Governance Multiplier"
            description="The exact same log file that is ALLOWED in an internal SOC channel will be BLOCKED if routed to Public GitHub or Public Pastebin. Context shapes the security decision."
          />
        </div>
        <div className="text-xs font-sans text-[#7D8794] flex items-center gap-2">
          <span>Source</span>
          <span className="text-slate-600">→</span>
          <span>Destination</span>
          <span className="text-slate-600">→</span>
          <span>Policy</span>
        </div>
      </div>

      {/* Connected Context Strip with Integrated Directional Arrows */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Step 1: Source */}
        <div className="md:col-span-3 relative group/step">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#7D8794] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-[#B7C0CB] font-mono">1</span>
              <span>Evidence Source</span>
            </span>
            <InfoPopover
              title="Evidence Source"
              description="Defines the ingestion channel: Raw Log File, System Clipboard, Screenshot OCR, or Source Code."
            />
          </div>
          <div className="relative">
            <select
              value={sourceType}
              onChange={(e) => onSelectSourceType(e.target.value as any)}
              aria-label="Evidence Source Selector"
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#141A23] px-3.5 py-2.5 text-xs font-sans text-[#F2F5F8] hover:border-white/20 focus:border-white/30 focus-visible:ring-1 focus-visible:ring-white/40 focus:outline-hidden transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-medium"
            >
              <option value="LOG_FILE">Log File (.log, .txt)</option>
              <option value="CLIPBOARD">System Clipboard (paste)</option>
              <option value="SCREENSHOT">Screenshot / Vision OCR</option>
              <option value="CODE_FILE">Source Code Repository</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D8794] group-hover/step:text-[#F2F5F8] transition-colors" />
          </div>
        </div>

        {/* Directional Connector Arrow 1 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center pt-5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.06] bg-[#141A23] text-[#7D8794]">
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Step 2: Destination */}
        <div className="md:col-span-3 relative group/step">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#7D8794] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-[#B7C0CB] font-mono">2</span>
              <span>Target Destination</span>
            </span>
            <InfoPopover
              title="Target Destination"
              description="Determines exposure multiplier. Public GitHub or Public Pastebin triggers strict blocking; Private Jira or Internal Slack permits contextual sanitization."
            />
          </div>
          <div className="relative">
            <select
              value={destinationId}
              onChange={(e) => onSelectDestination(e.target.value as CanonicalDestination)}
              aria-label="Target Destination Selector"
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#141A23] px-3.5 py-2.5 text-xs font-sans text-[#F2F5F8] hover:border-white/20 focus:border-white/30 focus-visible:ring-1 focus-visible:ring-white/40 focus:outline-hidden transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-medium"
            >
              {Object.values(DESTINATIONS).map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.display_name} ({dest.exposure_multiplier}x multiplier)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D8794] group-hover/step:text-[#F2F5F8] transition-colors" />
          </div>
        </div>

        {/* Directional Connector Arrow 2 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center pt-5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.06] bg-[#141A23] text-[#7D8794]">
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Step 3: Policy */}
        <div className="md:col-span-3 relative group/step">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#7D8794] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-[#B7C0CB] font-mono">3</span>
              <span>Governance Policy</span>
            </span>
            <InfoPopover
              title="Governance Policy"
              description="Ruleset defining sensitivity thresholds. Cloud/DevOps strictly prohibits infrastructure secrets, HIPAA protects health records, Financial enforces banking tokens."
            />
          </div>
          <div className="relative">
            <select
              value={policyId}
              onChange={(e) => onSelectPolicy(e.target.value as PolicyProfileId)}
              aria-label="Governance Policy Profile Selector"
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#141A23] px-3.5 py-2.5 text-xs font-sans text-[#F2F5F8] hover:border-white/20 focus:border-white/30 focus-visible:ring-1 focus-visible:ring-white/40 focus:outline-hidden transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-medium"
            >
              {Object.values(POLICY_PROFILES).map((pol) => (
                <option key={pol.id} value={pol.id}>
                  {pol.display_name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D8794] group-hover/step:text-[#F2F5F8] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
