# Revora Engineering Roadmap

This document outlines the 7-phase build plan for **Revora — AI Revenue Recovery Agent** tailored for the **Razorpay AI Buildathon**.

---

## Phase Breakdown

### ✅ Phase 1: Revenue Command Center & Core Architecture (COMPLETED)
- Realistic synthetic Indian transaction generator (UPI, Cards, Netbanking, Mandates).
- Supabase PostgreSQL schema with dual-mode in-memory fallback.
- KPI metric calculation engine (Revenue Processed, Revenue at Risk, Revenue Lost, Success/Failure Rates).
- Fintech SaaS Dashboard with Recharts time-series trends and failure category breakdowns.
- Searchable, filterable, sortable Transaction Explorer with slide-over detail drawer.
- Comprehensive automated test suite (9 Vitest tests) & full documentation.

---

### ✅ Phase 2: AI Revenue Detective / Revora Intelligence (COMPLETED)
- Automated pattern detection for issuer-side CBS downtime and NPCI switch throttles.
- Incident Management System (Incident ID, affected transactions, affected revenue, confidence score).
- AI diagnostic explanations with empirical evidence and structured metrics significance.
- Smart Silence feature suppressing outreach during active systemic bank/gateway outages.
- Incident Alert Banner and AI Revenue Detective Dashboard UI (`DetectiveDashboard` & `IncidentCard`).
- 11 automated Vitest unit & integration tests (20/20 total backend tests passing).

---

### ✅ Phase 3: Customer Intent & Recovery Score Engine (COMPLETED)
- Recovery Probability Engine ($P_{recovery}$) using weighted historical ($S_{history}$), failure code ($S_{category}$), recency ($S_{recency}$), and elasticity ($S_{amount}$) signals.
- Opportunity priority classification (High $\ge 75\%$, Medium $50\%-74\%$, Low $<50\%$).
- Estimated recoverable revenue calculation per opportunity.
- Action Strategy Assignment Engine (`IMMEDIATE_PAYMENT_LINK`, `WHATSAPP_NUDGE`, `EMAIL_RECOVERY`, `SMART_RETRY`, `CONCIERGE_OUTREACH`, `SMART_SILENCE`).
- Interactive `OpportunitiesDashboard` & `OpportunityCard` with priority tabs, search, and factor score breakdowns.
- 8 automated Vitest tests (28/28 total backend tests passing).

---

### ⏳ Phase 4: Revora Agent (Core AI Agent)
- Autonomous decision engine selecting bounded recovery actions (`WAIT`, `RETRY`, `SEND_PAYMENT_LINK`, `SEND_WHATSAPP`, `ESCALATE_TO_HUMAN`).
- Deterministic Policy Gate enforcing merchant rules, communication cooldowns, and message caps.
- Human Approval Queue for high-ticket transactions (>= ₹50,000).
- Revora Agent command center view.

---

### ⏳ Phase 5: Smart Silence & Incident Cooldown
- Signature "Do Nothing" intelligence for systemic issuer degradation.
- Real-time pause, monitoring, and automated resumption of recovery pipelines.
- Early warning alerts for revenue loss spikes.

---

### ⏳ Phase 6: Recovery Lab (Strategy Simulator)
- Multi-strategy recovery simulator comparing: Immediate Retry vs Delayed Retry vs Email vs WhatsApp vs Payment Link vs AI Adaptive.
- Estimated revenue recovery, unnecessary contacts prevented, and ROI analytics.
- Interactive scenario testing sandbox.

---

### ⏳ Phase 7: Decision Timeline, Outcome Proof & Multi-Lingual Outreach
- Immutable audit ledger recording every payment event, AI decision, policy verification, and recovery result.
- AI Performance evaluation dashboard (prediction accuracy, false positives, revenue recovered).
- Multi-lingual customer communication support (English, Hindi, Hinglish).
- Buildathon pitch materials, judge walkthrough scripts, and final demo verification.