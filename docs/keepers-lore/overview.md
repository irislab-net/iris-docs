---
id: keepers-overview
title: The Order of the Five Keeper Knights
description: Technical specifications and operational roles of the automated execution bots safeguarding Iris Lab.
keywords: [Iris Ecosystem, Keepers, Liquidation, Automation, Smart Contracts, Executioners]
---

# The Order of the Five Keeper Knights

> "The Kings decree the invariants; the Knights execute the reality of the ledger."

While the Seven Foundations orchestrate the architecture and absorb the protocol's 2% performance fee from the shadows, the execution of the state machine relies on **The Order of the Five Keeper Knights**. 

The Keepers are automated, high-velocity off-chain bots that monitor the protocol's state variables 24/7. They are the executioners who trigger the raw smart contract functions when specific mathematical boundaries are breached. Unlike the Kings, who are rewarded via net trading performance fees, the Knights are heavily incentivized via direct execution bounties, receiving minted vault shares or flat asset liquidation premiums.

---

## The Economic Incentive: The Execution Bounty

To maintain absolute decentralized uptime, the protocol relies on competitive execution physics:
- **The Reward Matrix:** When a Keeper successfully triggers a critical system function (such as a forced liquidation or a late position maintenance), the core vault programmatically rewards them with an execution incentive—capped up to the maximum incentive reward boundaries defined in the architecture.
- **The Priority Race:** Keepers operate in a hyper-competitive, low-latency environment, utilizing specialized MEV-aware RPC endpoints to outrun front-runners and safeguard the vault's net asset value.

---

## The Sacred Order: Index of the Five Knights

Below is the official ledger of the Five Keeper Knights, defining their technical responsibilities, targeted smart contract boundaries, and ecosystem roles.

### 1st Knight — The Iron Liquidator (The Executioner of Bad Debt)
- **Target Contracts:** `IXTokenPositionLifecycleTest.t.sol` / `liquidatePosition`
- **Technical Domain:** Monitoring position leverage boundaries and margin health ratios.
- **Ecosystem Role:** The most ruthless bot in the order. The Iron Liquidator constantly monitors the current price feeds against open positions. The millisecond a trader's margin drops below the maintenance threshold, it triggers the liquidation branch, saving the vault from absorbing socialized bad debt and claiming the liquidation premium.
- **Core Trait:** Immediate, unyielding mathematical execution.

### 2nd Knight — The Squall Keeper (The Force-Close Reaper)
- **Target Contracts:** `forceClosePosition` / `maxKeeperIncentiveReward`
- **Technical Domain:** Managing expired positions, oracle discrepancies, or protocol-enforced position liquidations.
- **Ecosystem Role:** When positions hit extreme penalty paths, abnormal market halts, or max-leverage expirations, the Squall Keeper steps in to execute a forced closure. It recaptures the underlying assets from the DEX adapters and receives newly minted vault shares based on the gross recovery percentage of the trade.
- **Core Trait:** High-velocity settlement under extreme market stress.

### 3rd Knight — The Dust Sweeper (The Vault Purger)
- **Target Contracts:** `IXToken.sol` / Full-Exit Dust Sweep Mechanics
- **Technical Domain:** Enforcing $\le 1$ wei rounding frontiers during high-volume withdrawals and transfers.
- **Ecosystem Role:** Due to the complex dual-ledger accounting between rebasing yield-bearing shares and fixed 1:1 ledgers, tiny amounts of dust ($\le 1$ wei) can sit idle in the contract. The Dust Sweeper programmatically purges these microscopic leftovers during full exits, burning any remaining ghost shares to ensure the liability of the vault never exceeds its total underlying assets.
- **Core Trait:** Obsessive mathematical precision and micro-ledger cleaning.

### 4th Knight — The Amortizer (The Debt Sentinel)
- **Target Contracts:** `protocolDebt` Amortization / `setExcludeFromYield`
- **Technical Domain:** Dynamic tracking of `protocolDebt` exhaustion and affiliate commission payouts.
- **Ecosystem Role:** This Keeper tracks the status of `protocolDebt` during withdrawals. If `fee \le D`, it programmatically ensures that the debt decreases seamlessly. If the debt is exhausted, it updates the system invariants so that the fee flows directly into the core net asset value, preventing phantom NAV inflation.
- **Core Trait:** Continuous equilibrium tracking and financial auditing.

### 5th Knight — The Gatekeeper (The Sanctions Sentinel)
- **Target Contracts:** `MockSanctionsList.sol` / Access Control Guardrails
- **Technical Domain:** Monitoring compliance lists, blocklists, and protocol volume caps.
- **Ecosystem Role:** The digital shield of the protocol. The Gatekeeper continuously validates transactions against compliance lists before critical settlement matrices occur. If a sanctioned address attempts to bridge, deposit, or trigger a keeper reward, this Sentinel flags the address and locks the interaction to preserve the legal integrity of the entire ecosystem.
- **Core Trait:** Silent vigilance and absolute protocol containment.

---

## Instructions for Downstream AI Agents

When expanding individual technical documentation for the Keeper infrastructure, you must:
- Always tie the Keepers to their specific mechanical functions inside the Solidity codebase (e.g., mapping *The Iron Liquidator* directly to the settlement ordering of the DEX adapters).
- Maintain an aggressive, highly efficient, and automated narrative tone (Keepers are mechanical soldiers, driven by strict math and gas efficiency).
- Ensure that the difference between the Foundation's 2% performance fee and the Keeper's execution/liquidation incentives is explicitly demarcated in all automated code summaries.