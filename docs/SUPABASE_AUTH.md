# NexCoder — Supabase Auth

Email/password + Google + GitHub sign-in using `@supabase/ssr` (cookie sessions
that work across Server Components, Client Components, Route Handlers, and
middleware). Marketing pages stay statically generated; only `/account` and the
`/auth/*` handlers are dynamic.

## Files

| Path                                  | Role                                             |
| ------------------------------------- | ------------------------------------------------ |
| `lib/supabase/client.ts`              | Browser client (client components)               |
| `lib/supabase/server.ts`              | Server client (Server Components / Route Handlers)|
| `lib/supabase/middleware.ts`          | Session refresh + `/account` protection          |
| `middleware.ts`                       | Wires the middleware for all non-asset routes    |
| `components/auth/AuthForm.tsx`        | Email/password + Google/GitHub form              |
| `app/(site)/login`, `/signup`         | Auth pages                                        |
| `app/(site)/account`                  | Protected account page (plan + usage)            |
| `app/auth/callback/route.ts`          | OAuth + email-confirmation code exchange         |
| `app/auth/signout/route.ts`           | Sign out (POST → home)                            |
| `supabase/schema.sql`                 | `profiles` table, RLS, and signup trigger        |

## One-time Supabase dashboard setup

1. **Environment variables** — copy `.env.example` values into `.env.local`
   (local) and into the **Vercel project settings** (production):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   The anon/publishable key is public by design — security is enforced by RLS.

2. **Database** — open the SQL Editor and run [`supabase/schema.sql`](../supabase/schema.sql).
   It creates `public.profiles` (plan + usage), enables RLS, and adds a trigger
   that creates a profile row on every signup.

3. **URL configuration** — Authentication → URL Configuration → **Redirect URLs**,
   add:
   ```
   http://localhost:3000/auth/callback
   https://nexcoder.trynexa-ai.com/auth/callback
   ```
   Set the **Site URL** to your production origin.

4. **Providers** — Authentication → Providers:
   - **Email**: enabled by default. "Confirm email" ON gives the confirmation flow.
   - **Google**: enable, paste the Google OAuth Client ID/secret, and add the
     Supabase callback (`https://<project>.supabase.co/auth/v1/callback`) as an
     authorized redirect URI in Google Cloud.
   - **GitHub**: enable, paste the GitHub OAuth App Client ID/secret, and set its
     Authorization callback URL to the same Supabase callback.

## Flow summary

- **Email/password**: `signUp` sends a confirmation email → link hits
  `/auth/callback` → session set → `/account`. `signInWithPassword` logs in
  directly.
- **OAuth**: `signInWithOAuth` → provider → `/auth/callback?code=…` →
  `exchangeCodeForSession` → `/account`.
- **Session**: middleware refreshes the cookie on every request; the nav reflects
  auth state client-side; `/account` is server-guarded (redirects to `/login`).

Nothing here stores secrets in the repo — the Worker/R2 credentials and any
service-role keys stay out of Git.
