---
id: amortizer
title: The Amortizer
description: Keeper Knight tracking protocolDebt amortization and affiliate accounting equilibrium.
sidebar_position: 5
---

# The Amortizer

> *"Virtual debt must eventually meet physical cash."*

The Amortizer tracks `protocolDebt` exhaustion during withdrawal fee flows and ensures the optimistic affiliate accounting model (C-1 disposition) remains in steady-state equilibrium.

---

## Target Mechanics

| Contract | Function / State |
|----------|-----------------|
| `IXToken` | `protocolDebt` — virtual affiliate IOU in `totalAssets()` |
| `IXToken` | `withdraw` — fee amortization: `protocolDebt -= min(fee, protocolDebt)` |
| `IXToken` | `setProtocolParameters` — `_validateSolvencyRatio` guard |
| `IXToken` | `depositWithAffiliate` — debt creation on affiliate deposit |

---

## Accounting Flow

On `depositWithAffiliate`:

```
protocolDebt += affiliateAmount    // phantom NAV component
I += grossAssets                   // physical cash increases
```

On `withdraw`:

```
amortized = min(withdrawalFee, protocolDebt)
protocolDebt -= amortized
pnl += (withdrawalFee - amortized)  // remainder to protocol
```

---

## Steady-State Guard

Governance parameter changes must satisfy:

```
withdrawalFeeBps × (10000 - maxOpenPositionsVolumeBps) ≥ affiliateFeeBps × 10000
```

The Amortizer monitors this inequality and alerts when affiliate program parameters approach unsustainable configurations.

---

## Operational Role

1. Track `protocolDebt / totalAssets()` ratio over time
2. Alert when debt exhaustion rate diverges from affiliate deposit velocity
3. Verify `totalPhysicalAssets = totalAssets() - protocolDebt` before adapter deployments
4. Report when phantom NAV component exceeds governance-defined thresholds

---

## Test Coverage

- `test_FixedWithdraw_ProtocolDebtAmortization`
- `test_FixedWithdraw_ProtocolDebtExhaustion`
- `testFuzz_WithdrawAmortizesProtocolDebt`

---

## vs. Foundation Fee

`protocolDebt` is affiliate CAC accounting — unrelated to the 5% Foundation profit fee. However, both affect `totalAssets()` and therefore rebasing NAV that Foundation fee mints are denominated in.
