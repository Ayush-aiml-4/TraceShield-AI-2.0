# TraceShield AI 2.0 — Demonstration Evidence & Scenario Audits

TraceShield AI 2.0 includes four canonical demonstration scenarios built directly into the user interface and tested continuously by the automated test harness (`scripts/runSecurityHarness.ts`).

Each scenario executes the **genuine production pipeline** end-to-end; no mock overrides or demo-specific shortcuts are permitted.

---

## Scenario Verification Matrix

| Scenario | Input Type | Destination | Policy | Findings | Decision | Verifier | Release Result | Clipboard |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEMO-1** | Production Server Log | `PUBLIC_GITHUB` | `CLOUDOPS` | 7 detected | **`BLOCK`** | PASS | **`BLOCKED`** | **DISABLED** |
| **DEMO-2** | Terminal OCR Stream | `PUBLIC_AI` | `OPENSOURCE` | 10 detected | **`SANITIZE`** | PASS | **`ALLOWED`** | **ENABLED** |
| **DEMO-3** | Clean QuickSort Code | `PUBLIC_GITHUB` | `CLOUDOPS` | 0 detected | **`ALLOW`** | PASS | **`ALLOWED`** | **ENABLED** |
| **DEMO-4** | Malformed Residual Secret | `INTERNAL_SYSTEM` | `CYBERSECURITY` | 2 detected | **`SANITIZE`** | **FAIL** | **`VERIFICATION_HOLD`** | **DISABLED** |

---

## Detailed Scenario Traces

### DEMO-1: Production Server Log
* **Description:** Real-world server error log containing cloud access credentials, database passwords, internal IP addresses, and administrator contact emails.
* **Target Destination:** `PUBLIC_GITHUB` (Exposure Multiplier: $1.6\times$).
* **Governance Policy:** `CLOUDOPS` (Zero tolerance for cloud production credentials).
* **Pipeline Trace:**
  1. *Detection:* Identifies AWS credential patterns, internal IP formats, and emails.
  2. *Risk Assessment:* Content severity 100, multiplied by $1.6\times$ destination exposure, triggering **Hard Rule 2** (Critical Credential targeting Public GitHub).
  3. *Decision:* **`BLOCK`** (Score: 100).
  4. *Sanitization & Verification:* Relational sanitization and verification execute, but the release gate evaluates the mandatory `BLOCK` invariant.
  5. *Release Gating:* **`RELEASE BLOCKED`**. The verified safe text is withheld (`null`), and the clipboard copy button is physically disabled.

### DEMO-2: Terminal Screenshot OCR Stream
* **Description:** Vision OCR extraction buffer from a developer terminal containing environment variables, a GitHub Personal Access Token (PAT), and a PostgreSQL connection string.
* **Target Destination:** `PUBLIC_AI` (Exposure Multiplier: $1.2\times$).
* **Governance Policy:** `OPENSOURCE` (Strict scrub of tokens and internal endpoints).
* **Pipeline Trace:**
  1. *Detection:* Identifies GitHub PAT, RFC1918 internal IP, and database password tokens.
  2. *Risk Assessment:* Triggers **Hard Rule 3** (Credential targeting Public AI Tool $\rightarrow$ Mandatory Sanitize).
  3. *Decision:* **`SANITIZE`**.
  4. *Sanitization:* Replaces raw tokens with relational identifiers (`[REDACTED_GITHUB_TOKEN]`, `[INTERNAL_IP_1]`).
  5. *Independent Verification:* Secondary verifier confirms zero residual tokens and zero raw token bleed (`passed: true`).
  6. *Release Gating:* **`RELEASE ALLOWED`**. Transformed text is released with technical debugging structure preserved.

### DEMO-3: Clean QuickSort Implementation
* **Description:** Benign, standard algorithmic TypeScript code without credentials, secrets, or internal identifiers.
* **Target Destination:** `PUBLIC_GITHUB` (Exposure Multiplier: $1.6\times$).
* **Governance Policy:** `CLOUDOPS`.
* **Pipeline Trace:**
  1. *Detection:* Zero pattern matches; Shannon entropy below detection thresholds.
  2. *Risk Assessment:* Score 0.
  3. *Decision:* **`ALLOW`** (Fast path).
  4. *Verification:* Automatically verified clean.
  5. *Release Gating:* **`RELEASE ALLOWED`**. Original code is immediately ready for export with negligible processing overhead (~0.05 ms).

### DEMO-4: Verification Hold Injection
* **Description:** Malformed nested payload containing deliberate token bleed designed to test the fail-closed defense-in-depth safety net.
* **Target Destination:** `INTERNAL_SYSTEM`.
* **Governance Policy:** `CYBERSECURITY`.
* **Pipeline Trace:**
  1. *Detection:* Finds target token patterns.
  2. *Risk Assessment:* Recommends sanitization.
  3. *Sanitization:* Executes transformation on candidate spans.
  4. *Independent Verification:* The decoupled verifier detects that an unredacted fragment of the sensitive token persists in the output (`passed: false`).
  5. *Release Gating:* **`VERIFICATION_HOLD`**. Release is immediately blocked, safe text is withheld, and clipboard writing is disabled.
