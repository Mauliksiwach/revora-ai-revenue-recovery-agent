-- ============================================================================
-- REVORA — AI Revenue Recovery Agent
-- Supabase PostgreSQL Database Schema (Phase 1 Baseline + Scaffolding)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE payment_status_enum AS ENUM (
    'SUCCESS',
    'FAILED',
    'PENDING',
    'ABANDONED',
    'REFUNDED'
);

CREATE TYPE payment_method_enum AS ENUM (
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'NETBANKING',
    'WALLET',
    'EMI'
);

CREATE TYPE failure_category_enum AS ENUM (
    'ISSUER_OUTAGE',
    'CUSTOMER_AUTHENTICATION',
    'INSUFFICIENT_FUNDS',
    'TECHNICAL_TIMEOUT',
    'CHECKOUT_ABANDONMENT',
    'MANDATE_SUBSCRIPTION_ERROR',
    'CARD_LIMIT_EXCEEDED',
    'NETWORK_DROP'
);

CREATE TYPE recovery_action_enum AS ENUM (
    'WAIT',
    'RETRY',
    'SEND_PAYMENT_LINK',
    'SEND_EMAIL',
    'SEND_WHATSAPP',
    'SUGGEST_ALTERNATE_PAYMENT_METHOD',
    'ESCALATE_TO_HUMAN',
    'DO_NOT_CONTACT'
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    successful_orders INTEGER DEFAULT 0,
    lifetime_value_inr NUMERIC(12, 2) DEFAULT 0.00,
    preferred_payment_method payment_method_enum DEFAULT 'UPI',
    preferred_language VARCHAR(16) DEFAULT 'en', -- en, hi, hinglish
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY, -- e.g. tx_01H... or pay_...
    order_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status payment_status_enum NOT NULL,
    payment_method payment_method_enum NOT NULL,
    issuer_bank VARCHAR(64) NOT NULL, -- HDFC, ICICI, SBI, AXIS, etc.
    failure_category failure_category_enum,
    failure_code VARCHAR(64),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    is_subscription BOOLEAN DEFAULT FALSE,
    is_synthetic BOOLEAN DEFAULT TRUE,
    error_payload JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_issuer_bank ON transactions(issuer_bank);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_failure_category ON transactions(failure_category);

-- Incidents Table (Revora Intelligence / AI Revenue Detective - Phase 2 Scaffolding)
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(16) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(16) DEFAULT 'ACTIVE', -- ACTIVE, INVESTIGATING, RESOLVED, MONITORED
    affected_issuer VARCHAR(64),
    affected_method payment_method_enum,
    affected_transactions_count INTEGER DEFAULT 0,
    affected_revenue_inr NUMERIC(12, 2) DEFAULT 0.00,
    ai_diagnosis TEXT NOT NULL,
    ai_confidence_pct NUMERIC(5, 2) NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    recommendation TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Recovery Opportunities & Decisions (Phase 3 & 4 Scaffolding)
CREATE TABLE IF NOT EXISTS recovery_decisions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    recovery_probability_pct NUMERIC(5, 2) NOT NULL,
    priority VARCHAR(16) NOT NULL, -- HIGH, MEDIUM, LOW
    estimated_recoverable_inr NUMERIC(12, 2) NOT NULL,
    recommended_action recovery_action_enum NOT NULL,
    ai_reasoning TEXT NOT NULL,
    policy_approved BOOLEAN DEFAULT FALSE,
    requires_human_approval BOOLEAN DEFAULT FALSE,
    action_status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, APPROVED, EXECUTED, REJECTED, SUPPRESSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Decision Timeline & Audit Logs (Phase 7 Scaffolding)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(64) NOT NULL,
    actor VARCHAR(64) NOT NULL, -- REVORA_AGENT, POLICY_ENGINE, HUMAN_OPERATOR, SYSTEM
    entity_id VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE transactions IS 'Revora Transaction Ledger storing payment lifecycle events and failure diagnostics';
COMMENT ON TABLE customers IS 'Customer transaction and recovery profile';
