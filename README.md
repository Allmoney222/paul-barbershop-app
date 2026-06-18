# 2Gether Hair Studio — Booking & Admin Platform

A full-stack appointment booking site and staff admin dashboard for **2Gether Hair Studio** (Buffalo, NY), built with Next.js 14 (App Router), Supabase, Stripe, and Resend.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Database / Auth:** Supabase (Postgres + Row Level Security + Auth)
- **Styling:** Tailwind CSS + shadcn/ui (custom brand theme)
- **Payments (optional):** Stripe (booking deposits + webhook)
- **Email:** Resend (booking confirmations + cancellations)
- **Language:** TypeScript

## Project Structure

```
src/
  app/
    page.tsx                  Public homepage (hero, services, team, hours/location)
    book/                      Multi-step booking flow + confirmation page
    api/                       Route handlers (slots, create/cancel appointment, Stripe webhook)
    admin/
      login/                   Staff login page
      (app)/                   Authenticated admin shell (sidebar layout)
        dashboard/             Today's multi-stylist view
        calendar/              Weekly calendar (filter by stylist)
        appointments/[id]/     Appointment detail + status/notes editor
        clients/               Client list with visit/spend history
        staff/                 Staff management (admin only)
        services/              Service catalog + stylist assignments (admin only)
        availability/          Weekly hours + blocked dates
        settings/              Shop info + booking settings (admin only)
  components/
    site/                      Public site sections (header, hero, footer, etc.)
    booking/                   Booking flow steps + payment
    admin/                     Admin UI (sidebar, tables, forms, badges)
    ui/                        shadcn/ui primitives
  lib/
    supabase/                  Browser/server/admin Supabase clients + auth helpers
    actions/                   Server Actions for all admin CRUD operations
    data/                      Shared data-fetching helpers (admin, clients, shop info)
    booking/                   Availability + slot-generation logic
    email.ts, stripe.ts, timezone.ts, format.ts, constants.ts
  types/database.ts            Generated-style Supabase database types
supabase/migrations/
  0001_schema.sql               Tables
  0002_rls.sql                  Row Level Security policies
  0003_functions.sql            Helper SQL functions
  0004_seed.sql                 Seed data (default services, shop settings, etc.)
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. In the SQL editor (or via the Supabase CLI), run the migration files **in order**:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_functions.sql`
   - `supabase/migrations/0004_seed.sql`
3. In **Authentication → Settings**, make sure email sign-in is enabled (this is how staff log in to `/admin`).
4. Create your first admin user:
   - Go to **Authentication → Users** and invite/create a user with your email.
   - In the SQL editor, insert a matching row into `staff` (or update an existing seeded row) with `role = 'admin'` and `auth_user_id` set to that user's UUID so they can log in at `/admin/login`. Subsequent staff can be invited directly from the admin dashboard (see [Adding Staff Members](#adding-staff-members) below).

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

See [Environment Variables](#environment-variables) below for details on each value.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the staff dashboard.

### 5. Build for production

```bash
npm run build
npm run start
```

## Environment Variables

All variables go in `.env.local` (never commit this file). A template is provided at `.env.local.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (Project Settings → API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public API key. Used by browser and server clients for normal requests (subject to RLS). |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key. **Server-side only** — used to send staff invite emails (`auth.admin.inviteUserByEmail`). Never expose this to the client. |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key. Required only if booking deposits are enabled in Settings. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key, used by the deposit payment form during checkout. |
| `STRIPE_WEBHOOK_SECRET` | Optional | Signing secret for the Stripe webhook endpoint (`/api/stripe/webhook`), used to confirm deposit payments and mark appointments as paid. |
| `RESEND_API_KEY` | Optional | API key from [resend.com](https://resend.com) used to send booking confirmation and cancellation emails. |
| `RESEND_FROM_EMAIL` | Optional | The "from" address/name used for outgoing emails, e.g. `"2Gether Hair Studio <bookings@2getherhairstudio.com>"`. The sending domain must be verified in Resend. |
| `NEXT_PUBLIC_APP_URL` | Yes | The base URL of the deployed app (e.g. `http://localhost:3000` locally or `https://yourdomain.com` in production). Used for building booking confirmation links, cancellation links, and staff invite redirect URLs. |

**Notes:**
- If Stripe/Resend variables are left blank, the deposit step and email sending are skipped gracefully — the app still functions for in-person/no-deposit bookings.
- To enable deposits, set the Stripe keys and toggle **"Require a deposit to book online"** in `/admin/settings`.
- For the Stripe webhook to work locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Roles & Access

Staff are stored in the `staff` table with a `role` of `admin`, `barber`, or `stylist`.

- **Admin:** Full access — dashboard, calendar, all appointments, clients, staff, services, availability (for any staff member or the whole shop), and settings.
- **Barber / Stylist:** Dashboard, calendar, their own appointments, clients, and their own availability. Staff, Services, and Settings are hidden and enforced as admin-only by RLS policies.

A staff member can only log in to `/admin` if their `staff` row has `auth_user_id` set to a Supabase Auth user's UUID.

## Adding Staff Members

1. Log in to `/admin` as an admin and go to **Staff → Add Staff**.
2. Fill in their name, email, role, phone, photo URL, specialties, bio, and sort order.
3. Check **"Send login invite email"** to have Supabase email them a sign-up link (via `auth.admin.inviteUserByEmail`, redirecting to `/admin/login`). This requires `SUPABASE_SERVICE_ROLE_KEY` to be set.
4. Once they accept the invite and set a password, their `staff.auth_user_id` is automatically linked to their new Supabase Auth account, and they can log in at `/admin/login` with access scoped to their role.

If you prefer not to send an invite (e.g. for a placeholder stylist profile that doesn't need dashboard access), leave that checkbox unchecked — the staff record is still created and will appear on the public site and in booking, just without admin login access.

## Deployment

This project is designed for [Vercel](https://vercel.com):

1. Push the repository to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add all environment variables from the table above in **Project Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. If using Stripe, update the webhook endpoint in the Stripe dashboard to `https://yourdomain.com/api/stripe/webhook` and copy the new signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Deploy. Run the Supabase migrations against your production project before (or right after) the first deploy.
