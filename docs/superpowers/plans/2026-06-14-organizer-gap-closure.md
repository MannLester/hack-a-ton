# Organizer Gap Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining MVP organizer workflow gaps without adding hackathon-management scope.

**Architecture:** Keep organizer workflow logic in `lib/organizer-workflow.ts`, keep persistent listing ownership rules in Convex, and keep UI changes inside organizer-facing components. Autosave is local browser state, archive is a soft Convex status change, cover/logo is a URL field, and staff entry remains hidden behind staff capability.

**Tech Stack:** Next.js, React, TypeScript, Convex, Vitest.

---

### Task 1: Organizer Workflow Rules

**Files:**
- Modify: `lib/organizer-workflow.ts`
- Modify: `tests/organizer-workflow.test.ts`

- [ ] Add tests for date order validation, autosave key generation, cover URL preservation, and archive eligibility.
- [ ] Implement focused helper functions for those rules.
- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.

### Task 2: Cover URL and Archive Data Path

**Files:**
- Modify: `components/shared/types.ts`
- Modify: `components/data/adapters.ts`
- Modify: `components/data/convex-containers.tsx`
- Modify: `convex/schema.ts`
- Modify: `convex/organizers.ts`

- [ ] Add `coverImageUrl` to listing form, Convex schema, mutation inputs, and UI adapter types.
- [ ] Add organizer archive mutation that soft-archives owned listings.
- [ ] Hide archived listings from the active organizer dashboard.

### Task 3: Organizer Create/Edit UI

**Files:**
- Modify: `components/organizers/create-listing-view.tsx`

- [ ] Add cover/logo URL input and preview.
- [ ] Add local autosave for in-progress form values.
- [ ] Add date-order validation before submit.
- [ ] Keep manual save/submit confirmations.

### Task 4: Organizer Dashboard Actions

**Files:**
- Modify: `components/organizers/dashboard-view.tsx`

- [ ] Add Archive action for organizer-owned listings.
- [ ] Keep edit action only for Draft and Needs edits.
- [ ] Surface archive as a soft removal from active listings.

### Task 5: Staff Entry

**Files:**
- Modify: `components/app-shell.tsx`
- Modify: `components/shared/app-navigation.tsx`

- [ ] Add hidden staff route activation through `?staff=1`.
- [ ] Only allow staff view when signed in and staff capability is configured.
- [ ] Do not restore public Staff navigation.

### Task 6: Verification and Reassessment

**Files:**
- No production file changes expected.

- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run typecheck`.
- [ ] Reevaluate the organizer workflow gaps.
