---
id: chair-09
title: Foundation Chair #9
description: Genesis Foundation Chair token ID 9 — fee rights, veto authority, and reward distribution.
sidebar_position: 11
---

# Foundation Chair #9

**Collection:** The Iris Foundation (`IRIS-FOUNDATION`)  
**Token ID:** 9  
**Contract:** `0x00008c80D4cBD653B1D384566d9b23B37d100000`



Chair #9 is one of **15 functionally identical** Genesis Foundation Chairs. On-chain, all Chairs share the same rights and obligations — there are no per-token trait differences, names, or privilege tiers.

---

## On-Chain Powers

| Power | Description |
|-------|-------------|
| **Fee share** | Equal portion of `ClaimRewards(token)` distributions among live Chairs |
| **Threshold bypass** | Submit governance proposals without standard voting threshold |
| **Consul veto** | Participate in 50% + 1 collective veto during timelock |
| **Kamikaze veto** | Burn this token to instantly veto a proposal in emergencies |

---

## Economic Rights

When traders close profitable positions, **5% of gross profit** (`foundationFeeBps = 500`) is minted to the Foundation contract. Chair #9's holder receives:

```
amountPerCard = totalRewards / liveCards
```

If Chair #9 is burned via Kamikaze veto, it is removed from `activeCardsRegistry` and permanently forfeits its fee stream. The remaining live Chairs absorb the redistributed share.

---

## Kamikaze Game Theory

Invoking Kamikaze veto on Chair #9 is rational only when the existential threat to the protocol exceeds the net present value of this Chair's perpetual 1/15 fee stream. For recoverable disputes, Consul veto (coordination without burn) is preferred.

---

## Metadata

- [NFT Metadata](/assets/nft-foundations/metadata/9-chair.json)
- [Foundation Overview](/foundation-lore/overview)

