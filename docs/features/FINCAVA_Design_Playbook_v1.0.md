
# FINCAVA Design Playbook
Version: 1.0

## Purpose
This playbook is the single source of truth for FINCAVA's visual identity and UI/UX decisions.
It is intentionally lightweight so it can be maintained by a solo founder.

---

# 1. Design Philosophy

FINCAVA should feel:

- Premium
- Authentic
- Human
- Editorial
- Trustworthy
- Calm
- Colombian

Every screen should reinforce confidence rather than impress with visual effects.

---

# 2. Visual Language

Colors
- Burgundy #7B1E3E
- Forest Green #163B2E
- Coffee Gold #C49A2A
- Warm Background #F8F6F2

Typography
- Headlines: Playfair Display
- UI & Body: Inter

Photography
- Authentic Colombian farms
- Producers
- Coffee cherries
- Coffee flowers
- Landscapes
- Processing

Avoid stock office photography.

---

# 3. Layout Principles

Marketing Pages
- Large editorial photography
- Storytelling
- Generous whitespace
- Premium typography

Application Pages
- Interaction first
- Cards
- Clean forms
- Clear actions
- Minimal distractions

Never build application pages like printed brochures.

---

# 4. Core Components

Buttons
- Primary Burgundy
- Secondary Outline

Cards
- Light border
- 12px radius
- Minimal shadow

Forms
- Dropdowns whenever possible
- Helper text
- Progressive disclosure
- "Other" option when appropriate

---

# 5. Standard Page Patterns

Home
Hero → Story → Services → Trust → CTA

Coffee Lot
Hero → Summary → Lot Details → Cup Profile → Verification → CTA

Request Pages
Summary → Form → AI Panel (optional) → Actions

Dashboard
Metrics → Activity → Requests → AI Workspace

AI Workspace
Prompt → Input → AI Assessment → Founder Decision

---

# 6. UX Principles

- Simplicity over features.
- Human always approves business decisions.
- AI assists but never commits.
- Every primary action should be obvious.
- Use whitespace generously.

---

# 7. Claude Code Working Rules

Before implementing ANY UI change:

1. Read this Design Playbook.
2. Read the relevant Feature Specification.
3. Review existing reusable components.
4. Reuse components before creating new ones.

## Mandatory Design Review

Before writing production code for any significant UI change:

1. Produce a visual mockup (wireframe, annotated layout, or high-fidelity concept).
2. Explain the proposed user flow.
3. Highlight reusable components.
4. Wait for founder approval.
5. Only after approval, implement the code.

No production UI changes should begin without design approval unless explicitly requested.

## During implementation

- Preserve existing business logic.
- Preserve APIs and database schema unless requested.
- Prefer refinement over redesign.
- Keep components reusable.
- Maintain responsive behaviour.
- Maintain accessibility.

---

# 8. Documentation Structure

docs/
├── roadmap.md
├── design-playbook.md
├── ai-roadmap.md
└── features/
    ├── homepage.md
    ├── ai-workspace.md
    ├── verification.md
    └── ...

AI prompts:
ai/
├── prompts/
└── context/

---

# Future Evolution

Phase I
- AI Workspace
- Prompt Runner
- Simple Automation

Phase II
- AI Automation Platform
- Shared context
- Prompt workflows
- Scheduling
- Execution history

Phase III
- AI Agent Platform
- Intelligent orchestration
- Conditional workflow selection
- Founder approval remains for critical actions

Do not implement Phase II or III features until operational usage justifies them.

---

# North Star

Build a modern B2B coffee platform that feels like a premium Colombian coffee catalogue while remaining simple enough for a single founder to understand, operate and evolve.
