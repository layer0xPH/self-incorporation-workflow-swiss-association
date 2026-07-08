/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddMemberInput,
  RemoveMemberInput,
  SetMemberEthereumAddressInput,
  UpdateMemberInput,
} from "../types.js";

export type AddMemberAction = Action & {
  type: "ADD_MEMBER";
  input: AddMemberInput;
};
export type UpdateMemberAction = Action & {
  type: "UPDATE_MEMBER";
  input: UpdateMemberInput;
};
export type RemoveMemberAction = Action & {
  type: "REMOVE_MEMBER";
  input: RemoveMemberInput;
};
export type SetMemberEthereumAddressAction = Action & {
  type: "SET_MEMBER_ETHEREUM_ADDRESS";
  input: SetMemberEthereumAddressInput;
};

export type SwissAssociationMembersAction =
  | AddMemberAction
  | UpdateMemberAction
  | RemoveMemberAction
  | SetMemberEthereumAddressAction;
