/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { SwissAssociationPHState } from "document-models/swiss-association/v1";

import { swissAssociationAssociationOperations } from "../src/reducers/association.js";
import { swissAssociationBoardOperations } from "../src/reducers/board.js";
import { swissAssociationContributorsOperations } from "../src/reducers/contributors.js";
import { swissAssociationDissolutionOperations } from "../src/reducers/dissolution.js";
import { swissAssociationDocumentsOperations } from "../src/reducers/documents.js";
import { swissAssociationIncorporationOperations } from "../src/reducers/incorporation.js";
import { swissAssociationMembersOperations } from "../src/reducers/members.js";
import { swissAssociationMultisigOperations } from "../src/reducers/multisig.js";
import { swissAssociationWorkflowOperations } from "../src/reducers/workflow.js";

import {
  AddBoardMemberInputSchema,
  AddContributorAgreementInputSchema,
  AddMemberInputSchema,
  AddNoteInputSchema,
  AdvancePhaseInputSchema,
  CopyFoundingMembersToBoardInputSchema,
  MarkContributorAgreementSignedInputSchema,
  MarkStage2DocumentSignedInputSchema,
  RemoveBoardMemberInputSchema,
  RemoveContributorAgreementInputSchema,
  RemoveMemberInputSchema,
  SetAssociationNameInputSchema,
  SetAssociationSeatInputSchema,
  SetContributorAgreementMarkdownInputSchema,
  SetDissolutionDetailsInputSchema,
  SetFiscalDetailsInputSchema,
  SetFoundingDateInputSchema,
  SetMeetingRolesInputSchema,
  SetMemberEthereumAddressInputSchema,
  SetMultisigConfigInputSchema,
  SetPurposeInputSchema,
  SetStage2DocumentMarkdownInputSchema,
  SignForIncorporationInputSchema,
  StartStage_2InputSchema,
  UpdateBoardMemberInputSchema,
  UpdateContributorAgreementInputSchema,
  UpdateMemberInputSchema,
  UpdatePhaseStatusInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<SwissAssociationPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_ASSOCIATION_NAME": {
      SetAssociationNameInputSchema().parse(action.input);

      swissAssociationAssociationOperations.setAssociationNameOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ASSOCIATION_SEAT": {
      SetAssociationSeatInputSchema().parse(action.input);

      swissAssociationAssociationOperations.setAssociationSeatOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FOUNDING_DATE": {
      SetFoundingDateInputSchema().parse(action.input);

      swissAssociationAssociationOperations.setFoundingDateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FISCAL_DETAILS": {
      SetFiscalDetailsInputSchema().parse(action.input);

      swissAssociationAssociationOperations.setFiscalDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PURPOSE": {
      SetPurposeInputSchema().parse(action.input);

      swissAssociationAssociationOperations.setPurposeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_MEMBER": {
      AddMemberInputSchema().parse(action.input);

      swissAssociationMembersOperations.addMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_MEMBER": {
      UpdateMemberInputSchema().parse(action.input);

      swissAssociationMembersOperations.updateMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_MEMBER": {
      RemoveMemberInputSchema().parse(action.input);

      swissAssociationMembersOperations.removeMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_MEMBER_ETHEREUM_ADDRESS": {
      SetMemberEthereumAddressInputSchema().parse(action.input);

      swissAssociationMembersOperations.setMemberEthereumAddressOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_BOARD_MEMBER": {
      AddBoardMemberInputSchema().parse(action.input);

      swissAssociationBoardOperations.addBoardMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_BOARD_MEMBER": {
      UpdateBoardMemberInputSchema().parse(action.input);

      swissAssociationBoardOperations.updateBoardMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_BOARD_MEMBER": {
      RemoveBoardMemberInputSchema().parse(action.input);

      swissAssociationBoardOperations.removeBoardMemberOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "COPY_FOUNDING_MEMBERS_TO_BOARD": {
      CopyFoundingMembersToBoardInputSchema().parse(action.input);

      swissAssociationBoardOperations.copyFoundingMembersToBoardOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_MEETING_ROLES": {
      SetMeetingRolesInputSchema().parse(action.input);

      swissAssociationBoardOperations.setMeetingRolesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_MULTISIG_CONFIG": {
      SetMultisigConfigInputSchema().parse(action.input);

      swissAssociationMultisigOperations.setMultisigConfigOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "START_STAGE_2": {
      StartStage_2InputSchema().parse(action.input);

      swissAssociationDocumentsOperations.startStage_2Operation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_STAGE2_DOCUMENT_MARKDOWN": {
      SetStage2DocumentMarkdownInputSchema().parse(action.input);

      swissAssociationDocumentsOperations.setStage2DocumentMarkdownOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_STAGE2_DOCUMENT_SIGNED": {
      MarkStage2DocumentSignedInputSchema().parse(action.input);

      swissAssociationDocumentsOperations.markStage2DocumentSignedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_PHASE_STATUS": {
      UpdatePhaseStatusInputSchema().parse(action.input);

      swissAssociationWorkflowOperations.updatePhaseStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADVANCE_PHASE": {
      AdvancePhaseInputSchema().parse(action.input);

      swissAssociationWorkflowOperations.advancePhaseOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_NOTE": {
      AddNoteInputSchema().parse(action.input);

      swissAssociationWorkflowOperations.addNoteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_DISSOLUTION_DETAILS": {
      SetDissolutionDetailsInputSchema().parse(action.input);

      swissAssociationDissolutionOperations.setDissolutionDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_CONTRIBUTOR_AGREEMENT": {
      AddContributorAgreementInputSchema().parse(action.input);

      swissAssociationContributorsOperations.addContributorAgreementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_CONTRIBUTOR_AGREEMENT": {
      UpdateContributorAgreementInputSchema().parse(action.input);

      swissAssociationContributorsOperations.updateContributorAgreementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_CONTRIBUTOR_AGREEMENT": {
      RemoveContributorAgreementInputSchema().parse(action.input);

      swissAssociationContributorsOperations.removeContributorAgreementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_CONTRIBUTOR_AGREEMENT_MARKDOWN": {
      SetContributorAgreementMarkdownInputSchema().parse(action.input);

      swissAssociationContributorsOperations.setContributorAgreementMarkdownOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_CONTRIBUTOR_AGREEMENT_SIGNED": {
      MarkContributorAgreementSignedInputSchema().parse(action.input);

      swissAssociationContributorsOperations.markContributorAgreementSignedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SIGN_FOR_INCORPORATION": {
      SignForIncorporationInputSchema().parse(action.input);

      swissAssociationIncorporationOperations.signForIncorporationOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<SwissAssociationPHState> =
  createReducer(stateReducer);
