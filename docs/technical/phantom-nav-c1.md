---
id: phantom-nav-c1
title: Phantom NAV — Protocol Debt (C-1)
description: Optimistic affiliate accounting disposition for protocolDebt in IXToken.
sidebar_position: 3
---

# Phantom NAV — Protocol Debt (C-1)

## Status: Acknowledged / By Design

Audit disposition **C-1** covers the optimistic accounting introduced by `protocolDebt` in `IXToken`.

---

## Mechanism

On `depositWithAffiliate`:

1. Full gross `assets` pulled from depositor into idle cash `I`
2. Affiliate receives rebasing shares for `affiliateFeeBps` slice
3. **`protocolDebt += affiliateAmount`** — virtual asset booked in `totalAssets()`

This increases rebasing NAV (`_rebasingAssets`) before economic repayment occurs.

---

## Intent

The phantom component is **customer acquisition cost (CAC)**:

- Affiliates earn immediate rebasing exposure
- Cost is amortized through withdrawal fees (`protocolDebt -= fee` on each withdraw)
- Avoids upfront depositor haircut

---

## Guards

| Guard | Detail |
|-------|--------|
| **Physical deploy cap** | `openPosition` uses `totalAssets() - protocolDebt` — phantom `D` cannot be deployed |
| **Solvency ratio** | `setProtocolParameters` enforces `withdrawalFeeBps × (10000 - maxOpenPositionsVolumeBps) ≥ affiliateFeeBps × 10000` |
| **Redemption reality** | `maxWithdraw` caps by idle `I`, not book `T` |

---

## What C-1 Does Not Claim

- All holders cannot simultaneously redeem full `balanceOf` from idle cash
- Gross `previewDeposit(assets)` + affiliate mint may overshoot single-pool fair mint (separate audit item)

---

## Accounting Reference

```
T = I + D + S

D = protocolDebt (virtual IOU)
R = _rebasingAssets() = max(T - F, 0)
```

Withdrawal fee flow:

```
protocolDebt -= min(fee, protocolDebt)  // amortize first
pnl += (fee - amortized)                // remainder to protocol
```

---

## Integrator Guidance

- Use `maxWithdraw` for redemption UX, not raw `balanceOf`
- Do not treat `totalAssets()` as fully redeemable cash when `S > 0` or `D > 0`
- Monitor `protocolDebt / totalAssets()` ratio as affiliate program health indicator

**Full auditor brief:** `iris-core/docs/audit_reports/dispositions/C-1-protocol-debt-phantom-nav.md`
