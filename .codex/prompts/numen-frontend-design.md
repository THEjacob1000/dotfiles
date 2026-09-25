# /frontend-design

Design, redesign, critique, polish or animate a frontend interface using the maintained Impeccable, Taste Skill and Emil Kowalski design engineering skills. Use for landing pages, product UI, dashboards, components, visual style, typography, color, layout, motion and anti-slop review. Not for frontend work that leaves the look, motion and copy unchanged.

# Frontend design

Route the design task to one upstream skill, read its `SKILL.md`, and follow it. Load only the skill the task needs; don't read every source or blend rules from several of them.

The upstream skills live in live checkouts under `~/.local/share/numen/upstream` (`$NUMEN_UPSTREAM_DIR` when set), refreshed daily by `numen-upstream-skills`. If a path below is missing, run `numen-upstream-skills` once, then retry. Relative links inside an upstream skill resolve against that skill's own directory.

The user's brief, the project's own design system and its DESIGN.md or PRODUCT.md win over any upstream default. The upstream skills disagree with each other on fonts, motion and layout; when two apply, the one routed below owns the decision.

## Route

Paths are relative to the upstream directory.

| Task | Read |
| --- | --- |
| New surface, redesign or any named design pass: shape, critique, audit, polish, typeset, layout, colorize, bolder, quieter, distill, clarify, harden, adapt, onboard, optimize, delight, overdrive, extract, document, live, generate | `impeccable/.claude/skills/impeccable/SKILL.md` |
| Landing page or portfolio that must not look templated | `taste-skill/skills/taste-skill/SKILL.md` |
| Audit and upgrade an existing site without breaking it | `taste-skill/skills/redesign-skill/SKILL.md` |
| The brief names a soft, premium agency look | `taste-skill/skills/soft-skill/SKILL.md` |
| The brief names an editorial, restrained monochrome look | `taste-skill/skills/minimalist-skill/SKILL.md` |
| The brief names a brutalist, Swiss or terminal look | `taste-skill/skills/brutalist-skill/SKILL.md` |
| UI polish, component feel and the details that make software feel good | `emil/skills/emil-design-eng/SKILL.md` |
| Build one web animation | `emil/skills/animate/SKILL.md` |
| Build an animation in React Native or Expo | `emil/skills/animate-expo/SKILL.md` |
| Find places that should animate, or should not | `emil/skills/find-animation-opportunities/SKILL.md` |
| Audit a codebase's motion and write plans for other agents | `emil/skills/improve-animations/SKILL.md` |
| Name a motion the user describes vaguely | `emil/skills/animation-vocabulary/SKILL.md` |
| Gestures, springs, sheets, momentum, materials, Apple-style motion on the web | `emil/skills/apple-design/SKILL.md` |
| Make a web app feel native on a phone | `emil/skills/mobile-native/SKILL.md` |

These run only when the user asks for them by name, as their upstream frontmatter disables automatic invocation:

| Request | Read |
| --- | --- |
| Review animations strictly | `emil/skills/review-animations/SKILL.md` |
| Build several variants behind a live picker | `emil/skills/prototype/SKILL.md` |
| Pick a UI library for a task | `emil/skills/pick-ui-library/SKILL.md` |

## Local differences

- Impeccable's `<skill-base-dir>` is `impeccable/.claude/skills/impeccable` in the upstream directory. Its launcher downloads the engine binary it needs to `~/.impeccable` on first run.
- Upstream "go all out" and "complete deliverable" instructions don't widen scope. A small styling fix stays small, and repository conventions and code-golf still apply to the code.
- Verify on the rendered surface, desktop and mobile, not from the source alone.
