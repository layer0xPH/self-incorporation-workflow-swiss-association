# SIGN_FOR_INCORPORATION — Design Spec

- **Date:** 2026-07-08
- **Document model:** `swiss-association` (v1)
- **Status:** Approved design, ready for implementation planning

## 1. Intent

Add a special document operation, `SIGN_FOR_INCORPORATION`, that acts as a
cryptographic roll-call for founding members. Each founding member signs the
incorporation with their own wallet. The entity becomes "incorporated" only
once **every** founding member has signed.

The operation is maximally strict. A signature counts **only** when:

1. The submitting user's Ethereum address (taken from the action's signer
   context, not from user-provided input) **exactly matches** (case-insensitive)
   the registered Ethereum address of a founding member, **and**
2. that founding member has **not previously signed**.

Every other case is rejected as a named error — never silently ignored. When,
and only when, the last outstanding founding member signs, the document flips to
"entity incorporated."

## 2. Security model (the crux)

The operation input carries **no address**. The signer's identity is read
exclusively from `action.context?.signer?.user?.address` — the cryptographically
signed action context, which the submitting user cannot forge. A member proves
who they are by signing the action with their wallet, not by typing an address.

Confirmed during research:

- `ActionContext.signer` is `{ user: { address, networkId, chainId }, app, signatures }`.
- The generated reducer wrapper passes the full action (`action as any`) into
  each operation, so `context` survives into the reducer.

### Open risk (must be validated early in implementation)

Deterministic replay depends on the signer `context` being **persisted with the
stored operation**. Powerhouse signs and stores operations, so this should hold,
but this signer-context path is unused in the project today. The implementation
must begin with a spike: dispatch one real signed action and confirm that
`action.context.signer.user.address` survives a document rebuild/replay. If it
does not, the reducer is non-deterministic and the approach must be reconsidered
before anything is built on it. **Confidence: moderate.**

## 3. State schema changes

`AssociationMember` gains two optional fields. They remain `null` for
`boardMembers` (which reuse this type), which is harmless.

```graphql
type AssociationMember {
  id: OID!
  type: MemberType!
  name: String!
  nationalityOrCountry: String!
  residenceOrCity: String!
  representative: String
  ethereumAddress: EthereumAddress    # null until assigned
  incorporationSignedAt: DateTime     # null until that member signs
}
```

`incorporationCompletedAt: DateTime` (existing, initial value `null`) is the
incorporation status flag. Non-null ⇒ entity incorporated. Set exactly once, on
the final signature. No new status enum is introduced.

The `EthereumAddress` scalar already exists in the schema (declared, currently
unused) and is reused.

## 4. Operations

### 4.1 `ADD_MEMBER` (members module — modified)

Add an optional `ethereumAddress` to the input:

```graphql
input AddMemberInput {
  id: OID!
  type: MemberType!
  name: String!
  nationalityOrCountry: String!
  residenceOrCity: String!
  representative: String
  ethereumAddress: EthereumAddress
}
```

Reducer: store `ethereumAddress ?? null` and `incorporationSignedAt: null` on the
new member. (Existing duplicate-address guard from
`SET_MEMBER_ETHEREUM_ADDRESS` is **not** enforced here for the MVP; addresses
added via `ADD_MEMBER` are trusted input. See Assumptions.)

### 4.2 `SET_MEMBER_ETHEREUM_ADDRESS` (members module — new)

```graphql
input SetMemberEthereumAddressInput {
  id: OID!
  ethereumAddress: EthereumAddress!
}
```

Assigns or updates a member's Ethereum address. Rejects if:

- the member id does not exist → `MemberNotFoundForAddressError`
- another member already holds that address (case-insensitive) →
  `DuplicateEthereumAddressError` (prevents the duplicate-address deadlock in §4.3)
- that member has already signed → `MemberAlreadySignedError` (you cannot change
  the identity you signed with)

### 4.3 `SIGN_FOR_INCORPORATION` (new `incorporation` module)

```graphql
input SignForIncorporationInput {
  signedAt: DateTime!
}
```

Reducer logic, in strict order:

```
1. incorporationCompletedAt already set?          -> AlreadyIncorporatedError
2. no signer on the action?                        -> MissingSignerError
3. members array empty?                            -> NoFoundingMembersError
4. no member whose address == signer (lowercased)? -> SignerNotFoundingMemberError
5. that member.incorporationSignedAt already set?  -> AlreadySignedError
6. member.incorporationSignedAt = input.signedAt
7. if EVERY member now has incorporationSignedAt:
       incorporationCompletedAt = input.signedAt
```

Notes:

- Address comparison is **case-insensitive** (lowercase both sides; EIP-55
  checksummed and lowercased forms are the same address but not byte-equal).
- A member with no `ethereumAddress` can never satisfy step 7, so incorporation
  genuinely requires every founding member to have both an address and a
  signature.
- The signer address is read from context (`action.context?.signer?.user?.address`),
  never from input.

## 5. Error catalogue

Each error is a distinct branch requiring explicit test coverage. Error names
must be globally unique within the model.

**SIGN_FOR_INCORPORATION**

| Code | Name | Condition |
|------|------|-----------|
| `ALREADY_INCORPORATED` | `AlreadyIncorporatedError` | `incorporationCompletedAt` is already set |
| `MISSING_SIGNER` | `MissingSignerError` | no `action.context.signer.user.address` |
| `NO_FOUNDING_MEMBERS` | `NoFoundingMembersError` | `members` is empty |
| `SIGNER_NOT_FOUNDING_MEMBER` | `SignerNotFoundingMemberError` | no member address matches the signer |
| `ALREADY_SIGNED` | `AlreadySignedError` | matched member has already signed |

**SET_MEMBER_ETHEREUM_ADDRESS**

| Code | Name | Condition |
|------|------|-----------|
| `MEMBER_NOT_FOUND_FOR_ADDRESS` | `MemberNotFoundForAddressError` | member id not found |
| `DUPLICATE_ETHEREUM_ADDRESS` | `DuplicateEthereumAddressError` | address already held by another member |
| `MEMBER_ALREADY_SIGNED` | `MemberAlreadySignedError` | member has already signed |

## 6. Testing

Reducers are pure synchronous functions and must stay ≥95% coverage (lines,
branches, functions, statements); push toward 100%.

- **Scenario test (happy path):** create document → add 3 members → set 3
  addresses → sign as member 1 (assert `incorporationCompletedAt` still `null`)
  → sign as member 2 (still `null`) → sign as member 3 (now set to the 3rd
  `signedAt`).
- **Error branches:** one test per error above, using the operation-index
  pattern (`updatedDocument.operations.global[i].error`) — never `.toThrow()`.
  Assert state is unchanged on error.
- Signer context is supplied in tests by constructing the action with a
  `context.signer.user.address` value.

## 7. Implementation sequencing (project-specific)

All model changes go through both the MCP spec **and** the hand-written `src/`
reducers, per the project's two-step rule. Because MCP regeneration clobbers
hand-written `src/` reducers on this project:

1. Run the early determinism spike (§2) first.
2. Apply schema/operation/error changes via MCP (or edit
   `swiss-association.json` and run `ph generate` with Vetra **stopped** — a
   running `ph vetra --watch` reverts edits mid-flight).
3. Re-apply / write the hand-written reducers: `src/reducers/members.ts`
   (ADD_MEMBER + SET_MEMBER_ETHEREUM_ADDRESS) and new
   `src/reducers/incorporation.ts` (SIGN_FOR_INCORPORATION).
4. Add tests under `v1/tests/`.
5. Run `npm run tsc`, `npm run lint:fix`, `npm run test:coverage`.

## 8. Assumptions (checked)

1. Submitting user identity is at `action.context?.signer?.user?.address` — **confirmed**.
2. Founding members = the `members` array (not `boardMembers`) — **confirmed**.
3. `AssociationMember` had no address field — **confirmed**, we add one.
4. `EthereumAddress` scalar exists and is reused — **confirmed**.
5. No status enum exists; `incorporationCompletedAt` is the flag — **confirmed**.
6. Timestamp must come from input (`signedAt`) for reducer purity — **matches project rules**.
7. Addresses compared case-insensitively — standard; normalize to lowercase.
8. Signer context persists into replayed operations — **moderate confidence; validated by the §2 spike**.

## 9. Out of scope (YAGNI)

- No phase-gating (e.g. requiring AoA/founding minutes signed first) — not requested.
- No explicit `IncorporationStatus` enum — the timestamp suffices.
- No duplicate-address enforcement on `ADD_MEMBER` (only on the dedicated set op).
- No auth/login work — Renown/wallet login is part of the generic Connect
  interface (see §10).

## 10. Editor / UI

The `swiss-association` editor is a step-based wizard (`editors/swiss-association/`).
This feature adds address capture, a signing roll-call step, and wiring. It does
**not** add any login/auth UI — the logged-in identity comes from Connect.

### 10.1 Identity in the UI (how it works)

- The logged-in user's Ethereum address is read via `useUser()?.address`
  (equivalently `useRenownAuth().address`) from `@powerhousedao/reactor-browser`.
  This is the Renown/`did:pkh` identity provided by the generic Connect shell.
- **The editor does not sign manually.** Dispatch stays plain:
  `dispatch(actions.signForIncorporation({ signedAt: new Date().toISOString() }))`.
  Connect's reactor client is configured with the logged-in user's signer and
  automatically attaches `action.context.signer.user.address` — the exact field
  the reducer reads. **This runtime behaviour is the §2 open risk**; the UI and
  the reducer share the same assumption and are both validated by the runtime
  spike (design §2 / plan Task 8). `signedAt` is UI-generated (as with the
  existing `START_STAGE_2` dispatch), which is fine — the reducer is still pure
  because it consumes the value from input.

### 10.2 Address capture — `StepMemberRegistry.tsx`

Add an "Ethereum address" field to the member add/edit form. New members pass it
through the extended `ADD_MEMBER`; edits to an existing member dispatch
`SET_MEMBER_ETHEREUM_ADDRESS`. The member list shows each address truncated
(`0x1234…abcd`) with a "no wallet set" marker when absent (such a member can
never complete incorporation).

### 10.3 New signing step — `StepIncorporationSigning.tsx`

A dedicated numbered wizard step placed **after the Founding Meeting step and
before the M1 milestone**. Behaviour is adjusted to the logged-in user:

- Reads `useUser()?.address`, normalizes to lowercase, finds the matching
  founding member.
- **Roster:** every founding member with a ✓ signed (+ timestamp) or ⏳ pending
  badge; the logged-in user's own row is highlighted ("This is you").
- **Progress line:** "N of M founding members have signed."
- **Single state-dependent primary action:**

| Logged-in user's situation | UI |
|---|---|
| Address matches an unsigned member, not yet incorporated | "Sign for Incorporation" button enabled |
| Address matches a member who already signed | Button hidden; "✓ You signed on {date}" |
| Address matches no founding member | Button disabled; "Your wallet isn't among the founding members" |
| Not logged in / no address | Button disabled; "Connect your wallet to sign" |
| All members signed | Button gone; "Entity incorporated on {incorporationCompletedAt}" banner |

The button dispatches `signForIncorporation({ signedAt })` and relies on the
reducer for all enforcement — the UI's disabled states are guidance, not the
security boundary.

### 10.4 Wiring

- Register the step in `editor.tsx` (new `case` in `renderStep`, new step index
  after the Founding Meeting) and thread the `onNext`/`onBack` navigation.
- Add `incorporationSigned: !!state.incorporationCompletedAt` to `stageProgress`
  and surface it in `ProgressSidebar` / `stages.ts` following the existing
  pattern (including `isStepLocked` gating: the step unlocks once the founding
  meeting is done).
