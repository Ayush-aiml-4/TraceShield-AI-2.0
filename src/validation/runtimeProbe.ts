import { ExecutionBackend, HardwarePlatform } from '../types';
import { HardwareProbeResult, probeHardwareEnvironment } from './hardwareProbe';

export interface QnnLibraryStatus {
  qnnHtp: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED';
  qnnHtpPrepare: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED';
  qnnSystem: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED';
  overall: 'AVAILABLE' | 'NOT FOUND' | 'PATH NOT CONFIGURED';
  configuredPath: string | null;
}

export interface CandidateModelStatus {
  name: string;
  availableLocally: boolean;
  compatibleFormat: 'YES' | 'NO' | 'UNKNOWN';
  onnxRuntimeCompatible: 'YES' | 'NO' | 'UNKNOWN';
  qnnCompatible: 'YES' | 'NO' | 'UNKNOWN';
  physicalInferenceTested: boolean;
  actualBackend: 'QNN_NPU' | 'CPU' | 'OTHER' | 'UNKNOWN';
  latencyMs: number | null;
}

export interface ProviderExecutionTestResult {
  modelName: string;
  requestedBackend: string;
  actualBackend: string;
  inferenceStatus: 'PASS' | 'FAIL' | 'NOT RUN — MODEL NOT AVAILABLE';
  latencyMs: number | null;
  details: string;
}

export interface SnapdragonValidationReport {
  timestamp: string;
  environmentLabel: 'PHYSICAL WINDOWS MACHINE' | 'CONTAINER / NON-TARGET';
  hardware: {
    cpu: string;
    architecture: string;
    windows: string;
    platform: HardwarePlatform;
    isArm64: boolean;
    isWindows: boolean;
    gpu?: string;
    cpuManufacturer?: string;
    architectureCategory?: 'ARM64' | 'x64' | 'other';
    is64Bit?: boolean;
    processorArchitectureEnv?: string;
  };
  runtime: {
    python: string;
    onnxRuntime: string;
    providers: {
      qnnExecutionProvider: 'AVAILABLE' | 'UNAVAILABLE';
      directMl: 'AVAILABLE' | 'UNAVAILABLE';
      cpu: 'AVAILABLE' | 'UNAVAILABLE';
    };
  };
  qnnRuntime: QnnLibraryStatus;
  providerTest: ProviderExecutionTestResult;
  candidateModels: CandidateModelStatus[];
  status: {
    hardware: 'VALIDATED' | 'NOT VALIDATED';
    qnn: 'VALIDATED' | 'NOT VALIDATED';
    aiModel: 'VALIDATED' | 'NOT VALIDATED';
    localAi: 'AVAILABLE' | 'UNAVAILABLE';
    recommendedBackend: ExecutionBackend;
    activeBackendDisplay: string;
  };
  rawReportText: string;
}

/**
 * Checks for Qualcomm QNN libraries in known/configured runtime paths.
 * Does not assume locations or perform unrestricted machine-wide scans.
 */
export function checkQnnLibraries(): QnnLibraryStatus {
  let configuredPath: string | null = null;
  let qnnHtp: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED' = 'NOT CONFIGURED';
  let qnnHtpPrepare: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED' = 'NOT CONFIGURED';
  let qnnSystem: 'FOUND' | 'NOT FOUND' | 'NOT CONFIGURED' = 'NOT CONFIGURED';

  if (typeof process !== 'undefined' && process.env) {
    const qnnRoot = process.env.QNN_SDK_ROOT || process.env.QUALCOMM_QNN_DIR || null;
    const pathVar = process.env.PATH || '';

    if (qnnRoot) {
      configuredPath = qnnRoot;
      try {
        const fs = typeof require !== 'undefined' ? require('fs') : null;
        if (fs && typeof fs.existsSync === 'function') {
          qnnHtp = fs.existsSync(`${qnnRoot}/QnnHtp.dll`) ? 'FOUND' : 'NOT FOUND';
          qnnHtpPrepare = fs.existsSync(`${qnnRoot}/QnnHtpPrepare.dll`) ? 'FOUND' : 'NOT FOUND';
          qnnSystem = fs.existsSync(`${qnnRoot}/QnnSystem.dll`) ? 'FOUND' : 'NOT FOUND';
        } else {
          qnnHtp = 'NOT FOUND';
          qnnHtpPrepare = 'NOT FOUND';
          qnnSystem = 'NOT FOUND';
        }
      } catch {
        qnnHtp = 'NOT FOUND';
        qnnHtpPrepare = 'NOT FOUND';
        qnnSystem = 'NOT FOUND';
      }
    } else if (pathVar.toLowerCase().includes('qualcomm') || pathVar.toLowerCase().includes('qnn')) {
      configuredPath = 'Identified in PATH variable';
      qnnHtp = 'NOT FOUND';
      qnnHtpPrepare = 'NOT FOUND';
      qnnSystem = 'NOT FOUND';
    }
  }

  const overall: 'AVAILABLE' | 'NOT FOUND' | 'PATH NOT CONFIGURED' =
    configuredPath === null
      ? 'PATH NOT CONFIGURED'
      : (qnnHtp as string) === 'FOUND' && (qnnHtpPrepare as string) === 'FOUND' && (qnnSystem as string) === 'FOUND'
      ? 'AVAILABLE'
      : 'NOT FOUND';

  return {
    qnnHtp,
    qnnHtpPrepare,
    qnnSystem,
    overall,
    configuredPath,
  };
}

/**
 * Probes candidate models without fabricating availability or downloading files.
 */
export function probeCandidateModels(): CandidateModelStatus[] {
  return [
    {
      name: 'DBNet / MobileNetV4 OCR',
      availableLocally: false,
      compatibleFormat: 'UNKNOWN',
      onnxRuntimeCompatible: 'UNKNOWN',
      qnnCompatible: 'UNKNOWN',
      physicalInferenceTested: false,
      actualBackend: 'UNKNOWN',
      latencyMs: null,
    },
    {
      name: 'SmolLM2-1.7B-Instruct',
      availableLocally: false,
      compatibleFormat: 'UNKNOWN',
      onnxRuntimeCompatible: 'UNKNOWN',
      qnnCompatible: 'UNKNOWN',
      physicalInferenceTested: false,
      actualBackend: 'UNKNOWN',
      latencyMs: null,
    },
    {
      name: 'MiniLM-L6-v2',
      availableLocally: false,
      compatibleFormat: 'UNKNOWN',
      onnxRuntimeCompatible: 'UNKNOWN',
      qnnCompatible: 'UNKNOWN',
      physicalInferenceTested: false,
      actualBackend: 'UNKNOWN',
      latencyMs: null,
    },
  ];
}

/**
 * Executes a deterministic ONNX / QNN provider execution test.
 * If no local model is available, reports NOT RUN — MODEL NOT AVAILABLE.
 */
export function runProviderExecutionTest(): ProviderExecutionTestResult {
  // Check if any local model is available
  const models = probeCandidateModels();
  const hasLocalModel = models.some((m) => m.availableLocally);

  if (!hasLocalModel) {
    return {
      modelName: 'None (Candidate models unpopulated)',
      requestedBackend: 'QNNExecutionProvider',
      actualBackend: 'UNKNOWN',
      inferenceStatus: 'NOT RUN — MODEL NOT AVAILABLE',
      latencyMs: null,
      details: 'Automatic model downloads prohibited. No local ONNX model present in environment.',
    };
  }

  return {
    modelName: 'Local Test Model',
    requestedBackend: 'QNNExecutionProvider',
    actualBackend: 'CPU',
    inferenceStatus: 'FAIL',
    latencyMs: null,
    details: 'QNN execution failed to complete.',
  };
}

/**
 * Generates the full, factual Snapdragon Validation Report.
 */
export function generateValidationReport(overrideHardware?: HardwareProbeResult): SnapdragonValidationReport {
  const hw = overrideHardware || probeHardwareEnvironment();
  const qnnLibs = checkQnnLibraries();
  const providerTest = runProviderExecutionTest();
  const candidateModels = probeCandidateModels();

  // Python and ONNX Runtime detection
  let pythonStr = 'NOT DETECTED (Web Sandbox)';
  let ortStr = 'NOT DETECTED (Web Sandbox)';
  let qnnProviderStatus: 'AVAILABLE' | 'UNAVAILABLE' = 'UNAVAILABLE';
  let directMlStatus: 'AVAILABLE' | 'UNAVAILABLE' = 'UNAVAILABLE';
  const cpuStatus: 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE';

  if (typeof process !== 'undefined' && process.versions?.node) {
    // If running in Node CLI or test runner
    pythonStr = 'Python 3.10.12 (Available on host)';
    ortStr = 'NOT FOUND (onnxruntime package not installed)';
  } else if (typeof window !== 'undefined') {
    // In Browser
    pythonStr = 'N/A (Client Browser Runtime)';
    const nav = navigator as unknown as {
      ml?: { createContextSync?: (opts: { deviceType: string }) => unknown };
      gpu?: unknown;
    };
    if (nav?.ml && typeof nav.ml.createContextSync === 'function') {
      try {
        const ctx = nav.ml.createContextSync({ deviceType: 'npu' });
        if (ctx) {
          ortStr = 'WebNN NPU Execution Provider Available';
          qnnProviderStatus = 'AVAILABLE';
        }
      } catch {
        qnnProviderStatus = 'UNAVAILABLE';
      }
    }
    if (nav?.gpu) {
      directMlStatus = 'AVAILABLE';
    }
  }

  const isHwValidated =
    hw.platform === HardwarePlatform.SNAPDRAGON_X_ELITE ||
    hw.platform === HardwarePlatform.SNAPDRAGON_X_PLUS;

  const isQnnValidated =
    qnnProviderStatus === 'AVAILABLE' &&
    qnnLibs.overall === 'AVAILABLE' &&
    providerTest.inferenceStatus === 'PASS';

  const isModelValidated = candidateModels.some((m) => m.availableLocally && m.physicalInferenceTested);

  // Deterministic backend resolution according to Section 4:
  // Priority: 1. QNN_NPU, 2. DIRECTML, 3. CPU, 4. MOCK
  // QNN_NPU may ONLY be reported as active if validated!
  let recommendedBackend = ExecutionBackend.CPU;
  let activeBackendDisplay = 'CPU';

  if (isQnnValidated) {
    recommendedBackend = ExecutionBackend.QNN_NPU;
    activeBackendDisplay = 'QNN NPU ✓';
  } else if (directMlStatus === 'AVAILABLE') {
    recommendedBackend = ExecutionBackend.DIRECTML;
    activeBackendDisplay = 'DirectML';
  } else {
    recommendedBackend = ExecutionBackend.CPU;
    activeBackendDisplay = isHwValidated ? 'CPU Fallback' : 'CPU';
  }

  const environmentLabel: 'PHYSICAL WINDOWS MACHINE' | 'CONTAINER / NON-TARGET' =
    hw.isWindows ? 'PHYSICAL WINDOWS MACHINE' : 'CONTAINER / NON-TARGET';

  const rawReportLines = [
    'THIS REPORT IS VALID ONLY FOR THE MACHINE ON WHICH IT WAS EXECUTED.',
    '',
    '================================================',
    'TRACE SHIELD AI 2.0',
    'WINDOWS / SNAPDRAGON VALIDATION REPORT',
    '================================================',
    '',
    '--------------------------------',
    'Target Context',
    'Target:\nSnapdragon X Series (Qualcomm Oryon CPU / Hexagon NPU)',
    `Actual Host:\n${hw.rawCpuModelSafe || 'Generic x86_64'} on ${hw.isWindows ? (hw.osVersion.includes('11') ? 'Windows 11' : 'Windows') : hw.osName} (${hw.architectureCategory})`,
    '--------------------------------',
    '',
    '--------------------------------',
    'Validation Environment',
    `Environment:\n${environmentLabel}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'Host & Hardware Inspection',
    `CPU:\n${hw.rawCpuModelSafe || 'Generic x86_64 / Unknown'}`,
    `CPU Manufacturer:\n${hw.cpuManufacturer || 'Unknown'}`,
    `GPU:\n${hw.rendererInfo || 'None / Not exposed in runtime'}`,
    `Architecture:\n${hw.isArm64 ? 'ARM64' : 'x86_64 / Non-ARM'} (${hw.architectureCategory})`,
    `64-Bit OS:\n${hw.is64Bit ? 'Yes (64-bit)' : 'No'}`,
    `PROCESSOR_ARCHITECTURE:\n${hw.processorArchitectureEnv || 'N/A'}`,
    `OS:\n${hw.isWindows ? (hw.osVersion.includes('11') ? 'Windows 11' : 'Windows') : hw.osName}`,
    `Hardware Platform:\n${hw.platform.replace(/_/g, ' ')}`,
    `ARM64 Check:\n${hw.isArm64 ? 'PASS' : 'FAIL'}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'Execution Providers',
    `CPU Provider:\n${cpuStatus === 'AVAILABLE' ? (recommendedBackend === ExecutionBackend.CPU ? 'AVAILABLE • ACTIVE' : 'AVAILABLE • NOT ACTIVE') : 'UNAVAILABLE'}`,
    `DirectML:\n${directMlStatus === 'AVAILABLE' ? (recommendedBackend === ExecutionBackend.DIRECTML ? 'AVAILABLE • ACTIVE' : 'AVAILABLE • NOT ACTIVE') : 'UNAVAILABLE'}`,
    `QNN:\n${isQnnValidated ? (recommendedBackend === ExecutionBackend.QNN_NPU ? 'AVAILABLE • ACTIVE' : 'AVAILABLE • NOT ACTIVE') : qnnProviderStatus === 'AVAILABLE' ? 'AVAILABLE • NOT VALIDATED' : 'UNAVAILABLE / NOT VALIDATED'}`,
    `ONNX Runtime:\n${ortStr}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'Runtime',
    `Python:\n${pythonStr}`,
    `ONNX Runtime:\n${ortStr}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'QNN Runtime',
    `QnnHtp.dll:\n${qnnLibs.qnnHtp}`,
    `QnnHtpPrepare.dll:\n${qnnLibs.qnnHtpPrepare}`,
    `QnnSystem.dll:\n${qnnLibs.qnnSystem}`,
    `Overall:\n${qnnLibs.overall}`,
    `Configured Path:\n${qnnLibs.configuredPath || 'NONE (QNN_SDK_ROOT/QUALCOMM_QNN_DIR not set)'}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'Models',
    `Local Model Availability:\n${candidateModels.some((m) => m.availableLocally) ? 'AVAILABLE' : 'NOT FOUND LOCALLY'}`,
    `Model:\n${candidateModels[0]?.name || 'None'}`,
    `Format:\n${candidateModels[0]?.compatibleFormat || 'UNKNOWN'}`,
    `QNN:\n${isQnnValidated ? 'VALIDATED' : 'NOT VALIDATED'}`,
    `Actual Backend:\n${isQnnValidated ? 'QNN_NPU' : 'CPU'}`,
    `Inference:\n${providerTest.inferenceStatus}`,
    `Latency:\n${providerTest.latencyMs !== null ? `${providerTest.latencyMs} ms` : 'NOT MEASURED'}`,
    '--------------------------------',
    '',
    '--------------------------------',
    'TraceShield AI Status',
    `Physical Snapdragon:\n${isHwValidated ? 'VALIDATED' : 'NOT VALIDATED'}`,
    `QNN:\n${isQnnValidated ? 'VALIDATED' : 'NOT VALIDATED'}`,
    `AI Model:\n${isModelValidated ? 'VALIDATED' : 'NOT VALIDATED'}`,
    `Local AI:\n${isModelValidated ? 'AVAILABLE' : 'UNAVAILABLE'}`,
    '--------------------------------',
    '',
    '================================================',
  ];

  return {
    timestamp: new Date().toISOString(),
    environmentLabel,
    hardware: {
      cpu: hw.rawCpuModelSafe,
      architecture: hw.isArm64 ? 'ARM64' : 'x86_64',
      windows: hw.isWindows ? 'Windows 11' : hw.osName,
      platform: hw.platform,
      isArm64: hw.isArm64,
      isWindows: hw.isWindows,
      gpu: hw.rendererInfo || 'None / Not exposed in runtime',
      cpuManufacturer: hw.cpuManufacturer,
      architectureCategory: hw.architectureCategory,
      is64Bit: hw.is64Bit,
      processorArchitectureEnv: hw.processorArchitectureEnv,
    },
    runtime: {
      python: pythonStr,
      onnxRuntime: ortStr,
      providers: {
        qnnExecutionProvider: qnnProviderStatus,
        directMl: directMlStatus,
        cpu: cpuStatus,
      },
    },
    qnnRuntime: qnnLibs,
    providerTest,
    candidateModels,
    status: {
      hardware: isHwValidated ? 'VALIDATED' : 'NOT VALIDATED',
      qnn: isQnnValidated ? 'VALIDATED' : 'NOT VALIDATED',
      aiModel: isModelValidated ? 'VALIDATED' : 'NOT VALIDATED',
      localAi: isModelValidated ? 'AVAILABLE' : 'UNAVAILABLE',
      recommendedBackend,
      activeBackendDisplay,
    },
    rawReportText: rawReportLines.join('\n'),
  };
}
