---
phase: 05-reading-experience
plan: 02
subsystem: ui
tags: [reading-view, client-component, viewport, sessionStorage, scroll-progress, dark-mode]

# Dependency graph
requires:
  - phase: 05-reading-experience
    plan: 01
    provides: CSS dark reading tokens, sessionStorage JSON contract, utility test coverage
provides:
  - ReadingView client component with fullscreen dark reading experience
  - Server component page.tsx with viewport themeColor export
  - Scroll progress indicator, empty state, error state
affects: [06-story-quality-tuning]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-client-split, sessionStorage-hydration, scroll-progress-tracking, inline-keyframes]

# Key files
key-files:
  created:
    - src/components/reading-view.tsx
  modified:
    - src/app/story/page.tsx

# Decisions
decisions:
  - Utility functions (assembleTitle) defined inline in component rather than extracted to shared module -- sufficient for single consumer
  - Inline style for scroll progress bar (width, backgroundColor, opacity) since Tailwind cannot express dynamic percentage widths
  - Fade-in animation via inline <style> block following loading-overlay.tsx pattern (Tailwind v4 limitation)
  - Gold accent color (--color-secondary-container) for scroll progress bar instead of muted reading tone (visual feedback from checkpoint)
  - Removed redundant back-to-home link per visual checkpoint feedback

# Metrics
metrics:
  duration_minutes: 3
  completed: "2026-03-25"
---

# Phase 05 Plan 02: Reading Experience Component Summary

ReadingView client component with fullscreen dark reading mode, scroll progress bar (gold accent), and server-side viewport themeColor export.

## What Was Built

### ReadingView Component (`src/components/reading-view.tsx`)
- Fullscreen dark reading experience: deep warm navy (#1a1a2e) background, warm off-white (#e8e0d0) serif text at 20px
- Story title rendered as "{Name}'s {Theme} Story" in muted tone
- Story body split on double newlines into semantic `<p>` elements with optimizeLegibility rendering
- Scroll progress bar: 3px fixed bar at top, gold accent color (#fcd400), tracks reading position 0-100%
- End-of-story "NEW STORY" gold pill button linking to /
- Empty state: "No story yet" with "CREATE A STORY" button when no sessionStorage data
- Error state: "Something went wrong" with "TRY AGAIN" button on JSON parse failure
- Fade-in animation on mount (600ms ease-in-out)
- Mobile-optimized: 24px padding, max-width 640px centered

### Page Wrapper (`src/app/story/page.tsx`)
- Server component (no 'use client') exporting `viewport` with `themeColor: '#1a1a2e'`
- Renders ReadingView as sole child

### Accessibility
- `<article role="article">` wrapping story content
- `<h1>` for story title
- `aria-hidden="true"` on decorative scroll progress bar
- `aria-label` on empty state CTA button
- Focus-visible rings on all interactive elements

## Deviations from Plan

### Visual Checkpoint Feedback (Applied in Task 2)

**1. [Checkpoint Feedback] Gold scroll progress bar**
- **Issue:** Scroll progress bar used muted reading tone at 0.4 opacity -- too subtle to notice
- **Fix:** Changed to `var(--color-secondary-container)` (gold #fcd400) at full opacity
- **Commit:** 943a75e

**2. [Checkpoint Feedback] Removed redundant home link**
- **Issue:** Back-to-home link duplicated the "NEW STORY" button navigation
- **Fix:** Removed the `<a>` element, simplified wrapper from flex-col to flex justify-center
- **Commit:** 943a75e

## Known Stubs

None -- all data flows are wired (sessionStorage read, scroll tracking, navigation).

## Verification

- All 89 tests pass (`npx vitest run`)
- Component exports ReadingView correctly
- Page exports viewport with themeColor
- All 3 states render (story loaded, empty, error)

## Commits

| Hash | Message |
|------|---------|
| f79dbc3 | feat(05-02): create ReadingView component and update story page |
| 943a75e | fix(05-02): gold scroll indicator, remove redundant home link |

## Self-Check: PASSED
