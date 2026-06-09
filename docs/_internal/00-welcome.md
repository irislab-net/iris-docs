The Context Changed
The Foundation NFT name is ERC721("The Iris Foundation", "IRIS-FOUNDATION") here is a short description:
The official sovereign ledger of the 15 Genesis Foundation Chairs of Iris Protocol. Operating as institutional-grade credit lines and the supreme financial council, this elite 15-card cluster forms the dual-ledger governance monopoly over the IrisX vault stack. 'The Foundation issues the credit lines; the network executes the reality of the ledger.' These 15 Chairs bypass standard protocol thresholds for proposal submission, capture a PERPETUAL 5% operational fee scaling with PROTOCOL VOLUMETRIC GROWTH, and maintain tactical veto power requiring a 50% + 1 Consul consensus to execute a sacrificial Kamikaze Burn.

the Collection Address itself is the foundation of Iris-Core "0x00008c80D4cBD653B1D384566d9b23B37d100000".
when traders gains profit, then 5 percent of profit will be transfered to the Foundation.
The Foundaiton have a function to claim the rewards to holders
```sol
 /// @inheritdoc IIFoundation
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
The foundation also can Veto a Governance Proposal if 50% of Holders vote for veto. or each of them can kamikaze burn his/her own token and force veto a propposal in emergency cases.
Also each Foundation Holder can submit a proposal without checking the threshold (By Bass the Threshold).
It is perputinal Income for life time for Foundation Holder, 

We have 5 Keepers that have a preminum access to liquid or force close traders position.
they can gain some review by this process. keeping the protocol safe.

We have a governance which is owner of all system, with a time lock and voting escrow.
here is AI Context of that project.
```md
# AI Context — Iris Governance (`iris-governance`)

> Machine- and human-readable context for agents and auditors working in this repository.
> Last updated: 2026-05-28.

## Repository purpose

Solidity contracts for **Iris Protocol on-chain governance**: time-locked voting escrow over **IXToken** (`iris-core`), plus **IrisGovernor** (OpenZeppelin Governor stack) with Iris-specific veto/council hooks.

## Layout

| Path | Role |
|------|------|
| `src/VoitingEscrow.sol` | `VotingEscrow` implementation (filename typo — rename pending) |
| `src/interfaces/IVotingEscrow.sol` | Escrow + `IVotes` API |
| `src/interfaces/IIrisGovernor.sol` | Governor extensions (kamikaze/council veto) |
| `src/IrisGovernor` | Governor implementation (WIP) |
| `lib/iris-core/` | Submodule: `IIXToken`, vault, adapters |
| `lib/openzeppelin-contracts/` | OZ Governor, Checkpoints, Timelock |
| `docs/audits/` | Audit reports (`voting-escrow-01.md`, …) |
| `foundry.toml` | Foundry: solc `0.8.26`, optimizer 10k runs, `via_ir` |

## Build & test

```bash
forge build
forge test
```

## Deployment (CREATE2)

1. `script/DeployVotingEscrow.s.sol` — requires `IX_TOKEN_ADDRESS`, optional `VOTING_ESCROW_SALT`
2. `script/DeployGovernorCluster.s.sol` — requires `VOTING_ESCROW_ADDRESS`, `KINGS_NFT_ADDRESS`, `TIMELOCK_SALT`, `GOVERNOR_SALT`

Without salts, scripts print `cast create2` vanity-mining instructions. With salts + `PRIVATE_KEY`, add `--broadcast`.

See `script/utils/Create2Script.sol` for shared logic (fixed-point solver for timelock/governor).

Remappings: see `remappings.txt` (`@openzeppelin/`, `@iris-core/`).

## VotingEscrow — mental model

1. User locks **IXToken assets** for `duration` ∈ [1 week, 4 years].
2. Contract stores **rebasing share count** and `unlockTime`; voting weight = shares (not duration).
3. **One lock per address**; use `increaseLockAmount` / `extendLockDuration` to adjust.
4. **Delegation disabled**; `delegates(user) == user` for Governor UX.
5. **Clock:** timestamp-based (`IERC6372`); checkpoints keyed by `block.timestamp` as `uint32`.
6. **Withdraw:** after `unlockTime`, pays `convertToAssets(shares)` (includes yield while locked).

## IrisGovernor — mental model (in progress)

Target stack: `Governor`, `GovernorSettings`, `GovernorCountingSimple`, `GovernorVotes`, `GovernorVotesQuorumFraction`, `GovernorTimelockControl`, plus `IIrisGovernor` (Foundation NFT, council/kamikaze veto).

**Integration rule:** Governor `proposalSnapshot` timepoints must match escrow `clock()` mode (timestamp).

## External dependencies

- **IIXToken** (`@iris-core/interfaces/IIXToken.sol`): rebasing vault; asset-denominated ERC-20 surface; `convertToShares` / `convertToAssets` use floor rounding.
- **OpenZeppelin Governor v5**: expects `IVotes` + preferably `IERC6372` on the votes token.

## Known issues / tech debt

| Item | Severity | Notes |
|------|----------|-------|
| `VoitingEscrow.sol` typo | Low | Rename to `VotingEscrow.sol` |
| `IrisGovernor` incomplete | — | Missing OZ mixins + override boilerplate |
| Escrow CEI ordering | Medium | `transferFrom` before state on create/increase |
| No escrow test suite in-repo | — | Add Foundry tests before mainnet |
| Duration ≠ vote weight | Design | Documented in audit VE-03 |

## Audit artifacts

- **Latest escrow review:** `docs/audits/voting-escrow-01.md`
- Findings IDs: `VE-01` … `VE-12`
- **VE-01 (clock mismatch):** fixed in code via `IERC6372`

## Conventions for agents

1. Prefer **minimal diffs**; match existing SPDX (`MIT` on interfaces/escrow).
2. NatSpec: production-grade (`@notice`, `@dev`, `@param`, `@inheritdoc` where valid).
3. Do **not** commit unless the user asks.
4. When touching escrow + governor, verify **clock mode** alignment.
5. Use `forge build` after Solidity changes.

## Security contact

`@custom:security-contact security@irislab.net` (on `VotingEscrow`).

## Related repos

- `iris-core` — IXToken vault, adapters, positions (submodule under `lib/iris-core`)
```

Here is AI context for Iris-Core
```md
# Iris Core — AI Context (Release Final)

> **Purpose:** Onboard agents, integrators, and auditors to the IrisX vault (`IXToken`) — architecture, accounting, test map, and audit pointers.  
> **Repo:** `iris-core` (Foundry / Solidity 0.8.26, OpenZpelin upgradeable + UUPS proxy).  
> **Release:** RC — 2026-05-22  
> **Last synced to code:** `src/IXToken.sol` + Foundry suite (103 tests incl. flash-loan suite; ~93% line coverage on `IXToken.sol`)

---

## 1. What this project is

**Iris Core** is the on-chain **vault token** layer for Iris Lab’s leveraged trading stack. The flagship contract **`IXToken`** (branded **IrisX**, e.g. `IUSDT` over USDT) is:

- An **ERC20-facing vault share** denominated in **underlying asset units** (not internal rebasing “shares”).
- A **dual-ledger** system: rebasing yield-bearing balances + **fixed 1:1** balances for DEX/integration safety.
- A **margin execution vault** that funds **authorized adapters** (`IIrisAdapter`) for external DEX leverage, not a classic over-collateralized lending pool.

**Off-chain / sibling components (not in this repo):** DEX adapters implement `IIrisAdapter`; keepers liquidate via adapter; oracles live at adapter level.

---

## 2. High-level architecture

```
                    ┌─────────────────────────────────────┐
                    │           IXToken (UUPS)            │
                    │  • Deposits / withdraws / transfer  │
                    │  • Dual ledger (shares + fixed)   │
                    │  • Position registry + accounting   │
                    └──────────────┬──────────────────────┘
                                   │ onlyAuthorizedAdapter
                    ┌──────────────▼──────────────────────┐
                    │         IIrisAdapter (per DEX)      │
                    │  • openPosition / close / liquidate │
                    │  • Oracle + DEX execution           │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │            Trader / Keeper          │
                    └─────────────────────────────────────┘

     Flash ERC-3156 users ──► IrisFlashLender (gateway, WIP)
                                   │ onlyLender
                    ┌──────────────▼──────────────────────┐
                    │  IXToken.internalFlashLoanToLender  │
                    │  • vault-token flash mint + burn    │
                    │  • idle underlying transfer         │
                    └─────────────────────────────────────┘
```

**Trust model:** Vault **trusts authorized adapters** for `totalReturnAssets` on close/liquidate. Adapters must be **Ownable by same owner as vault** (`setAdapterStatus`). Traders post **margin** via IXToken allowance + `_executeTransfer` into adapter’s **fixed** ledger.

**Flash trust model:** Only governance-set **`lender`** (`IrisFlashLender` gateway) may call `internalFlashLoanToLender`. End borrowers never touch IXToken flash entrypoints directly.

---

## 3. Dual-ledger model (core idea)

| Mode | Flag | Storage | Balance view | Yield |
|------|------|---------|--------------|-------|
| **Rebasing** | `isExcludedFromYield[user] == false` | `_shares[user]`, `_totalShares` | `convertToAssets(shares)` (Floor) | Yes — share price rises with pool |
| **Fixed** | `isExcludedFromYield[user] == true` | `_fixedBalances[user]`, `_totalFixedBalances` | Exact 1:1 assets | No |

**User-facing unit:** always **underlying wei** (ERC20 `transfer(amount)` is asset-denominated).

**Migration:** `setExcludeFromYield(account, exclude)` — snapshots `balanceOf` first, then moves between ledgers (owner or user).

**Rounding policy (vault-favorable):**

- Deposit / mint shares: **Floor**
- Withdraw / burn shares: **Ceil**
- `balanceOf` (rebasing): **Floor**
- Dust bounded & blocked: `minimumDepositAssetAmount`, `ZeroSharesMinted` on fixed→rebasing

---

## 4. Accounting equations (must not confuse integrators)

From contract header / invariant sheet:

```
T = totalAssets() = I + D + S

  I = _underlying.balanceOf(vault)     // idle cash
  D = protocolDebt                     // virtual IOU (affiliate commissions)
  S = assetsInStrategy                 // booked deployed capital (margin + allocation)

F = _totalFixedBalances
σ = _totalShares

R = _rebasingAssets() = max(T - F, 0)   // pool backing rebasing shares

totalSupply() = convertToAssets(σ) + F   // gross liabilities (asset units)
```

**Critical:** Do **not** add `assetsInStrategy` again to `totalSupply()` — `convertToAssets` already flows through `totalAssets()` which includes `S` **once**.

**Physical redemptions** are limited by **idle `I`**, not `T`. `maxWithdraw` caps by on-chain cash.

**Affiliate flow (`depositWithAffiliate`):**

1. Pull gross `assets` from depositor.
2. Mint affiliate rebasing shares for `affiliateFeeBps` slice; **`protocolDebt += affiliateAmount`** (virtual asset in `T`).
3. Mint depositor shares from `previewDeposit(assets)` on **full** gross (known audit concern — liability can overshoot single-pool fair mint).

**Repaying `protocolDebt`:** each `withdraw` reduces `D` by withdrawal `fee` (capped at current `D`). Governance **`setProtocolParameters`** enforces steady-state:

`withdrawalFeeBps × (10000 - maxOpenPositionsVolumeBps) ≥ affiliateFeeBps × 10000`

### Optimistic accounting (`protocolDebt`) — audit disposition C-1

**Status: Acknowledged / By Design** (not treated as an open Critical by the protocol team).

| Topic | Detail |
|-------|--------|
| **Intent** | Short-term `ΔT_phantom = f` on affiliate deposit is **CAC (user acquisition cost)** — affiliate earns rebasing exposure immediately; cost amortized via withdrawal fees. |
| **Virtual ledger** | `D` inflates `T` and rebasing NAV before fees repay it; avoids upfront depositor haircut. |
| **Physical guard** | Strategy/volume caps use `totalPhysicalAssets = totalAssets() - protocolDebt` — phantom `D` **cannot** be deployed to adapters. |
| **Amortization guard** | `_validateSolvencyRatio` blocks parameter sets where fees cannot repay affiliate bps over max-stress withdrawal model. |
| **Not claimed** | All holders cannot simultaneously redeem full `balanceOf` from idle `I`; use `maxWithdraw`. Gross `previewDeposit(assets)` + affiliate mint is a **separate** audit item (report2). |

**Full disposition:** `docs/audit_reports/dispositions/C-1-protocol-debt-phantom-nav.md`

---

## 5. Position lifecycle (margin vault)

### Struct `Position`

- `trader`, `adapter`, `marginAmount`, `allocatedAmount`, `openingTimestamp`, `closingTimestamp`

### `openPosition` (adapter only)

1. Checks: unique `positionId`, volume cap, **physical cash** `>= margin + allocated`, **leverage** `allocated <= margin × maxLeverageBps`.
2. `totalPhysicalAssets = totalAssets() - protocolDebt` used for volume cap (excludes phantom `D`).
3. `_spendAllowance(trader, adapter, marginAmount)` + `_executeTransfer(trader, adapter, marginAmount)` — margin on adapter **fixed** ledger.
4. `assetsInStrategy += margin + allocated`; transfer same amount underlying to adapter.
5. Store position.

**Note:** `InsufficientPhysicalLiquidity` is defensive; under consistent accounting the volume cap implies `margin + allocated ≤ I` when the cap passes. See `docs/audit_reports/test-coverage.md` §4.1.

### `closePosition(positionId, totalReturnAssets, opFee)` (adapter only)

Computes `debtToReturn = allocated + margin`, `profit` / `loss` vs **net** return (`totalReturnAssets - opFee`).

**Branches:** profit (foundation mint + trader net profit), breakeven, limited loss, hard bad debt, penalty path. See `test/IXTokenPositionLifecycleTest.t.sol`.

**Settlement ordering (not a CEI bug):** ledger effects run **before** underlying pull because `totalAssets() = I + D + S`. Pull is deferred; tx is atomic (`nonReentrant`, revert on failed `transferFrom`).

**Protocol fee (`opFee`):** included **inside** `totalReturnAssets`. Reverts `{InvalidOperatorFee}` if `opFee > totalReturnAssets` on close.

### `forceClosePosition(positionId, totalReturnAssets, opFee, keeper)` (adapter only)

- **Keeper sizing:** `margin × keeperIncentiveRewardBps` (capped by `maxKeeperIncentiveReward` and gross).
- Settlement on `gross - keeperAsset`; `_closePosition` applies `opFee` on post-keeper amount.
- Keeper paid **rebasing vault shares** via `_mint`; adapter pulls full original **`totalReturnAssets`**.
- **Expiry/eligibility:** adapter responsibility, not core.

### `liquidatePosition(positionId, totalReturnAssets, keeper, opFee)`

- **Keeper sizing:** `netRecovery × bps` (intentionally larger effective incentive than force-close).
- **`opFee` waived** if `opFee > totalReturnAssets`.
- Bad debt vs limited-loss branches update `pnl` and adapter fixed ledger.

### On-chain `pnl` accumulator

Signed analytics ledger — **not NAV**. See prior audit docs; do not equate with redeemable cash.

---

## 6. Key user flows

| Function | Who | Notes |
|----------|-----|-------|
| `deposit(assets, receiver)` | Anyone | `minDeposit`; Floor shares for rebasing receiver |
| `depositWithAffiliate(...)` | Anyone | Affiliate shares + `protocolDebt` |
| `depositWithPermit` / `depositWithAffiliateAndPermit` | Anyone | Best-effort underlying `permit` then deposit |
| `withdraw(assets, receiver, owner)` | Owner / allowance | Fee on top; fixed ledger burns 1:1; full-exit dust sweep |
| `transfer` / `transferFrom` | Holders | Dual-ledger `_executeTransfer`; **not** `nonReentrant` |
| `permit` | EIP-2612 on vault token | Asset-denominated allowances |
| `setExcludeFromYield` | User or owner | Ledger migration |

**Disabled ERC4626 paths:** `maxMint` / `maxRedeem` / `previewMint` / `previewRedeem` return 0.

---

## 7. Governance knobs

| Parameter | Role |
|-----------|------|
| `withdrawalFeeBps` / `affiliateFeeBps` / `maxOpenPositionsVolumeBps` | **Atomic** `setProtocolParameters` + solvency ratio check |
| `maxLeverageBps` | Cap `allocated / margin` at open |
| `liquidationThresholdBps` | Max loss before “limited”; liquidation band lower bound |
| `foundationFeeBps` / `protocolShareOfProfitBps` | Profit split on close |
| `keeperIncentiveRewardBps` / `maxKeeperIncentiveReward` | Keeper incentives (force-close + liquidate) |
| `setAdapterStatus` | Authorize adapter; force adapter onto fixed ledger |
| `setSanctionsList` | Optional Chainalysis-style screen |
| `lender` / `setLender` | Trusted flash gateway — sole caller of `internalFlashLoanToLender` |
| `lendingFeeBps` / `setLendingFeeBps` | Flash fee on gateway borrows (max 1%) |
| `lpFarming` / `lpFarmingFeeBps` | UV4 LP locker pointer + reserved reward fee bps (wired in farming module) |
| UUPS `upgradeTo` | `onlyOwner` |

---

## 7b. Flash lending (`internalFlashLoanToLender`)

Governance sets `lender` to the **`IrisFlashLender`** gateway (draft: `docs/drafts/IrisFlashLender.sol.wip`). The gateway implements public ERC-3156 and calls back into IXToken for liquidity.

| `token` | Mechanism | `totalAssets()` | Fee economics |
|---------|-----------|-----------------|---------------|
| `address(vault)` | Fixed-ledger mint to `lender`, burn `amount + fee` after callback | Unchanged (`T = I + D + S`) | Fee burn + unchanged `T` ⇒ rebasing NAV rises; `pnl += fee` |
| `asset()` (underlying) | Transfer idle `I` out, `transferFrom` `amount + fee` back | `I` ends `+fee` | Fee stays as idle cash; `pnl += fee` |

**Guards (2026-06 audit):** `onlyLender`, `nonReentrant`, `amount > 0`, ERC-3156 callback success token, post-callback balance checks.

**Integrator notes:**

- Underlying flash is capped by **idle cash** `I` — competes with `withdraw` / `openPosition` physical liquidity.
- Vault-token flash temporarily inflates `totalSupply` during callback; do not use mid-tx `totalSupply` as oracle input.
- `flashFee(token, amount)` reverts on unsupported `token`.

**Tests:** `test/IXTokenFlashLoanTest.t.sol` (17 cases: happy paths, fees, auth, callback, reentrancy, LP farming setters).

---

## 7c. LP Farming (locker — partial integration)

`IIrisLPFarming.lock(uv4TokenId, lockDuration)` — community UV4 LP NFT lockers; rewards scale with **time × lock duration**. IXToken stores `lpFarming` and `lpFarmingFeeBps` (default 5%) as governance knobs; **reward distribution is not invoked from `IXToken` yet** — implement in the farming contract + future vault hooks.

---

## 8. File map

| Path | Role |
|------|------|
| `src/IXToken.sol` | Main vault + positions + governance |
| `src/interfaces/IIXToken.sol` | External API |
| `src/interfaces/IIrisAdapter.sol` | Adapter surface (DEX-side) |
| `src/interfaces/IOwnable.sol` | Adapter owner check |
| `src/interfaces/ISanctionsList.sol` | Optional sanctions oracle |
| `src/interfaces/IIrisFlashLender.sol` | ERC-3156 gateway API (errors/events) |
| `src/interfaces/IIrisLPFarming.sol` | UV4 LP NFT lock surface |
| `docs/drafts/IrisFlashLender.sol.wip` | Gateway implementation (WIP — not compiled) |
| `test/IXTokenFlashLoanTest.t.sol` | Flash loan + LP farming governance tests |
| `src/proxy/IrisXProxy.sol` | ERC1967 proxy |
| `test/IXTokenAdvancedFuzzTest.t.sol` | Fuzz + invariant suite |
| `test/IXTokenPositionLifecycleTest.t.sol` | Position lifecycle integration |
| `test/IXTokenPermitAndWithdrawTest.t.sol` | Signed permits + fixed withdraw |
| `test/IXTokenGovernanceTest.t.sol` | Governance + UUPS |
| `test/IXTokenSecurityTest.t.sol` | Security / penetration |
| `test/helpers/*` | Shared deploy, harness, permit signing |
| `test/mocks/*` | Underlying, adapter, sanctions, reentrancy |
| `script/DeployIXTokenImpl.s.sol` | CREATE2 deploy IXToken implementation |
| `script/DeployIrisXProxy.s.sol` | CREATE2 deploy IrisXProxy + initialize |
| `script/helpers/Create2Script.sol` | Shared CREATE2 / salt-mining helpers |
| `.env.example` | Deployment env template |
| `docs/audit_reports/test-coverage.md` | Auditor test guide (scenarios + branch rationale) |
| `docs/audit_reports/report1.md` | Initial security audit |
| `docs/audit_reports/report2.md` | Re-audit after fixes |
| `docs/accounting_flow.txt` | Mermaid-style flow summary |

---

## 9. Tech stack & conventions

- **Solidity** `^0.8.26`, **Foundry** (`forge build`, `forge test`).
- **Build:** `via_ir = true`, `optimizer_runs = 10000` (required for custom errors + `require`).
- **Proxy:** `Initializable` + `UUPSUpgradeable` + `OwnableUpgradeable` + `EIP712Upgradeable`.
- **Reentrancy:** `ReentrancyGuardTransient` on heavy paths (requires Cancun / EIP-1153).
- **Coverage:** `forge coverage --ir-minimum` (disables production optimizer for instrumentation).

---

## 10. Test suite summary (release RC)

**103 tests** across 7 suites.

| Suite | Focus |
|-------|-------|
| Advanced fuzz + invariant | Accounting closure, share math, affiliate NAV, withdrawal bounds |
| Position lifecycle | All close/liquidate/force-close PnL branches + op-fee + keeper caps |
| Permit & withdraw | Signed vault/underlying EIP-2612, fixed-ledger withdraw, `protocolDebt` fee paths |
| Governance | Owner setters, adapter auth, UUPS, views |
| Security | Access control, sanctions, reentrancy probe, penetration edge cases |
| Flash loan | `internalFlashLoanToLender`, fees, auth, callback, reentrancy, LP farming setters |

**Coverage (`IXToken.sol`):** ~93% lines, ~90% statements, **~56% branches**, 100% functions.

**Why branch coverage is moderate:** unreachable defensive checks (`InsufficientPhysicalLiquidity`), dust/rounding frontiers, permit catch-all on non-permit tokens, trusted-adapter paths. Full matrix: **`docs/audit_reports/test-coverage.md`**.

---

## 11. Known issues / audit pointers

Read **`docs/audit_reports/report2.md`** for full detail.

| ID | Topic | Status |
|----|-------|--------|
| C-1 | `protocolDebt` phantom NAV | **By design** — see disposition doc |
| — | Foundation fee mint on profit close | Computed + minted to `foundation` (verify report2 closure) |
| — | Adapter-reported returns | No vault oracle — **trusted adapter** model |
| — | `transfer` reentrancy | Unguarded vs `deposit`/`withdraw` — documented threat |
| — | `IIXToken` interface drift | Verify param names vs impl before integration |
| H-1 | Flash loan missing `nonReentrant` | **Fixed** — `internalFlashLoanToLender` guarded |
| M-1 | ERC-3156 callback success not checked | **Fixed** — `ERC3156CallbackFailed` |
| M-2 | Wrong account in `ERC3156InsufficientBalance` (mint path) | **Fixed** |
| — | `lpFarming` / `lpFarmingFeeBps` unused in core | **Open** — storage only until farming module wired |
| — | `IrisFlashLender` gateway | **WIP** — syntax/logic incomplete; moved to `docs/drafts/` |
| L-1 | Underlying flash competes with withdraw liquidity | **By design** — cap at gateway / governance ops |
| L-2 | Vault-token flash fee accrues to rebasing NAV + `pnl`, not `totalSupply` | **By design** — see §7b |

When modifying accounting, always ask:

- Does `ΔT` match physical token `ΔI` + recoverable strategy?
- Does this path touch **fixed**, **rebasing**, or **both**?
- Does `assetsInStrategy` move in lockstep with underlying transfers?

---

## 12. Suggested agent / auditor workflow

1. Read invariant header in `IXToken.sol` and `_rebasingAssets` / `totalAssets`.
2. Read **`docs/audit_reports/test-coverage.md`** — scenario matrix + branch rationale.
3. Trace happy path: `deposit` → `openPosition` → `closePosition` (profit).
4. Trace loss paths: bad debt close, liquidate, force-close with keeper + `opFee`.
5. Run:
   ```bash
   forge build
   forge test
   forge coverage --ir-minimum --report summary
   ```
6. Check `docs/audit_reports/report2.md` and C-1 disposition before re-flagging findings.

---

## 13. Glossary

| Term | Meaning |
|------|---------|
| **IrisX / IXToken** | Rebasing vault token over underlying stable/asset |
| **Shares** | Internal rebasing units (`_shares`), not ERC20 share token |
| **Fixed ledger** | 1:1 internal balance for DEX-compatible addresses |
| **Adapter** | Authorized contract bridging vault ↔ DEX |
| **Margin** | Trader collateral for loss absorption |
| **Allocated** | Vault principal sent to adapter for trade |
| **protocolDebt** | Booked unpaid affiliate obligation inside `T` |
| **assetsInStrategy** | Sum of margin+allocation booked as deployed |
| **opFee** | Protocol fee **inside** adapter gross return; accrues to holders via `pnl` |
| **lender** | Trusted `IrisFlashLender` gateway; only flash caller on IXToken |
| **Flash mint** | Uncollateralized fixed-ledger mint/burn for gateway routing (not public ERC-3156 on IXToken) |
| **lpFarming** | UV4 LP NFT locker; rewards by lock duration (integration pending) |

---

## 14. Release checklist (maintainers)

- [ ] `forge test` green on release commit
- [ ] `forge coverage --ir-minimum` — IXToken.sol lines ≥ 85%
- [ ] Proxy `IrisXProxy` deployed with `receive()` fallback (solc 3628)
- [ ] Adapter `approveVaultMax()` before `setAdapterStatus`
- [ ] Governance parameters pass `_validateSolvencyRatio`
- [ ] Auditor pack: report1, report2, C-1 disposition, **test-coverage.md**, this file
```

and hare is the AI Context for Adapters
# Iris Leveraged Spot V1 Adapter — AI Context

> **Purpose:** Onboard agents and developers to the **generic swap-engine** Iris adapter (`IrisLeveragedSpotV1Adapter` / `IIrisLeveragedSpotV1Adapter`) — how it sits on `IXToken`, what it executes, and naming conventions.  
> **Repo:** `iris-uv4-adapter` (historical repo name; implementation is DEX-agnostic). Foundry / Solidity 0.8.26.  
> **Vault reference:** `lib/iris-core/docs/aic/AI_Context.md` (IrisX / `IXToken` accounting and lifecycle).

---

## 1. What this project is

**Iris Leveraged Spot V1** is the **v1 execution adapter** for Iris Lab’s margin stack. It implements the vault-facing **`IIrisAdapter`** pattern (see `lib/iris-core`) for **leveraged long spot** exposure:

- Traders open **long** positions by posting **margin** + **allocated** principal (vault underlying units).
- The adapter swaps underlying → **target token** through an external **executor** (any router/aggregator; calldata supplied off-chain).
- On **close** or **liquidation**, the adapter swaps target → underlying and reports **gross** recovery to **`IXToken`** (`protocol`).

**Sibling repo:** `iris-core` owns **`IXToken`** (IrisX vault), position registry, PnL branches, and adapter authorization. **This repo** owns swap execution, slippage/oracle checks, and adapter-local position state.

**Not Uniswap-specific:** Earlier designs targeted Uniswap v4 hooks; **v1 is a generic swap engine** — approvals + `executor.call(data)` + Chainlink cross-price guards. `lib/v4-core` may remain vendored for future work but is **not** on the current execution path.

---

## 2. High-level architecture

```
                    ┌─────────────────────────────────────┐
                    │           IXToken (vault)           │
                    │  openPosition / close / liquidate   │
                    │  (bytes32 positionId, gross, opFee) │
                    └──────────────┬──────────────────────┘
                                   │ onlyAuthorizedAdapter
                    ┌──────────────▼──────────────────────┐
                    │    IrisLeveragedSpotV1Adapter       │
                    │  • Local Position + PositionId      │
                    │  • Chainlink cross-price slippage   │
                    │  • Executor.call(swap calldata)     │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────▼─────────┐   ┌──────────▼──────────┐   ┌─────────▼─────────┐
│  Trader (margin)  │   │ Swap executor       │   │ Keeper + NFT      │
│  open / close     │   │ (1inch / 0x / …)    │   │ liquidate         │
└───────────────────┘   └─────────────────────┘   └───────────────────┘
```

**Trust model:** The vault **trusts this adapter** for `totalReturnAssets` on close/liquidate (same as other adapters — see iris-core audit notes). The adapter **does not** re-validate vault PnL; it enforces **local** swap slippage vs Chainlink **cross prices** (target/USD and underlying/USD).

**Swap `executor` (by design):** Routes and calldata are built **off-chain** (1inch, 0x, etc.). The adapter does **not** maintain an on-chain router allowlist. Safety is enforced by **exact approval amounts**, **balance deltas** on open/exit, and **slippage floors** — not by whitelisting `executor` addresses.

---

## 3. Naming (V1)

| Symbol | Role |
|--------|------|
| `IIrisLeveragedSpotV1Adapter` | External API, events, and custom errors |
| `IrisLeveragedSpotV1Adapter` | Ownable implementation |
| `PositionId` | UDVT `bytes32` position key (unwrap for vault calls) |

Version suffix **`V1`** leaves room for alternate engines (e.g. pool-native v2) without breaking integrators.

---

## 4. Core concepts

| Concept | Meaning |
|--------|---------|
| **protocol** | `IIXToken` vault; escrows margin, books `assetsInStrategy`, settles close/liquidate |
| **underlying** | Vault asset (`protocol.asset()`); swapped on open/close |
| **target token** | Long exposure token (e.g. WETH); must not equal underlying |
| **marginAmount** | Trader collateral (loss absorption) |
| **allocatedAmount** | Vault principal deployed for the trade |
| **PositionId** | UDVT `bytes32`; `keccak256(adapter, trader, nonce)` |
| **executor** | Off-chain-selected swap router; receives capped approvals + `call(data)` (not on-chain allowlisted) |
| **opFee** | Operator/funding fee passed to vault on settle (`fundingFeeBps` at open today) |
| **Premium keeper** | Holds `keeperNFT`; stricter liquidation threshold and shorter max duration for others |

**Direction:** Only **`Direction.LONG`** is supported; `SHORT` reverts with `DirectionNotSupported`.

---

## 5. Position lifecycle (adapter-local)

### Open (`openPosition`)

1. Validate token config, leverage/volume/funding caps (`PositionConfig` per token).
2. `protocol.openPosition(positionId, trader, margin, allocated)` — vault pulls margin and sends underlying.
3. Approve **executor**, run swap underlying → target; verify balances moved.
4. **Cross-price** expected target amount from Chainlink feeds; revert if below slippage floor (`OpenSlippageExceeded`).
5. Store `Position` (including `tokenAmount` received) and emit `PositionOpened`.

### Close (`closePosition`) — trader or authorized close operator

1. Caller is `pos.trader` or `isAuthorizedCloseOperator[trader][caller]` — **account-wide** approval (`authorizeCloseOperator`; any open position for that trader, not per `positionId`).
2. Swap `executor` is the **DEX router** (not the close operator); route is off-chain — on-chain checks are balances + slippage only.
3. Vault **`closePosition`** — profit, loss, or flat.
4. Emit `PositionClosed`.

### Force-close on expiry (`closeExpiredPosition`) — anyone (keeper)

1. Adapter: `block.timestamp >= maxPositionDuration + openTime` (non-premium: `+nonPremiumExpiryExtensionSeconds`).
2. Same exit swap + slippage as trader close.
3. Vault **`forceClosePosition(positionId, grossReturn, opFee, keeper)`** — `keeper = msg.sender`.
4. Keeper reward (core): `keeperAsset = min(margin × keeperIncentiveRewardBps, maxKeeperIncentiveReward, gross)` paid as **rebasing vault shares** (`_mint`); settlement runs on `gross - keeperAsset` via shared `_closePosition`.
5. Emit `PositionExpiredClosed` (vault emits `PositionForceClosed`).

### Liquidate (`liquidatePosition`) — underwater (expired allowed)

1. `_checkLiquidation` — vault-aligned loss on **pre-swap MTM**: `loss >= margin × thresholdBps` (non-premium: higher bps).
2. Exit swap; slippage floor vs pre-swap MTM (`LiquidationSlippageExceeded`) — **accepted game**; vault loss band re-checked on **post-swap** `grossReturn`.
3. Vault **`liquidatePosition`** — keeper share = **net recovery × bps** (rebasing shares).
4. Emit `PositionLiquidated`.

**Expired + underwater (by design):** Keepers may use **`closeExpiredPosition`** (margin-based incentive) or **`liquidatePosition`** (net-recovery incentive). Both are valid; economics differ.

### Views

- `checkExpiredCloseEligibility(initiator, positionId)` — adapter time gate for `closeExpiredPosition`.
- `checkLiquidationEligibility(keeper, positionId)` — underwater MTM; may be true when expired (liquidation still allowed).
- `positions(positionId)` — public mapping getter.

### Keeper incentives (iris-core)

| Path | Adapter fn | Vault fn | Keeper sizing |
|------|------------|----------|----------------|
| Trader close | `closePosition` | `closePosition` | None |
| Expired | `closeExpiredPosition` | `forceClosePosition` | `margin × bps` (capped) |
| Underwater (incl. expired) | `liquidatePosition` | `liquidatePosition` | `netReturn × bps` (capped) |

Expiry rules live in adapter `PositionConfig.maxPositionDurationSeconds`; core does not enforce expiry on `forceClosePosition`. After expiry, underwater positions may use **either** keeper path (see above).

---

## 6. Oracle and slippage math

Per-token **`PositionConfig.chainlinkPriceFeed`** plus immutable **`underlyingChainlinkFeed`**.

**Underlying asset:** Vault underlying is a **stablecoin (USDT or USDC)**. Open and exit use `_getSafePrice` on the target feed; underlying USD leg uses the immutable feed with `MAX_ORACLE_DELAY` on open and exit. Stablecoin oracle risk is accepted for deployment (no separate staleness finding on underlying).

**Open (underlying → target):**

```
expectedToken = (baseAmount * priceUnderlying * 10^decTargetFeed * 10^tokenDec)
              / (priceTarget * 10^decUnderlyingFeed * 10^baseDec)
```

**Close / liquidation (target → underlying):** same pattern with `tokensSold` / `currentTokenAmount`.

Slippage tolerance: `defaultSlippageBps` (1%) if caller passes `0`; hard cap `maxSlippageBps` (3%). Caller cap violations use `MaxSlippageExceeded`.

---

## 7. Configuration (`PositionConfig`)

| Field | Role |
|-------|------|
| `maxLeverageBps` | Cap `allocated / margin` (0 = skip check) |
| `minPositionVolume` / `maxPositionVolume` | Notional bounds on `margin + allocated` |
| `maxPositionDurationSeconds` | Force-close eligible after open time + duration (liquidation not blocked by expiry) |
| `fundingFeeBps` | Reserved operator fee; capped by `margin` at open |
| `chainlinkPriceFeed` | Target token USD feed |

Owner sets configs via `setPositionConfig`.

---

## 8. File map

| Path | Role |
|------|------|
| `src/IrisLeveragedSpotV1Adapter.sol` | V1 adapter implementation |
| `src/interfaces/IIrisLeveragedSpotV1Adapter.sol` | External API, events, errors |
| `src/interfaces/IChainlinkDataFeed.sol` | Chainlink-style price feed |
| `src/types/Position.sol` | Adapter position struct |
| `src/types/PositionId.sol` | `type PositionId is bytes32` |
| `src/types/PositionConfig.sol` | Per-token limits and feed |
| `src/types/Direction.sol` | `LONG` / `SHORT` (short disabled) |
| `lib/iris-core/` | `IXToken`, `IIXToken`, `IIrisAdapter` |
| `lib/v4-core/` | Optional dependency (not used by v1 swap path) |
| `remappings.txt` | `@openzeppelin`, `iris-core/`, `v4-core/` |

---

## 9. Tech stack

- **Solidity** `^0.8.26`, **Foundry**, **Cancun** EVM (`foundry.toml`).
- **OpenZeppelin:** `Ownable`, `ReentrancyGuard`, ERC20 metadata.
- **Remappings:** Root `remappings.txt` + iris-core paths for vault imports.

---

## 10. Integration checklist

1. Vault owner **`setAdapterStatus(adapter, true)`** and matching **`Ownable` owner**.
2. Deploy `IrisLeveragedSpotV1Adapter` with `protocol`, `initialOwner`, `underlyingChainlinkFeed`, `keeperNFT`.
3. **`setPositionConfig`** per tradable token (feed + risk limits).
4. Traders **`approve`** vault token for **margin** before `openPosition`.
5. Off-chain service builds **executor + calldata** for open/close/liquidate swaps (any compatible engine).
6. Use **`PositionId.wrap` / `unwrap`** at the vault boundary (`bytes32` in `IIXToken`).

---

## 11. Known gaps / TODOs (code)

- **`opFee` on close:** Still `0`; duration/activity fee not implemented.
- **`SHORT`:** Unsupported (`DirectionNotSupported`).
- **Vault alignment:** Read iris-core **`AI_Context.md`** for `closePosition` PnL branches, `foundationShare`, and adapter-trust assumptions.
- **Tests:** Add Foundry tests for open/close slippage, liquidation bands, and premium keeper rules.

---

## 12. Security & trust model (audit sync 2026-05-24)

Full reports: [`audit_report_adapter_3.md`](audit_reports/audit_report_adapter_3.md) (current), [`audit_report_adapter_1.md`](audit_reports/audit_report_adapter_1.md) (historical).

**Trusted / permissioned assumptions**

- Governance authorizes this adapter on `IXToken` (`setAdapterStatus`) with matching `Ownable` owner.
- **Swap `executor` + calldata are caller-supplied by design** — route is computed off-chain; on-chain safety = capped approvals, balance checks, slippage floors (**not** an on-chain router registry). Do not re-flag as a defect.
- Vault trusts **adapter-reported `grossReturn` and `opFee`** on close/liquidate (same as iris-core report2 H-3).
- Target-token Chainlink feeds use **`_getSafePrice`** (staleness / round checks). Underlying is **USDT/USDC**; same helper on open/exit — stablecoin oracle risk accepted.

**Auditor disposition (v3 findings — do not re-open)**

| ID | Topic | Status |
|----|--------|--------|
| C-01 | Removed dead `PositionExpiredUseForceClose`; docs match code | **Fixed** |
| C-02 | Expired + underwater: dual keeper paths | **By design** |
| C-03 | Permissionless `executor` | **By design** (off-chain route + on-chain swap validation) |
| C-04 | Underlying oracle on open | **N/A** (stablecoin + `_getSafePrice`) |
| C-05 | Liquidation slippage uses pre-swap MTM | **Accepted game** |

**State tracking drifts**

| Topic | Adapter | Vault (`IXToken`) |
|--------|---------|-------------------|
| Position registry | `positions[PositionId]` until close/liquidate | `positions[bytes32]` deleted on settle |
| Expired exit | `closeExpiredPosition` → `forceClosePosition` | Keeper: margin × incentive bps (shares) |
| Liquidation rule | `_meetsVaultLiquidationLossThreshold`; non-premium +bps until max duration | Loss ≥ `margin × liquidationThresholdBps` |
| Token inventory | Commingled ERC-20 balances per token | Books `assetsInStrategy`, not per-token balances |
| `protocolDebt` | Not referenced | Reduces physical deploy cap on open |

**Invariants operators should still enforce**

- Only **standard ERC-20** underlyings/targets (no hooks); vault `transfer` is not `nonReentrant`.
- Off-chain swap routing only; on-chain validation is balances + slippage (see §2).
- Per-token `maxOracleDelaySeconds` + monitored feeds; underlying stablecoin feed at deploy.
- Liquidation bots should use `checkLiquidationEligibility` knowing vault uses **`loss >= margin × liquidationThresholdBps`** (see `_meetsVaultLiquidationLossThreshold`).

**`protocolDebt`:** Adapter opens still respect vault `totalAssets() - protocolDebt` volume caps; phantom `D` cannot be swapped by the adapter but inflates rebasing NAV — see iris-core C-1 disposition.

---

## 13. Suggested agent workflow

1. Read `lib/iris-core/docs/aic/AI_Context.md` §5 (vault position lifecycle).
2. Read `IIrisLeveragedSpotV1Adapter.sol` for the canonical API and error names.
3. Trace `openPosition` → vault call → swap → slippage check in `IrisLeveragedSpotV1Adapter.sol`.
4. Trace `closePosition` / `liquidatePosition` settlement and `PositionId.unwrap` at `protocol.*` calls.
5. Run `forge build` after edits; keep NatSpec in English in `src/`.

---

## 14. Glossary

| Term | Meaning |
|------|---------|
| **IrisX / IXToken** | Rebasing vault token over underlying |
| **Leveraged spot v1** | Long spot via swap engine + vault leverage booking |
| **Adapter** | `IrisLeveragedSpotV1Adapter`; authorized by vault |
| **Gross return** | Underlying received from exit swap before vault fee logic |
| **Cross-price** | Target and underlying both in USD via separate Chainlink feeds |
| **Executor** | Off-chain-routed swap contract; `call(data)` with on-chain amount/slippage checks |
```
We'll implement a FlashLoan Logic too. With A simple context based on IERC3156 for DAI and USDC.

Our Roudmap is 
1. Deploy The Platfrom with first adapter for Leveraged Spot Trading on ETH.
2. Deploy The MirorStation On ArbitrumOne for leveraging the Speed and gas efficenty to the Leveraged Spot Trading.
3. Implement More Modules to grow the Economic and allow to gain more profit for the protocol like Collectral Lending. etc.

Our Vision is to get big as USDT on Stable Enviroment, Fully Decentrilized and Same as AVVE for fund managment

Here is IrisCore IXToken Code.
```sol
// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 IrisLab, Inc.
//
// This file is part of the IrisLab protocol. It is licensed under the MIT license above.
// Dependencies (e.g. OpenZeppelin) remain under their respective licenses.
//
pragma solidity ^0.8.26;

/**
 * @title IXToken
 * @notice IrisX dual-ledger vault token (rebasing shares + fixed 1:1 balances) with margin execution via trusted adapters.
 * @dev Flash liquidity: governance sets {lender} (`IrisFlashLender`) as the only caller of {internalFlashLoanToLender},
 *      which may flash-mint vault tokens or transfer idle underlying to the gateway for external ERC-3156 routing.
 *
 *      Global accounting invariants:
 *      1. `T = totalAssets() = I + D + S` (idle cash, protocolDebt, assetsInStrategy).
 *      2. `totalSupply() = convertToAssets(_totalShares) + _totalFixedBalances` — do not add `S` again.
 *      3. Strategy deploy: `ΔI = -b`, `ΔS = +b` ⇒ `ΔT = 0` at `openPosition`.
 *      4. Optimistic affiliate debt (`D`, disposition C-1): amortized via withdraw fees; deploy caps use `T - D`.
 *      See `docs/audit_reports/dispositions/C-1-protocol-debt-phantom-nav.md`.
 * @custom:no-oz-erc20-update Intentionally no OZ ERC20 `_update` hook — asset vs share units and dual-ledger rounding.
 */

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISanctionsList} from "./interfaces/ISanctionsList.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IERC3156FlashBorrower} from "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import {IIrisLPFarming} from "./interfaces/IIrisLPFarming.sol";
import {IIrisAdapter} from "./interfaces/IIrisAdapter.sol";
import {IIXToken} from "./interfaces/IIXToken.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Position} from "./types/Position.sol";

contract IXToken is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardTransient,
    EIP712Upgradeable,
    UUPSUpgradeable,
    IIXToken
{
    using Math for uint256;
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    /// @dev Rebasing ledger: per-account shares; value via `convertToAssets`.
    mapping(address => uint256) private _shares;
    /// @dev Outstanding rebasing shares (virtual-liquidity terms in `_convertToShares`).
    uint256 private _totalShares;

    /// @dev Fixed ledger: 1:1 asset balances (DEX-safe, non-rebasing).
    mapping(address => uint256) private _fixedBalances;
    /// @dev Sum of fixed liabilities reserved before rebasing pool sizing.
    uint256 private _totalFixedBalances;

    /**
     * @notice Accounting mode for `account`.
     * @dev If true: fixed ledger (`_fixedBalances`), no yield accrual on displayed balance.
     *      If false: rebasing ledger (`_shares`), yield via `_rebasingAssets()`.
     */
    mapping(address => bool) public isExcludedFromYield;

    /// @dev ERC20 allowances in **asset units** (same denomination as `transfer` / `withdraw` allowance checks).
    mapping(address => mapping(address => uint256)) private _allowances;

    /// @dev Underlying ERC20 (set once in `initialize`).
    IERC20 private _underlying;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    /**
     * @dev Virtual-share offset exponent for ERC4626 inflation defense (see `_convertToShares`).
     *      Larger offset ⇒ stronger dilution resistance at the cost of slightly coarser rounding for tiny deposits.
     */
    uint8 private __decimalsOffset;

    /**
     * @notice Unamortized affiliate commission booked in `totalAssets()` (virtual / optimistic CAC).
     * @dev AUDIT DISPOSITION C-1 — Acknowledged / By Design (Optimistic Accounting).
     * On `depositWithAffiliate`, increases by `affiliateAssetAmount` while full deposit tokens sit in idle `I`.
     * Increases rebasing NAV (`_rebasingAssets`) before economic repayment; repaid via `withdraw` fee amortization
     * (`protocolDebt -= fee`). Parameter solvency: `_validateSolvencyRatio` in `setProtocolParameters`.
     * Physical ops exclude `D`: `openPosition` uses `totalAssets() - protocolDebt` for deploy caps.
     * Full auditor brief: docs/audit_reports/dispositions/C-1-protocol-debt-phantom-nav.md
     */
    uint256 public protocolDebt;
    /// @dev Receives foundation fees.
    address public foundation;

    /// @notice Trusted flash-lending gateway (`IrisFlashLender`) — sole caller of {internalFlashLoanToLender}.
    address public lender;

    /// @notice Flash-loan fee charged to {lender} on {internalFlashLoanToLender} (basis points).
    uint256 public lendingFeeBps;

    /// @dev Basis-point scale for fee fields (10_000 = 100%).
    uint256 public constant BPS_DENOMINATOR = 10000;
    /// @dev Max share of `totalAssets()` that may sit in `assetsInStrategy` (5000 = 50%).
    uint256 public constant MAX_STRATEGY_BPS = 5000; // 50%
    /// @dev Upper bound for `withdrawalFeeBps` and related fee setters (500 = 5%).
    uint256 public constant MAX_WITHDRAWAL_FEE_BPS = 500; // 5%
    uint256 public constant MAX_FOUNDATION_FEE_BPS = 500; // 5%

    uint256 public constant MAX_PROTOCOL_SHARE_OF_PROFIT_BPS = 5000; // 50%
    uint256 public constant MIN_PROTOCOL_SHARE_OF_PROFIT_BPS = 1000; // 10%

    /// @dev Max share of physical book deployable in strategy (5000 = 50%).
    uint256 public constant MAX_OPEN_POSITIONS_VOLUME_BPS = 5000;

    uint256 public constant MAX_LEVERAGE_BPS = 10 * BPS_DENOMINATOR; // 10x
    uint256 public constant MIN_LIQUIDATION_THRESHOLD_BPS = 5000; // 50% loss of the collateral
    uint256 public constant MAX_KEEPER_INCENTIVE_REWARD_NO_DECIMALS = 500; // 500 * 10^DECIMALS
    uint256 public constant MAX_KEEPER_INCENTIVE_REWARD_BPS = 1000; // 10%
    uint256 public constant MAX_LENDING_FEE_BPS = 100; // 1%
    uint256 public constant MAX_LP_FARMING_FEE_BPS = 1000; // 10%

    uint256 public withdrawalFeeBps;
    uint256 public affiliateFeeBps;
    uint256 public foundationFeeBps;
    /// @notice Reserved fee share (bps) for LP farming rewards; consumed by the farming module when wired.
    uint256 public lpFarmingFeeBps;
    uint256 public protocolShareOfProfitBps;
    uint256 public maxLeverageBps;
    uint256 public maxOpenPositionsVolumeBps;
    uint256 public maxKeeperIncentiveReward;
    /**
     * @notice Keeper incentive rate (bps) shared by {forceClosePosition} and {liquidatePosition}.
     * @dev **Intentionally different effective sizing by path (by design, not a bug):**
     *      - {forceClosePosition}: `min(marginAmount × bps, maxKeeperIncentiveReward, gross)` — administrative /
     *        expiry-style closes; capped relative to **margin** so incentives stay modest.
     *      - {liquidatePosition}: `min(netRecovery × bps, maxKeeperIncentiveReward)` on **net** recovery after `opFee` —
     *        scales with rescued cash on underwater positions so keepers remain motivated to execute liquidations
     *        even when recovery is large relative to margin.
     *      Governance may tune `bps` / `maxKeeperIncentiveReward` to widen the liquidation premium further.
     */
    uint256 public keeperIncentiveRewardBps;
    uint256 public liquidationThresholdBps;

    /// @notice Booked underlying deployed in open positions (`margin + allocation` per position).
    uint256 public assetsInStrategy;

    /// @notice Minimum `marginAmount + allocatedAmount` for `openPosition`.
    uint256 public minimumPositionVolume;

    /// @notice Governance-authorized execution adapters.
    address[] public authorizedAdaptersList;
    mapping(address => bool) public isAuthorizedApproved;
    address public latestAdapter;

    mapping(address => uint256) public nonces;
    /// @dev EIP-2612 `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)`.
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    ISanctionsList public sanctionsList;
    mapping(bytes32 => Position) public positions;

    /// @notice Minimum gross amount for `deposit` / `depositWithAffiliate`.
    /// @dev Blocks zero-share mints; bounds dust from floor/ceil rounding (see `_executeTransfer`, `withdraw`).
    uint256 public minimumDepositAssetAmount;

    /**
     * @notice Cumulative vault PnL ledger in underlying asset units (signed analytics accumulator).
     * @dev NOT a substitute for `totalAssets()` or idle cash — updated only on selected `closePosition` /
     *      `liquidatePosition` and `withdraw` branches. Sign convention: **positive** = protocol-favorable accrual (protocol share
     *      of trade profit, close/liquidation penalties); **negative** = allocation shortfall / socialized bad debt.
     *
     * Branch coverage:
     * - Profitable close: `+protocolShare` only (`foundationShare` / `lpFarmingShare` minted as vault shares, not counted here).
     * - Close, hard bad debt (`totalReturn < allocated`): `- (allocated - totalReturn)`.
     * - Close, over-threshold loss with penalty: `+penalty`.
     * - Limited close loss (`loss <= margin * liquidationThreshold`): **no update** (shortfall taken from trader margin escrow).
     * - Liquidation, bad debt: `- (loss + keeperShare - margin)`.
     * - Liquidation, limited loss: `+penalty` (keeper incentive is minted as vault shares; economic cost via margin waterfall / bad-debt branch).
     * - Force close (`forceClosePosition`): **no direct `pnl` keeper line** — keeper slice is deducted from gross before `_closePosition` settlement.
     * - Close / liquidate / force close: `+opFee` when retained from pulled `totalReturnAssets` (rebasing holder accrual).
     * - Withdrawal: `+ (withdrawalFee - protocolDebt)` (protocol share of withdrawal fee retained in vault cash).
     *
     * Excluded by design: withdrawal fees, affiliate `protocolDebt` amortization, rebasing yield, rounding dust.
     */
    int256 public pnl;

    /**
     * @notice Iris LP Farming locker (community UV4 LP NFT locks; rewards by time × lock duration).
     * @dev On profitable {closePosition} / {forceClosePosition}, `lpFarmingFeeBps` of gross trade profit is
     *      minted as vault tokens to this contract (fixed ledger via {setLpFarming}). Distribution to lockers
     *      happens in the locker contract. If unset (`address(0)`), the LP slice is added to {foundationShare}.
     */
    IIrisLPFarming public lpFarming;

    uint256[50] private __gap;

    /**
     * @notice Implementation constructor — disables initializers on the logic contract.
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice One-time initializer (delegatecalled through an ERC1967 proxy).
     * @param asset_ Underlying ERC20 (metadata drives `name` / `symbol` / `decimals` of this token).
     * @param foundation_ Receiver of foundation fees (must not be zero).
     * @param initialOwner Ownable owner.
     */
    function initialize(IERC20Metadata asset_, address foundation_, address initialOwner) external initializer {
        if (initialOwner == address(0)) revert InvalidAddress();
        if (address(asset_) == address(0)) revert InvalidAsset();
        if (foundation_ == address(0)) revert InvalidAddress();
        
        __Ownable_init(initialOwner);
        _name = "Iris USD";
        _symbol = "USDI";
        __EIP712_init(_name, "1");


        _underlying = IERC20(address(asset_));
        foundation = foundation_;
        _decimals = asset_.decimals();
        __decimalsOffset = 0;
        withdrawalFeeBps = 50;
        affiliateFeeBps = 10;
        foundationFeeBps = 500; // 5%
        lpFarmingFeeBps = 500; // 5%
        protocolShareOfProfitBps = 2000; // 20%
        maxLeverageBps = 5 * BPS_DENOMINATOR; // 5x
        maxOpenPositionsVolumeBps = 5000; // 50%
        liquidationThresholdBps = 7500; // 75% loss of the collateral
        minimumDepositAssetAmount = 1 * 10 ** (_decimals - 4); // 0.0001 * 10^DECIMALS
        maxKeeperIncentiveReward = 500 * 10 ** _decimals; // 500 * 10^DECIMALS
        keeperIncentiveRewardBps = 1000; // 10%
        minimumPositionVolume = 1 * 10 ** _decimals;
        lendingFeeBps = 0;

        _setExcludeFromYield(address(this), true);
    }

    /**
     * @notice Updates the foundation fee recipient for profitable position closes.
     * @param newFoundation New foundation address.
     */
    function setFoundation(address newFoundation) external onlyOwner {
        foundation = newFoundation;
        emit FoundationSet(newFoundation);
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(
        address /* newImplementation */
    )
        internal
        override
        onlyOwner
    {}

    /// @inheritdoc IERC20Metadata
    function name() public view override returns (string memory) {
        return _name;
    }

    /// @inheritdoc IERC20Metadata
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /// @inheritdoc IERC20Metadata
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Returns the total asset-denominated liabilities of the system (Total Value Controlled).
     * @dev Calculates gross claims by converting all circulating shares to assets and adding fixed balances.
     * Integrators: do not add `assetsInStrategy` again — `convertToAssets` already includes `S` via `totalAssets()`.
     *
     * @return assets Total gross asset claims of the vault (shares + fixed).
     */
    function totalSupply() public view override returns (uint256 assets) {
        return convertToAssets(_totalShares) + _totalFixedBalances;
    }

    /**
     * @notice Spendable / wallet-display balance in **underlying asset units**.
     * @dev Rebasing: `Floor` conversion `_convertToAssets(_shares, Floor)` — conservative for the protocol (see rounding notes).
     *      Fixed: exact `_fixedBalances` (1:1).
     * @param account Holder to query.
     * @return assets Balance in asset wei.
     */
    function balanceOf(address account) public view override returns (uint256 assets) {
        if (isExcludedFromYield[account]) return _fixedBalances[account];
        return convertToAssets(_shares[account]);
    }

    /// @notice ERC20 allowance in **asset units** (matches `transferFrom` and `withdraw` allowance semantics).
    function allowance(address owner, address spender) public view returns (uint256 assets) {
        return _allowances[owner][spender];
    }

    /// @inheritdoc IERC20
    /// @dev Requires zeroing allowance before a non-zero change (EIP-20 race mitigation).
    function approve(address spender, uint256 value) public override returns (bool) {
        require(!((value != 0) && (_allowances[msg.sender][spender] != 0)));
        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /// @notice Increases asset-denominated allowance for `spender`.
    /// @param spender Spender address.
    /// @param addedValue Allowance increment in asset units.
    /// @return True on success.
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = msg.sender;
        uint256 currentAllowance = allowance(owner, spender);
        _approve(owner, spender, currentAllowance + addedValue);
        return true;
    }

    /// @notice Decreases asset-denominated allowance for `spender`.
    /// @param spender Spender address.
    /// @param subtractedValue Allowance decrement in asset units.
    /// @return True on success.
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = msg.sender;
        uint256 currentAllowance = allowance(owner, spender);

        if (currentAllowance < subtractedValue) {
            revert ERC20InsufficientAllowance(spender, currentAllowance, subtractedValue);
        }

        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /// @inheritdoc IERC20
    /// @dev `value` is an asset amount; rebasing legs use Ceil burn / conserved share moves (see `_executeTransfer`).
    function transfer(address to, uint256 value) public returns (bool) {
        _executeTransfer(msg.sender, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        _spendAllowance(from, msg.sender, value);
        _executeTransfer(from, to, value);
        return true;
    }

    /// @notice EIP-712 domain separator for vault-token `permit`.
    /// @dev Delegates to {EIP712Upgradeable} so `chainId` tracks `block.chainid` (fork migrations).
    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice EIP-2612 permit for vault-token allowances (`spender` may move up to `value` assets on behalf of `owner`).
     * @dev Approvals are **asset-denominated**, consistent with `approve` / `transferFrom` / `withdraw` allowance checks.
     */
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        public
        virtual
    {
        // forge-lint: disable-next-line(block-timestamp)
        require(deadline >= block.timestamp, ERC20Expired(deadline));
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);
        address recoveredAddress = ecrecover(hash, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, ERC20InvalidSignature());
        _approve(owner, spender, value);
    }

    /// @dev Writes asset-denominated allowance and emits {Approval}.
    function _approve(address owner, address spender, uint256 value) internal virtual {
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    /**
     * @dev Dual-ledger transfer in asset units. Rebasing: Ceil burn / conserved share credit; fixed: exact 1:1.
     *      Fixed→rebasing uses Floor share mint (`ZeroSharesMinted` if zero). Dust stays in vault (solvency-favorable).
     * @param from Sender account.
     * @param to Recipient account.
     * @param assets Amount in underlying asset wei.
     */
    function _executeTransfer(address from, address to, uint256 assets) internal virtual {
        if (from == address(0) || to == address(0)) revert InvalidAccountAddress();
        _checkSanctions(from);
        _checkSanctions(to);

        uint256 sharesToDebit;
        uint256 sharesToCredit;
        if (isExcludedFromYield[from]) {
            uint256 fromBalance = _fixedBalances[from];
            if (fromBalance < assets) revert ERC20InsufficientBalance(from, fromBalance, assets);
            if (fromBalance - assets <= 1) {
                assets = fromBalance;
            }

            _fixedBalances[from] -= assets;
            _totalFixedBalances -= assets;
            if (!isExcludedFromYield[to]) {
                sharesToCredit = _convertToShares(assets, Math.Rounding.Floor);
                if (assets > 0 && sharesToCredit == 0) revert ZeroSharesMinted();
            }
        } else {
            sharesToDebit = _convertToShares(assets, Math.Rounding.Ceil);
            uint256 fromShares = _shares[from];
            if (fromShares < sharesToDebit) {
                if (sharesToDebit - fromShares <= 1) {
                    sharesToDebit = fromShares;
                } else {
                    revert ERC20InsufficientBalance(from, fromShares, sharesToDebit);
                }
            }

            _shares[from] -= sharesToDebit;
            _totalShares -= sharesToDebit;
            sharesToCredit = sharesToDebit;
        }
        if (isExcludedFromYield[to]) {
            _fixedBalances[to] += assets;
            _totalFixedBalances += assets;
        } else {
            _shares[to] += sharesToCredit;
            _totalShares += sharesToCredit;
        }
        emit Transfer(from, to, assets);
    }

    /// @dev Decrements allowance unless unlimited (`type(uint256).max`).
    /// @param owner Allowance owner.
    /// @param spender Spender debiting allowance.
    /// @param assets Asset amount to consume.
    function _spendAllowance(address owner, address spender, uint256 assets) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= assets, ERC20InsufficientAllowance(spender, currentAllowance, assets));
            unchecked {
                _allowances[owner][spender] = currentAllowance - assets;
            }
        }
    }

    /**
     * @dev Withdrawal fee: proportional to `assets` at `withdrawalFeeBps`. If bps rounds down to 0, returns **1 wei**
     *      so zero-fee exits cannot grief rounding or bypass minimal protocol compensation on dust withdrawals.
     * @param assets Fee base in asset units.
     * @return fee Fee in asset units (minimum 1 wei).
     */
    function _calculateFee(uint256 assets) internal view returns (uint256) {
        uint256 computed = assets.mulDiv(withdrawalFeeBps, BPS_DENOMINATOR);
        return computed < 1 ? 1 : computed;
    }

    /// @dev Exposes `__decimalsOffset` for inheritors / testing without storing redundant constants in ABI.
    function _decimalsOffset() internal view virtual returns (uint8) {
        return __decimalsOffset;
    }

    /**
     * @dev Internal mint hook used when ERC4626 `deposit` logic is split across paths (e.g. affiliate).
     * @param to Recipient (fixed or rebasing).
     * @param assets Nominal asset amount for ERC20 `Transfer` events and fixed ledger credits.
     * @param shares Rebasing share increment when `to` is not excluded from yield (ignored for fixed recipients).
     */
    function _mint(address to, uint256 assets, uint256 shares) internal virtual {
        if (to == address(0)) revert InvalidAccountAddress();

        if (isExcludedFromYield[to]) {
            _fixedBalances[to] += assets;
            _totalFixedBalances += assets;
        } else {
            _shares[to] += shares;
            _totalShares += shares;
        }
        emit Transfer(address(0), to, assets);
    }

    /**
     * @notice Internal burn hook used for flash mint and flash loan.
     * @param from Sender account.
     * @param assets Nominal asset amount for ERC20 `Transfer` events and fixed ledger debits.
     */
    function _burn(address from, uint256 assets, uint256 shares) internal virtual {
        if (from == address(0)) revert InvalidAccountAddress();
        if (isExcludedFromYield[from]) {
            _fixedBalances[from] -= assets;
            _totalFixedBalances -= assets;
        } else {
            _shares[from] -= shares;
            _totalShares -= shares;
        }
        emit Transfer(from, address(0), assets);
    }

    /// @notice Underlying ERC20 address.
    /// @return underlyingToken Address of `asset()`.
    function asset() public view returns (address underlyingToken) {
        return address(_underlying);
    }

    /**
     * @notice Returns the total book value of assets managed by the vault (virtual + physical).
     * @dev INVARIANT: `totalAssets = I + D + S`
     * - `I` — idle underlying in this contract.
     * - `D` — `protocolDebt` (optimistic affiliate CAC; see disposition C-1).
     * - `S` — `assetsInStrategy` (booked deployed margin + allocation).
     * For **deployable / physical** caps use `totalAssets() - protocolDebt` (see `openPosition`).
     * Redemptions are bounded by `I`, not `T`; integrators should use `maxWithdraw`.
     */
    function totalAssets() public view returns (uint256) {
        return _underlying.balanceOf(address(this)) + protocolDebt + assetsInStrategy;
    }

    /**
     * @notice Rebasing pool size — assets backing `_totalShares` after reserving fixed liabilities.
     * @dev Thin wrapper over `_rebasingAssets()` for off-chain analytics / adapters.
     */
    function rebasingTotalAssets() public view returns (uint256) {
        return _rebasingAssets();
    }

    /// @inheritdoc IIXToken
    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        return _convertToShares(assets, Math.Rounding.Floor);
    }

    /// @inheritdoc IIXToken
    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        return _convertToAssets(shares, Math.Rounding.Floor);
    }

    /// @dev Share price with virtual liquidity (`10**offset` shares, `+1` asset) — ERC-4626 inflation defense.
    /// @param assets Asset amount to convert.
    /// @param rounding Floor for mint paths; Ceil for burn paths.
    /// @return shares Share amount.
    function _convertToShares(uint256 assets, Math.Rounding rounding) internal view returns (uint256 shares) {
        return assets.mulDiv(_totalShares + 10 ** _decimalsOffset(), _rebasingAssets() + 1, rounding);
    }

    /// @dev Inverse of `_convertToShares` with identical virtual terms.
    /// @param shares Share amount to convert.
    /// @param rounding Floor for user views; Ceil where noted at call sites.
    /// @return assets Asset amount.
    function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view returns (uint256 assets) {
        return shares.mulDiv(_rebasingAssets() + 1, _totalShares + 10 ** _decimalsOffset(), rounding);
    }

    /// @inheritdoc IIXToken
    function maxDeposit(address) public pure returns (uint256) {
        return type(uint256).max;
    }

    /// @inheritdoc IIXToken
    function minDeposit(address) public view returns (uint256) {
        return minimumDepositAssetAmount;
    }

    /**
     * @notice Upper bound on **net** assets withdrawable in one shot (fee-aware).
     * @dev Largest `net` with `net + _calculateFee(net) <= balanceOf(owner)` so `withdraw(net, ...)` cannot revert
     *      on `ERC20InsufficientBalance` before the allowance check (relevant for `maxWithdraw`-driven full exits).
     */
    function maxWithdraw(address owner) public view returns (uint256) {
        uint256 bal = balanceOf(owner);
        if (bal == 0) return 0;

        uint256 net = bal.mulDiv(BPS_DENOMINATOR, BPS_DENOMINATOR + withdrawalFeeBps);
        if (net + _calculateFee(net) > bal) {
            return net > 0 ? net - 1 : 0;
        }
        uint256 physicalCash = _underlying.balanceOf(address(this));

        if (net > physicalCash) {
            return physicalCash;
        }
        return net;
    }

    /// @inheritdoc IIXToken
    function maxMint(address) public pure returns (uint256) {
        return 0;
    }

    /// @inheritdoc IIXToken
    function maxRedeem(address) public pure returns (uint256) {
        return 0;
    }

    /// @inheritdoc IIXToken
    function previewDeposit(uint256 assets) public view returns (uint256 shares) {
        return _convertToShares(assets, Math.Rounding.Floor);
    }

    /// @dev Rebasing pool size: `totalAssets() - _totalFixedBalances` (zero if undercollateralized).
    /// @return assets Assets backing `_totalShares` after fixed reservation.
    function _rebasingAssets() internal view returns (uint256 assets) {
        uint256 total = totalAssets();
        return total > _totalFixedBalances ? total - _totalFixedBalances : 0;
    }

    /// @inheritdoc IIXToken
    function withdrawalFee(uint256 assets) public view returns (uint256 fee) {
        return _calculateFee(assets);
    }

    /**
     * @notice Gross vault liability (`net + fee`) implied by withdrawing `assets` net to the user.
     * @dev Matches `_calculateFee` used in `withdraw`— consistent with asset-denominated `balanceOf`.
     */
    /// @inheritdoc IIXToken
    function previewWithdraw(uint256 assets) public view returns (uint256 grossAssets) {
        return assets + _calculateFee(assets);
    }

    /// @inheritdoc IIXToken
    function previewRedeem(uint256) public pure returns (uint256) {
        return 0;
    }

    /// @inheritdoc IIXToken
    function previewMint(uint256) public pure returns (uint256) {
        return 0;
    }

    /// @dev Reverts {SanctionedAddress} when `sanctionsList` is set and flags `account`.
    /// @param account Address screened on value flows.
    function _checkSanctions(address account) internal view {
        if (address(sanctionsList) != address(0)) {
            if (sanctionsList.isSanctioned(account)) {
                revert SanctionedAddress(account);
            }
        }
    }

    /// @inheritdoc IIXToken
    function getLatestAdapter() external view returns (address adapter) {
        require(address(latestAdapter) != address(0), InvalidAddress());
        return address(latestAdapter);
    }

    /// @inheritdoc IIXToken
    function getAuthorizedAdapters() external view returns (address[] memory adapters) {
        return authorizedAdaptersList;
    }

    /// @inheritdoc IIXToken
    /// @dev Rebasing: Floor share mint. Fixed: 1:1 credit. {nonReentrant}.
    function deposit(uint256 assets, address receiver) public nonReentrant returns (uint256 shares) {
        _checkSanctions(msg.sender);
        _checkSanctions(receiver);

        if (assets < minDeposit(msg.sender)) revert InvalidDepositAmount(assets, minimumDepositAssetAmount);

        uint256 mintedShares = previewDeposit(assets);
        _underlying.safeTransferFrom(msg.sender, address(this), assets);
        if (isExcludedFromYield[receiver]) {
            _fixedBalances[receiver] += assets;
            _totalFixedBalances += assets;
        } else {
            _shares[receiver] += mintedShares;
            _totalShares += mintedShares;
        }
        emit Deposit(msg.sender, receiver, assets, mintedShares);
        emit Transfer(address(0), receiver, assets);
        return mintedShares;
    }

    /**
     * @notice Deposit with optional affiliate commission modeled as rebasing shares.
     * @dev DESIGN RATIONALE — Affiliate path (Optimistic Accounting / CAC):
     * - Computes `affiliateAssetAmount` as bps of `assets`, converts to shares with **Floor** (vault-favorable rounding).
     * - Credits affiliate `_shares` immediately so they participate in yield like any rebasing holder.
     * - Increments `protocolDebt` by the same nominal asset amount while **full** `assets` ERC20 is pulled once.
     *   This creates short-term `ΔT_phantom = f` in `totalAssets()` by design (auditors: disposition C-1).
     *   Debt amortizes via withdrawal fees; solvency ratio enforced in `setProtocolParameters`.
     *   Strategy deployment cannot use `D` (`totalPhysicalAssets = totalAssets() - protocolDebt`).
     *
     * Self-referral and fixed affiliates skip the commission branch.
     * @param assets Gross deposit from `msg.sender`.
     * @param receiver User deposit beneficiary.
     * @param affiliate Commission recipient (`address(0)` skips).
     * @return userShares Rebasing shares minted to `receiver` when not on fixed ledger.
     */
    function depositWithAffiliate(uint256 assets, address receiver, address affiliate)
        public
        nonReentrant
        returns (uint256 userShares)
    {
        _checkSanctions(msg.sender);
        _checkSanctions(receiver);
        _checkSanctions(affiliate);
        if (assets < minDeposit(msg.sender)) revert InvalidDepositAmount(assets, minimumDepositAssetAmount);
        uint256 previewedUserShares = previewDeposit(assets);
        uint256 affiliateAssetAmount = 0;
        uint256 affiliateShares = 0;

        if (
            affiliate != address(0) && affiliate != msg.sender && affiliate != receiver
                && !isExcludedFromYield[affiliate]
        ) {
            affiliateAssetAmount = assets.mulDiv(affiliateFeeBps, BPS_DENOMINATOR);
            affiliateShares = _convertToShares(affiliateAssetAmount, Math.Rounding.Floor);
        }

        _underlying.safeTransferFrom(msg.sender, address(this), assets);

        emit Deposit(msg.sender, receiver, assets, previewedUserShares);

        if (affiliateShares > 0) {
            protocolDebt += affiliateAssetAmount;
            _shares[affiliate] += affiliateShares;
            _totalShares += affiliateShares;
            emit AffiliatePaid(affiliate, affiliateAssetAmount);
            emit Transfer(address(0), affiliate, affiliateAssetAmount);
        }

        _mint(receiver, assets, previewedUserShares);
        return previewedUserShares;
    }

    /// @inheritdoc IIXToken
    function depositWithPermit(uint256 assets, address receiver, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        returns (uint256 shares)
    {
        try IERC20Permit(address(_underlying)).permit(msg.sender, address(this), assets, deadline, v, r, s) {} catch {}
        return deposit(assets, receiver);
    }

    /// @inheritdoc IIXToken
    function depositWithAffiliateAndPermit(
        uint256 assets,
        address receiver,
        address affiliate,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 userShares) {
        try IERC20Permit(address(_underlying)).permit(msg.sender, address(this), assets, deadline, v, r, s) {} catch {}
        return depositWithAffiliate(assets, receiver, affiliate);
    }

    /// @inheritdoc IIXToken
    /// @dev Rebasing burns use Ceil on partial exits; full-exit branch burns entire share balance and `totalAssetsRequired = userBal`.
    ///      Fee remains in idle cash; `protocolDebt` reduced by `fee` (CAC amortization). {nonReentrant}.
    function withdraw(uint256 assets, address receiver, address owner)
        public
        nonReentrant
        returns (uint256 totalAssetsRequired)
    {
        _checkSanctions(msg.sender);
        _checkSanctions(receiver);
        _checkSanctions(owner);
        uint256 fee = _calculateFee(assets);
        totalAssetsRequired = assets + fee;

        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, totalAssetsRequired);
        }

        uint256 userBal = balanceOf(owner);
        require(userBal >= totalAssetsRequired, ERC20InsufficientBalance(owner, userBal, totalAssetsRequired));

        uint256 sharesToBurn;
        if (userBal - totalAssetsRequired <= 1) {
            sharesToBurn = isExcludedFromYield[owner] ? 0 : _shares[owner];
            totalAssetsRequired = userBal;
        } else {
            sharesToBurn = isExcludedFromYield[owner] ? 0 : _convertToShares(totalAssetsRequired, Math.Rounding.Ceil);
        }

        if (isExcludedFromYield[owner]) {
            _fixedBalances[owner] -= totalAssetsRequired;
            _totalFixedBalances -= totalAssetsRequired;
        } else {
            _shares[owner] -= sharesToBurn;
            _totalShares -= sharesToBurn;
        }

        _underlying.safeTransfer(receiver, assets);

        if (protocolDebt < fee) {
            // PnL: protocol share of withdrawal fee retained in vault cash (excludes foundationShare / trader leg).
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl += int256(fee - protocolDebt);
            protocolDebt = 0;
        } else {
            protocolDebt -= fee;
        }

        emit Withdraw(msg.sender, receiver, owner, assets, sharesToBurn);
        emit Transfer(owner, address(0), assets);
        return totalAssetsRequired;
    }

    /// @inheritdoc IIXToken
    /// @dev Snapshots `balanceOf` before ledger mutation to avoid transient share-price distortion.
    function setExcludeFromYield(address account, bool exclude) external {
        require(account != address(0), InvalidAccountAddress());
        require(account == msg.sender || msg.sender == owner(), ErrorAuthorizedOnly(msg.sender));

        _setExcludeFromYield(account, exclude);
    }

    /// @dev Migrates `account` between fixed and rebasing ledgers; no-op if flag unchanged.
    /// @param account Account to migrate.
    /// @param exclude `true` for fixed ledger; `false` for rebasing.
    function _setExcludeFromYield(address account, bool exclude) internal {
        if (isExcludedFromYield[account] == exclude) return;
        uint256 currentBal = balanceOf(account);

        if (exclude) {
            _totalShares -= _shares[account];
            _shares[account] = 0;

            _fixedBalances[account] = currentBal;
            _totalFixedBalances += currentBal;
        } else {
            uint256 shares = _convertToShares(currentBal, Math.Rounding.Floor);

            _totalFixedBalances -= _fixedBalances[account];
            _fixedBalances[account] = 0;

            _shares[account] = shares;
            _totalShares += shares;
        }

        isExcludedFromYield[account] = exclude;
        emit ExcludeFromYield(account, exclude);
    }

    /**
     * @dev TRUSTED ADAPTER threat model: authorized adapters report `totalReturnAssets` without vault-side oracle
     *      validation. Compromised adapters are out of scope for this contract; governance controls adapter set.
     */
    modifier onlyAuthorizedAdapter() {
        if (!isAuthorizedApproved[address(msg.sender)]) revert UnauthorizedAdapter();
        _;
    }

    /**
     * @notice Opens a margin position and deploys liquidity to the calling adapter.
     * @dev Margin-execution vault (not generic lending). Escrow: trader margin moves to adapter fixed ledger via
     *      `_executeTransfer` after allowance; vault transfers `margin + allocation` underlying to adapter.
     *      CEI: checks → ledger + `assetsInStrategy` → external transfer. Deploy cap uses `totalAssets() - protocolDebt`.
     *      THREAT MODEL: {onlyAuthorizedAdapter} — adapter must be governance-authorized.
     * @param positionId Unique position id.
     * @param trader Margin poster (must approve adapter on vault token).
     * @param marginAmount Trader margin escrowed on adapter fixed ledger.
     * @param allocatedAmount Vault allocation sent to adapter for execution.
     * @return success True if the position was opened successfully.
     */
    function openPosition(bytes32 positionId, address trader, uint256 marginAmount, uint256 allocatedAmount)
        external
        onlyAuthorizedAdapter
        nonReentrant
        returns (bool success)
    {
        if (positions[positionId].trader != address(0)) revert InvalidAddress();

        uint256 totalPhysicalAssets = totalAssets() - protocolDebt;
        uint256 totalRequiredAmount = marginAmount + allocatedAmount;
        uint256 prospectiveVolume = assetsInStrategy + totalRequiredAmount;
        if (prospectiveVolume > totalPhysicalAssets.mulDiv(maxOpenPositionsVolumeBps, BPS_DENOMINATOR)) {
            revert MaxPositionsVolumeExceeded();
        }

        uint256 physicalCash = _underlying.balanceOf(address(this));
        if (totalRequiredAmount > physicalCash) {
            revert InsufficientPhysicalLiquidity(physicalCash, allocatedAmount);
        }

        if (allocatedAmount > marginAmount.mulDiv(maxLeverageBps, BPS_DENOMINATOR)) {
            revert MaxLeverageExceeded();
        }
        if (totalRequiredAmount < minimumPositionVolume) {
            revert MinimumPositionVolumeNotMet();
        }

        _spendAllowance(trader, msg.sender, marginAmount);
        _executeTransfer(trader, msg.sender, marginAmount);

        assetsInStrategy += totalRequiredAmount;

        _underlying.safeTransfer(msg.sender, totalRequiredAmount);

        address adapter = msg.sender;
        positions[positionId] = Position({
            trader: trader,
            adapter: adapter,
            marginAmount: marginAmount,
            allocatedAmount: allocatedAmount,
            openingTimestamp: block.timestamp,
            closingTimestamp: 0
        });

        emit PositionOpened(positionId, trader, adapter, marginAmount, allocatedAmount);
        return true;
    }

    /**
     * @notice Closes a position and settles PnL on the dual ledger.
     * @dev Margin escrow model: adapter holds trader margin on fixed ledger; losses burn adapter fixed balance.
     *
     *      **Settlement ordering (auditors — not a CEI defect):** ledger effects in `_closePosition` run before
     *      `safeTransferFrom` because `totalAssets() = I + D + S`. Pulling underlying first would increase `I` while
     *      `S` still books the open position, **double-counting** recovery in `T` and skewing `previewDeposit` /
     *      `_convertToShares` during profit and keeper mints. Physical pull is therefore **deferred** until after
     *      settlement on adapter-reported amounts; the whole transaction is atomic (`nonReentrant`, revert on failed pull).
     *
     *      THREAT MODEL: `totalReturnAssets` and `opFee` are adapter-reported (trusted adapter).
     *      **Protocol fee (`opFee`):** included **inside** `totalReturnAssets` (not added on top). Settlement uses
     *      **net** (`totalReturnAssets - opFee`), credits {pnl} `+= opFee`, and requires the adapter to `transferFrom`
     *      exactly **`totalReturnAssets`**. Reverts {InvalidOperatorFee} if `opFee > totalReturnAssets`.
     * @param positionId Position identifier.
     * @param totalReturnAssets Total underlying the adapter returns to the vault (includes `opFee`).
     * @param opFee Protocol fee retained in vault idle cash for holder accrual (deducted from `totalReturnAssets` for settlement).
     */
    function closePosition(bytes32 positionId, uint256 totalReturnAssets, uint256 opFee) external nonReentrant {
        Position memory pos = positions[positionId];
        if (pos.trader == address(0)) revert PositionDoesNotExist();
        if (msg.sender != address(pos.adapter)) revert UnauthorizedAdapter();

        _closePosition(positionId, totalReturnAssets, opFee);
        if (totalReturnAssets > 0) {
            _underlying.safeTransferFrom(msg.sender, address(this), totalReturnAssets);
        }
    }

    /**
     * @notice Adapter-initiated close with keeper incentive (e.g. expired / stale position unwound by a keeper).
     * @dev Same settlement as {closePosition} after carving a keeper slice from recovery:
     *      `keeperAsset = min(marginAmount × keeperIncentiveRewardBps, maxKeeperIncentiveReward, totalReturnAssets)`.
     *      Settlement runs on post-keeper amount; adapter `transferFrom`s the original **`totalReturnAssets`** only.
     *      Keeper is paid in **vault token** (rebasing shares via `_mint`), not underlying — backing comes from pulled recovery.
     *
     *      **Keeper sizing vs {liquidatePosition}:** force-close uses **margin × bps** (smaller, administrative incentive).
     *      Liquidation uses **net recovery × bps** so underwater unwinds can pay more and stay competitive for keepers.
     *
     *      **Expiry / eligibility:** intentionally **not** enforced in core. Each DEX pool has its own expiry rules;
     *      {IIrisAdapter} modules hold per-market configuration and decide when to call this function and which `keeper`
     *      to name. Core only trusts that `msg.sender` is the position's authorized adapter.
     *
     *      THREAT MODEL: adapter chooses timing, eligibility, and `keeper` (governance-authorized adapter set).
     * @param positionId Position identifier.
     * @param totalReturnAssets Total underlying the adapter returns (includes `opFee`; before keeper slice).
     * @param opFee Protocol fee included in `totalReturnAssets` (same rules as {closePosition} on post-keeper amount).
     * @param keeper Keeper receiving rebasing vault-token incentive.
     */
    function forceClosePosition(bytes32 positionId, uint256 totalReturnAssets, uint256 opFee, address keeper)
        external
        nonReentrant
    {
        _checkSanctions(keeper);
        Position memory pos = positions[positionId];
        if (pos.trader == address(0)) revert PositionDoesNotExist();
        if (msg.sender != address(pos.adapter)) revert UnauthorizedAdapter();
        if (keeper == address(0)) revert InvalidAddress();

        uint256 keeperAsset = pos.marginAmount.mulDiv(keeperIncentiveRewardBps, BPS_DENOMINATOR);
        if (keeperAsset > maxKeeperIncentiveReward) {
            keeperAsset = maxKeeperIncentiveReward;
        }
        if (keeperAsset > totalReturnAssets) {
            keeperAsset = totalReturnAssets;
        }
        uint256 grossReturn = totalReturnAssets;
        totalReturnAssets = totalReturnAssets - keeperAsset;
        uint256 keeperShare = _convertToShares(keeperAsset, Math.Rounding.Floor);

        _closePosition(positionId, totalReturnAssets, opFee);
        if (grossReturn > 0) {
            _underlying.safeTransferFrom(msg.sender, address(this), grossReturn);
        }
        if (keeperAsset > 0) {
            _mint(keeper, keeperAsset, keeperShare);
        }
        emit PositionForceClosed(positionId, pos.trader, pos.adapter, totalReturnAssets, opFee, keeper, keeperAsset);
    }

    /**
     * @notice Internal close settlement — dual-ledger PnL branches and `assetsInStrategy` release.
     * @dev Called by {closePosition} and {forceClosePosition}. Does **not** pull underlying; caller must
     *      `transferFrom` adapter afterward (see {closePosition} — deferred pull preserves `T = I + D + S` integrity).
     *      Deletes `positions[positionId]`.
     *      THREAT MODEL: adapter-reported recovery and `opFee` (`opFee` must be ≤ settlement base at entry).
     *
     *      **Profitable-close fee waterfall** (on `grossProfit = netReturn - debtToReturn`):
     *      `foundationShare` + `protocolShare` + `lpFarmingShare` + `netProfitToTrader` = `grossProfit`.
     *      - `protocolShare` → {pnl} (retained idle cash; not minted).
     *      - `foundationShare` and `lpFarmingShare` → `_mint` rebasing shares (locker uses fixed ledger).
     *      - If {lpFarming} is zero, `lpFarmingShare` is folded into `foundationShare` (trader net unchanged).
     * @param positionId Position identifier.
     * @param totalReturnAssets Recovery base for settlement (post-keeper slice on force-close; before internal `opFee` deduction).
     * @param opFee Protocol fee included in the pulled amount; reverts {InvalidOperatorFee} if `opFee` exceeds settlement base.
     */
    function _closePosition(bytes32 positionId, uint256 totalReturnAssets, uint256 opFee) internal {
        Position memory pos = positions[positionId];

        uint256 grossReturn = totalReturnAssets;
        if (opFee > grossReturn) revert InvalidOperatorFee(opFee);
        if (opFee > 0) {
            totalReturnAssets = grossReturn - opFee;
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl += int256(opFee);
        }

        uint256 debtToReturn = pos.allocatedAmount + pos.marginAmount;
        uint256 profit = totalReturnAssets > debtToReturn ? totalReturnAssets - debtToReturn : 0;
        uint256 loss = debtToReturn > totalReturnAssets ? debtToReturn - totalReturnAssets : 0;

        uint256 protocolShare;
        uint256 foundationShare;
        uint256 lpFarmingShare;

        if (profit > 0) {
            uint256 grossProfit = totalReturnAssets - debtToReturn;
            foundationShare = grossProfit.mulDiv(foundationFeeBps, BPS_DENOMINATOR);
            protocolShare = grossProfit.mulDiv(protocolShareOfProfitBps, BPS_DENOMINATOR);
            lpFarmingShare = grossProfit.mulDiv(lpFarmingFeeBps, BPS_DENOMINATOR);
            if (address(lpFarming) == address(0)) {
                foundationShare += lpFarmingShare;
                lpFarmingShare = 0;
            }
            uint256 netProfitToTrader = grossProfit - foundationShare - protocolShare - lpFarmingShare;
            // PnL: protocol share of gross trade profit retained in vault cash (excludes foundationShare / trader leg).
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl += int256(protocolShare);
            _executeTransfer(msg.sender, pos.trader, pos.marginAmount);
            _mint(foundation, foundationShare, _convertToShares(foundationShare, Math.Rounding.Floor));
            if (lpFarmingShare > 0) {
                _mint(address(lpFarming), lpFarmingShare, _convertToShares(lpFarmingShare, Math.Rounding.Floor));
            }
            uint256 shares = previewDeposit(netProfitToTrader);
            if (isExcludedFromYield[pos.trader]) {
                _fixedBalances[pos.trader] += netProfitToTrader;
                _totalFixedBalances += netProfitToTrader;
            } else {
                _shares[pos.trader] += shares;
                _totalShares += shares;
            }

            emit Deposit(msg.sender, pos.trader, netProfitToTrader, shares);
            emit Transfer(address(0), pos.trader, netProfitToTrader);
        } else if (loss == 0) {
            _executeTransfer(msg.sender, pos.trader, pos.marginAmount);
        } else {
            uint256 limitedLoss = pos.marginAmount.mulDiv(liquidationThresholdBps, BPS_DENOMINATOR);
            if (loss <= limitedLoss) {
                // PnL: unchanged — loss is charged to adapter escrow (trader margin); vault allocation is made whole via `totalReturnAssets`.
                _fixedBalances[msg.sender] -= loss;
                _totalFixedBalances -= loss;

                uint256 remainingMargin = pos.marginAmount - loss;
                if (remainingMargin > 0) {
                    _executeTransfer(msg.sender, pos.trader, remainingMargin);
                }
                emit Burn(msg.sender, loss);
            } else {
                if (totalReturnAssets < pos.allocatedAmount) {
                    // PnL: vault allocation shortfall (allocated principal not fully returned).
                    // forge-lint: disable-next-line(unsafe-typecast)
                    pnl -= int256(pos.allocatedAmount - totalReturnAssets);
                    _fixedBalances[msg.sender] -= pos.marginAmount;
                    _totalFixedBalances -= pos.marginAmount;
                    emit Burn(msg.sender, pos.marginAmount);
                    emit BadDebtRealized(positionId, pos.allocatedAmount - totalReturnAssets);
                } else {
                    uint256 remainingMargin = pos.marginAmount - loss;
                    uint256 penalty = remainingMargin.mulDiv(protocolShareOfProfitBps, BPS_DENOMINATOR);
                    // PnL: protocol penalty skimming excess margin after severe (but not hard) loss.
                    // forge-lint: disable-next-line(unsafe-typecast)
                    pnl += int256(penalty);
                    uint256 assetsToBurn = loss + penalty;
                    uint256 traderReturn = pos.marginAmount - assetsToBurn;
                    _executeTransfer(msg.sender, pos.trader, traderReturn);

                    _fixedBalances[msg.sender] -= assetsToBurn;
                    _totalFixedBalances -= assetsToBurn;
                    emit Burn(msg.sender, assetsToBurn);
                }
            }
        }
        assetsInStrategy -= debtToReturn;

        emit PositionClosed(positionId, pos.trader, profit, loss, protocolShare, foundationShare);
        delete positions[positionId];
    }

    /**
     * @notice Liquidates an underwater position and pays the keeper in vault token (rebasing shares).
     * @dev Margin escrow on adapter fixed ledger. Bad debt beyond margin socializes via lower rebasing NAV (`BadDebtRealized`).
     *
     *      **Settlement ordering:** same deferred-pull pattern as {closePosition} (effects → pull → keeper `_mint`).
     *
     *      **Keeper incentive (liquidation premium):** `keeperShare = min(netRecovery × keeperIncentiveRewardBps,
     *      maxKeeperIncentiveReward)` where `netRecovery = gross - opFee`. Uses **recovery** not **margin** so
     *      incentives scale with rescued cash and stay attractive for keepers on underwater positions — intentionally
     *      higher effective payout than {forceClosePosition} (margin-based) for the same bps parameters.
     *
     *      **Keeper share mint:** increases rebasing liabilities; economic cost flows through margin waterfall /
     *      `BadDebtRealized`. Under the trusted-adapter model the adapter must `transferFrom` full gross in the same
     *      tx or the call reverts — there is no unbacked mint path in a successful transaction.
     *
     *      **Protocol fee (`opFee`):** included in `totalReturnAssets`; waived on liquidate if `opFee > totalReturnAssets`.
     *      THREAT MODEL: adapter-reported `totalReturnAssets` and `opFee`.
     * @param positionId Position identifier.
     * @param totalReturnAssets Total underlying the adapter returns to the vault (includes `opFee`).
     * @param keeper Keeper payout recipient (receives rebasing vault shares, not underlying).
     * @param opFee Protocol fee included in `totalReturnAssets` (deducted for settlement; waived if greater than recovery).
     */
    function liquidatePosition(bytes32 positionId, uint256 totalReturnAssets, address keeper, uint256 opFee)
        external
        nonReentrant
    {
        _checkSanctions(keeper);
        Position memory pos = positions[positionId];
        if (pos.trader == address(0)) revert PositionDoesNotExist();
        if (msg.sender != address(pos.adapter)) revert UnauthorizedAdapter();
        if (keeper == address(0)) revert InvalidAddress();

        uint256 grossReturn = totalReturnAssets;
        if (opFee > grossReturn) {
            opFee = 0;
        } else if (opFee > 0) {
            totalReturnAssets = grossReturn - opFee;
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl += int256(opFee);
        }

        if (totalReturnAssets > pos.allocatedAmount + pos.marginAmount) revert NotInLiquidationRange();
        uint256 loss = pos.allocatedAmount + pos.marginAmount - totalReturnAssets;
        uint256 marginLossThreshold = pos.marginAmount.mulDiv(liquidationThresholdBps, BPS_DENOMINATOR);
        if (loss < marginLossThreshold) revert NotInLiquidationRange();
        uint256 keeperShare = totalReturnAssets.mulDiv(keeperIncentiveRewardBps, BPS_DENOMINATOR);
        if (keeperShare > maxKeeperIncentiveReward) {
            keeperShare = maxKeeperIncentiveReward;
        }
        if (loss + keeperShare > pos.marginAmount) {
            // PnL: socialized shortfall when margin cannot cover loss + keeper (matches `BadDebtRealized` magnitude).
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl -= int256(loss + keeperShare - pos.marginAmount);
            _fixedBalances[msg.sender] -= pos.marginAmount;
            _totalFixedBalances -= pos.marginAmount;
            emit Burn(msg.sender, pos.marginAmount);
            emit BadDebtRealized(positionId, loss + keeperShare - pos.marginAmount);
        } else {
            uint256 remainingMargin = pos.marginAmount - loss - keeperShare;
            uint256 penalty = remainingMargin.mulDiv(protocolShareOfProfitBps, BPS_DENOMINATOR);
            uint256 assetsToReturn = remainingMargin - penalty;
            // PnL: protocol penalty on post-liquidation margin remainder (`keeperShare` not debited here).
            // forge-lint: disable-next-line(unsafe-typecast)
            pnl += int256(penalty);
            _executeTransfer(msg.sender, pos.trader, assetsToReturn);
            _fixedBalances[msg.sender] -= pos.marginAmount - assetsToReturn;
            _totalFixedBalances -= pos.marginAmount - assetsToReturn;
            emit Burn(msg.sender, pos.marginAmount - assetsToReturn);
        }
        assetsInStrategy -= pos.allocatedAmount + pos.marginAmount;

        if (grossReturn > 0) {
            _underlying.safeTransferFrom(msg.sender, address(this), grossReturn);
        }
        if (keeperShare > 0) {
            _mint(keeper, keeperShare, _convertToShares(keeperShare, Math.Rounding.Floor));
        }
        emit PositionLiquidated(positionId, pos.trader, keeper, keeperShare);
        delete positions[positionId];
    }

    /// @inheritdoc IIXToken
    function setSanctionsList(ISanctionsList _sanctionsList) external onlyOwner {
        sanctionsList = _sanctionsList;
        emit SanctionsListSet(_sanctionsList);
    }

    /// @inheritdoc IIXToken
    /// @dev Approved adapters are forced onto the fixed ledger; adapter `owner()` must match vault `owner()`.
    ///      The adapter must have max allowance to this contract.
    function setAdapterStatus(address _adapter, bool _approved, bool _makeLatest) external onlyOwner {
        require(_adapter != address(0), InvalidAddress());

        isAuthorizedApproved[_adapter] = _approved;

        if (_approved) {
            address adapterOwner = IIrisAdapter(_adapter).owner();
            require(
                _underlying.allowance(address(_adapter), address(this)) == type(uint256).max, InvalidAdapterAllowance()
            );
            require(adapterOwner == owner(), InvalidAdapterOwner(adapterOwner));

            if (!isExcludedFromYield[address(_adapter)]) {
                _setExcludeFromYield(address(_adapter), true);
            }

            bool exists = false;
            for (uint256 i = 0; i < authorizedAdaptersList.length; i++) {
                if (authorizedAdaptersList[i] == _adapter) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                authorizedAdaptersList.push(_adapter);
            }
        }

        if (_makeLatest && _approved) {
            latestAdapter = _adapter;
        }

        emit AdapterStatusUpdated(_adapter, _approved, _makeLatest);
    }

    /**
     * @dev Ensures affiliate CAC (`protocolDebt`) is repayable from withdrawal fees under max-stress outflows.
     * @notice Solvency inequality (C-1 guard):
     * `withdrawalFeeBps * (BPS_DENOMINATOR - maxOpenPositionsVolumeBps) >= affiliateFeeBps * BPS_DENOMINATOR`
     * Interpretation: at most `(1 - maxOpenPositionsVolumeBps/10_000)` of capital may exit via withdraw-fee-bearing
     * flows in the modeled worst case; fee yield on that slice must cover affiliate bps on all deposits.
     * @param _withdrawalFeeBps Withdrawal fee in basis points.
     * @param _affiliateFeeBps Affiliate fee in basis points.
     * @param _maxOpenPositionsVolumeBps Max strategy engagement bps (reduces withdrawable fraction in the model).
     */
    function _validateSolvencyRatio(
        uint256 _withdrawalFeeBps,
        uint256 _affiliateFeeBps,
        uint256 _maxOpenPositionsVolumeBps
    ) internal pure {
        uint256 leftSide = _withdrawalFeeBps * (BPS_DENOMINATOR - _maxOpenPositionsVolumeBps);
        uint256 rightSide = _affiliateFeeBps * BPS_DENOMINATOR;

        if (leftSide < rightSide) {
            revert InsolventProtocolRatio(_withdrawalFeeBps, _affiliateFeeBps, _maxOpenPositionsVolumeBps);
        }
    }

    /// @inheritdoc IIXToken
    /// @dev Atomically updates fee/strategy-cap parameters and enforces `_validateSolvencyRatio` (CAC amortization guard).
    function setProtocolParameters(
        uint256 _withdrawalFeeBps,
        uint256 _affiliateFeeBps,
        uint256 _maxOpenPositionsVolumeBps
    ) external onlyOwner {
        require(_withdrawalFeeBps <= MAX_WITHDRAWAL_FEE_BPS, InvalidWithdrawalFeeBPS(MAX_WITHDRAWAL_FEE_BPS));
        require(
            _maxOpenPositionsVolumeBps <= MAX_OPEN_POSITIONS_VOLUME_BPS,
            InvalidMaxOpenPositionsVolumeBPS(MAX_OPEN_POSITIONS_VOLUME_BPS)
        );
        require(_withdrawalFeeBps > _affiliateFeeBps, InvalidWithdrawalFeeBPS(_affiliateFeeBps));

        _validateSolvencyRatio(_withdrawalFeeBps, _affiliateFeeBps, _maxOpenPositionsVolumeBps);

        withdrawalFeeBps = _withdrawalFeeBps;
        affiliateFeeBps = _affiliateFeeBps;
        maxOpenPositionsVolumeBps = _maxOpenPositionsVolumeBps;

        emit ProtocolParametersSet(_withdrawalFeeBps, _affiliateFeeBps, _maxOpenPositionsVolumeBps);
    }

    /// @inheritdoc IIXToken
    function setFoundationFeeBps(uint256 _foundationFeeBps) external onlyOwner {
        require(_foundationFeeBps <= MAX_FOUNDATION_FEE_BPS, InvalidFoundationFeeBPS(MAX_FOUNDATION_FEE_BPS));
        foundationFeeBps = _foundationFeeBps;
        emit FoundationFeeBpsSet(_foundationFeeBps);
    }

    /// @inheritdoc IIXToken
    function setProtocolShareOfProfitBps(uint256 _protocolShareOfProfitBps) external onlyOwner {
        require(
            _protocolShareOfProfitBps <= MAX_PROTOCOL_SHARE_OF_PROFIT_BPS,
            InvalidProtocolShareOfProfitBPS(MAX_PROTOCOL_SHARE_OF_PROFIT_BPS)
        );
        protocolShareOfProfitBps = _protocolShareOfProfitBps;
        emit ProtocolShareOfProfitBpsSet(_protocolShareOfProfitBps);
    }

    /// @inheritdoc IIXToken
    function setMaxLeverageBps(uint256 _maxLeverageBps) external onlyOwner {
        require(_maxLeverageBps <= MAX_LEVERAGE_BPS, InvalidMaxLeverageBPS(MAX_LEVERAGE_BPS));
        maxLeverageBps = _maxLeverageBps;
        emit MaxLeverageBpsSet(_maxLeverageBps);
    }

    /// @inheritdoc IIXToken
    function setLiquidationThresholdBps(uint256 _liquidationThresholdBps) external onlyOwner {
        require(
            _liquidationThresholdBps <= MIN_LIQUIDATION_THRESHOLD_BPS,
            InvalidLiquidationThresholdBPS(MIN_LIQUIDATION_THRESHOLD_BPS)
        );
        liquidationThresholdBps = _liquidationThresholdBps;
        emit LiquidationThresholdBpsSet(_liquidationThresholdBps);
    }

    /// @inheritdoc IIXToken
    function setMaxKeeperIncentiveReward(uint256 _maxKeeperIncentiveReward) external onlyOwner {
        require(
            _maxKeeperIncentiveReward <= MAX_KEEPER_INCENTIVE_REWARD_NO_DECIMALS * 10 ** decimals(),
            InvalidMaxKeeperIncentiveReward(MAX_KEEPER_INCENTIVE_REWARD_NO_DECIMALS * 10 ** decimals())
        );
        maxKeeperIncentiveReward = _maxKeeperIncentiveReward;
        emit MaxKeeperIncentiveRewardSet(_maxKeeperIncentiveReward);
    }

    /// @inheritdoc IIXToken
    function setKeeperIncentiveRewardBps(uint256 _keeperIncentiveRewardBps) external onlyOwner {
        require(
            _keeperIncentiveRewardBps <= MAX_KEEPER_INCENTIVE_REWARD_BPS,
            InvalidKeeperIncentiveRewardBPS(MAX_KEEPER_INCENTIVE_REWARD_BPS)
        );
        keeperIncentiveRewardBps = _keeperIncentiveRewardBps;
        emit KeeperIncentiveRewardBpsSet(_keeperIncentiveRewardBps);
    }

    /// @notice Sets the minimum gross deposit amount.
    /// @param _minimumDepositAssetAmount New minimum (must be >= 1).
    function setMinimumDepositAssetAmount(uint256 _minimumDepositAssetAmount) external onlyOwner {
        require(_minimumDepositAssetAmount >= 1, InvalidMinimumDepositAssetAmount(1));
        minimumDepositAssetAmount = _minimumDepositAssetAmount;
        emit MinimumDepositAssetAmountSet(_minimumDepositAssetAmount);
    }

    /// @inheritdoc IIXToken
    function setLender(address _lender) external onlyOwner {
        require(_lender != address(0), InvalidAddress());
        lender = _lender;
        emit LenderSet(_lender);
    }

    /// @inheritdoc IIXToken
    function setLendingFeeBps(uint256 lendingFeeBps_) external onlyOwner {
        require(lendingFeeBps_ <= MAX_LENDING_FEE_BPS, InvalidLendingFeeBPS(MAX_LENDING_FEE_BPS));
        lendingFeeBps = lendingFeeBps_;
        emit LendingFeeBpsSet(lendingFeeBps);
    }

    /// @dev Restricts flash-loan entry to the governance-configured {lender} gateway (`IrisFlashLender`).
    modifier onlyLender() {
        if (msg.sender != lender) revert UnauthorizedLender();
        _;
    }

    /// @dev ERC-3156 success token required from {IERC3156FlashBorrower-onFlashLoan}.
    bytes32 private constant _FLASH_CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    /**
     * @notice Lender-only flash facility backing the external `IrisFlashLender` gateway.
     * @dev **Threat model:** only {lender} may call. The lender is a trusted, owner-set contract that may
     *      source liquidity from Maker flash mint, idle vault cash, or vault-token flash mint, then route to
     *      end borrowers. End users never call this function directly.
     *
     *      **Supported `token` paths:**
     *      - `address(this)` — uncollateralized fixed-ledger mint to {lender}; repayment burns `amount + fee`.
     *        The fee leg is not re-minted: burning `amount + fee` while only `amount` was minted retires
     *        `fee` of rebasing-holder liability (protocol revenue; credited to {pnl}).
     *      - `asset()` — transfers idle underlying `I`; repayment must restore `I + fee`.
     *
     *      **Guards:** {nonReentrant} (callback cannot re-enter guarded vault paths), zero-amount rejection,
     *      ERC-3156 callback success check, post-callback solvency checks on both paths.
     *
     *      **Accounting:** flash mint does not change `totalAssets()` (`T = I + D + S`) — only `totalSupply()`
     *      / fixed liabilities move temporarily. Underlying flash reduces idle `I` during the callback.
     *
     * @param token Vault token (`address(this)`) or underlying (`asset()`).
     * @param amount Principal to flash (must be > 0).
     * @param data Opaque payload forwarded to {lender}'s `onFlashLoan`.
     */
    /// @inheritdoc IIXToken
    function internalFlashLoanToLender(address token, uint256 amount, bytes calldata data)
        external
        onlyLender
        nonReentrant
    {
        if (amount == 0) revert InvalidFlashLoanAmount();

        uint256 fee = flashFee(token, amount);

        if (token == address(this)) {
            if (!isExcludedFromYield[msg.sender]) {
                _setExcludeFromYield(msg.sender, true);
            }

            _mint(msg.sender, amount, 0);

            bytes32 callbackResult = IERC3156FlashBorrower(msg.sender).onFlashLoan(msg.sender, token, amount, fee, data);
            if (callbackResult != _FLASH_CALLBACK_SUCCESS) revert ERC3156CallbackFailed();

            uint256 totalRequired = amount + fee;
            uint256 lenderBalance = balanceOf(msg.sender);
            if (lenderBalance < totalRequired) {
                revert ERC3156InsufficientBalance(msg.sender, lenderBalance, totalRequired);
            }

            _burn(msg.sender, totalRequired, 0);

            if (fee > 0) {
                // forge-lint: disable-next-line(unsafe-typecast)
                pnl += fee.toInt256();
            }

            emit FlashLoanToLender(msg.sender, token, amount, fee, data);
        } else if (token == address(_underlying)) {
            uint256 balanceBefore = _underlying.balanceOf(address(this));
            if (balanceBefore < amount) {
                revert ERC3156InsufficientBalance(address(this), balanceBefore, amount);
            }

            _underlying.safeTransfer(msg.sender, amount);

            bytes32 callbackResult = IERC3156FlashBorrower(msg.sender).onFlashLoan(msg.sender, token, amount, fee, data);
            if (callbackResult != _FLASH_CALLBACK_SUCCESS) revert ERC3156CallbackFailed();

            _underlying.safeTransferFrom(msg.sender, address(this), amount + fee);

            uint256 balanceAfter = _underlying.balanceOf(address(this));
            if (balanceAfter < balanceBefore + fee) {
                revert ERC3156InsufficientBalance(address(this), balanceAfter, balanceBefore + fee);
            }

            if (fee > 0) {
                // forge-lint: disable-next-line(unsafe-typecast)
                pnl += fee.toInt256();
            }

            emit FlashLoanToLender(msg.sender, token, amount, fee, data);
        } else {
            revert ERC3156UnsupportedToken(token);
        }
    }

    /// @inheritdoc IIXToken
    function flashFee(address token, uint256 amount) public view returns (uint256) {
        if (token != address(this) && token != address(_underlying)) revert ERC3156UnsupportedToken(token);
        return amount.mulDiv(lendingFeeBps, BPS_DENOMINATOR);
    }

    /// @inheritdoc IIXToken
    function setLpFarming(IIrisLPFarming _lpFarming) external onlyOwner {
        lpFarming = _lpFarming;
        if (address(_lpFarming) != address(0)) {
            _setExcludeFromYield(address(_lpFarming), true);
        }
        emit LpFarmingSet(address(_lpFarming));
    }

    /// @inheritdoc IIXToken
    function setLpFarmingFeeBps(uint256 _lpFarmingFeeBps) external onlyOwner {
        if (_lpFarmingFeeBps > MAX_LP_FARMING_FEE_BPS) revert InvalidLpFarmingFeeBPS(MAX_LP_FARMING_FEE_BPS);
        lpFarmingFeeBps = _lpFarmingFeeBps;
        emit LpFarmingFeeBpsSet(_lpFarmingFeeBps);
    }
}
```
I need:
1. Deep and ditailed AI context for all of the project ignore the visual effect for that file.
2. Deep and Ditailed Whitepaper to be used for super-pro users and web3 auditors and as source of Multiple ISI Articles or ETHReaserch Articles, include the failure point and review the project from every single angle.
3. Summerized Whitepaper for Pro Users to undrestant the whole project in one document withoud need of deep knowlage.
3. Short Whitepaper for the Ordinary peapole.

here is coverage result:
```sh

Ran 18 tests for test/IXTokenGovernanceTest.t.sol:IXTokenGovernanceTest
[PASS] test_GetLatestAdapter_RevertsWhenUnset() (gas: 18403)
[PASS] test_MaxDepositView() (gas: 13364)
[PASS] test_MaxWithdraw_PhysicalCashBound() (gas: 204761)
[PASS] test_SetAdapterStatus_ApproveAndLatest() (gas: 230240)
[PASS] test_SetAdapterStatus_RevertsNoAllowance() (gas: 61792)
[PASS] test_SetAdapterStatus_RevertsWrongOwner() (gas: 800048)
[PASS] test_SetFoundation() (gas: 37144)
[PASS] test_SetFoundationFeeBps_RevertsAboveMax() (gas: 23231)
[PASS] test_SetKeeperParams() (gas: 47739)
[PASS] test_SetLiquidationThresholdBps() (gas: 33527)
[PASS] test_SetMaxLeverageBps() (gas: 32792)
[PASS] test_SetMinimumDepositAssetAmount() (gas: 33772)
[PASS] test_SetProtocolParameters_RevertsInsolventRatio() (gas: 24263)
[PASS] test_SetProtocolParameters_Valid() (gas: 40579)
[PASS] test_SetProtocolShareOfProfitBps() (gas: 33688)
[PASS] test_SetSanctionsList() (gas: 53684)
[PASS] test_UUPSUpgradeOnlyOwner() (gas: 9141351)
[PASS] test_ViewsAndPreviewFunctions() (gas: 281359)
Suite result: ok. 18 passed; 0 failed; 0 skipped; finished in 14.07ms (10.73ms CPU time)

Ran 17 tests for test/IXTokenFlashLoanTest.t.sol:IXTokenFlashLoanTest
[PASS] test_FlashFee_RevertsUnsupportedToken() (gas: 22220)
[PASS] test_FlashLoan_RevertsCallbackFailure() (gas: 119592)
[PASS] test_FlashLoan_RevertsInsufficientUnderlying() (gas: 44351)
[PASS] test_FlashLoan_RevertsInsufficientVaultTokenRepay() (gas: 194349)
[PASS] test_FlashLoan_RevertsReentrancyOnDeposit() (gas: 93844)
[PASS] test_FlashLoan_RevertsUnauthorized() (gas: 24987)
[PASS] test_FlashLoan_RevertsUnsupportedToken() (gas: 27692)
[PASS] test_FlashLoan_RevertsZeroAmount() (gas: 25744)
[PASS] test_SetLender_AndLendingFeeBps() (gas: 79255)
[PASS] test_SetLendingFeeBps_RevertsAboveMax() (gas: 24789)
[PASS] test_SetLpFarmingAndFeeBps() (gas: 127489)
[PASS] test_SetLpFarmingFeeBps_RevertsAboveMax() (gas: 23247)
[PASS] test_UnderlyingFlashLoan_HappyPath() (gas: 106840)
[PASS] test_UnderlyingFlashLoan_RevertsWhenRepayTooLow() (gas: 93170)
[PASS] test_UnderlyingFlashLoan_WithFee() (gas: 179597)
[PASS] test_VaultTokenFlashMint_HappyPath() (gas: 153727)
[PASS] test_VaultTokenFlashMint_WithFee_UsesPreFundedFixedBalance() (gas: 354047)
Suite result: ok. 17 passed; 0 failed; 0 skipped; finished in 17.98ms (9.78ms CPU time)

Ran 11 tests for test/IXTokenPermitAndWithdrawTest.t.sol:IXTokenPermitAndWithdrawTest
[PASS] test_DepositWithAffiliate_SkipsFixedAffiliate() (gas: 161898)
[PASS] test_FixedWithdraw_FullExitDustSweep() (gas: 247551)
[PASS] test_FixedWithdraw_Partial() (gas: 267900)
[PASS] test_FixedWithdraw_ProtocolDebtAmortization() (gas: 372375)
[PASS] test_FixedWithdraw_ProtocolDebtExhaustion() (gas: 402499)
[PASS] test_SetExcludeFromYield_NoOpWhenUnchanged() (gas: 71763)
[PASS] test_UnderlyingPermit_DepositWithAffiliateAndPermit() (gas: 11644580)
[PASS] test_UnderlyingPermit_DepositWithPermit() (gas: 11564772)
[PASS] test_VaultPermit_InvalidSignatureReverts() (gas: 182945)
[PASS] test_VaultPermit_SignedApprovalAndTransferFrom() (gas: 246479)
[PASS] test_VaultPermit_WithdrawBySpender() (gas: 286291)
Suite result: ok. 11 passed; 0 failed; 0 skipped; finished in 23.69ms (18.77ms CPU time)

Ran 24 tests for test/IXTokenSecurityTest.t.sol:IXTokenSecurityTest
[PASS] test_Penetration_ApproveRaceCondition() (gas: 153626)
[PASS] test_Penetration_CloseNonexistentPosition() (gas: 47320)
[PASS] test_Penetration_DecreaseAllowanceUnderflow() (gas: 155294)
[PASS] test_Penetration_DepositWithPermitPaths() (gas: 230224)
[PASS] test_Penetration_DoubleInitializeBlocked() (gas: 29341)
[PASS] test_Penetration_FixedToRebasingZeroSharesReverts() (gas: 10854772)
[PASS] test_Penetration_ForceCloseZeroKeeper() (gas: 426379)
[PASS] test_Penetration_IncreaseDecreaseAllowance() (gas: 179006)
[PASS] test_Penetration_MaxPositionsVolumeExceeded() (gas: 209926)
[PASS] test_Penetration_NonOwnerGovernanceBlocked() (gas: 50714)
[PASS] test_Penetration_PermitExpired() (gas: 128563)
[PASS] test_Penetration_ReentrancyOnTransfer() (gas: 201344)
[PASS] test_Penetration_RogueAdapterCannotCloseForeignPosition() (gas: 449911)
[PASS] test_Penetration_SanctionedDepositBlocked() (gas: 124834)
[PASS] test_Penetration_SanctionedKeeperForceClose() (gas: 450756)
[PASS] test_Penetration_SanctionedTransferBlocked() (gas: 158226)
[PASS] test_Penetration_SetExcludeFromYield_ThirdPartyBlocked() (gas: 27177)
[PASS] test_Penetration_TransferFixedDustSweep() (gas: 280777)
[PASS] test_Penetration_TransferFromWithAllowance() (gas: 199144)
[PASS] test_Penetration_TransferFromWithoutAllowance() (gas: 128527)
[PASS] test_Penetration_TransferRebasingDustSweep() (gas: 194202)
[PASS] test_Penetration_TransferToZeroAddress() (gas: 125745)
[PASS] test_Penetration_UnauthorizedOpenPosition() (gas: 185153)
[PASS] test_Penetration_WithdrawBySpenderWithAllowance() (gas: 254376)
Suite result: ok. 24 passed; 0 failed; 0 skipped; finished in 344.21ms (18.07ms CPU time)

Ran 7 tests for test/IXTokenAdvancedFuzzTest.t.sol:IXTokenAdvancedFuzzTest
[PASS] testFuzz_AffiliateDepositPhantomNavBounds(uint256,uint256,bool) (runs: 256, μ: 386603, ~: 357851)
[PASS] testFuzz_DepositAccountingAndFloorRounding(uint256,uint256,uint8) (runs: 256, μ: 367063, ~: 358077)
[PASS] testFuzz_DualLedgerMigrationInvariance(uint256,bool,uint8) (runs: 256, μ: 510673, ~: 473121)
[PASS] testFuzz_WithdrawAccountingAndCeilRounding(uint256,uint256,uint256) (runs: 256, μ: 378612, ~: 382972)
[PASS] testFuzz_WithdrawAmortizesProtocolDebt(uint256,uint256) (runs: 256, μ: 340077, ~: 342980)
[PASS] test_DepositBelowMinimumReverts() (gas: 118252)
[PASS] test_WithdrawRevertsWhenIdleCashInsufficient() (gas: 216353)
Suite result: ok. 7 passed; 0 failed; 0 skipped; finished in 344.23ms (1.19s CPU time)

Ran 25 tests for test/IXTokenPositionLifecycleTest.t.sol:IXTokenPositionLifecycleTest
[PASS] test_ClosePosition_BadDebtPath() (gas: 443630)
[PASS] test_ClosePosition_BreakevenPath() (gas: 451112)
[PASS] test_ClosePosition_InvalidOpFee() (gas: 410367)
[PASS] test_ClosePosition_LimitedLossPath() (gas: 456876)
[PASS] test_ClosePosition_PenaltyPath() (gas: 475452)
[PASS] test_ClosePosition_ProfitPath() (gas: 551140)
[PASS] test_ClosePosition_Profit_LpShareFallsBackToFoundation_WhenLockerUnset() (gas: 575651)
[PASS] test_ClosePosition_Profit_MintsLpShareToLocker_WhenLockerSet() (gas: 686223)
[PASS] test_ClosePosition_Profit_NoLpMint_WhenLpFeeBpsZero() (gas: 597663)
[PASS] test_ClosePosition_TraderFixedLedgerProfit() (gas: 570119)
[PASS] test_ForceClosePosition_InvalidOpFeeAfterKeeperSlice() (gas: 430105)
[PASS] test_ForceClosePosition_KeeperCappedAtGross() (gas: 484048)
[PASS] test_ForceClosePosition_KeeperCappedAtMaxReward() (gas: 507293)
[PASS] test_ForceClosePosition_KeeperMint() (gas: 494831)
[PASS] test_ForceClosePosition_ProfitWithFixedTrader() (gas: 614325)
[PASS] test_ForceClosePosition_WithOpFee() (gas: 561550)
[PASS] test_LiquidatePosition_BadDebtBranch() (gas: 472840)
[PASS] test_LiquidatePosition_LimitedLoss() (gas: 480394)
[PASS] test_LiquidatePosition_RevertsNotInRange() (gas: 413328)
[PASS] test_LiquidatePosition_WaivesExcessiveOpFee() (gas: 470425)
[PASS] test_OpenPosition_RevertsDuplicateId() (gas: 502790)
[PASS] test_OpenPosition_RevertsMaxLeverage() (gas: 190954)
[PASS] test_OpenPosition_RevertsMinimumVolume() (gas: 197202)
[PASS] test_SetLpFarming_ClearsLockerWithoutRevert() (gas: 100489)
[PASS] test_SetLpFarming_ForcesFixedLedger() (gas: 111392)
Suite result: ok. 25 passed; 0 failed; 0 skipped; finished in 5.13s (31.88ms CPU time)

Ran 6 tests for test/IXTokenAdvancedFuzzTest.t.sol:IXTokenAdvancedInvariantTest
[PASS] invariant_physicalDebtIsolation() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

[PASS] invariant_strategyBookedOnce() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

[PASS] invariant_systemSolvencyAndAssetCoherence() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

[PASS] invariant_totalAssetsDecomposition() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

[PASS] invariant_totalAssetsGteFixedLiabilities() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

[PASS] invariant_totalSupplyLteTotalAssets() (runs: 256, calls: 12800, reverts: 2129)

╭-------------------------+----------------------+-------+---------+----------╮
| Contract                | Selector             | Calls | Reverts | Discards |
+=============================================================================+
| IXTokenInvariantHandler | deposit              | 2101  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | depositWithAffiliate | 2110  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | setFees              | 2137  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | toggleLedger         | 2129  | 2129    | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | transfer             | 2189  | 0       | 0        |
|-------------------------+----------------------+-------+---------+----------|
| IXTokenInvariantHandler | withdraw             | 2134  | 0       | 0        |
╰-------------------------+----------------------+-------+---------+----------╯

Suite result: ok. 6 passed; 0 failed; 0 skipped; finished in 7.91s (30.78s CPU time)

Ran 7 test suites in 7.92s (13.79s CPU time): 108 tests passed, 0 failed, 0 skipped (108 total tests)

╭----------------------------------------------+-------------------+-------------------+-----------------+------------------╮
| File                                         | % Lines           | % Statements      | % Branches      | % Funcs          |
+===========================================================================================================================+
| script/Create2Deploy.sol                     | 0.00% (0/27)      | 0.00% (0/27)      | 0.00% (0/5)     | 0.00% (0/3)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| script/DeployIXTokenImpl.s.sol               | 0.00% (0/19)      | 0.00% (0/23)      | 0.00% (0/2)     | 0.00% (0/1)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| script/DeployIrisTemporaryOwnerCreate2.s.sol | 0.00% (0/21)      | 0.00% (0/24)      | 0.00% (0/3)     | 0.00% (0/2)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| script/DeployIrisXProxy.s.sol                | 0.00% (0/31)      | 0.00% (0/40)      | 0.00% (0/4)     | 0.00% (0/1)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| script/DeployScript.sol                      | 0.00% (0/4)       | 0.00% (0/2)       | 100.00% (0/0)   | 0.00% (0/2)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| script/helpers/Create2Script.sol             | 0.00% (0/81)      | 0.00% (0/72)      | 0.00% (0/13)    | 0.00% (0/12)     |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| src/IXToken.sol                              | 93.66% (517/552)  | 90.50% (543/600)  | 56.88% (91/160) | 100.00% (76/76)  |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| src/IrisTemporaryOwner.sol                   | 0.00% (0/67)      | 0.00% (0/60)      | 0.00% (0/14)    | 0.00% (0/13)     |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| src/proxy/IrisXProxy.sol                     | 0.00% (0/4)       | 0.00% (0/2)       | 100.00% (0/0)   | 0.00% (0/2)      |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/IXTokenAdvancedFuzzTest.t.sol           | 73.42% (58/79)    | 76.34% (71/93)    | 62.50% (5/8)    | 61.54% (8/13)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/helpers/IXTokenHarness.sol              | 100.00% (2/2)     | 100.00% (2/2)     | 100.00% (0/0)   | 100.00% (1/1)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/helpers/IXTokenTestBase.sol             | 95.45% (42/44)    | 93.02% (40/43)    | 0.00% (0/2)     | 100.00% (10/10)  |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/helpers/PermitTestHelpers.sol           | 100.00% (8/8)     | 100.00% (10/10)   | 100.00% (0/0)   | 100.00% (2/2)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/MockFlashBorrower.sol             | 92.31% (24/26)    | 95.45% (21/22)    | 75.00% (3/4)    | 80.00% (4/5)     |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/MockIrisAdapter.sol               | 89.47% (17/19)    | 100.00% (12/12)   | 100.00% (0/0)   | 75.00% (6/8)     |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/MockSanctionsList.sol             | 100.00% (4/4)     | 100.00% (2/2)     | 100.00% (0/0)   | 100.00% (2/2)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/MockUnderlying.sol                | 100.00% (4/4)     | 100.00% (2/2)     | 100.00% (0/0)   | 100.00% (2/2)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/MockUnderlyingPermit.sol          | 100.00% (4/4)     | 100.00% (2/2)     | 100.00% (0/0)   | 100.00% (2/2)    |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| test/mocks/ReentrancyAttacker.sol            | 28.57% (4/14)     | 18.18% (2/11)     | 0.00% (0/4)     | 40.00% (2/5)     |
|----------------------------------------------+-------------------+-------------------+-----------------+------------------|
| Total                                        | 67.72% (684/1010) | 67.40% (707/1049) | 45.21% (99/219) | 70.99% (115/162) |
╰----------------------------------------------+-------------------+-------------------+-----------------+------------------╯
```
