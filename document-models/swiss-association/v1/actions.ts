/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  swissAssociationAssociationActions,
  swissAssociationBoardActions,
  swissAssociationContributorsActions,
  swissAssociationDissolutionActions,
  swissAssociationDocumentsActions,
  swissAssociationIncorporationActions,
  swissAssociationMembersActions,
  swissAssociationMultisigActions,
  swissAssociationWorkflowActions,
} from "./gen/creators.js";

/** Actions for the SwissAssociation document model */

export const actions = {
  ...baseActions,
  ...swissAssociationAssociationActions,
  ...swissAssociationMembersActions,
  ...swissAssociationBoardActions,
  ...swissAssociationMultisigActions,
  ...swissAssociationDocumentsActions,
  ...swissAssociationWorkflowActions,
  ...swissAssociationDissolutionActions,
  ...swissAssociationContributorsActions,
  ...swissAssociationIncorporationActions,
};
