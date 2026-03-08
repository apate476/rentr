# Rentr — Project Context

This file persists project context across devices and sessions. Any Claude session on any machine can read this to pick up where we left off.

---

## What Rentr Is

A **renter intelligence platform** — anonymous reviews of rental properties across 9 dimensions (overall, value, landlord, noise, pests, safety, parking, pet-friendly, neighborhood). Think Glassdoor for apartments.

**Positioning:** "The renter intelligence layer for choosing where to live."

---

## Tech Stack

- **Next.js 16** App Router, React 19, TypeScript 5
- **Supabase** — Postgres, Auth (email + Google OAuth), Storage, Row-Level Security
- **Tailwind CSS 4** + **shadcn/ui** (new-york style, neutral base color)
- **Google Places API** — address autocomplete
- **Mapbox GL** — maps (configured, not yet integrated in UI)
- **Cloudflare Turnstile** — CAPTCHA on review submit
- **Upstash Redis** — rate limiting + AI usage tracking
- **Anthropic API** — Claude for AI features
- **Code style:** No semicolons, single quotes, 100 char width, Prettier + Tailwind plugin

---

## Key Architecture

### Route Groups

- `app/(auth)/` — login, signup, verify-email (public)
- `app/(main)/` — search, property detail, review wizard, new property (protected by middleware)
- `app/api/` — places autocomplete, AI routes
- `proxy.ts` — Next.js middleware (auth guard + session refresh)

### Database (7 tables, all with RLS)

- `profiles` — extends auth.users
- `properties` — unique addresses, aggregate scores auto-updated by triggers
- `reviews` — one per user per property, 9 scores (1-5), body 50-2000 chars
- `review_photos` — up to 5 per review
- `review_comments` — threaded comments
- `helpful_votes` — upvotes on reviews
- `saved_properties` — bookmarks (V2, email alerts planned)

---

## AI Features (implemented)

### 1. Review Summarizer

- `app/api/ai/summarize/route.ts` — POST, generates `{ praised, issues, trend }` JSON from reviews
- `components/ai-summary.tsx` — client component shown on property detail page above review feed
- Cached in Redis (`ai:summary:{property_id}`, 24h TTL)
- Cache invalidated on new review submit (`app/(main)/property/[id]/review/actions.ts`)
- Model: `claude-haiku-4-5-20251001`
- Free for all users

### 2. Floating Chat Widget (Q&A + NL Search)

- `app/api/ai/chat/route.ts` — POST, streaming, context-aware
- `components/ai-chat-widget.tsx` — fixed bottom-right bubble, globally in `(main)/layout.tsx`
- On `/property/[id]` → property-aware (fetches reviews as context)
- On other pages → general renter advisor
- Model: `claude-sonnet-4-6`
- **Freemium:** 3 chats/month free (tracked in Redis `ai:chat:{userId}:{YYYY-MM}`), unlimited for `is_premium = true`
- Requires auth (returns 401 if not logged in)

### 3. Writing Coach

- `app/api/ai/coach/route.ts` — POST, returns 1-2 follow-up question suggestions
- Shown in review wizard Step 3 as dismissible chips (violet-colored)
- Debounced 1.5s after user stops typing, fires when body >= 50 chars
- Model: `claude-haiku-4-5-20251001`
- Free for all users

### AI Infrastructure

- `lib/ai/client.ts` — singleton Anthropic client
- `lib/ai/prompts.ts` — `buildSummaryPrompt`, `buildChatSystemPrompt`, `buildWritingCoachPrompt`
- `lib/ai/usage.ts` — `checkUsage`, `incrementUsage` (Upstash Redis)
- `lib/constants.ts` — `AI_FREE_CHATS_PER_MONTH = 3`

---

## Property Detail Enhancements (done alongside AI)

- **Confidence level** — Low (<3 reviews), Medium (3-9), High (≥10) — shown under score
- **Would rent again %** — computed from reviews with non-null `would_rent_again`, shown when ≥3 responses

---

## Design Reference

See `/Users/arya/Desktop/design.md` for the full product design spec (10 pages, pages, components, IA).

Key design principles: trust-first, decision-support, mobile-first, structured lived experience.

---

## MVP Phase Status

### Phase 1 (done)

- Landing page, search autocomplete, search results, property detail, review feed, review wizard, auth, new property flow

### AI Layer (done)

- Review summarizer, chat widget (Q&A + NL search), writing coach, freemium gate

### Phase 2 (not started)

- Compare mode, saved properties UI, saved searches, confidence labels (✓ done), score distribution, issue-based review filters, would-rent-again % (✓ done)

### Phase 3 (not started)

- Neighborhood/city pages, alerts, trend analysis, landlord responses, richer verification

### V2 Monetization (planned)

- Stripe premium subscriptions (`STRIPE_SECRET_KEY` in `.env.example`)
- Email alerts for saved properties
- Premium = unlimited AI chat

---

## Env Vars Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
