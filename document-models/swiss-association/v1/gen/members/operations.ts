/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { SwissAssociationGlobalState } from "../types.js";
import type {
  AddMemberAction,
  RemoveMemberAction,
  SetMemberEthereumAddressAction,
  UpdateMemberAction,
} from "./actions.js";

export interface SwissAssociationMembersOperations {
  addMemberOperation: (
    state: SwissAssociationGlobalState,
    action: AddMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateMemberOperation: (
    state: SwissAssociationGlobalState,
    action: UpdateMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeMemberOperation: (
    state: SwissAssociationGlobalState,
    action: RemoveMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  setMemberEthereumAddressOperation: (
    state: SwissAssociationGlobalState,
    action: SetMemberEthereumAddressAction,
    dispatch?: SignalDispatch,
  ) => void;
}
