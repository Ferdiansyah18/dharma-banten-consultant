# Alignment & Grilling Protocol

Interactive prep session guide for discovering presentation intent, sifting raw human thoughts, structuring the storyline, and locking in design decisions before generating slide code.

---

## Core Posture: The Sifter & Mirror Pattern

Human thinking is exploratory, unstructured, and messy. When the user blurts out raw thoughts, half-formed ideas, or rambling context:
- **Never force rigid forms**: Do not demand bullet points or interrogate the user with rigid checklists.
- **Sift the stream**: Actively parse the raw input to extract: (1) Core Topic & Setting, (2) Audience Profile & Baseline Mindset, (3) 1-Sentence Core Takeaway ("Big Idea"), and (4) Specific raw slide ideas or anecdotes.
- **Reflect a structured mirror**: Synthesize the extracted pieces into a clean draft sequence of **Action Headlines** and reflect it back to the user in plain English for confirmation.
- **Living Blueprint for Narrative Surgery**: `STORYLINE.md` is a living document. Whenever narrative points, arguments, or slide claims are added, cut, or shifted during iteration, update `STORYLINE.md` first to keep the storyline spine coherent.

---

## 1. The 4-Pass Funnel Alignment Dialogue

Structure the alignment as a progressive funnel - moving from wide, exploratory brain dumps down to precise narrative and visual lock-in.

### Stage Gate Pacing Invariants
- **Passes are Stage Gates, Not Turn Counters**: Spend as many conversational turns as needed exploring, bouncing ideas, and refining within the current pass. Never prematurely jump to the next pass on the next turn.
- **Advance Only on Mutual Agreement**: Progress to the next pass only when the active stage is genuinely understood, clarified, and confirmed by the user.
- **Single-Stage Focus**: Focus questions and discussions strictly on the active pass; never mix or dump questions from future stages into a single turn.

### Pass 1: The Open Brain Dump (Wide & Loose)
*Goal: Give the user full freedom to dump raw thoughts without interrogation pressure.*
- **Opening Invitation**: *"What do you have in mind for this presentation? Feel free to dump your raw thoughts, topic, target audience, rough ideas, or any specific points you want to cover."*
- **Sifting Task**: Actively parse the user's raw stream to extract tentative topic, audience angle, core thesis, and any specific slide anecdotes. Continue exploring and clarifying until the core topic and direction feel clear.

### Pass 2: Sift & Clarify (Target Missing Context)
*Goal: Mirror the extracted core back to the user and clarify only what's missing.*
- **Mirror**: Reflect back the synthesized topic and takeaway:
  *"Here is what I'm hearing: the core message is [1-sentence synthesis], aimed at [audience]."*
- **Targeted Clarification**: Ask only for missing parameters:
  *"To sharpen this: Is this presented live with you speaking (visual punch), or sent as a standalone read-ahead document? Roughly how many slides are we aiming for (e.g. 5-slide brief vs. 10-slide walkthrough)?"*

### Pass 3: Storyline & Slide Content Framework (Pure Narrative Lock)
*Goal: Validate and lock the slide-by-slide narrative and presentation strategy ("how to present this content") before discussing visuals.*
- **Action Headlines & Strategy Proposal**: Present the synthesized Slide Content Framework:
 - *Slide 1: [Hero Title & Subtitle]* -  How to present: **Hero Statement**
 - *Slide 2: [Action Headline: Core problem / context]* -  How to present: **Side-by-Side Comparison**
 - *Slide 3: [Action Headline: Core proposal / mechanism]* -  How to present: **Architecture Flow Diagram**
 - *Slide 4: [Action Headline: Proof / Architecture / Data]* -  How to present: **Metric Cards Grid**
 - *Slide 5: [Action Headline: Next steps / Call to action]* -  How to present: **Call to Action Callout**
- **Validation Prompt**: *"Does this headline flow and presentation approach capture what you want to communicate, or should we adjust any slide?"*
- **Scaffold**: Write the approved narrative blueprint into `STORYLINE.md` in the presentation root.

### Pass 4: Visual Styling & Theme (Look & Feel)
*Goal: Lock visual aesthetics once the storyline is settled.*
- **Prompt**: *"What visual tone and palette fits best for this deck? (e.g., Dark modern engineering with cyan accent, Clean editorial light with slate blue, or custom brand colors)?"*
- **Scaffold**: Write the approved design tokens into `DECK-DESIGN.md` in the presentation root.

---

## 2. The Blueprint Schemas

### Output 1: `STORYLINE.md` (Content & Presentation Strategy)
Scaffolded after Pass 3:

```markdown
# Deck Storyline & Slide Content Framework

## 1. Context & North Star
- **Topic & Setting**: [Presentation subject and context]
- **Target Audience**: [Audience profile and baseline mindset]
- **The 1-Sentence "Big Idea"**: [Governing takeaway with clear stakes]
- **Modality**: [Live Companion Keynote | Standalone Read-Ahead]
- **Slide Count**: [Total number of slides]

## 2. Slide Content Framework

| Slide | Action Headline (Core Claim) | How Should We Present This Content? | Key Supporting Points / Data |
| :--- | :--- | :--- | :--- |
| **01** | [Hero Title & Subtitle] | **Hero Statement** | [Author, date, category tag] |
| **02** | [Lead Assertion: Problem] | **Side-by-Side Comparison** | [Left: old reality vs. Right: new reality] |
| **03** | [Lead Assertion: Solution] | **Architecture Flow Diagram** | [Step 1 → Step 2 → Step 3] |
| **04** | [Lead Assertion: Proof] | **Metric Cards Grid** | [3 key stats / benchmarks] |
| **05** | [Lead Assertion: Action] | **Call to Action Callout** | [Immediate next steps] |
```

### Output 2: `DECK-DESIGN.md` (Visual System & Tokens)
Scaffolded after Pass 4:

```markdown
# Deck Design Specifications

## 1. Aesthetic Profile
- **Mood / Tone**: [e.g. Dark modern technical, Clean editorial light]
- **Aspect Ratio**: 16:9 (1920x1080 / 16in x 9in Full-Bleed)

## 2. Design Tokens
- `--bg-primary`: [Hex color]
- `--bg-surface`: [Hex color]
- `--text-primary`: [Hex color]
- `--text-muted`: [Hex color]
- `--accent-color`: [Hex color]
- `--border-color`: [Hex color]

## 3. Typography
- **Heading Font**: [Font family, weight]
- **Body Font**: [Font family, weight, line-height]
- **Code Font**: [Font family]
```
