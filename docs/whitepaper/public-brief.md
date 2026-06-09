---
id: public-brief
title: Iris Protocol — Public Brief
description: A concise introduction to Iris Protocol for general users and DeFi participants.
sidebar_position: 1
---

# Iris Protocol — Public Brief

## What Is Iris?

Iris Protocol is a decentralized leveraged trading and fund-management stack built on Ethereum. At its core is **IrisX** (`IXToken`) — a vault token that wraps USDT, accrues yield through rebasing shares, and funds leveraged spot positions via authorized DEX adapters.

The protocol aims to deliver **stable, transparent on-chain fund management** — combining the capital efficiency of centralized trading infrastructure with the custody guarantees of smart contracts.

---

## How It Works (In Plain Terms)

1. **Deposit USDT** into the IrisX vault and receive vault tokens representing your share of the pool.
2. **Earn yield** as the vault's assets grow — rebasing holders see their balance increase without manual compounding.
3. **Trade with leverage** through integrated adapters that borrow liquidity from the vault to open spot positions on external DEXes.
4. **Govern the protocol** by locking IXToken in the voting escrow and participating in proposals.
5. **Foundation Chairs** (15 NFTs) capture a 5% share of trader profits and maintain veto authority over governance during the timelock period.

---

## Key Participants

| Who | Role |
|-----|------|
| **Depositors** | Supply liquidity, earn rebasing yield |
| **Traders** | Open leveraged spot positions with posted margin |
| **Governance voters** | Lock IXToken, vote on parameters and upgrades |
| **Foundation Chair holders** | Receive 5% of trading profits, veto power |
| **Keeper operators** | Run bots that liquidate unhealthy positions for execution rewards |

---

## Why It Matters

- **Dual-ledger safety:** Rebasing yield for depositors, fixed 1:1 balances for DEX integrations — no rounding surprises at the adapter boundary.
- **Transparent fees:** Foundation 5%, protocol share, LP farming slice, and keeper incentives are all on-chain and governance-tunable.
- **Checks on governance:** 15 Foundation Chairs can veto malicious proposals — collectively (50%+1) or individually in emergencies (kamikaze burn).
- **Automated safety:** 5 Keeper NFTs authorize competitive liquidation bots that protect the vault from bad debt.

---

## Roadmap at a Glance

1. **Phase 1** — Deploy leveraged spot trading on Ethereum mainnet
2. **Phase 2** — Launch MirrorStation on Arbitrum One for low-latency execution
3. **Phase 3** — Expand modules (collateral lending, additional adapters)

---

## Learn More

- [Academic Whitepaper](/whitepaper/full-academic) — full specification for technical readers
- [Tokenomics](/whitepaper/tokenomics) — fee flows and reward distribution
- [Technical Architecture](/technical/ix-token-vault) — vault design deep dive
