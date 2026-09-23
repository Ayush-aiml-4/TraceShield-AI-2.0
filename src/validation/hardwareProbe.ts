import { HardwarePlatform } from '../types';

export interface HardwareProbeResult {
  platform: HardwarePlatform;
  osName: string;
  osVersion: string;
  isArm64: boolean;
  isWindows: boolean;
  rawCpuModelSafe: string;
  cpuManufacturer: string;
  architectureCategory: 'ARM64' | 'x64' | 'other';
  is64Bit: boolean;
  processorArchitectureEnv: string;
  rendererInfo: string;
  npuDeviceDetected: boolean;
}

/**
 * Probes the actual physical or virtual execution environment.
 * Detects Windows version, ARM64 architecture, CPU model, and Qualcomm Adreno/NPU signatures.
 * Returns normalized HardwarePlatform: SNAPDRAGON_X_ELITE, SNAPDRAGON_X_PLUS, or OTHER.
 */
export function probeHardwareEnvironment(): HardwareProbeResult {
  let osName = 'Unknown OS';
  let osVersion = 'Unknown Version';
  let isArm64 = false;
  let isWindows = false;
  let rawCpuModelSafe = 'Unknown CPU';
  let cpuManufacturer = 'Unknown';
  let architectureCategory: 'ARM64' | 'x64' | 'other' = 'other';
  let is64Bit = true;
  let processorArchitectureEnv = 'N/A';
  let rendererInfo = '';
  let npuDeviceDetected = false;

  // 1. Browser-environment probing
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    const platformStr = (navigator.platform || '').toLowerCase();

    // Check Windows detection
    if (ua.includes('Windows NT 10.0') || ua.includes('Windows NT 11') || ua.includes('Windows')) {
      isWindows = true;
      // Windows 11 build 22000+ still reports Windows NT 10.0 in UA string
      osName = 'Windows';
      osVersion = '11 (or 10 NT)';
    } else if (ua.includes('Linux')) {
      osName = 'Linux';
      osVersion = 'POSIX';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
      osName = 'macOS';
      osVersion = 'Darwin';
    }

    // Check ARM64
    if (
      ua.toLowerCase().includes('arm64') ||
      ua.toLowerCase().includes('aarch64') ||
      platformStr.includes('arm') ||
      platformStr.includes('aarch64')
    ) {
      isArm64 = true;
    }

    // Check WebGL Unmasked Renderer
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          rendererInfo = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toString();
        }
      }
    } catch {
      rendererInfo = '';
    }

    // WebNN NPU Probe
    const nav = navigator as unknown as { ml?: { createContextSync?: (opts: { deviceType: string }) => unknown } };
    if (nav?.ml && typeof nav.ml.createContextSync === 'function') {
      try {
        const ctx = nav.ml.createContextSync({ deviceType: 'npu' });
        npuDeviceDetected = !!ctx;
      } catch {
        npuDeviceDetected = false;
      }
    }

    // Parse renderer / client hints
    const lowerRenderer = rendererInfo.toLowerCase();
    if (lowerRenderer.includes('adreno') || lowerRenderer.includes('qualcomm')) {
      isArm64 = true;
      if (lowerRenderer.includes('x1-85') || lowerRenderer.includes('x elite')) {
        rawCpuModelSafe = 'Qualcomm Oryon CPU / Adreno X1-85 GPU (Snapdragon X Elite)';
      } else if (lowerRenderer.includes('x1-45') || lowerRenderer.includes('x plus')) {
        rawCpuModelSafe = 'Qualcomm Oryon CPU / Adreno X1-45 GPU (Snapdragon X Plus)';
      } else {
        rawCpuModelSafe = `Qualcomm Adreno GPU (${rendererInfo})`;
      }
    } else if (rendererInfo) {
      rawCpuModelSafe = `GPU: ${rendererInfo.slice(0, 60)}`;
    }
  }

  // 2. Node.js / CLI probing (if running outside browser)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      if (process.platform === 'win32') {
        isWindows = true;
        osName = 'Windows';
        osVersion = '11/10';
      } else if (process.platform === 'linux') {
        osName = 'Linux';
      } else if (process.platform === 'darwin') {
        osName = 'macOS';
      }

      if (process.arch === 'arm64') {
        isArm64 = true;
      }

      processorArchitectureEnv = process.env.PROCESSOR_ARCHITECTURE || 'N/A';
      const procArch = process.env.PROCESSOR_ARCHITECTURE || '';
      const procId = process.env.PROCESSOR_IDENTIFIER || '';

      if (procArch === 'ARM64' || procId.toLowerCase().includes('qualcomm') || procId.toLowerCase().includes('snapdragon')) {
        isArm64 = true;
        cpuManufacturer = 'Qualcomm Technologies';
        if (procId.toLowerCase().includes('elite') || procId.toLowerCase().includes('x1e')) {
          rawCpuModelSafe = 'Qualcomm Oryon CPU (Snapdragon X Elite)';
        } else if (procId.toLowerCase().includes('plus') || procId.toLowerCase().includes('x1p')) {
          rawCpuModelSafe = 'Qualcomm Oryon CPU (Snapdragon X Plus)';
        } else {
          rawCpuModelSafe = procId.slice(0, 60);
        }
      }

      // Check os module for CPU model and release if safe
      try {
        const getMod = (globalThis as unknown as { process?: { getBuiltinModule?: (m: string) => unknown } }).process?.getBuiltinModule;
        const os = (getMod ? (getMod('os') as typeof import('os')) : (typeof require !== 'undefined' ? require('os') : null));
        if (os) {
          if (typeof os.release === 'function') {
            osVersion = `${os.type ? os.type() : osName} ${os.release()}`;
          }
          if (rawCpuModelSafe === 'Unknown CPU' && typeof os.cpus === 'function') {
            const cpus = os.cpus();
            if (cpus && cpus.length > 0 && cpus[0].model && cpus[0].model !== 'unknown') {
              rawCpuModelSafe = cpus[0].model;
            }
          }
        }
      } catch {
        // ignore
      }

      // Check /proc/cpuinfo for Linux environments
      if (rawCpuModelSafe === 'Unknown CPU') {
        try {
          const getMod = (globalThis as unknown as { process?: { getBuiltinModule?: (m: string) => unknown } }).process?.getBuiltinModule;
          const fs = (getMod ? (getMod('fs') as typeof import('fs')) : (typeof require !== 'undefined' ? require('fs') : null));
          if (fs && typeof fs.existsSync === 'function' && fs.existsSync('/proc/cpuinfo')) {
            const cpuinfo: string = fs.readFileSync('/proc/cpuinfo', 'utf-8');
            const vendorMatch = cpuinfo.match(/vendor_id\s*:\s*(.+)/);
            const modelMatch = cpuinfo.match(/model name\s*:\s*(.+)/);
            if (modelMatch && modelMatch[1]?.trim() && modelMatch[1].trim() !== 'unknown') {
              rawCpuModelSafe = modelMatch[1].trim();
            } else if (vendorMatch && vendorMatch[1]?.trim()) {
              const vendor = vendorMatch[1].trim();
              if (vendor.includes('AMD')) {
                cpuManufacturer = 'Advanced Micro Devices (AMD)';
                rawCpuModelSafe = 'AuthenticAMD x86_64 Processor';
              } else if (vendor.includes('Intel')) {
                cpuManufacturer = 'Intel Corporation';
                rawCpuModelSafe = 'GenuineIntel x86_64 Processor';
              } else {
                cpuManufacturer = vendor;
                rawCpuModelSafe = `${vendor} Processor`;
              }
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore in browser
    }
  }

  // Detect architecture category and 64-bit state
  if (isArm64) {
    architectureCategory = 'ARM64';
  } else if (
    (typeof process !== 'undefined' && process.arch === 'x64') ||
    (typeof navigator !== 'undefined' && (navigator.platform.includes('64') || navigator.userAgent.includes('x86_64') || navigator.userAgent.includes('Win64')))
  ) {
    architectureCategory = 'x64';
  } else {
    architectureCategory = 'other';
  }

  is64Bit = architectureCategory === 'x64' || architectureCategory === 'ARM64';

  // Determine normalized HardwarePlatform
  let platform = HardwarePlatform.OTHER;
  const lowerCpu = rawCpuModelSafe.toLowerCase();
  const lowerRenderer = rendererInfo.toLowerCase();

  if (
    lowerCpu.includes('x elite') ||
    lowerCpu.includes('x1e') ||
    lowerRenderer.includes('x1-85') ||
    lowerRenderer.includes('x elite')
  ) {
    platform = HardwarePlatform.SNAPDRAGON_X_ELITE;
  } else if (
    lowerCpu.includes('x plus') ||
    lowerCpu.includes('x1p') ||
    lowerRenderer.includes('x1-45') ||
    lowerRenderer.includes('x plus')
  ) {
    platform = HardwarePlatform.SNAPDRAGON_X_PLUS;
  } else if (lowerCpu.includes('snapdragon') || lowerRenderer.includes('adreno')) {
    // Default to Snapdragon X Elite if Qualcomm Snapdragon PC detected
    platform = HardwarePlatform.SNAPDRAGON_X_ELITE;
  } else {
    platform = HardwarePlatform.OTHER;
  }

  return {
    platform,
    osName,
    osVersion,
    isArm64,
    isWindows,
    rawCpuModelSafe,
    cpuManufacturer,
    architectureCategory,
    is64Bit,
    processorArchitectureEnv,
    rendererInfo,
    npuDeviceDetected,
  };
}

export function getHardwarePlatform(): HardwarePlatform {
  return probeHardwareEnvironment().platform;
}
