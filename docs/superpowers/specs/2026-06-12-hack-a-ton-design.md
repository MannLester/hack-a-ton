# Hack-A-Ton Design Spec

Date: 2026-06-12
Status: Draft for user review

## Summary

Hack-A-Ton is a website and progressive web app for hackathon discovery in the Philippines. It bridges participants with organizer-posted hackathons without relying on social media algorithms. The product is not a hackathon management system; registration, judging, submissions, and event operations remain outside the platform.

The recommended product shape is a discovery-first marketplace. Participants discover hackathons, save events, signal interest, find teammates, and build a hackathon portfolio. Organizers post hackathon listings and receive lightweight visibility into participant interest. Engagement features such as badges, leaderboards, and social media templates support the main discovery loop instead of becoming the center of the product.

## Goals

- Help students and professionals in the Philippines discover relevant hackathons.
- Give organizers a focused place to post hackathons and reach interested participants.
- Support beginners who are starting their hackathon journey.
- Provide participant profiles that can become hackathon portfolios.
- Enable lightweight team formation through LFT matching.
- Make the app installable through PWA support so users do not need the Play Store.

## Non-Goals

- Hackathon registration management.
- Project submissions.
- Judging workflows.
- Sponsor management.
- Event-day operations.
- Full organizer CRM functionality.
- Native mobile apps for the first version.

## Product Approach

The chosen approach is a discovery-first marketplace.

Hack-A-Ton should center on hackathon discovery, with every listing connected to useful participant actions:

- Save the hackathon.
- Mark interest.
- Join LFT for that hackathon.
- Register externally through the organizer's link.
- Later add the hackathon to a portfolio.

This keeps the platform focused on the core bridge between participants and organizers while still making the engagement features useful.

## Tech Stack

- Next.js for the website and PWA frontend.
- Convex for database, server functions, queries, mutations, and realtime data.
- Clerk for authentication and user identity.
- Tailwind CSS for UI styling.
- PWA manifest, service worker, install support, offline fallback, and cached app shell.

Clerk owns authentication identity. Convex owns app-specific data such as profiles, listings, participation records, matching data, reports, badges, and moderation state. Convex records should store Clerk user IDs where identity linkage is needed.

## Roles

### Guest

- Browse public hackathon listings.
- View public participant profiles.
- Use the installable PWA shell.
- Must sign in to save, match, post, or build a portfolio.

### Participant

- Save hackathons.
- Mark interest in hackathons.
- Join LFT matching.
- Create and edit a hackathon portfolio.
- Add self-reported participation records.
- Earn badges.
- Generate social media cards.

### Organizer

- Create and edit hackathon listings.
- Submit first listing for admin review.
- Publish directly after becoming trusted.
- View lightweight listing interest metrics.
- Respond to moderation issues.

### Admin

- Approve first-time organizer listings.
- Review reports.
- Moderate listings and users.
- Manage tags, themes, and badge definitions.

A user may be both a participant and an organizer.

## Core Workflows

### Discover Hackathons

Participants use an Explore page with search, filters, and compact listing cards.

Filters:

- Format: online, onsite, hybrid.
- Location: city or region, with Philippines-first defaults.
- Date/status: upcoming, open registration, closing soon, ongoing, ended.
- Eligibility: student, professional, beginner-friendly, school-specific, open to all.
- Theme: AI, web, fintech, sustainability, civic tech, gaming, and similar categories.
- Team size.
- Prize availability.
- Free or paid.
- Organizer type.

Listing cards should show:

- Hackathon name.
- Organizer.
- Date.
- Location or format.
- Registration deadline.
- Eligibility.
- Team size.
- Tags or themes.
- Saved state.
- LFT activity signal.

The hackathon detail page should include:

- External registration call to action.
- Description.
- Schedule summary.
- Eligibility.
- Rules or requirements.
- Prizes.
- Organizer contact/source links.
- LFT entry point.

### Organizer Posting

Organizers create listings through a guided form. The platform uses a hybrid trust model:

- A first-time organizer's first listing requires admin approval.
- After approval, the organizer becomes trusted and can publish later listings directly.
- Listings remain reportable and removable by admins.

Listing statuses:

- Draft.
- Pending review.
- Published.
- Needs edits.
- Archived.
- Removed.

### LFT Team Matching

LFT means "looking for team" and is scoped to a specific hackathon in the MVP. This makes matching practical and prevents a vague social feed.

A participant can opt into LFT from a hackathon page and create a teammate card:

- Role or skills.
- Experience level.
- Preferred stack.
- Availability.
- Desired contribution.
- Contact preference.

Matching behavior:

- Participants swipe or pass on teammate cards.
- Mutual interest creates a match.
- The MVP creates a match record and reveals each matched participant's chosen contact preference. It does not include realtime chat.
- In-app chat is a later enhancement.

### Hackathon Portfolio

Participant profiles act as hackathon portfolios.

Profile sections:

- Name, photo, school or company, and location.
- Skills and interests.
- Hackathon history.
- Wins and placements.
- Project links.
- Team roles and contributions.
- Badges.
- Shareable public profile URL.

Participation records support verification status:

- Self-reported.
- Organizer verified.
- Admin verified.
- Rejected.

The MVP should allow self-reported achievements while clearly marking verification state.

## Engagement Features

Engagement features support the core loop:

1. A participant finds a hackathon.
2. The participant saves it or marks interest.
3. The participant finds teammates if needed.
4. The participant registers externally.
5. The participant adds the experience to their portfolio.
6. Portfolio and badges make the participant more credible for future teams.
7. Organizers get more participant attention and keep posting.

### Badges

Badges should be milestone-based:

- First hackathon joined.
- First team formed.
- First submission.
- First finalist placement.
- First win.
- Organizer-verified participation.
- Theme-specific badges such as AI, fintech, climate, or civic tech.
- Streak badges such as joining 3 hackathons in a year.

### Leaderboards

Leaderboards should be optional and soft. The product should avoid making "most wins" the primary ranking because that can discourage beginners.

Recommended boards:

- Most active participants this month.
- Most helpful teammates based on endorsements.
- Top verified wins.
- Rising hackers or beginners.
- Most active schools or communities.

Leaderboard values should be derived from activity and verification data instead of stored as permanent rankings.

### Flex My Hackathon

Flex My Hackathon generates shareable social media cards from real profile and hackathon data.

Initial templates:

- "I'm joining [Hackathon Name]".
- "Looking for teammates for [Hackathon Name]".
- "We built [Project Name] at [Hackathon Name]".
- Finalist, winner, or participant cards.
- Yearly hackathon stats.

MVP flow:

- Select template.
- Pick hackathon/profile data.
- Preview card.
- Download image or share link.

### Notifications

MVP should start with in-app notifications. Push notifications can come after the PWA foundation is stable.

Notification types:

- Registration closing soon.
- Saved hackathon updates.
- LFT match.
- Listing approval or update for organizers.
- Badge earned.

## Data Model

Core Convex collections:

- `users`
- `profiles`
- `organizerProfiles`
- `hackathons`
- `savedHackathons`
- `hackathonInterest`
- `lftCards`
- `lftSwipes`
- `lftMatches`
- `participations`
- `badges`
- `userBadges`
- `reports`
- `notifications`
- `socialTemplates`

Important data rules:

- Hackathon registration remains external through `registrationUrl`.
- A hackathon belongs to an organizer profile.
- A participation belongs to a participant profile and may reference a hackathon.
- LFT cards and matches are scoped to a hackathon.
- Verification status must be explicit on participation records.
- Moderation status must be explicit on hackathon listings.
- Server-side authorization in Convex must enforce all role-sensitive behavior.

## MVP Scope

### Must Have

- Next.js app with responsive mobile-first layout.
- PWA manifest and installable shell.
- Clerk authentication.
- Convex schema, queries, and mutations.
- Public Explore page.
- Hackathon detail page.
- Search and filters.
- Participant profile and portfolio.
- Organizer profile.
- Organizer listing creation and editing.
- First-listing review flow.
- Save hackathon.
- Mark interest.
- LFT opt-in and teammate cards.
- Swipe/pass matching.
- Basic match state.
- Self-reported participation records.
- Basic milestone badges.
- Simple admin moderation screens.

### Should Have

- Social card generation for joining, looking for teammates, and participated states.
- In-app notifications.
- Lightweight listing analytics for organizers.
- Public profile sharing.
- Report listing/user.

### Later

- Push notifications.
- In-app chat.
- Organizer-verified bulk participation uploads.
- Advanced leaderboard pages.
- Recommendation algorithm.
- Calendar integration.
- School/community pages.
- Sponsor pages.
- Event registration inside Hack-A-Ton.
- Judging, submissions, or event management.

## UX Direction

Hack-A-Ton should feel like a practical, credible student/professional tool rather than a playful social app.

Principles:

- Mobile-first.
- Fast scanning.
- Beginner-friendly.
- Trust-forward.
- Engagement without distraction.

Primary navigation:

- Explore.
- Team Up.
- Portfolio.
- Organizer.
- Admin, only when role permits.

On mobile, participant flows should use bottom tab navigation. Organizer and admin tools can use dashboard layouts or role-specific menus.

Visual direction:

- Clean, modern, high-contrast interface.
- Compact cards and tags for scanability.
- Badges should feel like credentials, not random collectibles.
- Philippines-aware through location defaults, copy, and community framing rather than heavy flag-themed styling.

Core MVP screens:

- Explore/listings.
- Hackathon detail.
- Auth onboarding.
- Participant profile editor.
- Public portfolio.
- LFT swipe view.
- LFT matches.
- Organizer dashboard.
- Listing editor.
- Admin review queue.
- Badge display.
- Social card generator, only if the should-have social sharing scope is included in the first build.

## Error Handling And Safety

- Unauthenticated users trying protected actions should be sent to sign in and returned to the original action afterward.
- Missing or removed hackathons should show a clear not-found or unavailable state.
- Expired listings should remain visible only when relevant and clearly labeled.
- Duplicate LFT swipes must be idempotent.
- Match creation must be idempotent and safe under concurrent swipes.
- Reported content should remain visible or hidden according to moderation rules, not client-only state.
- PWA caching must not expose stale auth-sensitive content after sign-out.
- External registration links should be visibly external.

## Testing Focus

Testing should cover:

- Auth-protected route behavior.
- Role-based access for participants, organizers, and admins.
- Hackathon listing lifecycle.
- Search and filter correctness.
- Save and interest flows.
- LFT swipe/match logic.
- Participation verification status behavior.
- Badge awarding rules.
- PWA manifest and service worker smoke checks.
- Core responsive layouts.

## Risks And Mitigations

### Empty Marketplace

Without listings, participants have no reason to return.

Mitigation: support admin-seeded listings, organizer submissions, and public published listings from day one.

### Low Trust Listings

Fake or outdated events damage credibility.

Mitigation: hybrid organizer approval, source links, report actions, and visible listing status.

### Beginner Discouragement

Competitive leaderboards can make the app feel elitist.

Mitigation: use soft leaderboards, rising/beginner categories, and portfolio progress indicators.

### LFT Spam Or Abuse

Team matching can create spam or low-quality contact.

Mitigation: require sign-in, support reporting, reveal contact only after match, and add rate limits where needed.

### PWA Expectations

Users may expect native-app behavior.

Mitigation: ship installable shell and offline fallback first, then add push notifications later.

### Scope Creep

The platform could drift into event management.

Mitigation: keep registration, judging, submissions, and operations out of MVP.

## Implementation Boundary

The next step is an implementation plan for a Next.js, Convex, Clerk, Tailwind, PWA application. The implementation should not include Git initialization or Git commits unless the user explicitly asks for Git later.
