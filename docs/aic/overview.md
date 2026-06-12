# AI Context — Iris Protocol Documentation

> **Start here:** [`ai_context.md`](./ai_context.md) is the **master all-in-one reference** for agents working on Iris Protocol.

---

## Quick Links

| Document | Purpose |
|----------|---------|
| **[`ai_context.md`](./ai_context.md)** | Full protocol spec — Foundation, Keepers, IXToken, governance, adapter, audits, conventions |
| [`docs/_internal/00-welcome.md`](../_internal/00-welcome.md) | Raw agent brief with embedded Solidity + test output (excluded from public site) |

---

## Canonical Model (Summary)

- **15 Foundation Chairs** (token IDs 0–14), functionally identical, no on-chain names
- **5%** trader profit fee → `ClaimRewards` equal split among live Chairs
- **50% + 1** Consul veto; single-Chair Kamikaze burn for emergencies
- **5 Keeper NFTs** — execution incentives separate from Foundation fee
- **VotingEscrow clock:** block number (`IERC6372`)

**Deprecated:** 7 Kings, 2% fee, 4-of-7 veto, Consoul contract.

---

## Public Docs Site

Published at `docs/` (Docusaurus, `routeBasePath: /`). Build with `pnpm build`.

**Security:** `security@irislab.net`
