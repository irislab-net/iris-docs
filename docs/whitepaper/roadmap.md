---
id: roadmap
title: Roadmap
description: Phased deployment plan for Iris Protocol modules and cross-chain expansion.
sidebar_position: 5
---

# Roadmap

## Vision

Iris Protocol aims to become foundational DeFi infrastructure — achieving the reliability and adoption profile of institutional stablecoin systems while maintaining full decentralization and composable fund management comparable to Aave-grade vaults.

---

## Phase 1 — Ethereum Mainnet Launch

**Objective:** Deploy the core platform with the first leveraged spot trading adapter.

| Milestone | Deliverable |
|-----------|-------------|
| Vault deployment | `IXToken` (IrisX over DAI) via UUPS proxy |
| Governance cluster | `VotingEscrow`, `IrisGovernor`, TimelockController |
| Foundation & Keepers | 15 Chair NFTs + 5 Keeper NFTs at canonical addresses |
| Adapter v1 | `IrisLeveragedSpotV1Adapter` — leveraged long spot on ETH |
| Flash lending | `IrisFlashLender` gateway (ERC-3156 for DAI/USDC) |
| Documentation & audits | Public specs, Foundry test suite, audit disposition reports |

**Success criteria:** Profitable position lifecycle end-to-end on mainnet; keeper liquidation bots operational; governance proposals executable through timelock.

---

## Phase 2 — MirrorStation (Arbitrum One)

**Objective:** Deploy a mirror execution layer on Arbitrum One for speed and gas efficiency.

| Milestone | Deliverable |
|-----------|-------------|
| Cross-chain vault mirror | Arbitrum-deployed IXToken instance or bridge-linked liquidity |
| Low-latency adapter | Leveraged spot execution with Arbitrum DEX routing |
| Keeper infrastructure | Arbitrum-native keeper bots with competitive MEV protection |
| Unified governance | Cross-chain proposal routing or mirrored parameter sync |

**Rationale:** Leveraged spot trading is latency-sensitive. Arbitrum provides sub-cent execution costs while Ethereum mainnet retains canonical governance and Foundation settlement.

---

## Phase 3 — Module Expansion

**Objective:** Grow protocol economics and depositor yield through additional financial modules.

| Module | Description |
|--------|-------------|
| **Collateral lending** | Over-collateralized borrow/lend using IXToken as collateral asset |
| **Additional adapters** | Perp, options, and pool-native v2 execution engines |
| **LP farming integration** | Full `IIrisLPFarming` locker with UV4 LP NFT reward distribution |
| **Multi-asset vaults** | IrisX instances over additional stablecoins and LSTs |
| **Flash loan expansion** | Additional ERC-3156 asset support beyond DAI/USDC |

---

## Ongoing

- Continuous audit coverage and invariant fuzzing
- Keeper bot open-source reference implementations
- Foundation `ClaimRewards` automation tooling for Chair holders
- Governance parameter optimization based on mainnet volume data
