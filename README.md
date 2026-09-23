# TraceShield AI 2.0
**On-Device Context-Aware Privacy & Security Layer for Technical Workflows**

---

## 1. Overview & Problem Statement

Modern software engineering and cybersecurity operations increasingly rely on cloud-hosted AI models, public code repositories, and collaborative issue trackers. In everyday workflows, developers copy and paste terminal error traces, cloud infrastructure logs, database connection strings, and configuration dumps into external AI web tools and code repositories.

Traditional Data Loss Prevention (DLP) tools suffer from two critical flaws:
1. **Context Blindness:** They act as binary blockers without considering *where* evidence came from, *where* it is being sent, or *what governance policy* applies. Pasting an internal IP into a private local terminal is treated identically to pasting a production database credential into a public repository.
2. **All-or-Nothing Interruption:** They either block the developer entirely (causing frustration and prompt workarounds) or blindly transmit raw logs containing API tokens and customer PII to cloud LLMs.

**TraceShield AI 2.0** provides a deterministic, on-device security layer designed to analyze evidence before egress, evaluate mathematical and rule-based risk in context, sanitize secrets while preserving structural utility, independently verify that no sensitive data bleeds through, and gate release to the system clipboard.

---

## 2. Core Differentiator: Why TraceShield Is Different

TraceShield does not treat security as a simple regex pattern match or an external cloud-dependent inspection. Its core architecture combines four dimensions:

$$\text{Risk Decision} = f(\text{Content}, \text{Origin Context}, \text{Destination Context}, \text{Governance Policy})$$

1. **Content:** Deterministic pattern matching and Shannon entropy scoring identify high-confidence tokens (AWS keys, GitHub PATs, JWTs, private keys, connection strings, emails, IPs, stack traces).
2. **Origin Context:** Whether the text originated from a unit test fixture, a production server log, an environment file, or an OCR screenshot.
3. **Destination Context:** Multipliers calibrate risk based on the data boundary:
   * **Local IDE** ($0.2\times$): Low exposure boundary (local terminal, developer IDE).
   * **Internal System** ($0.6\times$): Corporate boundary (internal Slack, Jira, corporate Confluence).
   * **Public AI Tool** ($1.2\times$): External boundary (external LLM prompts, public chatbots).
   * **Public GitHub** ($1.6\times$): Public internet boundary (open-source pull requests, public gists).
4. **Governance Policy:** Organization profiles enforce context-dependent thresholds:
   * **Cloud / DevOps:** Strict zero-tolerance for cloud credentials and internal infrastructure.
   * **Public Open Source:** Complete scrub of internal endpoints, author PII, and tokens.
   * **Cybersecurity Lab:** Allows technical stack frames, telemetry, and threat indicators while scrubbing live production credentials.

### The Closed-Loop Pipeline
$$\text{Input} \longrightarrow \text{Detect} \longrightarrow \text{Context Risk} \longrightarrow \text{Sanitize} \longrightarrow \text{Rescan & Verify} \longrightarrow \text{Gated Release}$$

Crucially, **the sanitizer does not declare its own output safe**. An independent verification module rescans the transformed output. If residual tokens, raw secrets, or unexpected high-entropy fragments remain, release is automatically halted in a **Verification Hold**.

---

## 3. Status Classification & Hardware Realities

To maintain absolute technical truthfulness, project capabilities are classified into four distinct tiers:

| Tier | Definition | Current Implementations |
| :--- | :--- | :--- |
| **VALIDATED** | Fully implemented and physically proven through automated test harnesses. | • 29/29 Functional Validation Tests<br>• 10/10 Mandatory Security Invariants<br>• Relational Sanitization & Independent Rescan<br>• Release Gate & Strict Clipboard Gating<br>• 20-Iteration CPU Benchmark Suite<br>• TypeScript strict compilation & Vite production build |
| **IMPLEMENTED** | Complete software logic active in codebase; executes on available host CPU. | • Multi-detector registry (AWS, GitHub, JWT, Keys, IPs, DB, PII)<br>• Hard security rules precedence (Rule 1, 2, 3)<br>• Hardware runtime probing & container detection<br>• Live telemetry & application network monitoring |
| **TARGET** | Intended deployment silicon and operating system environment. | • Windows 11 on ARM64 (`AArch64`)<br>• Qualcomm Snapdragon X Elite / Snapdragon X Plus<br>• Qualcomm Oryon CPU, Adreno GPU, Hexagon NPU |
| **EXPERIMENTAL** | Candidate paths pending local model weights or specific platform drivers. | • Screenshot OCR vision extraction via local ONNX weights<br>• QNN HTP hardware execution provider (`QnnHtp.dll`)<br>• DirectML execution provider (`DmlExecutionProvider`) |

### Development Host vs. Target Silicon Notice
* **Actual Probed Host:** Linux POSIX Container on AMD x86_64 CPU (`AuthenticAMD x86_64 Processor`).
* **Hardware Status:** `CONTAINER / NON-TARGET`.
* **Truth in Measurement:** Because testing took place in a virtualized container sandbox, all benchmark measurements reflect host CPU performance. The application explicitly displays `UNAVAILABLE` for QNN and NPU execution rather than fabricating acceleration claims.

---

## 4. Pipeline Architecture & Security Invariants

### The Six-Stage Pipeline
1. **Ingestion:** Supports clipboard text, uploaded log/code files (`.log`, `.ts`, `.py`, `.env`), and screenshot OCR candidate inputs.
2. **Fast Pre-Filter & Detection (Deterministic CPU):** High-speed regex sweep and Shannon entropy analysis evaluate token candidates.
3. **Context Risk Engine:** Computes risk scores and enforces non-negotiable Hard Rules:
   * **Hard Rule 1:** Private key block targeting external destination $\rightarrow$ **MANDATORY BLOCK**.
   * **Hard Rule 2:** Critical credential targeting Public GitHub $\rightarrow$ **MANDATORY SANITIZE / BLOCK**.
   * **Hard Rule 3:** Credential targeting Public AI Tool $\rightarrow$ **MANDATORY SANITIZE** (prevents unnecessary blocking when safe redaction enables developer utility).
4. **Relational Sanitization:** Ephemeral replacement preserving context (e.g., repeating IP `10.20.14.5` maps consistently to `[INTERNAL_IP_1]` throughout the text).
5. **Independent Rescan Verification:** Fully decoupled verifier rescans output for residual regex matches, raw token substrings, and Shannon entropy spikes ($H \ge 4.5$).
6. **Release Gate:** Evaluates dual condition:
   $$\text{Release Allowed} \iff (\text{verification.passed} = \text{true}) \land (\text{decision} \neq \text{BLOCK})$$
   If blocked or held, system clipboard writing is strictly disabled and verified safe text is withheld.

### The 10 Mandatory Security Invariants
* **INV-01:** Deterministic detection remains active on all inputs.
* **INV-02:** AI/context analysis cannot directly authorize release.
* **INV-03:** Sanitization does not automatically authorize release without verification.
* **INV-04:** Verification runs as an independent decoupled pass.
* **INV-05:** `BLOCK` decisions permanently prevent release even if sanitization passes.
* **INV-06:** Verification failure immediately triggers `VERIFICATION_HOLD`.
* **INV-07:** Clipboard is never silently written or modified; requires explicit user action.
* **INV-08:** Raw sensitive values are never persisted in telemetry, UI states, or logs.
* **INV-09:** Snapdragon/QNN acceleration is reported only when confirmed by native hardware probes.
* **INV-10:** Demo scenarios execute the genuine production pipeline end-to-end.

---

## 5. Benchmark & Validation Methodology

### Validation Test Suites
The validation suite (`scripts/runSecurityHarness.ts` and `scripts/runValidationPass.ts`) executes 29 discrete functional tests and 10 security invariant assertions:
* **TS-001 to TS-007:** Core validation matrix across clean text, Public AI, Public GitHub, internal environments, policy shifts, and token bleed hold.
* **TS-008 to TS-012:** Telemetry safety, Shannon entropy bounds, relational consistency, and context preservation.
* **TS-013 to TS-015:** Independent verifier sensitivity to residual secrets and entropy anomalies.
* **TS-016 to TS-018:** Release gating logic and destination exposure multipliers.
* **TS-019 to TS-022:** The four canonical demonstration scenarios.
* **TS-023 to TS-025:** Hard Security Rules 1, 2, and 3 precedence.
* **TS-026 to TS-029:** Telemetry timing accuracy, non-fabricated AI execution, runtime platform reporting, and network monitoring truthfulness.

### Benchmark Execution (20 Runs Per Stage)
*Benchmarked on host CPU with high-resolution wall-clock timers (`performance.now()`):*
* **Clean Input Processing:** Average $0.05\text{ ms}$, Median $0.04\text{ ms}$, P95 $0.11\text{ ms}$
* **Deterministic Secret Detection:** Average $0.11\text{ ms}$, Median $0.10\text{ ms}$, P95 $0.21\text{ ms}$
* **Evidence Sanitization:** Average $0.02\text{ ms}$, Median $0.01\text{ ms}$, P95 $0.06\text{ ms}$
* **Independent Rescan Verification:** Average $0.32\text{ ms}$, Median $0.08\text{ ms}$, P95 $4.85\text{ ms}$
* **Complete Pipeline:** Average $0.43\text{ ms}$, Median $0.39\text{ ms}$, P95 $0.84\text{ ms}$
* **AI Context Inference:** Explicitly marked `NOT MEASURED` (No local weights downloaded).

---

## 6. Demonstration Scenarios

TraceShield includes four pre-packaged scenarios demonstrating real security outcomes:

1. **DEMO-1: Production Server Log (`BLOCK` $\rightarrow$ `RELEASE BLOCKED`)**
   * Multi-leaked secrets (AWS secret key, database password, admin email) targeting **Public GitHub** under **CloudOps** policy.
   * *Outcome:* Risk score 100, Hard Rule 2 triggered, release completely blocked, clipboard write disabled.
2. **DEMO-2: Terminal Screenshot OCR (`SANITIZE` $\rightarrow$ `RELEASE ALLOWED`)**
   * GitHub PAT and PostgreSQL connection string targeting **Public AI Tool** under **Open Source** policy.
   * *Outcome:* Hard Rule 3 precedence activates sanitization; independent verifier passes; release allowed with relational tags.
3. **DEMO-3: Clean Benchmark Code (`ALLOW` $\rightarrow$ `RELEASE ALLOWED`)**
   * Benign QuickSort algorithm targeting **Public GitHub**.
   * *Outcome:* Zero findings detected, fast-path allow, immediate release authorization.
4. **DEMO-4: Verification Hold Injection (`SANITIZE` $\rightarrow$ `VERIFICATION HOLD`)**
   * Malformed nested secret token simulating a pre-sanitization leak or regex bypass.
   * *Outcome:* Independent verifier detects residual secret, rejects release authorization, and places evidence in quarantine hold.

---

## 7. Running & Testing

### Development Server
```bash
npm run dev
# Starts Vite local server on http://localhost:3000
```

### TypeScript Validation
```bash
npm run lint
# Executes tsc --noEmit with zero type errors
```

### Production Build
```bash
npm run build
# Compiles application to /dist with optimized assets
```

### Security Validation Harness
```bash
npx tsx scripts/runSecurityHarness.ts
# Executes 29 automated test cases and 10 security invariants
```

### Benchmark Suite
```bash
npx tsx scripts/runBenchmarkCli.ts 20
# Executes 20-iteration benchmark suite across all pipeline stages
```

### Physical Windows Snapdragon Validation (Target Hardware)
*On a physical Windows 11 ARM64 Snapdragon machine:*
```powershell
powershell -ExecutionPolicy Bypass -File scripts/runWindowsSnapdragonValidation.ps1
powershell -ExecutionPolicy Bypass -File scripts/runSnapdragonBenchmark.ps1 -Iterations 20
```

---

## 8. Technical Boundaries & Responsible Security Claims

* TraceShield is a developer-facing privacy and defense-in-depth utility, not an infallible cryptographic firewall.
* Shannon entropy calculations and regular expressions reduce accidental exposure of standard API tokens and credentials; they cannot guarantee detection of arbitrary steganography or custom ciphertexts.
* Network isolation claims are strictly limited to the instrumented application boundary; machine-wide network traffic is not claimed or inferred.
* No local model weights are downloaded silently or automatically.
