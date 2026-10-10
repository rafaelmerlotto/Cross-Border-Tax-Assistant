# Contributing to TaxPri

Thanks for your interest in improving TaxPri. This document explains how to set up the project, the conventions the codebase follows, and how to add the most common kind of contribution — a new rule.

By participating you agree to keep discussions respectful and to license your contributions under the [MIT License](LICENSE).

---

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Before you start](#before-you-start)
- [Development setup](#before-you-start)
- [Project conventions](#project-conventions)
- [Adding a rule](#adding-a-rule)
- [Adding a requirement](#adding-a-requirement)
- [Adding an official source](#adding-an-official-source)
- [Working on the frontend](#working-on-the-frontend)
- [Testing](#testing)
- [Commit and pull request guidelines](#commit-and-pull-request-guidelines)
- [Reporting bugs](#reporting-bugs)
- [Legal and content guidelines](#legal-and-content-guidelines)

---

## Ways to contribute

- **Fix bugs** listed in the [Known limitations](README.md#known-limitations-and-technical-debt) section of the README.
- **Add tests.** The pure domain functions (`buildCaseContext`, `evaluateRules`, `buildRequirements`, `buildReport`) currently have no direct coverage. This is the highest-value contribution available.
- **Add rules and requirements** for scenarios in the Slovenia ↔ Italy corridor that are not yet covered.
- **Improve documentation**, including this file and the README.
- **Improve accessibility** on the frontend (form label association, keyboard reachability, `aria-live` regions).
- **Add project infrastructure**: a GitHub Actions workflow, a Dockerfile, `.env.example` files.
- **Suggest new country corridors.** Open an issue before implementing one, because multi-country support requires an architectural change (see the [Roadmap](README.md#roadmap)).

If you plan to work on something substantial, please open an issue first so we can agree on the approach before you invest time.

---

## Before you start

### Prerequisites

- Node.js 20 or newer (Node 24 is used in development)
- PostgreSQL 14 or newer
- npm

### Set up the API

```bash
cd api
npm ci               # installs the versions pinned in package-lock.json
npx prisma generate  # writes the client to api/generated/prisma (gitignored)
```

Create `api/.env` from the template and point `DATABASE_URL` at your PostgreSQL instance:

```bash
cp .env.example .env
```

Apply the schema and start the server:

```bash
npx prisma migrate dev
npm run dev
```

The API test suite does **not** need this database — `npm run test:run` works without PostgreSQL, because Prisma is mocked in the HTTP tests.

### Set up the web app

```bash
cd web
npm ci
cp .env.example .env   # VITE_API_URL defaults to http://localhost:4000
npm run dev            # http://localhost:5173
```

Never commit `.env` files. Both packages gitignore them, and both ship a `.env.example` describing the required variables.

### Useful commands

```bash
cd api && npm run typecheck   # tsc --noEmit over src/, lib/ and prisma/seed/
cd api && npm run test:run    # full test suite, no database required
cd web && npm run lint        # oxlint
cd web && npm run build       # tsc -b && vite build
```

---

## Project conventions

### Architecture rules

These are not stylistic preferences — they are the invariants that keep the system testable and auditable.

1. **The rules engine must stay pure and deterministic.** A rule is a predicate over a plain `CaseContext` object. It must not perform I/O, call an LLM, use randomness, read the clock, or import Express, Prisma, `pdf/` or anything from React. Same input, same output, always.
2. **The questionnaire never reaches the rules.** `buildCaseContext` is the only place that translates wire-format answers into the domain model. Do not add questionnaire-specific fields to `CaseContext`; add a translation step instead.
3. **Rules decide what applies; the requirement registry owns what the user reads.** Never inline user-facing prose into a rule — reference a requirement ID.
4. **Sources are referenced by ID.** Never hard-code a URL inside a rule or requirement; add or reference an entry in the source registry.
5. **The report builder presents, it does not compute tax.** It assembles summaries, requirement titles, documents and sources.
6. **The PDF layer knows nothing about tax.** It receives a persisted record and lays it out.
7. **The frontend contains no tax logic.** If you are tempted to write `if (employerCountry === "IT")` in `web/`, the logic belongs in a rule.

### Code style

| Aspect | Convention |
| --- | --- |
| Language | TypeScript throughout; ESM (`"type": "module"`) in both packages |
| File naming | `kebab-case.ts` for modules, `PascalCase.tsx` for React components |
| Domain identifiers | `kebab-case` — `si-it-foreign-income`, `foreign-income-reporting`, `source-furs-foreign-income` |
| Request payload fields | `snake_case` (`residence_country`, `remote_work`) |
| Response and domain fields | `camelCase` (`caseContext`, `taxYear`, `completedAt`) |
| Exports | Named exports for backend modules; one default-exported component per file in `web/src/components` |
| Comments | Explain *why*, not *what*. Keep them in English. |

Run `npm run lint` in `web/` before opening a pull request. There is no formatter configured, so match the surrounding file's style.

### Keep the README honest

If your change fixes one of the items under [Known limitations](README.md#known-limitations-and-technical-debt), update that section in the same pull request. If your change introduces a new constraint or caveat, document it there.

---

## Adding a rule

Rules live in `api/src/modules/rules/rules/` and are registered in `api/src/modules/rules/engine.ts`.

### 1. Create the rule file

Follow the shape used by the existing nine rules:

```ts
// api/src/modules/rules/rules/my-new-rule.ts
import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const myNewRule: Rule = {
    id: "si-it-my-new-rule",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.employerCountry === "IT"
        );
    },

    requirementIds: [
        "my-new-requirement",
    ],
};
```

Guidelines for the `applies` predicate:

- Keep it a **pure boolean expression** over `CaseContext`. No side effects, no logging, no exceptions.
- Prefer explicit comparisons (`=== "SI"`, `=== true`) over truthiness, so the intent survives refactoring.
- Use the `si-<country>` / `si-it-<topic>` naming pattern already in the registry.
- Set `version` and `effectiveFrom` honestly. They are currently metadata, but the engine is intended to become tax-year aware.

### 2. Register it

Add the import and append the rule to the array in `engine.ts`. **Order matters** for the persisted `ruleResults` array.

### 3. Add the requirement

Every requirement ID you reference must exist in the requirement registry. See the next section.

### 4. Test it

Add unit tests asserting both the triggered and non-triggered path, ideally as a table of cases:

```ts
import { describe, expect, it } from "vitest";
import { evaluateRules } from "../engine";

const base = { /* a complete CaseContext */ };

describe("si-it-my-new-rule", () => {
    it("triggers for a Slovenian resident employed in Italy", () => {
        const results = evaluateRules({ ...base, residenceCountry: "SI", employerCountry: "IT" });
        expect(results.find(r => r.ruleId === "si-it-my-new-rule")?.triggered).toBe(true);
    });

    it("does not trigger otherwise", () => {
        const results = evaluateRules({ ...base, residenceCountry: "IT" });
        expect(results.find(r => r.ruleId === "si-it-my-new-rule")?.triggered).toBe(false);
    });
});
```

Run `npm run test:run` in `api/`.

---

## Adding a requirement

Requirements live in `api/src/modules/requirements/requirements/` and are registered in `api/src/modules/requirements/registry.ts`.

```ts
// api/src/modules/requirements/requirements/my-new-requirement.ts
import { Requirement } from "../types";

export const myNewRequirement: Requirement = {
    id: "my-new-requirement",
    category: "tax_reporting",
    priority: "high",
    status: "required",
    title: "Short, action-oriented title",
    description: "Why this may apply to the user's situation.",
    action: "What the user should verify, and with whom.",
    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "Why this document is relevant to the verification.",
            required: true,
        },
    ],
    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};
```

Guidelines:

- **Phrase everything as something to verify**, never as a conclusion. Write *"Verify whether an A1 certificate is required"*, not *"You must obtain an A1 certificate"*.
- Reuse existing document definitions by ID wherever possible instead of creating near-duplicates.
- Reference at least one official `sourceId` for any requirement that makes a legal claim, and add the source if it does not exist yet.
- Choose the `priority` and `status` deliberately. Prefer `"recommended"` or `"informational"` over `"required"` unless the obligation genuinely applies.
- Remember that only the **required** documents are surfaced in the report DTO, and that the report prints requirement **titles** — keep titles readable in isolation.

Then register it in `registry.ts` and add the ID to the `requirementIds` of every rule that should produce it.

---

## Adding an official source

Sources live in `api/src/modules/sources/sources/` and are registered in `api/src/modules/sources/registry.ts`.

```ts
// api/src/modules/sources/sources/my-source.ts
import { Source } from "../types";

export const mySource: Source = {
    id: "source-my-source",
    country: "SI",
    type: "tax_authority",
    title: "Official title of the document or page",
    description: "One or two sentences describing what it establishes.",
    authority: "Issuing authority",
    url: "https://example.gov.si/relevant-page",
    effectiveFrom: "2026-01-01",
};
```

Guidelines:

- **Prefer primary official sources** — tax authorities, EU institutions, bilateral treaties, legislation. Avoid blogs, commercial tax-advisory pages, forums and AI-generated summaries.
- Always include a `url` when one exists, and always set `effectiveFrom` where the material has a date.
- Use `effectiveFrom` / `effectiveTo` to record when the source was applicable, so that historical consultations remain traceable.
- Cite the authority precisely, using its official name and language where appropriate.

---

## Working on the frontend

- The form is a **single-page form**, not a wizard. Keep it that way unless there is a clear reason to change it, and discuss the change in an issue first.
- Field names in `register(...)` map **directly** to the API payload. If you rename a field, update `web/src/types/answers.ts`, `api/src/modules/consultation/consultation.schema.ts`, `api/src/modules/case-context/answers.ts`, and the case builder together — the contracts must stay in sync.
- If you add a question, update the Zod schema **and** the `CaseContext` type **and** `buildCaseContext`, otherwise the value will be silently stripped by Zod and the rules will never see it. This is the single most common source of bugs in this codebase.
- Styling is Tailwind CSS v4 with a CSS-first `@theme` block in `src/index.css`. Follow the existing neo-brutalist conventions: `border-2 border-black`, uppercase `tracking-widest` micro-labels, yellow/black/white palette, square corners.
- Icons come from `lucide-react` as named imports, never as an icon font or sprite.
- Accessibility improvements are welcome and encouraged: associate labels with controls via `htmlFor`/`id`, ensure interactive elements are real buttons or links, and add `aria-live` for async state.

---

## Testing

```bash
cd api
npm run test:run   # single run
npm test           # watch mode
npm run typecheck  # tsc --noEmit over src/, lib/ and prisma/seed/
```

Vitest with Supertest drives the Express app in-process, and **the suite needs no database**: Prisma is mocked in the HTTP tests and the domain tests are pure functions. Keep it that way — a contribution that requires a running PostgreSQL instance to run the default suite will be asked to change.

Shared test builders live in `api/src/test/factories.ts` (`makeAnswers`, `makeCaseContext`, `runPipeline`, `requirementIdsOf`). Use them instead of inlining a full `CaseContext`, so that adding a field to the domain model only requires updating one place.

What we expect in a pull request:

- **New rule → unit tests** for the triggered and non-triggered paths.
- **New requirement → at least a test asserting it resolves** from the rule that references it.
- **Bug fix → a regression test** where practical.
- **Endpoint change → a Supertest test** covering the new behaviour.

There is currently no test suite for `web/`. If you add one, Vitest plus React Testing Library is the natural choice, and `package.json` would need a `test` script.

Please do not submit pull requests that only add tests for trivial code, and do not weaken or delete existing assertions to make a build pass. If a test encodes a known defect on purpose — several do, and they say so in a comment — fix the defect and update that test rather than deleting it.

---

## Commit and pull request guidelines

### Commits

- Write commit messages in the imperative mood: `Add A1 certificate rule`, not `Added` or `Adds`.
- Keep the subject line under about 72 characters and explain *why* in the body when it is not obvious.
- One logical change per commit where possible.

### Pull requests

Before opening a pull request, please confirm:

- [ ] `cd api && npm run typecheck` passes.
- [ ] `cd api && npm run test:run` passes.
- [ ] `cd web && npm run lint` has no new errors.
- [ ] `cd web && npm run build` succeeds (this runs `tsc -b` as well).
- [ ] New or changed domain logic has tests.
- [ ] No dependency was added without also updating `package-lock.json` (`npm install`, never a hand-edited lockfile).
- [ ] `README.md` is updated if behaviour, the API surface, configuration, or the known-limitations list changed.
- [ ] No `.env` file, credential, generated Prisma client or `api/tmp/*.pdf` is included.
- [ ] New legal claims reference at least one official source.

The same checks run in CI (`.github/workflows/ci.yml`) on every push to `main`/`dev` and on every pull request, so a green local run means a green pipeline.

In the description, state what changed, why, and how you verified it. Link the issue it closes (`Closes #123`).

### Review expectations

Maintainers will review for correctness against official sources, adherence to the architectural invariants above, and test coverage. Because this project produces tax-orientation content, expect scrutiny on the wording of any user-facing requirement text.

---

## Reporting bugs

Open an issue and include:

- What you expected and what actually happened.
- Steps to reproduce, ideally with the exact questionnaire answers or the `curl` command used.
- The relevant response body or console output.
- Your environment: OS, Node version, and whether you run PostgreSQL locally.

For anything security-related — particularly anything that exposes consultation data — please report it privately rather than in a public issue.

For incorrect tax content (a rule that triggers when it should not, or a requirement that misstates an obligation), please include the official source that contradicts the current behaviour.

---

## Legal and content guidelines

This project provides **orientation, not tax advice**, and that distinction must survive every contribution.

- **Never state a conclusion as fact.** Phrase outcomes as verifications: *"Verify how and where this income must be reported,"* not *"You owe tax in Slovenia."*
- **Cite primary sources** for every legal claim, and keep the source's `effectiveFrom` accurate.
- **Do not invent rules or thresholds.** If a day-count threshold or treaty condition is not verifiable against an official source, do not encode it.
- **Keep the disclaimer intact.** The professional-review notice and the disclaimer in the README, the PDF footer and the web footer must not be removed or softened.
- **Do not collect more data than necessary.** The questionnaire collects only what the rules consume. Adding personal, identifying or financial-detail fields requires justification and a privacy review.
- **Respect the retention model.** Consultations expire after 30 days by design; do not add features that extend storage of personal data without discussing it first.

Finally: contributions are licensed under the MIT License, and the bundled font and logo assets are the responsibility of the contributor to verify for redistribution rights.
