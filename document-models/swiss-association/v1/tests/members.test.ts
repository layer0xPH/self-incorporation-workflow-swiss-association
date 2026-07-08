import { generateMock } from "document-model";
import {
  addMember,
  AddMemberInputSchema,
  isSwissAssociationDocument,
  reducer,
  removeMember,
  RemoveMemberInputSchema,
  setMemberEthereumAddress,
  updateMember,
  UpdateMemberInputSchema,
  utils,
} from "document-models/swiss-association/v1";
import { describe, expect, it } from "vitest";

describe("MembersOperations", () => {
  it("should handle addMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddMemberInputSchema());

    const updatedDocument = reducer(document, addMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_MEMBER");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateMemberInputSchema());

    const updatedDocument = reducer(document, updateMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_MEMBER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeMember operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveMemberInputSchema());

    const updatedDocument = reducer(document, removeMember(input));

    expect(isSwissAssociationDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_MEMBER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

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
        ethereumAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
    // same address, different letter-case — must still clash
    const updated = reducer(
      document,
      setMemberEthereumAddress({
        id: "m2",
        ethereumAddress: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      }),
    );
    expect(updated.operations.global[2].error).toBe(
      "Ethereum address is already assigned to another member",
    );
    expect(updated.state.global.members[1].ethereumAddress).toBeNull();
  });
});
