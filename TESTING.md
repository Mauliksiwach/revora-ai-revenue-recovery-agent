# Testing & Verification Guide

This document outlines the testing strategy, test suites, test execution commands, and coverage metrics for **Revora — AI Revenue Recovery Agent**.

---

## 1. Test Architecture

Revora incorporates a multi-tier testing pipeline:
1. **Unit Tests**: Verifying synthetic data generator distribution, mathematical precision of financial KPIs, and Zod filter schemas.
2. **Integration Tests**: Validating Express REST API endpoints, HTTP status codes, error payload schemas, and pagination logic.
3. **Build & Type Check Tests**: Verifying complete TypeScript type safety and production asset compilation across frontend and backend.

---

## 2. Test Suites (Phase 1)

### A. Data Generator Suite (`backend/tests/dataGenerator.test.ts`)
- `should generate the requested number of synthetic customers`: Verifies customer profile structure and lifetime value calculations.
- `should generate synthetic transactions with realistic Indian payment attributes`: Validates statuses, payment methods, bank entities, currency codes, and error codes.
- `should generate spike anomaly when enabled`: Confirms the presence of HDFC UPI outage clusters to support Phase 2 testing.

### B. Analytics Service Suite (`backend/tests/analytics.test.ts`)
- `should accurately compute overview KPIs`: Tests total volume, successful/failed counts, revenue at risk (₹), and success/failure percentage math.

### C. API Endpoints Suite (`backend/tests/api.test.ts`)
- `GET /api/v1/health`: Verifies health status response and service metadata.
- `GET /api/v1/analytics/overview`: Tests JSON structure of KPI summary.
- `GET /api/v1/transactions`: Tests default pagination and total transaction count.
- `GET /api/v1/transactions with filters`: Tests status-based filtering (`status=FAILED`).
- `GET /api/v1/transactions/:id`: Tests 404 response on non-existent transaction IDs.

---

## 3. Running the Tests

### Execute All Backend Tests
```bash
npm --workspace=backend test
```

### Run Tests in Watch Mode
```bash
npm --workspace=backend run test:watch
```

### Validate Frontend Production Build
```bash
npm --workspace=frontend run build
```

---

## 4. Test Execution Results (Phase 1 Checkpoint)

```text
 RUN  v3.2.7 C:/Users/mauli/.../revora-ai-revenue-recovery-agent/backend

 ✓ tests/dataGenerator.test.ts (3 tests) 36ms
 ✓ tests/analytics.test.ts (1 test) 3ms
 ✓ tests/api.test.ts (5 tests) 45ms

 Test Files  3 passed (3)
      Tests  9 passed (9)
   Duration  952ms
```