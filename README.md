# Egmont Aviation — ATPL(A) Student Portal

A **static** website where flight-school students register for **ATPL(A) brush-up
sessions** and book theory exams. Built with **Astro + React + Tailwind + shadcn/ui**.

The website itself holds **no database**. Each registration is POSTed as JSON to a
separate, self-hostable **forms/data engine** (e.g. NocoDB) that owns the data and
gives office staff an Airtable-style grid plus an email alert on every sign-up.

```
┌────────────────┐      POST JSON       ┌──────────────────────┐
│  Static site   │ ───────────────────► │  Forms engine (DB)   │
│ (Astro → HTML) │                      │  NocoDB / Baserow …  │
│  host: Pages   │                      │  • grid for staff    │
└────────────────┘                      │  • email on new row  │
                                        └──────────────────────┘
```

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output → ./dist
npm run preview    # serve the built ./dist locally
```

Out of the box the site runs in **demo mode**: forms validate and show the success
screen, but nothing is sent anywhere (the would-be payload is logged to the browser
console). Wire a backend to go live — see below.

---

## Development & quality gate

```bash
npm run lint      # ESLint (flat config: TS/TSX + Astro + react-hooks)
npm run format    # Prettier check (write with: npm run format:write)
npm run check     # astro check — type-checks .astro/.ts/.tsx
npm run test      # Vitest unit tests (src/lib/*.test.ts)
npm run build     # production build
```

CI (`.github/workflows/ci.yml`) runs all of the above on every push to `main` and
every pull request. **CodeRabbit** auto-reviews PRs (`.coderabbit.yaml`, assertive
profile). Workflow: branch → PR → CI + CodeRabbit green → squash-merge. Don't push
straight to `main`.

Unit tests cover the logic that fails silently if broken: `submit.ts` payload
shaping per `payloadStyle`, the form validation rules, and session-date formatting.

---

## Editing the portal — `src/config/site.ts`

This is the **only file** office staff need to touch for day-to-day changes. No
database, no code knowledge required — edit, rebuild, redeploy.

| What you change                 | Where             |
| ------------------------------- | ----------------- |
| School name, contact            | `school`          |
| ATPL(A) brush-up schedule       | `brushUpSessions` |
| EASA ATPL(A) subject list       | `atplSubjects`    |
| Exam subjects (= ATPL subjects) | `examSubjects`    |
| Bookable exam dates             | `examSlots`       |
| Backend endpoint / token        | `backend`         |

Each `brushUpSessions` entry is one bookable session carrying its `date`, `time`,
`subjects` and `seats`. Set `seats: 0` to show a session as full; delete the row to
remove it. Same for `examSlots`.

---

## Connecting a backend

The site is **backend-agnostic**. It POSTs each registration as JSON. Set three
things in `backend` inside `src/config/site.ts`:

```ts
export const backend = {
  endpoint: "https://app.nocodb.com/api/v2/tables/<tableId>/records",
  headers: { "xc-token": "<your-api-token>" },
  payloadStyle: "nocodb", // "flat" | "nocodb" | "records"
};
```

The JSON sent for each submission looks like:

```json
{
  "type": "exam_booking",
  "fullName": "Jane Aviator",
  "email": "jane@example.com",
  "phone": "+1 555 0100",
  "dateOfBirth": null,
  "studentId": null,
  "subject": "Meteorology",
  "slot": "Fri 10 Jul 2026 — 09:00",
  "notes": null,
  "reference": "EXM-UNQ5X7",
  "submittedAt": "2026-06-24T10:00:00.000Z"
}
```

> Brush-up registrations send `type: "brushup_registration"` with `sessionDate`,
> `sessionTime`, `subjects` (comma-joined) and `location` instead of `subject`/`slot`.

### Recommended: NocoDB (open-source, free cloud → self-host later)

1. **Create a base + table.** Sign up at <https://app.nocodb.com> (free) — or
   self-host with one Docker command when you have a server:
   ```bash
   docker run -d --name nocodb -p 8080:8080 -v nocodb:/usr/app/data nocodb/nocodb:latest
   ```
2. **Add columns** matching the JSON keys above (`fullName`, `email`, `phone`,
   `subject`/`course`, `slot`, `notes`, `reference`, `submittedAt`, `type`).
   Create two tables (Theory, Exams) or one combined table — your choice.
3. **Get the REST endpoint + token.** In NocoDB: _Account → Tokens_ for an
   `xc-token`; the table's API snippet gives the `/api/v2/tables/<id>/records` URL.
4. **Paste both** into `backend` and set `payloadStyle: "nocodb"`. Rebuild & deploy.
5. **Email on new sign-up.** In NocoDB add a **Webhook** (trigger: _After Insert_)
   pointing at your email/notification service, or use a NocoDB automation to email
   the office. Staff view/sort/export all registrations in the grid.

**Baserow** works identically (`payloadStyle: "flat"`, `Authorization: Token <key>`
header) and is a fine substitute.

### Other backends

- **Supabase** — create a table, use the auto REST endpoint with the `apikey` /
  `Authorization` headers, `payloadStyle: "flat"`. Email via a DB webhook / Edge Function.
- **Formspree / Getform** — set `endpoint` to your form URL, `payloadStyle: "flat"`.
  Simplest email-only option; dashboard instead of a full grid.

> **CORS:** the browser posts directly to the backend, so the backend must allow
> requests from your site's origin. NocoDB/Baserow/Supabase allow this by default;
> for a self-hosted instance, add your domain to the allowed origins.

> **Token exposure:** an API token in front-end config is visible to visitors. Use a
> **dedicated, insert-only token** scoped to the registrations table. For stricter
> control, put a tiny serverless proxy (Cloudflare Worker / Netlify Function) in
> front and keep the token server-side — the front end already supports pointing
> `endpoint` at any URL.

---

## Deploying the static site

`npm run build` produces a plain static `./dist`. Host it free anywhere:

- **Cloudflare Pages / Netlify** — connect the repo; build `npm run build`, output `dist`.
- **GitHub Pages** — push `dist` (set `site`/`base` in `astro.config.mjs` if served from a subpath).
- **Any static host / S3 bucket** — upload `dist`.

---

## Project structure

```
src/
  config/site.ts            ← edit me (offerings + backend)
  layouts/Layout.astro      ← page shell (navbar + footer)
  components/
    Navbar.astro, Footer.astro
    RegistrationForm.tsx     ← the form (React island: brush-up schedule + exam)
    ui/                       ← shadcn components
  lib/submit.ts              ← backend-agnostic submission + demo mode
  lib/validation.ts          ← pure form-validation rules (unit-tested)
  lib/format.ts              ← session date formatting
  lib/*.test.ts              ← Vitest unit tests
  pages/
    index.astro              ← landing
    brushup.astro            ← ATPL(A) brush-up schedule + registration
    exam.astro               ← exam booking

Config: eslint.config.js · .prettierrc · vitest.config.ts · .coderabbit.yaml
        .github/workflows/ci.yml
```
