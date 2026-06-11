# Hack-A-Ton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hack-A-Ton discovery-first marketplace as a Next.js PWA with Clerk auth, Convex data, hackathon listings, organizer posting, participant portfolios, LFT matching, badges, admin moderation, and basic tests.

**Architecture:** Use Next.js App Router for routes and UI, Convex for app data and authorization-enforced mutations, and Clerk for authentication. Build a working vertical slice first: auth sync, listings, organizer submission, admin approval, public discovery, and participant actions. Then add LFT, portfolios, engagement, PWA support, and verification.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Convex, Clerk, Vitest, Testing Library, Playwright, next-pwa or a custom service worker setup.

**Git Constraint:** Do not run `git init`, `git add`, `git commit`, or any other git command. Replace commit steps with local verification checkpoints.

---

## File Structure

Create or modify these top-level areas:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js and PWA configuration.
- `tailwind.config.ts`: Tailwind content paths and theme tokens.
- `postcss.config.mjs`: Tailwind PostCSS setup.
- `tsconfig.json`: TypeScript configuration.
- `app/layout.tsx`: root layout, Clerk provider, Convex provider, app shell.
- `app/page.tsx`: redirect or render Explore as the default page.
- `app/(public)/explore/page.tsx`: public hackathon discovery.
- `app/(public)/hackathons/[slug]/page.tsx`: public hackathon detail.
- `app/(public)/u/[handle]/page.tsx`: public portfolio.
- `app/(app)/team-up/page.tsx`: LFT swipe and match area.
- `app/(app)/portfolio/page.tsx`: participant profile editor and portfolio management.
- `app/(app)/organizer/page.tsx`: organizer dashboard.
- `app/(app)/organizer/hackathons/new/page.tsx`: listing creation.
- `app/(app)/organizer/hackathons/[id]/edit/page.tsx`: listing editing.
- `app/(app)/admin/page.tsx`: admin moderation queue.
- `app/api/clerk-webhook/route.ts`: Clerk user sync webhook.
- `components/app/*`: navigation, shell, role-aware layout.
- `components/hackathons/*`: cards, filters, forms, detail panels.
- `components/lft/*`: teammate cards, swipe controls, match list.
- `components/portfolio/*`: profile editor, participation editor, badge display.
- `components/admin/*`: review queue and moderation controls.
- `components/ui/*`: shared primitives such as buttons, inputs, badges, tabs, empty states.
- `convex/schema.ts`: Convex schema.
- `convex/auth.config.ts`: Clerk auth integration for Convex.
- `convex/users.ts`: user sync and role/profile helpers.
- `convex/hackathons.ts`: listing queries and mutations.
- `convex/lft.ts`: LFT cards, swipes, and matches.
- `convex/portfolios.ts`: profile and participation mutations.
- `convex/badges.ts`: badge definitions and awarding.
- `convex/reports.ts`: reports and moderation actions.
- `convex/notifications.ts`: in-app notifications.
- `lib/auth.ts`: client/server role helpers.
- `lib/constants.ts`: statuses, roles, tag options, filter options.
- `lib/validators.ts`: shared Zod validation schemas.
- `public/manifest.webmanifest`: PWA manifest.
- `public/icons/*`: generated or simple app icons.
- `tests/unit/*`: Vitest unit tests for pure logic and validators.
- `tests/e2e/*`: Playwright smoke tests.

## Task 1: Scaffold The App

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create the Next.js app files**

Run:

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"
```

Expected: Next.js project files are created in the current empty directory.

- [ ] **Step 2: Install runtime dependencies**

Run:

```bash
npm install convex @clerk/nextjs zod lucide-react clsx tailwind-merge date-fns
```

Expected: dependencies are added to `package.json`.

- [ ] **Step 3: Install test dependencies**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright @playwright/test
```

Expected: dev dependencies are added to `package.json`.

- [ ] **Step 4: Add baseline scripts**

Edit `package.json` so scripts include:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run lint
npm run build
```

Expected: lint and build complete successfully.

- [ ] **Step 6: Local checkpoint**

Record changed files with:

```bash
find . -maxdepth 2 -type f | sort | sed 's#^\./##'
```

Expected: app scaffold files are present. Do not run any git command.

## Task 2: Configure Clerk And Convex Providers

**Files:**
- Create: `convex/auth.config.ts`
- Create: `convex/schema.ts`
- Create: `convex/users.ts`
- Create: `app/api/clerk-webhook/route.ts`
- Create: `components/app/providers.tsx`
- Modify: `app/layout.tsx`
- Create: `.env.local.example`

- [ ] **Step 1: Initialize Convex**

Run:

```bash
npx convex dev --once
```

Expected: Convex files are initialized. If Convex prompts for project setup, choose a new development project.

- [ ] **Step 2: Add environment example**

Create `.env.local.example`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

- [ ] **Step 3: Configure Convex auth**

Create `convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

- [ ] **Step 4: Define initial schema**

Create `convex/schema.ts` with tables for `users`, `profiles`, `organizerProfiles`, `hackathons`, `savedHackathons`, `hackathonInterest`, `lftCards`, `lftSwipes`, `lftMatches`, `participations`, `badges`, `userBadges`, `reports`, `notifications`, and `socialTemplates`. Use explicit status unions for roles, moderation, verification, and listing lifecycle.

- [ ] **Step 5: Add user helpers**

Create `convex/users.ts` with:

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

export const upsertFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      roles: ["participant"],
      isTrustedOrganizer: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

- [ ] **Step 6: Add providers**

Create `components/app/providers.tsx` to wrap `ClerkProvider`, `ConvexProviderWithClerk`, and `ConvexReactClient`.

- [ ] **Step 7: Wire providers into layout**

Modify `app/layout.tsx` to import `Providers` and wrap `{children}`.

- [ ] **Step 8: Verify provider build**

Run:

```bash
npm run build
```

Expected: build succeeds or fails only because real environment variables are not configured. Environment failures must be documented in the task notes.

## Task 3: Add Shared Constants, Validators, And UI Primitives

**Files:**
- Create: `lib/constants.ts`
- Create: `lib/validators.ts`
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/select.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/empty-state.tsx`
- Create: `tests/unit/validators.test.ts`

- [ ] **Step 1: Write validation tests**

Create `tests/unit/validators.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hackathonFormSchema } from "@/lib/validators";

describe("hackathonFormSchema", () => {
  it("accepts a valid external-registration hackathon", () => {
    const parsed = hackathonFormSchema.parse({
      name: "PH Hack 2026",
      slug: "ph-hack-2026",
      description: "A national beginner-friendly hackathon.",
      format: "hybrid",
      location: "Metro Manila",
      startsAt: 1780272000000,
      endsAt: 1780444800000,
      registrationDeadline: 1779667200000,
      eligibility: ["student", "beginner-friendly"],
      themes: ["ai", "civic-tech"],
      minTeamSize: 2,
      maxTeamSize: 4,
      hasPrize: true,
      isFree: true,
      registrationUrl: "https://example.com/register",
    });

    expect(parsed.slug).toBe("ph-hack-2026");
  });

  it("rejects non-url registration links", () => {
    expect(() =>
      hackathonFormSchema.parse({
        name: "PH Hack 2026",
        slug: "ph-hack-2026",
        description: "A national beginner-friendly hackathon.",
        format: "online",
        location: "Online",
        startsAt: 1780272000000,
        endsAt: 1780444800000,
        registrationDeadline: 1779667200000,
        eligibility: ["student"],
        themes: ["ai"],
        minTeamSize: 1,
        maxTeamSize: 4,
        hasPrize: false,
        isFree: true,
        registrationUrl: "not-a-url",
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/unit/validators.test.ts
```

Expected: fail because `@/lib/validators` does not exist.

- [ ] **Step 3: Implement constants and validators**

Create `lib/constants.ts` with role, listing status, verification status, format, eligibility, and theme constants. Create `lib/validators.ts` with Zod schemas for hackathon forms, profile forms, LFT cards, and participation records.

- [ ] **Step 4: Implement UI primitives**

Create small, focused UI primitives with `className` support:

```ts
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
```

Use this helper in `button`, `input`, `select`, `badge`, and `empty-state`.

- [ ] **Step 5: Verify tests pass**

Run:

```bash
npm test -- tests/unit/validators.test.ts
```

Expected: all validator tests pass.

## Task 4: Build Hackathon Listing Data Layer

**Files:**
- Modify: `convex/hackathons.ts`
- Create: `tests/unit/hackathon-status.test.ts`
- Create: `lib/hackathon-status.ts`

- [ ] **Step 1: Write status tests**

Create tests for `getHackathonTimeStatus(now, registrationDeadline, startsAt, endsAt)` covering `openRegistration`, `closingSoon`, `ongoing`, and `ended`.

- [ ] **Step 2: Implement status helper**

Create `lib/hackathon-status.ts` with deterministic time-status logic. `closingSoon` means registration deadline is within 7 days and still in the future.

- [ ] **Step 3: Add Convex listing functions**

Create `convex/hackathons.ts` functions:

- `listPublished` query with filters.
- `getBySlug` query.
- `createDraft` mutation for organizers.
- `submitForReview` mutation.
- `publishTrustedListing` mutation for trusted organizers.
- `adminApprove` mutation.
- `adminNeedsEdits` mutation.
- `archive` mutation.
- `save` and `unsave` mutations.
- `markInterest` mutation.

All mutations must check authenticated identity and role/trust state on the server.

- [ ] **Step 4: Verify data layer compiles**

Run:

```bash
npx convex dev --once
npm test -- tests/unit/hackathon-status.test.ts
```

Expected: Convex codegen succeeds and status tests pass.

## Task 5: Build Public Explore And Detail Pages

**Files:**
- Create: `app/(public)/explore/page.tsx`
- Create: `app/(public)/hackathons/[slug]/page.tsx`
- Create: `components/hackathons/hackathon-card.tsx`
- Create: `components/hackathons/hackathon-filters.tsx`
- Create: `components/hackathons/hackathon-detail.tsx`
- Create: `components/hackathons/save-interest-actions.tsx`

- [ ] **Step 1: Create Explore page**

Implement a mobile-first list with search input, filter controls, empty state, and hackathon cards. Use Convex `listPublished`.

- [ ] **Step 2: Create listing cards**

Cards must show name, organizer, date, format/location, registration deadline, eligibility, team size, themes, saved state, and LFT signal.

- [ ] **Step 3: Create detail page**

The detail page must show external registration CTA, schedule summary, eligibility, rules/requirements, prizes, organizer contact/source links, and LFT entry point.

- [ ] **Step 4: Verify public routes**

Run:

```bash
npm run build
```

Expected: build succeeds with public routes compiled.

## Task 6: Build Organizer Posting Flow

**Files:**
- Create: `app/(app)/organizer/page.tsx`
- Create: `app/(app)/organizer/hackathons/new/page.tsx`
- Create: `app/(app)/organizer/hackathons/[id]/edit/page.tsx`
- Create: `components/hackathons/hackathon-form.tsx`
- Create: `components/organizer/listing-status-table.tsx`

- [ ] **Step 1: Create organizer dashboard**

Show the organizer's listings grouped by status: draft, pending review, published, needs edits, archived, removed.

- [ ] **Step 2: Create listing form**

Use `hackathonFormSchema` for client validation. Required fields: name, slug, description, format, location, dates, registration deadline, eligibility, themes, team size, prize flag, free/paid flag, and registration URL.

- [ ] **Step 3: Implement first-listing behavior**

If organizer is not trusted, submit listings as `pendingReview`. If trusted, allow direct publish.

- [ ] **Step 4: Verify organizer build**

Run:

```bash
npm run build
```

Expected: organizer pages compile and protected actions require authentication.

## Task 7: Build Admin Review And Reports

**Files:**
- Create: `app/(app)/admin/page.tsx`
- Create: `components/admin/review-queue.tsx`
- Create: `components/admin/report-queue.tsx`
- Modify: `convex/reports.ts`

- [ ] **Step 1: Add report mutations**

Implement report creation for listings and users with reason, details, reporter, target type, target ID, and status.

- [ ] **Step 2: Add admin review queue**

Show pending hackathon listings with approve and needs-edits actions.

- [ ] **Step 3: Enforce admin authorization**

All admin Convex mutations must check the current user has `admin` in `roles`.

- [ ] **Step 4: Verify admin flow compiles**

Run:

```bash
npm run build
```

Expected: admin pages compile. Non-admin users cannot call admin mutations.

## Task 8: Build Participant Portfolio

**Files:**
- Create: `app/(app)/portfolio/page.tsx`
- Create: `app/(public)/u/[handle]/page.tsx`
- Create: `components/portfolio/profile-editor.tsx`
- Create: `components/portfolio/participation-editor.tsx`
- Create: `components/portfolio/public-portfolio.tsx`
- Modify: `convex/portfolios.ts`

- [ ] **Step 1: Add portfolio mutations**

Implement profile upsert, participation create/update, participation delete, and public profile query.

- [ ] **Step 2: Create profile editor**

Fields: handle, display name, photo URL, school/company, location, bio, skills, interests, and public visibility.

- [ ] **Step 3: Create participation editor**

Fields: hackathon reference or custom hackathon name, role, contribution summary, project URL, placement, dates, and verification status defaulting to `selfReported`.

- [ ] **Step 4: Create public portfolio**

Show profile identity, skills, interests, hackathon history, wins/placements, project links, team contributions, badges, and verification labels.

- [ ] **Step 5: Verify portfolio routes**

Run:

```bash
npm run build
```

Expected: portfolio routes compile and protected mutations require authentication.

## Task 9: Build LFT Matching

**Files:**
- Create: `app/(app)/team-up/page.tsx`
- Create: `components/lft/lft-card-form.tsx`
- Create: `components/lft/swipe-deck.tsx`
- Create: `components/lft/match-list.tsx`
- Modify: `convex/lft.ts`
- Create: `tests/unit/lft-match.test.ts`
- Create: `lib/lft-match.ts`

- [ ] **Step 1: Write match logic tests**

Test that a match is created only when two participants both like each other for the same hackathon, duplicate swipes are idempotent, and users cannot match with themselves.

- [ ] **Step 2: Implement pure match helper**

Create `lib/lft-match.ts` with a pure `shouldCreateMatch` helper used by tests and mirrored in Convex mutation logic.

- [ ] **Step 3: Implement Convex LFT functions**

Create LFT card upsert, list candidates, swipe, list matches, and deactivate card functions. Scope all data by hackathon ID.

- [ ] **Step 4: Build LFT UI**

Create teammate card form, swipe deck, pass/like buttons, and match list. On match, reveal each participant's chosen contact preference.

- [ ] **Step 5: Verify LFT**

Run:

```bash
npm test -- tests/unit/lft-match.test.ts
npm run build
```

Expected: match tests pass and app builds.

## Task 10: Build Badges And Basic Engagement

**Files:**
- Modify: `convex/badges.ts`
- Modify: `convex/notifications.ts`
- Create: `components/portfolio/badge-display.tsx`
- Create: `tests/unit/badge-awards.test.ts`
- Create: `lib/badge-awards.ts`

- [ ] **Step 1: Write badge tests**

Test badge awarding for first participation, first team match, first win, and three participations in a year.

- [ ] **Step 2: Implement badge award helper**

Create deterministic badge award functions in `lib/badge-awards.ts`.

- [ ] **Step 3: Implement Convex badge functions**

Seed badge definitions, award badges idempotently, and list badges for a profile.

- [ ] **Step 4: Add in-app notifications**

Create notification insert/list/mark-read functions for listing approval, LFT match, and badge earned.

- [ ] **Step 5: Verify engagement tests**

Run:

```bash
npm test -- tests/unit/badge-awards.test.ts
npm run build
```

Expected: badge tests pass and app builds.

## Task 11: Add PWA Support

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Modify: `next.config.ts`
- Create: `app/offline/page.tsx`
- Create: `tests/e2e/pwa.spec.ts`

- [ ] **Step 1: Add manifest**

Create manifest with name `Hack-A-Ton`, short name `Hack-A-Ton`, display `standalone`, theme color, background color, start URL `/explore`, and app icons.

- [ ] **Step 2: Add offline page**

Create a simple offline fallback page explaining that saved app shell content may still be available and live data requires connection.

- [ ] **Step 3: Configure service worker**

Use `next-pwa` or a minimal service worker setup. Cache static assets and the app shell. Do not cache auth-sensitive Convex responses.

- [ ] **Step 4: Write PWA smoke test**

Create Playwright test that checks `/manifest.webmanifest` returns a valid manifest and `/explore` renders at mobile viewport.

- [ ] **Step 5: Verify PWA**

Run:

```bash
npm run build
npm run e2e -- tests/e2e/pwa.spec.ts
```

Expected: build succeeds and PWA smoke test passes.

## Task 12: Add Social Card Generator As Should-Have Scope

**Files:**
- Create: `components/social/social-card-generator.tsx`
- Create: `components/social/social-card-preview.tsx`
- Modify: `app/(app)/portfolio/page.tsx`
- Modify: `convex/socialTemplates.ts`

- [ ] **Step 1: Implement template data**

Support templates for joining, looking for teammates, participated, finalist, winner, and yearly stats.

- [ ] **Step 2: Build preview UI**

Allow selecting a template, selecting hackathon/profile data, previewing a square card, and downloading it as an image.

- [ ] **Step 3: Verify generator build**

Run:

```bash
npm run build
```

Expected: social card generator compiles. If image export requires browser-only APIs, isolate export code in a client component.

## Task 13: Add E2E Smoke Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/explore.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Configure Playwright**

Create `playwright.config.ts` with `webServer` running `npm run dev`, base URL `http://127.0.0.1:3000`, and projects for desktop Chrome and mobile Chrome.

- [ ] **Step 2: Write Explore smoke test**

Test that `/explore` loads, search input is visible, filter controls are visible, and either listing cards or an empty state renders.

- [ ] **Step 3: Write responsive smoke test**

Test `/explore`, a hackathon detail page with seeded data, and `/u/demo` at mobile viewport. Assert no critical navigation is hidden.

- [ ] **Step 4: Run E2E tests**

Run:

```bash
npm run e2e
```

Expected: Playwright tests pass locally.

## Task 14: Final Verification

**Files:**
- Modify only files needed to fix verification failures.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 2: Run unit tests**

Run:

```bash
npm test
```

Expected: all unit tests pass.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: production build succeeds.

- [ ] **Step 4: Run E2E smoke tests**

Run:

```bash
npm run e2e
```

Expected: E2E smoke tests pass.

- [ ] **Step 5: Start local dev server**

Run:

```bash
npm run dev
```

Expected: app is available at `http://localhost:3000`. Keep the server running for user review if requested.

- [ ] **Step 6: Local checkpoint**

Run:

```bash
find . -maxdepth 3 -type f | sort | sed 's#^\./##' > docs/superpowers/plans/2026-06-12-hack-a-ton-file-list.txt
```

Expected: file list is written for local review. Do not run git.

## Self-Review Notes

- Spec coverage: the plan covers discovery, organizer posting, hybrid approval, participant portfolios, LFT matching, badges, notifications, reporting, admin moderation, PWA support, and tests.
- Explicitly out of scope: internal registration, judging, submissions, native mobile apps, in-app chat, advanced recommendation algorithms, and full event management.
- Git handling: the plan replaces commit steps with local checkpoints because the user explicitly prohibited git initialization and git usage.
- Remaining external setup: real Clerk and Convex credentials are required before a fully live authenticated app can run against hosted services.
