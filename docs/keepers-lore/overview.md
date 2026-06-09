---
id: keepers-overview
title: The Order of the Five Keeper Knights
description: Technical specifications and operational roles of the automated execution bots safeguarding Iris Protocol.
keywords: [Iris Ecosystem, Keepers, Liquidation, Automation, Smart Contracts]
sidebar_position: 1
---

# The Order of the Five Keeper Knights

> *"The Foundation decrees the invariants; the Knights execute the reality of the ledger."*

While the **15 Foundation Chairs** capture the protocol's **5% performance fee** on profitable trader settlements, protocol safety depends on **The Order of the Five Keeper Knights** — automated off-chain bots with on-chain execution privileges.

Keepers are **not** rewarded from the Foundation fee stream. They compete for **execution bounties** — vault-token mints paid directly by `IXToken` when they successfully trigger `forceClosePosition` or `liquidatePosition`.

---

## Economic Separation

| Revenue Stream | Recipients | Source |
|----------------|------------|--------|
| **Foundation fee (5%)** | 15 Chair holders via `ClaimRewards` | Net trader profit on close |
| **Keeper incentives** | Keeper NFT bot operators | `keeperIncentiveRewardBps` on force-close / liquidation |
| **Protocol share** | Rebasing vault holders | `protocolShareOfProfitBps` on profitable closes |
| **LP farming slice** | `lpFarming` locker (if set) | `lpFarmingFeeBps` on profit |

This separation is intentional: Foundation Chairs are long-horizon institutional stakeholders; Keepers are competitive execution agents racing to protect solvency.

---

## Keeper Incentive Mechanics

| Path | Vault Function | Keeper Sizing |
|------|----------------|---------------|
| Force-close | `forceClosePosition` | `min(margin × bps, maxKeeperIncentiveReward, gross)` |
| Liquidation | `liquidatePosition` | `min(netRecovery × bps, maxKeeperIncentiveReward)` |

Keeper rewards are paid as **rebasing vault shares** (`_mint`). Default `keeperIncentiveRewardBps = 1000` (10%), capped by `maxKeeperIncentiveReward`.

Keepers operate in a hyper-competitive, low-latency environment using MEV-aware RPC endpoints.

---

## The Sacred Order

| Knight | Role | Documentation |
|--------|------|---------------|
| **Iron Liquidator** | Underwater position liquidation | [Iron Liquidator](/keepers-lore/iron-liquidator) |
| **Squall Keeper** | Force-close on expiry / stress | [Squall Keeper](/keepers-lore/squall-keeper) |
| **Dust Sweeper** | Dual-ledger dust purge on full exits | [Dust Sweeper](/keepers-lore/dust-sweeper) |
| **Amortizer** | `protocolDebt` exhaustion tracking | [Amortizer](/keepers-lore/amortizer) |
| **Gatekeeper** | Sanctions and access containment | [Gatekeeper](/keepers-lore/gatekeeper) |

---

## Premium Keeper Access

The 5 Keeper NFTs grant **premium access** to liquidate or force-close trader positions through authorized adapters. Holders of Keeper NFTs may operate bots with stricter liquidation thresholds and shorter max position durations configured at the adapter layer.

---

## Instructions for Integrators

When building keeper infrastructure:

1. Map each bot to its specific vault/adapter function — do not conflate Foundation fee logic with keeper incentives.
2. Use `checkLiquidationEligibility` on adapters; vault liquidation uses `loss >= margin × liquidationThresholdBps`.
3. After expiry, underwater positions may use **either** `closeExpiredPosition` (force-close path) or `liquidatePosition` — economics differ by design.
4. Run competitive execution; only the successful transaction receives the keeper mint.
