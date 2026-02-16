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
| **Audit Logging** | Every claim creation and status change is recorded with role, action, and details |

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Lucide Icons |
| **Backend** | Node.js, Express 5, TypeScript (tsx runner) |
| **Database** | SQLite via better-sqlite3 (local) / Turso via @libsql/client (cloud) |
| **Deployment** | Vercel (static CDN + serverless functions) + Turso (cloud SQLite) |

---

## Project Structure

```
aba-calc-v2/
├── api/                    # Vercel serverless entry point
├── server/                 # Backend API
│   ├── db/                 # Database layer (schema, seed, dual-mode client)
│   └── routes/             # REST API route handlers (claims, patients, analytics, payer-profiles)
├── src/                    # Frontend React application
│   ├── lib/                # Core business logic (calculator engine, ML predictor, API client)
│   ├── stores/             # Zustand state management (auth, claims)
│   ├── components/         # Shared UI primitives (9 reusable components)
│   └── features/           # Feature modules
│       ├── auth/           # Login / role selection
│       ├── clinic/         # Clinic Portal (Calculator, Claims, Insights tabs)
│       └── insurance/      # Insurance Portal (Queue, Policy Calc, Decisions, Config tabs)
├── contracts/              # Project contract and build plan
├── docs/                   # Architecture diagram and business user guide
├── mock app/               # Original single-file prototype (reference)
├── ref docs/               # Source reference documents (BRD, survey, specifications)
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite build + dev proxy configuration
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
| **Architecture Diagram** | `docs/ABA_Calculator_Architecture.html` | Detailed end-to-end technical architecture (open in browser, print to PDF) |
| **Business User Guide** | `docs/ABA_Calculator_User_Guide.html` | Comprehensive navigation and usage guide for non-technical users |
| **Project Contract** | `contracts/ABA_Medical_Necessity_Calculator_Contract.md` | Authoritative specification document |
| **Build Plan** | `contracts/BUILD_PLAN_REVISED.md` | Detailed implementation plan |

---

## Deployment

The app is configured for **Vercel + Turso** deployment:

- **Frontend** is served as static files via Vercel's global CDN
- **Backend API** runs as a Vercel serverless function (`api/index.ts`)
- **Database** uses Turso (cloud-hosted SQLite) in production, with automatic fallback to local SQLite for development

Environment variables required for production:

| Variable | Description |
|---|---|
| `TURSO_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso authentication token |

When these are not set, the app automatically uses a local SQLite file (`server/db/aba.db`).

---

## License

Demo prototype — not licensed for production use.
