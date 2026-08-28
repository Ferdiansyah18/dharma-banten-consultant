# Presentation Scripts & Runtime Controller

Specifications for the presentation shell, slide loader engine, dynamic re-rendering passes, and keyboard controller.

---

## 1. Presentation Shell (`index.html`)

The viewer shell establishes the viewport container, navigation bar, and third-party rendering libraries.

### Core DOM Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation Deck</title>
  <link rel="stylesheet" href="css/styles.css">
  <!-- CDN Libraries (MathJax, Mermaid, Prism) -->
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" id="MathJax-script" async></script>
</head>
<body>
  <div id="presentation-app">
    <main class="slide-viewport">
      <div id="slide-container"></div>
    </main>

    <nav class="controls-bar">
      <button id="btn-prev" aria-label="Previous Slide">‹ Prev</button>
      <span id="slide-counter-display">1 / 1</span>
      <select id="slide-select-dropdown" aria-label="Jump to Slide"></select>
      <button id="btn-next" aria-label="Next Slide">Next ›</button>
      <button id="btn-fullscreen" aria-label="Toggle Fullscreen">⛶ Fullscreen</button>
      <button id="btn-export-pdf" aria-label="Export to PDF">🖨 Export PDF</button>
    </nav>
  </div>

  <script src="js/slide-loader.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

---

## 2. Slide Loader Engine (`js/slide-loader.js`)

Manages slide state, dynamic fetching, hash synchronization, and rendering hooks.

### Contract Interface

```javascript
window.SlideLoader = {
  totalSlides: 1, // Updated to total slide count
  currentSlide: 1,

  async loadSlide(index) {
    if (index < 1 || index > this.totalSlides) return;
    this.currentSlide = index;

    const paddedIndex = String(index).padStart(2, '0');
    const container = document.getElementById('slide-container');

    try {
      const response = await fetch(`slides/slide-${paddedIndex}.html`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      container.innerHTML = await response.text();
    } catch (err) {
      container.innerHTML = `<div class="slide-error">Failed to load slide ${index}</div>`;
    }

    this.reRenderDynamic(container);
    this.updateControls();
    window.location.hash = `slide-${index}`;
  },

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.loadSlide(this.currentSlide + 1);
    }
  },

  prevSlide() {
    if (this.currentSlide > 1) {
      this.loadSlide(this.currentSlide - 1);
    }
  },

  updateControls() {
    const counter = document.getElementById('slide-counter-display');
    const dropdown = document.getElementById('slide-select-dropdown');
    if (counter) counter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
    if (dropdown) dropdown.value = this.currentSlide;
  },

  reRenderDynamic(container) {
    // Prism syntax highlighting
    if (window.Prism) {
      window.Prism.highlightAllUnder(container);
    }
    // Mermaid diagram rendering
    if (window.mermaid) {
      window.mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
    }
    // MathJax formula rendering
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([container]);
    }
  }
};
```

---

## 3. Keyboard & Event Controller (`js/main.js`)

Handles user input, hash initialization, and fullscreen toggles.

### Event Controller Implementation

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const loader = window.SlideLoader;
  const dropdown = document.getElementById('slide-select-dropdown');

  // Populate dropdown options
  if (dropdown) {
    dropdown.innerHTML = '';
    for (let i = 1; i <= loader.totalSlides; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Slide ${i}`;
      dropdown.appendChild(option);
    }
    dropdown.addEventListener('change', (e) => {
      loader.loadSlide(parseInt(e.target.value, 10));
    });
  }

  // Button listeners
  document.getElementById('btn-prev')?.addEventListener('click', () => loader.prevSlide());
  document.getElementById('btn-next')?.addEventListener('click', () => loader.nextSlide());
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    window.open('export_pdf.html', '_blank');
  });

  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        loader.nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        loader.prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        loader.loadSlide(1);
        break;
      case 'End':
        e.preventDefault();
        loader.loadSlide(loader.totalSlides);
        break;
      case 'f':
      case 'F':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
    }
  });

  // Read initial hash or default to slide 1
  const hashMatch = window.location.hash.match(/slide-(\d+)/);
  const initialSlide = hashMatch ? parseInt(hashMatch[1], 10) : 1;
  loader.loadSlide(initialSlide);
});
```
