# Changelog

All notable changes to the **Revora — AI Revenue Recovery Agent** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and follows a strict phase-by-phase versioning model.

---

## [Phase 1: Revenue Command Center & Foundation] - 2026-08-29

### Added
- **Monorepo Architecture**: Setup NPM workspaces supporting Express TypeScript backend and React TypeScript frontend.
- **Realistic Synthetic Payment Generator**:
  - Generation of realistic Indian customer profiles and payment transactions.
  - Multi-rail simulation: UPI (55%), Credit Card (20%), Debit Card (15%), Netbanking (6%), Wallet (3%), EMI (1%).
  - Core Indian banking institutions: HDFC, ICICI, SBI, AXIS, KOTAK, YES_BANK, PNB, BOB.
  - Authentic failure reason mapping across 8 distinct categories (`ISSUER_OUTAGE`, `CUSTOMER_AUTHENTICATION`, `INSUFFICIENT_FUNDS`, `TECHNICAL_TIMEOUT`, `CHECKOUT_ABANDONMENT`, `MANDATE_SUBSCRIPTION_ERROR`, `CARD_LIMIT_EXCEEDED`, `NETWORK_DROP`).
  - Realistic time-series anomaly clustering (HDFC UPI outage spike) to establish ground truth for Phase 2.
- **Backend Analytics & Payment Intelligence Engine**:
  - `GET /api/v1/health` for service and database readiness.
  - `GET /api/v1/analytics/overview` computing Revenue Processed, Revenue Lost, Revenue at Risk, Recovery Potential, Success and Failure rates.
  - `GET /api/v1/analytics/trends` providing time-series aggregated failure vs success buckets.
  - `GET /api/v1/analytics/breakdown` calculating payment rail, bank issuer, and root cause distributions.
  - `GET /api/v1/transactions` with Zod validation for filtering, sorting, pagination, and multi-field keyword search.
  - `GET /api/v1/transactions/:id` delivering granular lifecycle and simulated gateway error payloads.
  - `POST /api/v1/simulation/regenerate` for on-demand simulation dataset recreation.
- **Database Architecture**:
  - Supabase PostgreSQL relational schema (`database/schema.sql`) with tables for transactions, customers, incidents, recovery decisions, and audit logs.
  - High-performance in-memory database service with parity filtering for immediate zero-config demo execution.
- **Fintech SaaS Frontend (React 19 + Vite + Tailwind CSS)**:
  - Header with `REVORA` wordmark, `AI Revenue Recovery` descriptor, and live engine status indicator.
  - `Simulation Mode` banner with transparent data disclosure and dataset regeneration control.
  - Sidebar navigation spanning all 7 Revora milestones.
  - KPI Stat Cards with Indian currency formatting (`₹`, Lakhs, Crores).
  - Recharts Area visualization for rolling failure rate and volume tracking.
  - Multi-dimensional breakdown panels for payment methods, issuer degradation alerts, and failure root causes.
  - Transaction Explorer with search, multi-select filters, sortable columns, and paginated table.
  - Slide-over `Transaction Detail Drawer` displaying raw gateway payload, customer LTV, and diagnostic details.
- **Testing & Verification**:
  - 9 automated unit and integration tests passing in Vitest covering data generator, analytics computations, and REST endpoints.
  - Production TypeScript build passing with zero errors.
- **Project Documentation**:
  - Full suite of 11 required project documentation files.

---

## [Phase 2: Revora Intelligence & AI Revenue Detective] - 2026-08-29

### Added
- **AI Pattern Analysis Engine (`RevenueDetectiveService`)**:
  - Implementation of three real-time rule and evidence-based detection algorithms analyzing rolling transaction sliding windows.
  - **Issuer Bank Outage / Degradation Detection**: Scans banking institutions (HDFC, ICICI, SBI, AXIS, etc.) for elevated failure rates exceeding 35% threshold.
  - **UPI Switch Throttle Detection**: Identifies NPCI PSP routing congestion or issuer core banking system (CBS) timeout spikes on UPI payment rails.
  - **Authentication Failure Spike Detection**: Detects abnormal customer-side OTP/MPIN validation drops exceeding 2.5x normal baseline rate.
  - **Multi-Rail Gateway Failure Detection**: Identifies simultaneous degradation across multiple payment rails indicating upstream gateway infrastructure outages.
- **Incident Data Model & REST API**:
  - `RevenueIncident` data structure tracking severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), diagnosis type, affected issuer/rail, revenue at risk, failure rates, AI reasoning, confidence score, evidence array, and recovery recommendations.
  - `GET /api/v1/intelligence/detect` endpoint executing live AI pattern detection and returning structured incident reports.
  - `GET /api/v1/intelligence/incidents/:id` endpoint for retrieving detailed incident metadata.
- **Smart Silence Signature Feature**:
  - Automated suppression recommendation when infrastructure outages (issuer CBS drops or multi-rail gateway failures) are detected.
  - Prevents spamming or annoying customers during ongoing bank/gateway technical outages.
- **AI Revenue Detective Dashboard UI (`DetectiveDashboard` & `IncidentCard`)**:
  - Interactive incident command interface integrated into Revora workspace navigation.
  - Real-time incident severity badges, confidence score metrics, and revenue at risk calculations.
  - Expandable incident cards showing full AI diagnosis, structured evidence lists, and actionable recovery advice.
  - Global Smart Silence indicator banner showing active customer outreach suppression state.
  - Re-run detection button with multi-stage progress indication.
- **Automated Testing Suite**:
  - 11 new Vitest unit and integration tests (`revenueDetective.test.ts`) validating anomaly detection, HDFC spike detection, severity classification, confidence scoring, evidence generation, and API contract compliance.
  - Total backend test suite expanded to 20/20 passing tests.

---

## [Phase 3: Customer Intent & Recovery Score Engine] - 2026-08-29

### Added
- **Recovery Probability Scoring Engine (`RecoveryScoringService`)**:
  - Implementation of dynamic recovery probability algorithm ($P_{recovery}$) combining four weighted sub-scores:
    - **Category Recoverability ($S_{category}$, 35% weight)**: Baseline recoverability mapped across 8 failure categories (e.g. OTP drop = 90, Checkout abandonment = 82, Insufficient funds = 25).
    - **Customer History & LTV ($S_{history}$, 30% weight)**: Historical order volume and lifetime value tiering.
    - **Recency Decay ($S_{recency}$, 20% weight)**: Time-decay curve prioritizing fresh failures (<15 min).
    - **Amount Elasticity ($S_{amount}$, 15% weight)**: Value-proportional recovery elasticity.
  - Priority classification into `HIGH` ($\ge 75\%$), `MEDIUM` ($50\%-74\%$), and `LOW` ($<50\%$).
  - Estimated recoverable INR computation per opportunity ($P_{recovery} \times \text{amountInr}$).
- **Action Strategy Assignment Engine**:
  - Rule-driven mapping assigning optimal candidate strategies (`IMMEDIATE_PAYMENT_LINK`, `WHATSAPP_NUDGE`, `EMAIL_RECOVERY`, `SMART_RETRY`, `CONCIERGE_OUTREACH`, `SMART_SILENCE`).
  - Integration with Phase 2 Smart Silence triggers to suppress outreach for degraded issuer switches.
- **REST API Endpoints**:
  - `GET /api/v1/opportunities`: Returns scored recovery opportunity feed, total estimated recoverable INR, priority counts, average score, and optional priority/search filtering.
  - `GET /api/v1/opportunities/:id`: Fetches detailed opportunity metadata and score factor weights.
- **Recovery Opportunities Dashboard UI (`OpportunitiesDashboard` & `OpportunityCard`)**:
  - Interactive workspace dashboard with KPI cards for Estimated Recoverable Revenue, Total Opportunities, Avg Recovery Score, and High Priority counts.
  - Priority filter tab controls (`ALL`, `HIGH`, `MEDIUM`, `LOW`) and real-time search filtering.
  - Expandable opportunity cards featuring score badges, priority tags, strategy pills, estimated recoverable values, customer LTV indicators, and detailed factor score breakdowns.
- **Automated Testing Suite**:
  - 8 new Vitest unit and integration tests (`recoveryScoring.test.ts`) testing score bounds, factor weight calculations, strategy assignment, priority filtering, and API contracts.
  - Total backend test suite expanded to **28/28 passing tests**.