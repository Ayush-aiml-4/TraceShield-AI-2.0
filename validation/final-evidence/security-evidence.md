# TraceShield AI 2.0 — Security Evidence & Invariant Verification

This document provides formal verification evidence for the security invariants and data protection guarantees enforced in TraceShield AI 2.0.

---

## 1. Mandatory Security Invariants (INV-01 to INV-10)

| Invariant | What It Protects | Where Enforced | Validation Result |
| :--- | :--- | :--- | :--- |
| **INV-01** | **Deterministic Detection Active:** Ensures all inputs pass through deterministic regex and Shannon entropy sweeps before any downstream routing. | `src/detection/registry.ts`<br>`src/core/pipeline.ts` | **PASS** (Tested in TS-001, TS-009) |
| **INV-02** | **AI Cannot Directly Authorize Release:** Prohibits AI context engines from bypassing rules or granting release independently. | `src/core/pipeline.ts`<br>`src/risk/engine.ts` | **PASS** (Tested in TS-027) |
| **INV-03** | **Sanitization Does Not Auto-Authorize:** Prevents sanitized text from being declared safe without secondary inspection. | `src/core/pipeline.ts` | **PASS** (Tested in TS-003, TS-017) |
| **INV-04** | **Decoupled Independent Verification:** Ensures verifier runs as a separate pass with independent rescan regexes and token-bleed checks. | `src/verification/verifier.ts`<br>`src/core/pipeline.ts` | **PASS** (Tested in TS-013, TS-014) |
| **INV-05** | **BLOCK Status Overrides Verification:** Hard rules and risk policy `BLOCK` status permanently prevent release, even if the verifier passes. | `src/core/pipeline.ts` (Release Gate) | **PASS** (Tested in TS-003, TS-017) |
| **INV-06** | **Verification Failure Triggers Hold:** Any residual secret, token bleed, or unmapped high entropy immediately halts release in `VERIFICATION_HOLD`. | `src/core/pipeline.ts`<br>`src/verification/verifier.ts` | **PASS** (Tested in TS-007, TS-014, TS-022) |
| **INV-07** | **Clipboard Strictly Gated:** Prohibits automated or silent clipboard writes; copying requires manual user click and is disabled when held/blocked. | `src/components/TransformationWorkspace.tsx` | **PASS** (Tested in TS-003, TS-017, TS-022) |
| **INV-08** | **Raw Secret Transient Isolation:** Strips raw secret substrings from all public contracts, UI states, logs, and telemetry. | `src/core/pipeline.ts`<br>`src/types.ts` | **PASS** (Tested in TS-008) |
| **INV-09** | **Truthful Hardware Claims:** Prevents false reporting of Snapdragon X Series or Qualcomm QNN acceleration unless physically probed. | `src/validation/hardwareProbe.ts`<br>`src/core/pipeline.ts` | **PASS** (Tested in TS-028) |
| **INV-10** | **Demo Pipeline Integrity:** Ensures all four canonical demonstration scenarios run through the authentic production pipeline end-to-end. | `src/core/pipeline.ts`<br>`src/components/DemoScenarios.tsx` | **PASS** (Tested in TS-019 to TS-022) |

---

## 2. Raw Secret Protection Audit

### Transient Isolation Architecture
In TraceShield AI 2.0, sensitive values captured during detection are isolated into **Layer B** (`SensitiveMatch.raw_value`). Before any data reaches public interfaces, UI states, or telemetry, the orchestrator strips `raw_value`:
1. **Public Metadata Contract (`FindingMetadata`):** Contains only `category`, `subcategory`, `severity`, character offsets `start`/`end`, and replacement preview token (e.g. `[INTERNAL_IP_1]`).
2. **Telemetry Payloads (`TelemetryRecord`):** Contains only execution latencies in milliseconds, memory heap sizes, and detector match counters.
3. **Log & Storage Audit:**
   * `console.log` / `console.error`: **0 occurrences** in `src/`.
   * `localStorage` / `sessionStorage`: **0 occurrences** across entire application.
   * Diagnostic Reports & Benchmarks: All raw values are redacted; only token categories and timing stats are serialized.
   * `README.md` & Public Docs: Contain only synthetic placeholders and doc references.

---

## 3. Release Gate Formal Logic

The system clipboard and verified safe buffer release are governed strictly by the conjunction:

$$\text{releaseAllowed} = (\text{verification.passed} \equiv \text{true}) \land (\text{finalDecision} \neq \text{BLOCK})$$

### Matrix of Decision & Verification Combinations

| Decision | Verification State | Release Status | Verified Safe Text | Clipboard Write | System Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ALLOW`** | PASS | `ALLOWED` | Released | Enabled | Clean technical evidence permitted to clipboard. |
| **`SANITIZE`** | PASS | `ALLOWED` | Released | Enabled | Transformed evidence with relational tags released. |
| **`REVIEW`** | PASS | `ALLOWED` | Released | Enabled | Low-exposure internal destination evidence released. |
| **`BLOCK`** | PASS | `BLOCKED` | **`null`** | **DISABLED** | Policy/Hard Rule override; release permanently blocked. |
| **`ALLOW`** | FAIL | `VERIFICATION_HOLD` | **`null`** | **DISABLED** | Integrity failure; release halted. |
| **`SANITIZE`** | FAIL | `VERIFICATION_HOLD` | **`null`** | **DISABLED** | Residual secret or token bleed detected; release halted. |
| **`BLOCK`** | FAIL | `BLOCKED` | **`null`** | **DISABLED** | High-risk credential and verifier failure; release blocked. |

### Critical Boundary Distinctions
* **BLOCK Overrides Verifier PASS:** Even if a sanitizer successfully replaces all tokens and the verifier passes, a `BLOCK` decision (e.g. private key targeting Public GitHub) **permanently prevents release**.
* **VERIFICATION_HOLD on Any Verifier Failure:** Sanitization alone does **not** grant release authority. If any residual token is discovered during rescan, the evidence is held in quarantine.
