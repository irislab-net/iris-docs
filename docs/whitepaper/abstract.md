---
id: abstract
title: Abstract
description: Executive summary of Iris Protocol architecture, governance, and economic design.
sidebar_position: 3
---

# Abstract

Iris Protocol is a modular DeFi infrastructure for **leveraged spot trading** and **on-chain fund management**, centered on the **IrisX vault token** (`IXToken`). The system implements a dual-ledger accounting model that separates rebasing yield-bearing balances from fixed 1:1 integration balances, enabling both depositor yield accrual and DEX-safe margin execution.

Governance operates through a standard OpenZeppelin Governor stack with voting escrow over IXToken, using a **block-number clock** for checkpoints and voting windows. An institutional overlay — **The Iris Foundation** — comprises 15 identical ERC721 Chairs (token IDs 0–14) that capture a perpetual **5% performance fee** on profitable position closes, distribute rewards equally via `ClaimRewards`, and exercise tactical veto authority during the timelock quarantine period.

Protocol safety is maintained by **5 Keeper NFTs** that authorize competitive off-chain bots to liquidate underwater positions and force-close expired trades, compensated through vault-token mint incentives distinct from the Foundation fee stream.

The protocol's vision is to achieve the scale and reliability of institutional stablecoin infrastructure while preserving full decentralization — analogous to DAI's ubiquity in a trust-minimized form, with Aave-grade fund management composability.

**Primary innovations:**

1. Dual-ledger IXToken with vault-favorable rounding and optimistic affiliate accounting (`protocolDebt`)
2. Margin vault architecture funding authorized adapters rather than over-collateralized lending pools
3. Game-theoretic Foundation veto layer (Consul consensus vs. Kamikaze sacrifice)
4. Separated incentive rails for institutional fee capture (Foundation) and execution safety (Keepers)
