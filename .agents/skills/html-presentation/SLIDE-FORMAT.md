# Slide Format & Markup Guidelines

Specifications for semantic HTML slide fragments, layout primitives, asset handling, and markup hygiene.

---

## 1. Slide Fragment Schema

Each slide is stored as an independent HTML file in `slides/slide-NN.html` (e.g. `slide-01.html`, `slide-02.html` with zero padding).

### Root Element Contract
Every slide fragment MUST be wrapped in a `<section>` tag with class `slide` and an `id` matching its slide number:

```html
<section class="slide" id="slide-1" data-slide-title="Introduction">
  <!-- Slide content -->
</section>
```

### Pure HTML Hygiene Invariants
- **Zero Outer Card Margins**: Never style the root `<section class="slide">` as a floating card widget (no outer margins, rounded corners on the slide canvas, or perimeter drop shadows). The slide element must remain a full-bleed 100vw/100vh canvas.
- **Zero Markdown Leaking**: Never leave unrendered Markdown syntax inside `.html` files. Convert all Markdown into standard HTML tags:
 - `**text**` → `<strong>text</strong>`
 - `*text*` → `<em>text</em>`
 - `` `code` `` → `<code>code</code>`
 - `[label](url)` → `<a href="url">label</a>`
 - `- item` → `<ul><li>item</li></ul>`
 - `# Heading` → `<h1>Heading</h1>`
- **Zero Inline Style Pollution**: Never write inline `style="..."` attributes or `<style>` blocks in slide fragments. All layout, spacing, colors, and typography styles must live in `css/styles.css`.
- **Speaker Notes**: Place optional speaker notes inside HTML comments at the bottom of the fragment:
  ```html
  <!-- Notes: Focus on quarterly performance and user growth metrics. -->
  ```

---

## 2. Standard Layout Patterns

Every layout primitive is structured to substantiate its **Action Headline** (the lead claim in `<header class="slide-header"><h2>...</h2></header>`), with the body element providing the concrete visual proof:

### Title / Hero Slide
```html
<section class="slide slide-hero" id="slide-1">
  <div class="hero-content">
    <span class="category-badge">Quarterly Review</span>
    <h1 class="slide-title">Autonomous Agent Architectures</h1>
    <p class="slide-subtitle">Design Patterns and Production Reliability</p>
    <div class="author-meta">
      <span class="author-name">Engineering Team</span>
      <span class="date">Q3 2026</span>
    </div>
  </div>
</section>
```

### Two-Column Split Layout
```html
<section class="slide" id="slide-2">
  <header class="slide-header">
    <h2>Execution Comparison</h2>
    <p class="section-lead">Inline pairing vs. delegated subagent execution</p>
  </header>
  <div class="split-layout">
    <div class="column">
      <h3>Inline Pairing</h3>
      <ul>
        <li>Interactive requirement discovery</li>
        <li>Low context overhead</li>
      </ul>
    </div>
    <div class="column">
      <h3>Subagent Execution</h3>
      <ul>
        <li>Isolated file generation</li>
        <li>Zero main-chat bloat</li>
      </ul>
    </div>
  </div>
</section>
```

### Card Grid / Metric Callouts
```html
<section class="slide" id="slide-3">
  <header class="slide-header">
    <h2>Key Performance Indicators</h2>
  </header>
  <div class="card-grid col-3">
    <div class="metric-card">
      <span class="metric-value">99.8%</span>
      <span class="metric-label">Pass Rate</span>
    </div>
    <div class="metric-card">
      <span class="metric-value">&lt; 150ms</span>
      <span class="metric-label">Render Settlement</span>
    </div>
    <div class="metric-card">
      <span class="metric-value">0</span>
      <span class="metric-label">Markdown Leaks</span>
    </div>
  </div>
</section>
```

### Code Snippet Layout
```html
<section class="slide" id="slide-4">
  <header class="slide-header">
    <h2>Controller Lifecycle</h2>
  </header>
  <div class="code-window">
    <div class="code-header">
      <span class="window-dot red"></span>
      <span class="window-dot yellow"></span>
      <span class="window-dot green"></span>
      <span class="code-filename">slide-loader.js</span>
    </div>
    <pre><code class="language-javascript">async function loadSlide(index) {
  const response = await fetch(`slides/slide-${pad(index)}.html`);
  const html = await response.text();
  container.innerHTML = html;
  reRenderDynamicElements(container);
}</code></pre>
  </div>
</section>
```

---

## 3. Asset & Media Handling

- **Images & Figures**: Wrap in `<figure class="slide-figure">` with `<img src="..." alt="..." />` and `<figcaption>`. Use `object-fit: contain` and max dimension constraints to prevent slide canvas overflow.
- **Formulas (MathJax)**: Enclose in standard TeX delimiters (`$$...$$` for block formulas, `$...$` or `\(...\)` for inline).
- **Diagrams (Mermaid)**: Use `<pre class="mermaid">` container with clean Mermaid syntax.
