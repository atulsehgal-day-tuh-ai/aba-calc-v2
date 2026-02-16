# ABA Medical Necessity Calculator — System Architecture

> End-to-End Technical Architecture Document · Demo Prototype · v2.0 · February 2026

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project File Structure](#3-project-file-structure)
4. [Dual-Portal Architecture](#4-dual-portal-architecture)
5. [7-Step Dosage Calculation Engine](#5-7-step-dosage-calculation-engine)
6. [Simulated ML Approval Predictor](#6-simulated-ml-approval-predictor)
7. [Database Schema](#7-database-schema)
8. [REST API Endpoints](#8-rest-api-endpoints)
9. [End-to-End Claims Workflow](#9-end-to-end-claims-workflow)
10. [Claim Status State Machine](#10-claim-status-state-machine)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Frontend Data Flow](#12-frontend-data-flow)
13. [Security & Authentication (Demo Scope)](#13-security--authentication-demo-scope)

---

## 1. High-Level System Overview

The ABA Medical Necessity Calculator is a **dual-tenant, full-stack web application** with two distinct user portals (Clinic and Insurance) sharing a common API backend and database.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🌐  CLIENT TIER — Browser                                             │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐                │
│  │ LoginScreen  │  │ Clinic Portal│  │ Insurance Portal │                │
│  │ Role select  │  │ Calculator   │  │ Review Queue     │                │
│  │              │  │ Claims       │  │ Policy Calc      │                │
│  │              │  │ Insights     │  │ Decisions        │                │
│  │              │  │              │  │ Policy Config     │                │
│  └─────────────┘  └──────────────┘  └─────────────────┘                │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ Shared Components │  │ Zustand Stores   │  │ Core Libraries        │ │
│  │ Layout, Field,    │  │ authStore        │  │ calculator.ts         │ │
│  │ Badge, Meter, etc.│  │ claimStore       │  │ mlPredictor.ts        │ │
│  │                   │  │                  │  │ api.ts                │ │
│  └──────────────────┘  └──────────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                          │ HTTP REST (JSON) via fetch
                          │ /api/*
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚙️  API TIER — Express.js Server                                      │
│                                                                         │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Express App │ │ /api/claims│ │ /api/patients│ │ /api/analytics   │  │
│  │ CORS, JSON  │ │ GET/POST/  │ │ GET/POST     │ │ GET (aggregation)│  │
│  │ middleware  │ │ PATCH      │ │              │ │                  │  │
│  └────────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │
│                                                                         │
│  ┌───────────────────┐  ┌──────────────┐                               │
│  │ /api/payer-profiles│  │ /api/health  │                               │
│  │ GET/PUT            │  │ Health check │                               │
│  └───────────────────┘  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
                          │ Dual-Mode DB Client (async interface)
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  💾  DATA TIER — SQLite / Turso                                        │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  ┌──────────┐         │
│  │ patients │  │  claims  │  │ payer_profiles │  │ audit_log│         │
│  │ id, name │  │ id, status│  │ id, name,     │  │ entity,  │         │
│  │ age, dx  │  │ assess,  │  │ weights, mult  │  │ action,  │         │
│  │          │  │ calc, ml │  │ ranges         │  │ details  │         │
│  └──────────┘  └──────────┘  └────────────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                          │ Deployment Target
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ☁️  INFRASTRUCTURE TIER — Vercel + Turso                              │
│                                                                         │
│  ┌──────────────┐  ┌────────────────────┐  ┌───────────────────┐       │
│  │ Vercel CDN   │  │ Vercel Serverless  │  │ Turso Cloud       │       │
│  │ Static React │  │ api/index.ts →     │  │ libSQL remote     │       │
│  │ build (dist/)│  │ Express handler    │  │ SQLite            │       │
│  └──────────────┘  └────────────────────┘  └───────────────────┘       │
│                                                                         │
│  ┌──────────────────────────┐                                          │
│  │ Local Dev: better-sqlite3│                                          │
│  │ file: server/db/aba.db   │                                          │
│  └──────────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend

| Component       | Technology                                  |
| --------------- | ------------------------------------------- |
| **Framework**   | React 19                                    |
| **Build Tool**  | Vite 7                                      |
| **Language**    | TypeScript                                  |
| **Styling**     | Tailwind CSS 4 + Custom CSS design system   |
| **State Mgmt**  | Zustand                                     |
| **Icons**       | Lucide React                                |
| **Font**        | Inter (Google Fonts)                        |
| **Routing**     | Role-based conditional rendering (no router)|

### Backend

| Component       | Technology                                  |
| --------------- | ------------------------------------------- |
| **Runtime**     | Node.js                                     |
| **Framework**   | Express.js                                  |
| **Language**    | TypeScript (tsx runner)                      |
| **DB (Local)**  | better-sqlite3 (SQLite WAL mode)            |
| **DB (Cloud)**  | @libsql/client (Turso)                      |
| **Hosting**     | Vercel Serverless Functions                 |
| **IDs**         | uuid v4                                     |
| **Dev Runner**  | concurrently (frontend + backend in parallel)|

---

## 3. Project File Structure

```
aba-calc-v2/
├── api/                          # Vercel serverless entry point
│   └── index.ts                  # Express handler wrapper (cold-start DB init)
├── server/                       # Backend API
│   ├── index.ts                  # Express app + server bootstrap
│   ├── db/
│   │   ├── index.ts              # Dual-mode DbClient (Turso / better-sqlite3)
│   │   ├── schema.ts             # CREATE TABLE statements (4 tables)
│   │   └── seed.ts               # Demo data seeder (5 patients, 3 profiles, 4 claims)
│   └── routes/
│       ├── claims.ts             # CRUD + status workflow
│       ├── patients.ts           # CRUD
│       ├── analytics.ts          # Aggregate statistics
│       └── payerProfiles.ts      # Read + update payer configs
├── src/                          # Frontend React app
│   ├── main.tsx                  # React DOM entry
│   ├── App.tsx                   # Role-based routing (Login → Clinic | Insurance)
│   ├── index.css                 # Tailwind directives + CSS design system variables
│   ├── lib/                      # Core business logic (runs client-side)
│   │   ├── calculator.ts         # 7-step dosage determination engine
│   │   ├── mlPredictor.ts        # Simulated ML approval predictor
│   │   └── api.ts                # REST API client (fetch wrapper)
│   ├── stores/                   # Zustand state management
│   │   ├── authStore.ts          # Role state (clinic | insurance | null)
│   │   └── claimStore.ts         # Claims list + CRUD actions
│   ├── components/               # Shared UI primitives (9 components)
│   │   ├── Layout.tsx            # App shell (header, sidebar, content)
│   │   ├── Field.tsx             # Form field (input, select, textarea)
│   │   ├── Section.tsx           # Collapsible form section
│   │   ├── RatingRow.tsx         # 0–4 severity rating input
│   │   ├── Badge.tsx             # Status badge (approved, denied, etc.)
│   │   ├── Meter.tsx             # Visual gauge (probability, hours)
│   │   ├── Chips.tsx             # Multi-select tag chips
│   │   ├── TabBar.tsx            # Sidebar tab navigation
│   │   └── StatCard.tsx          # Metric display card
│   └── features/                 # Feature modules (portal-specific)
│       ├── auth/
│       │   └── LoginScreen.tsx   # Role selection screen
│       ├── clinic/
│       │   ├── ClinicPortal.tsx   # Portal shell + tab routing
│       │   ├── CalculatorTab.tsx  # 7-step assessment form + results panel
│       │   ├── ClaimsTab.tsx      # Claims list + submission tracking
│       │   └── InsightsTab.tsx    # Analytics dashboard
│       └── insurance/
│           ├── InsurancePortal.tsx # Portal shell + tab routing
│           ├── QueueTab.tsx       # Review queue (pending claims)
│           ├── PolicyCalcTab.tsx   # Insurance-side calculator
│           ├── DecisionsTab.tsx    # Decision history
│           └── PolicyConfigTab.tsx # Payer profile editor
├── docs/                         # Documentation
│   ├── ABA_Calculator_Architecture.md   # This file
│   ├── ABA_Calculator_Architecture.html # HTML version (printable)
│   └── ABA_Calculator_User_Guide.html   # Business user guide (printable)
├── contracts/                    # Specification documents
│   ├── ABA_Medical_Necessity_Calculator_Contract.md
│   ├── BUILD_PLAN_REVISED.md
│   └── Medical_Software_UI_Design_Contract.md
├── vercel.json                   # Vercel deployment config
├── vite.config.ts                # Vite config (React plugin, API proxy)
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # TS config for frontend
├── tsconfig.node.json            # TS config for backend + Vercel
├── package.json                  # Dependencies + scripts
├── .env.example                  # Environment variable template
├── .gitignore                    # Ignore rules (node_modules, dist, *.db, .env)
└── index.html                    # SPA entry point (Inter font, Vite module)
```

---

## 4. Dual-Portal Architecture

The app serves two distinct user roles through a single codebase with **role-based conditional rendering** — no client-side router library is needed.

```
                        ┌──────────────────────┐
                        │     App.tsx           │
                        │   role === null       │
                        │     → LoginScreen     │
                        │   role === 'clinic'   │
                        │     → ClinicPortal    │
                        │   role === 'insurance' │
                        │     → InsurancePortal │
                        └──────────┬───────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │  🏥 CLINIC PORTAL        │    │  🛡️ INSURANCE PORTAL     │
    │                          │    │                          │
    │  Purpose: Clinical       │    │  Purpose: Claim review,  │
    │  assessment, dosage      │    │  policy calculation,     │
    │  calculation, claim      │    │  decisions, config       │
    │  submission              │    │                          │
    │                          │    │                          │
    │  Tabs:                   │    │  Tabs:                   │
    │  ┌────────────────────┐  │    │  ┌────────────────────┐  │
    │  │ 🧮 Calculator      │  │    │  │ 📥 Review Queue    │  │
    │  │ Assessment form +  │  │    │  │ Pending claims     │  │
    │  │ live dosage engine │  │    │  │ approve/deny/info  │  │
    │  │ + ML prediction    │  │    │  │                    │  │
    │  ├────────────────────┤  │    │  ├────────────────────┤  │
    │  │ 📄 My Claims       │  │    │  │ 🧮 Policy Calc    │  │
    │  │ Submit & track     │  │    │  │ Independent calc   │  │
    │  │ claim history      │  │    │  │ with profile wts   │  │
    │  ├────────────────────┤  │    │  ├────────────────────┤  │
    │  │ 📊 Insights        │  │    │  │ ⚖️ Decisions       │  │
    │  │ Totals, avg hours  │  │    │  │ Decision history   │  │
    │  │ approval rates     │  │    │  │ + audit trail      │  │
    │  └────────────────────┘  │    │  ├────────────────────┤  │
    │                          │    │  │ ⚙️ Policy Config   │  │
    │                          │    │  │ Edit payer profile │  │
    │                          │    │  │ weights & limits   │  │
    │                          │    │  └────────────────────┘  │
    └──────────────────────────┘    └──────────────────────────┘
```

### Shared Resources

Both portals share:
- **`calculator.ts`** — The same 7-step dosage engine runs in both the Clinic Calculator and the Insurance Policy Calculator
- **`mlPredictor.ts`** — Approval prediction runs client-side for both portals
- **`claimStore.ts`** — Zustand store managing claim CRUD across both portals
- **UI Components** — Layout, Badge, StatCard, Meter, Field, Section, etc.
- **Database** — Same tables, same API endpoints, same data

---

## 5. 7-Step Dosage Calculation Engine

The core algorithm in `src/lib/calculator.ts` follows a deterministic 7-step pipeline. Each step builds on the previous result, and every adjustment is documented in a rationale trail.

### Pipeline Flow

```
FII (9 domains) → Base Hours → + Vineland Adj → + VB-MAPP Adj → + Behavioral Adj → + Env Adj → × Age Mult → Clamp(min, max) → Final Hours + Derivations
```

### Step-by-Step Breakdown

| Step | Name | What Happens | Max Impact |
| ---- | ---- | ------------ | ---------- |
| **1** | **FII → Base Hours** | Sum of 9 functional impairment domains (0–4 each) → FII score (0–36). Maps to base hours: 0–8 → 10h, 9–16 → 20h, 17–24 → 30h, 25–36 → 35h | 35h base |
| **2** | **Vineland-3 Adjustment** | Composite adaptive behavior score. Below 70: +8h, 70–84: +4h, 85+: +0h. Weighted by payer profile `vinW`. | +12h |
| **3** | **VB-MAPP Adjustment** | Milestones, Barriers, Transitions scores. Milestones below 50: +5h, Barriers above 15: +3h. Weighted by `vbW`. | +12h |
| **4** | **Behavioral Adjustment** | Aggression frequency (+2–6h), self-injury severity (+2–5h), elopement (+3h), crisis events (+2–5h). Weighted by `behW`. | +16h |
| **5** | **Environmental Modifiers** | Each active modifier (school risk, CPS, regression, burnout, etc.) adds +2h. Weighted by `envW`. | +8h |
| **6** | **Age Multiplier** | Age 2–6: ×1.20 (young), Age 7–12: ×1.00 (mid), Age 13+: ×0.85 (teen). Configurable per payer profile. **Overridden to ×1.00 for high-risk patients.** | ±20% |
| **7** | **Final Clamping + Derivations** | Clamp to payer min/max hours. Derive supervision hours (`supPct × final`), parent training hours (from `ptRange`), goal count, risk score. Generate rationale strings. | — |

### Tier Assignment

| Tier | Hours Range | Name | Supervision | Parent Training |
| ---- | ----------- | ---- | ----------- | --------------- |
| **Tier 1** | < 20h | Focused | 10% | 2h/wk |
| **Tier 2** | 20–29h | Moderate | 15% | 5h/wk |
| **Tier 3** | 30+h | Intensive | 20% | 8h/wk |

### Clinical Flags

| Flag | Trigger | System Response |
| ---- | ------- | --------------- |
| 🔴 **HIGH RISK** | Risk score ≥ 15/24 or severe self-injury | Age multiplier overridden to ×1.00 (prevents teen reduction) |
| 🔴 **Severe Functional Impairment** | FII ≥ 25 | Advisory: consider Tier 3 intensive services |
| 🟠 **Significant Behavioral Risk** | Behavioral adjustment ≥ 10 | Advisory: behavioral intervention plan required |
| 🟠 **Multiple Environmental Stressors** | Environmental adjustment ≥ 6 | Advisory: consider wrap-around services |

### Payer Profile Weights

The `PayerProfile` interface configures how the engine behaves per insurance payer:

```typescript
interface PayerProfile {
  maxH: number;          // Maximum weekly hours (default: 40)
  minH: number;          // Minimum weekly hours (default: 10)
  fiiW: number;          // FII domain weight (default: 1.0)
  vinW: number;          // Vineland weight (default: 1.0)
  vbW: number;           // VB-MAPP weight (default: 1.0)
  behW: number;          // Behavioral weight (default: 1.0)
  envW: number;          // Environmental weight (default: 1.0)
  ageMult: {
    young: number;       // Age ≤ 5 multiplier (default: 1.20)
    mid: number;         // Age 6–12 multiplier (default: 1.00)
    teen: number;        // Age 13+ multiplier (default: 0.85)
  };
  supPct: number;        // Supervision % of total hours (default: 0.15)
  ptRange: [number, number]; // Parent training min/max hours (default: [2, 8])
}
```

---

## 6. Simulated ML Approval Predictor

The predictor in `src/lib/mlPredictor.ts` is a **deterministic heuristic** (not actual ML) that estimates approval probability based on data completeness and clinical indicators.

### Scoring Factors

| Factor | Logic | Weight |
| ------ | ----- | ------ |
| Documentation completeness | % of assessment fields filled | +30 max |
| Clinical severity | FII score relative to hours requested | +25 max |
| Vineland alignment | Low composite supports higher hours | +15 max |
| Behavioral justification | Presence of aggression, SIB, elopement | +15 max |
| Age appropriateness | Hours align with age expectations | +10 max |
| Environmental factors | Active modifiers documented | +5 max |

### Output Structure

- **Probability**: 0–100% (sum of factor scores)
- **Confidence**: low / medium / high
- **Tier**: likely-approve (≥ 70%) / borderline (40–69%) / likely-deny (< 40%)
- **Factor Breakdown**: List of positive and negative factors with descriptions

---

## 7. Database Schema

The system uses 4 tables. In local development, data is stored in `server/db/aba.db` (SQLite WAL mode). In production, data lives in Turso Cloud SQLite via `@libsql/client`.

### `patients`

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | TEXT PK | e.g. "P-001" |
| `name` | TEXT | Full name |
| `age` | INTEGER | 2–21 |
| `diagnosis` | TEXT | autism, pdd, aspergers |
| `diagnosis_code` | TEXT | Default F84.0 |
| `educational_setting` | TEXT | Mainstream, Special Ed, etc. |
| `living_situation` | TEXT | Two-Parent, Foster Care, etc. |
| `created_at` | TEXT | ISO datetime |

### `claims`

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | TEXT PK | UUID (v4) |
| `patient_id` | TEXT FK | → patients.id |
| `patient_name` | TEXT | Denormalized for display |
| `patient_age` | INTEGER | Denormalized |
| `diagnosis` | TEXT | Denormalized |
| `status` | TEXT | submitted → under_review → approved/denied/info_requested |
| `assessment_data` | TEXT | JSON blob of all form inputs |
| `calc_result` | TEXT | JSON blob of engine output (hours, tier, rationale) |
| `ml_prediction` | TEXT | JSON blob of predictor output (probability, factors) |
| `recommended_hours` | REAL | Engine-calculated final hours |
| `approved_hours` | REAL | Set on approval (NULL until decided) |
| `tier` | INTEGER | 1–3 |
| `review_notes` | TEXT | Insurance reviewer notes |
| `reviewed_by` | TEXT | Reviewer identifier |
| `created_at` | TEXT | ISO datetime |
| `updated_at` | TEXT | ISO datetime |

### `payer_profiles`

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | TEXT PK | e.g. "PP-001" |
| `name` | TEXT | Default, Conservative, Progressive |
| `max_hours` | REAL | Clamping ceiling (30–40) |
| `min_hours` | REAL | Clamping floor (10–15) |
| `fii_w` / `vin_w` / `vb_w` / `beh_w` / `env_w` | REAL | Domain weights (0.7–1.2) |
| `age_mult_young` / `age_mult_mid` / `age_mult_teen` | REAL | Age group multipliers |
| `sup_pct` | REAL | Supervision percentage (0.12–0.18) |
| `pt_range_min` / `pt_range_max` | REAL | Parent training hour range |
| `updated_at` | TEXT | ISO datetime |

### `audit_log`

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `entity_type` | TEXT | "claim" |
| `entity_id` | TEXT | UUID of the entity |
| `action` | TEXT | created, status_approved, status_denied, etc. |
| `details` | TEXT | JSON (e.g. previous/new status, notes) |
| `user_role` | TEXT | clinic / insurance |
| `created_at` | TEXT | ISO datetime |

### Seed Data

The database is pre-populated with:
- **5 patients** — varying ages (3–15), diagnoses, and settings
- **4 claims** — in different statuses (submitted, under_review, approved, denied)
- **3 payer profiles** — Default, Conservative, Progressive

---

## 8. REST API Endpoints

All endpoints are prefixed with `/api`. In development, Vite proxies `/api/*` → `http://localhost:3001`. In production, Vercel rewrites `/api/*` → the serverless function.

| Method | Endpoint | Description | Used By |
| ------ | -------- | ----------- | ------- |
| `GET` | `/api/claims` | List all claims (sorted by created_at DESC) | Both portals |
| `GET` | `/api/claims/:id` | Get single claim detail | Both portals |
| `POST` | `/api/claims` | Create new claim (assessment + calc + ML data) | Clinic |
| `PATCH` | `/api/claims/:id/status` | Update claim status + notes | Insurance |
| `GET` | `/api/patients` | List all patients | Clinic |
| `GET` | `/api/patients/:id` | Get single patient | Clinic |
| `POST` | `/api/patients` | Create new patient | Clinic |
| `GET` | `/api/analytics` | Aggregated stats (totals, averages, tier counts) | Both portals |
| `GET` | `/api/payer-profiles` | List all payer profiles | Insurance |
| `GET` | `/api/payer-profiles/:id` | Get single profile | Insurance |
| `PUT` | `/api/payer-profiles/:id` | Update profile weights/ranges | Insurance |
| `GET` | `/api/health` | Health check (returns `{ status: "ok" }`) | Monitoring |

### Request/Response Examples

**POST `/api/claims`** — Submit a claim:
```json
{
  "patient_name": "Alex Rivera",
  "patient_age": 5,
  "diagnosis": "autism",
  "assessment_data": { "fii": { "communication": 3, ... }, "vineland": { ... }, ... },
  "calc_result": { "finalHours": 30, "tier": 3, "rationale": [...], ... },
  "ml_prediction": { "probability": 78, "confidence": "high", "factors": [...] },
  "recommended_hours": 30,
  "tier": 3
}
```

**PATCH `/api/claims/:id/status`** — Review decision:
```json
{
  "status": "approved",
  "review_notes": "Clinical documentation supports requested hours.",
  "approved_hours": 30
}
```

---

## 9. End-to-End Claims Workflow

The complete lifecycle of a claim from clinical assessment to insurance decision:

```
┌──────────────────── CLINIC SIDE ────────────────────┐     ┌──────────────── INSURANCE SIDE ──────────────┐
│                                                      │     │                                              │
│  1. Fill Assessment Form                             │     │  6. Claim appears in Review Queue             │
│     └─ CalculatorTab: demographics, FII,             │     │     └─ QueueTab: status = "submitted"         │
│        Vineland, VB-MAPP, behavioral,                │     │                                              │
│        environmental, risk                           │     │  7. Reviewer examines claim                   │
│                    ▼                                 │     │     └─ Sees: full assessment data,             │
│  2. 7-Step Engine runs (client-side)                 │     │       engine results, ML prediction,           │
│     └─ calculator.ts: produces hours,                │     │       clinical flags, rationale trail           │
│        tier, rationale                               │     │     └─ Optionally verifies via Policy Calc     │
│                    ▼                                 │     │                    ▼                           │
│  3. ML Prediction runs (client-side)                 │     │  8. Decision                                  │
│     └─ mlPredictor.ts: probability,                  │     │     └─ Approve / Deny / Request Info          │
│        confidence, factors                           │     │     └─ Adds review notes                      │
│                    ▼                                 │     │                    ▼                           │
│  4. Review Results Panel                             │     │  9. PATCH /api/claims/:id/status               │
│     └─ Hours, tier, ML %, flags, breakdown           │     │     └─ Status updated in DB                    │
│                    ▼                                 │     │     └─ Audit log entry created                  │
│  5. Submit Claim                                     │     │     └─ Claim appears in Decisions tab           │
│     └─ POST /api/claims                              │     │                                              │
│     └─ Data: assessment, calc, ML as JSON            │     │                                              │
│                                                      │     │                                              │
└──────────────────────────────────────────────────────┘     └──────────────────────────────────────────────┘
```

---

## 10. Claim Status State Machine

```
                              ┌─────────────┐
                              │  submitted  │
                              └──────┬──────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │  under_review    │
                           └────┬───┬───┬─────┘
                                │   │   │
                   ┌────────────┘   │   └────────────┐
                   ▼                ▼                 ▼
            ┌───────────┐  ┌────────────┐  ┌─────────────────┐
            │  approved │  │   denied   │  │ info_requested  │
            └───────────┘  └────────────┘  └─────────────────┘
```

**Transition rules:**
- `submitted` → `under_review` (reviewer starts evaluation)
- `submitted` → `approved` / `denied` / `info_requested` (direct decision)
- `under_review` → `approved` / `denied` / `info_requested` (after review)

Every transition is recorded in `audit_log` with:
- Timestamp (`created_at`)
- Action (e.g. `status_approved`, `status_denied`)
- Details JSON (previous status, new status, review notes)
- User role (`insurance`)

---

## 11. Deployment Architecture

### Local Development

```
┌─────────────────────────────────────────┐
│  Browser (http://localhost:5173)         │
└──────────────────┬──────────────────────┘
                   │ /api/* (proxied by Vite)
                   ▼
┌─────────────────────────────────────────┐
│  Vite Dev Server (port 5173)            │
│  Hot-reload React app                   │
│  Proxy: /api/* → http://localhost:3001  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Express Server (port 3001)             │
│  Started via: npx tsx server/index.ts   │
│  Auto-init: schema + seed on first run  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  better-sqlite3                         │
│  Local file: server/db/aba.db           │
│  WAL mode (concurrent reads)            │
└─────────────────────────────────────────┘
```

**Run locally:** `npm run dev` (uses `concurrently` to start both Vite + Express)

### Vercel Production

```
┌─────────────────────────────────────────┐
│  Browser (https://aba-calc-v2.vercel.app)│
└──────┬──────────────────┬───────────────┘
       │ Static assets    │ /api/*
       ▼                  ▼
┌──────────────┐  ┌──────────────────────────────┐
│ Vercel CDN   │  │ Vercel Serverless Function    │
│ (Edge)       │  │ api/index.ts                  │
│              │  │ └─ Wraps Express app           │
│ dist/        │  │ └─ Cold-start: await initDb() │
│ index.html   │  │ └─ Routes: claims, patients,  │
│ JS bundles   │  │    analytics, payer-profiles   │
│ CSS          │  └──────────────┬────────────────┘
└──────────────┘                 │ libSQL
                                 ▼
                  ┌──────────────────────────────┐
                  │ If TURSO_URL set:             │
                  │   Turso Cloud SQLite (remote) │
                  │   libsql://aba-calc-*.turso.io│
                  │                               │
                  │ If TURSO_URL not set:          │
                  │   In-Memory libSQL (demo mode) │
                  │   Data resets on cold start    │
                  └──────────────────────────────┘
```

### Tri-Mode Database Client

The `server/db/index.ts` module provides a unified `DbClient` interface with three runtime modes:

```typescript
interface DbClient {
  execute(params: { sql: string; args?: any[] }): Promise<{ rows: any[] }>;
}
```

| Mode | When Active | Technology | Persistence |
| ---- | ----------- | ---------- | ----------- |
| **Turso Remote** | `TURSO_URL` env var is set | `@libsql/client` over HTTP | ✅ Full persistence (cloud) |
| **In-Memory libSQL** | On Vercel (`VERCEL=1`) without `TURSO_URL` | `@libsql/client` with `:memory:` | ⚠️ Warm invocations only (demo) |
| **Local SQLite** | Local dev (no `VERCEL`, no `TURSO_URL`) | `better-sqlite3` file-based | ✅ Full persistence (local file) |

The in-memory mode enables the app to run as a functional demo on Vercel even without a Turso database configured. Data persists across warm serverless invocations but resets on cold starts. Schema and seed data are re-applied on each cold start.

### Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `TURSO_URL` | For persistent cloud DB | Turso database URL (e.g. `libsql://aba-calc-v2-user.turso.io`) |
| `TURSO_AUTH_TOKEN` | With `TURSO_URL` | Turso authentication token |
| `VERCEL` | Auto-set by Vercel | Triggers in-memory fallback when `TURSO_URL` is absent |

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

---

## 12. Frontend Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│ React Component  │ ──▶ │ Zustand Store    │ ──▶ │ api.ts   │ ──▶ │ Express Route│ ──▶ │ DbClient │
│ e.g. QueueTab    │     │ claimStore       │     │ fetch()  │     │ claims.ts    │     │ SQLite / │
│                  │ ◀── │ authStore        │ ◀── │          │ ◀── │              │ ◀── │ Turso    │
└──────────────────┘     └──────────────────┘     └──────────┘     └──────────────┘     └──────────┘
```

### Key Data Flow Paths

| Flow | Path | Description |
| ---- | ---- | ----------- |
| **Assessment** | CalculatorTab → calculator.ts → mlPredictor.ts | Runs entirely client-side, no API call |
| **Submit Claim** | CalculatorTab → claimStore.submitClaim() → api.submitClaim() → POST /api/claims | Persists to database |
| **Fetch Claims** | QueueTab/ClaimsTab → claimStore.fetchClaims() → api.fetchClaims() → GET /api/claims | Loads from database |
| **Review Claim** | QueueTab → claimStore.updateClaimStatus() → api.updateClaimStatus() → PATCH /api/claims/:id/status | Updates status + audit |
| **Analytics** | InsightsTab → api.fetchAnalytics() → GET /api/analytics | Aggregated server-side |
| **Payer Config** | PolicyConfigTab → api.fetchPayerProfiles() → GET /api/payer-profiles | Loaded on tab mount |
| **Login** | LoginScreen → authStore.login('clinic') | Client-side only, no API |

> **Important:** The calculator engine and ML predictor run **entirely in the browser** (client-side). Only claim persistence, analytics, and payer profile management use the API.

---

## 13. Security & Authentication (Demo Scope)

This is a **demo prototype** — security is simulated. The following describes current state vs. production requirements:

| Aspect | Demo Implementation | Production Requirement |
| ------ | ------------------- | ---------------------- |
| **Authentication** | Simulated role selection (click to enter) | OAuth 2.0 / OIDC with JWT tokens |
| **Authorization** | Role stored in Zustand (client-side only) | Server-side role enforcement, middleware |
| **Data Isolation** | Both portals share all data | Row-level security, tenant isolation |
| **CORS** | Open (`cors()` with defaults) | Restricted to specific origins |
| **Input Validation** | Minimal client-side checks | Zod/Joi schemas on all API inputs |
| **HTTPS** | Local: HTTP, Vercel: HTTPS auto | Always HTTPS with HSTS |
| **Audit Logging** | ✅ Functional — all status changes logged | Add user IDs, IP addresses, full request logs |
| **Rate Limiting** | None | Express rate-limit middleware |
| **Data Encryption** | None (SQLite at rest) | Encryption at rest + in transit |

---

*ABA Medical Necessity Calculator — Architecture Document — February 2026 — Demo Prototype v2.0*
