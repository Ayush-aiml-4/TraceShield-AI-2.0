import React, { useState, useEffect, useMemo } from 'react';
import {
  CanonicalDestination,
  ExecutionBackend,
  PipelineResult,
  PolicyProfileId,
} from './types';
import { runTraceShieldPipeline } from './core/pipeline';
import { Header } from './components/Header';
import { ContextBar } from './components/ContextBar';
import { EvidenceWorkspace } from './components/EvidenceWorkspace';
import { DecisionHero } from './components/DecisionHero';
import { TransformationWorkspace } from './components/TransformationWorkspace';
import { IndependentVerification } from './components/IndependentVerification';
import { PipelineFlow } from './components/PipelineFlow';
import { DemoDrawer } from './components/DemoDrawer';
import { RuntimeDrawer } from './components/RuntimeDrawer';
import { SecurityReasoningDrawer } from './components/SecurityReasoningDrawer';
import { ValidationReportModal } from './components/ValidationReportModal';
import { DEMO_SCENARIOS, DemoScenario } from './components/DemoScenarios';
import { DESTINATIONS, POLICY_PROFILES } from './risk/engine';
import { generateValidationReport } from './validation/runtimeProbe';

export default function App() {
  const [inputText, setInputText] = useState<string>(DEMO_SCENARIOS[0].text);
  const [sourceType, setSourceType] = useState<'CLIPBOARD' | 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE'>('LOG_FILE');
  const [destinationId, setDestinationId] = useState<CanonicalDestination>(CanonicalDestination.PUBLIC_GITHUB);
  const [policyId, setPolicyId] = useState<PolicyProfileId>(PolicyProfileId.CLOUDOPS);
  const [executionBackend, setExecutionBackend] = useState<ExecutionBackend>(ExecutionBackend.CPU);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('DEMO-1');

  // Progressive disclosure drawers & modals
  const [showDemoDrawer, setShowDemoDrawer] = useState<boolean>(false);
  const [showRuntimeDrawer, setShowRuntimeDrawer] = useState<boolean>(false);
  const [showReasoningDrawer, setShowReasoningDrawer] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const validationReport = useMemo(() => generateValidationReport(), []);

  // Pipeline execution state
  const [result, setResult] = useState<PipelineResult>(() =>
    runTraceShieldPipeline({
      text: DEMO_SCENARIOS[0].text,
      sourceType: 'LOG_FILE',
      destinationId: CanonicalDestination.PUBLIC_GITHUB,
      policyId: PolicyProfileId.CLOUDOPS,
      backend: ExecutionBackend.CPU,
    })
  );

  // Re-run pipeline deterministically when inputs change
  useEffect(() => {
    const res = runTraceShieldPipeline({
      text: inputText,
      sourceType,
      destinationId,
      policyId,
      backend: executionBackend,
      simulateNpu: executionBackend === ExecutionBackend.QNN_NPU,
    });
    setResult(res);
  }, [inputText, sourceType, destinationId, policyId, executionBackend]);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setInputText(scenario.text);
    setSourceType(scenario.sourceType as any);
    setDestinationId(scenario.destinationId);
    setPolicyId(scenario.policyId);
    setActiveScenarioId(scenario.id);
  };

  const BACKEND_CYCLE: ExecutionBackend[] = [
    ExecutionBackend.CPU,
    ExecutionBackend.QNN_NPU,
    ExecutionBackend.DIRECTML,
    ExecutionBackend.MOCK,
    ExecutionBackend.UNVALIDATED,
  ];

  const handleToggleBackend = () => {
    setExecutionBackend((prev) => {
      const idx = BACKEND_CYCLE.indexOf(prev);
      return BACKEND_CYCLE[(idx + 1) % BACKEND_CYCLE.length];
    });
  };

  const handleClear = () => {
    setInputText('');
    setActiveScenarioId('');
  };

  const currentDestination = DESTINATIONS[destinationId] || DESTINATIONS[CanonicalDestination.PUBLIC_GITHUB];
  const currentPolicy = POLICY_PROFILES[policyId] || POLICY_PROFILES[PolicyProfileId.CLOUDOPS];

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F2F5F8] flex flex-col font-sans selection:bg-[#182635] selection:text-white relative antialiased">
      {/* Background Atmosphere: Controlled studio lighting with 2-3 enormous low-opacity ambient nodes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft muted sapphire / graphite ambient light source top-center */}
        <div className="absolute top-[-15%] left-[25%] w-[1100px] h-[650px] bg-[#1e2b3e]/[0.07] rounded-full blur-[260px]" />
        {/* Extremely subtle cool cyan reflection right */}
        <div className="absolute top-[25%] right-[-15%] w-[900px] h-[700px] bg-[#0e303d]/[0.05] rounded-full blur-[240px]" />
        {/* Very muted emerald depth node bottom-left */}
        <div className="absolute bottom-[-15%] left-[5%] w-[950px] h-[750px] bg-[#092218]/[0.05] rounded-full blur-[280px]" />
        {/* Vignette border containment */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#07090D]/40 to-[#040508]/90 pointer-events-none" />
      </div>

      {/* 1. Minimal Premium Header */}
      <Header
        hardwarePlatform={result.telemetry.hardware_platform}
        executionBackend={executionBackend}
        backendDisplay={result.telemetry.backend_display}
        qnnValidated={result.telemetry.qnn_validated}
        onToggleBackend={handleToggleBackend}
        onOpenDemo={() => setShowDemoDrawer(true)}
        onOpenRuntime={() => setShowRuntimeDrawer(true)}
        onOpenDiagnostics={() => setShowReportModal(true)}
      />

      {/* Main Container: Open yet connected visual hierarchy */}
      <main className="relative z-10 mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-7 space-y-6 sm:space-y-7">
        {/* 2. Pipeline Execution Flow Track */}
        <PipelineFlow result={result} />

        {/* 3. Primary Context Selector Bar: Source -> Destination -> Policy */}
        <ContextBar
          sourceType={sourceType}
          destinationId={destinationId}
          policyId={policyId}
          onSelectSourceType={setSourceType}
          onSelectDestination={setDestinationId}
          onSelectPolicy={setPolicyId}
          activeScenarioId={activeScenarioId}
        />

        {/* 4. Primary Hero Screen: Evidence Workspace + Security Decision */}
        <div className="grid grid-cols-1 gap-6 sm:gap-7 lg:grid-cols-12 items-start">
          {/* Evidence Workspace (Left, 7 cols) */}
          <div className="lg:col-span-7">
            <EvidenceWorkspace
              inputText={inputText}
              onChangeText={setInputText}
              sourceType={sourceType}
              onSelectSourceType={setSourceType}
              onClear={handleClear}
              onOpenDemo={() => setShowDemoDrawer(true)}
              activeScenarioId={activeScenarioId}
              findingsCount={result.risk.findings_count}
              riskStatus={result.risk.status}
            />
          </div>

          {/* Security Decision Hero (Right, 5 cols) */}
          <div className="lg:col-span-5">
            <DecisionHero
              risk={result.risk}
              releaseStatus={result.release_status}
              destinationDisplayName={currentDestination.display_name}
              policyDisplayName={currentPolicy.display_name}
              onOpenReasoning={() => setShowReasoningDrawer(true)}
            />
          </div>
        </div>

        {/* 5. Security Flow: Evidence Transformation (Side-by-side or clean view) */}
        <TransformationWorkspace
          originalPreview={result.original_preview}
          sanitization={result.sanitization}
          verification={result.verification}
          releaseStatus={result.release_status}
          verifiedSafeText={result.verified_safe_text}
        />

        {/* 6. Independent Closed-Loop Verification Section */}
        <IndependentVerification
          verification={result.verification}
          riskStatus={result.risk.status}
          releaseStatus={result.release_status}
        />
      </main>

      {/* Enterprise Security & Hardware Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#07090D]/95 py-4 px-6 text-center text-xs text-[#7D8794]">
        <span className="font-sans font-medium text-[#B7C0CB]">TraceShield AI 2.0</span>
        <span className="mx-2 text-slate-600">•</span>
        <span className="font-sans">Target: Snapdragon X Series</span>
        <span className="mx-2 text-slate-600">•</span>
        <span className="font-mono text-[11px]">Host: {validationReport.hardware.windows} {validationReport.hardware.architecture}</span>
        <span className="mx-2 text-slate-600">•</span>
        <span className="font-sans">Environment: {validationReport.environmentLabel === 'PHYSICAL WINDOWS MACHINE' ? 'Physical Windows Host' : 'Isolated Container Sandbox'}</span>
      </footer>

      {/* Progressive Disclosure Drawers & Modals */}
      <DemoDrawer
        isOpen={showDemoDrawer}
        onClose={() => setShowDemoDrawer(false)}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
      />

      <RuntimeDrawer
        isOpen={showRuntimeDrawer}
        onClose={() => setShowRuntimeDrawer(false)}
        telemetry={result.telemetry}
      />

      <SecurityReasoningDrawer
        isOpen={showReasoningDrawer}
        onClose={() => setShowReasoningDrawer(false)}
        risk={result.risk}
        destinationDisplayName={currentDestination.display_name}
        policyDisplayName={currentPolicy.display_name}
      />

      <ValidationReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={validationReport}
      />
    </div>
  );
}
