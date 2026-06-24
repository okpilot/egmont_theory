# Roadmap & status

Living handoff doc — where the project stands and what's next. Update it as we go.

## Where we are

A working, CI-green static portal for **Egmont Aviation** (EASA ATO **SI.ATO.041**,
Maribor): students browse a schedule of **ATPL(A) brush-up sessions** and register,
or **book a theory exam**. Built with Astro + React + Tailwind + shadcn/ui; outputs
static HTML.

- **Front end:** done and verified (landing, `/brushup` agenda + registration,
  `/exam` booking). Forms validate, show a success screen with a reference.
- **Backend:** **demo mode** — submissions are validated and logged to the browser
  console but **not stored anywhere yet** (see Next steps · B).
- **Quality:** ESLint + Prettier + `astro check` + Vitest unit tests, all gated by
  CI (`.github/workflows/ci.yml`) and reviewed by CodeRabbit (assertive) on PRs.

Everything the office edits day-to-day lives in **`src/config/site.ts`** (school
details, brush-up schedule, exam subjects/slots, backend wiring).

## Working agreement

- **Branch → PR → CI + CodeRabbit green → squash-merge.** No direct pushes to `main`.
- **Critic gate:** run an adversarial review after planning and after implementing.
- **Never commit secrets.** Backend tokens go in a gitignored `.env` / build secret,
  not in `src/config/site.ts` (the repo is public and config is bundled into the JS).

## Next steps

- [ ] **B — Wire NocoDB (recommended next).** Turns demo mode into real storage:
      registrations save, staff get an Airtable-style grid, email on each sign-up.
      Needs a NocoDB base + table + insert-only API token (cloud free tier or
      self-hosted). Then set `backend.endpoint/headers/payloadStyle` in config.
- [ ] **A — Real brush-up schedule.** Replace the example sessions in
      `brushUpSessions` with real dates / subject pairings / seat counts.
- [ ] **C — Playwright e2e smokes.** Commit browser tests for the brush-up and exam
      happy paths (the proven puppeteer flow, ported).
- [ ] **Deploy.** Once B + A are in: Cloudflare/Netlify Pages (`npm run build` → `dist`).

## Open items to confirm

- Approval number **SI.ATO.041** (public listings show 042 — using 041 per owner).
- Example brush-up sessions are placeholders until the real schedule lands.
