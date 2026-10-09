# TaxPri — Cross-Border Tax Assistant

> **Answer a few questions about your cross-border situation and get a clear, source-backed explanation of what you should check, prepare, and do next.**

TaxPri is an open-source, rule-based consultation platform for people who live and work across European borders. The first supported corridor is **Slovenia ↔ Italy**. A user answers a short questionnaire, a deterministic rules engine evaluates the case, and the system produces an actionable report — with a document checklist, attention points and links to official sources — downloadable as a PDF.

The platform provides **orientation, not tax advice**. It is designed to answer *"Based on my situation, what do I need to check or do?"* before the user talks to a qualified professional.

---

## Table of contents

- [Status](#status)
- [Live deployment](#live-deployment)
- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Repository layout](#repository-layout)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Domain model](#domain-model)
  - [CaseContext](#casecontext)
  - [Rules](#rules)
  - [Requirements](#requirements)
  - [Sources](#sources)
  - [Report](#report)
- [Backend deep dive (`api/`)](#backend-deep-dive-api)
  - [Module map](#module-map)
  - [The consultation pipeline](#the-consultation-pipeline)
  - [API reference](#api-reference)
  - [Input validation](#input-validation)
  - [Rate limiting](#rate-limiting)
  - [PDF generation](#pdf-generation)
- [Database](#database)
- [Frontend deep dive (`web/`)](#frontend-deep-dive-web)
  - [Routing](#routing)
  - [Component tree](#component-tree)
  - [The questionnaire](#the-questionnaire)
  - [API integration](#api-integration)
  - [Design system](#design-system)
- [Configuration](#configuration)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Scripts reference](#scripts-reference)
- [Deployment](#deployment)
- [Security, privacy and data retention](#security-privacy-and-data-retention)
- [Known limitations and technical debt](#known-limitations-and-technical-debt)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Status

Early-stage MVP, functional end-to-end. The full vertical slice works: questionnaire → case context → rules → requirements → report → PDF.

| Area | State |
| --- | --- |
| Rules engine (9 rules) | Implemented |
| Requirement catalogue (12 requirements) | Implemented |
| Source catalogue (4 official sources) | Implemented |
| Report builder | Implemented |
| PDF generation | Implemented |
| REST API | Implemented |
| Web questionnaire + result dashboard | Implemented |
| Persistence (PostgreSQL + Prisma) | Implemented |
| Automated tests | Minimal — see [Testing](#testing) |
| Authentication / user accounts | Not implemented (by design, anonymous) |
| Data-retention sweeper | Not implemented |
| CI / Docker / LICENSE | CI and Docker absent; LICENSE now included |

---

## Live deployment

| Target | URL |
| --- | --- |
| Web app (Vercel) | https://taxpri.vercel.app |
| API | Configured via `VITE_API_URL`; not pinned in the repository |

`web/public/llms.txt` documents the production origin and describes the tool for LLM crawlers.

---

## What it does

Cross-border workers must navigate multiple tax systems, reporting obligations, double-taxation relief, social-security coordination, remote-work rules, tax-residence criteria and country-specific documentation. The information exists but is fragmented across government websites, treaties and EU regulations.

TaxPri turns that into a single personalised report. Given a case such as *resident in Slovenia, employed by an Italian company, partly remote*, the engine identifies the applicable considerations and produces:

- **A situation summary** — the facts the analysis was based on.
- **Requirements** — what to check or verify, with a description and a concrete action, grouped by category and priority.
- **A document checklist** — which documents are required vs. optional, and why each is relevant.
- **Attention points** — the structural features of the case that drive complexity.
- **Official sources** — FURS, the Slovenia–Italy tax treaty, EU social-security regulations, with links and an `effectiveFrom` date.
- **A professional-review notice** — triggered when the case involves multiple work locations, employment across the border and remote work.
- **A downloadable PDF report** with the same content, laid out for printing or sharing with an advisor.

The system deliberately avoids stating conclusions such as *"you must pay X"*. Every requirement is phrased as an item to **verify**, and is traceable to the rule that produced it and the official source that justifies it.

---

## How it works

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │  questionnaire (single page, 10 fields)
       ▼
┌──────────────────────────┐
│   Web app (React + Vite) │
└──────┬───────────────────┘
       │  POST /api/consultation  { taxYear, answers }
       ▼
┌────────────────────────────────────────────────────────────┐
│                      API (Express 5)                       │
│                                                            │
│  Zod validation                                            │
│       ↓                                                    │
│  buildCaseContext(taxYear, answers)   →  CaseContext       │
│       ↓                                                    │
│  evaluateRules(caseContext)           →  RuleResult[]      │
│       ↓                                                    │
│  buildRequirements(ruleResults)       →  Requirement[]     │
│       ↓                                                    │
│  buildReport(context, results, reqs)  →  Report            │
│       ↓                                                    │
│  createConsultationRecord(...)        →  PostgreSQL row    │
└──────┬─────────────────────────────────────────────────────┘
       │  201 { consultation: { id, ... } }
       ▼
┌──────────────────────────┐        ┌──────────────────────────┐
│  Result dashboard        │        │  GET /:id/pdf            │
│  (requirements, sources) │───────▶│  pdf-lib → A4 PDF        │
└──────────────────────────┘        └──────────────────────────┘
```

The whole pipeline is **synchronous, deterministic and stateless**: the same answers and the same rule version always produce the same report. The rules engine calls no LLM, uses no randomness, and depends on none of Express, React, PostgreSQL or PDF generation.

---

## Repository layout

```
Cross-Border-Tax-Assistant/
├── README.md                    ← this file
├── LICENSE                      MIT
├── CONTRIBUTING.md              contribution guide
├── .gitignore                   ignores docs/ (see note below)
│
├── api/                         Express + Prisma backend
│   ├── package.json
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   ├── lib/
│   │   └── prisma.ts            PrismaClient + PrismaPg adapter
│   ├── prisma/
│   │   ├── schema.prisma        User, Consultation, ConsultationStatus
│   │   ├── migrations/          3 SQL migrations
│   │   └── seed/                consultation.seed.ts, user.seed.ts, index.ts
│   └── src/
│       ├── server.ts            bootstrap, GET /, listen
│       ├── handlers/
│       │   └── health.ts        GET /api/health
│       ├── shared/
│       │   ├── middleware/rateLimiters.ts
│       │   ├── types/           consultation.ts, user.ts
│       │   └── utils/express.ts app assembly, CORS, route mounts
│       └── modules/
│           ├── case-context/    answers.ts, case-builder.ts, types.ts
│           ├── rules/           engine.ts, types.ts, rules/ (9 rules)
│           ├── requirements/    registry.ts, service.ts, types.ts, requirements/ (12)
│           ├── sources/         registry.ts, types.ts, sources/ (4)
│           ├── reports/         report-builder.ts, types.ts
│           ├── consultation/    controller, service, repository, schema, types, tests
│           ├── users/           user.controller.ts, user.test.ts
│           └── pdf/             pdf.service.ts, fonts/*.ttf, images/logo.png
│
└── web/                         React + Vite frontend
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    ├── vercel.json              SPA rewrite config
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    ├── .oxlintrc.json
    ├── public/                  favicon.ico, icons.svg, robots.txt, llms.txt
    └── src/
        ├── main.tsx
        ├── App.tsx              routes
        ├── index.css            Tailwind v4 entry + theme tokens
        ├── assets/logo.png
        ├── components/          ConsultationForm, ResultConsultation, Header,
        │                        Footer, Loading, ServerStatus
        ├── pages/               Home, Result, PrivacyPolicy, NotFound
        ├── services/            api.ts, health.ts
        ├── types/               answers.ts
        └── interfaces/          consultation.ts
```

> **Note on `docs/`.** A detailed internal design document set (`01_product.md` … `08_architecture.md`) exists in the working tree but is **excluded from version control** — the repository root `.gitignore` ignores `docs/`. It is a design archive; this README is the published technical reference.

---

## Technology stack

### Backend — `api/`

| Concern | Technology | Version | Notes |
| --- | --- | --- | --- |
| Runtime | Node.js | 24.x tested | ESM (`"type": "module"`) |
| Language | TypeScript | ^7.0.2 | `strict: true` in the API project |
| HTTP framework | Express | ^5.2.1 | Express 5 router |
| Validation | Zod | ^4.4.3 | `safeParse` on the request body |
| ORM | Prisma | ^7.9.1 | `prisma-client` generator |
| DB driver | `@prisma/adapter-pg` + `pg` | ^7.9.1 / ^8.23.0 | Driver adapter, no Rust engine |
| Database | PostgreSQL | — | `JSONB` columns for domain blobs |
| PDF | `pdf-lib` + `@pdf-lib/fontkit` | ^1.17.1 / ^1.1.1 | Custom Google Sans TTFs |
| Rate limiting | `express-rate-limit` | ^8.7.0 | Three limiters |
| CORS | `cors` | ^2.8.6 | Wildcard |
| Body parsing | `body-parser` + `express.json` | ^2.3.0 | Both registered |
| Dev runner | `tsx` + `nodemon` | ^4.23.11 / ^3.1.14 | Type-stripping, no build step |
| Testing | Vitest + Supertest | ^4.1.10 / ^7.2.2 | HTTP-level tests |
| Env loading | `dotenv` | ^17.4.2 | Loaded in `server.ts`, `lib/prisma.ts`, `prisma.config.ts` |

Declared but **not used**: `pdfkit` (PDF is generated entirely with `pdf-lib`).

### Frontend — `web/`

| Concern | Technology | Version | Notes |
| --- | --- | --- | --- |
| UI library | React | ^19.2.8 | `StrictMode`, function components |
| Language | TypeScript | ~6.0.2 | `tsc -b` project references; **non-strict** |
| Build tool | Vite | ^8.2.0 | `@vitejs/plugin-react` |
| Routing | `react-router` | ^7.15.1 | `BrowserRouter`, 4 routes |
| Forms | `react-hook-form` | ^7.86.0 | No schema resolver |
| Styling | Tailwind CSS | ^4.3.3 | v4 CSS-first via `@tailwindcss/vite` |
| Icons | `lucide-react` | ^1.33.0 | Tree-shaken named imports |
| Linting | oxlint | ^1.75.0 | `npm run lint` |
| Hosting config | Vercel | — | SPA catch-all rewrite |

Declared but **not used**: `framer-motion` (no animation imports anywhere) and `daisyui` (the `@plugin` line in `index.css` is commented out). All motion in the app is hand-rolled with Tailwind transitions, `animate-spin` and inline `animation:` styles.

### Data and design conventions

| Aspect | Convention |
| --- | --- |
| Request payload fields | `snake_case` (`residence_country`, `remote_work`) |
| Response / domain fields | `camelCase` (`caseContext`, `taxYear`, `completedAt`) |
| Rule / requirement / source identifiers | `kebab-case` (`si-it-foreign-income`, `foreign-income-reporting`) |
| Primary key | `Consultation.id` is a UUID (`@default(uuid())`) |
| Consultation TTL | 30 days from creation (`expiresAt`) |

---

## Architecture

TaxPri is a **modular monolith** with two deployable units and one database. There are no microservices.

The layering principle is:

```
HTTP layer (Express routers, controllers)
    ↓
Application layer (consultation.service — orchestration)
    ↓
Domain layer (case-context, rules, requirements, sources, reports)
    ↓
Infrastructure (Prisma/PostgreSQL, pdf-lib, filesystem)
```

Key design decisions:

1. **The rules engine is the domain core.** `api/src/modules/rules/` imports nothing from Express, Prisma or `pdf/`. A rule is a pure predicate over a plain data object, which makes the legally significant part of the system trivially unit-testable and portable.
2. **The questionnaire never reaches the rules.** `buildCaseContext` is the only translation point between the wire format and the internal domain model. Rules consume `CaseContext`, not raw answers.
3. **Rule logic is separated from user-facing text.** Rules decide *what applies*; the requirement registry holds the titles, descriptions, actions, documents and sources. Multiple rules can point at the same requirement.
4. **Sources are referenced by ID, not URL.** Rules and requirements carry `sourceIds`; the source registry resolves them. This keeps URLs and metadata in one place and enables versioning.
5. **The frontend contains no tax logic.** It renders what the API returns. There is not a single `if (country === "IT")` tax decision in `web/`.
6. **The PDF layer knows nothing about tax.** `pdf.service.ts` receives a persisted consultation record and lays it out; it performs no domain computation.

### Consultation lifecycle

```
POST /api/consultation
   → row created with status COMPLETED, completedAt = now, expiresAt = now + 30 days
   → GET /api/consultation/:id            returns the full record (public to anyone with the UUID)
   → GET /api/consultation/:id/pdf        renders and streams the PDF
```

The `ConsultationStatus` enum declares `IN_PROGRESS`, `COMPLETED` and `EXPIRED`, but the repository currently writes **`COMPLETED`** immediately, and nothing ever transitions a record to `EXPIRED`. See [Known limitations](#known-limitations-and-technical-debt).

---

## Domain model

### CaseContext

The canonical internal representation of a user's situation. Defined in `api/src/modules/case-context/types.ts`; wire format (snake_case) in `answers.ts`; built by `case-builder.ts`.

```ts
type CountryCode = "SI" | "IT" | "AT" | "HR" | "OTHER";

type CaseContext = {
  taxYear: number;

  residenceCountry: CountryCode;
  taxResidenceCountry: CountryCode | "UNKNOWN";

  employerCountry: CountryCode;
  employmentType: "employee";
  employmentStartDate: string;

  workLocations: CountryCode[];
  workDaysSlovenia: number;
  workDaysItaly: number;

  remoteWork: "yes" | "no" | "partly";
  remoteWorkDays: number;

  otherWorkCountries: CountryCode[];

  multipleEmployers: boolean;
  propertyAbroad: boolean;

  otherIncome: boolean;
  otherIncomeTypes?: OtherIncomeType[];

  foreignTaxPaid: "yes" | "no" | "unknown";
  socialSecurityCountry: CountryCode | "UNKNOWN";

  permanentHomeSlovenia: boolean;
  permanentHomeItaly: boolean;

  daysInSlovenia: number;
  daysInItaly: number;
};
```

`buildCaseContext` is a pure 1:1 field mapping with no defaults, coercion or derived values. It hard-codes `employmentType: "employee"`.

### Rules

Defined in `api/src/modules/rules/types.ts`:

```ts
type Rule = {
  id: string;
  version: string;
  effectiveFrom: string;
  applies: (context: CaseContext) => boolean;
  requirementIds?: string[];
};

type RuleResult = {
  ruleId: string;
  triggered: boolean;
  requirementIds: string[];
};
```

Note that a `Rule` carries **no title, description, severity or priority** — priority lives on the requirement. Version and `effectiveFrom` are currently metadata only: the engine evaluates every registered rule regardless of tax year.

The engine is deliberately small (`engine.ts`, ~36 lines): it maps the ordered registry array to results, with no short-circuiting, filtering, scoring or sorting.

```ts
export function evaluateRules(caseContext: CaseContext): RuleResult[] {
  return rules.map((rule) => {
    const triggered = rule.applies(caseContext);
    return {
      ruleId: rule.id,
      triggered,
      requirementIds: triggered ? rule.requirementIds ?? [] : [],
    };
  });
}
```

All nine registered rules are `version: "1.0"`, `effectiveFrom: "2026-01-01"`.

| Rule ID | File | `applies()` when | Produces requirements |
| --- | --- | --- | --- |
| `si-it-foreign-income` | `rules/foreign-income.ts` | resident SI **and** employer IT **and** employee | `foreign-income-reporting`, `employment-documents` |
| `si-it-double-taxation` | `rules/double-taxation.ts` | resident SI **and** employer IT **and** employee | `double-taxation-review`, `foreign-tax-paid-verification`, `foreign-tax-documents` |
| `si-it-a1-certificate` | `rules/a1-certificate.ts` | employer IT **and** work locations include both SI and IT | `a1-certificate-review` |
| `si-it-social-security` | `rules/social-security.ts` | resident SI **and** employer IT **and** employee **and** more than one work location | `social-security-review` |
| `si-it-tax-residence` | `rules/tax-residence.ts` | resident SI **and** tax residence is known | `tax-residence-review` |
| `si-it-professional-review` | `rules/professional-review.ts` | resident SI **and** employer IT **and** >1 work location **and** `remoteWork !== "no"` | `tax-residence-professional-review` |
| `si-it-remote-work-tax` | `rules/remote-work-tax.ts` | resident SI **and** employer IT **and** `remoteWork !== "no"` **and** `remoteWorkDays > 0` | `remote-work-tax-review` |
| `si-it-remote-work-social-security` | `rules/remote-work-social-security.ts` | same as above | `remote-work-social-security-review` |
| `si-property-abroad` | `rules/property-abroad.ts` | resident SI **and** property abroad | `foreign-property-review` |

The only numeric thresholds anywhere in the engine are `remoteWorkDays > 0` and `workLocations.length > 1`. Rules `si-it-foreign-income` / `si-it-double-taxation` share an identical predicate and always fire together, as do the two remote-work rules.

### Requirements

Defined in `api/src/modules/requirements/types.ts`:

```ts
type RequirementCategory =
  | "tax_reporting" | "tax_payment" | "double_taxation"
  | "social_security" | "residence" | "documents" | "professional_review";

type RequirementPriority = "high" | "medium" | "low";
type RequirementStatus = "required" | "recommended" | "informational";

type Requirement = {
  id: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  status: RequirementStatus;
  title: string;
  description: string;
  action?: string;
  documents?: DocumentRequirement[];
  sourceIds: string[];
};

type DocumentRequirement = {
  id: string;
  name: string;
  purpose: string;
  required: boolean;
};
```

`buildRequirements` flattens the requirement IDs of every triggered rule and filters the registry by ID. Consequences: output order follows the **registry** (not the rules), duplicates are removed implicitly, and unknown requirement IDs are silently dropped. There is no priority sorting or filtering at this stage.

| Requirement ID | Category | Priority | Title |
| --- | --- | --- | --- |
| `foreign-income-reporting` | `tax_reporting` | high | Check foreign employment income reporting |
| `double-taxation-review` | `double_taxation` | high | Review double taxation |
| `foreign-tax-paid-verification` | `double_taxation` | high | Verify foreign taxes paid |
| `foreign-tax-documents` | `documents` | high | Provide foreign tax documents |
| `employment-documents` | `documents` | high | Provide employment documents |
| `social-security-review` | `social_security` | high | Review social security coverage |
| `a1-certificate-review` | `social_security` | high | Review A1 certificate requirements |
| `remote-work-tax-review` | `tax_reporting` | high | Review remote work tax implications |
| `remote-work-social-security-review` | `social_security` | high | Review remote work social security implications |
| `tax-residence-review` | `residence` | high | Review your tax residence |
| `tax-residence-professional-review` | `professional_review` | high | Obtain professional tax residence review |
| `foreign-property-review` | `tax_reporting` | medium | Review foreign property tax obligations |

All twelve are currently `status: "required"`; `"recommended"` and `"informational"` are declared but unused, as is the `tax_payment` category.

**Documents.** Requirements reference reusable document definitions, each with a name, a purpose and a required flag. The three documents currently marked required are `employment-contract`, `foreign-tax-certificate` and `residence-documentation`. Others include `payslips`, `annual-income-statement`, `italian-income-statement`, `italian-payslips`, `a1-certificate`, `remote-work-agreement`, `work-location-record`, `social-security-record`, `residence-documentation`, `physical-presence-record` and `permanent-home-documentation`. The report surfaces **required documents only**, deduplicated by name.

### Sources

Defined in `api/src/modules/sources/types.ts`. A source is official, dated and versionable.

```ts
type SourceType =
  | "tax_authority" | "tax_treaty" | "eu_regulation"
  | "legislation" | "official_guidance";

type Source = {
  id: string;
  country: "SI" | "IT" | "EU";
  type: SourceType;
  title: string;
  description?: string;
  authority: string;
  url?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
};
```

| Source ID | Country | Type | Authority | Effective from | Justifies |
| --- | --- | --- | --- | --- | --- |
| `source-furs-foreign-income` | SI | `tax_authority` | Finančna uprava Republike Slovenije (FURS) | 2026-01-01 | `foreign-income-reporting` |
| `source-si-it-tax-treaty` | SI | `tax_treaty` | Republic of Slovenia / Italian Republic | 2004-01-01 | `double-taxation-review`, `foreign-tax-paid-verification`, `remote-work-tax-review`, `tax-residence-review`, `tax-residence-professional-review` |
| `source-a1-certificate` | EU | `eu_regulation` | European Union | 2026-01-01 | `a1-certificate-review` |
| `source-eu-social-security` | EU | `eu_regulation` | European Union | 2026-01-01 | `social-security-review`, `remote-work-social-security-review` |

Resolution is a linear lookup (`getSourceById`) over an in-memory registry — no database round-trip, consistent with the principle that rules and sources are version-controlled code rather than runtime data. The tax-treaty source currently has no `url`.

### Report

Built by `reports/report-builder.ts`. The report is a presentation DTO — it performs no tax calculation.

```ts
type Report = {
  summary: string[];
  requirements: string[];      // requirement titles
  documents: string[];         // required document names
  attentionPoints: string[];
  professionalReview: { recommended: boolean; reason?: string };
  sources: any;                // populated with Source[]
};
```

- **`summary`** is assembled from the case context: residency in Slovenia, an Italian employer, physical work in both countries, and remote work from Slovenia.
- **`attentionPoints`** flags cross-border employment, physical work in multiple countries, and remote work from Slovenia.
- **`documents`** flattens the required documents of every requirement and deduplicates them.
- **`sources`** resolves and deduplicates (by `id`) the `sourceIds` referenced by the triggered requirements.
- **`professionalReview.recommended`** is true when `tax-residence-professional-review` is present; the `reason` is a fixed string.

Note that `buildReport` accepts `ruleResults` but does not read it — the parameter is currently unused. The `taxYear`, day counts, permanent-home flags, `foreignTaxPaid` and `otherIncome` from the case context are not reflected in the report.

---

## Backend deep dive (`api/`)

### Module map

| Module | Path | Responsibility |
| --- | --- | --- |
| `server` | `src/server.ts` | Loads env, registers `GET /`, starts listening on `PORT` (default 4000) |
| `shared/utils/express` | `src/shared/utils/express.ts` | Builds the Express app: `trust proxy`, global limiter, CORS, JSON parsers, route mounts |
| `shared/middleware` | `rateLimiters.ts` | Global, consultation-creation and PDF limiters |
| `handlers/health` | `src/handlers/health.ts` | `GET /api/health` with uptime, response time and an engine check |
| `case-context` | `src/modules/case-context/` | Wire-format answer contract → `CaseContext` |
| `rules` | `src/modules/rules/` | `Rule` contract, registry, pure evaluation engine, 9 rules |
| `requirements` | `src/modules/requirements/` | `Requirement` contract, catalogue of 12, ID-based resolution |
| `sources` | `src/modules/sources/` | `Source` contract, catalogue of 4, ID-based lookup |
| `reports` | `src/modules/reports/` | `Report` DTO and assembly from context + requirements |
| `consultation` | `src/modules/consultation/` | Zod schema, orchestration service, repository, HTTP controller |
| `users` | `src/modules/users/` | `POST /api/sign_up` (not part of the anonymous flow) |
| `pdf` | `src/modules/pdf/` | `pdf-lib` layout engine, embedded fonts and logo |

### The consultation pipeline

`src/modules/consultation/consultation.service.ts` is the single orchestration point of the domain:

```ts
export async function createConsultation(data: ConsultationInput) {
  const { taxYear, answers } = data;

  const caseContext: CaseContext   = buildCaseContext(taxYear, answers);
  const ruleResults: RuleResult[]  = evaluateRules(caseContext);
  const requirements: Requirement[] = buildRequirements(ruleResults);
  const report: Report             = buildReport(caseContext, ruleResults, requirements);

  return createConsultationRecord({
    taxYear, answers, caseContext, ruleResults, requirements, report,
  });
}
```

`createConsultationRecord` persists all five artefacts as `JSONB` and stamps the record:

```ts
const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

return prisma.consultation.create({
  data: { taxYear, answers, caseContext, ruleResults, requirements, report,
          expiresAt, status: "COMPLETED", completedAt: new Date() },
});
```

Persisting every intermediate artefact means a stored consultation is fully reproducible and auditable: it is possible to see the exact case context, rule results and requirements that produced a given report.

### API reference

Base URL: `http://localhost:4000` in development. All routes are mounted under `/api` except `GET /`.

| Method | Path | Middleware | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET` | `/` | global limiter | `200` `text/plain` `"Server is running ✅"` | — |
| `GET` | `/api/health` | — | `200` `{ status: "ok", timestamp, uptime, responseTime, checks }` with `Cache-Control: no-store` | `503` `status: "degraded"`; `500` `{ status: "error", timestamp }` |
| `POST` | `/api/consultation` | `consultationCreationLimiter` → Zod `safeParse` | `201` `{ consultation, msg: "Consultation created!", valid: true }` | `400` `{ valid: false, msg: "Invalid consultation data", errors }` |
| `GET` | `/api/consultation/:id` | — | `200` `{ consultation, msg: "Consultation found!", valid: true }` | `403` `{ msg: "Cannot found consultation", valid: false }` |
| `GET` | `/api/consultation/:id/pdf` | `pdfGenerationLimiter` | `200` `application/pdf` with `Content-Disposition: attachment; filename="consultation-<id>.pdf"` | `404` `{ msg: "Consultation not found", valid: false }` |
| `POST` | `/api/sign_up` | — | `201` `{ user, msg: "User created!", valid: true }` | `409` `{ msg: "Email already registered", valid: false }` |

> `GET /api/consultation/:id` returns **403**, not 404, when the record does not exist.

#### Create a consultation

```bash
curl -X POST http://localhost:4000/api/consultation \
  -H 'Content-Type: application/json' \
  -d '{
    "taxYear": 2025,
    "answers": {
      "residence_country": "SI",
      "tax_residence_country": "SI",
      "employer_country": "IT",
      "employment_type": "EMPLOYEE",
      "work_locations": ["SI", "IT"],
      "remote_work": true,
      "other_income": false,
      "other_employer": false,
      "property_abroad": false
    }
  }'
```

Response (`201`), abbreviated:

```json
{
  "valid": true,
  "msg": "Consultation created!",
  "consultation": {
    "id": "0d8a2d0f-5a87-4f7c-8633-13a298d9a9be",
    "status": "COMPLETED",
    "taxYear": 2025,
    "caseContext": {
      "taxYear": 2025,
      "residenceCountry": "SI",
      "taxResidenceCountry": "SI",
      "employerCountry": "IT",
      "employmentType": "employee",
      "workLocations": ["SI", "IT"],
      "remoteWork": true
    },
    "ruleResults": [
      { "ruleId": "si-it-foreign-income", "triggered": true,
        "requirementIds": ["foreign-income-reporting", "employment-documents"] }
    ],
    "requirements": [
      {
        "id": "foreign-income-reporting",
        "category": "tax_reporting",
        "priority": "high",
        "status": "required",
        "title": "Check foreign employment income reporting",
        "description": "Your situation involves employment income from an Italian employer while you live in Slovenia.",
        "action": "Verify how and where this income must be reported to the Slovenian tax authority.",
        "documents": [{ "id": "employment-contract", "name": "Employment contract",
                        "purpose": "May be needed to verify the employment relationship and employer.",
                        "required": true }],
        "sourceIds": ["source-furs-foreign-income"]
      }
    ],
    "report": {
      "summary": ["You are resident in Slovenia.", "Your employer is based in Italy.",
                  "You physically work in both Slovenia and Italy."],
      "requirements": ["Check foreign employment income reporting"],
      "documents": ["Employment contract"],
      "attentionPoints": ["Cross-border employment", "Physical work in multiple countries"],
      "professionalReview": { "recommended": true,
        "reason": "The case involves cross-border employment and multiple work locations." },
      "sources": [{ "id": "source-furs-foreign-income", "country": "SI",
                    "type": "tax_authority", "title": "Foreign employment income reporting",
                    "authority": "Finančna uprava Republike Slovenije (FURS)",
                    "url": "https://www.fu.gov.si/", "effectiveFrom": "2026-01-01" }]
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "completedAt": "2026-01-01T00:00:00.000Z",
    "expiresAt": "2026-01-31T00:00:00.000Z"
  }
}
```

#### Fetch and download

```bash
curl http://localhost:4000/api/consultation/<id>
curl -OJ http://localhost:4000/api/consultation/<id>/pdf
```

#### Health check

```bash
curl http://localhost:4000/api/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptime": 1234.56,
  "responseTime": 1,
  "checks": { "engine": { "status": "ok" } }
}
```

### Input validation

`POST /api/consultation` validates its body with Zod before anything else runs (`consultation.schema.ts`):

```ts
export const createConsultationSchema = z.object({
  taxYear: z.number().int().min(2000).max(2100),
  answers: z.object({
    residence_country:     z.enum(["SI", "IT", "AT", "HR", "OTHER"]),
    tax_residence_country: z.enum(["SI", "IT", "AT", "HR", "OTHER"]),
    employer_country:      z.enum(["SI", "IT", "AT", "HR", "OTHER"]),
    employment_type:       z.enum(["EMPLOYEE"]),
    work_locations:        z.array(z.enum(["SI", "IT", "AT", "HR", "OTHER"])),
    remote_work:           z.boolean(),
    other_income:          z.boolean(),
    other_employer:        z.boolean(),
    property_abroad:       z.boolean(),
  }),
});
```

On failure the API responds `400` with the Zod error message. Zod strips unknown keys by default — an important behaviour given that the schema is narrower than the internal `ConsultationAnswers` contract. See [Known limitations](#known-limitations-and-technical-debt).

`POST /api/sign_up` performs no schema validation at all.

### Rate limiting

Three `express-rate-limit` v8 limiters, keyed by client IP (`trust proxy` is set to `1`), with `standardHeaders: 'draft-7'` and legacy headers disabled:

| Limiter | Scope | Window | Limit | Body on `429` |
| --- | --- | --- | --- | --- |
| `globalLimiter` | every request (skips `OPTIONS`) | 15 minutes | 200 | `{ error: "Too many requests. Please try again later.", retryAfter: "15 minutes" }` |
| `consultationCreationLimiter` | `POST /api/consultation` | 5 hours | 10 | `{ error: "Too many consultations created. Please wait before starting a new one.", retryAfter: "5 hours" }` |
| `pdfGenerationLimiter` | `GET /api/consultation/:id/pdf` | 5 hours | 3 | `{ error: "PDF generation limit reached. Please wait before requesting another PDF.", retryAfter: "5 hours" }` |

There is no shared store configured, so counters live in the process memory: limits reset on restart and are **not** shared across horizontally scaled instances. The frontend has a dedicated UI path for the PDF `429` case.

### PDF generation

`src/modules/pdf/pdf.service.ts` (~820 lines) is a hand-written layout engine on top of `pdf-lib`. It exports a single function:

```ts
export async function generateConsultationPdf(
  consultation: any,
  outputPath: string
): Promise<void>
```

It reads the persisted record directly, writes the file with `fs.writeFileSync`, and returns nothing. The controller then streams it with `res.sendFile`.

**Typography and assets.** Custom TTFs (`GoogleSans-Regular.ttf`, `GoogleSans-Bold.ttf`, ~2 MB each) are embedded with `subset: false`, with a `Helvetica` fallback if the files are missing. The logo (`images/logo.png`) is embedded via `embedPng` inside a silent `try/catch`, so it is optional. Paths are resolved from `import.meta.url`, which means the font and image files must ship with the built API.

**Layout.** A4 (`595.28 × 841.89` pt), 40 pt margins, 515.28 pt content width. The renderer is a top-down cursor with `newPage()` and `ensureSpace()` helpers, plus primitives for full and dashed rules, monospaced micro-labels, section title bands, bordered badges, greedy word wrapping and paragraph drawing. The palette is black / yellow (`rgb(0.99, 0.88, 0.28)`) / neutral greys / red.

**Structure.** The document flows as: yellow top strip → header (logo, wordmark, status badge, short ID, tax year) → `01 Your Situation` (three-column summary) → `02 Summary` → `03 Requirements (n)` (grouped by category, with priority badges, descriptions, actions and required-document boxes) → `04 Documents` (with `REQUIRED` / `OPTIONAL` badges) → `05 Reports` (requirement list + attention-points panel) → `06 Sources` (title, authority, description, type/country/effective badges, URL) → professional-review notice when recommended → footer with generation date and full consultation ID.

Two details worth knowing: the category label map in the PDF omits `social_security` and `professional_review`, so those headers render the raw enum value; and the remote-work cell uses truthiness (`ctx.remoteWork ? 'Yes' : 'No'`), so the string `"no"` would render as "Yes".

---

## Database

PostgreSQL accessed through Prisma 7 with the `PrismaPg` driver adapter (`api/lib/prisma.ts`). The client is generated to `api/generated/prisma`, which is **gitignored** — run `prisma generate` after cloning.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ConsultationStatus {
  IN_PROGRESS
  COMPLETED
  EXPIRED
}

model Consultation {
  id           String             @id @default(uuid())
  status       ConsultationStatus @default(IN_PROGRESS)
  taxYear      Int

  answers      Json
  caseContext  Json?
  ruleResults  Json?
  requirements Json?
  report       Json?

  createdAt    DateTime  @default(now())
  completedAt  DateTime?
  expiresAt    DateTime?

  @@index([status])
  @@index([expiresAt])
}
```

Design notes:

- The datasource has **no `url`** in the schema; it comes from `DATABASE_URL` via `prisma.config.ts` (`env("DATABASE_URL")`). This is the Prisma 7 configuration style.
- All five domain artefacts are stored as `JSONB`. This preserves full reproducibility but means the database cannot query into requirements or reports.
- `User` and `Consultation` have **no relation**: consultations are anonymous and there is no `userId` column.
- `@@index([status])` and `@@index([expiresAt])` anticipate a retention/expiry sweep that is not yet implemented.

**Migrations** (`api/prisma/migrations/`):

| Migration | Contents |
| --- | --- |
| `20260810061932_init` | `User` table (`SERIAL` PK, unique email) |
| `20260810081207_add_timestamps_to_user` | adds `createdAt` / `updatedAt` to `User` |
| `20260810113942_create_consultation` | `ConsultationStatus` enum and `Consultation` table with both indexes |

**Seeding.** `npm run seed` runs `prisma/seed/index.ts`, which calls **only** `seedConsultations()`. `user.seed.ts` is a standalone script that must be run manually. Be aware that `consultation.seed.ts` still contains a **pre-refactor JSON shape** (boolean `remote_work`, rule IDs such as `tax-residence` / `remote-work` that no longer exist, and `report.sources` as an array of strings rather than `Source` objects), so seeded rows do not match the current domain model.

---

## Frontend deep dive (`web/`)

A single-page React 19 application built with Vite 8 and styled with Tailwind CSS v4. There is no global state manager, no data-fetching library and no server-side rendering.

### Routing

`react-router` v7 with `BrowserRouter` (HTML5 history), declared once in `src/App.tsx`:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/result/:consultationId" element={<Result />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

- Three real routes plus a wildcard 404.
- No lazy loading, no `Suspense`, no nested layout routes, no route loaders, no error boundary — every page is a static import in a single bundle.
- `Result.tsx` renders the `NotFound` component directly when the `:consultationId` param fails a local UUID regex, when the request errors, or when the payload has no `consultation` field.
- The questionnaire is **not** a route: it is rendered inline inside `Home`, which switches between the landing page, the form and the result view through local state.
- Deep links work in production because `vercel.json` rewrites every path to `/index.html`.

Navigation uses `useNavigate` (form and header), `useParams` (result page), `<Link>` (404) and plain `<a href>` for in-page anchors and the privacy link.

### Component tree

```
main.tsx (StrictMode)
└── App.tsx (BrowserRouter)
    ├── Home  "/"
    │   ├── Header        showNav, mobileMenu
    │   ├── hero section  "[ 01 / Hero ]" — headline, trust list
    │   ├── #consultation-form → ConsultationForm
    │   ├── #how-it-works section  — 3 steps
    │   ├── #benefits section      — 4 benefits
    │   ├── CTA section
    │   └── Footer → ServerStatus
    ├── Result  "/result/:consultationId"
    │   ├── Loading (while fetching) / NotFound (invalid or missing)
    │   ├── Header        showBackToHome
    │   ├── ResultConsultation
    │   └── Footer
    ├── PrivacyPolicy  "/privacy"
    │   ├── Header · long-form static legal content · Footer
    └── NotFound  "*"  — 404 page, no header/footer
```

| Component | Responsibility |
| --- | --- |
| `Header` | Fixed top nav; logo, wordmark, anchor links (`#how-it-works`, `#benefits`, `#consultation-form`), back-to-home button, mobile hamburger menu |
| `Footer` | Black footer with logo, privacy link, `ServerStatus` indicator and the disclaimer |
| `ServerStatus` | Polls `GET /api/health` **once per hour**, shows a coloured dot and a hover tooltip with status, uptime, response time, engine check and last-checked time |
| `Loading` | Full-screen overlay with cycling status text, animated blocks and a progress bar; used during submission and result fetching |
| `ConsultationForm` | The questionnaire (see below) |
| `ResultConsultation` | The result dashboard: status badge, "Your Situation" card, executive summary, requirements grouped by category with priority badges and required documents, reference sources, professional-review notice and PDF download button |
| `Home` | Landing page plus the local switch between form and result views |
| `Result` | Fetches the consultation, validates the UUID param, and delegates rendering |
| `NotFound` | Static 404 page |
| `PrivacyPolicy` | Long-form static privacy policy (sections 01–09 plus a final disclaimer); no data fetching |

`ResultConsultation` is typed with `ResultDashboardProps { result: ConsultationResult; onReset?: () => void }`, but the payload originates as `any` from the API layer, so it defensively uses optional chaining throughout.

### The questionnaire

`ConsultationForm.tsx` is a **single-page form**, not a multi-step wizard. It contains five `<section>` blocks inside one `<form>`, with no step index, no next/back buttons and no progress bar.

State is handled by `react-hook-form` v7 (`useForm<ConsultationAnswers>`) plus local `useState` for `isSubmitting`, `submitted`, `submitError` and `acceptedPolicy`.

**Fields, in DOM order:**

| # | Section | Label | Field | Input | Options |
| --- | --- | --- | --- | --- | --- |
| 1 | Tax Year | Tax Year | `taxYear` | select | 2025, 2024, 2023 (plus a placeholder) |
| 2 | Residence Information | Country of Residence | `answers.residence_country` | select | SI, IT selectable; AT, HR, OTHER disabled |
| 3 | Residence Information | Tax Residence Country | `answers.tax_residence_country` | select | same |
| 4 | Employment Information | Employer Country | `answers.employer_country` | select | same |
| 5 | Employment Information | Employment Type | `answers.employment_type` | select | `EMPLOYEE` only |
| 6 | Work Locations | (country tiles) | `answers.work_locations` | checkbox group (multi-select) | SI, IT selectable; AT, HR, OTHER disabled |
| 7 | Other Information | Remote work | `answers.remote_work` | checkbox | — |
| 8 | Other Information | Other income | `answers.other_income` | checkbox | — |
| 9 | Other Information | Other employer | `answers.other_employer` | checkbox | — |
| 10 | Other Information | Property abroad | `answers.property_abroad` | checkbox | — |

Defaults are `SI` residence, `SI` tax residence, `SI` employer, `EMPLOYEE`, work locations `["SI"]` and all four booleans `false`; the tax year defaults to the current calendar year.

**Validation.** Only `required` rules (plus `valueAsNumber` for the tax year) are configured, on fields 1–4. Fields 5–10 have no validation. Errors render as an uppercase micro-label with an alert icon, and invalid country/tax-year selects get a red border.

**Consent.** A separate, non-react-hook-form checkbox gates submission: the submit button is disabled until it is checked, and `onSubmit` returns early otherwise. Its label reads *"I have read and agree to the Privacy Policy. I understand this is an autonomous consultation tool and not tax advice."*

**Submission flow.** `createConsultation(data)` → read `response.consultation.id` → show the loading overlay → after 3 seconds navigate to `/result/<id>`. Errors surface in a red block above the submit button. `data` is posted verbatim with no transformation, so the `snake_case` wire format is produced directly by the form field names.

### API integration

`src/services/api.ts` centralizes the three consultation calls over native `fetch` (no axios). The base URL is derived from a single env var:

```ts
const url = `${import.meta.env.VITE_API_URL}/api/consultation`;
```

| Function | Method | Endpoint | Notes |
| --- | --- | --- | --- |
| `createConsultation(data)` | `POST` | `/api/consultation` | JSON body; returns `response.consultation` to the caller |
| `getConsultation(id)` | `GET` | `/api/consultation/:id` | used by the result page |
| `downloadConsultationPdf(id)` | `GET` | `/api/consultation/:id/pdf` | fetches a blob, creates an object URL and triggers a download named `consultation-<id>.pdf` |

Error handling reads `msg` or `error` from the JSON body and throws a plain `Error`; the PDF function has a dedicated branch for `429` rate limiting that appends `(retry in <retryAfter>)` when the API supplies it. Only `checkServerHealth` in `services/health.ts` implements a timeout (8 s with `AbortController`); the three consultation calls have none.

Because there is **no Vite dev proxy**, the browser calls the API cross-origin and relies on the backend's wildcard CORS. No credentials, cookies, tokens or `localStorage` are involved anywhere.

### Design system

The visual language is deliberately **neo-brutalist / editorial**: 2 px black borders on every surface, hard black section dividers, square corners, uppercase `tracking-widest` micro-labels, numbered section markers such as `[ 01 / Hero ]` and `/[01]`, and a strict black / white / yellow palette that inverts on hover (`hover:bg-yellow-300`).

- **Tailwind v4, CSS-first.** `src/index.css` starts with `@import "tailwindcss";` and defines theme tokens in an `@theme` block — there is no `tailwind.config.js`.
- **Fonts.** `--font-sans` is set to **Space Grotesk** (loaded from Google Fonts); `--font-mono` names JetBrains Mono, which is never loaded.
- **Icons.** `lucide-react` named imports only, sized with Tailwind utility classes.
- **Responsive.** Breakpoints `sm` / `md` / `lg`; grids collapse to a single column on mobile, the header links hide behind a hamburger below `md`, and the hero scales from `text-5xl` to `text-8xl`.
- **No dark mode** (`dark:` variants are absent) and no analytics or tracking scripts.

---

## Configuration

### Environment variables

**`api/.env`** (gitignored — never commit real values)

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `postgresql://user:pass@localhost:5432/Cross-Border-Tax-Assistant` | PostgreSQL connection string, read by `lib/prisma.ts` and `prisma.config.ts` |
| `PORT` | no | `4000` | HTTP port; defaults to `4000` |

**`web/.env`** (gitignored)

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | yes | `http://localhost:4000` | Base URL of the API; no trailing slash, no `/api` suffix |

There is currently **no `.env.example`** in either package. When setting up the project, create both files by hand. Note also that `DATABASE_URL` is consumed by Prisma at the **repository root of `api/`** — run Prisma commands from inside `api/`.

### Other configuration files

| File | Purpose |
| --- | --- |
| `api/prisma.config.ts` | Points Prisma at the schema, migrations directory and `DATABASE_URL` |
| `api/tsconfig.json` | ESM, `moduleResolution: bundler`, `target: ES2023`, `strict: true` |
| `web/vite.config.ts` | React + Tailwind plugins; `server.allowedHosts: true`; no dev proxy |
| `web/tsconfig*.json` | Solution-style project references; `tsc -b` used in the build; strict mode **not** enabled |
| `web/.oxlintrc.json` | oxlint with the react, typescript and oxc plugins |
| `web/vercel.json` | SPA catch-all rewrite to `/index.html`; no custom headers |

---

## Getting started

### Prerequisites

- **Node.js 20+** (Node 24 was used during development)
- **PostgreSQL 14+** running locally, or a hosted Postgres instance
- npm (a lockfile is committed for `web/`; `api/` intentionally gitignores its lockfile)

### 1. Clone

```bash
git clone https://github.com/rafaelmerlotto/Cross-Border-Tax-Assistant.git
cd Cross-Border-Tax-Assistant
```

### 2. Set up the API

```bash
cd api
npm install          # also runs prisma generate via the postinstall-less flow; run it explicitly if needed
npx prisma generate  # generates the client into api/generated/prisma (gitignored)
```

Create `api/.env`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxpri"
PORT=4000
```

Create the database schema and optionally seed it:

```bash
npx prisma migrate dev     # applies the three migrations
npm run seed               # optional: inserts a demo consultation
```

Start the API:

```bash
npm run dev                # nodemon + tsx, restarts on change
# or
npm start                  # single run, no watcher
```

The API is now at `http://localhost:4000`; verify with `curl http://localhost:4000/api/health`.

### 3. Set up the web app

In a second terminal:

```bash
cd web
npm install
```

Create `web/.env`:

```dotenv
VITE_API_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev                # Vite, default port 5173
```

Open `http://localhost:5173`, complete the questionnaire and you will be redirected to `/result/<id>` with the generated report.

### 4. Production build

```bash
cd web && npm run build    # tsc -b && vite build → dist/
cd ../api && npm start     # or run under a process manager
```

Remember that `api/tmp/` must be writable at runtime: the PDF service writes `tmp/consultation-<id>.pdf` relative to the process working directory before streaming it.

---

## Testing

Testing setup lives in the API package only.

```bash
cd api
npm test          # vitest in watch mode
npm run test:run  # single run, suitable for CI
```

Vitest with Supertest drives the Express app in-process via `request(server)`.

Coverage today is **minimal and partly incorrect**, and this is the highest-value area for contribution:

| Test file | What it covers | Notes |
| --- | --- | --- |
| `src/modules/users/user.test.ts` | `POST /api/sign_up` — `201` on creation, `409` on duplicate email | Cleans up the test user in `afterEach` |
| `src/modules/consultation/consultation.test.ts` | Asserts `201` | **Bug:** it POSTs to `/api/sign_up`, not `/api/consultation`, so the consultation pipeline is not actually exercised |
| `src/modules/consultation/consultation.mock.test.ts` | Fixtures only: `answersMock`, `caseContextMock`, `ruleResultsMock`, `requirementsMock`, `reportMock` | No assertions; used as shared test data |

The domain modules — `evaluateRules`, `buildCaseContext`, `buildRequirements`, `buildReport` — are pure functions with no I/O and are therefore ideal for unit testing, but currently have **no direct test coverage at all**. The frontend has no test script and no test files.

---

## Scripts reference

### `api/`

| Script | Command | Purpose |
| --- | --- | --- |
| `npm run dev` | `nodemon --exec tsx src/server.ts` | Development server with restart-on-change |
| `npm start` | `tsx src/server.ts` | Run the server directly (type-stripping, no build) |
| `npm test` | `vitest` | Watch-mode tests |
| `npm run test:run` | `vitest run` | Single test run |
| `npm run seed` | `tsx prisma/seed/index.ts` | Seed a demo consultation |

Prisma commands are run directly (`npx prisma generate | migrate dev | migrate deploy | studio`).

Note there is **no build script** in `api/`: `tsx` strips types at runtime and no compilation step is configured for deployment.

### `web/`

| Script | Command | Purpose |
| --- | --- | --- |
| `npm run dev` | `vite` | Dev server on port 5173 with HMR |
| `npm run build` | `tsc -b && vite build` | Type-check the project references, then bundle to `dist/` |
| `npm run lint` | `oxlint` | Static analysis (not part of the build) |
| `npm run preview` | `vite preview` | Serve the production build locally |

---

## Deployment

### Frontend → Vercel

The `web/` directory is a standard Vite app deployable to Vercel as-is. `vercel.json` supplies the build command, the output directory and the SPA rewrite:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set `VITE_API_URL` in the Vercel project environment to the public API URL, otherwise the bundle will call `undefined/api/consultation`. The production deployment is https://taxpri.vercel.app.

There is no `headers` block, so no CSP, HSTS or cache-control headers are configured at the edge.

### Backend → any Node host

The API is a long-running Express process. It needs:

1. `DATABASE_URL` and `PORT` in the environment.
2. `npx prisma migrate deploy` at deploy time.
3. A **writable `tmp/` directory** in the process working directory for PDF output.
4. `npx prisma generate` before start, since the generated client is gitignored.

There is currently no `Dockerfile`, no `docker-compose.yml`, no CI workflow and no build step — a container image would need to install dependencies, run `prisma generate`, and start `tsx src/server.ts`.

Note that `api/.gitignore` ignores `package-lock.json`, so API dependency resolution is not reproducible; committing a lockfile is a recommended first change for production use.

---

## Security, privacy and data retention

The application handles potentially sensitive financial and employment information, and it collects **no accounts, no logins, no cookies and no third-party analytics**. What is in place today:

| Control | Status |
| --- | --- |
| HTTPS | Provided by the hosting platform (Vercel / API host) |
| Input validation | Zod on `POST /api/consultation`; none on `POST /api/sign_up` |
| Rate limiting | Three IP-based limiters (200/15 min, 10/5 h, 3/5 h) |
| CORS | Wildcard (`cors()` with no options) |
| `trust proxy` | Set to `1` so limiters see the real client IP behind a proxy |
| Privacy policy | Published at `/privacy` with a consent checkbox before submission |
| Minimal collection | Only the ten questionnaire fields are collected |
| Data retention | `expiresAt` is set to 30 days, but **nothing deletes expired rows** |
| Encryption at rest | Deployment-dependent; not configured in the application |
| Secure headers | Not implemented (no `helmet`, no CSP/HSTS in `vercel.json`) |
| Secrets in VCS | `.env` files are gitignored in both packages |

**Access model.** A consultation is identified only by its UUID. Anyone who holds the URL — including the result link — can retrieve the full consultation with `GET /api/consultation/:id`. There is no ownership check, no signed link and no expiry enforcement at read time. Treat consultation IDs as bearer secrets.

**Recommended before production:** add secure headers, enforce `expiresAt` on read, implement a retention sweep (the `status` and `expiresAt` indexes already anticipate it), replace wildcard CORS with an allow-list of known origins, commit lockfiles, and validate `POST /api/sign_up` or remove the endpoint (it is not used by the anonymous flow).

---

## Known limitations and technical debt

This section is intentionally explicit. The project is an MVP and several parts are still inconsistent; anyone evaluating or contributing to the codebase should know exactly where it stands. All items below were verified against the source.

### Contract and type mismatches

1. **The Zod schema is much narrower than the internal answer contract.** `createConsultationSchema` accepts 10 fields, while `ConsultationAnswers` / `CaseContext` declare 22. Because Zod strips unknown keys and the controller spreads `...result.data` last, fields such as `employment_start_date`, `work_days_slovenia`, `work_days_italy`, `remote_work_days`, `other_work_countries`, `multiple_employers`, `foreign_tax_paid`, `social_security_country`, `permanent_home_*` and `days_in_*` arrive as `undefined` over HTTP.
2. **As a consequence, two rules can never trigger via the API.** `si-it-remote-work-tax` and `si-it-remote-work-social-security` both require `remoteWorkDays > 0`, which is always `false` when the value is `undefined`.
3. **`remoteWork` is typed as both a boolean and a string union.** The schema and the form send `true` / `false`; `CaseContext.remoteWork` is typed `"yes" | "no" | "partly"`. Rules such as `remoteWork !== "no"` are therefore always true, and the report's `remoteWork === "yes" || remoteWork === "partly"` checks never match — so the remote-work summary line and attention point never appear.
4. **`other_employer` is accepted but dropped.** It exists in the schema, the form and the frontend types, but not in `ConsultationAnswers` or `CaseContext`, so `buildCaseContext` ignores it.
5. **`employment_type` case mismatch.** The wire value is `"EMPLOYEE"`; the domain value is `"employee"`, hard-coded by the case builder rather than derived.
6. **`tax_residence_country` can never be `"UNKNOWN"`** over HTTP, although `CaseContext` allows it and `si-it-tax-residence` tests for it — so that rule is effectively always true for Slovenian residents.

### API behaviour

7. **`GET /api/consultation/:id` returns `403`, not `404`**, with the message `"Cannot found consultation"`.
8. **The PDF endpoint has no error handling.** A failure inside `generateConsultationPdf` is not caught and becomes an unhandled rejection rather than a structured error response.
9. **`tmp/` PDFs are never cleaned up**, and the endpoint regenerates the file on every request even if it already exists.
10. **Rate-limit state is per-process and in-memory** — not shared across instances and reset on restart.
11. **`POST /api/sign_up` has no validation** and is unrelated to the anonymous consultation flow.

### Pipeline and data

12. **`status` is hard-coded to `COMPLETED`** at creation, so `IN_PROGRESS` is never written. **`EXPIRED` is never written either** and no retention job exists.
13. **`buildReport` does not use its `ruleResults` parameter.** Rule results are persisted but not consumed by report assembly.
14. **Report content ignores much of the case context**: `taxYear`, day counts, `daysIn*`, `permanentHome*`, `foreignTaxPaid` and `otherIncome` influence nothing in the report.
15. **Priority and status are not surfaced in the report DTO** — requirement priority is only rendered in the PDF requirement badges and in the web dashboard badges.
16. **`report.professionalReview.reason` is generated but never rendered** in either the PDF or the web UI, which uses fixed copy.
17. **PDF category labels are incomplete**: `social_security` and `professional_review` are missing from the label map and fall back to the raw enum value.
18. **The PDF remote-work cell uses truthiness**, so a string `"no"` would render as "Yes".
19. **`consultation.seed.ts` writes a stale pre-refactor shape** (boolean `remote_work`, non-existent rule IDs such as `tax-residence` and `remote-work`, string-array `report.sources`, uppercase priority/status), so seeded data does not match the current model. `user.seed.ts` is never invoked by the seed entry point.
20. **The tax-treaty source has no `url`**, so the most-cited source in the catalogue is not linkable.

### Types and tooling

21. **Duplicated type definitions**: `RuleResult` is declared in both `rules/types.ts` and `reports/types.ts`; `shared/types/{user,consultation}.ts` declare `User` and `Consultation` **without `export`**, and `user.controller.ts` uses `User` without importing it (a TypeScript error that `tsx` masks at runtime).
22. **`Report.sources` is typed `any`** while actually holding `Source[]`.
23. **`CreateConsultationData` and `ConsultationInput` use `any`** for all five persisted artefacts.
24. **`api/tsconfig.json` excludes real code**: its second `include` entry (`prisma/config.ts`) does not exist, so `lib/prisma.ts` and `prisma/seed/**` fall outside the TypeScript program.
25. **The web app is not in strict mode** (`strict` is absent from both web tsconfigs), which is why `any` payloads and `catch (error: any)` compile.
26. **Frontend error status handling is dead code**: `Result.tsx` checks `err?.status === 404`, but `services/api.ts` throws plain `Error` objects without a `status`, so a missing consultation never renders the `NotFound` page.
27. **`defaultValues.taxYear = new Date().getFullYear()`** does not match any rendered `<option>` (only 2025, 2024, 2023 are listed), so the default year cannot be displayed.
28. **`work_locations` has no validation**, so the form can be submitted with zero work locations.

### Dead code and unused dependencies

29. **Unused dependencies**: `pdfkit` (API), `framer-motion` and `daisyui` (web — the daisyUI plugin line is commented out).
30. **Unused code**: `OtherIncomeType` types on both sides, `Home`'s `mobileMenuOpen` state and `handleConsultationComplete`, `isFadingOut` in both `ConsultationForm` and `Loading`, the `.page-fade-out` CSS rule, and `public/icons.svg`.
31. **`bg-mist-50` is not a Tailwind v4 color** and no `--color-mist-*` token is defined, so those two class usages in `Result.tsx` emit no CSS.
32. **Accessibility gaps**: form labels are not associated with their selects (no `htmlFor`/`id`), the header logo is a non-focusable `onClick` on an `<img>`, the `ServerStatus` tooltip is mouse-only, and there are no `aria-live` regions for async state.

### Missing project infrastructure

33. **No CI** (no `.github/workflows`), **no Dockerfile**, **no `.env.example`**, **no `engines` field**, and **no lockfile committed for the API package**.
34. **Tests do not cover the domain**, and the one consultation test targets the wrong endpoint.

---

## Roadmap

Short-term, in rough priority order:

1. **Align the Zod schema with `ConsultationAnswers`** so the day-count, permanent-home and remote-work-days signals actually reach the rules engine; unify `remoteWork` on a single representation.
2. **Add unit tests for the pure domain**: `buildCaseContext`, `evaluateRules` (per rule, positive and negative cases), `buildRequirements`, `buildReport`. These functions need no database or HTTP.
3. **Fix the consultation test** to POST to `/api/consultation` and assert the pipeline output.
4. **Add a real end-to-end test** covering `POST → GET → GET /pdf`.
5. **Consistent error contract**: return `404` for a missing consultation, wrap the PDF handler, and standardize error bodies.
6. **Implement data retention**: enforce `expiresAt` on read and add a sweep using the existing `expiresAt` index.
7. **Harden**: secure headers, CORS allow-list, optional request-size limits, validated or removed `sign_up`.
8. **Refresh the seed data** to the current domain shape, and fix the tax-treaty source URL.
9. **Project hygiene**: LICENSE (done), CONTRIBUTING (done), `.env.example` files, a committed API lockfile, and a GitHub Actions workflow running lint, type-check, tests and the web build.
10. **Remove dead code and unused dependencies** listed above.

Medium-term:

- **Tax-year versioning of rules.** `Rule.version` and `effectiveFrom` exist but are not enforced; the engine should select the rule set matching the consultation's `taxYear` so historical reports stay stable.
- **Multi-country support.** The country enums already include `AT`, `HR` and `OTHER`, but every rule is hard-coded to the `SI ↔ IT` corridor. Extracting a country-pair abstraction is the natural next step.
- **Frontend hardening**: code splitting per route, strict TypeScript, a shared type package between `api/` and `web/` to prevent contract drift, form accessibility fixes, and richer SEO metadata.
- **PDF refinement**: font subsetting to shrink output, temp-file cleanup, and category labels driven by a single shared source of truth.

Long-term:

- Additional corridors (Slovenia ↔ Austria, Slovenia ↔ Croatia, and beyond) on the same engine.
- A rule-authoring workflow with explicit review of legal sources and effective dates.
- Optional export of the report into formats useful to an advisor.

---

## Contributing

Contributions are welcome — new rules, new country corridors, tests, documentation and bug fixes. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, coding conventions and the checklist for adding a rule.

The most valuable contributions right now are the ones in the [Roadmap](#roadmap): domain unit tests, schema alignment, and the missing project infrastructure.

A few ground rules:

- The rules engine must stay **pure and deterministic** — no network calls, no LLMs, no randomness, no dependency on Express, Prisma or React.
- Rules decide *what applies*; the requirement registry owns *what the user reads*. Keep the separation.
- Every new requirement that makes a legal claim should reference at least one official `sourceId`.
- Never commit `.env` files or real credentials.

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for the full text.

---

## Disclaimer

TaxPri is an autonomous consultation tool that provides **general informational orientation** based on information supplied by the user.

It is **not** a tax return, a legal opinion, or a substitute for professional tax advice. Cross-border tax and social-security obligations depend on individual circumstances and on legislation that changes over time. The rules implemented here cover a limited set of scenarios in the Slovenia ↔ Italy corridor and are deliberately phrased as items to verify rather than as conclusions.

Always confirm important or complex situations with the relevant tax authority (for example, FURS in Slovenia) or a qualified professional.

---

## Acknowledgements

Built by [OnceStack](https://github.com/rafaelmerlotto). The rules and requirements reference official material from Finančna uprava Republike Slovenije (FURS), the European Union, and the Slovenia–Italy bilateral tax treaty.


