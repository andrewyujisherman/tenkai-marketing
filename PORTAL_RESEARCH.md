# Tenkai Marketing — Portal & Auth Research

Stack: Next.js 15 (App Router), Supabase (auth + DB), Tailwind CSS, Vercel

---

## 1. Admin Portal — Auth & Access

### Current State (in your codebase)

- `src/lib/admin.ts` — hardcoded `ADMIN_EMAILS` whitelist + `isAdmin()` helper
- `src/middleware.ts` — checks `/admin` routes against whitelist, redirects non-admins to `/dashboard`
- `src/lib/supabase-admin.ts` — service_role client for server-side admin ops
- `src/app/api/admin/invite/route.ts` — invite flow using `inviteUserByEmail()`

### Best Pattern: Supabase + Next.js Admin Auth

**Recommended approach (3-layer defense):**

1. **`app_metadata.role = 'admin'`** — Set on user creation via `auth.admin.createUser()`. This is stored server-side, cannot be modified by the user (unlike `user_metadata`), and persists in the JWT.

2. **Custom Access Token Hook** — A Postgres function that runs before every token issuance. It reads the user's role from `app_metadata` (or a `user_roles` table) and injects it as a custom claim in the JWT. This makes role checks in middleware/RLS zero-cost (no DB lookup needed).

3. **Middleware + Server Component checks** — Read the role from the JWT claim in middleware for route protection. Always use `supabase.auth.getUser()` (not `getSession()`) for server components — it revalidates against the auth server.

```sql
-- Custom Access Token Hook (Postgres function)
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  user_role text;
begin
  claims := event->'claims';

  -- Get role from app_metadata
  user_role := coalesce(
    claims->'app_metadata'->>'role',
    'client'
  );

  -- Inject into JWT claims
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grant execute to supabase_auth_admin
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
```

Enable this hook in Dashboard > Auth > Hooks > "Customize Access Token (JWT) Claims".

**Why this over your current approach:**
- Your current whitelist in `admin.ts` works but requires redeployment to add/remove admins
- `app_metadata.role` is stored per-user, manageable via API, and queryable in RLS policies
- You can keep the whitelist as a fallback/bootstrap mechanism

### Master Password Approach (detailed in Section 5)

Create admin users with `auth.admin.createUser()` using a known password and `email_confirm: true`. No invite email sent. User logs in immediately with the shared password.

### Adding/Removing Admin Users

```typescript
// Server action or API route — add admin
import { supabaseAdmin } from '@/lib/supabase-admin'

async function addAdmin(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,           // Skip email verification
    app_metadata: { role: 'admin' } // Set admin role
  })
  return { data, error }
}

// Remove admin — demote to client or delete
async function removeAdmin(userId: string) {
  // Option A: Demote
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'client' }
  })
  // Option B: Delete entirely
  // await supabaseAdmin.auth.admin.deleteUser(userId)
}
```

### Admin Role Management

For a small team (marketing agency), a simple `admin` vs `client` role is sufficient. If you later need granularity:

| Role | Access |
|------|--------|
| `super_admin` | Full system access, can manage other admins |
| `admin` | Client management, content oversight, analytics |
| `editor` | Content creation/editing only |
| `client` | Own data only (portal) |

Store in `app_metadata.role`. Check in middleware + RLS.

---

## 2. Client Portal — Auth & Onboarding

### Best Invite Flow (Replacing the Broken One)

Your current flow uses `inviteUserByEmail()` which sends an email, redirects to `/auth/callback`, exchanges the code, and sends to `/auth/set-password`. This is the most fragile part of Supabase auth — the invite link token handling is notoriously unreliable across email clients, browsers, and redirect chains.

**Recommended: "Admin Creates Account" Flow (no invite email)**

```typescript
// API route: POST /api/admin/clients
async function createClient(name: string, email: string, company: string, tier: string) {
  // 1. Create auth user with temporary password
  const tempPassword = generateSecureTemp() // e.g., crypto.randomBytes(16).toString('hex')

  const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name, company_name: company },
    app_metadata: { role: 'client' }
  })

  if (error) throw error

  // 2. Create client record in DB
  await supabaseAdmin.from('clients').insert({
    id: authUser.user.id,  // Use the same UUID as auth.users
    email,
    name,
    company_name: company,
    tier,
    status: 'invited',
    auth_user_id: authUser.user.id
  })

  // 3. Send YOUR OWN welcome email (not Supabase's)
  //    Include: login URL + temporary password
  //    Use Resend, SendGrid, or Supabase Edge Function
  await sendWelcomeEmail({
    to: email,
    name,
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
    tempPassword
  })

  // 4. Force password change on first login
  //    (check in middleware or dashboard page)
}
```

**Why this is better:**
- No invite link token to break
- No reliance on Supabase email templates or redirect chains
- You control the email content and delivery
- User gets clear instructions: "Go to URL, log in with this temp password, you'll be prompted to change it"

**First login password change — detection:**
```typescript
// In middleware or dashboard layout
const user = await supabase.auth.getUser()
const client = await supabase.from('clients').select('status').eq('id', user.id).single()

if (client.data?.status === 'invited') {
  // Redirect to onboarding/password-change
  redirect('/onboarding')
}
```

### Client Password Management

| Flow | Implementation |
|------|---------------|
| **Set initial** | Admin creates with temp password, force change on first login |
| **Change own** | `supabase.auth.updateUser({ password: newPassword })` — user must be signed in |
| **Forgot/Reset** | `supabase.auth.resetPasswordForEmail(email, { redirectTo })` — sends reset link |
| **Admin reset** | `supabaseAdmin.auth.admin.updateUserById(userId, { password: newTemp })` — server-side |

**Password reset flow for Next.js App Router (working pattern):**

1. User clicks "Forgot Password" → calls `resetPasswordForEmail(email, { redirectTo: '/auth/callback?type=recovery' })`
2. Email template uses `{{ .ConfirmationURL }}` (not custom URLs)
3. Callback route exchanges the code, redirects to `/auth/set-password`
4. Set-password page calls `supabase.auth.updateUser({ password })` (user is now authenticated via the recovery flow)

**Important:** Use `token_hash` + `verifyOtp` approach if the standard redirect flow is unreliable. This is more robust:

```typescript
// In callback route
const token_hash = searchParams.get('token_hash')
const type = searchParams.get('type')

if (token_hash && type) {
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
  if (!error) {
    return NextResponse.redirect(`${origin}/auth/set-password`)
  }
}
```

### Client Profile/Settings Page

Minimum viable settings page:

```
/settings
├── Profile (name, company, website URL, logo upload)
├── Password (change password form)
├── Notifications (email preferences for content approvals, reports)
└── Billing (Stripe portal link, current plan, usage)
```

### Client Onboarding Flow

After first login, redirect to `/onboarding` with a multi-step wizard:

**Step 1: Welcome + Business Info**
- Company name, website URL, industry
- Target audience description
- Geographic focus

**Step 2: Goals & Preferences**
- Primary marketing goals (SEO, content, social, etc.)
- Content tone preferences
- Competitor URLs (up to 5)
- Existing analytics (GA, Search Console connection)

**Step 3: Brand Assets**
- Logo upload
- Brand colors
- Style guide PDF (optional)
- Existing content samples

**Step 4: Review & Launch**
- Summary of everything entered
- "Launch my marketing" CTA
- Update client status from `invited` → `active`

Store progress in `clients.onboarding_data` (JSONB) so users can resume if they leave mid-flow.

---

## 3. Portal Feature Completeness

### Client Portal — Must-Haves

| Feature | Priority | Notes |
|---------|----------|-------|
| **Dashboard** | P0 | Overview: active campaigns, pending approvals, key metrics |
| **Content Hub** | P0 | View all content, approve/reject, leave feedback |
| **Reports** | P0 | Weekly/monthly reports, trends, KPIs |
| **Settings** | P0 | Profile, password, notifications |
| **Approval Workflow** | P0 | Content review with approve/reject/request changes |
| **Notifications** | P1 | Email + in-app for approvals, reports, milestones |
| **Audit Results** | P1 | SEO audit scores, issues, recommendations |
| **Billing** | P1 | Current plan, invoices, Stripe portal |
| **Support/Chat** | P2 | Contact admin, knowledge base |
| **File Library** | P2 | Brand assets, delivered content, shared docs |

### Content Approval Workflow (Critical Path)

```
Agent creates content
  → status: 'draft'
  → Agent runs SEO scoring + AI detection
  → status: 'pending_approval'
  → Client gets notification (email + in-app)

Client reviews in portal
  → Approve → status: 'approved' → Agent publishes → status: 'published'
  → Reject with feedback → status: 'rejected' → client_feedback field
  → Request changes → status: 'draft' (with feedback) → Agent revises

Admin can override any approval status
```

Your schema already supports this via `content_posts.status` and `approvals` table. The portal UI needs:
- List view with status filters (pending, approved, rejected, all)
- Detail view with full content preview
- Approve/Reject buttons with optional notes textarea
- Status history/timeline

### Admin Portal — Must-Haves

| Feature | Priority | Notes |
|---------|----------|-------|
| **Client Management** | P0 | List, create, edit, deactivate clients |
| **Client Details** | P0 | Per-client view: content, reports, audit, billing |
| **Content Overview** | P0 | All content across clients, status filters |
| **Analytics Dashboard** | P0 | Aggregate metrics: content output, approval rates, client health |
| **Admin User Management** | P1 | Add/remove admins (for when you hire) |
| **System Settings** | P1 | Default configs, email templates, integrations |
| **Invite Management** | P1 | Track pending invites, resend, revoke |
| **Billing Overview** | P2 | MRR, churn, plan distribution |
| **Audit Log** | P2 | Who did what when (for accountability) |

### Admin Dashboard KPIs

- Total clients (active / churned)
- Content pieces this month (by status)
- Pending approvals (aging > 48h flagged)
- Average approval time
- SEO score trends across clients
- MRR and plan distribution

---

## 4. Supabase-Specific Patterns

### Row-Level Security for Multi-Tenant Data

Your current RLS is solid — it uses `email = auth.email()` to match clients to their auth user. One improvement: **link by user ID instead of email** for better performance and security.

```sql
-- Better: link clients to auth.users by ID
ALTER TABLE public.clients ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

-- Then RLS becomes:
CREATE POLICY "clients: select own" ON public.clients
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());
```

**Why:** `auth.uid()` is pulled from the JWT (instant), while `auth.email()` requires a function call. Also, if a user changes their email, ID-based linking still works.

**Admin bypass in RLS:**

```sql
-- Allow admins to see all rows
CREATE POLICY "clients: admin select all" ON public.clients
  FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
```

### Service Role vs Anon Key

| Key | Where | What It Does |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Respects RLS. Safe to expose. Used for all user-facing queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server ONLY | Bypasses RLS entirely. For admin operations, user management, background jobs. |

**Rules:**
- Service role key: NEVER prefix with `NEXT_PUBLIC_`
- Mark admin util files with `import 'server-only'` to prevent client bundling
- Server Actions that use service role MUST check auth/role before executing (they're callable by anyone)
- Your `supabase-admin.ts` setup is correct — just add `import 'server-only'` at the top

### Auth Hooks & Triggers

**Hooks (run in Supabase Auth flow):**

| Hook | When | Use Case |
|------|------|----------|
| `Custom Access Token` | Before JWT issued | Inject roles/claims into token |
| `Before User Created` | Before signup | Validate email domain, block disposable emails |
| `After User Created` | After signup | Create matching profile/client row, send welcome email |
| `MFA Verification` | During MFA | Custom MFA logic |

**Database Triggers (run on table changes):**

```sql
-- Auto-create client profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (auth_user_id, email, name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Caution:** This trigger approach auto-creates client records but may conflict with your admin invite flow where you want to control the client record creation. Use either the trigger OR manual creation, not both.

### The "Invited User Sets Password" Flow — PROPERLY

The Supabase invite flow has known issues. Here's what actually works:

**Option A: Skip Supabase Invites Entirely (Recommended)**

```
Admin creates user → auth.admin.createUser({ email, password: tempPwd, email_confirm: true })
Admin sends custom email → "Log in at [URL] with password [tempPwd]"
User logs in → Middleware checks status === 'invited'
User redirected to /onboarding → Step 1: change password
User changes password → supabase.auth.updateUser({ password: newPwd })
Status updated → 'active'
```

**Option B: Fix the Supabase Invite Flow**

If you want to keep using `inviteUserByEmail()`:

1. Update your email template to use `{{ .ConfirmationURL }}` (in Dashboard > Auth > Email Templates > Invite)
2. In your callback route, handle both `code` AND `token_hash` parameters:

```typescript
// /auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const cookieStore = await cookies()
  const supabase = createServerClient(/* config */)

  // PKCE flow (most common)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.invited_at) return NextResponse.redirect(`${origin}/auth/set-password`)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Token hash flow (some email clients)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'invite' | 'recovery' | 'email'
    })
    if (!error) return NextResponse.redirect(`${origin}/auth/set-password`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`)
}
```

3. Your `set-password` page should call `updateUser({ password })` — this works because the user is now authenticated via the callback.

**The fundamental problem with Option B:** Invite emails get eaten by spam filters, tokens expire after 24h, redirect chains break across different email clients (especially Gmail's link proxy), and users are confused by the flow. Option A is simpler and more reliable.

---

## 5. The Master Password Approach

### What You Want

All admin users share a known password. Whitelisted emails only. No invite flow for admins. Just create the accounts directly.

### Implementation

```typescript
// scripts/create-admin.ts (run once, or as needed)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD! // Store in env, not code

const ADMIN_EMAILS = [
  'andrewyujisherman@gmail.com',
  // Add more as needed
]

async function createAdminUsers() {
  for (const email of ADMIN_EMAILS) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === email)

    if (existing) {
      // Update existing user to admin
      await supabase.auth.admin.updateUserById(existing.id, {
        password: MASTER_PASSWORD,
        app_metadata: { role: 'admin' },
        email_confirm: true
      })
      console.log(`Updated: ${email}`)
    } else {
      // Create new admin
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: MASTER_PASSWORD,
        email_confirm: true,
        app_metadata: { role: 'admin' }
      })
      if (error) console.error(`Failed: ${email}`, error.message)
      else console.log(`Created: ${email}`)
    }
  }
}

createAdminUsers()
```

**Or as an API route (protected):**

```typescript
// /api/admin/create-admin/route.ts
export async function POST(request: Request) {
  // Verify the caller is a super admin
  const user = await getAdminUser()
  if (!user || user.email !== 'andrewyujisherman@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await request.json()
  const masterPassword = process.env.ADMIN_MASTER_PASSWORD!

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: masterPassword,
    email_confirm: true,
    app_metadata: { role: 'admin' }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, userId: data.user.id })
}
```

### Pros & Cons

**Pros:**
- Dead simple — no invite flow, no email templates, no redirect chains
- Instant access — create user, tell them the password, done
- Easy to add new admins — one API call
- No broken invite links
- Works perfectly for a small team (1-5 admins)

**Cons:**
- **No accountability** — If the password leaks, you don't know who leaked it. Audit logs show actions but all admins look the same credential-wise.
- **Rotation is disruptive** — Changing the master password requires updating ALL admin users and notifying ALL admins simultaneously
- **Violates security best practices** — Shared credentials are explicitly called out by HIPAA, SOC 2, PCI-DSS as non-compliant. Won't pass a security audit.
- **No MFA per-user** — Can't enforce individual MFA with shared passwords
- **Former admin access** — If someone leaves, you must rotate the master password for ALL remaining admins, not just revoke one account

### Security Considerations

1. **Store master password in environment variable** — Never hardcode in source. Use `ADMIN_MASTER_PASSWORD` env var.
2. **Minimum password strength** — 20+ characters, generated randomly. This isn't a human-memorized password; it can be complex.
3. **Limit blast radius** — Admin accounts should have the minimum permissions needed. Even within "admin", scope what each admin can do.
4. **Audit logging** — Log every admin action with the user's email (not just "an admin did this"). Even with shared passwords, the email on the JWT differs.
5. **Session management** — Set short session lifetimes for admin accounts (e.g., 1 hour instead of 1 week).

### Password Rotation

```typescript
async function rotateMasterPassword(newPassword: string) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const admins = users?.users?.filter(u =>
    u.app_metadata?.role === 'admin'
  ) || []

  const results = []
  for (const admin of admins) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(admin.id, {
      password: newPassword
    })
    results.push({ email: admin.email, success: !error, error: error?.message })
  }

  // NOTE: updateUserById with new password kills all active sessions
  // All admins will need to log in again with the new password

  return results
}
```

**Rotation triggers:**
- When any admin leaves the team
- Every 90 days (security hygiene)
- If you suspect any compromise

### Pragmatic Recommendation

For a solo founder / small team (your situation), the master password approach is **fine for now**. Here's a migration path:

1. **Now:** Master password for admins. Ship fast.
2. **When you hire:** Switch to individual passwords per admin. Each admin gets their own password via `createUser()`. Drop the shared password.
3. **When you need compliance:** Add MFA, audit logs, session management. Use `app_metadata.role` for granular RBAC.

The master password approach costs zero complexity and gets you to launch. The migration to individual passwords later is a one-time script that takes 30 minutes to implement.

---

## 6. Recommended Migration Plan (Your Codebase)

Based on what's already in your repo, here's what to change:

### Immediate (Before Launch)

1. **Add `auth_user_id` to clients table** — Link clients to auth.users by UUID, not email
2. **Add `app_metadata.role`** — Set on all admin user creation
3. **Update middleware** — Check `app_metadata.role` from JWT instead of hardcoded email list (keep email list as fallback)
4. **Add `import 'server-only'`** to `supabase-admin.ts`
5. **Replace invite flow** — Switch from `inviteUserByEmail()` to `createUser()` + custom email
6. **Create admin seeding script** — Use master password approach for admin accounts
7. **Add Custom Access Token Hook** — Inject role claim into JWT for efficient middleware checks

### Schema Migration (002)

```sql
-- Add auth_user_id to clients
ALTER TABLE public.clients ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
CREATE UNIQUE INDEX idx_clients_auth_user_id ON public.clients(auth_user_id);

-- Update RLS policies to use auth_user_id instead of email
DROP POLICY "clients: select own" ON public.clients;
CREATE POLICY "clients: select own" ON public.clients
  FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY "clients: update own" ON public.clients;
CREATE POLICY "clients: update own" ON public.clients
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Add admin full-access policies on all tables
CREATE POLICY "audits: admin all" ON public.audits
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "content_posts: admin all" ON public.content_posts
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "approvals: admin all" ON public.approvals
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "reports: admin all" ON public.reports
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  claims := event->'claims';
  user_role := coalesce(claims->'app_metadata'->>'role', 'client');
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

---

## Sources

### Supabase Official Docs
- [Admin API — createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Admin API Reference](https://supabase.com/docs/reference/javascript/admin-api)
- [Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Before User Created Hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)
- [Auth Hooks Overview](https://supabase.com/docs/guides/auth/auth-hooks)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Feature Page](https://supabase.com/features/row-level-security)
- [RBAC Feature Page](https://supabase.com/features/role-based-access-control)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Understanding API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Password Reset — resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Securing Your Data](https://supabase.com/docs/guides/database/secure-data)

### Community & Tutorials
- [Middleware RBAC in Next.js 15 App Router](https://www.jigz.dev/blogs/how-to-use-middleware-for-role-based-access-control-in-next-js-15-app-router)
- [Supabase Auth + Next.js Implementation Guide (Permit.io)](https://www.permit.io/blog/supabase-authentication-and-authorization-in-nextjs-implementation-guide)
- [Multi-Tenant Applications with RLS on Supabase (AntStack)](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [RLS Multi-Tenant Architecture Deep Dive (LockIn)](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2)
- [Supabase RLS Complete Guide 2026](https://designrevision.com/blog/supabase-row-level-security)
- [Supabase Best Practices (Leanware)](https://www.leanware.co/insights/supabase-best-practices)
- [API Key Management Guide (MakerKit)](https://makerkit.dev/blog/tutorials/supabase-api-key-management)
- [Server-Side Admin API Keys Guide](https://www.inksh.in/blog/next-tutorial/supabase-admin-server)
- [Set Password After Email Invite (Discussion #20333)](https://github.com/orgs/supabase/discussions/20333)
- [Invite User Email Template (Discussion #21097)](https://github.com/orgs/supabase/discussions/21097)
- [RBAC Implementation (Discussion #346)](https://github.com/orgs/supabase/discussions/346)

### B2B SaaS & Client Portals
- [Client Portals for Marketing Agencies (Knack)](https://www.knack.com/blog/client-portals-for-marketing-agencies/)
- [Best Client Portals for Marketing Agencies 2026 (Moxo)](https://www.moxo.com/blog/best-client-portals-for-marketing-agencies)
- [Customer Portal 101: Features, Benefits & Tools (Clinked)](https://www.clinked.com/blog/customer-portals)
- [B2B SaaS Onboarding — Auth0](https://auth0.com/blog/user-onboarding-strategies-b2b-saas/)
- [SaaS Onboarding Flow Guide (Userflow)](https://www.userflow.com/blog/saas-onboarding-flow-a-complete-guide)
- [SaaS Onboarding Best Practices + Checklist (ProductLed)](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)

### Security
- [15 Password Management Best Practices 2026 (Securden)](https://www.securden.com/blog/password-management-best-practices.html)
- [Risks of Password and Account Sharing (IMI)](https://identitymanagementinstitute.org/the-risks-of-password-and-account-sharing/)
- [10 Risky Password Sharing Practices (LastPass)](https://blog.lastpass.com/posts/risky-password-sharing-practices)
- [Dangers of Shared Passwords (CyberFox)](https://www.cyberfox.com/the-dangers-of-shared-passwords-and-how-to-fix-them/)
