## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Quality gate

Before committing, run (CI runs these too):

```
npm run lint && npm run format && npm run check && npm run test && npm run build
```

`npm run format:write` auto-formats. All registration logic lives in `src/lib/`
(`submit.ts`, `validation.ts`, `format.ts`) and is unit-tested in `src/lib/*.test.ts` —
keep these green. School details, the brush-up schedule and exam slots are all in
`src/config/site.ts`.

## Contributing

Work on a branch → open a PR → CI + CodeRabbit review → squash-merge. Do not push
straight to `main`. Never commit secrets (backend tokens go in a gitignored `.env`).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
