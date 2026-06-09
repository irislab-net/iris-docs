---
id: ix-token-vault
title: IXToken Vault Architecture
description: Dual-ledger vault design, deposit/withdraw flows, and governance parameters for IrisX.
sidebar_position: 1
---

# IXToken Vault Architecture

`IXToken` is the flagship IrisX vault token — a UUPS-upgradeable ERC-20 over an underlying asset (e.g. USDT). It implements rebasing yield-bearing shares alongside a fixed 1:1 ledger for DEX and adapter safety.

**Source:** [`iris-core/src/IXToken.sol`](https://github.com/irislab-net/iris-core)

---

## Dual-Ledger Model

| Mode | Flag | Storage | Yield |
|------|------|---------|-------|
| Rebasing | `isExcludedFromYield[user] == false` | `_shares[user]` | Yes — share price rises with pool |
| Fixed | `isExcludedFromYield[user] == true` | `_fixedBalances[user]` | No — exact 1:1 |

`setExcludeFromYield(account, exclude)` migrates between ledgers with a balance snapshot.

---

## Accounting Equations

```
T = totalAssets() = I + D + S

I = idle underlying
D = protocolDebt
S = assetsInStrategy

totalSupply() = convertToAssets(_totalShares) + _totalFixedBalances
```

Do **not** add `S` to `totalSupply()` separately.

Physical redemptions limited by idle `I`. Integrators must use `maxWithdraw`.

---

## Rounding

| Operation | Direction |
|-----------|-----------|
| Deposit / mint shares | Floor |
| Withdraw / burn shares | Ceil |
| Rebasing balanceOf | Floor |

`minimumDepositAssetAmount` blocks zero-share mints and dust attacks.

---

## User Flows

| Function | Access | Notes |
|----------|--------|-------|
| `deposit(assets, receiver)` | Anyone | Min deposit enforced |
| `depositWithAffiliate(...)` | Anyone | Creates `protocolDebt` |
| `withdraw(assets, receiver, owner)` | Owner/allowance | Fee on top; dust sweep on full exit |
| `transfer` / `transferFrom` | Holders | Dual-ledger `_executeTransfer` |
| `permit` | EIP-2612 | Asset-denominated allowances |

ERC4626 `maxMint` / `maxRedeem` / `previewMint` / `previewRedeem` return 0 (disabled).

---

## Governance Parameters

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `foundationFeeBps` | 500 (5%) | Foundation profit share |
| `protocolShareOfProfitBps` | 2000 (20%) | Protocol accrual on profit |
| `lpFarmingFeeBps` | 500 (5%) | LP locker reward slice |
| `withdrawalFeeBps` | 50 (0.5%) | Withdrawal fee + debt amortization |
| `affiliateFeeBps` | 10 (0.1%) | Affiliate commission |
| `maxLeverageBps` | 50000 (5x) | Max position leverage |
| `maxOpenPositionsVolumeBps` | 5000 (50%) | Max deployed capital ratio |
| `keeperIncentiveRewardBps` | 1000 (10%) | Keeper reward rate |
| `liquidationThresholdBps` | 7500 (75%) | Loss threshold for penalty path |
| `lendingFeeBps` | 0 | Flash loan fee to lender |

---

## Adapter Authorization

Only `onlyAuthorizedAdapter` addresses may call position lifecycle functions. Adapters must share the vault owner for `setAdapterStatus` governance.

---

## Flash Lending Entry

`internalFlashLoanToLender` — callable only by governance-set `lender` (IrisFlashLender gateway). See [Flash Lending](/technical/flash-lending).

---

## Reentrancy

`ReentrancyGuardTransient` (EIP-1153) on deposit, withdraw, position lifecycle, and flash paths. `transfer` is intentionally **not** `nonReentrant`.
