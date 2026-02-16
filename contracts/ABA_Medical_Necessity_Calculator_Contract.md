# ABA Medical Necessity Calculator — Development Contract

**Project:** ABA Medical Necessity Dosage Determination Engine  
**Version:** 1.1 (Enhanced)  
**Date:** February 15, 2026  
**Client:** Skippy Care  
**Status:** Phase 1 — Prototype Complete, Ready for Production Build

> **Disclaimer:** This system is for informational and clinical decision-support purposes only. It does not replace professional clinical judgment. For medical advice or diagnosis, consult a licensed professional. Final treatment decisions must be made by qualified BCBAs based on individual client needs, payer requirements, and professional judgment.

---

## 1. Project Summary

Build a **dual-tenant, web-based decision support system** for Applied Behavior Analysis (ABA) therapy that serves **two distinct user types** through separate, isolated portals:

1. **Provider Clinic Portal** — Used by ABA treatment providers (BCBAs) to calculate evidence-based dosage hours, submit authorization claims, track outcomes, predict approval probability via ML, and learn from approval/denial patterns.

2. **Insurance Payer Portal** — Used by insurance utilization management (UM) reviewers to review incoming claims, approve/deny with notes, run their own enhanced calculator with custom policy weights, and configure payer-specific thresholds.

The two portals share a claim pipeline but **cannot see each other's views, configurations, or internal analytics**.

---

## 2. Business Context & Problem Statement

### Current Pain Points

- Authorization decisions vary wildly (10–30 hrs/week for identical cases) depending on reviewer
- Manual reviews take 45–90 minutes per case
- Appeals rate is ~12% due to inconsistency
- No audit trail or reproducibility for decisions
- Policy changes take months to propagate across reviewers

### Target Outcomes

| Metric | Baseline | Target (6 months) |
|--------|----------|-------------------|
| Avg review time | 60 min | 18 min (70% reduction) |
| Inter-reviewer consistency | 65% | 95% |
| Appeals rate | 12% | 6% |
| Time to decision | 5 business days | 2 business days |
| Provider satisfaction | 6.2/10 | 8.5/10 |

### Core Value Proposition

The **clinic** gets a vanilla/basic calculator using the standard dosage algorithm plus an ML-powered approval predictor. The **insurance company** gets the same base calculator plus the ability to customize it with their own policy weights. Over time, the clinic can track which claims get approved vs denied and use those patterns to **calibrate their own calculator** to better predict payer decisions. This creates a feedback loop that improves authorization accuracy for both sides.

---

## 3. Architecture — Two-Portal Design

### 3.1 Database Isolation Strategy

The system uses **physical database isolation** with separate database instances for each tenant type:

- **Clinic Instance** — Stores clinic assessments, patient data, ML training data, and clinic-side analytics
- **Insurance (Payer) Instance** — Stores payer profiles, decision history, policy configurations, and insurer-side analytics

A **secure API bridge** connects the two instances exclusively for claim pipeline operations (submission, status updates, decision handshakes). No direct database cross-access is permitted.

```
┌─────────────────────────────┐
│       LOGIN SCREEN          │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🏥 Clinic│ │🛡 Insurer│  │
│  │  Portal  │ │  Portal  │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│ CLINIC VIEW │  │INSURANCE VIEW│
│ - Calculator│  │ - Review Q   │
│ - ML Predict│  │ - Policy Calc│
│ - My Claims │  │ - Decisions  │
│ - Insights  │  │ - Policy Cfg │
└─────────────┘  └──────────────┘
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│  CLINIC DB  │  │ INSURANCE DB │
│  (Isolated) │  │  (Isolated)  │
└──────┬──────┘  └──────┬───────┘
       │                │
       └───────┬────────┘
               ▼
       ┌──────────────┐
       │ SECURE API   │
       │ BRIDGE       │
       │ (Claims Only)│
       └──────────────┘
```

### 3.2 Clinic Portal (Green Accent: `#3DDC84`)

Four tabs:

1. **Calculator** — Full 11-section medical necessity assessment form. Produces dosage recommendation. Can submit result as a claim.
2. **ML Predictor** — Before claim submission, displays approval probability percentage and generates a Gap Analysis report highlighting documentation weaknesses. (See Section 8A.)
3. **My Claims** — List of all submitted claims with status (pending / approved / denied). Shows insurer notes when decisions arrive.
4. **Insights** — Approval rate percentage, learning insights derived by comparing denied vs approved claims (FII gaps, hours gaps, risk score patterns). Helps clinic calibrate future submissions.

### 3.3 Insurance Portal (Purple Accent: `#A78BFA`)

Four tabs:

1. **Review Queue** — Pending claims from clinics. Shows key metrics at a glance (requested hours, tier, risk score, FII). Click to review full rationale, override hours, add notes, approve or deny.
2. **Policy Calculator** — The same assessment form but using the insurer's custom payer policy weights (configured in Policy Config tab).
3. **Decisions** — History of all decided claims with notes and outcome.
4. **Policy Config** — Customize: max/min hours, domain weight multipliers (FII, Vineland, VB-MAPP, Behavioral, Environmental), age multipliers, supervision percentage, parent training ranges.

---

## 4. Calculation Engine — Dosage Algorithm

The calculator implements a **7-step dosage determination sequence** based on peer-reviewed research. The calculation sequence must be implemented exactly as defined.

### 4.1 Step 1: Base Hours from Functional Impairment Index (FII)

9 domains, each rated 0–4 (total 0–36):

| Domain | Scale |
|--------|-------|
| Communication | 0–4 |
| Social Reciprocity | 0–4 |
| Adaptive Skills | 0–4 |
| Emotional Regulation | 0–4 |
| Safety / Aggression | 0–4 |
| Self-Injury | 0–4 |
| School / Community Functioning | 0–4 |
| Family Impact | 0–4 |
| Restricted / Repetitive Behaviors | 0–4 |

**FII → Base Hours mapping:**

| FII Score | Base Hours |
|-----------|-----------|
| 0–8 | 10 hrs |
| 9–16 | 20 hrs |
| 17–24 | 30 hrs |
| 25–36 | 35 hrs |

### 4.2 Step 2: Vineland-3 Adjustment (max +12 hrs)

Input: 4 domain standard scores (Communication, Daily Living, Socialization, Motor) + optional Composite.

| Condition | Adjustment |
|-----------|-----------|
| 1 domain < 85 | +2 hrs |
| 2 domains < 85 | +4 hrs |
| 3 domains < 85 | +6 hrs |
| 4+ domains < 85 | +8 hrs (cap) |
| Any domain < 70 | +4 hrs |
| Composite < 70 | +4 hrs |
| **Maximum** | **+12 hrs** |

### 4.3 Step 3: VB-MAPP Adjustment (max +12 hrs)

| Category | Score Range | Adjustment |
|----------|-----------|-----------|
| Milestones | 0–45 | +6 hrs |
| Milestones | 46–100 | +3 hrs |
| Milestones | 101+ | +0 hrs |
| Barriers | 7–12 | +2 hrs |
| Barriers | 13–18 | +4 hrs |
| Barriers | 19–24 | +6 hrs |
| Transition | 0–6 | +2 hrs |
| Transition | 7–12 | +1 hr |
| **Maximum** | | **+12 hrs** |

### 4.4 Step 4: Behavioral Risk Adjustment (max +16 hrs)

| Factor | Adjustment |
|--------|-----------|
| Aggression 6+/week | +3 hrs |
| Daily aggression | +5 hrs |
| Self-Injury: Mild | +3 hrs |
| Self-Injury: Moderate | +5 hrs |
| Self-Injury: Severe | +8 hrs |
| Elopement present | +5 hrs |
| 1 crisis event (6 mo) | +5 hrs |
| 2+ crisis events | +8 hrs |
| **Maximum** | **+16 hrs** |

### 4.5 Step 5: Environmental Adjustment (max +8 hrs)

Each checked item adds +2 hrs (max +8):

- School placement at risk
- CPS involvement
- Regression
- Caregiver burnout
- Loss of ABA services
- Limited caregiver capacity
- No school supports

### 4.6 Step 6: Age Multiplier

| Age Range | Multiplier |
|-----------|-----------|
| 0–5 years | ×1.2 |
| 6–12 years | ×1.0 |
| 13+ years | ×0.85 |
| **Override:** Severe/high-risk cases | ×1.0 |

High-risk override triggers when: Risk Score ≥ 15 OR self-injury severity = severe.

### 4.7 Step 7: Final Calculation

```
Raw Hours = (Base + Vineland + VB-MAPP + Behavioral + Environmental) × Age Multiplier
Final Hours = Round to nearest 5-hour increment
Clamp to: Minimum 10 hrs / Maximum 40 hrs (configurable per payer)
```

### 4.8 Output Values

| Output | Derivation |
|--------|-----------|
| **Recommended Direct Therapy Hours/Week** | Final calculation result |
| **Case Intensity Tier** | Tier 1 (< 20h), Tier 2 (20–29h), Tier 3 (30+h) |
| **BCBA Supervision Hours/Week** | Tier 1: 10%, Tier 2: 15%, Tier 3: 20% of direct hours |
| **Parent Training Hours/Month** | Tier 1: low end, Tier 2: mid, Tier 3: high end of payer range (default 2–8) |
| **Treatment Goals** | Based on skill deficit count + FII severity (min 2, max 12) |
| **Clinical Flags** | HIGH RISK, Severe Impairment, Behavioral Risk, Environmental Stressors |
| **Calculation Breakdown** | Step-by-step rationale text |
| **ML Approval Probability** | Percentage likelihood of payer approval (Clinic portal only — see Section 8A) |

### 4.9 Payer Policy Overrides (Insurance Only)

The insurance portal allows customizing these multiplier weights, which scale the adjustment from each step before summing:

| Parameter | Default | Configurable Range |
|-----------|---------|-------------------|
| FII Weight | 1.0 | 0–2 |
| Vineland Weight | 1.0 | 0–2 |
| VB-MAPP Weight | 1.0 | 0–2 |
| Behavioral Weight | 1.0 | 0–2 |
| Environmental Weight | 1.0 | 0–2 |
| Max Hours | 40 | 10–50 |
| Min Hours | 10 | 5–20 |
| Age Multipliers (0-5 / 6-12 / 13+) | 1.2 / 1.0 / 0.85 | configurable |
| Supervision % | 15% | 5–30% |
| Parent Training Range | 2–8 hrs/mo | configurable |

---

## 5. Data Model

### 5.1 Assessment Form Data

```
{
  // Demographics
  age: number (0-21)
  diagnosis: "asd_level1" | "asd_level2" | "asd_level3" | "asd_unspecified"
  educationalSetting: string
  livingSituation: string

  // Vineland-3
  vineland: {
    communication: number (20-160)
    dailyLiving: number (20-160)
    socialization: number (20-160)
    motor: number (20-160)
    vinelandComposite: number (20-160, optional)
  }

  // VB-MAPP
  vbmapp: {
    milestones: number (0-170)
    barriers: number (0-24)
    transition: number (0-18, optional)
  }

  // FII (9 domains, each 0-4)
  fiiDomains: Record<string, number>

  // Skill Deficits (array of selected strings)
  skillDeficits: string[]

  // Behavioral Risk
  behavioral: {
    aggressionFreq: "none" | "weekly" | "6plus" | "daily"
    selfInjury: "none" | "mild" | "moderate" | "severe"
    elopement: boolean
    crisisEvents: "none" | "1" | "2plus"
  }

  // Environmental Modifiers (7 boolean checkboxes)
  envModifiers: Record<string, boolean>

  // Risk Assessment (6 factors, each 0-4, total 0-24)
  riskScores: Record<string, number>

  // Caregiver Burden (9 domains, each 0-4, total 0-36)
  caregiverBurden: {
    dailyManagement: number (0-4)
    physicalHealth: number (0-4)
    mentalHealth: number (0-4)
    familyRelationships: number (0-4)
    employmentImpact: number (0-4)
    financialBurden: number (0-4)
    socialIsolation: number (0-4)
    respiteAvailability: number (0-4)
    overallBurden: number (0-4)
  }

  // Service History
  previousABA: string
  previousHours: number (optional)
  otherServices: string[]

  // Treatment Priorities
  priorityGoals: string[] (max 3)
  treatmentDuration: string

  // Service Delivery
  serviceSettings: string[]
  insuranceType: string

  // Additional Clinical Info
  additionalInfo: string (free text)
}
```

### 5.2 Claim Object

```
{
  id: string ("CLM-XXXXX")
  patientId: string
  patientName: string
  requestedHours: number
  tier: 1 | 2 | 3
  fii: number
  riskScore: number
  caregiverBurdenScore: number
  mlApprovalProbability: number (0-100, clinic side only)
  flags: string[]
  rationale: string[]
  status: "pending" | "approved" | "denied"
  submittedAt: string (timestamp)
  diagnosis: string
  age: number

  // Added by insurance upon decision:
  insuranceNotes: string
  approvedHours: number
  decidedAt: string (timestamp)
}
```

### 5.3 Payer Profile (Insurance Config)

```
{
  name: string
  maxHours: number
  minHours: number
  fiiW: number (weight multiplier)
  vinW: number
  vbW: number
  behW: number
  envW: number
  ageMult: { young: number, mid: number, teen: number }
  supPct: number (supervision percentage)
  ptRange: [number, number] (parent training min/max hrs/mo)
}
```

### 5.4 ML Training Record (De-identified)

```
{
  id: string
  // All PHI stripped — no patient name, no DOB, no identifiers
  features: {
    age_band: "0-5" | "6-12" | "13+"
    diagnosis_level: 1 | 2 | 3
    fii_score: number
    vineland_composite_band: "severe" | "low" | "moderate" | "adequate"
    vbmapp_milestones_band: "low" | "mid" | "high"
    vbmapp_barriers: number
    risk_score: number
    caregiver_burden_score: number
    skill_deficit_count: number
    behavioral_severity: "none" | "mild" | "moderate" | "severe" | "crisis"
    env_modifier_count: number
    requested_hours: number
    tier: 1 | 2 | 3
  }
  actual_outcome: "approved" | "denied"
  approved_hours: number | null
  payer_type: string
  created_at: string (timestamp)
}
```

---

## 6. Assessment Form Sections (11 Sections)

### Section 1: Client Demographics
- Client Age (0–21, required)
- Primary Diagnosis (ASD Level 1/2/3/Unspecified, required)
- Educational Setting (dropdown)
- Living Situation (dropdown)

### Section 2: Diagnosis & Assessment Information
- Primary Diagnosis (required)
- Co-occurring Diagnoses (multi-select)
- Adaptive Functioning Score — assessment type + composite score (required)
- VB-MAPP Results — Milestones + Barriers (optional)
- ABLLS-R Assessment — Skills Mastered % + Priority Areas (optional)
- AFLS — Module + Score % (optional)

### Section 3: Vineland-3 Assessment
- Communication Standard Score (20–160)
- Daily Living Skills Standard Score (20–160)
- Socialization Standard Score (20–160)
- Motor Skills Standard Score (20–160)
- Adaptive Behavior Composite (optional)

### Section 4: VB-MAPP Assessment
- Milestones Total Score (0–170)
- Barriers Total Score (0–24)
- Transition Score (0–18, optional)

### Section 5: Functional Impairment Index
- 9 domains, each rated 0 (none) to 4 (severe)
- Live FII total displayed with base hours mapping

### Section 6: Skill Deficit Domains
- 8 checkable domains (Communication, Social Skills, Play Skills, Self-Care, Academic, Motor Skills, Executive Functioning, Community/Safety)

### Section 7: Behavioral Risk Modifiers
- Aggression Frequency (none / <6/wk / 6+/wk / daily)
- Self-Injury Severity (none / mild / moderate / severe)
- Crisis Events in past 6 months (none / 1 / 2+)
- Elopement (toggle yes/no)

### Section 8: Environmental Modifiers
- 7 checkbox items, each adds +2 hrs (capped at +8)

### Section 9: Risk Assessment
- 6 risk factors, each rated 0–4 (total 0–24)
- Risk of harm to self
- Risk of harm to others
- Elopement / wandering risk
- Lack of safety awareness
- Restrictive placement risk
- Medical complexity
- Prior psychiatric hospitalizations (optional)
- History of service termination due to behaviors (optional)

### Section 10: Caregiver Burden & Stress Assessment
- 9-domain evaluation scored 0–36
- Daily care management ability
- Physical health impact
- Mental/emotional health impact
- Family relationship impact
- Employment/work status impact
- Financial burden
- Social isolation
- Respite care availability
- Overall caregiver burden level

### Section 11: Service History, Treatment Priorities & Additional Info
- Previous ABA services (required)
- Previous hours per week (optional)
- Other current therapies (multi-select)
- Family availability for parent training (required)
- Primary language at home (required)
- Top priority treatment goals (select up to 3, required)
- Expected treatment duration (required)
- Preferred service setting (multi-select, required)
- Insurance/payer type (required)
- Additional clinical information (free text, optional)

---

## 7. Claims Pipeline Flow

```
CLINIC                          INSURANCE
  │                                │
  │  1. Fill 11-section form       │
  │  2. Calculate dosage           │
  │  3. ML predicts approval %    │
  │  4. Review Gap Analysis        │
  │  5. Submit claim ──────────────┤──▶ Appears in Review Queue
  │                                │
  │                                │  6. Review claim details
  │                                │  7. Optional: override hours
  │                                │  8. Add reviewer notes
  │                                │  9. Approve or Deny
  │                                │
  │  10. Status updates ◀──────────┤
  │      in "My Claims"            │
  │                                │
  │  11. ML retrains on outcome    │  10. Decision logged in
  │  12. Insights tab updates      │      "Decisions" history
  │      patterns to calibrate     │
  │      future submissions        │
  └────────────────────────────────┘
```

---

## 8. Insights / Learning Engine (Clinic Side)

The Insights tab on the clinic portal derives patterns by comparing approved vs denied claims:

- **Approval Rate** — Overall percentage with progress bar
- **FII Comparison** — Average FII of denied vs approved claims
- **Hours Comparison** — Average requested hours for denied vs approved
- **Risk Documentation Gaps** — Count of denials where risk score was below 10 (indicating weak risk documentation)
- **Caregiver Burden Gaps** — Comparison of burden scores in approved vs denied claims
- **Actionable Tips** — e.g., "Denied claims request higher hours — strengthen documentation for high-hour requests"

This data helps clinics understand what the insurance company's enhanced calculator is prioritizing, so they can adjust their documentation and requests accordingly.

### 8A. Machine Learning Approval Predictor (Clinic Side)

The ML predictor is the clinic's "catch-up" engine — it learns from historical claim outcomes to predict whether a new submission will be approved or denied before the clinic submits it.

**Model Type:** Logistic Regression (deployed on Clinic Instance only)

**Training Features (50+ data points):**
- Demographics (age band, diagnosis level, educational setting, living situation)
- Domain scores (FII total, individual FII domains, Vineland composite/domains, VB-MAPP milestones/barriers)
- Risk factors (risk score total, individual risk categories, behavioral severity)
- Caregiver burden score
- Environmental modifier count
- Skill deficit count and types
- Requested hours and tier
- Service history (previous ABA, other services)
- Payer type
- Historical claim patterns (approval rates by hour range, by diagnosis level, etc.)

**Target Label:** `actual_outcome` (Approved / Denied)

**UI Requirements:**
- Display **Approval Probability** as a percentage gauge before claim submission
- Generate **Gap Analysis Report** identifying specific documentation weaknesses likely to result in denial (e.g., "Risk score is 8 — claims with risk scores below 10 requesting 30+ hours are denied 75% of the time")
- Show **Confidence Interval** for the prediction (low / medium / high confidence based on training data volume)
- Provide **Actionable Recommendations** — specific fields the clinic could strengthen to improve approval odds

**Data Handling:**
- **Automatic PHI de-identification** before any data enters the ML pipeline
- Patient names, IDs, dates of birth, and all HIPAA-defined identifiers are stripped
- Only banded/categorical features are used (age bands, score ranges, not raw values where possible)
- De-identified training records stored in separate `ml_training_data` table (see Section 13)
- Model retrains automatically when new decided claims accumulate (configurable threshold, default: every 20 new outcomes)

**Minimum Data Requirement:** ML predictions are only displayed after a minimum of 30 decided claims (approved + denied) are available for training. Before this threshold, the Insights tab shows pattern-based analytics only.

---

## 9. Evidence Base & Research References

The dosage algorithm is grounded in peer-reviewed research:

| Age Group | Base Recommendation | Source |
|-----------|-------------------|--------|
| 0–3 years (EIBI) | 25 hrs/week | Eldevik et al., 2009; Reichow, 2012 |
| 3–6 years | 25 hrs/week | Virues-Ortega, 2010 |
| 6–12 years | 15 hrs/week | Leaf et al., 2020 |
| 12+ years | 10 hrs/week | Peters-Scheffer et al., 2011 |

Key citations:
1. Eldevik, S., et al. (2009). Meta-analysis of EIBI. *Behavior Modification*, 33(5), 588–604.
2. Virues-Ortega, J. (2010). Dose-response meta-analysis. *Clinical Psychology Review*, 30(4), 387–399.
3. Lovaas, O.I. (1987). Behavioral treatment in young autistic children. *JCCP*, 55(1), 3–9.
4. Reichow, B. (2012). Overview of EIBI meta-analyses. *JADD*, 42(4), 512–520.
5. Sundberg, M.L. (2008). VB-MAPP. AVB Press.
6. Partington, J.W. (2006). ABLLS-R. Behavior Analysts, Inc.
7. Osborne, L.A., et al. (2008). Parenting stress and intervention effectiveness. *JADD*, 38(6), 1092–1103.
8. Vivanti, G., et al. (2014). Outcome for children receiving the Early Start Denver Model. *JADD*, 44(7), 1684–1697.
9. Perry, A., et al. (2011). Predictors of outcome for children receiving IBI. *Research in ASD*, 5(1), 592–603.
10. National Standards Project (2015). Findings and conclusions: Phase 2. National Autism Center.

---

## 10. UI/UX Specifications

### 10.1 Design System

| Token | Value |
|-------|-------|
| Background | `#0B0E14` |
| Card | `#13161F` |
| Border | `#232837` |
| Text Primary | `#E4E8F1` |
| Text Muted | `#7E879D` |
| Text Dim | `#4A5168` |
| Clinic Accent (green) | `#3DDC84` |
| Insurance Accent (purple) | `#A78BFA` |
| Danger | `#FF5A5A` |
| Success | `#3DDC84` |
| Warning | `#FFB84D` |
| Teal | `#2DD4BF` |
| Font | DM Sans (400–800) |
| Mono Font | DM Mono |

### 10.2 Component Library

- **Collapsible Sections** — Numbered sections with toggle collapse
- **Rating Row** — 0–4 button selector with color coding (green → yellow → red)
- **Chip Select** — Toggle chips for multi-select (skill deficits, behavior types)
- **Meter** — Horizontal progress bar with label and fraction display
- **Badge** — Colored pill for status labels
- **Results Panel** — Large hour display, tier badge, 3-stat grid, meters, flags, breakdown
- **Probability Gauge** — Circular or semi-circular gauge for ML approval probability (clinic only)
- **Gap Analysis Card** — Expandable card showing documentation weaknesses with severity indicators

### 10.3 Accessibility

- WCAG 2.1 Level AA compliance target
- All inputs have labels
- Color is never the sole indicator (badges include text)
- Keyboard navigable

---

## 11. Non-Functional Requirements

### Performance
- Calculation < 2 seconds
- ML prediction < 2 seconds
- PDF generation < 5 seconds
- Support 50 concurrent users

### Security & Compliance
- **HIPAA 2026 compliant** (current regulatory standards as of build date)
- TLS 1.3 encryption in transit
- AES-256 encryption at rest for all PHI
- PHI access logging (100% of access logged with user ID and timestamp)
- 30-minute session timeout
- Role-based access control
- MFA required for all administrative accounts
- Physical database isolation between clinic and insurance tenants
- Annual penetration testing
- Vulnerability scanning before each production release

### Interoperability
- Secure API bridge between isolated database instances
- JSON-based claim status handshakes
- HL7 FHIR readiness for future EHR integration (data model designed with FHIR resource mapping in mind)

### Availability
- 99.5% uptime during business hours (6am–8pm ET, Mon–Fri)
- Daily automated backups (success rate > 99%)
- RTO: 4 hours, RPO: 1 hour

---

## 12. Tech Stack Recommendation

| Layer | Technology |
|-------|-----------|
| Frontend | React (Next.js or Vite) |
| Styling | Tailwind CSS |
| State | Zustand or React Context |
| Backend | Node.js (Express or Next.js API routes) |
| Database | PostgreSQL (physically isolated instances per tenant) |
| Auth | Auth0 or Clerk (role-based, MFA-enabled) |
| PDF Generation | Puppeteer or React-PDF |
| ML Engine | Python (scikit-learn) via microservice or serverless function |
| Hosting | Vercel / AWS |
| Audit Trail | Append-only PostgreSQL table |
| Interoperability | JSON REST API bridge; HL7 FHIR adapter (Phase 2) |

---

## 13. Database Schema (Suggested)

### Clinic Instance

```sql
-- Users (clinic side)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL CHECK (role IN ('clinic_reviewer', 'clinic_admin')),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations (clinic side)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL DEFAULT 'clinic',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES organizations(id),
  patient_id VARCHAR,
  patient_name VARCHAR,
  form_data JSONB NOT NULL,  -- complete 11-section assessment input
  result JSONB NOT NULL,      -- calculation output
  ml_approval_probability NUMERIC(5,2),  -- ML prediction at time of calculation
  payer_profile_version INT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claims (clinic's copy — status synced via API bridge)
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  clinic_id UUID REFERENCES organizations(id),
  requested_hours INT NOT NULL,
  tier INT NOT NULL,
  fii INT NOT NULL,
  risk_score INT NOT NULL,
  caregiver_burden_score INT,
  ml_approval_probability NUMERIC(5,2),
  flags TEXT[],
  rationale TEXT[],
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  -- Synced from insurance upon decision:
  approved_hours INT,
  insurance_notes TEXT,
  decided_at TIMESTAMP
);

-- ML Training Data (de-identified)
CREATE TABLE ml_training_data (
  id UUID PRIMARY KEY,
  features JSONB NOT NULL,  -- de-identified feature vector (no PHI)
  actual_outcome VARCHAR NOT NULL CHECK (actual_outcome IN ('approved', 'denied')),
  approved_hours INT,
  payer_type VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ML Model Versions
CREATE TABLE ml_model_versions (
  id UUID PRIMARY KEY,
  version INT NOT NULL,
  training_sample_count INT NOT NULL,
  accuracy NUMERIC(5,4),
  precision_score NUMERIC(5,4),
  recall NUMERIC(5,4),
  model_artifact_path VARCHAR,
  is_active BOOLEAN DEFAULT false,
  trained_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log (append-only)
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Insurance Instance

```sql
-- Users (insurance side)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL CHECK (role IN ('insurance_reviewer', 'insurance_admin')),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations (insurance side)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL DEFAULT 'insurance',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payer Profiles
CREATE TABLE payer_profiles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  config JSONB NOT NULL,  -- stores all weight/threshold configs
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claims (insurance's copy — received via API bridge)
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  clinic_org_name VARCHAR,
  patient_id_hash VARCHAR,  -- hashed, not raw
  requested_hours INT NOT NULL,
  tier INT NOT NULL,
  fii INT NOT NULL,
  risk_score INT NOT NULL,
  caregiver_burden_score INT,
  assessment_data JSONB NOT NULL,  -- full form data for review
  flags TEXT[],
  rationale TEXT[],
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  received_at TIMESTAMP DEFAULT NOW(),
  -- Insurance decision fields
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMP,
  approved_hours INT,
  insurance_notes TEXT,
  payer_profile_id UUID REFERENCES payer_profiles(id)
);

-- Audit Log (append-only)
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 14. API Endpoints (Suggested)

```
POST   /api/auth/login
POST   /api/auth/logout

# Clinic endpoints
POST   /api/assessments              — Run calculator, save assessment
GET    /api/assessments               — List clinic's assessments
POST   /api/claims                    — Submit claim from assessment
GET    /api/claims                    — List clinic's claims with status
GET    /api/claims/insights           — Get learning insights
POST   /api/ml/predict                — Get ML approval probability for assessment
GET    /api/ml/gap-analysis/:id       — Get gap analysis for specific assessment
GET    /api/ml/model-info             — Get current model version, accuracy, sample size

# Insurance endpoints
GET    /api/insurance/queue           — Get pending claims
GET    /api/insurance/claims/:id      — Get full claim details
POST   /api/insurance/claims/:id/decide  — Approve or deny
GET    /api/insurance/decisions       — Decision history
POST   /api/insurance/calculate       — Run enhanced calculator
GET    /api/insurance/payer-profiles  — List payer configs
POST   /api/insurance/payer-profiles  — Create/update config

# API Bridge (internal, secured)
POST   /api/bridge/claims/submit      — Clinic → Insurance claim handoff
POST   /api/bridge/claims/decide      — Insurance → Clinic decision sync
GET    /api/bridge/claims/:id/status  — Status check (JSON handshake)
```

---

## 15. Phase 1 MVP Scope (Current Build)

### What's Built (Prototype)

- [x] Login screen with role selection (Clinic vs Insurance)
- [x] Complete 11-section assessment form with all inputs
- [x] Full dosage calculation engine (7-step algorithm)
- [x] Results panel with hours, tier, supervision, parent training, goals, flags, breakdown
- [x] Clinic: Calculator → Submit Claim → My Claims → Insights
- [x] Insurance: Review Queue → Review & Decide → Policy Calculator → Decisions → Policy Config
- [x] Claims pipeline (clinic submits → insurance reviews → status flows back)
- [x] Learning insights engine (compares denied vs approved)
- [x] Payer policy configuration (all weights and thresholds)
- [x] Dark theme UI with role-specific color accents
- [x] Caregiver burden assessment (9-domain, 0–36 scale)

### What's Needed for Production

- [ ] Real authentication (Auth0/Clerk with role-based access + MFA for admins)
- [ ] PostgreSQL databases (physically isolated — clinic instance + insurance instance)
- [ ] Secure API bridge between instances (claim handshake endpoints)
- [ ] API layer (all endpoints above)
- [ ] PDF report generation (Executive Summary, Clinical Justification, Audit Appendix)
- [ ] ML approval predictor microservice (logistic regression, auto-retrain, PHI de-identification pipeline)
- [ ] Gap Analysis report generation
- [ ] Multi-organization support (multiple clinics, multiple payers)
- [ ] Payer profile versioning with audit trail
- [ ] HIPAA 2026 compliance audit
- [ ] Data encryption at rest (AES-256)
- [ ] Session management and timeout (30 min)
- [ ] Email notifications for claim decisions
- [ ] CSV/JSON data export
- [ ] HL7 FHIR data model mapping documentation

---

## 16. Phase 2 — Future Enhancements

- SSO/SAML integration
- EHR system integration (HL7 FHIR adapter)
- Bulk CSV import of assessment data
- Automated data import from provider portals
- Provider portal for real-time status checking
- Advanced ML models (gradient boosting, neural nets) trained on larger datasets
- ML model A/B testing framework
- Multi-language support
- Mobile application
- Claims adjudication system integration
- ABLLS-R and AFLS assessment scoring integration (automated domain-level scoring)
- Predictive analytics dashboard for payers (denial pattern trends, volume forecasting)

---

## 17. Existing Project Files

The following source documents are available and should be referenced during development:

| File | Description |
|------|-------------|
| `BRD_ABA_Medical_Necessity_Calculator.docx` | Full Business Requirements Document with functional/non-functional requirements, user stories, acceptance criteria |
| `Medical_Necessity_Dosage_Tool_Developer_Specification.pdf` | Detailed dosage algorithm spec with all input questions and hour adjustment logic |
| `ABA_Medical_Necessity_Survey_Reference.pdf` | Complete 50+ question survey reference guide (11 sections) with all options, scoring, and evidence base |
| `aba_medical_necessity_survey.html` | Original HTML survey prototype (basic calculation, not using full algorithm) |
| `aba_calculator.jsx` | Current React prototype implementing the full dual-portal architecture |
| `ABA_Bridge_Cursor_Development_Contract.md` | Condensed Cursor-targeted contract with ML predictor spec and physical DB isolation requirements |

---

## 18. Key Implementation Notes

### Calculation Engine Must Be Identical

Both clinic and insurance calculators use the **exact same calculation engine**. The only difference is that the insurance version applies payer-specific weight multipliers to each adjustment step before summing. This ensures claims are always evaluated against the same underlying logic.

### Claim Immutability

Once a claim is submitted, the assessment data and calculation results are frozen. The insurance reviewer sees exactly what the clinic submitted. Overrides are tracked separately (approved hours vs requested hours).

### Audit Everything

Every calculation run, every claim submission, every decision, every configuration change, and every ML prediction must be logged with user ID, timestamp, and complete input/output data. This is a regulatory requirement for HIPAA compliance and appeals defense. Each execution must have a unique `run_id` and be fully reproducible.

### Physical Isolation Is Non-Negotiable

Clinic data and insurance data must live in physically separate database instances. The only bridge is the secured API handshake for claim pipeline operations. This prevents accidental data leakage between tenants and simplifies HIPAA compliance boundaries.

### The ML Predictor Is the Secret Weapon

The clinic's ability to predict approval probability before submission — and receive specific gap analysis feedback — is the core differentiator. As the clinic accumulates decided claims, the ML model improves and the Insights tab surfaces increasingly specific patterns (e.g., "Claims with FII < 15 and requested hours > 25 are denied 80% of the time"). Phase 1 uses logistic regression for interpretability. Phase 2 explores more complex models.

### PHI De-identification for ML

All data entering the ML pipeline must be automatically de-identified. No patient names, no raw dates of birth, no addresses, no identifiers. Features are banded (age ranges, score ranges) where possible. This is a hard requirement — the ML training table must pass a HIPAA Safe Harbor audit.

---

## 19. Acceptance Criteria

### Functional

- [ ] All 11 assessment sections render correctly with validation
- [ ] Calculation engine produces correct results for 100% of 50 test cases
- [ ] Clinic can complete full flow: assess → calculate → predict → submit → track
- [ ] Insurance can complete full flow: review → decide → history
- [ ] Policy config changes are reflected in insurance calculator immediately
- [ ] Claims flow from clinic to insurance queue correctly via API bridge
- [ ] Decisions flow back to clinic's claims list with notes via API bridge
- [ ] Insights generate after 2+ denied claims
- [ ] ML predictions display after 30+ decided claims are available
- [ ] Gap Analysis report generates with actionable recommendations
- [ ] PDF exports generate with professional formatting
- [ ] Caregiver burden assessment scores correctly across all 9 domains

### Performance

- [ ] Calculation completes in < 2 seconds
- [ ] ML prediction completes in < 2 seconds
- [ ] PDF generation in < 5 seconds
- [ ] Supports 50 concurrent users without degradation

### Security

- [ ] Physical database isolation enforced (clinic cannot query insurance DB and vice versa)
- [ ] Role-based access enforced (clinic cannot access insurance views)
- [ ] All PHI encrypted at rest (AES-256) and in transit (TLS 1.3)
- [ ] Session timeout after 30 minutes
- [ ] MFA enforced for all admin accounts
- [ ] Audit log captures all actions with unique run_id per execution
- [ ] ML training data passes PHI de-identification validation (no raw identifiers)

### ML Accuracy

- [ ] ML model achieves baseline accuracy on holdout test set after initial training
- [ ] Reduced prediction delta over 30-day simulated period
- [ ] Gap Analysis identifies top 3 documentation weaknesses per assessment
- [ ] Model retrains successfully when new outcome threshold is met

### Auditability

- [ ] Every execution has a unique `run_id`
- [ ] Any past decision can be fully reproduced from its `run_id`
- [ ] Configuration change history is complete with user attribution and timestamps

---

*End of Contract Document*
