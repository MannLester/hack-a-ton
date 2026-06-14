# Organizer Active Edit and Cancellation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let organizers edit active listings while making participant-facing changes and cancellations visible.

**Architecture:** Extend the existing organizer workflow helpers with status rules and visibility-window rules. Add soft cancellation fields to Convex listings; public queries include cancelled listings only while their participant notice window is active.

**Tech Stack:** Next.js, React, TypeScript, Convex, Vitest.

---

### Task 1: Workflow Rules

**Files:**
- Modify: `lib/organizer-workflow.ts`
- Modify: `tests/organizer-workflow.test.ts`

- [ ] Add tests for active listing edit eligibility, cancellation reason validation, 3-day cancellation visibility, and updated listing labels.
- [ ] Implement helper functions.
- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.

### Task 2: Convex Listing Lifecycle

**Files:**
- Modify: `convex/schema.ts`
- Modify: `convex/organizers.ts`
- Modify: `convex/hackathons.ts`
- Modify: `components/data/adapters.ts`
- Modify: `components/data/convex-containers.tsx`
- Modify: `components/shared/types.ts`
- Modify: `lib/sample-data.ts`

- [ ] Add cancelled listing fields and update timestamp fields.
- [ ] Allow organizer updates for active published listings.
- [ ] Add cancellation mutation requiring an explanation.
- [ ] Keep cancelled listings visible to participants for 3 days.

### Task 3: Organizer Dashboard Actions

**Files:**
- Modify: `components/organizers/dashboard-view.tsx`

- [ ] Allow editing for active non-closing listings.
- [ ] Hide disabled archive/cancel actions instead of showing blocked cursor actions.
- [ ] Add cancel flow with required explanation textarea.

### Task 4: Participant Visibility

**Files:**
- Modify: `components/participants/hackathon-card.tsx`
- Modify: `app/hackathon/[id]/explore-view.tsx`
- Modify: `components/shared/primitives.tsx`
- Modify: `components/shared/config.ts`

- [ ] Show participant-facing updated marker on listing cards and detail pages.
- [ ] Show cancellation reason prominently on card/detail.
- [ ] Add cancelled status styling and filtering.

### Task 5: Verification and Reassessment

**Files:**
- No production file changes expected.

- [ ] Run `npm test -- tests/organizer-workflow.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run typecheck`.
- [ ] Reevaluate the active-edit and cancellation flow.
