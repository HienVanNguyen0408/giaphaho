<!--
  SYNC IMPACT REPORT
  ==================
  Version change: N/A → 1.0.0 (initial ratification — all placeholders filled for the first time)

  Modified principles: none (initial creation)

  Added sections:
    - Core Principles (I–V)
    - Technology Standards
    - Development Workflow
    - Governance

  Removed sections: none

  Templates reviewed:
    - .specify/templates/plan-template.md   ✅ no update needed
      Constitution Check section uses "[Gates determined based on constitution file]"
      which dynamically references this document — no hardcoded principle names to fix.
    - .specify/templates/spec-template.md   ✅ no update needed
      Requirements format (FR-xxx MUST/SHOULD) aligns with principle language here.
    - .specify/templates/tasks-template.md  ✅ no update needed
      TDD task ordering (tests MUST fail before implementation) matches Principle III.

  Deferred TODOs: none
-->

# Giaphaho Constitution

## Core Principles

### I. User-Centered Design

Every feature MUST be designed around a concrete user scenario before any
implementation begins. All UI MUST meet WCAG 2.1 AA accessibility standards
(contrast ratios, keyboard navigation, screen-reader labels). Designs MUST be
validated against real user flows captured in spec.md acceptance scenarios
before being considered complete. No feature ships without a passing
independent test that mirrors a real user journey.

### II. Component-First Architecture

All UI is built from reusable, composable components. Each component MUST
be self-contained: it owns its styles, its local state, and its tests.
Components MUST NOT depend on sibling components — only on their direct
children or shared primitives. A component is complete only when it is
independently renderable and testable in isolation.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory across the entire codebase. The sequence is strictly:

1. Write the test(s) — get user approval on the test cases.
2. Confirm all new tests FAIL (red).
3. Implement the minimum code to make tests pass (green).
4. Refactor under passing tests.

Skipping the red phase is a constitution violation. Tests are written
before implementation, not after. There are no exceptions.

### IV. Performance by Default

Core Web Vitals MUST pass at every release: LCP < 2.5 s, INP < 200 ms,
CLS < 0.1. No unoptimized images, render-blocking scripts, or layout-shift
sources MUST be introduced without explicit justification and a mitigation
plan. Performance regressions caught in CI MUST block merge.

### V. Simplicity & Maintainability

YAGNI: no code is written for hypothetical future requirements. Every added
abstraction MUST be justified by at least two concrete, existing call sites.
Code MUST be readable by a new contributor without additional verbal context.
When two approaches deliver equal value, the simpler one MUST be chosen.

## Technology Standards

The project uses the following canonical stack. Deviations require an
amendment to this section:

- **Language**: TypeScript (strict mode, no `any` without suppression comment)
- **Framework**: React (with Next.js for routing and SSR where needed)
- **Styling**: Tailwind CSS; no inline styles except for truly dynamic values
- **Testing**: Vitest + React Testing Library for unit/component tests;
  Playwright for end-to-end flows
- **Package manager**: npm (lock file committed; no yarn/pnpm without amendment)
- **Node version**: LTS (pinned in `.nvmrc` or `engines` field in package.json)

All dependencies MUST be evaluated for bundle size impact before adoption.
Third-party libraries that duplicate native browser capabilities MUST NOT be
added.

## Development Workflow

- **Branching**: one feature branch per spec (`###-feature-name` format); no
  long-lived topic branches.
- **Pull Requests**: every PR MUST reference its spec; MUST include a
  Constitution Check confirming all five principles are met; MUST have at
  least one reviewer approval before merge.
- **CI gates**: TypeScript compilation, lint (no warnings), and full test suite
  MUST pass; Lighthouse CI MUST report no Core Web Vitals regressions against
  the previous baseline.
- **Commit messages**: imperative mood, present tense; reference spec branch
  number where applicable (e.g., `feat(001-auth): add login form component`).
- **Documentation**: AGENTS.md and CLAUDE.md are the authoritative runtime
  guides; update them whenever a workflow decision changes.

## Governance

This constitution supersedes all other project practices. When a practice
documented elsewhere conflicts with a principle here, the constitution wins.

**Amendment procedure**:
1. Open a PR with the proposed change to this file.
2. State the version bump type (MAJOR/MINOR/PATCH) and rationale.
3. Obtain explicit approval from the project owner before merging.
4. Update `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` in the version line.
5. Run the Sync Impact Report checklist above and update affected templates.

**Versioning policy** (semantic):
- MAJOR: principle removal, redefinition, or backward-incompatible governance
  change.
- MINOR: new principle or section added; materially expanded guidance.
- PATCH: clarifications, wording fixes, typos.

**Compliance review**: every PR description MUST include a "Constitution
Check" section confirming the five core principles are satisfied. The
plan-template.md Constitution Check gate enforces this at planning time.

**Version**: 1.0.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
