# AI Context — Iris Protocol (Master Reference)

> **Purpose:** Single source of truth for AI agents, integrators, and auditors working across the Iris Protocol ecosystem.  
> **Repo:** `iris-whitepaper` (this file lives in `docs/aic/`, excluded from public Docusaurus build).  
> **Last updated:** 2026-06-09  
> **Supersedes:** fragmented contexts in `docs/_internal/00-welcome.md`, per-repo `AI_Context.md` files, and deprecated 7-Kings / 2% / Consoul narratives.

---

## 0. Canonical Model (Read First)

| Layer | Spec |
|-------|------|
| **Underlying** | DAI (18 decimals) — unit of account, liquidity, collateral |
| **IXToken (IrisX)** | Rebasing vault token over DAI (e.g. `USDI`); dual-ledger (rebasing + fixed 1:1) |
| **Foundation NFT** | `ERC721("The Iris Foundation", "IRIS-FOUNDATION")` @ `0x00008c80D4cBD653B1D384566d9b23B37d100000` |
| **Foundation supply** | **15 Chairs**, token IDs **0–14**, **functionally identical** — no on-chain names or trait tiers |
| **Foundation fee** | **5%** of trader profit on close (`foundationFeeBps = 500`) |
| **Foundation rewards** | `ClaimRewards(token)` — equal split among **live** cards in `activeCardsRegistry` |
| **Consul veto** | `floor(liveCards / 2) + 1` Chairs during timelock — **no burn** |
| **Kamikaze veto** | Any single Chair burns own token → instant veto; fee share redistributed to survivors |
| **Proposal bypass** | Any Chair holder submits governance proposals **without standard threshold** |
| **Keepers** | **5 NFTs** — premium liquidate / force-close execution keys; paid via **keeper incentive bps** (separate from Foundation 5%) |
| **Governance** | `VotingEscrow` + `IrisGovernor` + `TimelockController`; clock = **block number** (`IERC6372`) |
| **Adapter v1** | `IrisLeveragedSpotV1Adapter` — leveraged long spot via generic swap engine + Chainlink |

### Deprecated — Do Not Use in New Docs or Code Comments

- 7 Kings / Seven Foundations kingdom lore as on-chain truth
- 2% performance fee
- 4-of-7 consensus veto
- `Consoul` as fee distributor (replaced by Foundation contract + `ClaimRewards`)
- VotingEscrow **timestamp** clock in new integrations (canonical = **block number**)

---

## 1. What Iris Protocol Is

Iris Protocol is a modular **leveraged spot trading** and **on-chain fund management** stack:

- **Depositors** supply DAI liquidity via IrisX and earn rebasing yield.
- **Traders** open leveraged long spot positions through authorized DEX adapters.
- **Governance voters** lock IXToken in VotingEscrow and vote on parameters/upgrades.
- **Foundation Chair holders** (15 NFTs) capture 5% of trading profits and hold tactical veto authority.
- **Keeper operators** (5 NFTs) run bots that liquidate unhealthy positions for execution bounties.

**Vision:** Institutional-grade stablecoin infrastructure (DAI-scale reliability) with full decentralization and Aave-grade composable fund management.

**Tagline:** *"The Foundation issues the credit lines; the network executes the reality of the ledger."*

---

## 2. Ecosystem Architecture

```
                         ┌─────────────────────────────────────┐
                         │     The Iris Foundation (ERC721)   │
                         │  15 Chairs · 5% fee · veto overlay   │
                         └──────────────────┬──────────────────┘
                                            │
┌──────────────┐    ┌───────────────────────▼───────────────────────┐
│ VotingEscrow │───►│              IrisGovernor + Timelock           │
│  (IXToken)   │    │         community proposals · execution        │
└──────────────┘    └───────────────────────┬───────────────────────┘
                                            │ owner
                         ┌──────────────────▼──────────────────────┐
                         │            IXToken (IrisX / UUPS)          │
                         │  dual ledger · positions · fee routing     │
                         └──────────────┬────────────────────────────┘
                                        │ onlyAuthorizedAdapter
                         ┌──────────────▼────────────────────────────┐
                         │      IrisLeveragedSpotV1Adapter           │
                         │  swap engine · Chainlink · local positions  │
                         └──────────────┬────────────────────────────┘
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
              │  Traders  │      │  Executors  │     │ 5 Keepers   │
              │  (margin) │      │ (1inch/0x…) │     │ (bots/NFT)  │
              └───────────┘      └─────────────┘     └─────────────┘

     Flash ERC-3156 users ──► IrisFlashLender (gateway, WIP)
                                    │ onlyLender
                         ┌──────────▼──────────┐
                         │ internalFlashLoan   │
                         │ ToLender (IXToken)  │
                         └─────────────────────┘
```

### Trust Model Summary

| Assumption | Implication |
|------------|-------------|
| Authorized adapters report honest `totalReturnAssets` | Vault books PnL from adapter values — no vault-level oracle |
| Adapter owner == vault owner | `setAdapterStatus` governance control |
| Swap `executor` + calldata off-chain | On-chain: capped approvals, balance deltas, slippage floors — **not** router allowlist (by design) |
| Governance sets `lender` | Only gateway calls `internalFlashLoanToLender` |
| Foundation overlay during timelock | Chairs can veto passed proposals — does not replace token voting |

---

## 3. Repository Map

| Repository | Role | Key Contracts |
|------------|------|---------------|
| **`iris-core`** | Vault token, positions, flash entry | `IXToken`, `IrisXProxy`, `IIrisAdapter` |
| **`iris-governance`** | Voting escrow, governor, timelock | `VotingEscrow`, `IrisGovernor`, `TimelockController` |
| **`iris-uv4-adapter`** (adapter repo) | Leveraged spot v1 execution | `IrisLeveragedSpotV1Adapter` |
| **`iris-whitepaper`** | Public docs (Docusaurus) | This file + published markdown |

**Tech stack (Solidity repos):** Foundry, Solidity `^0.8.26`, `via_ir`, optimizer 10k runs, OpenZeppelin v5 (Governor) + upgradeable UUPS (IXToken). Cancun EVM (`ReentrancyGuardTransient`).

---

## 4. The Iris Foundation (15 Chairs)

### Contract

- **Name / symbol:** `The Iris Foundation` / `IRIS-FOUNDATION`
- **Address:** `0x00008c80D4cBD653B1D384566d9b23B37d100000`
- **Supply:** 15 tokens, IDs **0–14**
- **Equality:** All Chairs identical on-chain — distinguished only by token ID

### Economic Rights

On profitable position close, `IXToken` mints **5% of gross trade profit** (`foundationFeeBps = 500`) to the Foundation address. This scales with protocol volumetric growth — **perpetual** for the lifetime of each live Chair.

### ClaimRewards Distribution

```solidity
function ClaimRewards(address token) external override {
    uint256 totalRewards = IERC20(token).balanceOf(address(this));
    if (totalRewards == 0) revert NoRewardsAvailable();

    uint8 liveCards = totalSupply.toUint8();
    if (liveCards == 0) revert NoRewardsAvailable();

    uint256 amountPerCard = totalRewards / liveCards;
    if (amountPerCard == 0) revert RewardTooSmall();

    for (uint256 i = 0; i < MAX_SUPPLY; ++i) {
        if ((activeCardsRegistry & _cardBit(i)) != 0) {
            IERC20(token).safeTransfer(ownerOf(i), amountPerCard);
        }
    }

    emit RewardsClaimed(token, totalRewards);
}
```

- Split is **equal** among all **live** (non-burned) Chairs.
- Kamikaze burn removes a Chair from `activeCardsRegistry` → survivors' per-Chair share increases.

### Governance Overlay Powers

| Power | Mechanism | Cost |
|-------|-----------|------|
| **Threshold bypass** | Submit proposals without standard Governor threshold | None |
| **Consul veto** | `floor(liveCards/2) + 1` Chairs sign during timelock | None (coordination required) |
| **Kamikaze veto** | Single Chair burns own token | Permanent token loss + forfeited fee stream |

**Game theory:** Kamikaze is rational only when existential threat exceeds NPV of perpetual 1/15 fee share. Prefer Consul veto for recoverable disputes.

### Veto Flow

```
Community proposal passes → Timelock quarantine
  ├─ Consul veto (50%+1 live Chairs) → rejected, no burn
  ├─ Kamikaze (single Chair burns) → killed instantly
  └─ No veto → executes
```

---

## 5. Keeper Corps (5 NFTs)

Keepers are **orthogonal** to Foundation fee capture. They compete for **execution bounties** — rebasing vault share mints on successful `forceClosePosition` / `liquidatePosition`.

### The Five Knights

| Knight | Primary Function | Vault / Adapter Hooks |
|--------|------------------|----------------------|
| **Iron Liquidator** | Underwater liquidation | `liquidatePosition`; `checkLiquidationEligibility` |
| **Squall Keeper** | Force-close on expiry | `closeExpiredPosition` → `forceClosePosition` |
| **Dust Sweeper** | Full-exit dust purge | `withdraw` dust sweep; dual-ledger rounding |
| **Amortizer** | `protocolDebt` tracking | Withdraw fee amortization; solvency ratio |
| **Gatekeeper** | Sanctions enforcement | `ISanctionsList` on deposit/transfer/keeper paths |

### Keeper Incentive Formulas (Defaults)

| Path | Formula | Default bps |
|------|---------|-------------|
| **Force-close** | `min(margin × bps, maxKeeperIncentiveReward, gross)` | 1000 (10%) |
| **Liquidation** | `min(netRecovery × bps, maxKeeperIncentiveReward)` | 1000 (10%) |

- Paid as **rebasing vault shares** (`_mint`).
- Force-close sizes on **margin**; liquidation sizes on **net recovery** — intentionally different (by design).
- `maxKeeperIncentiveReward` default: `500 × 10^decimals`.

**Premium keeper access:** Keeper NFT holders get stricter liquidation thresholds and shorter max position durations at adapter layer.

**Expired + underwater:** Both `closeExpiredPosition` and `liquidatePosition` are valid — economics differ (C-02 disposition).

---

## 6. IXToken (IrisX Vault)

### What It Is

- ERC20-facing vault share denominated in **underlying asset units** (DAI wei).
- **Dual-ledger:** rebasing yield-bearing balances + fixed 1:1 balances for DEX/integration safety.
- **Margin execution vault** funding authorized adapters — not an over-collateralized lending pool.

### Dual-Ledger Model

| Mode | Flag | Storage | Balance | Yield |
|------|------|---------|---------|-------|
| Rebasing | `isExcludedFromYield == false` | `_shares[user]` | `convertToAssets(shares)` Floor | Yes |
| Fixed | `isExcludedFromYield == true` | `_fixedBalances[user]` | Exact 1:1 | No |

- User-facing unit: always **underlying wei**.
- Migration: `setExcludeFromYield(account, exclude)` snapshots `balanceOf` first.

### Rounding (Vault-Favorable)

| Operation | Direction |
|-----------|-----------|
| Deposit / mint shares | Floor |
| Withdraw / burn shares | Ceil |
| Rebasing `balanceOf` | Floor |

`minimumDepositAssetAmount` blocks zero-share mints and dust attacks.

### Global Accounting (Critical)

```
T = totalAssets() = I + D + S

I = idle underlying cash
D = protocolDebt (virtual affiliate IOU)
S = assetsInStrategy (deployed margin + allocation)

F = _totalFixedBalances
σ = _totalShares
R = _rebasingAssets() = max(T - F, 0)

totalSupply() = convertToAssets(σ) + F
```

**Invariants agents must not violate in analysis:**

1. Do **not** add `S` again to `totalSupply()` — conversion already flows through `T`.
2. Physical redemptions capped by idle `I`, not book `T` — use `maxWithdraw`.
3. Strategy deploy caps use `totalPhysicalAssets = T - D` — phantom debt cannot be deployed.
4. `pnl` is analytics only — **not** NAV or redeemable cash.

### Default Governance Parameters (IXToken.initialize)

| Parameter | Default | Meaning |
|-----------|---------|---------|
| `withdrawalFeeBps` | 50 (0.5%) | Withdrawal fee; amortizes `protocolDebt` |
| `affiliateFeeBps` | 10 (0.1%) | Affiliate commission on `depositWithAffiliate` |
| `foundationFeeBps` | 500 (5%) | Foundation profit share |
| `lpFarmingFeeBps` | 500 (5%) | LP locker slice (or Foundation if unset) |
| `protocolShareOfProfitBps` | 2000 (20%) | Protocol accrual on profit |
| `maxLeverageBps` | 50000 (5x) | Max `allocated / margin` |
| `maxOpenPositionsVolumeBps` | 5000 (50%) | Max deployed / physical assets |
| `liquidationThresholdBps` | 7500 (75%) | Loss threshold for penalty path |
| `keeperIncentiveRewardBps` | 1000 (10%) | Keeper reward rate |
| `maxKeeperIncentiveReward` | 500 × 10^decimals | Keeper cap |
| `lendingFeeBps` | 0 | Flash loan fee to lender |

**Solvency guard:** `withdrawalFeeBps × (10000 - maxOpenPositionsVolumeBps) ≥ affiliateFeeBps × 10000`

### Profit Waterfall (Profitable Close)

```
Gross Trade Profit
  ├─ Foundation 5%     → mint to Foundation contract
  ├─ Protocol 20%     → vault NAV accrual
  ├─ LP Farming 5%     → mint to lpFarming (or Foundation if unset)
  └─ Trader             → net profit remainder
```

### Key User Flows

| Function | Who | Notes |
|----------|-----|-------|
| `deposit` / `depositWithAffiliate` | Anyone | Affiliate creates `protocolDebt` |
| `withdraw` | Owner/allowance | Fee on top; dust sweep on full exit |
| `transfer` / `transferFrom` | Holders | **Not** `nonReentrant` |
| `permit` | EIP-2612 | Asset-denominated allowances |
| `setExcludeFromYield` | User or owner | Ledger migration |

**Disabled ERC4626:** `maxMint`, `maxRedeem`, `previewMint`, `previewRedeem` return 0.

---

## 7. Position Lifecycle (IXToken)

### Struct

```solidity
struct Position {
    address trader;
    address adapter;
    uint256 marginAmount;
    uint256 allocatedAmount;
    uint256 openingTimestamp;
    uint256 closingTimestamp;
}
```

### openPosition (adapter only)

1. Unique `positionId`; volume + leverage checks.
2. Physical cash `I ≥ margin + allocated`; cap uses `T - D`.
3. Margin → adapter **fixed** ledger; `assetsInStrategy += margin + allocated`.
4. Underlying transferred to adapter.

### closePosition (adapter only)

`debtToReturn = allocated + margin`; branches vs `netReturn = totalReturnAssets - opFee`:

| Branch | Condition |
|--------|-----------|
| Profit | Foundation mint, protocol share, LP slice, trader net |
| Breakeven | Principal returned |
| Limited loss | `loss ≤ margin × liquidationThresholdBps` |
| Hard bad debt | `totalReturn < allocated` |
| Penalty | Loss exceeds threshold |

`opFee` inside `totalReturnAssets`; reverts if `opFee > totalReturnAssets`.

### forceClosePosition

- Keeper: `min(margin × bps, maxReward, gross)` — rebasing shares.
- Settlement on `gross - keeperAsset`.
- Expiry eligibility: **adapter** responsibility.

### liquidatePosition

- Keeper: `min(netRecovery × bps, maxReward)` — rebasing shares.
- `opFee` waived if excessive.
- Bad debt vs limited-loss → updates `pnl`.

### pnl Accumulator

Signed `int256` — protocol-favorable (+) and adverse (-) events. **Not** redeemable NAV.

---

## 8. Protocol Debt (C-1 Disposition)

**Status: Acknowledged / By Design**

`depositWithAffiliate` increases `protocolDebt` (virtual asset in `T`) while full deposit sits in idle `I`. Intent: affiliate CAC amortized via withdrawal fees.

| Guard | Detail |
|-------|--------|
| Physical deploy | `openPosition` uses `T - D` |
| Amortization | Each `withdraw` fee reduces `D` first |
| Redemption UX | Use `maxWithdraw`, not raw `balanceOf` |

Full brief: `iris-core/docs/audit_reports/dispositions/C-1-protocol-debt-phantom-nav.md`

---

## 9. Governance (iris-governance)

### VotingEscrow

| Property | Value |
|----------|-------|
| Asset | IXToken (rebasing shares locked) |
| Duration | 1 week – 4 years (**in blocks**) |
| Weight | Locked rebasing **share count** — no time decay |
| Locks per address | One |
| Delegation | Disabled — `delegates(user) == user` |
| **Clock** | **Block number** (`IERC6372`, `mode=blocknumber`) |
| Withdraw | After unlock, `convertToAssets(shares)` incl. yield |

**Block constants (~12s blocks):**

| Param | Blocks | ~Duration |
|-------|--------|-----------|
| MIN_LOCK_DURATION | 50,400 | 1 week |
| MAX_LOCK_DURATION | 10,512,000 | 4 years |

### IrisGovernor

OZ Governor v5 + `IIrisGovernor` Foundation hooks:

| Parameter | Value |
|-----------|-------|
| Voting delay | 21,600 blocks (~3 days) |
| Voting period | 151,200 blocks (~3 weeks) |
| Proposal threshold | 1,000 voting units |
| Quorum | 10% at snapshot block |

**Integration rule:** `proposalSnapshot` must match VotingEscrow `clock()` — **block number**.

```solidity
ProposalState = isVetoed[proposalId] ? Canceled : super.state(proposalId)
```

### Deployment (CREATE2)

1. `DeployVotingEscrow.s.sol` — `IX_TOKEN_ADDRESS`
2. `DeployGovernorCluster.s.sol` — `VOTING_ESCROW_ADDRESS`, `FOUNDATION_NFT_ADDRESS`, salts

### Known Tech Debt

- `VoitingEscrow.sol` filename typo (rename pending)
- `IrisGovernor` WIP — missing some OZ mixin boilerplate
- Escrow CEI ordering on create/increase (medium)

---

## 10. Flash Lending

Gateway pattern — end borrowers never call IXToken directly.

| Rule | Detail |
|------|--------|
| Entry | `internalFlashLoanToLender` — `onlyLender` |
| Gateway | `IrisFlashLender` — public ERC-3156 (DAI/USDC) |
| Paths | Vault-token flash mint **or** idle underlying transfer |
| Guards | `nonReentrant`, callback success token, post-callback balance checks |
| Fee | `lendingFeeBps` (max 100 bps); default 0 |

**Status:** Gateway WIP in iris-core drafts.

---

## 11. IrisLeveragedSpotV1Adapter

### What It Does

Leveraged **long spot** via generic swap engine:

1. Trader posts margin + vault allocates principal.
2. Adapter swaps underlying → target through off-chain-routed **executor** (`call(data)`).
3. On close/liquidate: target → underlying; reports **gross** to vault.

**Direction:** `LONG` only — `SHORT` reverts.

### Trust / Security (Audit Dispositions)

| ID | Topic | Status |
|----|-------|--------|
| C-02 | Expired + underwater dual keeper paths | By design |
| C-03 | Permissionless `executor` | By design (off-chain route + on-chain validation) |
| C-05 | Liquidation slippage uses pre-swap MTM | Accepted game |

### Oracle / Slippage

- Cross-price via Chainlink: target/USD + underlying/USD (DAI stable).
- Default slippage 1%; hard cap 3%.
- Open/close slippage formulas use feed decimals normalization.

### Adapter Position Lifecycle

| Action | Caller | Vault Call | Keeper Pay |
|--------|--------|------------|------------|
| Open | Trader | `openPosition` | — |
| Close | Trader / authorized operator | `closePosition` | — |
| Expired close | Anyone (keeper) | `forceClosePosition` | margin × bps |
| Liquidate | Keeper | `liquidatePosition` | net × bps |

### Integration Checklist

1. Vault `setAdapterStatus(adapter, true)`; same owner.
2. Deploy adapter: `protocol`, `initialOwner`, `underlyingChainlinkFeed`, `keeperNFT`.
3. `setPositionConfig` per target token.
4. Trader approves IXToken margin.
5. Off-chain service builds executor + calldata.
6. `PositionId.wrap/unwrap` at vault boundary.

---

## 12. Roadmap

| Phase | Objective |
|-------|-----------|
| **1 — Ethereum** | Deploy IXToken, governance cluster, Foundation + Keepers, adapter v1 (ETH leveraged spot), flash lending |
| **2 — Arbitrum** | MirrorStation for low-latency / gas-efficient execution |
| **3 — Expansion** | Collateral lending, additional adapters, full LP farming, multi-asset vaults |

---

## 13. Audit & Test Pointers

### iris-core

- **108+ tests**; ~93% line coverage on `IXToken.sol`
- Reports: `docs/audit_reports/report1.md`, `report2.md`
- Disposition: C-1 protocol debt (by design)
- Fixed: H-1 flash reentrancy, M-1/M-2 ERC-3156 callback/balance checks
- Open: `lpFarming` distribution not wired in core; `IrisFlashLender` WIP

### iris-governance

- `docs/audits/voting-escrow-01.md` — VE-01..VE-12
- VE-01 clock mismatch fixed via `IERC6372`

### Agent Audit Questions

When modifying accounting, always ask:

1. Does `ΔT` match physical `ΔI` + recoverable strategy?
2. Does this path touch fixed, rebasing, or both?
3. Does `assetsInStrategy` move in lockstep with underlying transfers?
4. Are Foundation fees confused with keeper incentives?
5. Is block-number clock preserved across escrow + governor?

---

## 14. iris-whitepaper Docs Site

### Published Structure (`docs/`, route base `/`)

| Path | Content |
|------|---------|
| `intro.md` | Homepage (`slug: /`) |
| `whitepaper/public-brief.md` | Short public overview |
| `whitepaper/full-academic.md` | Detailed academic whitepaper |
| `whitepaper/abstract.md` | Executive summary |
| `whitepaper/tokenomics.md` | Fee architecture |
| `whitepaper/roadmap.md` | Phased deployment |
| `technical/*` | Vault, lifecycle, C-1, governance, flash, adapter |
| `foundation-lore/overview.md` + `chair-00`…`chair-14` | 15 Chair spec |
| `keepers-lore/keepers-overview.md` + 5 knight pages | Keeper spec |
| `growth/marketing-strategy.md` | GTM, CAC, migration thesis, competitive advantage |
| `growth/awareness-action-plan.md` | 90-day awareness campaign |
| `growth/user-onboarding-action-plan.md` | Segment onboarding flows |

### Excluded from Public Build

- `docs/_internal/` — raw agent brief (`00-welcome.md`)
- `docs/aic/` — this file and `overview.md`

### Static Assets

- `static/img/logo.svg` — navbar / favicon
- `static/assets/nft-foundations/metadata/{0-14}-chair.json` — NFT metadata stubs
- `static/assets/nft-foundations/renders/7-faceless-void.png` — Chair #7 render

### Build

```bash
pnpm install
pnpm build    # onBrokenLinks: 'throw'
pnpm start    # dev server
```

**Docusaurus:** 3.10.1; webpack 5.96.1 pin for Node 24.

---

## 15. Agent Conventions

### Documentation

1. Chairs have **no on-chain names** — reference token IDs **0–14** only.
2. **VotingEscrow clock = block number** — not timestamp.
3. Always separate **Foundation 5% fee** from **keeper execution incentives**.
4. Do not paste full `IXToken.sol` into user-facing docs — summarize + link to iris-core.
5. Run `pnpm build` after structural doc changes.
6. Do not commit unless the user asks.

### Solidity (iris-core / iris-governance / adapter)

1. Minimal diffs; match SPDX (`MIT` on interfaces).
2. Production NatSpec (`@notice`, `@dev`, `@param`, `@inheritdoc`).
3. `forge build` + `forge test` after changes.
4. Verify clock alignment when touching escrow + governor.
5. Match existing rounding and dual-ledger semantics.

### Tone

- **Whitepaper / technical:** academic, precise, game-theoretic where relevant.
- **Keeper lore:** mechanical, automated, gas-efficient narrative.
- **Foundation lore:** institutional authority; Chairs are equal — no kingdom names on-chain.

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| **IrisX / IXToken** | Rebasing vault token over underlying DAI |
| **Shares** | Internal rebasing units (`_shares`), not a separate ERC20 |
| **Fixed ledger** | 1:1 internal balance for adapters/DEX |
| **Adapter** | Authorized `IIrisAdapter` bridging vault ↔ DEX |
| **Margin** | Trader collateral for loss absorption |
| **Allocated** | Vault principal deployed for trade |
| **protocolDebt** | Virtual affiliate IOU inside `T` (C-1) |
| **assetsInStrategy** | Booked deployed capital (margin + allocation) |
| **opFee** | Operator fee inside gross return |
| **Foundation** | 15-Chair ERC721 @ `0x00008c80…0000` |
| **Consul veto** | 50%+1 Chair consensus during timelock |
| **Kamikaze veto** | Single Chair burn → instant veto |
| **Keeper** | 5-NFT execution corps; liquidation/force-close |
| **Executor** | Off-chain-routed swap router (not allowlisted on-chain) |
| **lender** | Trusted flash gateway; sole flash caller on IXToken |
| **lpFarming** | UV4 LP locker integration (partial) |

---

## 17. Security Contact

`security@irislab.net`

---

## 18. Quick Reference — Fee Separation

```
TRADER PROFIT CLOSE
├── Foundation 5%  → Foundation contract → ClaimRewards → Chair holders (equal)
├── Protocol 20%   → Rebasing vault NAV
├── LP 5%          → lpFarming locker (or Foundation)
└── Trader         → Net remainder

KEEPER EXECUTION (separate rail)
├── Force-close    → min(margin × 10%, cap, gross) vault shares to keeper
└── Liquidation    → min(netRecovery × 10%, cap) vault shares to keeper

WITHDRAWAL
└── 0.5% fee       → amortizes protocolDebt, then protocol pnl
```

---

*End of master AI context. For raw embedded Solidity and forge output, see `docs/_internal/00-welcome.md`.*
