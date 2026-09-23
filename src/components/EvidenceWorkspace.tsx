import React, { useRef, useState } from 'react';
import {
  FileText,
  Clipboard,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
} from 'lucide-react';
import { InfoPopover } from './InfoPopover';
import { RiskStatus } from '../types';

interface EvidenceWorkspaceProps {
  inputText: string;
  onChangeText: (val: string) => void;
  sourceType: string;
  onSelectSourceType: (type: 'CLIPBOARD' | 'LOG_FILE' | 'SCREENSHOT' | 'CODE_FILE') => void;
  onClear: () => void;
  onOpenDemo: () => void;
  activeScenarioId?: string;
  findingsCount?: number;
  riskStatus?: RiskStatus;
}

const SUPPORTED_EXTENSIONS = ['.txt', '.log', '.json', '.yaml', '.yml', '.ts', '.js', '.py', '.sh', '.env', '.go', '.rs'];

export const EvidenceWorkspace: React.FC<EvidenceWorkspaceProps> = ({
  inputText,
  onChangeText,
  sourceType,
  onSelectSourceType,
  onClear,
  onOpenDemo,
  activeScenarioId,
  findingsCount = 0,
  riskStatus = RiskStatus.ALLOW,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported file format "${ext}". Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      if (e.target) e.target.value = '';
      return;
    }

    // Check empty file
    if (file.size === 0) {
      setFileError(`File "${file.name}" is empty (0 bytes). Please select a file with technical content.`);
      if (e.target) e.target.value = '';
      return;
    }

    setIsProcessingFile(true);
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        onChangeText(text);
        setSelectedFileName(file.name);
        setSelectedFileSize(file.size);
        if (file.name.endsWith('.log')) onSelectSourceType('LOG_FILE');
        else if (file.name.match(/\.(ts|js|py|go|rs|json|yml|yaml|sh|env)$/)) onSelectSourceType('CODE_FILE');
      }
      setIsProcessingFile(false);
      if (e.target) e.target.value = '';
    };

    reader.onerror = () => {
      setFileError(`Failed to read file "${file.name}". File may be locked or inaccessible.`);
      setIsProcessingFile(false);
      if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleClearAll = () => {
    onClear();
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setFileError(null);
  };

  const handlePasteClipboard = async () => {
    try {
      setFileError(null);
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeText(text);
        onSelectSourceType('CLIPBOARD');
        setSelectedFileName(null);
        setSelectedFileSize(null);
      }
    } catch {
      setFileError('Unable to access clipboard. Please use Ctrl+V / Cmd+V directly in the editor.');
    }
  };

  // Derive interaction state
  const isWorkspaceEmpty = !inputText.trim();
  const hasFindings = findingsCount > 0;
  const isClean = !isWorkspaceEmpty && !hasFindings;

  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D1118]/75 p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all">
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      {/* Title & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#141A23] text-[#B7C0CB]">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-xs font-sans font-semibold tracking-wider uppercase text-[#B7C0CB]">
              Evidence Ingestion
            </h2>
            <InfoPopover
              title="Evidence Workspace"
              description="Analyze logs, source code, configuration, credentials, OCR screenshots, and technical content with local deterministic inspection."
            />

            {/* Current State Indicator Badge */}
            {fileError ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-950/40 px-2 py-0.5 text-[10px] font-mono font-medium text-rose-300">
                <AlertCircle className="h-3 w-3" />
                <span>ERROR</span>
              </span>
            ) : isProcessingFile ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>PROCESSING</span>
              </span>
            ) : isWorkspaceEmpty ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-medium text-[#7D8794]">
                <span>EMPTY</span>
              </span>
            ) : hasFindings ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                <span>FINDINGS DETECTED ({findingsCount})</span>
              </span>
            ) : isClean ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                <span>CLEAN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-medium text-[#B7C0CB]">
                <span>READY</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7D8794] mt-1 font-sans">
            Preserve operational context while eliminating sensitive exposure.
          </p>
        </div>

        {/* Input Action Buttons - Understated Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action: Paste Evidence */}
          <div className="flex items-center rounded-xl border border-white/15 bg-[#181F29] px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#1E2734] transition-colors">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#F2F5F8] cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 rounded"
              title="Paste text from system clipboard"
            >
              <Clipboard className="h-3.5 w-3.5 text-[#B7C0CB]" />
              <span>Paste Evidence</span>
            </button>
            <InfoPopover
              title="Paste Evidence"
              description="Analyze logs, source code, configuration, credentials, and technical content pasted from clipboard."
              className="ml-1.5"
            />
          </div>

          {/* Secondary Action: Upload File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.log,.json,.yaml,.yml,.ts,.js,.py,.sh,.env,.go,.rs"
          />
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#141A23]/80 px-3 py-1.5 hover:bg-[#181F29] hover:border-white/15 transition-colors">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#B7C0CB] hover:text-[#F2F5F8] cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 rounded"
              title="Upload log or code file (.log, .ts, .js, .py, .env, .json, .yaml, .txt, .sh)"
            >
              <Upload className="h-3.5 w-3.5 text-[#7D8794]" />
              <span>Upload File</span>
            </button>
            <InfoPopover
              title="Upload File"
              description="Upload local log files, source code files (.ts, .js, .py, .go, .rs), configuration (.env, .yaml), or environment traces."
              className="ml-1.5"
            />
          </div>

          {/* Secondary Action: Screenshot Mode */}
          <div
            className={`flex items-center rounded-xl border px-3 py-1.5 transition-colors ${
              sourceType === 'SCREENSHOT'
                ? 'border-white/20 bg-[#181F29] text-[#F2F5F8]'
                : 'border-white/[0.08] bg-[#141A23]/80 text-[#B7C0CB] hover:bg-[#181F29] hover:border-white/15'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectSourceType('SCREENSHOT')}
              className="flex items-center gap-1.5 text-xs font-sans font-medium cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 rounded"
              title="Set source format to OCR screenshot extraction"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#7D8794]" />
              <span>Screenshot</span>
              <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-mono text-amber-300">
                Candidate
              </span>
            </button>
            <InfoPopover
              title="Screenshot OCR (Candidate / Experimental Path)"
              description="Analyzes terminal dumps and UI logs from screen captures. Real-time local NPU OCR is in candidate status (no external weights downloaded automatically)."
              className="ml-1.5"
            />
          </div>

          {/* Clear Editor */}
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-white/[0.08] bg-[#141A23]/80 text-[#7D8794] hover:border-rose-500/30 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-rose-500/50"
            title="Clear workspace"
            aria-label="Clear workspace"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* File Upload Error Notice */}
      {fileError && (
        <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-rose-500/35 bg-rose-950/30 p-3 text-xs font-sans text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{fileError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="text-rose-400 hover:text-rose-200 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Selected File Active Pill */}
      {selectedFileName && !fileError && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#141A23]/80 px-3.5 py-1.5 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#B7C0CB]">
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-[#F2F5F8]">{selectedFileName}</span>
            {selectedFileSize !== null && (
              <span className="text-[#7D8794] font-mono text-[11px]">
                ({(selectedFileSize / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFileName(null);
              setSelectedFileSize(null);
            }}
            className="flex items-center gap-1 text-[11px] text-[#7D8794] hover:text-[#F2F5F8] transition-colors cursor-pointer"
            title="Unlink file metadata"
          >
            <X className="h-3 w-3" />
            <span>Unlink</span>
          </button>
        </div>
      )}

      {/* Screenshot / Vision Candidate Notice Banner */}
      {sourceType === 'SCREENSHOT' && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-950/20 px-3.5 py-2 text-xs font-sans text-amber-200/90">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Screenshot / OCR Vision Stream:</strong> Candidate path active. Pre-processed terminal text is ingested locally with zero automated external model downloads.
            </span>
          </div>
          <InfoPopover
            title="Screenshot Candidate Mode"
            description="Terminal captures and error dialogs are analyzed via OCR text extraction pipelines. In production on Snapdragon, this utilizes Qualcomm Hexagon NPU vision operators."
            className="ml-2"
          />
        </div>
      )}

      {/* Inner Editor Surface: Deep Obsidian (#05070B) Cavity with Inner Shadow */}
      <div className="mt-4 relative rounded-xl border border-white/[0.06] bg-[#05070B] shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] overflow-hidden focus-within:border-white/20 transition-colors">
        <textarea
          value={inputText}
          onChange={(e) => onChangeText(e.target.value)}
          rows={7}
          placeholder="Paste technical logs, stack traces, cloud metrics, or configuration with potential credentials..."
          className="w-full bg-transparent font-mono text-xs text-[#F2F5F8] p-4 leading-relaxed placeholder:text-[#7D8794]/50 focus:outline-hidden transition-colors selection:bg-[#1a2535] selection:text-white resize-y"
          spellCheck={false}
          aria-label="Technical Evidence Input Buffer"
        />
      </div>

      {/* Workspace Footer Metadata */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#7D8794]">
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          <span className="text-[#B7C0CB]">{inputText.length} chars</span>
          <span className="text-slate-600">•</span>
          <span className="text-[#7D8794]">{inputText.split('\n').length} lines</span>
          {activeScenarioId && (
            <>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Synthetic Demo Scenario</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={onOpenDemo}
            className="text-[#B7C0CB] hover:text-[#F2F5F8] underline underline-offset-2 transition-colors cursor-pointer font-sans focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 rounded px-1"
          >
            Load Benchmark Scenario →
          </button>
          <span className="flex items-center gap-1.5 text-[#7D8794]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Local Deterministic Execution</span>
          </span>
        </div>
      </div>
    </div>
  );
};
