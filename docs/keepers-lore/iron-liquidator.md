---
id: iron-liquidator
title: The Iron Liquidator
description: Keeper Knight responsible for underwater position liquidation on Iris Protocol.
sidebar_position: 2
---

# The Iron Liquidator

> *"When margin breaks, the Iron Liquidator breaks the position."*

The Iron Liquidator is the most ruthless bot in the Keeper Order. It monitors open positions against live oracle feeds and triggers `liquidatePosition` the moment a trader's mark-to-market loss exceeds the vault liquidation threshold.

---

## Target Functions

| Contract | Function |
|----------|----------|
| `IXToken` | `liquidatePosition(positionId, totalReturnAssets, keeper, opFee)` |
| Adapter | `liquidatePosition` → exit swap → vault settlement |
| Adapter | `checkLiquidationEligibility(keeper, positionId)` |

---

## Trigger Conditions

A position becomes eligible when:

```
loss >= marginAmount × liquidationThresholdBps / BPS_DENOMINATOR
```

Default `liquidationThresholdBps = 7500` (75% of collateral lost). The adapter's `checkLiquidationEligibility` provides the off-chain monitoring hook; the vault enforces `_meetsVaultLiquidationLossThreshold`.

---

## Keeper Incentive

```
keeperAsset = min(netRecovery × keeperIncentiveRewardBps, maxKeeperIncentiveReward)
```

- Paid as **rebasing vault shares** via `_mint`
- Based on **net recovery** after `opFee` (intentionally larger than force-close)
- `opFee` waived if `opFee > totalReturnAssets`

Default: 10% bps, capped at `500 × 10^decimals`.

---

## Settlement Branches

| Branch | Outcome |
|--------|---------|
| Bad debt | Socialized loss, negative `pnl` update |
| Limited loss | Penalty to protocol, keeper minted |

---

## vs. Foundation Fee

The Iron Liquidator earns **execution bounties**, not Foundation profit share. The 5% Foundation fee on trader profits flows to Chair holders via `ClaimRewards` — a completely separate revenue rail.

---

## Operational Notes

- Run on MEV-aware RPC endpoints for competitive execution
- Only the successful liquidation transaction receives the keeper mint
- Expired + underwater positions may also be handled by the Squall Keeper via force-close — economics differ
