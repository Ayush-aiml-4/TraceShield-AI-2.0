# TraceShield AI 2.0 — Architecture Evidence & Pipeline Design

This document details the multi-layer pipeline, division of responsibilities, and deterministic security architecture implemented in TraceShield AI 2.0.

---

## 1. Closed-Loop Execution Pipeline

TraceShield enforces a sequential, fail-closed pipeline where downstream stages validate upstream transformations:

$$\begin{matrix}
\text{\textbf{Evidence Input}} & \text{(Clipboard, File Upload, Screenshot Buffer)} \\
\downarrow & \\
\text{\textbf{Deterministic Detection}} & \text{(Regex Sweep, Shannon Entropy Analysis)} \\
\downarrow & \\
\text{\textbf{Context Engine}} & \text{(Semantic Disambiguation, Finding Severity Modifiers)} \\
\downarrow & \\
\text{\textbf{Context-Aware Risk Engine}} & \text{(Hard Rules Precedence, Destination Multipliers, Policy Evaluation)} \\
\downarrow & \\
\text{\textbf{Relational Sanitizer}} & \text{(Deterministic Replacement, Consistent Identifier Mapping)} \\
\downarrow & \\
\text{\textbf{Independent Rescan Verifier}} & \text{(Decoupled Rescan, Residual Secrets, Token Bleed, Entropy Anomalies)} \\
\downarrow & \\
\text{\textbf{Release Gate}} & \text{(Dual Authorization Check: Verifier Passed AND Non-BLOCK)}
\end{matrix}$$

---

## 2. Division of Architectural Responsibility

### 1. Deterministic Detection Layer (`src/detection/registry.ts`)
* **Role:** High-speed initial sweep across 14 distinct pattern classes.
* **Mechanism:** Pre-compiled regular expressions and Shannon entropy thresholding ($H \ge 4.5$).
* **Guarantee:** Evaluates all candidate tokens with zero dependence on external network APIs or cloud connectivity.

### 2. Context Engine (`src/ai/contextEngine.ts`)
* **Role:** Evaluates contextual ambiguity when deterministic patterns indicate borderline severity.
* **Design Boundary:** The AI context engine modulates severity modifiers only. It has **zero authority** to grant release permissions or bypass security rules. When deterministic rules are unambiguous, the fast path executes without invoking AI.

### 3. Context-Aware Risk Engine (`src/risk/engine.ts`)
* **Role:** Formulates the final security decision based on four fundamental vectors:
  $$\text{Risk Score} = \text{Base Severity} \times \text{Destination Multiplier} \times \text{Policy Modifier}$$
* **Hard Rules Precedence:**
  * **Hard Rule 1:** Private key targeting external destination $\rightarrow$ **MANDATORY BLOCK**.
  * **Hard Rule 2:** Critical credential targeting Public GitHub $\rightarrow$ **MANDATORY SANITIZE / BLOCK**.
  * **Hard Rule 3:** Credential targeting Public AI Tool $\rightarrow$ **MANDATORY SANITIZE** (protects secrets while preserving developer problem-solving utility).

### 4. Relational Sanitizer (`src/sanitization/sanitizer.ts`)
* **Role:** Transforms sensitive evidence into safe, sanitized text.
* **Relational Consistency:** Multiple occurrences of the same secret receive identical identifiers (e.g. `10.20.14.5` consistently maps to `[INTERNAL_IP_1]` across multiple log lines).
* **Syntactic Preservation:** Surrounding punctuation, stack frame traces, and line delimiters are preserved to maintain technical debugging utility.

### 5. Independent Rescan Verifier (`src/verification/verifier.ts`)
* **Role:** Decoupled auditor that rescans the sanitized output from scratch.
* **Independence:** The verifier does not trust the sanitizer's claims. It executes three independent tests:
  1. **Residual Secret Sweep:** Rescans sanitized text with fresh detection rules.
  2. **Raw Token Bleed Test:** Checks that no substring from `relational_map` keys bleeds into the output.
  3. **Residual Entropy Anomaly Test:** Confirms no unmapped high-entropy fragments remain.

### 6. Release Gate (`src/core/pipeline.ts` & `src/components/TransformationWorkspace.tsx`)
* **Role:** The physical boundary between TraceShield memory and the user's operating system clipboard.
* **Strict Gating:** If the final decision is `BLOCK`, or if the verifier detects any anomaly (`VERIFICATION_HOLD`), the verified safe buffer is suppressed (`null`) and the clipboard copy button is completely disabled.
