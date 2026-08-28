---
name: progress-mapper
description: Generate and maintain the living progress map (progress-map.md) by decomposing approved specs into atomic TDD-sized sub-tasks. Acts as the strategic bridge between spec discovery (brand-product-alignment, front-end-designer, backend-architect) and active execution (implementation-tdd). Use when breaking down specs into actionable tasks, refining the roadmap, or tracking iteration progress. Do NOT use for spec creation (use brand-product-alignment / front-end-designer / backend-architect) or for direct implementation (use implementation-tdd).
---

# Progress Mapper (Living Roadmap & Sub-Task Decomposer)

> **Mental model:** _This skill turns approved specs into a living roadmap of atomic sub-tasks. It is the bridge between "what we want" (specs) and "what we do" (TDD cycles)._

This skill produces and maintains `progress-map.md` — the **single source of truth for execution state**. It does NOT write code, designs, or specs. It decomposes approved specs into atomic units, assigns them to Git branches/issues, and tracks the iteration log.

---

## CHEAT SHEET — read this first, every invocation

### Operating principles (in priority order)

```
1. Two Guards First      (inferred-spec + spec-status — both MUST pass before decomposition)
2. Atomic Sub-Tasks Only  (each sub-task fits in ONE TDD cycle, no exceptions)
3. Living Roadmap        (the map evolves; completed sub-tasks can be re-opened)
4. Append-Only Audit     (## Iteration Log is never edited, only appended)
```

### Hard rules — NEVER violate

- **NEVER decompose a spec with `[INFERRED — Review Required]` tags still unreviewed.** Pause and ask the user to sign off on inferred content first.
- **NEVER decompose a spec with status `Locked` without explicit user confirmation.** The cascade protocol must run, not silent breakdown changes.
- **NEVER decompose a spec with status `Revised` without running the cascade protocol first.** Re-open invalidated sub-tasks, re-audit in-progress work, inject corrective sub-tasks.
- **NEVER create a sub-task that can't be completed in ONE TDD cycle** (Red → Green → Audit → Review). If it's bigger, split it. If it's smaller, merge it.
- **NEVER skip the two guards.** Even on a "quick refinement", run them. Specs change silently; the guards catch drift.
- **NEVER edit `## Iteration Log` entries.** Append-only. If a sub-task is re-opened, add a new entry — don't rewrite history.
- **NEVER delete milestones or tasks from `progress-map.md`.** Reopen them (`[x]` → `[ ] Reopened: [reason]`) or annotate as `[Obsolete: see Sub-Task X.Y.Z]`.
- **Atomic means TDD-shaped, not "small".** A 4-hour refactor across 12 files is NOT atomic. A 20-minute single-file change with tests IS atomic. The test is: _"Can I write the Red test, then the Green implementation, then pass audit and review, all in one clean cycle?"_

### Current state check (run before each invocation)

```
[ ] Brand spec status: ___ (Draft / Approved / Locked / Revised / Missing)
[ ] Frontend spec status: ___ (or N/A)
[ ] Backend spec status: ___ (or N/A)
[ ] Any `[INFERRED — Review Required]` tags unreviewed? → STOP, ask user
[ ] Any `Locked` spec being modified? → STOP, run cascade
[ ] Any `Revised` spec? → STOP, run cascade first
[ ] Last `progress-map.md` update: ___ (date + commit)
[ ] Last Iteration Log entry: Iteration #___
[ ] Active sub-task: ___
```

### The 3 execution routes (pick ONE)

| Route               | When to use                                                             | Decomposition priority                                                                     |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Front-End First** | Visual/UX is the primary value driver, OR backend spec is minimal       | Visual hierarchy → Layout tokens → Hero/interactive states → Component primitives → Polish |
| **Back-End First**  | Data/infra is the primary value driver, OR front-end is an afterthought | Domain models → Persistence → API contracts → Error handling → Performance moat            |
| **Full-Stack**      | Both layers must ship together, OR specs are tightly coupled            | Backend data contracts first → Frontend consumption → Integration polish                   |

**Pick by user intent, not by what's "easier".** Ask the user if unclear.

### Atomic sub-task checklist (run for every sub-task before adding to map)

```
□ Can be completed in ONE TDD cycle (Red → Green → Audit → Review)?
□ Has a single, clear deliverable (one component, one endpoint, one decision)?
□ Has explicit acceptance criteria (what tests prove it works)?
□ Maps to ONE Git branch (or one logical commit on an existing branch)?
□ Is independently testable (doesn't depend on incomplete upstream work)?
□ Has a clear "done" signal (not "work on it until it feels right")?

If any answer is NO → split, merge, or refine. Do not add to map.
```

---

## 1. The Two Guards (run BEFORE any decomposition)

Every invocation of this skill — even a "quick refinement" — runs both guards first. They are the entry point for the cascade protocol and the inferred-spec protection.

### Guard 1: Inferred-Spec Guard

**What it does:** Scans all referenced specs for `[INFERRED — Review Required]` tags.

```
Scan all spec files referenced by this decomposition:
  - brand-product-alignment-spec.md
  - front-end-design-spec.md
  - backend-architecture-spec.md

For each `[INFERRED — Review Required]` tag found:
  Is the surrounding section user-confirmed?
    YES → proceed
    NO  → STOP. Ask user to review the inferred content.
          Do not decompose until the user has signed off.
```

**Why it matters:** Specs that were inferred from existing code (mid-development projects) need user validation before they become the basis for task breakdown. Decomposing unvalidated inferred content propagates the assumption into the implementation.

### Guard 2: Spec-Status Guard

**What it does:** Reads the `Status` field at the top of each referenced spec, then routes to the right action.

| Spec Status | Action                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Missing`   | STOP. The relevant spec doesn't exist. Route back to the appropriate discovery skill (brand-product-alignment / front-end-designer / backend-architect).                                                     |
| `Draft`     | Proceed, but mark all sub-tasks as `[Tentative]` in the map. Re-run this guard when spec reaches `Approved`.                                                                                                 |
| `Approved`  | Proceed normally. This is the stable version for breakdown.                                                                                                                                                  |
| `Locked`    | STOP. Implementation in progress. Ask the user: _"This spec is `Locked`. Refining the breakdown will trigger the cascade protocol. Confirm?"_ — only proceed on explicit yes.                                |
| `Revised`   | STOP. Trigger the cascade protocol: re-open invalidated sub-tasks, re-audit in-progress work, inject corrective sub-tasks. Append `## Revision History` to the spec. Only proceed after cascade is complete. |

**Why it matters:** Working against a `Locked` spec without cascade = silent spec drift, broken audit trail, work that gets invalidated later. Working against a `Revised` spec without cascade = the roadmap doesn't reflect the current spec reality.

---

## 2. Route Selection (which of 3 to use)

The route is the **decomposition priority order** — which layer's work is sequenced first. It does NOT change the skills invoked (the orchestrator handles that), it changes what gets decomposed first.

### How to pick

```
Ask the user (if unclear):
  "Where does the value come from first?
   (a) The interface/UX (Front-End First)
   (b) The data/system (Back-End First)
   (c) Both, in tight coordination (Full-Stack)"

Default if user says "I don't know":
  → Full-Stack with backend data contracts first (the safer default)
```

### Front-End First

**When:** Visual/UX is the differentiator, OR the backend spec is intentionally minimal/standard.

**Decomposition sequence:**

1. Visual hierarchy (top-fold, key pages, navigation)
2. Layout tokens (grid, spacing, breakpoints)
3. Hero & interactive state components
4. Component primitives (buttons, inputs, cards)
5. Polish: micro-interactions, motion, accessibility refinements

**Anti-pattern:** Decomposing backend work first because "we need the API first" — this route explicitly says: design the interface, then build the API to support it.

### Back-End First

**When:** Data/infra is the differentiator, OR the front-end is a thin presentation layer.

**Decomposition sequence:**

1. Domain models (entities, relationships, validation)
2. Persistence layer (schema, migrations, indexes)
3. API contracts (endpoints, request/response shapes)
4. Error handling & resilience (retries, fallbacks, timeouts)
5. Performance moat (caching, indexing, query optimization)

**Anti-pattern:** Decomposing UI polish first because "users will see the UI" — this route explicitly says: build the data foundation, then expose it.

### Full-Stack

**When:** Both layers must ship together, OR specs are tightly coupled (one can't be finalized without the other).

**Decomposition sequence:**

1. Backend data contracts (entities + API shapes)
2. Backend implementation (to the contract)
3. Frontend types generated from backend contract
4. Frontend consumption (state management, error handling)
5. Integration polish (loading states, error boundaries, real-time)

**Anti-pattern:** Doing 100% backend then 100% frontend — integration bugs compound. Full-Stack means interleaved with explicit handoffs at each layer's contract boundary.

---

## 3. The Decomposition Process

Goal: turn approved specs into a structured hierarchy of Milestones → Tasks → Sub-Tasks, with explicit Git mapping.

### The hierarchy (3 levels)

| Level         | Scope                                           | Git mapping                                              | Example                                        |
| ------------- | ----------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| **Milestone** | Major logical phase, often a release            | One Milestone = one long-lived feature branch (optional) | "Core Foundation & Moat Setup"                 |
| **Task**      | A feature capability or architectural component | One Task = one GitHub Issue (or Linear/Jira)             | "User authentication flow"                     |
| **Sub-Task**  | ONE TDD cycle of work                           | One Sub-Task = one feature branch (short-lived)          | "Implement password reset endpoint with tests" |

**Why 3 levels:** Milestones give user-facing structure (release boundaries). Tasks give tracking structure (issue tracker units). Sub-Tasks give execution structure (one-cycle units).

### Decomposition rules

**Milestone → Task:** Group related features into a logical phase. Each Milestone should be shippable in isolation (even if not all features are complete).

**Task → Sub-Task:** Each Task decomposes into 1-7 Sub-Tasks. More than 7 = the Task is too big, split it. Fewer than 2 = the Task is too small, merge it with the next Task.

**Sub-Task atomicity (the hard rule):** See the checklist in the cheat sheet. If a Sub-Task can't be Red→Green→Audit→Review'd in one cycle, it's not a Sub-Task.

### Branch/issue mapping (the contract)

| Level      | Git mapping                       | Convention                                                       |
| ---------- | --------------------------------- | ---------------------------------------------------------------- |
| Milestone  | Optional long-lived branch (rare) | `milestone/<name>` or use the main feature branch                |
| Task       | One issue (or skip)               | `Issue #N`, `JIRA-XXX`, `Linear-XXX`, or standalone (no tracker) |
| Sub-Task   | One feature branch                | `feat/<task-slug>`, `fix/<bug-slug>`, `refactor/<scope>`         |
| Completion | One commit SHA                    | `[x] Sub-Task 1.1.1 (Commit: a1b2c3d)`                           |

**If no issue tracker is used:** Sub-tasks still get a branch and commit SHA, but no `Issue #N` reference. This is valid for solo/small projects.

---

## 4. The 4-Step Workflow

```
┌─ Step 1: INGEST & VALIDATE ─ Run the 2 guards. Read all 3 specs. Confirm route.
├─ Step 2: DECOMPOSE        ─ Milestones → Tasks → Sub-Tasks. Apply atomic checklist.
├─ Step 3: GENERATE          ─ Synthesize progress-map.md. Present to user.
└─ Step 4: MAINTAIN          ─ Update on each iteration. Re-open on cascade. Append to log.
```

### Step 1: INGEST & VALIDATE

- Read all 3 spec files (brand, frontend, backend)
- Run both guards (inferred-spec, spec-status)
- Confirm the route with the user (or default to Full-Stack)
- Note the strategy route in the `## Execution Overview` of the map

**Completion gate:**

- [ ] All specs read
- [ ] No unreviewed `[INFERRED — Review Required]` tags
- [ ] All spec statuses validated
- [ ] Route confirmed (or defaulted)

**If any check fails:** STOP. Resolve before proceeding.

### Step 2: DECOMPOSE

- Apply route-specific sequence (from § 2)
- Build Milestones → Tasks → Sub-Tasks hierarchy
- Run the atomic checklist on every Sub-Task
- Assign Git mapping (branch per Sub-Task, optional issue per Task)
- Note dependencies between Sub-Tasks (Sub-Task 1.2 depends on 1.1's commit)

**Anti-patterns to avoid:**

- Decomposing by "what the user said in order" instead of by technical dependency
- Making Sub-Tasks that span multiple files "for efficiency" — split them
- Skipping the atomic checklist because the work "feels" small
- Adding speculative Sub-Tasks "just in case" — only what's in the spec

**Completion gate:**

- [ ] Every Sub-Task passes the atomic checklist
- [ ] Dependencies are noted
- [ ] Branch/issue mapping is explicit

### Step 3: GENERATE

- Synthesize `progress-map.md` at the project root
- Use the template (see § 5)
- Include `## Iteration Log` with `### Iteration #0` placeholder
- Present to the user for sign-off
- Do NOT start TDD until user signs off

**Completion gate:**

- [ ] `progress-map.md` generated
- [ ] User has signed off on the structure
- [ ] `progress-map.md` is committed (or noted as pending)

### Step 4: MAINTAIN (the ongoing step)

This step runs throughout the project lifecycle, not just at the start. Every time `implementation-tdd` finishes a Sub-Task:

1. **Select the next pending Sub-Task** (in dependency order, or as user requests)
2. **Hand off to `implementation-tdd`** (with the Sub-Task ID, target spec section, test runner)
3. **On Dual Clean Pass** (handled by `agentic-dev-loop`):
   - Check off the Sub-Task: `[x] Sub-Task 1.1.1 (Commit: a1b2c3d)`
   - Append to `## Iteration Log` (see § 6)
4. **On cascade** (spec change):
   - Re-open invalidated Sub-Tasks (`[x]` → `[ ] Reopened: [reason]`)
   - Inject corrective Sub-Tasks if needed
   - Re-validate the affected Milestone/Task structure
5. **On audit/review failure** (handled by `agentic-dev-loop`):
   - The Sub-Task stays open; the failure is the agent's problem to fix, not the map's
6. **Periodic refactor of the map** (every 5-10 Sub-Tasks):
   - Are there Sub-Tasks that should be merged?
   - Are there Tasks that should be split?
   - Are there Milestones that have grown too large?

**Completion gate (per iteration):**

- [ ] Sub-Task check-off with SHA
- [ ] `## Iteration Log` entry appended
- [ ] Map is consistent with reality (no phantom `[ ]` for completed work, no `[x]` for incomplete)

---

## 5. The `progress-map.md` Template

```markdown
# Development Progress Map: [Product / System Name]

> **Status:** `Active` (or `Paused` / `Complete`)
> **Strategy Route:** [Front-End First | Back-End First | Full-Stack]
> **Last Updated:** YYYY-MM-DD
> **Current Iteration:** #N

---

## Execution Overview

- **Strategy Route**: [Front-End First | Back-End First | Full-Stack]
- **Specs ingested**: brand-product-alignment ✓, front-end-design ✓/N/A, backend-architecture ✓/N/A
- **Spec statuses**: brand=Approved, frontend=Approved, backend=Approved (as of YYYY-MM-DD)
- **Target Branch Pattern**: `feat/<task-slug>`
- **Issue Tracker**: [GitHub Issues | Linear | Jira | None]
- **Current Completion**: [X/N Sub-Tasks completed = Y%]

---

## Milestone 1: [Phase Name]

> **Branch**: `milestone/<name>` (optional) | **Goal**: [what this milestone achieves]

- [ ] **Task 1.1: [Feature / Component Name]** `[Issue #N if tracked]`
  - [ ] Sub-Task 1.1.1: [Atomic TDD Scope] `[Status: Pending]`
    - Depends on: — (or Sub-Task X.Y.Z)
    - Target spec section: [brand-product-alignment §X, etc.]
  - [ ] Sub-Task 1.1.2: [Atomic TDD Scope] `[Status: Pending]`
    - Depends on: Sub-Task 1.1.1

- [ ] **Task 1.2: [Feature / Component Name]** `[Issue #M]`
  - [ ] Sub-Task 1.2.1: [Atomic TDD Scope] `[Status: Pending]`
  - [ ] Sub-Task 1.2.2: [Atomic TDD Scope] `[Status: Pending]`
  - [ ] Sub-Task 1.2.3: [Atomic TDD Scope] `[Status: Pending]`

---

## Milestone 2: [Next Phase Name]

> **Branch**: `milestone/<name>` (optional) | **Goal**: [...]

- [ ] **Task 2.1: [Feature / Component Name]**
  - [ ] Sub-Task 2.1.1: [Atomic TDD Scope] `[Status: Pending]`

---

## Reopened Items

> Items previously `[x]` that have been reopened. Each entry shows what triggered the reopen.

- (empty — all completed sub-tasks are still good)

---

## Iteration Log

> Append-only. Each entry is added by the agent after a Dual Clean Pass through `implementation-tdd` → `alignment-audit` → `code-review`. NEVER edited, only appended.

### Iteration #0 — YYYY-MM-DD

- **Sub-Task:** — (project scaffolded)
- **Status:** ✅ Initialized
- **Notes:** `progress-map.md` created. Begin Iteration #1 with the first pending sub-task.

### Iteration #1 — YYYY-MM-DD

- **Sub-Task:** 1.1.1 — [name]
- **Status:** ✅ Clean Pass / 🔄 Cycled Back / 🚨 Blocked
- **Branch:** `feat/<slug>` (merged / in progress)
- **Commits:** [count]
- **Tests:** [N]/[N] passing
- **Audit findings:** 0C / 0H / 0M / 0L
- **Review findings:** 0C / 0H / 0M / 0L
- **Notes:** [1-2 sentence context]
- **Next:** 1.1.2
```

---

## 6. Iteration Log Protocol (append-only)

The `## Iteration Log` is the **persistent audit trail** of what the loop has done. It is the source of truth for "what shipped and when".

### When to append

After every Dual Clean Pass, before moving to the next Sub-Task. The append happens in `agentic-dev-loop` Phase 4, but `progress-mapper` defines the format.

### Format (one entry per iteration)

```markdown
### Iteration #N — YYYY-MM-DD

- **Sub-Task:** [ID] — [plain name]
- **Status:** ✅ Clean Pass / 🔄 Cycled Back / 🚨 Blocked
- **Branch:** `feat/...` (merged / in progress)
- **Commits:** [count] (1 Red, 1 Green, [N follow-up])
- **Tests:** [N]/[N] passing
- **Audit findings:** 0C / [N]H / [N]M / [N]L
- **Review findings:** 0C / [N]H / [N]M / [N]L
- **Notes:** [1-2 sentence context, optionally referencing spec section or commit]
- **Next:** [next Sub-Task ID + name]
```

### Append-only enforcement

- NEVER edit a previous entry, even to "fix a typo". Add a new entry instead.
- NEVER reorder entries. Chronological order is sacred.
- NEVER delete an entry. If a Sub-Task was reopened, the original entry stays; a new entry records the reopen.
- If the log gets large, that's fine. It's the audit trail. The size is a feature.

---

## 7. Living Roadmap Protocol (re-opening completed sub-tasks)

Real-world engineering means completed work is sometimes invalidated. The map must support this without losing history.

### When to re-open a Sub-Task

| Trigger                                                     | Action                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Spec revision invalidates the Sub-Task's premise            | Re-open with `[ ] Sub-Task 1.1.1 [Reopened: spec changed, see Iteration #N]` |
| Audit found a missed spec requirement                       | Re-open and add a corrective Sub-Task                                        |
| Code review found a hidden bug that requires spec amendment | Re-open with explanation                                                     |
| User explicitly asks to redo a Sub-Task                     | Re-open with `[ ] Sub-Task 1.1.1 [Reopened: user request]`                   |

### Re-open syntax

```markdown
- [ ] Sub-Task 1.1.1: [Name] `[Status: Reopened — Iteration #N]`
  - Reason: [one-line explanation]
  - Action: [re-implement / refactor / spec amendment needed]
```

### What NOT to re-open (and what to do instead)

- ❌ Sub-Task has a typo in the name → edit the name in place (this is allowed, it's not a "completion" change)
- ❌ Sub-Task was technically complete but the work was suboptimal → open a NEW Sub-Task for the improvement, don't reopen the old one
- ❌ Spec drift detected but the Sub-Task still meets the new spec → no re-open needed, but note the spec change in `## Revision History`

### Re-opening as part of cascade

When the cascade protocol runs (spec change), `progress-mapper` is invoked to:

1. Identify all Sub-Tasks that referenced the changed spec section
2. Re-open completed ones with `[Reopened: spec X.Y changed]`
3. Inject corrective Sub-Tasks if the change requires new work
4. Append to the affected spec's `## Revision History`
5. Append a new `### Iteration #N+1` to the log explaining the cascade

---

## 8. Failure Modes — decomposition playbook

| Symptom                                            | Cause                                                      | Recovery                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Sub-Task sits in `Pending` for 2+ iterations       | Sub-Task is too big, agent can't complete it in one cycle  | Split the Sub-Task into smaller ones                                                                 |
| Audit repeatedly finds "spec ambiguous"            | The Sub-Task description wasn't specific enough            | Rewrite the Sub-Task with concrete acceptance criteria, link to specific spec sections               |
| User says "I don't know which Sub-Task to do next" | The map is too coarse; user can't see the path             | Decompose further, or add an `## Active Focus` section at the top                                    |
| Two Sub-Tasks depend on each other circularly      | The decomposition was wrong; they're actually one Sub-Task | Merge them into one Sub-Task                                                                         |
| Iteration log entries pile up with "0 tests"       | The Sub-Tasks are config-only or trivial                   | Merge trivial Sub-Tasks into a single "infrastructure setup" Sub-Task                                |
| User wants to abandon a Milestone                  | Strategic change                                           | Don't delete; mark all Sub-Tasks as `[Obsolete: pivoted to Milestone X]` with reason                 |
| Branch per Sub-Task creates merge hell             | Sub-Tasks are too granular                                 | Group related Sub-Tasks under one branch (commit per Sub-Task)                                       |
| Cascade protocol re-opens half the map             | Spec change was large                                      | This is expected; the protocol is working. Re-validate, re-implement.                                |
| Sub-Task completes but audit fails 3 times         | Sub-Task is testing implementation, not behavior           | Rewrite tests to test behavior; the Sub-Task may need splitting                                      |
| Map is 50+ pages and unreadable                    | Over-decomposition                                         | Merge Sub-Tasks; aim for 1-2 page map per Milestone                                                  |
| User wants to skip the map and "just start coding" | User impatience                                            | Refuse politely. The map is the source of truth. 10 minutes for the map saves hours of misalignment. |

---

## 9. Worked Examples

### Example A: Decomposing a brand-new spec

**Input:** All 3 specs are `Approved`. User chose Full-Stack route.

**Decomposition thought process:**

1. Read brand-product-alignment § 1 (Personality: "trustworthy, precise, calm")
2. Read backend-architecture § 1 (Core entities: User, Account, Transaction)
3. Read front-end-design § 1 (Brand moat: "micro-interaction precision")

**Milestone 1: Data Foundation** (backend-first, since route is Full-Stack)

- Task 1.1: User & Account Domain
  - Sub-Task 1.1.1: User entity with email validation
  - Sub-Task 1.1.2: Account entity with balance
  - Sub-Task 1.1.3: Repository for User + Account
- Task 1.2: Transaction Domain
  - Sub-Task 1.2.1: Transaction entity with state machine
  - Sub-Task 1.2.2: Repository with optimistic locking
  - Sub-Task 1.2.3: Atomic transfer logic

**Milestone 2: API Contracts**

- Task 2.1: User/Account API
- Task 2.2: Transaction API

**Milestone 3: Frontend Integration**

- Task 3.1: Account UI
- Task 3.2: Transaction UI
- Task 3.3: Real-time updates

**Each Sub-Task verified against atomic checklist.** All pass. Map is generated, presented to user for sign-off.

### Example B: Re-opening after spec change

**Scenario:** Mid-implementation, user says "We need to add 2FA to user accounts".

1. Cascade triggered. `brand-product-alignment` re-engaged.
2. Brand spec revised (Status: `Approved` → `Revised`). Append to Revision History.
3. `progress-mapper` invoked with cascade flag.
4. Identify affected Sub-Tasks: All Sub-Tasks in Task 1.1 (User & Account Domain).
5. Action:
   - Sub-Task 1.1.1 (`[x] User entity with email validation`) — re-open with `[Reopened: 2FA requires additional fields]`
   - Sub-Task 1.1.2 (`[x] Account entity`) — re-open with `[Reopened: 2FA must integrate with Account]`
   - Sub-Task 1.1.3 (`[x] Repository for User + Account`) — keep `[x]`, but note it will be re-audited
6. Inject new Sub-Task: `Sub-Task 1.1.4: Add 2FA fields to User entity (TOTP secret, backup codes)`.
7. Inject new Sub-Task: `Sub-Task 1.1.5: 2FA setup/verify API endpoint`.
8. Append to `## Revision History` of brand spec.
9. Append to `## Iteration Log` of progress-map: `### Iteration #N — Re-opened 1.1.1, 1.1.2; added 1.1.4, 1.1.5 due to 2FA requirement`.

### Example C: Periodic refactor

**Scenario:** 10 Sub-Tasks done. Map is getting cluttered. Time for a refactor.

1. Review the map:
   - Sub-Task 1.1.1, 1.1.2, 1.1.3 were trivial and merged into one commit. Should they be one Sub-Task?
   - Task 2.1 has 8 Sub-Tasks — over the 1-7 range. Should it split?
   - Sub-Task 3.2.1 was completed but the test was inadequate. Re-opened.
2. Refactor:
   - Merge 1.1.1, 1.1.2, 1.1.3 into one Sub-Task with proper scope.
   - Split Task 2.1 into 2.1 (auth) and 2.2 (account).
   - Note the re-open of 3.2.1 in Iteration Log.
3. Don't delete old references; instead, mark merged Sub-Tasks as `[Merged into 1.1.4 — see Iteration #N]`.

---

## 10. Git Integration

### Commit conventions for the map itself

- `chore(roadmap): initialize progress-map.md` — first creation
- `chore(roadmap): decompose brand+frontend+backend specs into Milestone 1` — initial decomposition
- `chore(roadmap): reopen Sub-Task 1.1.1 due to 2FA spec change` — cascade re-open
- `chore(roadmap): refine Milestone 2 after spec revision` — periodic refactor
- `chore(roadmap): add Iteration #N log entry` — sub-task completion (often part of a larger commit)

### Status updates (when to commit the map)

- After every Sub-Task check-off (atomic with the work, or as a follow-up)
- After every cascade re-open
- After every periodic refactor
- Don't commit the map during active TDD work (it'll cause merge conflicts)

### Branch policy

- Map changes happen on the same feature branch as the Sub-Task being completed
- Map-only changes (no code) get their own branch: `chore/roadmap-<reason>`

---

## 11. Anti-sycophancy reminder (applies to this skill too)

The progress mapper is not a wish-list generator. It does not exist to:

- Make the user feel productive by having a 50-page map
- Skip the atomic checklist because the work "feels small"
- Decompose against a `Locked` spec to "get ahead"
- Pretend a sub-task is done when it's not (incomplete `[x]`)
- Refuse to re-open completed work when it should be
- Add speculative sub-tasks "just in case"

The map is the source of truth for execution state. If the map lies, the loop lies. If the loop lies, the project fails silently.

If a Sub-Task can't be completed in one cycle, split it. If a spec is `Locked` and changing, run the cascade. If the user wants to skip the map, refuse politely. The map is non-negotiable.
