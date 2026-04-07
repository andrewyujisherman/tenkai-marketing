# Tenkai Marketing — Audit Findings
Date: 2026-03-27

---

## AREA 1: Hardcoded Prices

### Issue 1.1 — layout.tsx: Schema markup has old prices
**File:** `src/app/layout.tsx` — Lines 27–28, 40, 46, 55
**Issue:** The JSON-LD structured data schema (`organizationSchema`) still references `lowPrice: '149'` and `highPrice: '499'`. The page metadata descriptions say "working 24/7 from $149/mo." in three places (description, openGraph description, twitter description).
**Fix:** Update `lowPrice` to `'0'`, `highPrice` to `'0'` (or remove the `offers` block entirely since plans are free). Update all three description strings to remove "from $149/mo." — replace with "Free during early access." or similar.

### Issue 1.2 — billing/status API: Hardcoded paid prices returned to settings page
**File:** `src/app/api/billing/status/route.ts` — Lines 9–11
**Issue:** `TIER_MAP` returns `price: 149`, `price: 299`, `price: 499` for the three tiers. This value is rendered directly in the Settings billing tab as `${status.price}/mo`. Real users on free/early-access plans will see a dollar amount shown in their account.
**Fix:** Set all prices to `0` in `TIER_MAP`, or derive price from the actual tier config in `src/lib/design-system.ts` (which already has `price: 0` for all tiers).

### Issue 1.3 — billing/status API: Fake demo card number leaks
**File:** `src/app/api/billing/status/route.ts` — Line 64
**Issue:** `payment_last4: demo ? '4242' : '••••'` — demo mode returns Stripe's test card number `4242`. Non-demo returns `'••••'` as a literal string, not a real last4 from the database.
**Fix:** For demo mode, use something like `'demo'` or just `'••••'` since there's no real card. For real users, pull `payment_last4` from Stripe or the database — returning `'••••'` as a hardcoded string is misleading.

---

## AREA 2: Demo/Mock Data Showing in Production

### Issue 2.1 — metrics/traffic: Hardcoded demo summary values
**File:** `src/app/api/metrics/traffic/route.ts` — Lines 24–27
**Issue:** `generateDemoTrafficData()` returns hardcoded static values: `'2,847'` sessions, `'1,923'` users, `'42.1%'` bounce rate, `'2m 34s'` avg duration. These are static for all demo users — they never change.
**Status:** These are intentional demo-mode values. However, note that the chart data IS randomized (line 18: `Math.random()`), creating an inconsistency where chart numbers don't match the summary stats. Not a blocker but creates a UX mismatch.

### Issue 2.2 — metrics/local: Hardcoded demo summary values
**File:** `src/app/api/metrics/local/route.ts` — Lines 13–17
**Issue:** Same pattern — static demo values: `'1,834'` profile views, `'4,521'` search appearances, `'234'` direction requests, `'89'` phone calls, `'4.7 (127)'` reviews. These are the same for every demo session.
**Status:** Intentional demo data but completely static — no randomization whatsoever, making the demo feel fake if the user revisits.

---

## AREA 3: Landing Page Stale/Wrong Text

### Issue 3.1 — ComparisonSection: Tenkai price row shows old range
**File:** `src/components/landing/ComparisonSection.tsx` — Line 18
**Issue:** The comparison table shows Tenkai price as `'$150–500/mo'`. Plans are now free during early access.
**Fix:** Change to `'Free (Early Access)'` or `'Free'`.

### Issue 3.2 — PricingSection: "14-day money-back guarantee" — contradicts free plans
**File:** `src/components/landing/PricingSection.tsx` — Lines 69 and 170
**Issue:** Both the section subheader and the bottom trust bar say "14-day money-back guarantee." Plans are currently $0/free, so a money-back guarantee is meaningless and potentially confusing.
- Line 69: `"Month-to-month. Cancel anytime. 14-day money-back guarantee."`
- Line 170: `"No contracts · Cancel anytime · 14-day money-back"`
**Fix:** Remove "14-day money-back guarantee" from both lines. Replace with "No credit card required" or just keep "No contracts · Cancel anytime."

---

## AREA 4: Email Templates
No Supabase email template files found in the codebase (these live in the Supabase dashboard). Cannot audit from the repo — **manual check required** in the Supabase dashboard under Authentication > Email Templates. Verify branding, URLs, and sender address match current product.

---

## AREA 5: Onboarding Step Components

### Issue 5.1 — step-meet-team.tsx: Tier names mismatched with display names
**File:** `src/components/onboarding/step-meet-team.tsx` — Lines 6–10
**Issue:** `tierAgents` map uses keys `'starter'`, `'growth'`, `'pro'` — which are the internal `name` values from `design-system.ts`. However, the tier display names shown to users are `'Visibility'`, `'Growth'`, and `'Done-For-You'`. If the tier value stored/passed is the display name, `tier.toLowerCase()` would be `'visibility'` or `'done-for-you'` and wouldn't match, falling through to `tierAgents.starter` (line 19). Need to verify what value is passed as `tier` prop.
**Fix:** Align the map keys with whatever string is actually passed — either use display names or ensure internal names are passed. If `'visibility'` is passed, add `visibility` as a key alias for `starter`, and `done_for_you` for `pro`.

### Issue 5.2 — step-meet-team.tsx: Agent count "included in your plan" shown for free plans
**File:** `src/components/onboarding/step-meet-team.tsx` — Line 51
**Issue:** Text says "X specialists included in your plan." With all plans free during early access, this is accurate but slightly odd — "in your plan" implies paid tier distinctions. Not broken, but consider "on your team" for free-period clarity.

### Issue 5.3 — step-complete.tsx: Step 3 says "Sakura starts writing within the week"
**File:** `src/components/onboarding/step-complete.tsx` — Line 35
**Issue:** This is hardcoded to use agent name "Sakura." If the user renamed Sakura during step-meet-team, the completion screen still shows "Sakura" instead of their custom name. The `customNames` data isn't passed to `StepComplete`.
**Fix:** Either pass custom agent names to `StepComplete` or use generic language ("Your content writer starts drafting within the week").

### Issue 5.4 — step-complete.tsx: Similarly hardcodes "Kenji" and "Haruki"
**File:** `src/components/onboarding/step-complete.tsx` — Lines 27, 31
**Issue:** Same as above — "Kenji runs your first technical SEO audit" and "Haruki delivers your keyword strategy" are hardcoded default names.
**Fix:** Same fix as 5.3 — pass custom names or use role-based generic language.

---

## AREA 6: Settings Page

### Issue 6.1 — Settings billing tab: Shows "$X/mo" for free users
**File:** `src/app/(portal)/settings/SettingsClient.tsx` — Line 294
**Issue:** Renders `${status.price}/mo` directly. Since `billing/status` API returns `149`, `299`, or `499` for the three tiers (Issue 1.2), real free-access users will see a wrong dollar amount.
**Fix:** Fix the API (Issue 1.2), then this display will automatically show `$0/mo` or handle the free case with "Free" label.

### Issue 6.2 — Settings: Support email is "rookbot.mini@gmail.com"
**File:** `src/app/(portal)/settings/SettingsClient.tsx` — Lines 328, 331, 668
**Issue:** Billing support and integration help emails are `rookbot.mini@gmail.com`. This is a personal/dev Gmail address, not a professional support address. Visible to every paying customer.
**Fix:** Replace with `support@alegius.com` (same address used in footer, terms, and privacy pages) for consistency.

### Issue 6.3 — Reports page: Upgrade link uses dev email
**File:** `src/app/(portal)/reports/ReportsClient.tsx` — Line 360
**Issue:** `href="mailto:rookbot.mini@gmail.com?subject=Upgrade%20to%20Pro"` — same personal Gmail used for upgrade requests.
**Fix:** Replace with `support@alegius.com` or a proper upgrade flow.

### Issue 6.4 — Settings: "Next billing" date shows for free users
**File:** `src/app/(portal)/settings/SettingsClient.tsx` — Line 297, `src/app/api/billing/status/route.ts` — Lines 56–57
**Issue:** API calculates `nextBilling = now + 30 days` for all users including demo/free. Settings shows "Next billing: [date]" and "Card ending in ••••" to free-tier early-access users who have no billing.
**Fix:** Either suppress billing info when price is 0, or show "No upcoming charges — free during early access."

---

## AREA 7: API Routes — Demo Mode Non-Demo Paths

All checked routes follow the correct pattern:
- Demo mode → return demo data
- Non-demo, no integration → return `{ connected: false }`
- Non-demo, integration active → fetch real data

Non-demo paths appear structurally correct. No routes found that unconditionally return demo data to real users. The primary concern (Issue 1.2) is the billing/status route returning old prices, not demo data leaking.

**One concern:** `src/app/api/metrics/local/route.ts` — Line 68: `if (demo) return NextResponse.json(generateDemoLocalData())` appears after a check that the integration IS active (lines 63–66 already handle the disconnected case). This second demo check at line 68 is redundant but harmless — it means demo always gets demo data even if the DEMO_CLIENT_ID happened to have a real integration record.

---

## AREA 8: Auth Pages

Auth pages (login, signup, forgot-password, set-password) are clean. No hardcoded prices, no stale text, no wrong links. The email placeholder `"you@company.com"` is standard UX copy — acceptable.

One minor note: Signup error copy (line 55) says "contact your admin to resend it" — this assumes an invite flow. If users self-sign-up directly, "contact your admin" is confusing. Low priority.

---

## AREA 9: Landing Page FAQ

### Issue 9.1 — FAQ: "14-day money-back guarantee" for free plans
**File:** `src/components/landing/FAQ.tsx` — Line 33
**Issue:** FAQ answer for "Can I cancel anytime?" says "We also offer a 14-day money-back guarantee if you're not satisfied." Plans are currently free — no money to return.
**Fix:** Remove the money-back sentence. Keep: "Yes — all plans are month-to-month with no contracts. Cancel from your dashboard at any time."

### FAQ pricing question is fine
**File:** `src/components/landing/FAQ.tsx` — Lines 12–14
The first FAQ ("How does Tenkai pricing work?") correctly says "All plans are currently free during our early access period. No credit card required." — this is accurate.

---

## AREA 10: Footer / Terms / Privacy

### Issue 10.1 — Terms of Service: Stale tier names
**File:** `src/app/(marketing)/terms/page.tsx` — Line 98
**Issue:** Terms say "three tiers: Starter, Growth, and Pro." The public display names are now "Visibility," "Growth," and "Done-For-You." (Internal code names are `Starter`, `Growth`, `Pro` — but users never see those.) Also states "All subscription fees are non-refundable" — contradicts the "14-day money-back guarantee" on the landing page/FAQ.
**Fix:** Update tier names to "Visibility, Growth, and Done-For-You." Reconcile the refund/guarantee language across Terms + landing page.

### Issue 10.2 — Terms of Service: Refund policy contradicts landing page guarantee
**File:** `src/app/(marketing)/terms/page.tsx` — Line 112
**Issue:** Terms say "All subscription fees are non-refundable." Landing page PricingSection and FAQ both promise a "14-day money-back guarantee." These directly contradict each other.
**Fix:** Either (a) add the guarantee to Terms, or (b) remove the "14-day money-back guarantee" from PricingSection.tsx lines 69/170 and FAQ.tsx line 33. Since plans are currently free, option (b) is cleaner.

### Issue 10.3 — Footer: No Privacy/Terms links in Company nav section
**File:** `src/components/landing/Footer.tsx` — Lines 9–20
**Issue:** Footer nav has "Product" and "Company" columns but Privacy Policy and Terms are only in the bottom bar. Minor UX — not a data issue.

### Footer copyright year is correct (2026). Contact email `support@alegius.com` in footer is consistent with terms/privacy.

---

## Summary Table

| # | File | Line(s) | Severity | Issue |
|---|------|---------|----------|-------|
| 1.1 | `src/app/layout.tsx` | 27-28, 40, 46, 55 | HIGH | Schema + meta descriptions show `$149/mo` and old prices |
| 1.2 | `src/app/api/billing/status/route.ts` | 9-11 | HIGH | TIER_MAP returns paid prices (149/299/499) to free users |
| 1.3 | `src/app/api/billing/status/route.ts` | 64 | MED | Demo returns Stripe test card `4242`; real users get `'••••'` literal |
| 3.1 | `src/components/landing/ComparisonSection.tsx` | 18 | HIGH | Price row shows `$150–500/mo` — should say Free |
| 3.2 | `src/components/landing/PricingSection.tsx` | 69, 170 | MED | "14-day money-back guarantee" on free plans makes no sense |
| 5.3/5.4 | `src/components/onboarding/step-complete.tsx` | 27, 31, 35 | MED | Hardcoded agent names (Kenji, Haruki, Sakura) ignore user renames |
| 5.1 | `src/components/onboarding/step-meet-team.tsx` | 6-10, 19 | MED | tierAgents map may not match actual tier values passed |
| 6.1 | `src/app/(portal)/settings/SettingsClient.tsx` | 294 | HIGH | Billing tab shows wrong dollar amount (depends on Issue 1.2 fix) |
| 6.2 | `src/app/(portal)/settings/SettingsClient.tsx` | 328, 331, 668 | HIGH | Dev Gmail `rookbot.mini@gmail.com` shown to all users for support |
| 6.3 | `src/app/(portal)/reports/ReportsClient.tsx` | 360 | HIGH | Dev Gmail in upgrade link |
| 6.4 | `src/app/(portal)/settings/SettingsClient.tsx` | 297 + API | MED | "Next billing" date shown to free users |
| 9.1 | `src/components/landing/FAQ.tsx` | 33 | MED | "14-day money-back" in FAQ contradicts free plans |
| 10.1 | `src/app/(marketing)/terms/page.tsx` | 98 | LOW | Stale tier names: Starter/Growth/Pro vs Visibility/Growth/Done-For-You |
| 10.2 | `src/app/(marketing)/terms/page.tsx` | 112 | HIGH | Terms say "non-refundable" — contradicts "money-back guarantee" on landing |
