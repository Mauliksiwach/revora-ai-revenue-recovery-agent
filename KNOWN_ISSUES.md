# Known Issues & Simulation Boundaries

This document records active limitations, design constraints, and simulation boundaries for **Revora — AI Revenue Recovery Agent**.

---

## 1. Phase 1 Boundaries

- **Simulation Mode Active**: During Phase 1, transaction data is generated synthetically to establish realistic Indian payment failure patterns. While the backend architecture supports live Supabase PostgreSQL connection, zero-config in-memory operation is default when external credentials are not set.
- **Scaffolded Navigation Items**: Navigation items for future phases (Phase 2: *AI Revenue Detective*, Phase 3: *Recovery Opportunities*, Phase 4: *Revora Agent*, Phase 5: *Smart Silence*, Phase 6: *Recovery Lab*, Phase 7: *Decision Timeline*) are visibly badged with their respective target milestones in the sidebar.

---

## 2. Technical Limitations

- **Browser Storage Limits**: When running on in-memory mode, dataset changes (such as regenerating synthetic transactions) persist only for the lifetime of the backend Node.js process. Connecting a live Supabase PostgreSQL instance provides permanent persistence.
- **Simulated Latency**: Network round-trip times to Indian banking gateways are currently calculated deterministically based on empirical statistics.