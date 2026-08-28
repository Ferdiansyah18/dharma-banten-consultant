# MODULE Format (HTML Walkthrough Reports)

Specification for structuring and styling standalone walkthrough HTML documents compiled by `/comprehend`.

---

## Core Mental Model: Cold-Start Orientation

The document is designed for the user returning six weeks later with zero active context. It must orient the big picture before explaining mechanical details.

---

## Document Layout

An HTML walkthrough report is a self-contained, clean visual guide:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Walkthrough: {Slug}</title>
  <link rel="stylesheet" href="../../assets/styles/journal.css">
</head>
<body>
  <header>
    <h1>{Title}</h1>
    <p class="subtitle">{1–2 sentence high-level orientation of what this code does and why}</p>
  </header>

  <main>
    <section class="overview">
      <h2>System Overview</h2>
      <!-- High-level architectural role, data inputs, and entry/exit points -->
    </section>

    <section class="mechanics">
      <h2>Mechanics & Execution</h2>
      <!-- Core logic, invariants, and step-by-step traces with semantic anchors (file paths, function/class names, interface types) -->
    </section>
  </main>
</body>
</html>
```

---

## Standards & Invariants

- **Semantic Code Anchoring**: Every code reference must cite stable semantic anchors (file path paired with named function, method, class, or type) rather than brittle line numbers.
- **Clean Semantic HTML**: Use standard semantic tags (`<header>`, `<main>`, `<section>`, `<aside>`, `<figure>`).
- **External Stylesheet**: Link `../../assets/styles/journal.css` without polluting the file with bloated inline `<style>` tags.
- **Print & Responsive Ready**: Ensure clean rendering across display sizes and clean export to PDF.
