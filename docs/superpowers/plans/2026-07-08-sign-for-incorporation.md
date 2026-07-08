# SIGN_FOR_INCORPORATION Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a strict, signer-verified `SIGN_FOR_INCORPORATION` operation so each founding member signs incorporation with their own wallet, and the entity becomes incorporated only once every founding member has signed.

**Architecture:** The `swiss-association` v1 document model gains an `ethereumAddress` and an `incorporationSignedAt` field on each `AssociationMember`, a new `SET_MEMBER_ETHEREUM_ADDRESS` operation (members module), and a new `incorporation` module holding `SIGN_FOR_INCORPORATION`. The signer's identity is read from `action.context.signer.user.address` (never from input); when the last member signs, the reducer sets the existing `incorporationCompletedAt` timestamp.

**Tech Stack:** Powerhouse document-model, TypeScript (`nodenext`, strict), reactor-mcp for spec mutations, Vitest for reducer tests, oxlint.

**Design spec:** `docs/superpowers/specs/2026-07-08-sign-for-incorporation-design.md`

---

## Mechanism & Safety (read before starting)

This project has two codegen hazards proven in prior sessions:

1. **Codegen clobbers hand-written `src/` reducers** — it regenerates operation bodies but drops hand-added imports (e.g. `import { updatePersonalunionFlag }`).
2. **Codegen clobbers `v1/tests/*.test.ts`** — it overwrites them with default stubs.

Therefore this plan follows a strict order that never fights codegen:

- **Phase A (Tasks 1–4, spec + gen):** All spec mutations go through **reactor-mcp** (Vetra must be running: `ph vetra`). Per `CLAUDE.md`, always call `mcp__reactor-mcp__getDocumentModelSchema` with `type: "powerhouse/document-model"` before `addActions`. After every MCP batch, run `git status`; if any `src/reducers/*.ts` or `v1/tests/*.test.ts` show as modified, **restore them** (`git checkout -- <file>`) — we author those by hand in Phase B/C.
- **Phase B (src reducers):** Author the final `src/reducers/*.ts` files by hand. These are the execution source of truth.
- **Phase C (tests):** Write all tests **last**, after the final codegen run. Do **not** run codegen again after this point. If you must, re-run Phase C.
- **Phase D (QA):** `npm run tsc`, `npm run lint:fix`, `npm run test:coverage`; restore `powerhouse.manifest.json` if codegen stripped `editors`/`subgraphs`.

Each MCP-authored reducer **string** must contain **no import lines** (codegen auto-imports referenced errors). The hand-written `src/` file **does** include the imports at the top (matching the existing `members.ts` pattern).

Work happens on branch `feat/sign-for-incorporation` (already created).

---

## File Structure

- **Modify** `document-models/swiss-association/swiss-association.json` — via MCP: state schema, `ADD_MEMBER` schema/reducer, new `SET_MEMBER_ETHEREUM_ADDRESS` op, new `incorporation` module + `SIGN_FOR_INCORPORATION`, plus `ADD_BOARD_MEMBER` / `COPY_FOUNDING_MEMBERS_TO_BOARD` reducer strings.
- **Modify** `document-models/swiss-association/v1/src/reducers/members.ts` — `addMemberOperation` sets new fields; new `setMemberEthereumAddressOperation`.
- **Modify** `document-models/swiss-association/v1/src/reducers/board.ts` — set new fields to `null` in `addBoardMemberOperation` and `copyFoundingMembersToBoardOperation`.
- **Create** `document-models/swiss-association/v1/src/reducers/incorporation.ts` — `signForIncorporationOperation`.
- **Create** `document-models/swiss-association/v1/tests/incorporation.test.ts` — signer helper, scenario test, error branches, `MemberAlreadySignedError`.
- **Modify** `document-models/swiss-association/v1/tests/members.test.ts` — `SET_MEMBER_ETHEREUM_ADDRESS` tests + `ADD_MEMBER` with address.
- **Auto-generated (do not hand-edit):** everything under `document-models/swiss-association/v1/gen/`.

---

## Task 0: Signer-context propagation spike (GATING)

Proves the mechanism the whole design rests on — that a `context.signer.user.address` attached to an action survives the reducer wrapper into the stored operation — using only existing operations. **If this fails, STOP and reconsider the approach.**

**Files:**
- Create (temporary): `document-models/swiss-association/v1/tests/_spike.test.ts`

- [ ] **Step 1: Write the spike test**

```typescript
import { addNote, reducer, utils } from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("signer-context spike", () => {
  it("preserves action.context.signer.user.address into the stored operation", () => {
    const document = utils.createDocument();
    const action = {
      ...addNote({ note: "spike" }),
      context: {
        signer: {
          user: {
            address: "0xAbCdEf0000000000000000000000000000000001",
            networkId: "eip155:1",
            chainId: 1,
          },
          app: { name: "spike", key: "spike" },
          signatures: [] as never[],
        },
      },
    };

    const updated = reducer(document, action);
    const stored = updated.operations.global[0].action as typeof action;

    expect(stored.context?.signer?.user?.address).toBe(
      "0xAbCdEf0000000000000000000000000000000001",
    );
  });
});
```

- [ ] **Step 2: Run the spike**

Run: `npm run test -- tests/_spike.test.ts`
Expected: PASS. If FAIL (context is stripped), STOP — the reducer cannot rely on signer identity; escalate before continuing.

- [ ] **Step 3: Delete the scratch file**

```bash
rm document-models/swiss-association/v1/tests/_spike.test.ts
```

- [ ] **Step 4: Note the residual risk**

Task 0 proves in-process propagation only. Runtime persistence across a reactor restart is verified manually in Task 8. Do not claim the feature production-ready until Task 8 passes.

---

## Task 1: Add `ethereumAddress` + `incorporationSignedAt` to `AssociationMember`

**Files:**
- Modify (via MCP): state schema of `swiss-association`
- Modify: `document-models/swiss-association/v1/src/reducers/board.ts`
- (Regenerates `gen/`)

- [ ] **Step 1: Ensure Vetra is running**

Run: `pgrep -fl vetra` — if nothing, ask the user to run `ph vetra` in a separate terminal (do NOT start it yourself). Reconnect reactor-mcp.

- [ ] **Step 2: Read the document-model schema**

Call `mcp__reactor-mcp__getDocumentModelSchema` with `{ "type": "powerhouse/document-model" }`. Confirm the `SET_STATE_SCHEMA` input shape.

- [ ] **Step 3: Fetch the current state schema and add two fields**

Read the current global state schema (from the model document). In `type AssociationMember { ... }`, add the two fields immediately after `representative: String`:

```graphql
type AssociationMember {
  id: OID!
  type: MemberType!
  name: String!
  nationalityOrCountry: String!
  residenceOrCity: String!
  representative: String
  ethereumAddress: EthereumAddress
  incorporationSignedAt: DateTime
}
```

Dispatch `SET_STATE_SCHEMA` (scope `global`) with the **full** state schema SDL including this change. Leave `SET_INITIAL_STATE` unchanged (`members` is `[]`; the new fields live on member objects, not top-level state).

- [ ] **Step 4: Verify codegen updated the generated type**

Run: `grep -n "incorporationSignedAt" document-models/swiss-association/v1/gen/schema/types.ts`
Expected: a line `incorporationSignedAt: Maybe<Scalars["DateTime"]["output"]>;` inside `AssociationMember`. Also confirm `ethereumAddress: Maybe<...>` is present.

- [ ] **Step 5: Restore any clobbered hand-written files**

Run: `git status`
If `src/reducers/*.ts` or `v1/tests/*.test.ts` are modified, run `git checkout -- <each such file>`. Only `gen/` (and the spec `.json`) should remain changed.

- [ ] **Step 6: Fix the board member construction sites**

The generated `AssociationMember` fields are non-optional (nullable). Every object literal must now set them. Edit `board.ts`.

In `addBoardMemberOperation`, change the `boardMember` literal to:

```typescript
      const boardMember = {
        id: action.input.id,
        type: action.input.type,
        name: action.input.name,
        nationalityOrCountry: action.input.nationalityOrCountry,
        residenceOrCity: action.input.residenceOrCity,
        representative: action.input.representative || null,
        ethereumAddress: null,
        incorporationSignedAt: null,
      };
```

In `copyFoundingMembersToBoardOperation`, change the mapped literal to:

```typescript
      state.boardMembers = state.members.map((member) => ({
        id: member.id,
        type: member.type,
        name: member.name,
        nationalityOrCountry: member.nationalityOrCountry,
        residenceOrCity: member.residenceOrCity,
        representative: member.representative || null,
        ethereumAddress: null,
        incorporationSignedAt: null,
      }));
```

- [ ] **Step 7: Mirror the board reducer changes into the spec**

Via MCP `SET_OPERATION_REDUCER`, update the `ADD_BOARD_MEMBER` and `COPY_FOUNDING_MEMBERS_TO_BOARD` reducer strings to match Step 6 **without** the import lines (board.ts's `updatePersonalunionFlag` import stays only in src). Re-run Step 5's restore check afterward.

- [ ] **Step 8: Typecheck**

Run: `npm run tsc`
Expected: PASS (board literals now satisfy `AssociationMember`).

- [ ] **Step 9: Commit**

```bash
git add document-models/swiss-association/swiss-association.json document-models/swiss-association/v1/gen document-models/swiss-association/v1/src/reducers/board.ts document-models/swiss-association/v1/schema.graphql
git commit -m "feat: add ethereumAddress + incorporationSignedAt to AssociationMember"
```

---

## Task 2: `ADD_MEMBER` accepts an optional `ethereumAddress`

**Files:**
- Modify (via MCP): `ADD_MEMBER` operation schema + reducer
- Modify: `document-models/swiss-association/v1/src/reducers/members.ts`
- Test: `document-models/swiss-association/v1/tests/members.test.ts`

- [ ] **Step 1: Update `ADD_MEMBER` input schema via MCP**

Dispatch `SET_OPERATION_SCHEMA` for `ADD_MEMBER` with:

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

- [ ] **Step 2: Update the `ADD_MEMBER` reducer string via MCP**

Dispatch `SET_OPERATION_REDUCER` for `ADD_MEMBER` (no import lines):

```javascript
const member = {
  id: action.input.id,
  type: action.input.type,
  name: action.input.name,
  nationalityOrCountry: action.input.nationalityOrCountry,
  residenceOrCity: action.input.residenceOrCity,
  representative: action.input.representative || null,
  ethereumAddress: action.input.ethereumAddress || null,
  incorporationSignedAt: null,
};
state.members.push(member);
state.belowRecommendedMemberCount = state.members.length < 3;
updatePersonalunionFlag(state);
```

- [ ] **Step 3: Restore clobbered files, then hand-edit `members.ts`**

Run `git status`; `git checkout --` any clobbered `src`/`tests`. Then set `addMemberOperation` in `members.ts` to exactly the body from Step 2 **with** the existing top import `import { updatePersonalunionFlag } from "./personalunion.js";` retained.

- [ ] **Step 4: Write the failing test**

Add to `members.test.ts` inside `describe("MembersOperations", ...)`:

```typescript
  it("stores ethereumAddress on ADD_MEMBER and defaults incorporationSignedAt to null", () => {
    const document = utils.createDocument();
    const updated = reducer(
      document,
      addMember({
        id: "m1",
        type: "NATURAL_PERSON",
        name: "Alice",
        nationalityOrCountry: "CH",
        residenceOrCity: "Zug",
        ethereumAddress: "0x1111111111111111111111111111111111111111",
      }),
    );
    expect(updated.operations.global[0].error).toBeUndefined();
    expect(updated.state.global.members[0].ethereumAddress).toBe(
      "0x1111111111111111111111111111111111111111",
    );
    expect(updated.state.global.members[0].incorporationSignedAt).toBeNull();
  });
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- tests/members.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add document-models/swiss-association
git commit -m "feat: ADD_MEMBER accepts optional ethereumAddress"
```

---

## Task 3: `SET_MEMBER_ETHEREUM_ADDRESS` operation

**Files:**
- Modify (via MCP): members module — new operation + errors
- Modify: `document-models/swiss-association/v1/src/reducers/members.ts`
- Test: `document-models/swiss-association/v1/tests/members.test.ts`

- [ ] **Step 1: Add the operation via MCP**

Under the `members` module: `ADD_OPERATION` `SET_MEMBER_ETHEREUM_ADDRESS`, then `SET_OPERATION_SCHEMA`:

```graphql
input SetMemberEthereumAddressInput {
  id: OID!
  ethereumAddress: EthereumAddress!
}
```

- [ ] **Step 2: Add the three errors via MCP**

`ADD_OPERATION_ERROR` on `SET_MEMBER_ETHEREUM_ADDRESS` for each:

| errorCode | errorName |
|-----------|-----------|
| `MEMBER_NOT_FOUND_FOR_ADDRESS` | `MemberNotFoundForAddressError` |
| `DUPLICATE_ETHEREUM_ADDRESS` | `DuplicateEthereumAddressError` |
| `MEMBER_ALREADY_SIGNED` | `MemberAlreadySignedError` |

- [ ] **Step 3: Set the reducer string via MCP** (no imports)

```javascript
const idx = state.members.findIndex((m) => m.id === action.input.id);
if (idx === -1)
  throw new MemberNotFoundForAddressError(`Member ${action.input.id} not found`);
const member = state.members[idx];
if (member.incorporationSignedAt)
  throw new MemberAlreadySignedError(
    `Member ${action.input.id} has already signed and cannot change address`,
  );
const normalized = action.input.ethereumAddress.toLowerCase();
const clash = state.members.some(
  (m) =>
    m.id !== action.input.id &&
    m.ethereumAddress &&
    m.ethereumAddress.toLowerCase() === normalized,
);
if (clash)
  throw new DuplicateEthereumAddressError(
    `Ethereum address is already assigned to another member`,
  );
member.ethereumAddress = action.input.ethereumAddress;
```

- [ ] **Step 4: Restore clobbered files, then hand-write the src reducer**

Run `git status`; `git checkout --` any clobbered `src`/`tests`. Add the import to the top of `members.ts`:

```typescript
import {
  MemberNotFoundError,
} from "../../gen/members/error.js";
import {
  DuplicateEthereumAddressError,
  MemberAlreadySignedError,
  MemberNotFoundForAddressError,
} from "../../gen/members/error.js";
```

(Consolidate into one import from `"../../gen/members/error.js"` listing all four names alphabetically; the two-block form above is shown for clarity — collapse it.) Add `setMemberEthereumAddressOperation` to the operations object with exactly the Step 3 body.

- [ ] **Step 5: Write the tests**

Add to `members.test.ts`:

```typescript
  it("sets a member ethereum address", () => {
    let document = utils.createDocument();
    document = reducer(
      document,
      addMember({
        id: "m1",
        type: "NATURAL_PERSON",
        name: "Alice",
        nationalityOrCountry: "CH",
        residenceOrCity: "Zug",
      }),
    );
    const updated = reducer(
      document,
      setMemberEthereumAddress({
        id: "m1",
        ethereumAddress: "0x1111111111111111111111111111111111111111",
      }),
    );
    expect(updated.operations.global[1].error).toBeUndefined();
    expect(updated.state.global.members[0].ethereumAddress).toBe(
      "0x1111111111111111111111111111111111111111",
    );
  });

  it("rejects setting address on a missing member", () => {
    const document = utils.createDocument();
    const updated = reducer(
      document,
      setMemberEthereumAddress({
        id: "nope",
        ethereumAddress: "0x1111111111111111111111111111111111111111",
      }),
    );
    expect(updated.operations.global[0].error).toBe("Member nope not found");
  });

  it("rejects a duplicate address (case-insensitive)", () => {
    let document = utils.createDocument();
    document = reducer(
      document,
      addMember({
        id: "m1",
        type: "NATURAL_PERSON",
        name: "Alice",
        nationalityOrCountry: "CH",
        residenceOrCity: "Zug",
        ethereumAddress: "0x1111111111111111111111111111111111111111",
      }),
    );
    document = reducer(
      document,
      addMember({
        id: "m2",
        type: "NATURAL_PERSON",
        name: "Bob",
        nationalityOrCountry: "CH",
        residenceOrCity: "Bern",
      }),
    );
    const updated = reducer(
      document,
      setMemberEthereumAddress({
        id: "m2",
        ethereumAddress: "0X1111111111111111111111111111111111111111",
      }),
    );
    expect(updated.operations.global[2].error).toBe(
      "Ethereum address is already assigned to another member",
    );
    expect(updated.state.global.members[1].ethereumAddress).toBeNull();
  });
```

Add `setMemberEthereumAddress` and `SetMemberEthereumAddressInputSchema` to the import block from `document-models/swiss-association/v1`. (The `MemberAlreadySignedError` case is tested in Task 5, where the signer helper lives.)

- [ ] **Step 6: Run tests**

Run: `npm run test -- tests/members.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add document-models/swiss-association
git commit -m "feat: SET_MEMBER_ETHEREUM_ADDRESS with duplicate + already-signed guards"
```

---

## Task 4: `incorporation` module + `SIGN_FOR_INCORPORATION`

**Files:**
- Modify (via MCP): new `incorporation` module + operation + errors
- Create: `document-models/swiss-association/v1/src/reducers/incorporation.ts`

- [ ] **Step 1: Create the module and operation via MCP**

`ADD_MODULE` `incorporation`. Under it, `ADD_OPERATION` `SIGN_FOR_INCORPORATION`, then `SET_OPERATION_SCHEMA`:

```graphql
input SignForIncorporationInput {
  signedAt: DateTime!
}
```

- [ ] **Step 2: Add the five errors via MCP**

`ADD_OPERATION_ERROR` on `SIGN_FOR_INCORPORATION`:

| errorCode | errorName |
|-----------|-----------|
| `ALREADY_INCORPORATED` | `AlreadyIncorporatedError` |
| `MISSING_SIGNER` | `MissingSignerError` |
| `NO_FOUNDING_MEMBERS` | `NoFoundingMembersError` |
| `SIGNER_NOT_FOUNDING_MEMBER` | `SignerNotFoundingMemberError` |
| `ALREADY_SIGNED` | `AlreadySignedError` |

- [ ] **Step 3: Set the reducer string via MCP** (no imports)

```javascript
const signerAddress = action.context?.signer?.user?.address;
if (state.incorporationCompletedAt)
  throw new AlreadyIncorporatedError("Entity is already incorporated");
if (!signerAddress)
  throw new MissingSignerError("No signer address on the action");
if (state.members.length === 0)
  throw new NoFoundingMembersError("No founding members to sign for");
const normalized = signerAddress.toLowerCase();
const member = state.members.find(
  (m) => m.ethereumAddress && m.ethereumAddress.toLowerCase() === normalized,
);
if (!member)
  throw new SignerNotFoundingMemberError(
    "Signer address does not match any founding member",
  );
if (member.incorporationSignedAt)
  throw new AlreadySignedError("This founding member has already signed");
member.incorporationSignedAt = action.input.signedAt;
const allSigned = state.members.every((m) => m.incorporationSignedAt);
if (allSigned) {
  state.incorporationCompletedAt = action.input.signedAt;
}
```

- [ ] **Step 4: Verify codegen scaffolded the module**

Run: `ls document-models/swiss-association/v1/gen/incorporation/`
Expected: `actions.ts`, `error.ts`, `operations.ts`, `creators.ts` (or equivalent). Confirm `gen/reducer.ts` now references `swissAssociationIncorporationOperations`.

- [ ] **Step 5: Restore clobbered files, then hand-write the src reducer**

Run `git status`; `git checkout --` any clobbered `src`/`tests`. Create `document-models/swiss-association/v1/src/reducers/incorporation.ts`:

```typescript
import type { SwissAssociationIncorporationOperations } from "document-models/swiss-association/v1";
import {
  AlreadyIncorporatedError,
  AlreadySignedError,
  MissingSignerError,
  NoFoundingMembersError,
  SignerNotFoundingMemberError,
} from "../../gen/incorporation/error.js";

export const swissAssociationIncorporationOperations: SwissAssociationIncorporationOperations =
  {
    signForIncorporationOperation(state, action) {
      const signerAddress = action.context?.signer?.user?.address;
      if (state.incorporationCompletedAt)
        throw new AlreadyIncorporatedError("Entity is already incorporated");
      if (!signerAddress)
        throw new MissingSignerError("No signer address on the action");
      if (state.members.length === 0)
        throw new NoFoundingMembersError("No founding members to sign for");
      const normalized = signerAddress.toLowerCase();
      const member = state.members.find(
        (m) =>
          m.ethereumAddress && m.ethereumAddress.toLowerCase() === normalized,
      );
      if (!member)
        throw new SignerNotFoundingMemberError(
          "Signer address does not match any founding member",
        );
      if (member.incorporationSignedAt)
        throw new AlreadySignedError("This founding member has already signed");
      member.incorporationSignedAt = action.input.signedAt;
      const allSigned = state.members.every((m) => m.incorporationSignedAt);
      if (allSigned) {
        state.incorporationCompletedAt = action.input.signedAt;
      }
    },
  };
```

- [ ] **Step 6: Confirm the module type name**

Run: `grep -rn "IncorporationOperations" document-models/swiss-association/v1/gen/incorporation/operations.ts`
Expected: `export interface SwissAssociationIncorporationOperations`. If the generated name differs (e.g. missing the `SwissAssociation` prefix), update the import and export in Step 5 to match exactly.

- [ ] **Step 7: Typecheck**

Run: `npm run tsc`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add document-models/swiss-association
git commit -m "feat: incorporation module + SIGN_FOR_INCORPORATION reducer"
```

---

## Task 5: Tests for `SIGN_FOR_INCORPORATION` (scenario + all error branches)

**Files:**
- Create: `document-models/swiss-association/v1/tests/incorporation.test.ts`

- [ ] **Step 1: Write the full test file**

```typescript
import {
  addMember,
  reducer,
  setMemberEthereumAddress,
  signForIncorporation,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

const ADDR1 = "0x1111111111111111111111111111111111111111";
const ADDR2 = "0x2222222222222222222222222222222222222222";
const ADDR3 = "0x3333333333333333333333333333333333333333";

function signAs(address: string, signedAt: string) {
  return {
    ...signForIncorporation({ signedAt }),
    context: {
      signer: {
        user: { address, networkId: "eip155:1", chainId: 1 },
        app: { name: "test", key: "test" },
        signatures: [] as never[],
      },
    },
  };
}

function memberInput(id: string, name: string, ethereumAddress?: string) {
  return {
    id,
    type: "NATURAL_PERSON" as const,
    name,
    nationalityOrCountry: "CH",
    residenceOrCity: "Zug",
    ...(ethereumAddress ? { ethereumAddress } : {}),
  };
}

describe("IncorporationOperations", () => {
  it("incorporates only after every founding member has signed", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    doc = reducer(doc, addMember(memberInput("m2", "Bob", ADDR2)));
    doc = reducer(doc, addMember(memberInput("m3", "Carol", ADDR3)));

    // first signer — case-insensitive match against stored lowercase address
    doc = reducer(doc, signAs(ADDR1.toUpperCase(), "2026-07-08T10:00:00.000Z"));
    expect(doc.operations.global[3].error).toBeUndefined();
    expect(doc.state.global.incorporationCompletedAt).toBeNull();
    expect(doc.state.global.members[0].incorporationSignedAt).toBe(
      "2026-07-08T10:00:00.000Z",
    );

    // second signer
    doc = reducer(doc, signAs(ADDR2, "2026-07-08T11:00:00.000Z"));
    expect(doc.operations.global[4].error).toBeUndefined();
    expect(doc.state.global.incorporationCompletedAt).toBeNull();

    // final signer flips incorporation
    doc = reducer(doc, signAs(ADDR3, "2026-07-08T12:00:00.000Z"));
    expect(doc.operations.global[5].error).toBeUndefined();
    expect(doc.state.global.incorporationCompletedAt).toBe(
      "2026-07-08T12:00:00.000Z",
    );
  });

  it("rejects when there is no signer on the action", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    // no context attached
    doc = reducer(doc, signForIncorporation({ signedAt: "2026-07-08T10:00:00.000Z" }));
    expect(doc.operations.global[1].error).toBe(
      "No signer address on the action",
    );
    expect(doc.state.global.members[0].incorporationSignedAt).toBeNull();
  });

  it("rejects when there are no founding members", () => {
    const doc = utils.createDocument();
    const updated = reducer(doc, signAs(ADDR1, "2026-07-08T10:00:00.000Z"));
    expect(updated.operations.global[0].error).toBe(
      "No founding members to sign for",
    );
  });

  it("rejects a signer that matches no founding member", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    doc = reducer(doc, signAs(ADDR2, "2026-07-08T10:00:00.000Z"));
    expect(doc.operations.global[1].error).toBe(
      "Signer address does not match any founding member",
    );
  });

  it("rejects a second signature from the same member", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    doc = reducer(doc, addMember(memberInput("m2", "Bob", ADDR2)));
    doc = reducer(doc, signAs(ADDR1, "2026-07-08T10:00:00.000Z"));
    doc = reducer(doc, signAs(ADDR1, "2026-07-08T11:00:00.000Z"));
    expect(doc.operations.global[3].error).toBe(
      "This founding member has already signed",
    );
    expect(doc.state.global.incorporationCompletedAt).toBeNull();
  });

  it("rejects signing once already incorporated", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    doc = reducer(doc, signAs(ADDR1, "2026-07-08T10:00:00.000Z"));
    expect(doc.state.global.incorporationCompletedAt).toBe(
      "2026-07-08T10:00:00.000Z",
    );
    doc = reducer(doc, signAs(ADDR1, "2026-07-08T11:00:00.000Z"));
    expect(doc.operations.global[2].error).toBe(
      "Entity is already incorporated",
    );
  });

  it("rejects changing an address after that member has signed", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addMember(memberInput("m1", "Alice", ADDR1)));
    doc = reducer(doc, addMember(memberInput("m2", "Bob", ADDR2)));
    // m1 signs (not incorporated yet: 1 of 2)
    doc = reducer(doc, signAs(ADDR1, "2026-07-08T10:00:00.000Z"));
    // attempt to change m1's address
    doc = reducer(
      doc,
      setMemberEthereumAddress({ id: "m1", ethereumAddress: ADDR3 }),
    );
    expect(doc.operations.global[3].error).toBe(
      "Member m1 has already signed and cannot change address",
    );
    expect(doc.state.global.members[0].ethereumAddress).toBe(ADDR1);
  });
});
```

- [ ] **Step 2: Run the incorporation tests**

Run: `npm run test -- tests/incorporation.test.ts`
Expected: PASS (7 tests). If the scenario test's first `signAs` shows an error at index 3, the spike's assumption broke — revisit Task 0.

- [ ] **Step 3: Commit**

```bash
git add document-models/swiss-association/v1/tests/incorporation.test.ts
git commit -m "test: SIGN_FOR_INCORPORATION scenario + error branches"
```

---

## Task 6: Full QA and coverage

**Files:** none (verification only), plus `powerhouse.manifest.json` if stripped.

- [ ] **Step 1: Restore the manifest if codegen stripped it**

Run: `git diff powerhouse.manifest.json`
If `editors` or `subgraphs` were emptied, run `git checkout -- powerhouse.manifest.json`.

- [ ] **Step 2: Typecheck**

Run: `npm run tsc`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `npm run lint:fix`
Expected: no remaining errors.

- [ ] **Step 4: Coverage**

Run: `npm run test:coverage`
Expected: PASS, with `document-models/swiss-association` reducers at ≥95% lines/branches/functions/statements. If `incorporation.ts` or the new `members.ts` branches drop below 95%, add targeted tests (each error is a branch) until restored. Do NOT lower the threshold.

- [ ] **Step 5: Commit any coverage-driven test additions**

```bash
git add document-models/swiss-association/v1/tests
git commit -m "test: restore reducer coverage to >=95%"
```

---

## Task 7: Final review commit

- [ ] **Step 1: Confirm the working tree contains only intended changes**

Run: `git status` and `git diff --stat main`
Expected: changes only under `document-models/swiss-association/**`, `docs/superpowers/**`, and (if it was already present) `package-lock.json` untouched by these tasks.

- [ ] **Step 2: Push the branch (only if the user asks)**

Do not push unless the user requests it.

---

## Task 8: Runtime signer-persistence verification (MANUAL — gating before production use)

Task 0 proved in-process propagation; this proves the reactor persists `context.signer` across a real signed dispatch so replay stays deterministic.

- [ ] **Step 1:** In Vetra Studio / Connect, create a `swiss-association` document, add ≥2 founding members with their real wallet addresses.
- [ ] **Step 2:** Sign in with a wallet matching one member and dispatch `SIGN_FOR_INCORPORATION`.
- [ ] **Step 3:** Inspect the stored operation (via reactor-mcp `getDocument` or the operations view) and confirm `operations.global[i].action.context.signer.user.address` is present and equals the wallet address.
- [ ] **Step 4:** Reload / rebuild the document and confirm the signature and any `incorporationCompletedAt` value are stable.
- [ ] **Step 5:** If the signer context is absent from the stored operation, STOP — the design's determinism assumption fails; escalate to reconsider (e.g. carrying the address in input under a separate verification scheme).

---

## Self-Review

- **Spec coverage:** §2 identity model → Tasks 0, 4, 8. §3 state fields → Task 1. §4.1 ADD_MEMBER → Task 2. §4.2 SET_MEMBER_ETHEREUM_ADDRESS → Task 3. §4.3 SIGN_FOR_INCORPORATION → Task 4. §5 errors → Tasks 3, 4 (defined) + 5 (tested). §6 testing → Tasks 5, 6. §7 sequencing → Mechanism & Safety + phased tasks. §8 assumptions → Task 0/8 validate the one open risk. §9 out-of-scope respected (no editor, no status enum, no phase gating, no ADD_MEMBER duplicate guard).
- **Type consistency:** `signForIncorporationOperation`, `swissAssociationIncorporationOperations`, `SwissAssociationIncorporationOperations`, `setMemberEthereumAddress`, `SetMemberEthereumAddressInput`, error names, and field names (`ethereumAddress`, `incorporationSignedAt`, `incorporationCompletedAt`) are used identically across tasks. Task 6 flags the generated module-type name as the one thing to confirm against codegen.
- **Placeholder scan:** no TBD/TODO; all code and commands are concrete.
