---
name: code-review
description: Conduct a product-aware code quality and contextual "What-If" stress-testing review using parallel sub-agents. Evaluates code health (Fowler smells, DRY, modularity) and stress-tests realistic failure scenarios ("Given work A, if B happens, will it break?"). Categorize findings by 4-level urgency with mandatory "WHY" rationale. Produces a code review report with PR gate decision. Use after alignment-audit passes, before PR merge. Do NOT use for spec compliance (use alignment-audit).
---

# Code Review (Code Health & Contextual "What-If" Stress-Testing)

> **Mental model:** _This skill is the code quality and robustness auditor. It runs AFTER alignment-audit (spec compliance is done) and verifies the code is healthy AND survives realistic failure scenarios. NOT spec compliance. NOT business logic correctness (that's alignment-audit). JUST code quality + stress-test the "what if" scenarios._

This skill performs a **product-aware, dual-axis** code review for feature branches and PRs. Two sub-agents run in parallel: one for code health, one for stress-testing.

---

## CHEAT SHEET — read this first, every review

### Operating principles (in priority order)

```
1. Spec Compliance is Done    (alignment-audit upstream; this skill assumes spec is met)
2. Dual-Axis Focus            (Code Health + What-If Stress-Test; never mix with spec compliance)
3. Contextual What-If         (scenarios tailored to Work A, NEVER generic "what could go wrong")
4. Adversarial Skepticism     (zero leniency, assume hidden flaws until proven otherwise)
5. 3 PR Gate Outcomes         (APPROVE / REQUEST CHANGES / RE-ROUTE TO TDD, no in-between)
```

### Hard rules — NEVER violate

- **NEVER report on spec compliance.** If the diff doesn't match the spec, that's `alignment-audit`'s job, not this. This skill audits code quality and stress-test robustness, period.
- **NEVER use generic What-If scenarios.** Every scenario must be tailored to Work A. _"What if the user inputs bad data?"_ is generic. _"Given the payment retry logic, if the rate limit is hit during a network timeout, does the user's money get retried correctly?"_ is contextual.
- **NEVER approve an item just because code "looks fine".** Empirical evidence required. Either the code passes the stress test or it doesn't. No "probably fine".
- **NEVER output raw credentials, tokens, or secrets in the report.** All credential references use `[REDACTED_CREDENTIAL]` or file:line references.
- **NEVER skip the "What-If Scenario" in the WHY schema.** This skill's findings are unique because they include the scenario that breaks the code. Without it, the finding is a generic code-quality complaint.
- **NEVER let one sub-agent's findings contaminate the other.** Code Health and What-If are independent axes. A naming complaint is not a stress-test failure. A race condition is not a code smell.
- **NEVER merge findings across axes in the report.** Code Health findings go in § 2. What-If findings go in § 3. The reader needs to see them separately.
- **NEVER use the alignment-audit gate language.** This skill uses APPROVE / REQUEST CHANGES / RE-ROUTE TO TDD. Different gates, different triggers.

### Current state check (run before each review)

```
[ ] Spec compliance: confirmed via alignment-audit (status: Clean Pass / Pass with Warning)
[ ] Sub-task ID from progress-map: ___
[ ] Target branch: `feat/...` / `fix/...` / `refactor/...`
[ ] Fixed point (base ref): `origin/main` (or specified)
[ ] Work A identified: what does this diff do (one-sentence summary)
[ ] Diff captured and sanitized
[ ] Diff size: N files, +X/-Y lines
[ ] No uncommitted changes
[ ] Sub-agent model selection: flash (Code Health) + pro (What-If)
```

### The 4-level severity matrix (code-review specific)

| Level | Label                  | Definition                                                                                                 | PR Gate Action                                           |
| ----- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **1** | **Critical (Blocker)** | Security vulnerability, hardcoded secret, data loss/corruption risk, fatal crash under realistic scenario  | **RE-ROUTE TO TDD** — must fix before PR                 |
| **2** | **High (Major)**       | Major Fowler smell, subtle race condition, unhandled timeout/error swallowing, degraded state under stress | **REQUEST CHANGES** — should fix before merge (waivable) |
| **3** | **Medium (Moderate)**  | Standard code smell, minor edge-case gap, missing doc, primitive obsession                                 | **Recommended** — can merge with follow-up task          |
| **4** | **Low (Advisory)**     | Naming clarity, micro-suggestion, style polish                                                             | **Advisory** — optional polish, doesn't delay merge      |

### The 3 PR gate decisions (no in-between)

| Decision               | Trigger                              | Next action                                                                                                                                                                 |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 **APPROVE**         | 0 Critical + 0 High + any Medium/Low | Merge-ready. Hand off to `agentic-dev-loop` for Loop Summary.                                                                                                               |
| 🟡 **REQUEST CHANGES** | 0 Critical + ≥1 High                 | Cycle to `implementation-tdd` (Refactor Mode) to address High findings. Re-review after fix.                                                                                |
| 🔴 **RE-ROUTE TO TDD** | ≥1 Critical                          | Critical blockers or stress-test failures. Cycle to `implementation-tdd` (not just Refactor Mode — Critical may indicate bug or missing implementation, not just refactor). |

### The mandatory finding schema (code-review specific — includes What-If)

```markdown
- **[Severity Badge] [File:Line]**: <one-line summary>
  - **Contextual "What-If" Scenario**: "Given [Work A], if [Scenario B] happens..."
  - **The "WHY" (Systemic Impact)**: <what breaks systemically or for the user>
  - **Root Cause / Code Detail**: <conceptual description, no raw secrets>
  - **Remediation Action**: <concrete code fix or refactor steps>
```

For Code Health findings, the "What-If Scenario" can be omitted or replaced with: "**Maintainability Scenario**: If a future engineer works on this code in 6 months, [what goes wrong]?"

---

## 1. Scope Boundary (what this reviews vs doesn't)

This is the **sister skill to `alignment-audit`**. They run sequentially and have non-overlapping scopes. Drift in scope creates noise.

### IN scope (this skill reviews)

| Category                           | Example                                                           |
| ---------------------------------- | ----------------------------------------------------------------- |
| **Code health**                    | Fowler smells, DRY violations, modularity, naming, type safety    |
| **What-If stress testing**         | "Given Work A, if B happens, does A break?"                       |
| **Edge cases & boundary recovery** | Null/undefined payloads, empty states, timeouts, network drops    |
| **Concurrency & state**            | Race conditions, deadlocks, stale cache reads, unclosed resources |
| **Error handling**                 | Swallowed errors, missing catch, no graceful degradation          |
| **Security (in code)**             | XSS, injection, IDOR, hardcoded secrets, missing auth checks      |
| **Performance characteristics**    | When the code has obvious algorithmic or structural issues        |
| **Refactoring opportunities**      | Extractions, renames, structural improvements                     |

### OUT of scope (this skill does NOT review)

| Category                               | Handled by                                            |
| -------------------------------------- | ----------------------------------------------------- |
| Spec compliance (does diff meet spec?) | `alignment-audit`                                     |
| Missing deliverables from spec         | `alignment-audit`                                     |
| Scope creep (unapproved additions)     | `alignment-audit`                                     |
| Spec ambiguity                         | `alignment-audit` (Level 4 Advisory)                  |
| Strategic/product fit                  | `brand-product-alignment` (upstream)                  |
| Architecture decisions                 | `backend-architect` / `front-end-designer` (upstream) |
| Roadmap decomposition                  | `progress-mapper`                                     |
| TDD discipline                         | `implementation-tdd`                                  |

**Why the boundary matters:** A finding like _"the spec says behavior X but the diff does Y"_ is `alignment-audit`'s job. A finding like _"the code has a race condition in concurrent access"_ is THIS skill's job. Two different concerns, two different skills, run in sequence.

---

## 2. The Dual-Axis Framework

This skill uses two axes run in parallel. Each axis has its own sub-agent, its own focus, and its own findings. Findings are reported in separate sections.

### Axis 1: Code Health & Maintainability

**Focus:** Is the code clean, well-named, modular, and maintainable?

**Sub-agent role:** Relentlessly skeptical Code Health Auditor.

**Model:** `flash` (fast, token-efficient — code health is pattern-matching)

**Checklist:**

- Fowler smells: Mysterious Name, Duplicated Code, Feature Envy, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man
- Architecture: Single Responsibility violations, tight coupling, hardcoded values, missing type safety
- DRY: code that should be extracted, patterns that should be parameterized
- Readability: cognitive overhead, naming clarity, comment quality (not absence)

**Output style:** Concise (<500 words). Findings grouped by severity. Each finding has file:line, the smell name, the maintainability impact, and a concrete fix.

### Axis 2: Contextual "What-If" Stress-Testing

**Focus:** Does the code survive realistic failure scenarios specific to what it does?

**Sub-agent role:** Adversarial Stress-Test Specialist.

**Model:** `pro` (deep reasoning — stress-testing requires complex state machine analysis)

**The Core Paradigm:**

> _"Given feature/work context A, if scenario B occurs, will it break?"_

**Formulating scenarios (the hard part):**

- Scenarios MUST be contextual to Work A
- Generic scenarios (_"what if the user inputs bad data"_) are forbidden
- Each scenario must be a realistic failure mode for the specific work

**Example scenarios by Work A type:**

| Work A                  | Realistic scenarios to test                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Payment Flow            | Gateway timeout, double-submission click, expired token mid-checkout, network drop mid-transaction, invalid currency payload     |
| Search/Filter Component | Empty query state, special character injection (SQL/XSS/Regex), rapid keystroke race conditions, massive result set (>10k items) |
| Async Queue Worker      | Queue backlog spike, worker thread crash mid-job, duplicate job processing, unhandled promise rejection loop                     |
| File Upload             | Concurrent upload corruption, file > size limit, MIME type mismatch, network drop mid-upload, virus scan race                    |
| Authentication          | Token expiry mid-session, refresh token reuse, password reset spam, session fixation, CSRF on state-changing endpoints           |
| Database Migration      | Migration run on a table with active writes, rollback after partial data loss, concurrent index creation blocking reads          |
| Frontend Form           | Rapid double-submit, network timeout on submit, browser back-button after submit, validation bypass via DevTools                 |

**Checklist focus:**

- Exception & boundary recovery: null/undefined, empty arrays, timeouts, network drops
- Concurrency & state: race conditions, deadlocks, stale reads, resource leaks
- Error propagation: errors swallowed, errors logged but not handled, errors re-thrown without context
- Recovery: can the system recover, or is it stuck in a degraded state?
- Cascading failures: does one failure cause others?

**Output style:** Concise (<500 words). Each finding includes the explicit "Given A, if B" scenario. Findings grouped by severity.

### Why parallel sub-agents?

| Reason                    | Explanation                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| Independent axes          | Code Health findings don't inform What-If findings. Combining them dilutes both. |
| Different reasoning modes | Pattern-matching (flash) vs state analysis (pro) are different cognitive tasks   |
| Faster wall-clock         | Parallel execution instead of sequential                                         |
| Cleaner output            | Reader can see "Code Health issues" and "Stress-test issues" separately          |

---

## 3. The 5-Layer Context (operationalized for code review)

Use the canonical 5-Layer Context Chain.

| Layer                              | Source for this review                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| 1. Product & Brand Understanding   | `brand-product-alignment-spec.md` § 1, § 2, § 4                        |
| 2. Active Branch & Target Scope    | `git branch --show-current`, target issue `#N`                         |
| 3. Phase Objective                 | `progress-map.md` Sub-Task (now that alignment-audit passed)           |
| 4. Active Task & Spec Contracts    | Sub-Task + the SPEC REQUIREMENTS (for context, not for auditing)       |
| 5. Execution & Harness Constraints | `git diff <fixed>...HEAD` (sanitized), test framework, env constraints |

**Note on Layer 4:** This skill does NOT audit spec compliance. But knowing the spec is useful for _formulating contextual What-If scenarios_. The search-filter component spec leads to different stress tests than the payment-flow spec.

---

## 4. The Review Process (5 steps)

```
┌─ Step 1: PIN & SANITIZE   ─ Identify fixed point, capture diff, sanitize credentials
├─ Step 2: CONTEXT          ─ Build 5-Layer Context Chain
├─ Step 3: PARALLEL AUDIT   ─ Spawn 2 sub-agents concurrently (Code Health + What-If)
├─ Step 4: SYNTHESIZE       ─ Consolidate findings, classify severity, decide PR gate
└─ Step 5: REPORT           ─ Synthesize Code Review Report
```

### Step 1: PIN & SANITIZE

```bash
# Identify fixed point (default: origin/main)
BASE_REF="origin/main"
git rev-parse $BASE_REF

# Capture commit history
git log $BASE_REF..HEAD --oneline

# Capture diff
git diff $BASE_REF...HEAD > /tmp/diff.patch

# Sanitize: redact credentials (see § 11 for the protocol)
```

### Step 2: CONTEXT

Build the 5-Layer Context Chain. Note Work A explicitly (this is what the sub-agents need to formulate contextual scenarios).

```markdown
## Layer 4: Active Task & Work A

- Sub-task: [ID] — [name]
- Work A summary: [one-sentence: what this diff does]
- Spec reference: [spec section, for context only]
```

### Step 3: PARALLEL AUDIT (spawn both sub-agents concurrently)

Use `invoke_subagent` with `Subagents: [...]` to run both sub-agents in a single tool call. Both receive:

- The 5-Layer Context Chain
- The sanitized diff
- The Work A summary
- Their respective role briefs (below)

#### Sub-Agent A: Code Health Auditor

```markdown
# Role

You are a relentlessly skeptical Code Health Auditor. Your mandate
is to find Fowler smells, architectural debt, and maintainability
hazards in the diff. You are NOT auditing spec compliance
(that's `alignment-audit`'s job) and NOT stress-testing (that's
the other sub-agent's job). YOUR FOCUS IS CODE HEALTH ONLY.

# Adversarial Mindset

- Zero Leniency: Do NOT give the benefit of the doubt
- Flaw Hypothesis: Assume every diff has hidden maintainability debt
- Relentless Dissection: Search for smells, not confirm clean code

# Input

- 5-Layer Context Chain
- Sanitized `git diff`
- Work A: [one-sentence description]

# Checklist

Fowler smells: Mysterious Name, Duplicated Code, Feature Envy,
Primitive Obsession, Repeated Switches, Shotgun Surgery,
Divergent Change, Speculative Generality, Message Chains,
Middle Man.

Architecture: Single Responsibility violations, tight coupling,
hardcoded values, missing type safety, premature optimization.

# Output Format (strict)

For each finding:
```

- **[🔴/🟡/🔵/⚪] [File:Line]**: <smell name, one-line summary>
  - **Maintainability Scenario**: "If a future engineer works on this in 6 months, [what goes wrong]?"
  - **The "WHY" (Systemic Impact)**: <maintainability cost, regression risk>
  - **Root Cause**: <conceptual code smell description>
  - **Remediation Action**: <concrete refactor step>

```

Group by severity (🔴 first, then 🟡, 🔵, ⚪).

# Constraints
- Do NOT report on spec compliance (alignment-audit did that)
- Do NOT do stress-testing (the other sub-agent will)
- Do NOT output raw secrets. Use `[REDACTED_CREDENTIAL]`
- Keep response under 500 words
- Output NOTHING if the diff is clean. (Silence is an acceptable Code Health verdict.)
```

**Model:** `flash`

#### Sub-Agent B: What-If Stress-Test Specialist

```markdown
# Role

You are an adversarial Stress-Test Specialist. Your mandate is to
find where Work A breaks when subjected to realistic failure
scenarios. You are NOT auditing code health (that's the other
sub-agent's job) and NOT spec compliance (that's `alignment-audit`).
YOUR FOCUS IS STRESS-TESTING ONLY.

# Adversarial Mindset

- Zero Leniency: Do NOT give the benefit of the doubt
- Flaw Hypothesis: Assume every diff has hidden failure modes
- Contextual Only: Every scenario must be specific to Work A.
  Generic scenarios ("what if input is bad") are forbidden.

# The Core Paradigm

"Given feature/work context A, if scenario B occurs, will it break?"

# Input

- 5-Layer Context Chain
- Sanitized `git diff`
- Work A: [one-sentence description]
- Spec reference (for context, NOT for auditing compliance)

# Task

Formulate 3-5 realistic "What-If" scenarios SPECIFIC to Work A.

# Example scenario types (NOT exhaustive, NOT generic)

If Work A is a payment flow, test:

- Gateway timeout during transaction
- Double-submit click
- Token expiry mid-checkout
- Network drop mid-transaction
- Invalid currency payload

If Work A is a search/filter, test:

- Empty query state
- Special character injection
- Rapid keystroke race conditions
- Massive result set (>10k items)

# Output Format (strict)

For each finding:
```

- **[🔴/🟡/🔵/⚪] [File:Line]**: <failure mode, one-line summary>
  - **Contextual "What-If" Scenario**: "Given [Work A], if [Scenario B] happens..."
  - **The "WHY" (Systemic Impact)**: <what breaks systemically or for the user>
  - **Root Cause**: <missing check, unhandled state, race condition, etc.>
  - **Remediation Action**: <concrete code fix step>

```

Group by severity (🔴 first, then 🟡, 🔵, ⚪).

# Constraints
- Do NOT report on spec compliance
- Do NOT do code health analysis (the other sub-agent will)
- Do NOT use generic scenarios. Every scenario must be Work-A-specific
- Do NOT output raw secrets. Use `[REDACTED_CREDENTIAL]`
- Keep response under 500 words
- If the code is robust, state so explicitly. (No findings is an acceptable Stress-Test verdict.)
```

**Model:** `pro`

### Step 4: SYNTHESIZE

Consolidate findings from both sub-agents:

```
Code Health findings:   [N Critical, N High, N Medium, N Low]
What-If findings:       [N Critical, N High, N Medium, N Low]

Combined Critical:      [N]
Combined High:          [N]
Combined Medium:        [N]
Combined Low:           [N]
```

**Decide the PR gate (see § 6):**

- Any Critical → RE-ROUTE TO TDD
- Else any High → REQUEST CHANGES
- Else → APPROVE

**CRITICAL: Do not let the sub-agents decide the gate.** The main agent synthesizes and decides.

### Step 5: REPORT

Synthesize the Code Review Report (template in § 7). Findings are presented in TWO separate sections (Code Health and What-If), not merged.

---

## 5. The 4-Level Severity Matrix (in detail)

### Level 1: Critical (Blocker)

**Definition:** A flaw that creates security risk, data loss/corruption, or fatal crash under realistic conditions. May be from either axis.

**Examples:**

- SQL injection in a query handler
- Hardcoded API key in `config.ts`
- Race condition in concurrent file writes (data corruption)
- Unhandled promise rejection that crashes the worker
- Authentication bypass via manipulated request

**Gate impact:** 🔴 RE-ROUTE TO TDD. Cycle back. Critical indicates bug or missing implementation, not just refactor.

### Level 2: High (Major)

**Definition:** A flaw that creates a real risk under realistic but not necessarily common conditions. From either axis.

**Examples:**

- Repeated Swallows in error handling (errors eaten silently)
- Unhandled timeout (no `AbortSignal.timeout()` on external calls)
- Major Fowler smell (god class, 500-line function)
- State machine leak (cancelled state not cleaned up)
- Stale cache read returning wrong data
- Concurrency race that causes degraded UX (not data loss)

**Gate impact:** 🟡 REQUEST CHANGES. Should fix before merge. Waivable for documented business reasons.

### Level 3: Medium (Moderate)

**Definition:** A flaw that creates minor risk or maintainability cost. Doesn't block.

**Examples:**

- Standard code smell (duplicated logic, primitive obsession, long parameter list)
- Minor edge-case gap (rare input not handled, but no crash)
- Missing doc for non-obvious behavior
- Test coverage gap (some paths uncovered)

**Gate impact:** Recommended. Can merge with follow-up task.

### Level 4: Low (Advisory)

**Definition:** Style or naming polish. Doesn't affect behavior or maintainability significantly.

**Examples:**

- Variable name could be clearer
- Function could be split (but isn't egregious)
- Comment could be more descriptive
- Minor formatting inconsistency

**Gate impact:** Advisory. Optional polish.

### Severity Decision Tree (both axes)

```
Does it create security risk, data loss/corruption, or fatal crash?
  YES → Level 1 (Critical)
  NO ↓

Does it create real risk under realistic conditions, or is it a major maintainability hazard?
  YES → Level 2 (High)
  NO ↓

Is it a minor risk or maintainability cost?
  YES → Level 3 (Medium)
  NO ↓

Is it style/naming polish?
  YES → Level 4 (Low)
  NO → No finding
```

---

## 6. The Mandatory Finding Schema

Every finding (Level 1-4) follows this schema. This is **different from `alignment-audit`'s schema** because code-review findings require a What-If scenario.

### Template (full)

```markdown
- **[🔴/🟡/🔵/⚪] [File:Line]**: <one-line summary>
  - **Contextual "What-If" Scenario**: "Given [Work A], if [Scenario B] happens..."
  - **The "WHY" (Systemic Impact)**: <what breaks systemically or for the user>
  - **Root Cause / Code Detail**: <conceptual code smell, missing check, race condition>
  - **Remediation Action**: <concrete code fix or refactor steps>
```

### Code Health exception (for code smell findings)

For pure code smells (no stress-test angle), replace the What-If scenario with a **Maintainability Scenario**:

```markdown
- **[🟡] [File:Line]**: Mysterious Name — Variable `x` obscures payment token state
  - **Maintainability Scenario**: "If a future engineer needs to trace the payment token through the system, the variable `x` provides no clue. They'll grep for `token` and miss this, leading to a 30-minute confusion."
  - **The "WHY" (Systemic Impact)**: Cognitive overhead, increased regression risk during future maintenance
  - **Root Cause**: Variable named `x` instead of `paymentToken`
  - **Remediation Action**: Rename to `paymentToken` and encapsulate in a typed `PaymentToken` value object
```

### What-If Stress-Test (full schema)

```markdown
- **[🔴] [File:Line]**: Unhandled Timeout under Payment Retry
  - **Contextual "What-If" Scenario**: "Given the checkout payment retry logic, if the network times out during a gateway retry attempt..."
  - **The "WHY" (Systemic Impact)**: Leaves transactions in zombie state. Client thinks payment failed (refunds), but DB shows pending (or vice versa). Causes data drift and lost revenue.
  - **Root Cause**: Fetch call lacks `AbortController` or timeout handler. The retry uses the same request without a fresh timeout, so a hung request blocks indefinitely.
  - **Remediation Action**: Wrap fetch with `AbortSignal.timeout(5000)`. On `TimeoutError`, mark the transaction as `failed` and surface to user. Don't retry silently.
```

---

## 7. The Code Review Report Template

```markdown
# Code Review Report

> **Date:** YYYY-MM-DD
> **Branch:** `feat/<slug>` ➔ `<base-ref>`
> **Sub-Task:** [ID] — [name]
> **Issue:** #N
> **Reviewer:** [main agent name / version]
> **Pre-condition:** Alignment-audit status (Clean Pass / Pass with Warning)

---

## 1. Context & Scope

- **Base ref:** `origin/main` (or specified)
- **Diff size:** N files, +X/-Y lines
- **Work A (one-sentence):** [what the diff does]
- **Sanitization:** All credentials redacted before sub-agent exposure
- **Sub-agents used:** Code Health (flash), What-If (pro)

---

## 2. Code Health & Maintainability Review

### 🔴 Critical (Blockers)

[Per-finding using the mandatory schema with Maintainability Scenario]

### 🟡 High (Major)

[Per-finding]

### 🔵 Medium (Moderate)

[Per-finding]

### ⚪ Low (Advisory)

[Per-finding]

---

## 3. Contextual "What-If" Stress-Testing Review

### 🔴 Critical (Runtime Stress-Test Failures)

[Per-finding using the mandatory schema with What-If Scenario]

### 🟡 High (Major Stress-Test Risks)

[Per-finding]

### 🔵 Medium (Moderate Edge Cases)

[Per-finding]

### ⚪ Low (Minor Advisory)

[Per-finding]

---

## 4. PR Gate Decision

| Axis         | Critical | High  | Medium | Low   |
| ------------ | -------- | ----- | ------ | ----- |
| Code Health  | N        | N     | N      | N     |
| What-If      | N        | N     | N      | N     |
| **Combined** | **N**    | **N** | **N**  | **N** |

**Decision:**

- 🟢 **APPROVE** — 0 Critical + 0 High. Merge-ready.
- 🟡 **REQUEST CHANGES** — 0 Critical + ≥1 High. Cycle to `implementation-tdd` (Refactor Mode).
- 🔴 **RE-ROUTE TO TDD** — ≥1 Critical. Cycle to `implementation-tdd` (not Refactor Mode only).

**Next action:** [specific instruction based on the decision]

---

## 5. Sub-Agent Audit Trail

- **Code Health sub-agent (flash):** [model, response summary, sanitized output]
- **What-If sub-agent (pro):** [model, response summary, sanitized output]
- **Main agent synthesis:** [notes on how findings were consolidated, any cross-axis observations, gate decision rationale]
```

---

## 8. PR Gate Decision Logic

The gate is decided by the **main agent** based on the synthesized findings, not the sub-agents.

### Decision matrix

```
N Critical = ?  (combined across axes)
  Any > 0    → 🔴 RE-ROUTE TO TDD
  All 0 ↓

N High = ?  (combined across axes)
  Any > 0    → 🟡 REQUEST CHANGES
  All 0 ↓

→ 🟢 APPROVE
```

### What each gate triggers

| Decision           | Triggers                             | What it means                                                                                                                                                         |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 APPROVE         | Both axes clean (0 Critical, 0 High) | Merge-ready. `agentic-dev-loop` emits Loop Summary.                                                                                                                   |
| 🟡 REQUEST CHANGES | ≥1 High (no Critical)                | Cycle to `implementation-tdd` in **Refactor Mode** (existing tests must stay Green). Re-review after fix.                                                             |
| 🔴 RE-ROUTE TO TDD | ≥1 Critical                          | Cycle to `implementation-tdd`. **Not just Refactor Mode** — Critical may indicate missing implementation or a real bug, not just refactoring. Re-review from scratch. |

### When to escalate instead of cycle

- The Critical finding is in code the spec didn't specify (scope creep) → route to alignment-audit
- The Critical finding indicates a spec contradiction → cascade to upstream
- The Critical finding is unfixable in this sub-task's scope → re-open in `progress-mapper`, split

---

## 9. Failure Modes

| Symptom                                                                  | Cause                                                      | Recovery                                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Code Health sub-agent returns no findings but the diff is clearly smelly | Sub-agent was too lenient                                  | Re-spawn with explicit "Find at least 3 smells. If you can't, escalate."                     |
| What-If sub-agent uses generic scenarios (_"what if input is bad"_)      | Sub-agent didn't read Work A                               | Re-spawn with explicit "Scenarios must be Work-A-specific. Generic scenarios are forbidden." |
| Sub-agents produce findings in each other's domain                       | Sub-agent confused the scope                               | Re-spawn with sharper "YOUR FOCUS IS X ONLY" instruction                                     |
| Sub-agent returns findings but they're duplicates                        | Sub-agent and main agent both thought the same thing       | Consolidate; don't double-count                                                              |
| Critical finding turns out to be a spec issue, not code                  | Spec/code mismatch is alignment-audit's domain             | Re-route to alignment-audit; don't pretend code review found it                              |
| Diff is too large for sub-agent context                                  | Massive refactor or first-time scaffolding                 | Chunk the diff by file or by feature; spawn sub-agents per chunk; consolidate                |
| Credentials leaked in sub-agent response                                 | Sanitization incomplete                                    | Re-sanitize, re-spawn; this is itself a Critical finding                                     |
| Sub-task is too big (10+ findings across axes)                           | Sub-task decomposed too coarsely                           | Re-open in `progress-mapper`, split                                                          |
| What-If sub-agent finds no scenarios worth testing                       | Work A is genuinely trivial (e.g., a 1-line config change) | State "stress-test not applicable" explicitly in the report                                  |
| Code Health sub-agent finds naming/comment issues only                   | Code is clean, just cosmetic                               | All findings Level 4 → APPROVE with advisories                                               |
| Race condition finding is theoretical, not reproducible                  | Sub-agent found theoretical issue, not real                | Verify with code path analysis; downgrade or remove                                          |
| Gate decision conflicts with sub-agent's recommendation                  | Main agent overrides sub-agent                             | Document the override in § 5 of the report (transparency)                                    |

---

## 10. Anti-Patterns (what NOT to do)

### Reporting on the wrong scope

❌ "The spec says X but the diff does Y" (that's alignment-audit)
❌ "This is scope creep" (that's alignment-audit)
❌ "The spec is ambiguous" (that's alignment-audit Level 4)
❌ "The business logic is wrong" (that's alignment-audit)

### Generic What-If scenarios

❌ "What if the input is bad?"
❌ "What if the user does something unexpected?"
❌ "What if the network is slow?"
❌ "What if the database is down?"

All generic. All forbidden. Scenarios must be specific to Work A.

### Approval without evidence

❌ "The code looks fine" (no evidence, no stress test, no code health analysis)
❌ "I don't see any issues" (negative findings require explicit evidence too)
❌ "Probably robust" (probably ≠ verified)
❌ "Standard pattern" (no, this is THIS code; test THIS code)

### Mixing axes

❌ "Naming is unclear AND there's a race condition" (one finding per axis)
❌ "Code smell that's also a stress-test failure" (separate findings; the stress-test is the more important)
❌ "Refactor opportunity that also fixes a bug" (refactor goes to Code Health; bug goes to What-If)

### Soft gating

❌ "Probably good enough to merge" (no quality threshold is "good enough")
❌ "It's just a minor issue" (Level 1 and 2 always block or require change)
❌ "We're behind schedule, let's skip" (schedule is not an audit factor)
❌ "I'll let it slide this time" (never an audit's decision)

### Inappropriate trust

❌ "The implementer said it's robust" (verify, don't trust)
❌ "The tests pass, so the code is good" (tests don't catch all stress-test scenarios)
❌ "It's a well-known pattern" (well-known patterns have well-known failure modes)
❌ "It's been like this for months" (age doesn't validate correctness)

---

## 11. Secret Protection & Credential Redaction

Same protocol as `alignment-audit`:

- **Sanitize diff** before passing to sub-agents
- **Replace** credentials with `[REDACTED_CREDENTIAL]`
- **Use file:line references** instead of quoting raw credential hunks
- **Hardcoded secret detection** is a **Level 1 Critical** finding (immediate merge blocker)

### Quick sanitization script

```bash
# Replace common credential patterns
sed -i 's/password\s*[:=]\s*"[^"]*"/password: "[REDACTED_CREDENTIAL]"/g' /tmp/diff.patch
sed -i 's/api_key\s*[:=]\s*"[^"]*"/api_key: "[REDACTED_CREDENTIAL]"/g' /tmp/diff.patch
sed -i 's/-----BEGIN.*PRIVATE KEY-----/-----BEGIN [REDACTED_CREDENTIAL] PRIVATE KEY-----/g' /tmp/diff.patch
# Add more patterns as needed
```

### What to flag as Critical

- Hardcoded API keys, tokens, passwords in any file
- `.env` files committed
- Private keys, certificates, or signing keys in source
- Database connection strings with embedded credentials
- OAuth client secrets in client-side code

---

## 12. Anti-sycophancy reminder (applies to this skill especially)

The code reviewer is the last line of defense against subtle bugs and quality debt shipping to production. The reviewer does NOT exist to:

- Approve code to "unblock" the team
- Find "minor" issues that don't block
- Be reasonable about "good enough for now"
- Trust the implementer's confidence over the stress test
- Soften findings to spare feelings
- Approve because "we tested it manually"
- Approve because "the tests pass" (tests don't catch all stress scenarios)
- Approve because "it's a well-known pattern" (well-known patterns have well-known bugs)

If a code path can fail under a realistic Work-A-specific scenario, that's a finding. The severity is determined by the failure mode's impact, not by how inconvenient the finding is.

The reviewer's job is to be the skeptic. The implementer is the optimist. The orchestrator balances them. Without the skeptic, the loop ships code that "works" until it doesn't — and the user discovers it in production.

Hold the line. Code is reality. Stress test is the proof. The gap is the finding.
