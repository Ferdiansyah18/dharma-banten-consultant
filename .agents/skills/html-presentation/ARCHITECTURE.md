# Presentation Architecture & Engine

Specifications for modular shell architecture, full-bleed viewport CSS, and high-fidelity PDF print export.

---

## 1. Modular Multi-File Architecture

Every slide deck uses a modular multi-file structure separating presentation shell, styles, scripts, slide content, and print assembly.

### File Tree Layout

```
presentation/
  index.html              # Viewer shell: viewport, controls bar, CDN libs, loader
  css/styles.css          # Design tokens (:root) + layout and component styles
  js/slide-loader.js      # Slide loader: fragment fetcher, hash sync, dynamic re-rendering
  js/main.js              # Keyboard navigation, dropdown, and UI event controller
  slides/slide-01.html    # Zero-padded standalone slide fragments
  slides/slide-02.html
  ...
  export_pdf.html         # Dedicated print assembly root for PDF generation
  STORYLINE.md            # Narrative blueprint & slide content framework (Pass 3)
  DECK-DESIGN.md          # Visual design tokens & typography specification (Pass 4)
```

### Separation of Concerns
- **Storyline (`STORYLINE.md`)**: Defines topic, audience, takeaway, and slide-by-slide Action Headlines with presentation strategies.
- **Design Tokens (`DECK-DESIGN.md`)**: Defines color roles, typography, and theme styling tokens.
- **Shell (`index.html`)**: Mounts the presentation application, provides the slide viewport (`#slide-container`), and hosts navigation controls.
- **Styles (`css/styles.css`)**: Implements CSS custom properties from `DECK-DESIGN.md` and reusable layout classes.
- **Fragments (`slides/slide-NN.html`)**: Pure semantic HTML containing slide content only, implementing the strategy from `STORYLINE.md`. Zero inline styles or script tags.
- **Export Root (`export_pdf.html`)**: Assembles all fragments at runtime into a multi-page printable document.

---

## 2. Dynamic Token Construction & Full-Bleed Viewport

### Dynamic Token Construction
All values in `css/styles.css` derive directly from `DECK-DESIGN.md` (scaffolded via [ALIGNMENT.md](ALIGNMENT.md)). Avoid arbitrary hardcoded color hexes or ad-hoc margins across slide components.

### Full-Bleed Viewport Architecture (Zero Floating Cards)
To ensure slides render as a true full-bleed presentation on screen and in fullscreen:

1. **Root & Viewport Invariants**:
   ```css
   html, body {
       margin: 0;
       padding: 0;
       width: 100vw;
       height: 100vh;
       overflow: hidden;
       background: var(--bg-primary);
   }

   #slide-container, .slide {
       width: 100vw;
       height: 100vh;
       margin: 0;
       box-sizing: border-box;
       overflow: hidden;
       position: relative;
   }
   ```
2. **Prohibited Card Effects on Slide Frame**:
  - **No Outer Margins**: Never add `margin: 2rem auto` or `max-width: 1200px` to `#slide-container` or `.slide`.
  - **No Frame Shadows or Rounded Corners**: Never apply `border-radius` or `box-shadow` to the root `.slide` element.
3. **Internal Content Padding**: Content breathing room is achieved purely through internal slide padding (e.g. `padding: 4rem 6rem;` on `.slide` or `.slide-content`), ensuring the slide background always touches every display edge.

---

## 3. High-Fidelity PDF & Print Export Engine

### Dedicated Runtime Assembly (`export_pdf.html`)
To prevent stale duplicate markup, `export_pdf.html` fetches every slide fragment dynamically at export time:

1. Loads `css/styles.css` and CDN libraries (MathJax, Mermaid, Prism).
2. Displays a temporary `#loading-status` banner (hidden automatically in print media).
3. Sequentially fetches `slides/slide-01.html` through `slides/slide-NN.html`.
4. Wraps each fragment inside a `.print-slide-page` container appended to `#pdf-print-deck`.
5. Executes asynchronous typesetting and diagram rendering passes (`MathJax.typesetPromise`, `mermaid.run`, `Prism.highlightAll`).
6. **Mandatory graphics pause**: `await new Promise(resolve => setTimeout(resolve, 1000))` ensures web fonts, SVGs, and formulas settle before invoking `window.print()`.

### Exact CSS Print Rules

Embed these critical styles inside `export_pdf.html`:

```css
@page {
    size: 16in 9in; /* Match presentation aspect ratio */
    margin: 0;
}

html, body {
    width: 100%;
    height: auto;
    overflow: visible !important; /* Allows multi-page print flow */
    background: #ffffff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

#pdf-print-deck {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.print-slide-page {
    width: 16in;
    height: 9in;
    page-break-after: always;
    page-break-inside: avoid;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

@media print {
    .print-loading-notice {
        display: none !important;
    }
}
```

### Critical Print Guardrails
- **No Overflow Locking**: Never apply `overflow: hidden` or `height: 100vh` to `html`/`body` in print mode (locks output to page 1).
- **Physical Print Units**: Use explicit inch units (`16in 9in`) matching `@page` to prevent empty interstitial pages.
- **Exact Color Preservation**: Always declare `-webkit-print-color-adjust: exact !important` and `print-color-adjust: exact !important`.

---

## 4. Local Live Server & CORS Hygiene

Slide decks dynamically fetch HTML fragments (`slides/slide-NN.html`) via JavaScript `fetch()`. Browsers block local `fetch()` requests when opened via raw `file:///` protocols.

### Background Daemon Execution
The agent automatically starts a lightweight local HTTP server as a background daemon process in the presentation root using cascading auto-fallback:

1. **Primary Choice (Python)**:
   ```bash
   python -m http.server 8000
   ```
   *(or `python3 -m http.server 8000`)*

2. **Cascading Fallback (Node / NPX)**:
   If Python is not available in PATH, fallback automatically to zero-install Node tooling:
   ```bash
   npx serve -p 8000
   ```
   *(or `npx http-server -p 8000`)*

3. **Port & Persistence**: If port 8000 is occupied, increment to 8001 or 8080. Keep the server daemon alive throughout the conversation session so the user can interactively test and view slides at `http://localhost:8000`.
