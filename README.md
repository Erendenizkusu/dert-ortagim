# Dert Ortağım

An anonymous peer-support platform where people share what they are going through — either
anonymously or under a username — and others who have walked the same path leave advice and
support. Empathy-focused, calm by design.

> *"Dert ortağım"* means *"the one who shares my troubles"* in Turkish.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth + Row-Level Security)

---

## Features

- **Anonymous or named posting** — a per-post toggle lets the author decide whether their
  identity is shown or fully hidden.
- **Two feeds** — chronological ("Newest") and popular ("Me Too", ranked by how many people
  relate to a post).
- **Full-text search** (Turkish) with category, tag, and status filters.
- **Advice threads** — anyone can leave advice; the post owner can mark one as
  *"this solved it for me"*, which closes the post.
- **Trigger warnings** — sensitive posts are blurred in the feed until the reader opts in.
- **Dark-mode-first, minimalist UI** in the spirit of a calm, distraction-free timeline.

## Privacy by design (the core of the project)

Anonymity here is **not** enforced in the UI — it is enforced in the database, so an
anonymous author's identity cannot leak through any query.

- **Base tables (`posts`, `advices`) allow `SELECT` only to the row owner** via RLS. Even a
  direct query with the public API key cannot read another user's raw row.
- **Public reads go through masking views** (`posts_public`, `advices_public`). These run with
  definer rights and project author identity as `NULL` whenever `is_anonymous` is true — so the
  feed shows the content, never the hidden author.
- **`me_too` reactions are private** — each user sees only their own row, so *who* related to a
  post stays hidden.
- **Marking a solution is a guarded RPC** (`cozum_toggle`) that verifies `auth.uid()` equals the
  post owner before making any change.

The full schema, policies, and views live in [`supabase/migrations`](supabase/migrations).

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Server Actions)                      |
| Language  | TypeScript                                                   |
| Styling   | Tailwind CSS v4                                              |
| Backend   | Supabase — Postgres, Auth (email + Google), Row-Level Security |
| Search    | Postgres full-text search (`tsvector`, Turkish config)       |

## Getting started

### 1. Supabase project
1. Create a new project at [app.supabase.com](https://app.supabase.com).
2. In the **SQL Editor**, run the full contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) (then `0002`, `0003`).
3. Under **Authentication → Providers**, enable Email. For Google sign-in, configure the Google
   provider and add `http://localhost:3000/auth/callback` as a redirect URL.

### 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in your real values
(Project Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Only the public (anon) key is used — all access control is handled by Row-Level Security.

### 3. Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/          App Router routes + Server Actions (feed, post, profile, moderation, auth)
  components/   UI components (post card, advice form, feed tabs, theme, …)
  lib/          Supabase clients, queries, auth helpers, types
supabase/
  migrations/   Schema, triggers, RLS policies, masking views
```

## Notes

This is a personal project, built to explore privacy-first product design and to practise
full-stack TypeScript with a Postgres backend. The interface copy is in Turkish.
