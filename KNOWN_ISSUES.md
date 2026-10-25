# Known Issues & Simulation Boundaries

This document records active limitations, design constraints, and simulation boundaries for **Revora — AI Revenue Recovery Agent**.

---

## 1. Complete 7-Phase Platform Active

- **Simulation Mode Active**: Transaction data is generated synthetically to establish realistic Indian payment failure patterns (including seeded HDFC UPI degradation spikes). While the backend architecture supports live Supabase PostgreSQL connection, zero-config in-memory operation is default when external credentials are not set.
- **All 7 Phases Fully Operational**: *Revenue Command Center* (Phase 1), *AI Revenue Detective* (Phase 2), *Recovery Opportunities* (Phase 3), *Revora Agent Control Room* (Phase 4), *Smart Silence* (Phase 5), *Recovery Lab* (Phase 6), and *Decision Timeline & Outcome Proof* (Phase 7) are fully functional and verified across 59 automated tests.

---

## 2. Technical Limitations

- **Browser Storage Limits**: When running on in-memory mode, dataset changes (such as regenerating synthetic transactions) persist only for the lifetime of the backend Node.js process. Connecting a live Supabase PostgreSQL instance provides permanent persistence.
- **Simulated Latency**: Network round-trip times to Indian banking gateways are currently calculated deterministically based on empirical statistics.