---
id: technical-carousel
title: Technical Carousel — 10 Slides
description: High-value technical carousel script for Iris Protocol — dual-ledger, invariants, game theory.
sidebar_position: 4
---

# Iris Protocol — 10-Slide Technical Carousel

> **Format:** Web3 CTO / Auditor / DeFi Architect thread. No fluff. Mathematics first.  
> **Source:** Iris Protocol Master Spec (`docs/aic/ai_context.md`)

---

## Slide 1 — Hook / The Paradigm Shift

### Slide Title
**The Death of Fragmented Liquidity: Architecting Leveraged Spot Infrastructure**

### Technical Breakdown
- Most "leveraged spot" stacks are **lending pools with a swap router glued on top**. Liquidity rebases in the vault while execution routes through external venues — **accounting and execution share state they should not share**.
- Iris **decouples the ledger from the execution plane**: `IXToken` books margin + allocation (`assetsInStrategy`); adapters report gross recovery; swaps happen behind `onlyAuthorizedAdapter`.
- Rebasing yield accrues to depositors on **one consolidated book** (`T = I + D + S`). Leverage deploys from **physical cash** (`T - D`), not from phantom NAV.
- Result: a margin vault that funds spot-long adapters — **not** an over-collateralized lending pool pretending to be a DEX.

### The Code/Formula Accent
```
Execution plane  →  IIrisAdapter.openPosition / closePosition
Accounting plane →  IXToken: I, D, S, σ, F  (isolated invariants)
```

### Auditor Verdict / Takeaway
**Separation of concerns is not a design preference — it is an exploit surface reducer.** When rebasing share price and DEX margin balances share one mutable ledger without mode flags, integrators inherit rounding bombs. Dual-plane architecture is the minimum viable isolation for leveraged spot at scale.

---

## Slide 2 — The Core Token Matrix

### Slide Title
**System Topography & Core Matrix**

### Technical Breakdown
- **Pillar 1 — Underlying (DAI):** 18-decimal unit of account. All user-facing balances denominated in underlying wei. No internal "share token" ERC20 — `IXToken` *is* the asset-denominated surface.
- **Pillar 2 — IXToken (Dual-Ledger):** UUPS proxy on Cancun EVM. `ReentrancyGuardTransient` (EIP-1153) on heavy paths. Rebasing `_shares` + fixed `_fixedBalances` under `isExcludedFromYield`.
- **Pillar 3 — Foundation (15 Chairs):** `ERC721("The Iris Foundation", "IRIS-FOUNDATION")` @ `0x00008c80D4cBD653B1D384566d9b23B37d100000`. Token IDs 0–14, functionally identical. `ClaimRewards(token)` equal-split among live cards. **5%** of gross trade profit (`foundationFeeBps = 500`).
- **Pillar 4 — Keeper Corps (5 NFTs):** Execution keys for `liquidatePosition` / `forceClosePosition`. Paid via `_mint` rebasing shares — **orthogonal rail** to Foundation fee capture.
- **Binding layer:** Governance (`VotingEscrow` → `IrisGovernor` → Timelock) owns vault parameters. Foundation hooks veto during timelock quarantine. Adapters authorized via `setAdapterStatus` — **same owner as vault**.

### The Code/Formula Accent
```
DAI → IXToken (I,D,S,σ,F) ← IIrisAdapter ← Trader/Keeper
         ↑                      ↑
    Foundation 5%          Keeper mint (bps)
    ClaimRewards           ≠ Foundation rail
```

### Auditor Verdict / Takeaway
**Four pillars, four incentive rails, one owner graph.** Any integration that conflates Foundation profit share with Keeper execution mints has misunderstood the protocol's incentive orthogonality — a common source of erroneous TVL and fee attribution in dashboards.

---

## Slide 3 — Invariant #1: Global Asset Accounting

### Slide Title
**The Master Accounting Invariant: T = I + D + S**

### Technical Breakdown
- **`I`** — `_underlying.balanceOf(vault)`. Idle cash. **Physical redemption ceiling.** `maxWithdraw(user) ≤ I`, not `T`.
- **`D`** — `protocolDebt`. Virtual affiliate IOU booked in `totalAssets()` (C-1 disposition: acknowledged by design). Inflates rebasing NAV; **cannot** be deployed to adapters.
- **`S`** — `assetsInStrategy`. Sum of `marginAmount + allocatedAmount` across open positions. Moves in lockstep with adapter pulls on open/close.
- **`T = I + D + S`** — single source of book NAV. All share conversion flows through `T` exactly once.
- **Fatal integrator bug:** `totalSupply() + S` or `convertToAssets(σ) + F + S`. **Double-counts deployed capital.** Creates phantom redeemable assets — instantly exploitable in any composable exit path.

### The Code/Formula Accent
```
T = totalAssets() = I + D + S

totalSupply() = convertToAssets(σ) + F     ← S is ALREADY inside T
                                           ← NEVER add S again

R = _rebasingAssets() = max(T - F, 0)
```

### Auditor Verdict / Takeaway
**If your mental model adds `assetsInStrategy` to liabilities twice, you are auditing the wrong contract.** This invariant is the #1 integration failure mode for vault composability. Verify: `ΔT` on `openPosition` should net to zero at booking (ΔI = -b, ΔS = +b).

---

## Slide 4 — Invariant #2: The Dual-Ledger System

### Slide Title
**Bridging Yield and Execution: The Dual-Ledger Vault**

### Technical Breakdown
- **`isExcludedFromYield[account] == false` → Rebasing ledger.** Storage: `_shares[user]`. Balance view: `convertToAssets(shares)` with **Floor** rounding. Accrues yield as `T` grows.
- **`isExcludedFromYield[account] == true` → Fixed ledger.** Storage: `_fixedBalances[user]`. Balance view: exact 1:1 underlying. **No yield.** DEX-safe — no rebasing surprise at adapter boundary.
- **Migration:** `setExcludeFromYield(account, exclude)` snapshots `balanceOf` first, then atomically moves between ledgers. `ZeroSharesMinted` guard on fixed→rebasing dust paths.
- **Adapter margin** posts to adapter's **fixed** ledger. Trader allowance + `_executeTransfer` — margin never rebases mid-position.
- **Rounding policy (vault-favorable):** Deposit/mint Floor. Withdraw/burn Ceil. Rebasing `balanceOf` Floor. `minimumDepositAssetAmount` blocks dust inflation attacks.

### The Code/Formula Accent
```
totalSupply() = convertToAssets(σ) + F

where:
  σ = _totalShares        (rebasing)
  F = _totalFixedBalances (1:1 fixed)
```

### Auditor Verdict / Takeaway
**Dual-ledger is not cosmetic — it is the bridge between ERC4626-style yield and fixed-amount DEX approvals.** Single-ledger rebasing vaults that route margin to external swaps leak value at every `transfer` boundary. Floor/Ceil asymmetry is intentional value retention, not a bug — document it or get rekt by micro-arbitrageurs.

---

## Slide 5 — The Solvency Guard Formula

### Slide Title
**Preventing Affiliate Drain Attacks**

### Technical Breakdown
- `depositWithAffiliate` mints affiliate rebasing shares at **`affiliateFeeBps = 10` (0.1%)** and books **`protocolDebt += affiliateAmount`** — optimistic CAC (customer acquisition cost).
- Depositor receives full `previewDeposit(assets)` on gross — **no upfront haircut**. Affiliate earns immediate rebasing exposure.
- **`D` repays via withdrawal fees:** each `withdraw` reduces `protocolDebt` by `min(fee, D)` before protocol `pnl` accrual (`withdrawalFeeBps = 50`, 0.5%).
- **Physical deploy cap:** `openPosition` uses `totalPhysicalAssets = totalAssets() - protocolDebt`. Phantom `D` **never** leaves the vault as strategy capital.
- **`setProtocolParameters`** enforces steady-state solvency — governance cannot set fee tuples that make affiliate CAC unrecoverable under max-stress withdrawal model.

### The Code/Formula Accent
```
withdrawalFeeBps × (10_000 - maxOpenPositionsVolumeBps)
    ≥ affiliateFeeBps × 10_000

Defaults:
  50 × (10_000 - 5_000) = 250_000
  10 × 10_000 = 100_000
  250_000 ≥ 100_000  ✓
```

### Auditor Verdict / Takeaway
**Affiliate programs without amortization guards are slow-motion insolvency machines.** Iris encodes payback into `_validateSolvencyRatio`. Auditors: do not re-flag C-1 as Critical — it is a **dispositioned design choice** with explicit physical guards. Flag it only if governance can bypass the ratio check.

---

## Slide 6 — The Profit Waterfall

### Slide Title
**The Yield Engine: Gross Trade Profit Waterfall**

### Technical Breakdown
- Trigger: `closePosition` where `netReturn = totalReturnAssets - opFee` **>** `debtToReturn = allocated + margin`.
- **`foundationFeeBps = 500` → 5%** of gross profit minted to Foundation contract (`0x00008c80…0000`). Later distributed via `ClaimRewards` to 15 live Chairs.
- **`protocolShareOfProfitBps = 2000` → 20%** retained in vault — rebasing NAV accrual to all σ holders.
- **`lpFarmingFeeBps = 500` → 5%** minted to `lpFarming` locker. If `lpFarming == address(0)`, slice falls through to Foundation.
- **Trader → 70%** of gross profit slice (remainder after 5+20+5). Exact wei via `_closePosition` branch — no floating-point, no off-chain reconciliation.
- **`opFee`** is **inside** `totalReturnAssets`. Reverts `{InvalidOperatorFee}` if `opFee > totalReturnAssets`. Separate from profit waterfall — accrues to `pnl` on close.

### The Code/Formula Accent
```
Let Π = netReturn - debtToReturn   (gross trade profit)

Foundation  ← Π × 500 / 10_000     (5%)
Protocol    ← Π × 2000 / 10_000    (20%)
LP Farming  ← Π × 500 / 10_000     (5%)
Trader      ← Π - above three      (70%)
```

### Auditor Verdict / Takeaway
**Profit splits are bps-governed mint events, not treasury spreadsheets.** Every basis point is on-chain and tunable via `onlyOwner`. Rounding leaks at profit boundaries are bounded by vault-favorable Floor/Ceil on share mints. Trace `test_ClosePosition_ProfitPath` before asserting fee drift.

---

## Slide 7 — Foundation Lore & Game Theory

### Slide Title
**Veto Game Theory: Consul vs. Kamikaze**

### Technical Breakdown
- **Consul Veto:** `floor(liveCards / 2) + 1` Chairs sign during timelock quarantine. **No token burn.** Proposal rejected gracefully — returns to community for revision. Cost: coordination latency. Rational for non-existential disputes (parameter disagreements, risky adapter listings).
- **Kamikaze Veto:** **Single** Chair burns own token → `isVetoed[proposalId] = true` instantly. Bypasses consensus and timelock delay. Chair removed from `activeCardsRegistry`. Surviving 14 Chairs absorb redistributed 1/15 fee stream permanently.
- **Threshold bypass:** Any Chair submits proposals without standard Governor threshold (`1_000` voting units default) — institutional proposal initiation rail.
- **NPV inequality for Kamikaze:** Chair burns only when `PV(fee_stream_lost) < PV(protocol_loss_avoided)`. With 5% of volumetric profit split 15 ways, Kamikaze is a **credible nuclear option** — expensive enough to prevent frivolous use, available enough to stop governance capture.

### The Code/Formula Accent
```
Consul threshold:
  validVetoers > floor(liveCards / 2)

Kamikaze rationality:
  Burn iff  NPV(1/15 × 5% × future_profit)  <  existential_loss
```

### Auditor Verdict / Takeaway
**Governance overlays that cost nothing get spammed. Overlays that cost everything get used once.** The Consul/Kamikaze bifurcation is mechanism design, not lore. Auditors should verify `isVetoed` overrides `Governor.state()` and that burn correctly updates `activeCardsRegistry` before recalculating future Consul thresholds.

---

## Slide 8 — Keeper Corps Separation

### Slide Title
**Orthogonal Incentives: Keeper Corps Rails**

### Technical Breakdown
- Foundation captures **5% of trader profit** on close — institutional, passive, `ClaimRewards` distribution.
- Keepers capture **execution bounties** via fresh `_mint` rebasing shares on `forceClosePosition` / `liquidatePosition` — active, competitive, latency-gated.
- **Squall Keeper path:** `closeExpiredPosition` → `forceClosePosition`. Incentive: `min(margin × keeperIncentiveRewardBps, maxKeeperIncentiveReward, gross)`. Default bps: **1000 (10%)**. Sized on **margin** — administrative/expiry closes.
- **Iron Liquidator path:** `liquidatePosition`. Incentive: `min(netRecovery × keeperIncentiveRewardBps, maxKeeperIncentiveReward)`. Sized on **net recovery after opFee** — underwater rescues. Intentionally larger effective premium on high-recovery liquidations.
- **`opFee` waived** on liquidation if `opFee > totalReturnAssets`. Keeper mint is **never** deducted from Foundation 5% — different settlement branch, different economic rail.
- **Premium Keeper NFT:** Stricter `liquidationThresholdBps` at adapter layer; shorter `maxPositionDurationSeconds` for non-keepers. MEV-aware competitive execution assumed.

### The Code/Formula Accent
```
Force-close:  K = min(m × bps, K_max, G)
Liquidation:  K = min(r_net × bps, K_max)

where:
  m = marginAmount
  r_net = netRecovery after opFee
  bps = keeperIncentiveRewardBps (default 1000)
  K_max = maxKeeperIncentiveReward
```

### Auditor Verdict / Takeaway
**Conflating Keeper mints with Foundation fees is a category error.** Keepers are solvency maintenance workers paid from settlement math; Foundation Chairs are fee royalty holders paid from profit waterfall. Orthogonal rails prevent perverse incentive to liquidate profitable positions for Keeper bps. Verify sanctions check on `forceClosePosition` — `MockSanctionsList` blocks sanctioned keepers.

---

## Slide 9 — Governance Chronology

### Slide Title
**Deprecating Time: The IERC6372 Block-Number Clock**

### Technical Breakdown
- **Timestamp clocks in HF DeFi are manipulable anchors.** Miner/validator timestamp skew, cross-chain drift, and L2 sequencer time create snapshot ambiguity for `proposalSnapshot` vs `getPastVotes`.
- Iris `VotingEscrow` implements **`IERC6372` with `clock() = block.number`**. All checkpoints, voting weight lookups, and Governor snapshots keyed to **block height**, not `block.timestamp`.
- **Voting delay:** `21_600` blocks ≈ 3 days at 12s/block — proposal submission to voting start.
- **Voting period:** `151_200` blocks ≈ 3 weeks — active voting window.
- **Lock duration:** `50_400` blocks (min, ~1 week) to `10_512_000` blocks (max, ~4 years). Weight = locked share count — **no time decay on vote weight** (differs from Curve ve-model).
- **Delegation disabled:** `delegates(user) == user` always. `ManualDelegationNotAllowed()` on `delegate` / `delegateBySig`. Anti vote-renting by design.
- **Integration rule:** `IrisGovernor.proposalSnapshot` block numbers **must** match `VotingEscrow.clock()` mode. Mismatch = VE-01 class bug (fixed in codebase via `IERC6372`).

### The Code/Formula Accent
```
clock() = block.number          (IERC6372)
votingDelay    = 21_600 blocks  (~3 days @ 12s)
votingPeriod   = 151_200 blocks (~21 days @ 12s)
proposalThreshold = 1_000 × 10^{18} voting units
quorumFraction = 10%
```

### Auditor Verdict / Takeaway
**Clock mode alignment is not optional boilerplate — it is a governance safety invariant.** Any fork that reintroduces timestamp mode on escrow while Governor expects blocks creates silent vote weight desync. Verify `IERC6372` on both contracts before mainnet deployment sign-off.

---

## Slide 10 — The Auditor's Threat Map / CTA

### Slide Title
**Hardening the Stack: The Final Audit Disposition**

### Technical Breakdown
Four verification targets every reviewer must close before calling this stack production-grade:

1. **Flash mint reentrancy (H-1 — Fixed):** `internalFlashLoanToLender` guarded by `nonReentrant` + `onlyLender`. ERC-3156 callback success token verified (`ERC3156CallbackFailed`). Post-callback balance checks on both vault-token mint path and underlying transfer path. **Re-verify** after any flash gateway WIP merge.

2. **Ledger synchronization deltas:** On every `openPosition` / `closePosition` / `liquidatePosition`, assert `ΔassetsInStrategy` matches underlying flow. On `setExcludeFromYield`, assert `balanceOf` snapshot preserves total liabilities. **Transfer path is NOT `nonReentrant`** — document reentrancy threat surface on `_executeTransfer`.

3. **Vault-favorable rounding (Floor vs. Ceil):** Fuzz `deposit` / `withdraw` / full-exit dust sweep. Confirm `minimumDepositAssetAmount` blocks zero-share mint. Fixed→rebasing migration must revert on `ZeroSharesMinted`. **Dust Sweeper** keeper lore documents the ≤1 wei frontier.

4. **Oracle multi-feed skew normalization (Adapter):** Cross-price open/close uses separate Chainlink feeds for target/USD and underlying/USD. Slippage floor: `defaultSlippageBps = 100` (1%), hard cap `maxSlippageBps = 300` (3%). Liquidation slippage checked against **pre-swap MTM** (C-05 accepted game). Executor is permissionless by design (C-03) — safety is balance delta + slippage, not router allowlist.

### The Code/Formula Accent
```
Audit closure checklist:
  [ ] flash: nonReentrant + callback token + balance post-check
  [ ] ledger: ΔS ↔ ΔI on position lifecycle
  [ ] rounding: Floor mint / Ceil burn / dust sweep
  [ ] oracle: cross-feed decimal normalization + staleness
```

### Auditor Verdict / Takeaway
**108+ Foundry tests. ~93% line coverage on IXToken.sol. C-1 dispositioned. H-1/M-1/M-2 closed.** The remaining risk is operational: adapter-reported returns, governance parameter drift, and flash gateway completion. The master specification is compiled.

**CTA:** Read the full academic whitepaper at `docs.iris.exchange/whitepaper/full-academic`. Agent master spec: `docs/aic/ai_context.md` in the repository. Audit dispositions: `iris-core/docs/audit_reports/`. Build un-rektable architecture — or do not build at all.

---

*End of carousel. Export each slide as 1080×1080 or 4:5 vertical. One invariant per slide. No guaranteed yield language.*
