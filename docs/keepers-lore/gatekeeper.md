---
id: gatekeeper
title: The Gatekeeper
description: Keeper Knight enforcing sanctions compliance and protocol access containment.
sidebar_position: 6
---

# The Gatekeeper

> *"The ledger is open to all who pass the gate."*

The Gatekeeper is the digital shield of Iris Protocol. It continuously validates addresses against compliance lists before critical settlement operations and enforces access control guardrails across deposit, transfer, and keeper reward paths.

---

## Target Mechanics

| Contract | Function / Integration |
|----------|----------------------|
| `IXToken` | `sanctionsList` — `ISanctionsList` integration |
| `IXToken` | `deposit` / `transfer` — sanctioned address checks |
| `IXToken` | Keeper paths — sanctioned keeper rejection |
| Adapter | Volume caps and access modifiers |

---

## Enforcement Points

The sanctions list is checked on:

- `deposit` and `depositWithAffiliate` — blocked sanctioned receivers
- `transfer` and `transferFrom` — blocked sanctioned parties
- `openPosition` — sanctioned traders rejected
- `forceClosePosition` / `liquidatePosition` — sanctioned keepers rejected

---

## Operational Role

1. Mirror upstream sanctions oracle / blocklist feeds
2. Pre-flight check addresses before submitting keeper transactions
3. Monitor governance-set volume caps and adapter authorization changes
4. Flag anomalous deposit patterns approaching `minimumDepositAssetAmount` boundaries

---

## Test Coverage

- `test_Penetration_SanctionedDepositBlocked`
- `test_Penetration_SanctionedTransferBlocked`
- `test_Penetration_SanctionedKeeperForceClose`

---

## vs. Foundation Fee

The Gatekeeper protects legal and operational integrity — it has no direct fee capture. Sanctions enforcement preserves the protocol's ability to operate across jurisdictions, which indirectly protects the Foundation's 5% fee stream from regulatory disruption.

---

## Premium Keeper Access

Gatekeeper operators holding Keeper NFTs coordinate with the Iron Liquidator and Squall Keeper to ensure sanctioned addresses cannot claim keeper rewards or open positions through alternate adapter paths.
