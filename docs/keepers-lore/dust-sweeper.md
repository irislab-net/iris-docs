---
id: dust-sweeper
title: The Dust Sweeper
description: Keeper Knight enforcing dual-ledger dust purge on full vault exits.
sidebar_position: 4
---

# The Dust Sweeper

> *"One wei unsettled is one wei of liability unaccounted."*

The Dust Sweeper enforces the dual-ledger rounding frontier during high-volume withdrawals and transfers. Due to Floor/Ceil rounding between rebasing shares and fixed 1:1 balances, microscopic amounts (≤ 1 wei) can accumulate as ghost shares or fixed dust.

---

## Target Mechanics

| Contract | Function / Behavior |
|----------|---------------------|
| `IXToken` | `withdraw` — full-exit dust sweep branch |
| `IXToken` | `transfer` / `transferFrom` — `_executeTransfer` dust handling |
| `IXToken` | `setExcludeFromYield` — ledger migration rounding |

---

## Problem Space

Dual-ledger accounting creates rounding residuals:

- Rebasing deposits use **Floor** share minting
- Withdrawals use **Ceil** share burning
- Fixed ledger burns are exact 1:1
- Full exits must zero out both ledgers without leaving liability > assets

---

## Operational Role

The Dust Sweeper monitors vault state for:

1. Accounts attempting full exit with sub-wei residuals
2. Fixed→rebasing migrations that would mint zero shares (`ZeroSharesMinted` guard)
3. Transfer paths that leave ghost share dust in `_totalShares`

On full exit, the vault's dust sweep branch burns remaining ghost shares to ensure `totalSupply() ≤ totalAssets()`.

---

## Incentive Model

Dust sweeping is typically bundled into the triggering user's transaction (withdraw/transfer). The Dust Sweeper bot does not earn a separate keeper mint — its value is **protocol solvency maintenance**.

Operators run Dust Sweeper logic as part of a unified keeper suite, often co-located with the Amortizer for accounting hygiene.

---

## vs. Foundation Fee

No direct economic interaction with Foundation fee distribution. Dust hygiene protects the rebasing pool backing that makes Foundation fee mints and `ClaimRewards` distributions meaningful.

---

## Test Coverage

See `IXTokenPermitAndWithdrawTest.t.sol`:

- `test_FixedWithdraw_FullExitDustSweep`
- `test_Penetration_TransferRebasingDustSweep`
- `test_Penetration_TransferFixedDustSweep`
