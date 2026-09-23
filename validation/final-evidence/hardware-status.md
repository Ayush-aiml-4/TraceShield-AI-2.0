# TraceShield AI 2.0 — Hardware Status & Target Platform Classification

This document establishes the official hardware classification for TraceShield AI 2.0, providing unambiguous disclosure of the development test environment versus the target deployment silicon.

---

## 1. Development Validation

* **Current Environment:** Linux x86_64 container / sandbox (`4.19.0-gvisor`)
* **Probed Host CPU:** `AuthenticAMD x86_64 Processor` (2 virtual cores)
* **Execution Backend:** Local Host CPU (`ExecutionBackend.CPU`)
* **Functional Security & Application Behavior:** **`VALIDATED`**
  * Core detector registry
  * Context-aware risk engine (Hard rules, multipliers, policies)
  * Relational sanitization
  * Independent rescan verification
  * Release gating and clipboard isolation
  * Automated regression suites (29 functional tests, 10 security invariants)

---

## 2. Snapdragon Target Platform

* **Target Operating System:** Windows 11 on ARM64 (`AArch64`)
* **Target Hardware:** Qualcomm Snapdragon X Series (Qualcomm Oryon CPU / Hexagon NPU)
* **Windows 11 ARM64 Physical Execution:** **`NOT PHYSICALLY VALIDATED`**
* **Qualcomm Snapdragon Physical Execution:** **`NOT PHYSICALLY VALIDATED`**

---

## 3. Qualcomm Runtime & Acceleration Providers

| Runtime Component | Target File / Provider | Status in Current Environment |
| :--- | :--- | :--- |
| **Qualcomm QNN SDK** | `QnnHtp.dll`, `QnnSystem.dll` | **`NOT VALIDATED`** (Path not configured / Linux host) |
| **Qualcomm Hexagon NPU** | `QNNExecutionProvider` (HTP backend) | **`NOT VALIDATED`** (No physical NPU accessible) |
| **DirectML Execution Provider** | `DmlExecutionProvider` | **`NOT VALIDATED`** (DirectX 12 unavailable on container) |
| **Local Vision / OCR Model** | `DBNet / MobileNetV4` | **`EXPERIMENTAL`** (Zero automatic download policy enforced) |

---

## 4. Official Architectural Interpretation

The TraceShield AI 2.0 software architecture contains the target-platform integration paths, runtime detection hooks, and validation tooling:
* Native Windows PowerShell validation scripts (`scripts/runWindowsSnapdragonValidation.ps1`)
* Snapdragon NPU benchmark automation (`scripts/runSnapdragonBenchmark.ps1`)
* Runtime execution provider probing logic (`src/validation/runtimeProbe.ts`)

However, **target hardware execution has not been physically demonstrated in the current development environment**.

The project is accurately described as:
> **"Designed for validation on Snapdragon Windows ARM64."**

The project does **NOT** claim "Snapdragon compatible" or "NPU validated" until native physical tests are executed on a physical Windows 11 ARM64 machine.
