# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gravel Maps is a cross-platform (Android + iOS) mapping app for discovering gravel and unpaved roads in Colorado. Built with Expo (React Native), MapLibre for maps, and a TypeScript data pipeline that processes public road data from USFS, BLM, and OpenStreetMap.

### Architecture

- **`app/`** — Expo React Native app with Expo Router (file-based routing) and MapLibre GL
- **`pipeline/`** — Node.js data pipeline (TypeScript) that fetches, normalizes, and tiles gravel road data

### Key Libraries

- `expo` ~55, `expo-router` ~55, `react-native` 0.83
- `@maplibre/maplibre-react-native` — Map rendering (BSD, free)
- `expo-location` — User location
- `zod` — Schema validation (pipeline)
- System tools: `tippecanoe`, `gdal` (ogr2ogr), `osmium-tool`

## Development

```bash
# Install all dependencies (from repo root)
npm install

# Start Expo dev server
cd app && npx expo start

# Run app tests
cd app && npm test

# Run data pipeline (all sources)
cd pipeline && npm run pipeline

# Run data pipeline (USFS only)
cd pipeline && npm run pipeline:usfs

# Type check
cd app && npm run lint
cd pipeline && npm run lint
```

### System Dependencies

```bash
brew install tippecanoe gdal osmium-tool
```

## Conventions

- TypeScript strict mode everywhere
- Expo Router file-based routing (`app/app/` directory)
- Common GravelRoad schema (defined in `pipeline/src/schema.ts`) used across all data sources
- 8px spacing system in UI (see UI/UX Design Principles below)
- Surface colors: orange (#D4782F) for gravel, brown (#8B6914) for dirt, tan (#C4883E) for unpaved, gray (#888888) for unknown

## Test-Driven Development (Canon TDD)

All code in this repo follows Kent Beck's Canon TDD workflow. Source: https://tidyfirst.substack.com/p/canon-tdd

### The Five Steps

1. **Write a test list** — Before touching code, list all expected behavioral variants for the change: cases where the new behavior should work, plus potential impacts on existing behavior.
2. **Write one test** — Convert exactly one item from the list into a concrete, automated test (setup, invocation, assertions). Make interface design decisions here; minimize implementation decisions.
3. **Make it pass** — Change the code so the new test and all previous tests pass. Fix the code genuinely — do not delete assertions or hard-code expected values.
4. **Refactor (optional)** — Now make implementation design decisions. Never mix refactoring with making a test pass; keep these phases separate.
5. **Repeat** — Return to step 2 until the test list is empty.

### Key Rules

- Write tests one at a time; do not speculatively write all tests upfront. Order matters and shapes the final design.
- Never refactor while a test is failing.
- Duplication in code is a hint, not an automatic trigger — don't abstract prematurely.

## UI/UX Design Principles

All UI work in this repo follows these principles. Optimize for intuitive use over clever design.

### Core Philosophy

- Clarity over cleverness, speed over ornamentation, consistency over novelty, usability over density.
- Primary objective: help users accomplish their goal with minimal cognitive load.

### Visual Hierarchy & Layout

- One clear primary action per screen/view; secondary actions visually de-emphasized.
- Use size, color, and spacing to indicate importance. Group related items.
- 8px base spacing system. Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Line length ~60–80 characters for readability.
- Use whitespace generously; chunk information.

### Typography

- Limit to 1–2 font families. Avoid excessive font weights.
- Clear heading hierarchy: H1 (page title) → H2 (section) → H3 (subsection) → body → caption.

### Color

- 1 primary color, 1–2 accent colors, neutral grayscale for most UI.
- Semantic colors: green = success, yellow = warning, red = error, blue = primary action.
- Meet WCAG AA contrast minimums.

### Components & Interactions

- Navigation: persistent location awareness, clear current state.
- Buttons: 1 primary per view, destructive actions require confirmation.
- Forms: labels always visible (not just placeholders), inline validation, sensible defaults.
- Modals: use sparingly, must be dismissible, never block critical workflows.

### States & Feedback

- Every action produces visible feedback.
- Design for all states: loading, empty, success, error.
- Empty states should explain what to do next and include a primary action.

### Accessibility

- Sufficient color contrast (WCAG AA).
- Keyboard navigable.
- Clear labels on all inputs.
- Touch targets ≥ 44px.

### Cognitive UX Laws

- **Hick's Law**: reduce choices presented at once.
- **Fitts's Law**: make primary actions large and easy to click/tap.
- **Jakob's Law**: follow common UI patterns users already know.
- **Von Restorff Effect**: important elements should visually stand out.

### Design Quality Checklist

Before finalizing any UI, verify:
- Is the primary user goal obvious?
- Is the primary action obvious?
- Is anything unnecessary on the screen?
- Can a first-time user succeed without instructions?
- Are errors prevented where possible?
- Is the interface accessible?

## Security

### No Exposed Secrets

- **Never commit API keys, tokens, passwords, or credentials** to this repo.
- Use environment variables or secure secret management for all sensitive values.
- `.gitignore` must exclude sensitive files (`.env`, credentials, editor configs).

### XSS Prevention

- **Never** use `eval()`, `document.write()`, or `new Function()` with dynamic input.
- **Never** insert user-controlled or external data into the DOM without sanitization.
- All dynamic HTML rendering must escape or sanitize data before insertion.

### General Principles

- All external URLs must use `https://`.
- Validate and sanitize at system boundaries (user input, external APIs).
- Before adding any third-party dependency, evaluate the security implications.

### Security Checklist for Code Changes

Before merging any change, verify:
- No API keys, tokens, or credentials added to any file.
- No new third-party dependencies introduced without justification.
- All user-facing dynamic content is properly escaped/sanitized.
- No `eval()`, `document.write()`, or `new Function()` usage.
- All external URLs use `https://`.
- `.gitignore` excludes sensitive files.
