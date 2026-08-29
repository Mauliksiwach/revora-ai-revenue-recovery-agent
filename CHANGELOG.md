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