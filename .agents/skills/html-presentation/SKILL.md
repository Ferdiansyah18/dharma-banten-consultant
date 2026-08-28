---
name: html-presentation
description: Build modular HTML presentation slide decks with responsive viewport fitting, custom keyboard navigation, and exact PDF/print export. Use when the user asks to create HTML slides, build a presentation deck, convert slides to HTML, generate slide presentations, or export HTML slides to PDF.
disable-model-invocation: false
---

# HTML Presentation

Build modular, responsive HTML presentation slide decks with dedicated print/PDF export capabilities.

---

## Core Posture

- **Discover Before Building**: Clarify visual identity, aspect ratio, typography, and structure before writing code.
- **Sifter & Mirror Alignment**: Meet unstructured human brain dumps with active listening, sifting raw thoughts into clear Action Headlines.
- **Full-Bleed Viewport Fitting**: The presentation viewport and slide canvas must fit 100% edge-to-edge with zero outer margins or gaps. Content breathing room belongs strictly inside the slide padding.
- **Modular Multi-File Architecture**: Isolate slides into clean HTML fragments; orchestrate viewer state in a central shell.
- **Pure Presentation Hygiene**: Enforce strict semantic HTML without inline styles or leaked Markdown syntax.

---

## Invocation Models

- **User-Invoked (`/html-presentation`)**: Pair interactively with the user to discover deck goals, audience, tone, palette, and slide outline.
- **Agent-Invoked**: When given an existing presentation outline or specification, proceed directly to Gate 1 artifact scaffolding.

---

## Deterministic Phase Gates

### Gate 1: Alignment & Design (4-Pass Funnel Session)
- Execute the progressive funnel alignment session per [ALIGNMENT.md](ALIGNMENT.md):
 - **Passes are Stage Gates**: Spend as many conversational turns as needed exploring within each pass; advance only when that stage is mutually agreed upon.
 - **Pass 1 (Open Brain Dump)**: Wide-open invitation for raw thoughts, topic, audience, and ideas with zero interrogation pressure.
 - **Pass 2 (Sift & Clarify)**: Mirror extracted core message and clarify missing format/budget parameters.
 - **Pass 3 (Storyline Lock-In)**: Propose synthesized Action Headlines sequence and presentation strategy ("how to present this content"), locking `STORYLINE.md`.
 - **Pass 4 (Visual Styling & Theme)**: Lock visual mood, color palette tokens, and typography, locking `DECK-DESIGN.md`.
- Scaffold `STORYLINE.md` and `DECK-DESIGN.md` in the presentation root as the dual sources of truth before building.
- Consult [ARCHITECTURE.md](ARCHITECTURE.md) for shell architecture and full-bleed viewport tokens.

### Gate 2: Delegated Deck Generation
- Dispatch a clean-head subagent to generate all project files on disk to prevent chat bloat:
 - Presentation shell (`index.html`) and PDF print assembler (`export_pdf.html`) per [ARCHITECTURE.md](ARCHITECTURE.md).
 - Central stylesheet (`css/styles.css`) implementing tokens from `DECK-DESIGN.md`.
 - Interactive loader and controller scripts (`js/slide-loader.js`, `js/main.js`) per [SCRIPTS.md](SCRIPTS.md).
 - Slide fragments (`slides/slide-01.html` ... `slides/slide-NN.html`) implementing the presentation strategy from `STORYLINE.md` matching schemas in [SLIDE-FORMAT.md](SLIDE-FORMAT.md).

### Gate 3: Verification, Live Server & Delivery
- **Verification**: Verify slide fragment count matches `totalSlides`, check hash navigation, and inspect slide markup for pure HTML hygiene.
- **Auto-Launch Local Live Server**:
  - Automatically launch a lightweight local HTTP server in the presentation directory as a background daemon process using cascading auto-fallback (e.g. `python -m http.server 8000` / `python3 -m http.server 8000`, falling back to `npx serve -p 8000` / `npx http-server -p 8000`).
  - Keep the server alive in the background throughout the session so dynamic slide fragment `fetch()` calls work seamlessly without browser CORS errors.
- **Deliver Live Link & Yield Turn**:
  - Output the clickable link `👉 Open Presentation: http://localhost:8000` (or the active port) along with the 2-sentence summary, then yield the turn.
- Verify `export_pdf.html` contains the 1000ms rendering settlement pause and exact print color CSS.

### Gate 4: Iterative Revision & Narrative Surgery (Conditional - User-Triggered Only)
*This gate is strictly event-driven and ONLY executes if the user requests edits, slide additions/cuts, or narrative pivots after reviewing the deck. If no revision is requested, the run ends at Gate 3.*

Accommodate non-linear human iteration across 4 distinct revision depths:
- **Micro Polish**: Direct text wording, typo fixes, or minor CSS tweaks in `slides/slide-NN.html` or `css/styles.css`.
- **Slide-Level Claim & Content Shifts**: Changing a single slide's narrative assertion (Action Headline), data points, or presentation strategy (e.g., swapping code for a diagram):
 - Update that slide's row in `STORYLINE.md`.
 - Rewrite `slides/slide-NN.html` to substantiate the new claim.
- **Storyline Narrative Surgery (Adding / Cutting Arguments)**: Inserting or removing entire narrative points or sections:
 - Update the Action Headlines sequence in `STORYLINE.md` (inserting/deleting rows).
 - Generate new or remove obsolete slide fragments.
 - Re-index sequential filenames (`slide-01.html` ... `slide-NN.html`) and update `totalSlides` in `slide-loader.js`.
- **Macro Narrative Pivot**: Overhauling the core thesis / Big Idea:
 - Re-enter Gate 1 per [ALIGNMENT.md](ALIGNMENT.md) to re-synthesize the 1-Sentence Big Idea and draft a new `STORYLINE.md`.
 - Re-dispatch subagent to regenerate all slide fragments in one clean pass.

---

## Failure Modes

- **Raw File URL Drift**: Providing a raw `file:///` link instead of automatically launching a background live server, causing browser CORS errors when loading slide fragments.
- **Rigid Interrogation Drift**: Forcing the user to answer formulaic questions instead of sifting their raw, unstructured thoughts.
- **Question Dump Bloat**: Dumping all alignment questions at once in a massive wall of text instead of conversational, round-by-round turns.
- **Unground Deck Generation**: Generating slide files before locking in `STORYLINE.md` and `DECK-DESIGN.md`.
- **Stale Index Regressions**: Inserting or deleting slide fragments without updating `totalSlides` or re-numbering subsequent slide files.
- **Chat Bloat**: Emitting dozens of slide HTML fragments in the main conversation instead of delegating file generation to a subagent.
- **Floating Card Slide Drift**: Adding outer margins, rounded borders, or drop shadows to the slide container so slides look like floating cards in a gray void instead of a true full-bleed presentation.
- **Preset Fixation**: Imposing arbitrary palettes or fonts without grounding them in user discovery and `DECK-DESIGN.md`.
- **Markdown Leaking**: Leaving unparsed Markdown syntax (`**bold**`, `` `code` ``, `- list`) inside slide HTML fragments.
- **Inline Style Pollution**: Adding inline `style="..."` attributes or `<style>` blocks into slide fragments instead of `css/styles.css`.
- **Premature Print Export**: Triggering `window.print()` before fragments are fetched or before dynamic rendering (MathJax/Mermaid) settles.

---

## Disclosed References

- [ALIGNMENT.md](ALIGNMENT.md): 4-pass funnel grilling protocol, storyline blueprints, and output schemas.
- [ARCHITECTURE.md](ARCHITECTURE.md): Multi-file shell architecture, full-bleed viewport CSS, and PDF export engine.
- [SLIDE-FORMAT.md](SLIDE-FORMAT.md): Semantic slide fragment schemas, layout patterns, and pure HTML hygiene.
- [EXTENSIONS.md](EXTENSIONS.md): Adaptable visual cookbook for Prism.js code blocks, Mermaid diagrams, MathJax formulas, and SVGs.
- [SCRIPTS.md](SCRIPTS.md): JS controller, slide loader lifecycle, and dynamic re-rendering engines.
