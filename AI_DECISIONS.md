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

---

## 2. Failure Diagnosis & Incident Taxonomy (Phase 2 Implemented)

Revora Intelligence analyzes rolling 30-minute transaction windows to detect and diagnose four macro-domains of revenue loss:

| Domain / Diagnosis Type | Primary Causes | AI Diagnosis Rule & Thresholds | Implemented Action / Recommendation |
| :--- | :--- | :--- | :--- |
| **`ISSUER_OUTAGE`** / **`UPI_SWITCH_THROTTLE`** | Bank CBS Timeout, NPCI Throttle, 503 Gateway Down | Single bank issuer failure rate $>35\%$ (baseline 12%) in 30-min window with $>8$ transactions. High UPI concentration ($>60\%$) triggers `UPI_SWITCH_THROTTLE`. | **`SMART_SILENCE`** (Suppress customer outreach, monitor switch health) |
| **`AUTHENTICATION_SPIKE`** | Incorrect OTP, Incorrect MPIN, 3DS Challenge Fail | Customer auth failure rate $>2.5\times$ baseline ($>10\%$) in 30-min window with $>5$ failures. | **`SEND_PAYMENT_LINK`** (Send 15-min secure payment link via SMS/WhatsApp) |
| **`MULTI_RAIL_FAILURE`** | Gateway Outage, Acquirer Network Drop | $\ge 2$ payment rails (UPI, Cards, Netbanking) simultaneously experiencing failure rate $>35\%$. | **`ESCALATE_TO_HUMAN`** & **`SMART_SILENCE`** (Pause automated recovery, alert merchant team) |
| **`CHECKOUT_ABANDONMENT_SURGE`** | Cart Drop-off, Payment Selector Timeout | Checkout abandonment rate $>2.0\times$ normal baseline. | **`SEND_EMAIL`** (Branded cart recovery with alternate payment rails) |

---

### 2.1 Smart Silence Signature Feature

When Revora Intelligence detects an **`ISSUER_OUTAGE`** or **`MULTI_RAIL_FAILURE`**, it automatically activates **Smart Silence**:
- **Why**: Contacting customers during a bank or gateway outage irritates buyers and results in repeat failed attempts, damaging conversion trust.
- **Mechanism**: Suppresses all automated customer recovery outreach (SMS, WhatsApp, email) for the affected bank/rail until switch failure rates drop below baseline.
- **Value**: Protects brand reputation and prevents redundant recovery attempts during infrastructure downtime.

---

## 3. Recovery Probability Scoring Model (Phase 3 Implemented)

The recovery probability $P_{recovery}$ is calculated dynamically using weighted behavioral signals ($0 \to 100\%$):

$$P_{recovery} = 0.35 \cdot S_{category} + 0.30 \cdot S_{history} + 0.20 \cdot S_{recency} + 0.15 \cdot S_{amount}$$

Where:
- **$S_{category}$ (35% Weight)**: Failure reason recoverability score ($0-100$). OTP/2FA drop = $90$, Checkout abandonment = $82$, Timeout = $75$, Mandates = $70$, Card limit = $58$, Issuer outage = $40$, Insufficient funds = $25$.
- **$S_{history}$ (30% Weight)**: Customer LTV and order frequency. $>10$ orders / $\ge \text{₹25,000}$ LTV = $95$; $\ge 5$ orders = $85$; $\ge 2$ orders = $70$; $1$ order = $55$.
- **$S_{recency}$ (20% Weight)**: Time decay factor. $\le 15$ min = $95$; $\le 60$ min = $82$; $\le 6$ hours = $65$; $>6$ hours = $50$.
- **$S_{amount}$ (15% Weight)**: Value elasticity factor. $\ge \text{₹50,000}$ = $95$; $\ge \text{₹10,000}$ = $88$; $\ge \text{₹2,000}$ = $78$; $< \text{₹2,000}$ = $65$.

### 3.1 Estimated Recoverable Revenue Formula

$$\text{Estimated Recoverable INR} = \text{amountInr} \times \left( \frac{P_{recovery}}{100} \right)$$

### 3.2 Strategy Assignment Logic

| Conditions | Assigned Strategy | Action Rationale |
| :--- | :--- | :--- |
| Active Issuer Outage (Smart Silence) | `SMART_SILENCE` | Suppress outreach during active bank CBS outage. |
| Amount $\ge \text{₹50,000}$ | `CONCIERGE_OUTREACH` | High-value transaction requires VIP phone concierge outreach. |
| Category = `CUSTOMER_AUTHENTICATION` | `IMMEDIATE_PAYMENT_LINK` | Send instant 15-min 1-click payment link via SMS/WhatsApp. |
| Category = `CHECKOUT_ABANDONMENT` | `WHATSAPP_NUDGE` | Send conversational WhatsApp nudge with cart details. |
| Category = `MANDATE_SUBSCRIPTION_ERROR` | `SMART_RETRY` | Schedule background server-side retry off-peak. |
| Category = `INSUFFICIENT_FUNDS` / `LIMIT` | `EMAIL_RECOVERY` | Send email inviting switch to UPI / Netbanking. |

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