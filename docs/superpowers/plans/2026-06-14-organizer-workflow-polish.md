# Organizer Workflow Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the organizer listing workflow so organizers can create, save, preview, submit, and revise quality listings with less confusion.

**Architecture:** Keep the existing dashboard and wizard structure, but move listing workflow rules into small helper functions that are testable without rendering. The UI consumes those helpers for draft saving, completion checks, preview content, quality guidance, and reviewer feedback.

**Tech Stack:** Next.js, React, TypeScript, Convex, Vitest.

---

### Task 1: Organizer Workflow Helpers

**Files:**
- Create: `lib/organizer-workflow.ts`
- Test: `tests/organizer-workflow.test.ts`

- [ ] Add tests for partial draft detection, submit readiness, URL preservation mapping, quality checklist completion, and latest reviewer note selection.
- [ ] Implement helper functions with one responsibility each.
- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.

### Task 2: Listing Data Preservation

**Files:**
- Modify: `components/shared/types.ts`
- Modify: `components/data/adapters.ts`
- Modify: `components/data/convex-containers.tsx`
- Modify: `convex/organizers.ts`

- [ ] Add `registrationUrl` and `reviewNote` to organizer UI listing data.
- [ ] Return latest review notes with organizer dashboard listings.
- [ ] Preserve existing registration URL when editing a listing.

### Task 3: Organizer Wizard UX

**Files:**
- Modify: `components/organizers/create-listing-view.tsx`

- [ ] Allow partial draft saves when the listing has enough identifying information.
- [ ] Keep submit validation strict.
- [ ] Show confirmation panels after draft save and submit instead of immediately hiding the message.
- [ ] Add a participant-style preview before submit.
- [ ] Add a quality checklist beside the description.

### Task 4: Organizer Dashboard Navigation and Feedback

**Files:**
- Modify: `components/organizers/dashboard-view.tsx`
- Modify: `components/organizers/insights-view.tsx`

- [ ] Add visible organizer tabs for Listings, Create, and Insights.
- [ ] Show reviewer notes on listings that need edits.
- [ ] Make Insights reachable without relying on hidden state.

### Task 5: Verification and Reassessment

**Files:**
- No production file changes expected.

- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Reevaluate the organizer workflow against the original priority list.
