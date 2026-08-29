# AI Decisions & Intelligence Framework

This document outlines the decision-making models, reasoning structure, and safety governance employed by **Revora — AI Revenue Recovery Agent**.

---

## 1. Core Agent Philosophy

Revora operates as an **active, bounded financial agent**, not a generic chatbot.

Every decision follows a deterministic 5-part structure:
1. **Observation**: What occurred (failure rate spike, specific error code, customer purchase history)?
2. **Diagnosis**: Why did it fail (issuer CBS outage, user OTP fatigue, insufficient balance)?
3. **Probability Scoring**: What is the likelihood of successful recovery?
4. **Action Recommendation**: What bounded action yields the highest expected revenue recovery?
5. **Safety & Policy Verification**: Does this action comply with merchant rules, cooldowns, and human approval gates?

---

## 2. Failure Diagnosis & Incident Taxonomy (Phase 2 Scaffolding)

Revora categorizes payment failures into four macro-domains:

| Domain | Primary Causes | AI Diagnosis Rule | Typical Action |
| :--- | :--- | :--- | :--- |
| **Infrastructure / Issuer** | CBS Timeout, NPCI Throttle, 503 Gateway Down | High concentration of failures on a single bank within a short rolling window (>35% failure rate). | **`SMART_SILENCE`** / `WAIT` |
| **Customer Auth** | Incorrect OTP, Incorrect MPIN, 3DS Challenge Fail | Customer attempted transaction but failed 2FA step; high intent indicated by multiple recent orders. | **`SEND_PAYMENT_LINK`** / `SEND_WHATSAPP` |
| **Friction / Abandonment** | Drop-off on checkout screen, payment selector timeout | User did not initiate OTP; abandoned cart on step 2/3. | **`SEND_EMAIL`** with cart recovery |
| **Account / Card Limits** | Insufficient funds, international txn disabled | Card declined by issuer due to customer account status. | **`SUGGEST_ALTERNATE_PAYMENT_METHOD`** (e.g. UPI / Netbanking) |

---

## 3. Recovery Probability Scoring Model (Phase 3 Scaffolding)

The recovery probability $P_{recovery}$ is calculated dynamically using weighted behavioral signals:

$$P_{recovery} = w_1 \cdot S_{history} + w_2 \cdot S_{category} + w_3 \cdot S_{amount} + w_4 \cdot S_{recency}$$

Where:
- **$S_{history}$**: Customer lifetime value and historical payment success ratio ($0.0 \to 1.0$).
- **$S_{category}$**: Baseline recoverability of the failure code (e.g., OTP timeout is highly recoverable $0.85$, while chronic insufficient funds is low $0.20$).
- **$S_{amount}$**: Transaction size elasticity factor.
- **$S_{recency}$**: Time elapsed since failure (decay function where immediate response within 15 min has highest conversion).

---

## 4. Bounded Action Taxonomy (Phase 4 Scaffolding)

Revora Agent selects strictly from a predefined set of bounded actions:

- `WAIT`: Hold outreach while monitoring external conditions.
- `RETRY`: Execute background server-side re-attempt (for recurring/mandate failures).
- `SEND_PAYMENT_LINK`: Dispatch an instant 1-click Razorpay payment link via SMS/WhatsApp.
- `SEND_EMAIL`: Send a branded recovery email with alternate payment options.
- `SEND_WHATSAPP`: Send a contextual WhatsApp message in the customer's preferred language (English / Hindi / Hinglish).
- `SUGGEST_ALTERNATE_PAYMENT_METHOD`: Prompt customer to switch from failing card to UPI.
- `ESCALATE_TO_HUMAN`: Flag high-value transactions (>= ₹50,000) for merchant concierge outreach.
- `DO_NOT_CONTACT` (**Smart Silence**): Suppress all notifications to avoid customer irritation during systemic outages.

---

## 5. Explainability & Evidence

Every AI decision in Revora MUST include:
1. **Confidence Score** (e.g. `91% confidence`).
2. **Empirical Evidence** (e.g. `143 failures in 12 min, 92% associated with HDFC UPI`).
3. **Estimated Recoverable Amount** (e.g. `₹2,174 out of ₹2,499`).
4. **Policy Check Status** (e.g. `Policy Gate: Approved / Cooldown Verified`).