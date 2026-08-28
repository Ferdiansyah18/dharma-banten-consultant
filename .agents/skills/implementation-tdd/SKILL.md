---
name: implementation-tdd
description: Execute artifact-driven TDD implementation on Git feature branches. Strictly follows Red → Green → Refactor discipline, with each phase producing a separate Git commit. Sub-tasks are received from progress-map.md, tests are anchored to spec contracts, and minimal code is the goal. Use when implementing any sub-task, fixing a bug, or addressing code-review findings in Refactor Mode. Do NOT use for spec creation, roadmap planning, or code review.
---

# Implementation TDD (Artifact-Driven TDD Discipline)

> **Mental model:** _This skill is the disciplined worker. It turns spec contracts into failing tests, then writes the minimal code to pass them. Nothing more. No premature optimization, no unrequested abstractions, no scope creep._

The primary focus of this skill is **Artifact Compliance and Functional Correctness via Red → Green**. Code quality, refactoring, and edge-case hardening are evaluated downstream by `code-review` (in Refactor Mode if needed).

---

## CHEAT SHEET — read this first, every invocation

### Operating principles (in priority order)

```
1. Spec Anchor         (every test must trace back to a spec section)
2. Red First           (test before code, always — except in Refactor Mode)
3. Minimal Green       (least code that passes the tests, no more)
4. One Phase Per Commit (test, feat, refactor — separate commits, signed)
5. Clean Hand-Off      (branch clean, ready for audit before leaving)
```

### Hard rules — NEVER violate

- **NEVER write implementation code before tests are Red and committed.** The Red commit is the proof that the test is genuine, not post-hoc justification.
- **NEVER add features, helpers, or abstractions not required by the failing tests.** _"I'll need this later"_ is not a justification. The next sub-task or iteration will justify it.
- **NEVER optimize prematurely.** No caching "just in case", no async "for future scale", no config "for flexibility". The test demands it → write it. The test doesn't → don't.
- **NEVER commit code that doesn't make a previously-failing test pass.** If you wrote code and no test demanded it, delete it before commit.
- **NEVER merge, push, or close the sub-task from this skill.** Those are not in scope. This skill produces code; other skills decide what to do with it.
- **NEVER refactor while writing Green code.** Green is "make the test pass with minimal change". Refactor is a separate phase (Refactor Mode, after code-review findings).
- **NEVER pollute tests with implementation details.** Tests test behavior, not implementation. Changing the implementation should not break tests.
- **NEVER skip the Red commit.** Even for "trivial" changes. The Red commit is the audit trail that proves the test was genuine.
- **NEVER write a test that doesn't trace to a spec section.** If you can't point to the spec, the test doesn't belong.
- **NEVER leave the branch dirty.** All work committed before handing off. `git status` clean.

### Current state check (run before starting)

```
[ ] Current mode: ___ (New Feature / Bug Fix / Refactor Mode)
[ ] Sub-task ID from progress-map: ___
[ ] Target spec section: ___
[ ] Branch: `feat/<slug>` or `fix/<slug>` or `refactor/<scope>`
[ ] Branch clean? `git status` shows nothing uncommitted
[ ] Test runner detected: ___ (vitest / jest / pytest / go test / etc.)
[ ] Test runner works? Try a single test before going Red
[ ] Spec sections to cover: ___ (count + list)
[ ] No uncommitted work from previous iteration
```

### The 3 modes

| Mode              | When to use                                                                | Step sequence                 | Skip Red?                                |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| **New Feature**   | Sub-task says "implement X"                                                | Step 1 → Red → Green → Verify | No                                       |
| **Bug Fix**       | Sub-task says "fix bug" or `code-review` found a real defect               | Step 1 → Red → Green → Verify | No                                       |
| **Refactor Mode** | Routed back from `code-review` with quality/findings, NO new functionality | Step 1 → Refactor → Verify    | **YES** (existing tests must stay Green) |

### Commit signatures (the contract)

| Phase         | Signature                                                   | Example                                                             |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Red           | `test(scope): <description> (Red)`                          | `test(auth): add failing test for password reset (Red)`             |
| Green         | `feat(scope): <description> (Green)`                        | `feat(auth): implement password reset endpoint (Green)`             |
| Refactor      | `refactor(scope): <description>`                            | `refactor(auth): extract token validator per code-review`           |
| Bug fix Green | `fix(scope): <description> (Green)`                         | `fix(upload): resolve race condition in concurrent uploads (Green)` |
| Issue linkage | Append `Closes #N` or `Refs #N` to Green or Refactor commit | `feat(auth): ... (Green) - Closes #123`                             |

### The discipline (one-line summary)

> _Write the smallest test that fails because the code doesn't exist. Run it Red. Commit. Write the smallest code that makes it Green. Commit. Stop._

---

## 1. The 3 Modes (decision tree)

The mode determines which steps to run. Choosing the wrong mode is a common mistake that derails the loop.

### New Feature

**Trigger:** Sub-task is "implement X", "add X", "build X", or similar.

**Flow:** Red → Green → Verify

- Tests are written for behavior not yet implemented
- The Red commit is the proof that the test is genuine
- Green is the minimal code to pass the test
- Hand off to `alignment-audit`

**Pitfall:** Writing the implementation first, then the test. This is "test-after", not TDD. The audit will catch it.

### Bug Fix

**Trigger:** Sub-task says "fix X", `code-review` flagged a real defect (not just quality), or user reports a bug.

**Flow:** Red → Green → Verify

- First: write a test that REPRODUCES the bug (the test fails on current code)
- The Red commit is the proof that the bug is reproducible
- Green is the minimal fix to make the test pass
- Hand off to `alignment-audit`

**Pitfall:** Fixing the bug without a test. Without a regression test, the bug will return. The audit will catch it.

**Special case:** If the bug is in production code that has no tests yet, the "Red" phase first writes a test for the surrounding behavior, then a specific test that fails because of the bug. The first test is "infrastructure"; the second is the actual repro.

### Refactor Mode (only from `code-review` findings)

**Trigger:** `code-review` reports quality findings (naming, modularity, edge cases) — NOT new functionality.

**Flow:** Verify Green → Refactor → Verify Green

- **No Red phase.** Refactor Mode assumes existing tests are Green and the goal is to improve code without changing behavior.
- Run the test suite first. If anything is Red, abort Refactor Mode — this is a bug, not a quality issue.
- Refactor to address the findings: rename, extract, restructure, harden edge cases.
- Run the test suite after every meaningful change. If anything goes Red, revert immediately.
- Add regression tests ONLY if `code-review` identified unhandled edge cases (e.g., a "What-If" stress test scenario that wasn't covered).
- Hand off to `code-review` (re-review) or `alignment-audit` if scope expanded

**Pitfall:** Adding new features in Refactor Mode. If you find yourself writing a test for behavior that doesn't exist, you're in New Feature mode, not Refactor Mode. Route back to the orchestrator.

---

## 2. The Discipline (the 4 inviolable rules)

These rules are the difference between TDD and "writing code with tests".

### Rule 1: Spec Anchor

Every test must trace to a spec section. The chain is:

```
Spec section → Test name → Test assertion → Implementation code
```

If any link in this chain is missing, the test is unjustified. Examples:

✅ `brand-product-alignment-spec.md § 2 (3-Second Impression) "should feel calm"` → test `should evoke calm within 3 seconds of page load` → assertion `expect(getComputedStyle(hero).animationDuration).toBe('1.2s')` → implementation `animation: ... 1.2s ease-out;`

❌ `test('should work correctly')` — no spec anchor, no behavioral claim, meaningless

**Validation:** Before each Red commit, walk the chain. If you can't name the spec section, delete the test.

### Rule 2: Red First

The test is written BEFORE the implementation. Run it. See it fail. Commit the failure.

Why this matters:

- The Red commit is the audit trail. It proves the test was written before the code (not as an afterthought).
- A test that never goes Red never proves anything. It might pass for any reason, including the test being wrong.
- `alignment-audit` checks for the Red commit in git history. Missing Red commit = spec violation.

**What "Red" must look like:**

- The specific test you wrote fails
- The failure message clearly indicates the missing behavior
- Other tests still pass (or are also Red, if they share the missing code)
- NOT Red because of: syntax error, missing import, broken harness

If the test is Red for the wrong reason, fix the test before committing. The Red commit is a contract.

### Rule 3: Minimal Green

The implementation is the **smallest change that makes the failing test pass**. Nothing more.

What "minimal" excludes:

- Caching "for performance" (not demanded by the test)
- Async "for scale" (not demanded by the test)
- Config "for flexibility" (not demanded by the test)
- Helpers that "we'll need later" (premature abstraction)
- Logging beyond the spec'd behavior
- Edge cases the test didn't ask for
- Error messages beyond what's required for the test to pass

What "minimal" includes:

- The exact code path the test exercises
- The exact return value the test asserts
- The exact side effect the test checks

After Green: re-read the diff. If you wrote code that no test demanded, delete it before commit.

### Rule 4: One Phase Per Commit

Each phase is a separate commit. The git history tells the story:

- `test(scope): ... (Red)` — proves the test was genuine
- `feat(scope): ... (Green) - Closes #N` — proves the implementation is minimal
- `refactor(scope): ...` — proves the refactor is behavioral-preserving

**Audit expectations:**

- `alignment-audit` will check that the Red commit precedes the Green commit in the branch's history
- The Red and Green commits together form the "atomic sub-task" — neither alone is sufficient

If the test passed on the first run (no Red phase), the test was not TDD. Reject and re-do.

---

## 3. The 4-Step Workflow

```
┌─ Step 1: CONTEXT & HARNESS ─ Verify sub-task, branch, test runner, build 5-Layer Context
├─ Step 2: RED                ─ Write failing test, run to Red, commit (skip in Refactor Mode)
├─ Step 3: GREEN              ─ Write minimal code to pass, run to Green, commit
└─ Step 4: VERIFY & HAND-OFF  ─ Re-verify, check spec coverage, ensure clean state
```

### Step 1: CONTEXT & HARNESS

**Inputs needed:**

- Sub-task ID and target spec section (from `progress-map.md`)
- Current branch (must be a feature/fix/refactor branch, not `main`)
- Test runner (vitest, jest, pytest, go test, cargo test, etc.)
- Spec artifacts accessible

**Actions:**

1. `git branch --show-current` — confirm on the right branch
2. `git status` — confirm clean (no uncommitted work)
3. If not on a feature branch → `git checkout -b feat/<slug>` (or `fix/` / `refactor/`)
4. Identify test runner: read `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` / etc.
5. Run a single existing test to verify the harness works (don't skip this)
6. Read the spec section the sub-task references
7. Construct the 5-Layer Context Chain (see § 6)

**Test Harness Fallback (if no runner is detected):**

- Suggest and scaffold a standard test framework for the tech stack
- Common defaults: `vitest` for JS/TS, `pytest` for Python, `go test` for Go (built-in), `cargo test` for Rust (built-in)
- Configure minimal test setup before writing any tests
- Verify the runner works on a trivial test before proceeding

**Completion gate:**

- [ ] On correct feature branch
- [ ] Branch clean
- [ ] Test runner detected and verified working
- [ ] Target spec section identified
- [ ] 5-Layer Context Chain constructed

### Step 2: RED (failing tests)

**Skip this step ONLY in Refactor Mode.**

**Actions:**

1. Read the spec section thoroughly
2. Identify the behavioral requirements (one or more, depending on sub-task)
3. Create or update test files in the project's standard test directory
4. Write test cases that assert each behavioral requirement
5. **Run the test suite** — confirm the new tests are Red
6. Verify the failure message indicates missing behavior (not syntax error, not harness issue)
7. **Git Red Commit**:
   ```
   git add <test files>
   git commit -m "test(scope): <description> (Red)"
   ```

**Test design rules:**

- Test behavior, not implementation. (e.g., test "user can reset password" not "calls sendEmail with these args")
- One assertion per test (or one cohesive behavioral claim)
- Use descriptive names: `should_<expected>_<when_condition>` or behavior-driven style
- Use the spec language, not implementation jargon
- Mock at the boundary (external services, time, random), not internally

**Anti-patterns to avoid:**

- Testing implementation details (private methods, internal state)
- Asserting on log output or error messages (brittle)
- Test setup that requires 50 lines of fixture (signal the design is too coupled)
- Skipping tests "because they obviously work"
- Copying test patterns from the codebase without checking they fit

**Completion gate:**

- [ ] New tests written
- [ ] Tests are Red with the expected failure
- [ ] Failure reason is missing behavior, not setup error
- [ ] Red commit made with `test(scope): ... (Red)` signature

### Step 3: GREEN (minimal implementation)

**Actions:**

1. Read the failing tests
2. Implement the **minimum code** to make each test pass
3. Re-read the diff after each change — if you wrote code that no test demanded, delete it
4. **Run the test suite** — confirm all tests are Green
5. If a test is still Red, the implementation is incomplete (or the test is wrong) — fix and re-run
6. **Git Green Commit**:
   ```
   git add <implementation files>
   git commit -m "feat(scope): <description> (Green) - Closes #N"
   ```
   (or `fix(scope): ... (Green) - Closes #N` for bug fixes)

**Minimal Green rules:**

- Don't extract a helper "for reuse" if it's only used once
- Don't add a config option "for flexibility" if the spec doesn't mention it
- Don't add error handling "for robustness" if the test doesn't assert on it
- Don't add logging "for observability" if no test checks for it
- DO write the exact code the test exercises
- DO match the spec language in code (naming, types, return values)
- DO keep the implementation flat (no premature hierarchy)

**Pitfalls to avoid:**

- Refactoring while writing Green code (move to Refactor Mode)
- Adding unrequested features (scope creep — caught by `alignment-audit`)
- Optimizing performance (premature — caught by `alignment-audit` if it changes behavior)
- Writing defensive code for edge cases the test didn't ask for

**Completion gate:**

- [ ] All tests Green
- [ ] No unrequested code in the diff
- [ ] Green commit made with `feat(scope): ... (Green) - Closes #N` signature
- [ ] No premature refactoring in this commit

### Step 3.5: REFACTOR MODE (only from `code-review`)

**Skip Step 2 (Red).** Refactor Mode assumes existing tests are Green.

**Actions:**

1. Read the `code-review` findings carefully
2. Run the test suite first — if anything is Red, ABORT (this is a bug, route back to orchestrator)
3. For each finding:
   - Rename / extract / restructure as appropriate
   - Run tests after every meaningful change
   - If tests go Red, revert immediately (your refactor changed behavior — stop and reconsider)
4. Add regression tests ONLY for unhandled edge cases the review identified
5. **Run the full test suite** — all Green
6. **Git Refactor Commit**:
   ```
   git add <files>
   git commit -m "refactor(scope): <description of what was addressed>"
   ```

**Refactor Mode rules:**

- DO NOT add new features (route to New Feature mode)
- DO NOT add unrequested abstractions (the refactor's job is to address findings, not to redesign)
- DO preserve all existing test coverage
- DO keep each refactor commit focused (one finding per commit if possible)
- DO verify Green after every change, not just at the end

**Anti-patterns to avoid:**

- "While I'm in here" additions (addressing findings not in the review)
- Renaming everything in the file (renaming only what the review asked for)
- Adding tests for code that wasn't part of the review
- Skipping the test re-run after a change (catching regressions early is the whole point)

**Completion gate:**

- [ ] All review findings addressed
- [ ] Test suite still all Green
- [ ] No new behavior added
- [ ] Refactor commit made with `refactor(scope): ...` signature

### Step 4: VERIFY & HAND-OFF

**Actions:**

1. **Re-run the full test suite** — all Green
2. **Cross-check spec coverage** — for each requirement in the target spec section, confirm there's a passing test
3. **`git status`** — clean (no uncommitted changes)
4. **`git log main...HEAD`** — verify the Red and Green commits are in order
5. **No debug code, no commented-out code, no TODO comments** left behind
6. **No unrequested changes** in the diff (no drive-by refactors, no formatting changes unrelated to the sub-task)

**Verification checklist (run before hand-off):**

```
[ ] All tests pass
[ ] Spec section requirements all have corresponding passing tests
[ ] Red commit precedes Green commit in git log
[ ] git status is clean
[ ] No debug code, commented code, or TODOs left
[ ] No unrequested changes in the diff
[ ] Commit messages follow the signature contract
[ ] Issue linkage in Green commit (if applicable)
```

**Hand-off:**

- The sub-task is NOT marked complete by this skill
- Hand off to `agentic-dev-loop` (which routes to `alignment-audit` then `code-review`)
- Do NOT mark `[x]` in `progress-map.md` — that's the orchestrator's job after Dual Clean Pass

---

## 4. The 5-Layer Context Chain (operationalized for TDD)

The canonical 5-Layer Context Chain (defined in `agentic-dev-loop`) is constructed by the orchestrator, but this skill also reads and updates it during execution.

### Read on entry

| Layer                              | Source                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| 1. Product & Brand Understanding   | `brand-product-alignment-spec.md` § 1, § 2, § 4                |
| 2. Active Branch & Target Scope    | `git branch --show-current`, `progress-map.md` Issue reference |
| 3. Phase Objective                 | `progress-map.md` active Phase                                 |
| 4. Active Task & Spec Contracts    | `progress-map.md` Sub-Task + target spec section               |
| 5. Execution & Harness Constraints | `package.json` / `pyproject.toml` / etc., test runner command  |

### Update on exit

The skill does not write the context back — that's the orchestrator's job. But it MUST keep the context in mind throughout execution:

- Layer 4 (Active Task): stay focused on the sub-task; don't drift
- Layer 5 (Harness): if a test fails for harness reasons, fix the harness, not the test

---

## 5. Commit Conventions (the contract)

### Per-phase commits

| Phase                     | Signature                                     | When                                           |
| ------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Red                       | `test(scope): <what the test asserts> (Red)`  | After test is Red and verified                 |
| Green                     | `feat(scope): <what was implemented> (Green)` | After tests are Green and verified             |
| Green (bug fix)           | `fix(scope): <what was fixed> (Green)`        | After fix and regression test are Green        |
| Refactor                  | `refactor(scope): <what was refactored>`      | After refactor preserves all tests Green       |
| Test addition in Refactor | `test(scope): <new edge case covered>`        | After new regression test is added (and Green) |

### Scope conventions

`<scope>` should be the **module, component, or feature area**:

- `feat(auth):`, `feat(payments):`, `feat(upload):`
- `test(auth):`, `test(payments):`
- `fix(race-condition):`, `fix(memory-leak):`
- `refactor(token-validator):`, `refactor(error-handler):`

Avoid generic scopes (`feat(code):`, `feat(stuff):`) — they defeat the audit trail.

### Issue linkage

- **Green commits** should include `Closes #N` if the sub-task maps to a GitHub Issue
- **Refactor commits** should include `Refs #N` (do not close, since the implementation is unchanged)
- **Red commits** typically don't need issue linkage (they're preparation for the Green that closes)
- **Spec-only work** (not part of this skill) uses `Refs #N`

### Multi-commit sub-tasks

If a sub-task requires more than one Red+Green cycle (because it has multiple distinct behaviors), each cycle gets its own commit pair. The sub-task is complete when all behaviors are covered.

---

## 6. Test Harness Setup (the fallback)

If the project has no test runner, this skill scaffolds one. This is the **only** situation where the skill modifies the project structure beyond the sub-task's scope.

### Detection

```
Check for these in order:
  1. package.json: look for "test" script, "vitest", "jest", "mocha", etc.
  2. pyproject.toml / setup.py / setup.cfg: look for "pytest", "unittest"
  3. go.mod: built-in `go test`
  4. Cargo.toml: built-in `cargo test`
  5. .csproj / package.json (C#): look for test projects
  6. Other: scan for *.test.*, *_test.*, *.spec.* files
```

If none found → scaffold.

### Scaffolding defaults

| Tech stack | Default                 | Setup                                                                                                 |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| JS/TS      | `vitest`                | `npm install -D vitest @vitest/ui`; add `"test": "vitest"` to package.json; create `vitest.config.ts` |
| Python     | `pytest`                | `pip install pytest`; create `pytest.ini` or `pyproject.toml [tool.pytest.ini_options]`               |
| Go         | `go test` (built-in)    | No setup; just write `*_test.go` files                                                                |
| Rust       | `cargo test` (built-in) | No setup; just write `#[cfg(test)]` modules                                                           |
| Ruby       | `rspec`                 | Add to Gemfile; `bundle install`; create `spec/spec_helper.rb`                                        |

**Verify the runner works** by writing a trivial test (e.g., `expect(1+1).toBe(2)`) and running it before proceeding.

### Scaffolding commit

If the harness was set up, that's a separate commit:

```
chore(test): scaffold vitest test runner
```

Then the Red/Green commits follow as normal.

---

## 7. Anti-Patterns (what NOT to do)

These are the most common ways TDD gets corrupted. The audit and review will catch them; better to avoid them upfront.

### Premature optimization

❌ "This needs caching because it'll be slow at scale"
✅ Only cache if a performance test demands it

❌ "I'll make this async so it scales better"
✅ Only async if the test (or a real concurrent scenario test) requires it

❌ "Let me add a config option for flexibility"
✅ Only config if the spec demands multiple values

### Unrequested abstractions

❌ Extracting a helper used in only one place
❌ Adding a base class "for future subclasses"
❌ Creating an interface "for future implementations"
❌ Adding a factory "for flexibility"

Rule: if a helper is used twice AND the abstraction makes the code clearer, extract. Otherwise don't.

### Scope creep

❌ "While I'm in here, let me also fix this other thing"
❌ "This test would be more robust with this additional assertion"
❌ "I'll add a logging statement so debugging is easier"

If you find yourself doing this, stop. That's a separate sub-task.

### Skipping the Red commit

❌ Writing the implementation, then the test, then committing both together
❌ "The test is trivial, I'll just commit the implementation"
❌ "I'll just verify mentally that the test would have been Red"

The Red commit is the audit trail. Without it, the test could be post-hoc justification.

### Test pollution

❌ Tests that depend on other tests' state
❌ Tests that modify global state without cleanup
❌ Tests that depend on test execution order
❌ Tests that share fixtures without isolation
❌ Tests that hit real external services

Each test should be independently runnable, in any order, with no side effects on other tests.

### Implementation-coupled tests

❌ `expect(component.state.isLoading).toBe(false)` (testing internal state)
❌ `expect(mockFunction).toHaveBeenCalledWith(args)` (testing implementation)
❌ `expect(component.find('div.loading')).toHaveLength(1)` (testing structure)

✅ `expect(getByText('Loading...')).toBeInTheDocument()` (testing user-visible behavior)
✅ `expect(screen.getByRole('button')).toBeDisabled()` (testing accessibility)
✅ `await user.click(button); expect(onSubmit).toHaveBeenCalledWith(payload)` (testing observable outcome)

---

## 8. Failure Modes

| Symptom                                                             | Cause                                                                         | Recovery                                                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Test is Red for wrong reason (syntax error, missing import)         | Harness issue or test setup error                                             | Fix the test/harness, re-run, verify it's Red for the right reason, then commit                                      |
| Test won't go Red (always Green)                                    | Implementation already exists, or test doesn't actually test missing behavior | Verify the test exercises behavior that doesn't exist; if it does, the spec might be wrong — escalate                |
| Test passes immediately after writing                               | TDD discipline broken — you wrote the implementation first                    | Reject the commit, delete the implementation, run the test (should fail), then commit Red first                      |
| Green requires huge refactor                                        | The implementation is the wrong shape for the test                            | This is a design problem, not a TDD problem. Stop. Discuss with the user whether the spec or the test should change. |
| Green requires touching many unrelated files                        | The sub-task was too big (or the design is too coupled)                       | Stop. Route back to orchestrator — sub-task needs to be split in progress-map                                        |
| Refactor Mode breaks tests                                          | The refactor changed behavior                                                 | `git revert` the refactor commit, start over more carefully                                                          |
| Cannot identify the test runner                                     | Project has no tests and no manifest hints                                    | Use the scaffolding fallback (§ 6)                                                                                   |
| Test runner is broken or wrong version                              | Environment issue                                                             | Fix the environment, do not skip tests                                                                               |
| Sub-task references a spec section that doesn't exist               | progress-map out of sync with spec                                            | Stop, route back to orchestrator (cascade)                                                                           |
| Branch is dirty when starting (uncommitted work from prior session) | Previous hand-off was incomplete                                              | Commit the existing work first (as appropriate), or `git stash` it, then proceed                                     |
| Implementation requires 100+ lines                                  | The sub-task is too big                                                       | Stop, route back to progress-mapper to split                                                                         |
| Audit fails because of unrequested changes                          | Scope creep happened                                                          | Revert the unrequested changes, re-commit                                                                            |
| Two test files need to coordinate (shared state)                    | Test design issue                                                             | Refactor to isolate tests; use `beforeEach` with fresh state                                                         |

---

## 9. Worked Examples

### Example A: New Feature — Password Reset

**Sub-task from progress-map:** `1.1.3 — Add password reset endpoint`
**Target spec:** `backend-architecture-spec.md` § 1 (System Overview) + § 3 (Communication & Reliability)
**Mode:** New Feature

```
Step 1: Context & Harness
  - Branch: feat/auth-password-reset (already on it)
  - Test runner: pytest (verified by running existing test)
  - Spec: password reset endpoint with email token, 1hr expiry, rate-limited
  - Context chain constructed

Step 2: Red
  - Write test_password_reset.py:
    - test_reset_request_with_valid_email_returns_200
    - test_reset_request_creates_token_in_db
    - test_reset_token_expires_after_1_hour
    - test_reset_with_expired_token_returns_400
    - test_reset_with_invalid_token_returns_400
    - test_reset_request_is_rate_limited
  - Run pytest → 6 tests Red (expected, no implementation yet)
  - Verify failure messages: "AttributeError: module 'auth' has no attribute 'reset_password'"
  - Commit: "test(auth): add failing tests for password reset (Red)"

Step 3: Green
  - Implement reset_password() function — minimal, no abstraction
  - Implement token storage (simple DB insert)
  - Implement rate limit (simple counter)
  - Run pytest → 6 tests Green, no other tests broken
  - Re-read diff: no unrequested code? yes
  - Commit: "feat(auth): implement password reset endpoint (Green) - Closes #123"

Step 4: Verify & Hand-off
  - Re-run pytest → all Green
  - git status → clean
  - git log → Red then Green in order
  - Cross-check spec: 6 requirements, 6 tests, all covered
  - No debug code, no TODOs
  - Hand off to alignment-audit
```

### Example B: Bug Fix — Race Condition

**Sub-task from progress-map:** `2.3.1 — Fix race condition in concurrent uploads (raised by code-review)`
**Mode:** Bug Fix

```
Step 1: Context & Harness
  - Branch: fix/upload-race-condition
  - Test runner: pytest
  - Spec: backend-architecture-spec.md § 5 (Security & Data Integrity) — concurrent writes must not corrupt state
  - Context chain constructed

Step 2: Red (the repro)
  - Write test_concurrent_uploads.py:
    - test_concurrent_uploads_dont_corrupt_file (the actual repro)
    - test_upload_locks_during_write (precautionary)
  - Run pytest → tests Red (current code has the race)
  - Verify: test fails with "file is corrupted" or similar (not setup error)
  - Commit: "test(upload): add failing tests for concurrent upload race (Red)"

Step 3: Green
  - Implement file lock (minimal — single-process lock first, no distributed locking)
  - Run pytest → tests Green
  - Re-read diff: no distributed locking added? correct, minimal
  - Commit: "fix(upload): add file lock to prevent concurrent corruption (Green) - Closes #456"

Step 4: Verify & Hand-off
  - All Green
  - Cross-check: spec § 5 requirement met
  - Hand off to alignment-audit
```

### Example C: Refactor Mode — Extract Class

**Triggered by:** `code-review` finding on previous iteration: "TokenValidator has 3 responsibilities, extract to separate class"
**Mode:** Refactor (no Red)

```
Step 1: Context & Harness
  - Branch: refactor/auth-token-validator
  - Test runner: pytest
  - Existing tests: 24 tests for auth, all currently Green
  - Verify Green first: pytest → 24 passed

Step 3.5: Refactor
  - Run tests → all Green (baseline)
  - Extract TokenValidator class from auth.py to auth/token_validator.py
  - Update auth.py to use the new class
  - Run tests → 24 Green? yes
  - Rename internal methods for clarity (per code-review finding)
  - Run tests → 24 Green? yes
  - Re-read diff: only the rename + extract? yes, no new features
  - Commit: "refactor(auth): extract TokenValidator per code-review"

Step 4: Verify & Hand-off
  - All Green
  - git status clean
  - No new behavior, no new tests needed
  - Hand off to code-review (re-review)
```

---

## 10. Hand-Off Protocol

This skill does NOT close the sub-task. Hand-off is to the orchestrator.

### Hand-off to `alignment-audit`

```
After Green commit:
  - All tests pass
  - Branch clean
  - Red + Green commits in order
  - Issue linkage in Green commit (if applicable)
  - No unrequested changes in diff
  → Signal to orchestrator: "Implementation complete, ready for alignment-audit"
```

### Hand-off to `code-review` (after audit Clean Pass)

```
Handled by orchestrator, not by this skill.
This skill should NOT directly invoke code-review.
```

### Hand-off back to `progress-mapper` (when sub-task is too big)

```
If during Step 3 you realize the sub-task is too big:
  - Stop. Do NOT commit incomplete work.
  - Revert any uncommitted changes
  - Signal to orchestrator: "Sub-task X.Y.Z is too large, request split in progress-mapper"
```

### Hand-off back to orchestrator (cascade)

```
If during execution you discover a spec contradiction:
  - Stop. Do NOT commit anything.
  - Document the contradiction with evidence
  - Signal to orchestrator: "Escalation needed, see <details>"
```

---

## 11. Anti-sycophancy reminder (applies to this skill too)

This skill exists to serve the project and the user via the TDD discipline. It does NOT exist to:

- Skip the Red commit because the work "feels obvious"
- Add unrequested features because "the user would probably want it"
- Refactor opportunistically while writing Green
- Make the implementation "nice" at the cost of minimal
- Pretend tests are Red when they're not
- Pass off the sub-task as complete when the spec isn't fully covered

If the sub-task requires more than one TDD cycle, the orchestrator should split it — not this skill silently expanding scope. If the spec is wrong, the cascade handles it — not this skill silently working around it.

TDD discipline is the contract. The Red commit is the proof. The minimal Green is the discipline. Refactor is separate. Spec is the anchor. Test is the assertion. Commit is the trail.

If any of these break, the loop loses its auditability. Hold the line.
