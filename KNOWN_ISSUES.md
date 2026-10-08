# Known Issues & Simulation Boundaries

This document records active limitations, design constraints, and simulation boundaries for **Revora — AI Revenue Recovery Agent**.

---

## 1. Phase 1, 2, 3 & 4 Boundaries

- **Simulation Mode Active**: Transaction data is generated synthetically to establish realistic Indian payment failure patterns (including seeded HDFC UPI degradation spikes). While the backend architecture supports live Supabase PostgreSQL connection, zero-config in-memory operation is default when external credentials are not set.
- **Phases 1, 2, 3 & 4 Active**: *Revenue Command Center* (Phase 1), *AI Revenue Detective* (Phase 2), *Recovery Opportunities* (Phase 3), and *Revora Agent Control Room* (Phase 4) are fully functional. Navigation items for Phase 5 through Phase 7 are badged with their upcoming milestone targets in the sidebar.

---

## 2. Technical Limitations

- **Browser Storage Limits**: When running on in-memory mode, dataset changes (such as regenerating synthetic transactions) persist only for the lifetime of the backend Node.js process. Connecting a live Supabase PostgreSQL instance provides permanent persistence.
- **Simulated Latency**: Network round-trip times to Indian banking gateways are currently calculated deterministically based on empirical statistics.