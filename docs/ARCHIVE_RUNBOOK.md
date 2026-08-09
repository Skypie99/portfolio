# The Studio Archive — Runbook

Everything you need to run, deploy, and look after **skypistudio.com/archive** — your private, any-device art catalogue (67 artworks, 119 supplies, dark studio design).

It's a Supabase-backed island inside the otherwise-static portfolio: cloud database + photo storage + magic-link sign-in, so it opens from a phone, a borrowed laptop, anywhere. **RLS (row-level security) is the security boundary**, so the "anon" key it ships is safe to be public.

---

## 1. One-time setup (before the first deploy)

These are done once, in the supervised session where the Supabase project is created. Recording them here so they're never a mystery.

### a. GitHub → repo → Settings → Secrets and variables → Actions → **Variables** tab

Add two **repository variables** (Variables, *not* Secrets — the anon key is publishable and the deploy inlines it into the client):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's **publishable / anon** key |

Both come from Supabase → Project → Settings → API. The deploy build and the daily keepalive both read these.

### b. Local dev/build

Copy `.env.example` to `.env.local` in the repo root and fill in the same two values:

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored — it never gets committed.

### c. Supabase Auth dashboard (Supabase → Authentication)

- **URL Configuration → Site URL:** `https://skypistudio.com`
- **URL Configuration → Redirect URLs:** add
  `https://skypistudio.com/archive/`, `https://www.skypistudio.com/archive/`, `http://localhost:3100/archive/`
- **Email Templates → Magic Link:** make sure the template includes the 6-digit code line so the code path works — add `{{ .Token }}` to the template if it's not there.

---

## 2. Deploy

**Deploy = merge the PR.** GitHub Actions builds and ships to GitHub Pages, live in ~2 minutes. There's no staging.

- I never merge to `main` — you do (or via the GitHub UI).
- Nothing about the archive changes the live site until the branch is merged.

### Rollback

Two options:

```bash
git revert -m 1 <merge-commit-sha>
git push
```

…or in the **Actions** tab, re-run the last good **Deploy** run.

---

## 3. Keep it awake (free-tier auto-pause)

A free Supabase project **pauses after ~7 idle days**, and a paused project can't be woken from a borrowed computer — which would break the whole point. Three layers protect against that:

1. **Prevention (default, $0):** `.github/workflows/supabase-keepalive.yml` runs daily and makes one tiny anon read, so the project always counts as active. It leaks nothing (RLS returns an empty array to anon).
   - *Caveat:* GitHub disables scheduled workflows after ~60 days with no repo activity. Any push resets that clock, and the **Actions** tab has a one-click **"Enable workflow"** button if it ever sleeps.
2. **Cure (if it ever pauses):** supabase.com/dashboard → the project → **Restore** (~2 min, from any logged-in browser). You can also ask me to restore it via the Supabase tools.
3. **Always-on option:** upgrade the org to **Pro ($25/mo)** — pausing goes away entirely. Your call; nothing in the build depends on it.

---

## 4. Email deliverability (recommended follow-up: custom SMTP)

Supabase's built-in email sender allows only **~2–4 messages/hour** with best-effort delivery. That's fine for trusted devices (your phone/laptop rarely need to re-login — sessions persist), and the 6-digit code arrives in the same email as the link.

When you want rock-solid delivery (and no rate cap), wire a real sender:

- Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP.
- Use **Resend** (free tier ~3k emails/mo) or **Postmark**.
- **You paste the SMTP API key yourself** — I never handle credentials.

---

## 5. Adding a second person later

RLS + per-user storage folders already isolate every user's data, so a second person is safe to add whenever:

- Supabase → **Authentication → Users → Invite user**, or temporarily re-enable sign-ups, have them sign in once, then disable sign-ups again.

---

## 6. Backup habit

Import/export is the reason this app exists. Make a habit of it:

- **Export → full backup** monthly, and after any big cataloguing session.
- Keep the downloaded `studio-archive-YYYY-MM-DD.json` somewhere safe (it includes your photos).
- Import **replaces** everything and **auto-exports a fresh backup first**, so it's safe to re-run.

---

## 7. Local development

```bash
npm run dev -- -p 3100   # dev server on http://localhost:3100/archive/
npm run build            # static export → out/
npm test                 # full test suite
```

The archive's pure logic (colour maths, range map, search, import/export, catalog) is unit-tested under `lib/archive/__tests__/`.

---

## 8. Where things live

| Piece | Path |
|---|---|
| Route + styles | `app/archive/page.tsx`, `app/archive/archive.css` |
| UI components | `components/archive/*`, `components/ChromeGate.tsx` |
| Logic + data | `lib/archive/*` |
| Database schema | `supabase/migrations/` (schema + RLS in `…_init.sql`; storage.objects policies split into `…_storage_policies.sql`) |
| Seed extractor | `scripts/archive/extract-seed.mjs` |
| Keepalive + deploy | `.github/workflows/supabase-keepalive.yml`, `.github/workflows/deploy.yml` |
