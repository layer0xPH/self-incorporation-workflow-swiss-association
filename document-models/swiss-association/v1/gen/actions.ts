/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { SwissAssociationAssociationAction } from "./association/actions.js";
import type { SwissAssociationBoardAction } from "./board/actions.js";
import type { SwissAssociationContributorsAction } from "./contributors/actions.js";
import type { SwissAssociationDissolutionAction } from "./dissolution/actions.js";
import type { SwissAssociationDocumentsAction } from "./documents/actions.js";
import type { SwissAssociationIncorporationAction } from "./incorporation/actions.js";
import type { SwissAssociationMembersAction } from "./members/actions.js";
import type { SwissAssociationMultisigAction } from "./multisig/actions.js";
import type { SwissAssociationWorkflowAction } from "./workflow/actions.js";

export * from "./association/actions.js";
export * from "./board/actions.js";
export * from "./contributors/actions.js";
export * from "./dissolution/actions.js";
export * from "./documents/actions.js";
export * from "./incorporation/actions.js";
export * from "./members/actions.js";
export * from "./multisig/actions.js";
export * from "./workflow/actions.js";

export type SwissAssociationAction =
  | SwissAssociationAssociationAction
  | SwissAssociationMembersAction
  | SwissAssociationBoardAction
  | SwissAssociationMultisigAction
  | SwissAssociationDocumentsAction
  | SwissAssociationWorkflowAction
  | SwissAssociationDissolutionAction
  | SwissAssociationContributorsAction
  | SwissAssociationIncorporationAction;
