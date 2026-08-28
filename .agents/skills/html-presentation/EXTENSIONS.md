# Visual Extensions & Library Integration Guide

Reference guide and customizable cookbook for integrating dynamic rendering libraries: code syntax highlighters, diagram engines, math typesetting, and data graphics.

---

> [!NOTE]
> **Adaptable Reference Cookbook (Not a Rigid Prescription)**
> The snippets and components in this guide are illustrative starting points. Always adapt colors, typography, layout dimensions, and visual styling to match the user's specific project preferences and `DECK-DESIGN.md`.
>
> The only fixed technical invariants are:
> 1. Ensure required CDN libraries are included in `index.html` and `export_pdf.html`.
> 2. Ensure `reRenderDynamic(container)` in `slide-loader.js` triggers library rendering when new fragments load.
> 3. Maintain clean semantic HTML without leaked markdown.

---

## 1. Code Syntax Highlighting (Prism.js)

### CDN Setup in `index.html` & `export_pdf.html`
Place in `<head>`:
```html
<!-- Core & Theme (choose or customize theme) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>

<!-- Language Components (load needed languages based on project) -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>
```

### Customizable HTML Pattern
```html
<div class="code-window">
  <div class="code-header">
    <span class="window-dot red"></span>
    <span class="window-dot yellow"></span>
    <span class="window-dot green"></span>
    <span class="code-filename">orchestrator.ts</span>
  </div>
  <pre><code class="language-typescript">export async function dispatchWorker(task: TaskSpec): Promise<Receipt> {
  const sandbox = await Workspace.createIsolated(task.id);
  const result = await sandbox.execute(task.prompt);
  return result.generateReceipt();
}</code></pre>
</div>
```

---

## 2. Diagrams & Flowcharts (Mermaid.js)

### CDN Setup & Initialization
Place in `<head>` or before `</body>`. Customize `themeVariables` to derive from `DECK-DESIGN.md`:
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark', // or 'base' / 'neutral' matching deck tokens
    themeVariables: {
      darkMode: true,
      background: '#161f30',
      primaryColor: '#38bdf8',
      primaryTextColor: '#f8fafc',
      lineColor: '#64748b'
    }
  });
</script>
```

### Customizable HTML Pattern
Use a clean `<pre class="mermaid">` container. **Guardrail**: Never put unescaped raw HTML tags inside Mermaid diagram text.
```html
<div class="diagram-container">
  <pre class="mermaid">
    graph TD
      A[Parent Chat Context] -->|Spawn Task| B[Isolated Subagent Sandbox]
      B -->|File I/O & Tests| C[(Local Workspace)]
      B -->|Clean 2-Sentence Receipt| A
  </pre>
</div>
```

---

## 3. Mathematical Formulas (MathJax)

### CDN Setup in `<head>`
```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    svg: { fontCache: 'global' }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" id="MathJax-script" async></script>
```

### Customizable HTML Pattern
```html
<div class="formula-card">
  <p class="formula-lead">Context Compression Ratio:</p>
  <div class="formula-display">
    $$\text{Ratio} = 1 - \frac{\text{Receipt Tokens}}{\text{Raw File I/O Tokens}} = 1 - \frac{150}{4500} \approx 96.6\%$$
  </div>
</div>
```

---

## 4. Data Charts & Metrics (Responsive SVG / Chart.js)

### Lightweight SVG Metric Chart (Zero External Dependencies)
Use inline SVG with `viewBox` for crisp scaling at any display resolution. Customize dimensions and colors using CSS variables:
```html
<div class="chart-container">
  <svg viewBox="0 0 400 200" class="bar-chart-svg">
    <!-- Bar 1 -->
    <rect x="50" y="40" width="80" height="140" fill="var(--accent-color)" rx="4" />
    <text x="90" y="30" text-anchor="middle" fill="var(--text-primary)" font-size="14">Monolithic (100%)</text>
    
    <!-- Bar 2 -->
    <rect x="230" y="152" width="80" height="28" fill="var(--accent-positive, #10b981)" rx="4" />
    <text x="270" y="142" text-anchor="middle" fill="var(--text-primary)" font-size="14">Subagents (20%)</text>
  </svg>
</div>
```

---

## 5. Dynamic Re-Rendering Lifecycle Contracts

When `slide-loader.js` fetches a new slide fragment into `#slide-container`, third-party libraries do not automatically re-scan the DOM. The `reRenderDynamic(container)` hook in `slide-loader.js` fires each active engine explicitly:

```javascript
reRenderDynamic(container) {
  // 1. Prism Code Highlighting
  if (window.Prism) {
    window.Prism.highlightAllUnder(container);
  }
  // 2. Mermaid Diagram Processing
  if (window.mermaid) {
    window.mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
  }
  // 3. MathJax Typesetting
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([container]);
  }
}
```
