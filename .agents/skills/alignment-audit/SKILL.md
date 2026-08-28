---
name: alignment-audit
description: Conduct a plan-and-spec alignment audit using auditor sub-agents to verify that implemented code diffs match approved plans/PRDs/specs 100% down to every item. Findings are categorized by 4-level urgency with mandatory "WHY" (strategic & product impact) rationale. Produces alignment-audit-report.md with a gate decision. Use before PR merge, after implementation-tdd Green, before code-review. Do NOT use for code quality, naming, or edge-case review (use code-review).
---

# Alignment Audit (Plan & Spec Fidelity Auditor)

> **Mental model:** _This skill is the spec compliance auditor. It verifies 100% of what was promised was delivered — nothing more, nothing less. Not code quality. Not edge cases. Not naming. JUST spec fidelity + scope creep detection._

This skill is the **upstream quality gate** executed **after** `implementation-tdd` Green and **before** `code-review`. Its sole mandate is verifying that every promised feature, task, schema requirement, and boundary constraint in the spec is present, delivered, and accounted for — and that no unapproved scope creep was smuggled into the diff.

---

## CHEAT SHEET — read this first, every audit

### Operating principles (in priority order)

```
1. Spec is Truth        (the approved spec is the contract; diff is the reality being tested)
2. Adversarial Skepticism (zero leniency, zero benefit of doubt, every claim empirically proven)
3. Scope Boundary       (100% spec fidelity + scope creep ONLY; code quality is code-review's job)
4. WHY Required         (every finding must explain the strategic/product impact, not just the gap)
5. Gate Decision        (3 outcomes, no in-between: PASSED / PASS WITH WARNING / DEVIATION DETECTED)
```

### Hard rules — NEVER violate

- **NEVER approve an item just because code exists nearby.** Code that "looks like" the right thing is not proof. The exact spec requirement must be empirically met.
- **NEVER report on code quality, naming, formatting, or refactoring opportunities.** That's `code-review`'s scope. This skill's scope is spec fidelity + scope creep. Out-of-scope findings are noise.
- **NEVER infer requirements not in the spec.** If the spec is silent on a behavior, the implementation's choice is not auditable. Flag the spec as ambiguous (Level 4) — don't pretend the implementation fulfilled an unwritten requirement.
- **NEVER output raw credentials, tokens, or secrets in the report.** All credential references use `[REDACTED_CREDENTIAL]` placeholders or file:line references.
- **NEVER use a "looks fine" or "probably correct" judgment.** Either the diff empirically meets the spec, or it doesn't. No "soft pass".
- **NEVER skip the "WHY" rationale.** Every finding (Level 1-3) MUST have a strategic/product impact explanation. A finding without WHY is a non-finding.
- **NEVER let the sub-agent decide the gate.** The main agent synthesizes the final gate decision based on the findings, not the sub-agent.
- **NEVER mark an item as "fully delivered" without a specific commit SHA or file:line evidence.** "Implemented" is not proof; "implemented at `src/auth.ts:42` covered by test `test/auth.test.ts:18`" is proof.

### Current state check (run before each audit)

```
[ ] Sub-task ID from progress-map: ___
[ ] Target branch: `feat/...` / `fix/...` / `refactor/...`
[ ] Base ref: `origin/main` (or current release branch)
[ ] Spec artifacts accessible: brand ✓, frontend ✓/N/A, backend ✓/N/A
[ ] Spec statuses: all relevant specs are `Approved` or `Locked`
[ ] `git diff <base>...HEAD` captured
[ ] Diff size reasonable (≤ N files / ≤ M lines) — if too large, see § 10
[ ] No uncommitted changes (`git status` clean)
[ ] No raw credentials in diff (sanitization complete)
```

### The 4-level severity matrix

| Level | Label                        | Definition                                                                                                                    | Gate impact                                                        |
| ----- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **1** | **Critical (Spec Blocker)**  | Core feature completely missing; unapproved architectural pivot; hardcoded credentials; spec-defining requirement unfulfilled | **DEVIATION DETECTED (Blocker)**. Must resolve or revert.          |
| **2** | **High (Significant Drift)** | Partial implementation of key requirement; unannounced public interface/schema change; unapproved complexity added            | **DEVIATION DETECTED**. Requires resolution or spec sign-off.      |
| **3** | **Medium (Minor Gap)**       | Secondary requirement deferred; minor UI copy variation; harmless utility co-located                                          | **PASS WITH WARNING**. Proceed to code-review with follow-up task. |
| **4** | **Low (Advisory)**           | Spec ambiguity requiring user clarification; cannot determine compliance from spec alone                                      | **PASSED (Advisory)**. Informative only.                           |

### The 3 gate decisions (no in-between)

| Decision                  | Trigger                                        | Next action                                                                                           |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 🟢 **PASSED**             | 0 Critical + 0 High + any number of Medium/Low | Route to `code-review`                                                                                |
| 🟡 **PASS WITH WARNING**  | 0 Critical + 0 High + ≥1 Medium (no High)      | Route to `code-review` with follow-up task logged in `progress-map.md`                                |
| 🔴 **DEVIATION DETECTED** | ≥1 Critical OR ≥1 High                         | Cycle back to `implementation-tdd` to fulfill specs OR revert unapproved changes. Re-audit after fix. |

### The mandatory WHY schema (every finding must follow)

```markdown
- **[Severity Badge] [Spec Section / File Location]**: <one-line summary>
  - **The "WHY" (Strategic & Product Impact)**: <why this gap matters to user/system/strategy>
  - **Spec Expectation vs Diff Reality**: <quoted spec requirement> vs <quoted/conceptual diff state>
  - **Alignment Action**: <concrete step to achieve 100% spec completeness>
```

---

## 1. Scope Boundary (what this audits vs doesn't)

This is the **most important** principle. Drift in scope is the #1 way audits fail.

### IN scope (this skill audits)

| Category                        | Example                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| **Spec fidelity**               | Spec says "feature X with behavior Y" — does the diff implement Y?            |
| **Missing deliverables**        | Spec promises 3 endpoints — does the diff deliver all 3?                      |
| **Partial implementation**      | Spec says "validate input" — does the diff validate ALL inputs, or just some? |
| **Schema/interface compliance** | Spec defines a public API shape — does the diff match?                        |
| **Boundary constraints**        | Spec says "no PII in logs" — does the diff respect this?                      |
| **Scope creep**                 | Diff adds a feature not in the spec                                           |
| **Architectural drift**         | Diff makes an unapproved architectural change                                 |
| **Credential leakage**          | Hardcoded secrets, tokens, or credentials in the diff                         |
| **Unapproved refactors**        | Diff includes refactoring not requested by the spec or the sub-task           |

### OUT of scope (this skill does NOT audit)

| Category                                       | Handled by                                               |
| ---------------------------------------------- | -------------------------------------------------------- |
| Code quality (naming, structure, clarity)      | `code-review`                                            |
| Refactoring opportunities                      | `code-review`                                            |
| Edge case stress-testing ("What-If" scenarios) | `code-review`                                            |
| Performance characteristics                    | `code-review` (or `backend-architect` spec if specified) |
| Security vulnerabilities (CVE, XSS, injection) | `code-review` (or `backend-architect` spec)              |
| Test quality (test design, coverage depth)     | `code-review`                                            |
| Documentation accuracy                         | Out of scope unless spec requires it                     |

**Why the boundary matters:** Mixing scope creates noise. A finding about "the variable name is unclear" is irrelevant to whether the spec was met. A finding about "the spec says behavior X but the diff does Y" is irrelevant to whether the code is well-written. Two different concerns, two different skills.

---

## 2. The Adversarial Mindset (skeptical by design)

The sub-agent is explicitly designed to be **skeptical, uncompromising, and critically adversarial**. This is not optional.

### Zero Leniency (the default)

```
DON'T: "The code looks like it implements the spec"
DO:    "The spec says X. The diff at file:line shows Y. Y matches X. Verified."

DON'T: "I think this covers the requirement"
DO:    "The test at file:line asserts on behavior Z. The spec requires Z. Test passes. Verified."

DON'T: "Probably fine"
DO:    "Either the requirement is met or it isn't. State which."
```

### Scope Creep Vigilance (active search)

The auditor must **actively look for** unapproved additions:

- New functions, classes, or modules not in the spec
- New dependencies in `package.json` / `pyproject.toml` not approved
- New configuration options not in the spec
- New error handling for cases the spec didn't mention
- "While I was in here" additions
- Architectural decisions not aligned with the spec

**How to flag:** "Spec scope is X. Diff includes Y. Y was not in the approved spec. Possible scope creep."

### Unforgiving Spec Comparison

```
For every spec requirement:
  1. Find the spec text (exact quote)
  2. Find the corresponding code (file:line)
  3. Verify the code meets the spec text (not "similar to", "probably", "looks like")
  4. If 100% match → "Fully Delivered"
  5. If partial match → finding (Level 2 or 3 depending on criticality)
  6. If no match → finding (Level 1)
  7. If spec is silent → cannot audit; flag as Level 4 (Advisory)
```

### Adversarial Self-Check (run after every sub-agent response)

```
Before accepting the sub-agent's findings, ask:
  □ Did the sub-agent question every spec requirement, or assume some?
  □ Did the sub-agent find scope creep, or only check delivery?
  □ Did the sub-agent use exact quotes from the spec, or paraphrase?
  □ Did the sub-agent provide file:line evidence for every claim?
  □ Did the sub-agent miss any non-trivial code in the diff?

If any answer is wrong → re-spawn the sub-agent with sharper instructions.
```

---

## 3. The 5-Layer Context (operationalized for audit)

Use the canonical 5-Layer Context Chain (defined in `agentic-dev-loop`).

| Layer                              | Source for this audit                                                 |
| ---------------------------------- | --------------------------------------------------------------------- |
| 1. Product & Brand Understanding   | `brand-product-alignment-spec.md` § 1, § 2, § 4                       |
| 2. Active Branch & Target Scope    | `git branch --show-current`, target issue `#N`                        |
| 3. Phase Objective                 | `progress-map.md` active Phase + Sub-Task                             |
| 4. Active Task & Spec Contracts    | Sub-Task requirements + target spec sections (exact quotes)           |
| 5. Execution & Harness Constraints | `git diff <base>...HEAD` (sanitized), test framework, env constraints |

**The main agent constructs this context** and passes it to the sub-agent. The sub-agent does not reconstruct from scratch.

---

## 4. The Audit Process (5 steps)

```
┌─ Step 1: PIN          ─ Identify base ref, capture diff, identify spec artifacts
├─ Step 2: SANITIZE     ─ Redact credentials/tokens/secrets in the diff before passing to sub-agent
├─ Step 3: CONTEXT      ─ Build 5-Layer Context Chain (the spec contract + diff reality)
├─ Step 4: AUDIT        ─ Spawn sub-agent with adversarial prompt, receive findings
└─ Step 5: REPORT       ─ Synthesize alignment-audit-report.md, decide gate
```

### Step 1: PIN

**Inputs:**

- The branch being audited: `git branch --show-current`
- The base ref: usually `origin/main` or the release branch
- The spec artifacts: which specs are relevant to this sub-task
- The sub-task ID from `progress-map.md`

**Actions:**

```bash
# Verify the branch
git branch --show-current

# Verify clean state
git status  # should be clean (no uncommitted work)

# Capture the diff
git diff <base-ref>...HEAD > /tmp/diff.patch
# or capture per-file if diff is too large

# Note the spec artifacts to audit
ls docs/specs/  # or wherever specs live
```

**Output of Step 1:** A pinned diff, identified specs, identified sub-task.

### Step 2: SANITIZE

**Before passing the diff to the sub-agent**, redact all credentials:

```bash
# Common patterns to redact (extend as needed)
# - API keys, tokens, passwords
# - AWS access keys, private keys
# - Database connection strings with embedded credentials
# - OAuth client secrets
# - .env values
# - Hardcoded tokens in test fixtures

# Replace with [REDACTED_CREDENTIAL]
# Use file:line references instead of quoting raw credential hunks
```

**Sanitization rules:**

- Replace ALL credential-like strings with `[REDACTED_CREDENTIAL]`
- For each redacted location, note the file:line for the report
- If the diff contains a `.env` file or `secrets.json`, flag it as a Critical finding (Level 1)
- Do NOT skip sanitization to "save time" — credential leakage is an audit failure

### Step 3: CONTEXT

Build the 5-Layer Context Chain with EXACT spec quotes (not paraphrases):

```markdown
## Layer 1: Product & Brand

[From brand-product-alignment-spec.md § 1]

- Core vibe: [exact quote]
- 3-second impression: [exact quote]
- Brand moat: [exact quote]

## Layer 2: Active Branch

- Branch: `feat/password-reset`
- Issue: #123
- Base: origin/main

## Layer 3: Phase Objective

[From progress-map.md Sub-Task 1.1.3]

- Sub-task: Add password reset endpoint
- Spec reference: backend-architecture-spec.md § 3.2

## Layer 4: Spec Contracts (EXACT QUOTES)

From backend-architecture-spec.md § 3.2:

> "The system MUST provide a password reset endpoint that:
>
> - accepts an email and returns 200 within 500ms p95
> - generates a single-use token with 1-hour expiry
> - is rate-limited to 5 requests per hour per email
> - never returns the token in any response"
>   [exact spec quote — must be verbatim, not paraphrased]

## Layer 5: Diff Reality

[Sanitized diff or summary]

- Files changed: 3
- Lines added: 142
- Lines removed: 8
- New dependencies: 0
- New config: 0
```

**Why exact quotes:** The sub-agent must compare against what the spec actually says, not what the agent remembers. Paraphrase is a failure mode.

### Step 4: AUDIT (spawn sub-agent)

Spawn the sub-agent with the prompt in § 7. The sub-agent performs the 3-category comparison:

- (a) **Fully Delivered**: spec requirements met
- (b) **Missing or Partial**: spec requirements not met
- (c) **Unplanned Deviations**: diff includes things not in spec

### Step 5: REPORT

Synthesize the sub-agent's findings into `alignment-audit-report.md` (template in § 8). Apply the gate decision (§ 9).

---

## 5. The 4-Level Severity Matrix (in detail)

### Level 1: Critical (Spec Blocker)

**Definition:** The diff fails to deliver a spec-defining requirement, OR introduces something that violates a spec boundary, OR leaks credentials.

**Examples:**

- Spec requires 3 endpoints, diff delivers 2
- Spec says "no PII in logs", diff logs user emails
- Hardcoded API key in `config.ts`
- Architectural pivot (REST → GraphQL) not approved
- Spec requires transaction atomicity, diff has race condition in money transfer

**Gate impact:** 🔴 DEVIATION DETECTED. Must resolve or revert. Blocks `code-review`.

### Level 2: High (Significant Drift)

**Definition:** The diff partially delivers a requirement in a way that changes its meaning, OR adds unapproved complexity that the spec didn't authorize.

**Examples:**

- Spec says "validate email format", diff only validates domain (not format)
- Spec defines API contract A, diff implements contract A' (slight signature change)
- Diff adds a caching layer not in the spec (scope creep)
- Spec promises 5 fields in response, diff returns 3 (deferred fields not flagged)

**Gate impact:** 🔴 DEVIATION DETECTED. Requires resolution or spec sign-off.

### Level 3: Medium (Minor Gap)

**Definition:** The diff delivers most of the spec but with a small, non-blocking gap; OR co-locates a harmless utility that wasn't in the spec.

**Examples:**

- Spec says "show toast on success", diff shows inline banner (different but equivalent UX)
- Diff includes a small helper function not in the spec but used only internally
- Spec required 10 unit tests, diff has 9 (the 10th is a corner case)
- Minor copy variation: spec said "Reset Password", diff says "Reset Your Password"

**Gate impact:** 🟡 PASS WITH WARNING. Proceed to `code-review` with a follow-up task logged.

### Level 4: Low (Advisory)

**Definition:** The spec is ambiguous and the auditor cannot determine compliance from the spec text alone; this is a spec quality issue, not a diff issue.

**Examples:**

- Spec says "fast" without a numeric target
- Spec says "user-friendly" without behavioral criteria
- Spec says "secure" without specific controls listed

**Gate impact:** 🟢 PASSED (Advisory). Informative only. Recommend spec clarification in a follow-up.

### Severity Decision Tree

```
Is a spec-defining requirement unfulfilled OR is a spec boundary violated OR are credentials leaked?
  YES → Level 1 (Critical)
  NO ↓

Is a spec requirement only partially met OR is unapproved complexity added?
  YES → Level 2 (High)
  NO ↓

Is there a small, non-blocking gap or harmless co-located utility?
  YES → Level 3 (Medium)
  NO ↓

Is the spec ambiguous such that compliance cannot be determined?
  YES → Level 4 (Advisory)
  NO → No finding (fully delivered)
```

---

## 6. The Mandatory WHY Schema

Every finding (Level 1-3) must follow this schema. A finding without WHY is a non-finding.

### Template

```markdown
- **[🔴/🟡/🔵/⚪] [Spec Section / File:Line]**: <one-line summary>
  - **The "WHY" (Strategic & Product Impact)**: <why this gap matters to user/system/strategy>
  - **Spec Expectation vs Diff Reality**: "<verbatim spec quote>" vs <quoted/conceptual diff state>
  - **Alignment Action**: <concrete step to achieve 100% spec completeness>
```

### Why each part matters

| Part               | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| **Severity Badge** | Instant visual signal of gate impact                      |
| **Location**       | Actionable — tells the agent where to look                |
| **Summary**        | One-line context for the finding                          |
| **WHY**            | Forces the auditor to articulate impact, not just the gap |
| **Spec vs Diff**   | Empirical evidence, not opinion                           |
| **Action**         | Concrete next step (implement, revert, or update spec)    |

### Example (Level 1)

```markdown
- 🔴 backend-architecture-spec.md § 3.2 / src/auth.ts:42-58: Password reset endpoint
  lacks rate limiting
  - **The "WHY"**: Spec requires "5 requests per hour per email" to prevent
    brute-force and email-bombing attacks. Without rate limiting, attackers
    can exhaust user inboxes with reset emails, leading to user churn and
    potential DoS.
  - **Spec Expectation vs Diff Reality**: "rate-limited to 5 requests per
    hour per email" vs diff has no rate limit middleware on the reset
    endpoint.
  - **Alignment Action**: Add rate limiting middleware to the reset endpoint.
    Either inline counter (minimal) or shared rate-limiter (preferred if
    other endpoints use one).
```

### Example (Level 3)

```markdown
- 🔵 backend-architecture-spec.md § 3.2 / src/auth/ui.tsx:87: Success message
  copy variation
  - **The "WHY"**: Minor brand consistency impact. The spec said "Reset
    Password" (imperative) and the diff says "Reset Your Password" (with
    possessive). Functionally identical, slightly different brand voice.
  - **Spec Expectation vs Diff Reality**: "Reset Password" (implied by
    spec's use of imperative) vs "Reset Your Password" (current diff).
  - **Alignment Action**: Confirm with user whether the variation is
    acceptable, or update to match spec.
```

---

## 7. Sub-Agent Prompt Template

Use this exact prompt structure when spawning the auditor sub-agent:

```markdown
# Role

You are an uncompromising Specification Auditor. Your mandate is to
verify if 100% of promised spec items are fully met. You are NOT
evaluating code quality, naming, refactoring, or edge-case
robustness — those are evaluated downstream by `code-review`.

# Adversarial Mindset

You are skeptical by design:

- **Zero Leniency**: Do NOT assume a requirement is met just because
  code exists nearby. Every promised item must be empirically proven
  in the diff.
- **Scope Creep Vigilance**: Actively look for unapproved refactors,
  unrequested side-features, or architectural changes disguised as
  bug fixes.
- **Unforgiving Spec Comparison**: Compare line-by-line against
  `progress-map.md` and spec artifacts with zero benefit of doubt.
- **Out-of-scope silence**: If a concern is not in the spec, you
  cannot audit it — flag as Level 4 (Advisory) for spec ambiguity,
  not as a finding.

# Input

You will receive:

1. **5-Layer Context Chain** (Layer 1-5)
2. **Approved Spec/Plan text** with EXACT QUOTES
3. **Sanitized `git diff` output** (credentials redacted)

# Task

Compare the diff against the approved spec across 3 categories:

## (a) Fully Delivered

For each spec requirement: is it empirically met in the diff? Provide
file:line evidence.

## (b) Missing or Partial

For each spec requirement not met or only partially met: state the
spec quote, the diff reality, and the file:line where the gap is.

## (c) Unplanned Deviations & Scope Creep

For each addition or change in the diff NOT in the approved spec:
state what it is, where it is, and why it's scope creep.

# Output Format (strict)

For EVERY finding in (b) and (c), use this exact schema:
```

- **[🔴/🟡/🔵/⚪] [Spec Section / File:Line]**: <one-line summary>
  - **The "WHY" (Strategic & Product Impact)**: <why this matters>
  - **Spec Expectation vs Diff Reality**: "<verbatim spec quote>" vs <diff state>
  - **Alignment Action**: <concrete next step>

```

Group findings by Severity (🔴 Critical first, then 🟡, 🔵, ⚪).

# Constraints

- Do NOT comment on formatting, code smells, or edge-case quality.
  Out of scope for this audit.
- Do NOT output raw secrets or credential strings. Use
  `[REDACTED_CREDENTIAL]` or file:line references.
- Keep response under 500 words. Be terse. Findings are evidence, not
  essays.
- For "Fully Delivered" items, give a one-line confirmation with
  file:line — no verbose explanation needed.

# Model

`flash` for standard diffs (≤ 200 lines changed), `pro` for complex
multi-file architectural changes. Default: `flash`.
```

---

## 8. The Report Template (`alignment-audit-report.md`)

```markdown
# Alignment Audit Report

> **Date:** YYYY-MM-DD
> **Branch:** `feat/<slug>` ➔ `<base-ref>`
> **Sub-Task:** [ID] — [name]
> **Issue:** #N
> **Auditor:** [main agent name / version]

---

## 1. Audit Context

- **Base ref:** `origin/main` (or specified)
- **Diff size:** N files, +X/-Y lines
- **Spec artifacts audited:** brand-product-alignment §X, backend §Y, frontend §Z
- **Spec statuses:** brand=Approved, frontend=Approved, backend=Approved
- **Sanitization:** All credentials redacted before sub-agent exposure

---

## 2. Plan Fidelity Audit

### ✅ Fully Delivered Items (100% Spec Coverage)

For each spec requirement: confirmation with file:line evidence.

- [Spec requirement 1] — `src/auth.ts:42-58` covered by test `test/auth.test.ts:18` ✓
- [Spec requirement 2] — `src/auth/rate-limit.ts:12-30` ✓
- [Spec requirement 3] — `src/api/auth.ts:15-25` ✓

### 🔴 Critical Discrepancies (Spec Blockers / Omissions)

[Per-finding using the mandatory WHY schema]

### 🟡 High Severity Discrepancies (Significant Drift)

[Per-finding using the mandatory WHY schema]

### 🔵 Medium Severity Discrepancies (Minor Gaps)

[Per-finding using the mandatory WHY schema]

### ⚪ Low Severity Items (Advisories / Clarifications)

[Per-finding using the mandatory WHY schema]

---

## 3. Scope Creep Analysis

[Unplanned additions, dependencies, architectural changes not in the spec]

---

## 4. Audit Gate Decision

- **Critical findings:** N
- **High findings:** N
- **Medium findings:** N
- **Low findings:** N

**Decision:**

- 🟢 **PASSED** — 0 Critical + 0 High. Ready for `code-review`.
- 🟡 **PASS WITH WARNING** — 0 Critical + 0 High + ≥1 Medium. Proceed to `code-review` with follow-up task.
- 🔴 **DEVIATION DETECTED** — ≥1 Critical OR ≥1 High. Cycle back to `implementation-tdd`.

**Next action:** [specific instruction based on the decision]

---

## 5. Sub-Agent Audit Trail

- **Sub-agent model:** flash / pro
- **Sub-agent prompt:** [link or full text]
- **Sub-agent response:** [link or full text, sanitized]
- **Main agent synthesis:** [notes on how findings were consolidated]
```

---

## 9. Gate Decision Logic

The gate is decided by the **main agent** based on the synthesized findings, not the sub-agent.

### Decision matrix

```
N Critical = ?  N High = ?  N Medium = ?  N Low = ?
  ↓                ↓                ↓                ↓
  Any > 0    OR    Any > 0    →    🔴 DEVIATION DETECTED
  All 0           All 0           Any > 0     →    🟡 PASS WITH WARNING
  All 0           All 0           All 0       →    🟢 PASSED
```

### What each gate triggers

| Decision              | Triggers                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| 🟢 PASSED             | `agentic-dev-loop` → `code-review`                                              |
| 🟡 PASS WITH WARNING  | `agentic-dev-loop` → `code-review` + follow-up task logged in `progress-map.md` |
| 🔴 DEVIATION DETECTED | `agentic-dev-loop` → `implementation-tdd` to fix OR revert. Re-audit after fix. |

### When to escalate instead of cycle back

- The spec is wrong, not the code → cascade protocol to update spec
- The sub-task was too big (audit finds 10+ findings) → re-open in `progress-mapper`, split sub-task
- The sub-agent is hallucinating requirements → re-spawn with sharper instructions

---

## 10. Failure Modes

| Symptom                                                            | Cause                                                              | Recovery                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Sub-agent returns under 500 words but missing findings             | Sub-agent didn't read the full spec OR didn't compare line-by-line | Re-spawn with explicit "compare EVERY spec requirement, list EVERY finding"                      |
| Sub-agent hallucinates requirements not in the spec                | Sub-agent inferred from training data instead of the actual spec   | Re-spawn with "ONLY the requirements explicitly in the spec text; do NOT infer"                  |
| Sub-agent reports code quality findings                            | Out of scope violation                                             | Discard those findings, re-spawn with explicit "OUT OF SCOPE: code quality, naming, refactoring" |
| Diff is too large for sub-agent context                            | Massive refactor or first-time scaffolding                         | Chunk the diff by file or by spec section; spawn sub-agents per chunk; consolidate findings      |
| Spec is genuinely ambiguous                                        | Spec was written without enough detail                             | Flag as Level 4 finding (advisory); recommend spec clarification; this is NOT a code failure     |
| Sub-task is too big (10+ findings, all in different spec sections) | Sub-task decomposed too coarsely in `progress-mapper`              | Re-open sub-task in `progress-mapper`, split into smaller sub-tasks                              |
| Audit found 0 findings but spec has obvious gaps                   | Auditor was too lenient / not adversarial enough                   | Re-run with explicit adversarial prompt: "Find at least 3 things wrong. If you can't, escalate." |
| Credentials leaked in sub-agent response                           | Sanitization incomplete                                            | Re-sanitize, re-spawn; this is itself a Critical finding (Level 1)                               |
| `git diff` shows nothing (empty diff)                              | Wrong base ref                                                     | Re-pin to correct base ref                                                                       |
| Sub-task references a spec section that doesn't exist              | progress-map out of sync with spec                                 | Reject the audit; route to orchestrator (cascade)                                                |
| Branch has uncommitted work                                        | Implementation-tdd hand-off was incomplete                         | Reject the audit; route back to implementation-tdd to commit                                     |

---

## 11. Anti-Patterns (what NOT to do)

### Approval without evidence

❌ "The code looks correct" (no file:line, no test reference)
❌ "Probably implements the spec" (probably ≠ verified)
❌ "I assume this works" (assumptions are not audit evidence)
❌ "Good enough" (no spec compliance threshold is "good enough")

### Mixing scope

❌ Finding about "variable name is unclear" (that's code-review)
❌ Finding about "no tests for edge case X" (that's code-review's stress test)
❌ Finding about "performance could be better" (out of scope unless spec specifies)
❌ Finding about "this could be refactored" (that's code-review's refactor mode)

### Inferring requirements

❌ "The spec implies this should also validate phone number" (spec didn't say)
❌ "Most apps would also include rate limiting" (not in the spec)
❌ "Standard practice is to log this" (not in the spec)
❌ "A good implementation would do X" (not in the spec)

### Soft passes

❌ "This is close enough" (no spec compliance threshold is "close enough")
❌ "We can fix this in a follow-up" (only valid for Level 3 Medium)
❌ "It's a minor issue, not worth blocking" (Level 1 and 2 always block)
❌ "I'll let it slide" (never an audit's decision)

### Forgiving scope creep

❌ "This is a small addition, not really scope creep" (any addition not in spec IS scope creep)
❌ "While I was in here is fine" (this is the definition of scope creep)
❌ "This will be needed eventually" (the next sub-task will justify it)
❌ "The user probably wants it" (the user signs off on the spec, not the auditor)

---

## 12. Anti-sycophancy reminder (applies to this skill especially)

The alignment auditor is the last line of defense against silent spec drift. The auditor does NOT exist to:

- Approve code to avoid friction
- Find "minor" issues that don't block
- Be reasonable about "close enough"
- Trust the implementer's intent over the spec's text
- Soften findings to spare feelings
- Approve because "we're behind schedule"

If the spec says X and the diff does Y, that's a finding. Period. The severity is determined by the spec's criticality, not by how inconvenient the finding is.

The auditor's job is to be the skeptic. The implementer is the optimist. The orchestrator balances them. Without the skeptic, the loop produces code that "looks right" but doesn't meet the spec — and the user discovers this in production.

Hold the line. Spec is truth. Diff is reality. The gap is the finding.
