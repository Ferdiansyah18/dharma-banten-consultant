# Workspace & Preference Setup

Operational guide for the `.journal/` directory layout, initial bootstrap, and user preference management.

---

## 1. Directory Structure

The comprehension workspace is private to the project:

```
.journal/
├── assets/
│   └── styles/
│       └── journal.css       # Dynamic project-tailored stylesheet
└── comprehend/
    ├── NOTES.md              # User explanation preferences & takeaways
    ├── modules/
    │   └── 0001-<slug>.html  # Standalone HTML walkthrough reports
    └── reference/
        └── *.html            # Persistent glossaries and architectural maps
```

---

## 2. First-Run Bootstrap

If `.journal/comprehend/` does not exist on invocation:

1. **Create Directories**: Create `modules/`, `reference/`, and `.journal/assets/styles/`.
2. **Gitignore Protection**: Append `.journal/` to the project's `.gitignore` file.
3. **Dynamic CSS Generation**:
  - Inspect project styling, fonts, and dark/light themes.
  - Generate `.journal/assets/styles/journal.css` supporting clean typography, responsive layout, legible code blocks, and print-ready styles.
4. **Preference Discovery**: Initialize `NOTES.md` per the Onboarding Interview below.

---

## 3. Preference Discovery & Maintenance (`NOTES.md`)

`NOTES.md` is the single source of truth for how explanations and walkthroughs must be tailored.

### First-Run Interview (If `NOTES.md` is missing or empty)
Ask one open-ended question with illustrative options:
- **Systemic / Structural**: Focus on boundaries, component relationships, and data flow.
- **Step-by-Step Execution**: Trace line-by-line execution paths and edge cases.
- **Conceptual / Analogy**: High-level mental models first, anchored by code.
- **Interactive Q&A**: Minimal summary first, drill down on user request.

Save the result as 3–5 actionable bullet points under `# User Preferences` in `.journal/comprehend/NOTES.md`.

### Ongoing Maintenance Rules
- **Direct Feedback**: Immediately update `NOTES.md` when the user requests shifts in depth, visual structure, or pacing.
- **Single Destination**: Comprehend explanation rules belong exclusively in `NOTES.md`, never in global config files.
- **Actionable & Lean**: Every bullet must directly alter how subagents construct the next walkthrough. Prune obsolete bullets to prevent sprawl.
