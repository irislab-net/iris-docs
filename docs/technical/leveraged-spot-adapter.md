---
id: leveraged-spot-adapter
title: Leveraged Spot Adapter V1
description: IrisLeveragedSpotV1Adapter — swap-engine leveraged long spot positions on IXToken.
sidebar_position: 6
---

# Leveraged Spot Adapter V1

`IrisLeveragedSpotV1Adapter` is the generic swap-engine adapter enabling leveraged long spot positions through authorized DEX execution.

**Source:** Iris adapter repository (`IrisLeveragedSpotV1Adapter` / `IIrisLeveragedSpotV1Adapter`)

---

## Architecture

```
Trader (margin) → Adapter → Swap Executor → DEX
                    ↓
              IXToken.openPosition / closePosition
```

The adapter is authorized by the vault (`onlyAuthorizedAdapter`). Margin posts via IXToken allowance into the adapter's **fixed** ledger.

---

## Core Concepts

| Term | Meaning |
|------|---------|
| **Underlying** | Collateral token (e.g. DAI) |
| **Target token** | Long exposure (e.g. WETH); must ≠ underlying |
| **Margin** | Trader-posted collateral |
| **Allocation** | Vault liquidity deployed to the position |
| **Gross return** | Underlying received from exit swap before vault fee logic |
| **Premium keeper** | Keeper NFT holder — stricter liquidation threshold, shorter max duration |

---

## Position Lifecycle (Adapter-Local)

### Open (`openPosition`)

1. Validate slippage and oracle price via Chainlink feeds
2. Execute swap through off-chain-routed executor (`call(data)`)
3. Vault `openPosition` — book margin + allocation

### Close (`closePosition`)

Trader or authorized close operator. Exit swap → vault `closePosition(positionId, grossReturn, opFee)`.

### Force-Close (`closeExpiredPosition`)

Anyone (keeper). After `maxPositionDurationSeconds`:

1. Exit swap for gross return
2. Vault `forceClosePosition(positionId, grossReturn, opFee, keeper)`
3. Keeper = `msg.sender`, paid rebasing shares

### Liquidate (`liquidatePosition`)

Underwater positions. Vault `liquidatePosition` with net-recovery-based keeper incentive.

**Expired + underwater:** Keepers may use force-close or liquidation — both valid, economics differ.

---

## Oracle & Slippage

- Cross-price: target and underlying priced in USD via separate Chainlink feeds
- Slippage validated on-chain against configured tolerance
- Executor is off-chain-routed; on-chain amount and slippage checks enforce bounds

---

## Keeper NFT Premium Access

5 Keeper NFTs grant premium execution access:

- Stricter liquidation eligibility thresholds
- Shorter `maxPositionDurationSeconds` for non-keeper closers
- Competitive advantage in keeper incentive races

---

## Configuration (`PositionConfig`)

| Field | Purpose |
|-------|---------|
| `maxLeverageBps` | Position leverage cap |
| `maxPositionDurationSeconds` | Expiry for force-close |
| `liquidationThresholdBps` | Underwater detection |
| `slippageToleranceBps` | Swap slippage bound |

---

## Integration Checklist

1. Deploy adapter with `protocol`, `initialOwner`, `underlyingChainlinkFeed`, `keeperNFT`
2. Governance `setAdapterStatus(adapter, true)` on vault
3. Traders approve IXToken margin allowance to adapter
4. Run keeper bots monitoring `checkLiquidationEligibility`

---

## Security & Trust

| Assumption | Detail |
|------------|--------|
| Executor routing | Off-chain route, on-chain swap validation (C-03: by design) |
| Adapter-trust | Vault books PnL from adapter-reported `totalReturnAssets` |
| Expired dual paths | Force-close and liquidation both allowed when expired + underwater (C-02: by design) |
