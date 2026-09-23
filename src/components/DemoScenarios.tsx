import React from 'react';
import { CanonicalDestination, PolicyProfileId } from '../types';
import { Play, FileText, Image as ImageIcon, CheckCircle, Bug } from 'lucide-react';

export interface DemoScenario {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  sourceType: 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE';
  text: string;
  destinationId: CanonicalDestination;
  policyId: PolicyProfileId;
  icon: 'log' | 'image' | 'code' | 'fail';
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'DEMO-1',
    badge: '01',
    title: 'Production Server Log',
    subtitle: 'Multi-Leaked Secrets',
    description: 'Real-world log with AWS key, internal IPs, and admin email targeting Public GitHub',
    sourceType: 'LOG_FILE',
    destinationId: CanonicalDestination.PUBLIC_GITHUB,
    policyId: PolicyProfileId.CLOUDOPS,
    icon: 'log',
    text: `2026-09-21T02:14:02Z [AuthWorker-4] ERROR connection to primary db at 10.20.14.5:5432 failed.
User: admin_demo, Key: TRACE_DEMO_API_KEY_001
Retrying connection to replica node at 10.20.14.6:5432.
Error: Auth timeout connecting to https://internal.auth.corp.lan/v2/tokens
Contacted engineer: alex.devops@corp.internal for recovery.
AWS_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`,
  },
  {
    id: 'DEMO-2',
    badge: '02',
    title: 'Terminal Screenshot Extract',
    subtitle: 'OCR Vision Token Stream',
    description: 'Extracted OCR bounding-box text containing internal endpoint & token targeting Public AI',
    sourceType: 'SCREENSHOT',
    destinationId: CanonicalDestination.PUBLIC_AI,
    policyId: PolicyProfileId.OPENSOURCE,
    icon: 'image',
    text: `[Terminal OCR Extracted Buffer]
$ export DEMO_INTERNAL_TOKEN_001=ghp_36characterSyntheticGitHubPatToken123456
$ ping 192.168.1.100 -c 4
PING 192.168.1.100 (192.168.1.100): 56 data bytes
64 bytes from 192.168.1.100: icmp_seq=0 ttl=64 time=0.812 ms
Database host: postgres://dbuser:DEMO_PASSWORD_001@10.50.1.20:5432/production_analytics`,
  },
  {
    id: 'DEMO-3',
    badge: '03',
    title: 'Clean Benchmark Code',
    subtitle: 'Fast Early-Exit Path',
    description: 'Benign quicksort function targeting Public GitHub to test zero false positives & fast exit',
    sourceType: 'CODE_FILE',
    destinationId: CanonicalDestination.PUBLIC_GITHUB,
    policyId: PolicyProfileId.CLOUDOPS,
    icon: 'code',
    text: `/**
 * Optimized QuickSort Algorithm implementation
 */
export function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
  },
  {
    id: 'DEMO-4',
    badge: '04',
    title: 'Verification Hold Injection',
    subtitle: 'Closed-Loop Quarantine',
    description: 'Deliberate nested malformed token to demonstrate closed-loop verification hold',
    sourceType: 'LOG_FILE',
    destinationId: CanonicalDestination.INTERNAL_SYSTEM,
    policyId: PolicyProfileId.CYBERSECURITY,
    icon: 'fail',
    text: `[DEBUG FAULT TEST]
CONFIG_PAYLOAD="DEMO_KEY_"DEMO_PASSWORD_001""
Attempting connection to 10.20.14.5 with residual secret token:
TRACE_DEMO_API_KEY_001
[TEST_INJECT: VERIFICATION_HOLD_TRIGGER]`,
  },
];

interface DemoScenariosProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
}

export const DemoScenarios: React.FC<DemoScenariosProps> = ({
  onSelectScenario,
  activeScenarioId,
}) => {
  const getIcon = (type: DemoScenario['icon']) => {
    switch (type) {
      case 'log':
        return <FileText className="h-4 w-4 text-zinc-300" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-zinc-300" />;
      case 'code':
        return <CheckCircle className="h-4 w-4 text-zinc-300" />;
      case 'fail':
        return <Bug className="h-4 w-4 text-zinc-300" />;
    }
  };

  return (
    <div className="rounded-xl border border-[#1e222d] bg-[#10131a]/90 p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e222d] pb-2.5 mb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Play className="h-3.5 w-3.5 text-zinc-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
            1-Click Benchmark & Evaluation Scenarios
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          Synthetic test cases • Live on-device execution
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`group relative flex flex-col items-start rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-zinc-500/80 bg-[#161b26] shadow-sm'
                  : 'border-[#1e2330] bg-[#0c0e14] hover:border-zinc-700 hover:bg-[#121620]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-3 right-3 h-[2px] bg-zinc-300 rounded-full" />
              )}

              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#11141c] border border-[#222735] text-[10px] text-zinc-300 font-bold">
                    {sc.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getIcon(sc.icon)}
                    <span className="truncate text-white">{sc.title}</span>
                  </div>
                </div>
              </div>

              <div className="mt-1 text-[11px] font-mono text-zinc-400 font-medium">
                {sc.subtitle}
              </div>

              <p className="mt-1 text-[10px] text-zinc-400 leading-snug line-clamp-2">
                {sc.description}
              </p>

              <div className="mt-2 flex items-center justify-between w-full border-t border-[#1e222d] pt-1.5 text-[10px] font-mono text-zinc-500">
                <span>{sc.sourceType}</span>
                <span className={`group-hover:text-zinc-200 transition-colors ${isActive ? 'text-zinc-200 font-semibold' : 'text-zinc-400'}`}>
                  Load Test →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

