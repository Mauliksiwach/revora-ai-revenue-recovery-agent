# Security & Governance Policy

This document details the security principles, credential handling guidelines, policy gate boundaries, and data protection practices for **Revora — AI Revenue Recovery Agent**.

---

## 1. Core Security Principles

1. **Zero Financial Authority for Unbounded AI**: Revora AI models cannot directly trigger automated monetary debits or unrestricted refunds. All recovery actions pass through deterministic policy gates.
2. **Secrets & Credential Hygiene**: No production API keys, database passwords, or Razorpay secrets are committed to the codebase. `.env.example` contains placeholder tokens only.
3. **Deterministic Safety Policy Engine**:
   - Rate limiting and cooldown enforcement prevent customer notification spam.
   - High-value transactions (>= ₹50,000) require explicit human operator approval.
4. **Input Validation**: All incoming API requests are strictly validated using **Zod** schemas to mitigate SQL injection, prototype pollution, and malformed payload exploits.

---

## 2. Environment Variables & Secret Handling

| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `PORT` | Local server port | Public / Local |
| `SUPABASE_URL` | Supabase project endpoint | Protected |
| `SUPABASE_ANON_KEY` | Public client key (governed by RLS) | Protected |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend admin key | **Secret / Highly Sensitive** |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Protected |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | **Secret / Highly Sensitive** |

> **Note**: During development and demonstration phases, all sensitive keys remain optional. Revora seamlessly defaults to an isolated, safe in-memory simulation store.

---

## 3. Data Privacy & PII Handling

- All customer names, phone numbers, and email addresses in the development environment are **100% synthetically generated** using realistic name permutations.
- Real card numbers, CVVs, UPI MPINs, or bank passwords are **never stored, logged, or processed** by Revora.
- Customer preferences (e.g. language, notification channel) are strictly opted-in and sanitized.