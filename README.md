# ABA Medical Necessity Calculator

A dual-tenant, web-based decision support system for **Applied Behavior Analysis (ABA) therapy** dosage determination. The application assists two key stakeholders in the ABA authorization process:

- **Provider Clinics** — Perform standardized clinical assessments, calculate recommended therapy hours using an evidence-based algorithm, and submit authorization claims.
- **Insurance Payers** — Review submitted claims against configurable policy parameters, make approval/denial decisions, and maintain audit trails.

> **Note:** This is a **demo prototype** built for demonstration and stakeholder review purposes. Authentication is simulated (role selection) and data is seeded for showcase.

---

## What Problem Does This Solve?

Determining the appropriate number of ABA therapy hours for a patient involves synthesizing data from multiple clinical instruments (FII, Vineland, VB-MAPP), behavioral observations, environmental factors, and patient demographics. This process is manual, inconsistent, and opaque.

This tool **standardizes** that process through a transparent, reproducible **7-step dosage calculation engine** that both clinics and insurers can trust. It also includes a **simulated ML predictor** that estimates claim approval probability, helping clinics submit stronger documentation.

---

## Key Features

| Feature | Description |
|---|---|
| **7-Step Dosage Engine** | Evidence-based algorithm incorporating FII scores, Vineland adaptive behavior, VB-MAPP milestones, behavioral severity, environmental modifiers, and age factors |
| **Dual Portals** | Separate Clinic and Insurance experiences sharing a common backend |
| **Claims Pipeline** | Full lifecycle: submit, review, approve/deny with notes and timestamps |
| **ML Approval Predictor** | Deterministic heuristic estimating approval probability based on data completeness and clinical alignment |
| **Configurable Payer Profiles** | Insurance-side weight tuning for each assessment domain, hour ranges, and age multipliers |
| **Analytics Dashboard** | Aggregated statistics on claims volume, approval rates, average hours, and tier distribution |
| **Clinical Flags** | Automatic detection of high-risk patients, severe impairment, and safety concerns |
| **Audit Logging** | Every claim creation and status change is recorded with role, action, and details |

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Lucide Icons, Inter font |
| **Backend** | Node.js, Express 5, TypeScript (tsx runner) |
| **Database** | SQLite via better-sqlite3 (local) · Turso via @libsql/client (cloud) · In-memory libSQL (serverless demo) |
| **Deployment** | Vercel (static CDN + serverless functions) + Turso (cloud SQLite) |
| **Design System** | Custom CSS design system — blue/teal medical palette, sidebar navigation, frosted glass header |

---

## Project Structure

```
aba-calc-v2/
├── api/                    # Vercel serverless entry point
│   └── index.ts            # Express handler wrapper (cold-start DB init)
├── server/                 # Backend API
│   ├── index.ts            # Express app + server bootstrap
│   ├── db/                 # Database layer
│   │   ├── index.ts        # Tri-mode DbClient (Turso / in-memory / better-sqlite3)
│   │   ├── schema.ts       # CREATE TABLE statements (4 tables)
│   │   └── seed.ts         # Demo data seeder (5 patients, 3 profiles, 4 claims)
│   └── routes/             # REST API route handlers
│       ├── claims.ts       # CRUD + status workflow
│       ├── patients.ts     # CRUD
│       ├── analytics.ts    # Aggregate statistics
│       └── payerProfiles.ts # Read + update payer configs
├── src/                    # Frontend React application
│   ├── main.tsx            # React DOM entry
│   ├── App.tsx             # Role-based routing (Login → Clinic | Insurance)
│   ├── index.css           # Tailwind + CSS design system (colors, typography, layout)
│   ├── vite-env.d.ts       # Vite type declarations
│   ├── lib/                # Core business logic (runs client-side)
│   │   ├── calculator.ts   # 7-step dosage determination engine
│   │   ├── mlPredictor.ts  # Simulated ML approval predictor
│   │   └── api.ts          # REST API client (fetch wrapper)
│   ├── stores/             # Zustand state management
│   │   ├── authStore.ts    # Role state (clinic | insurance | null)
│   │   └── claimStore.ts   # Claims list + CRUD actions
│   ├── components/         # Shared UI primitives (9 reusable components)
│   │   ├── Layout.tsx      # App shell (sidebar nav, header, content area)
│   │   ├── Field.tsx       # Form field (input, select, textarea)
│   │   ├── Section.tsx     # Collapsible form section
│   │   ├── RatingRow.tsx   # 0–4 severity rating input
│   │   ├── Badge.tsx       # Status badge (approved, denied, etc.)
│   │   ├── Meter.tsx       # Visual gauge (probability, hours)
│   │   ├── Chips.tsx       # Multi-select tag chips
│   │   ├── TabBar.tsx      # Sidebar tab navigation
│   │   └── StatCard.tsx    # Metric display card
│   └── features/           # Feature modules
│       ├── auth/
│       │   └── LoginScreen.tsx    # Role selection screen
│       ├── clinic/
│       │   ├── ClinicPortal.tsx   # Portal shell + tab routing
│       │   ├── CalculatorTab.tsx  # 7-step assessment form + live results panel
│       │   ├── ClaimsTab.tsx      # Claims list + submission tracking
│       │   └── InsightsTab.tsx    # Analytics dashboard
│       └── insurance/
│           ├── InsurancePortal.tsx  # Portal shell + tab routing
│           ├── QueueTab.tsx        # Review queue (pending claims)
│           ├── PolicyCalcTab.tsx   # Insurance-side calculator
│           ├── DecisionsTab.tsx    # Decision history
│           └── PolicyConfigTab.tsx # Payer profile editor
├── docs/                   # Documentation
│   ├── ABA_Calculator_Architecture.md    # Architecture (Markdown — for GitHub viewing)
│   ├── ABA_Calculator_Architecture.html  # Architecture (printable HTML — open in browser)
│   └── ABA_Calculator_User_Guide.html    # Business user guide (printable HTML)
├── contracts/              # Project specification documents
│   ├── ABA_Medical_Necessity_Calculator_Contract.md
│   ├── BUILD_PLAN_REVISED.md
│   └── Medical_Software_UI_Design_Contract.md
├── mock app/               # Original single-file prototype (reference)
│   ├── aba_calculator.jsx
│   └── database_schema.json.js
├── ref docs/               # Source reference documents (BRD, survey, specifications)
├── vercel.json             # Vercel deployment configuration
├── vite.config.ts          # Vite build + dev proxy configuration
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # TS config for frontend
├── tsconfig.node.json      # TS config for backend + Vercel
├── package.json            # Dependencies + scripts
├── .env.example            # Environment variable template
├── .gitignore              # Ignore rules (node_modules, dist, *.db, .env)
├── eslint.config.js        # ESLint configuration
└── index.html              # SPA entry point (Inter font, Vite module)
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**

### Install & Run

```bash
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run dev
```

This launches:
- **Frontend** at `http://localhost:5173` (Vite dev server with hot reload)
- **Backend API** at `http://localhost:3001` (Express, auto-creates and seeds the SQLite database)

The Vite dev server proxies all `/api/*` requests to the backend automatically.

### Build for Production

```bash
npm run build
```

Outputs optimized static files to `dist/`.

---

## Documentation

| Document | Location | Description |
|---|---|---|
| **Architecture (Markdown)** | `docs/ABA_Calculator_Architecture.md` | Full technical architecture — viewable directly on GitHub |
| **Architecture (HTML)** | `docs/ABA_Calculator_Architecture.html` | Same content in printable format — open in browser, print to PDF |
| **Business User Guide** | `docs/ABA_Calculator_User_Guide.html` | Comprehensive navigation and usage guide for non-technical users |
| **Project Contract** | `contracts/ABA_Medical_Necessity_Calculator_Contract.md` | Authoritative specification document |
| **Build Plan** | `contracts/BUILD_PLAN_REVISED.md` | Detailed implementation plan |
| **UI Design Contract** | `contracts/Medical_Software_UI_Design_Contract.md` | Design system specification (colors, typography, components) |

---

## Deployment

The app is configured for **Vercel** deployment with a tri-mode database strategy:

- **Frontend** is served as static files via Vercel's global CDN
- **Backend API** runs as a Vercel serverless function (`api/index.ts`)
- **Database** adapts automatically based on environment:

| Mode | When | Persistence |
|---|---|---|
| **Turso Cloud** | `TURSO_URL` env var set | ✅ Full cloud persistence |
| **In-Memory libSQL** | On Vercel without `TURSO_URL` | ⚠️ Demo mode — resets on cold starts |
| **Local SQLite** | Local development | ✅ Full local file persistence |

### Environment Variables (for persistent cloud database)

| Variable | Description |
|---|---|
| `TURSO_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso authentication token |

When these are not set on Vercel, the app runs in **demo mode** with an in-memory database that auto-seeds on each cold start. Locally, the app always uses a file-based SQLite database (`server/db/aba.db`).

---

## License

Demo prototype — not licensed for production use.
