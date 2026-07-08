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
    doc = reducer(
      doc,
      signForIncorporation({ signedAt: "2026-07-08T10:00:00.000Z" }),
    );
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
