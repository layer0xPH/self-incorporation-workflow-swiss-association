/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddMemberInputSchema,
  RemoveMemberInputSchema,
  SetMemberEthereumAddressInputSchema,
  UpdateMemberInputSchema,
} from "../schema/zod.js";
import type {
  AddMemberInput,
  RemoveMemberInput,
  SetMemberEthereumAddressInput,
  UpdateMemberInput,
} from "../types.js";
import type {
  AddMemberAction,
  RemoveMemberAction,
  SetMemberEthereumAddressAction,
  UpdateMemberAction,
} from "./actions.js";

export const addMember = (input: AddMemberInput) =>
  createAction<AddMemberAction>(
    "ADD_MEMBER",
    { ...input },
    undefined,
    AddMemberInputSchema,
    "global",
  );

export const updateMember = (input: UpdateMemberInput) =>
  createAction<UpdateMemberAction>(
    "UPDATE_MEMBER",
    { ...input },
    undefined,
    UpdateMemberInputSchema,
    "global",
  );

export const removeMember = (input: RemoveMemberInput) =>
  createAction<RemoveMemberAction>(
    "REMOVE_MEMBER",
    { ...input },
    undefined,
    RemoveMemberInputSchema,
    "global",
  );

export const setMemberEthereumAddress = (
  input: SetMemberEthereumAddressInput,
) =>
  createAction<SetMemberEthereumAddressAction>(
    "SET_MEMBER_ETHEREUM_ADDRESS",
    { ...input },
    undefined,
    SetMemberEthereumAddressInputSchema,
    "global",
  );
