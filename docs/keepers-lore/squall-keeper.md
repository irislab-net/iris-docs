---
id: squall-keeper
title: The Squall Keeper
description: Keeper Knight responsible for force-closing expired and stressed positions.
sidebar_position: 3
---

# The Squall Keeper

> *"The storm does not negotiate — it closes."*

The Squall Keeper executes force-closures when positions hit expiry, extreme penalty paths, or protocol-enforced liquidation windows. It recaptures underlying assets from DEX adapters and claims newly minted vault shares as execution reward.

---

## Target Functions

| Contract | Function |
|----------|----------|
| Adapter | `closeExpiredPosition(positionId)` |
| `IXToken` | `forceClosePosition(positionId, totalReturnAssets, opFee, keeper)` |

---

## Trigger Conditions

- Position exceeds `maxPositionDurationSeconds` in adapter `PositionConfig`
- Abnormal market halts or protocol-enforced close windows
- Extreme penalty paths requiring administrative settlement

Expiry rules live in the adapter — the core vault does not independently enforce expiry on `forceClosePosition`.

---

## Keeper Incentive

```
keeperAsset = min(marginAmount × keeperIncentiveRewardBps, maxKeeperIncentiveReward, grossReturn)
```

- Paid as **rebasing vault shares**
- Sized relative to **margin** (not net recovery — intentionally more modest than liquidation)
- Settlement runs on `grossReturn - keeperAsset` via shared `_closePosition`

---

## Expired + Underwater Dual Paths

After expiry, underwater positions may use **either**:

| Path | Keeper Base | When Preferred |
|------|-------------|----------------|
| Force-close (Squall) | Margin × bps | Administrative expiry settlement |
| Liquidation (Iron) | Net recovery × bps | Large recovery relative to margin |

Both are valid by design (C-02 disposition). Bot operators should simulate both paths and execute the more profitable one.

---

## vs. Foundation Fee

Keeper force-close incentives are vault-minted execution bounties. They do not reduce or interact with the 5% Foundation performance fee captured on profitable closes.
