import type { SwissAssociationDocumentsOperations } from "document-models/swiss-association/v1";
import type {
  GeneratedStage2Document,
  Stage2DocumentType,
} from "../../gen/types.js";

function defaultStage2Document(): GeneratedStage2Document {
  return {
    markdown: null,
    isSigned: false,
    signedAt: null,
    isLocked: false,
  };
}

function getTargetDocument(
  state: {
    aoaDocument?: GeneratedStage2Document | null;
    foundingMinutesDocument?: GeneratedStage2Document | null;
    mpaDocument?: GeneratedStage2Document | null;
    regGaDocument?: GeneratedStage2Document | null;
    dissolutionResolutionDocument?: GeneratedStage2Document | null;
  },
  documentType: Stage2DocumentType,
) {
  if (documentType === "AOA") {
    if (!state.aoaDocument) state.aoaDocument = defaultStage2Document();
    return state.aoaDocument;
  }

  if (documentType === "FOUNDING_MINUTES") {
    if (!state.foundingMinutesDocument)
      state.foundingMinutesDocument = defaultStage2Document();
    return state.foundingMinutesDocument;
  }

  if (documentType === "REG_GA") {
    if (!state.regGaDocument) state.regGaDocument = defaultStage2Document();
    return state.regGaDocument;
  }

  if (documentType === "DISSOLUTION_RESOLUTION") {
    if (!state.dissolutionResolutionDocument)
      state.dissolutionResolutionDocument = defaultStage2Document();
    return state.dissolutionResolutionDocument;
  }

  if (!state.mpaDocument) state.mpaDocument = defaultStage2Document();
  return state.mpaDocument;
}

export const swissAssociationDocumentsOperations: SwissAssociationDocumentsOperations =
  {
    startStage_2Operation(state) {
      state.stage2Started = true;
    },
    setStage2DocumentMarkdownOperation(state, action) {
      const target = getTargetDocument(state, action.input.documentType);
      if (target.isLocked) return;
      target.markdown = action.input.markdown;
    },
    markStage2DocumentSignedOperation(state, action) {
      const target = getTargetDocument(state, action.input.documentType);
      if (target.isLocked) return;
      target.isSigned = true;
      target.signedAt = action.input.signedAt;
      target.isLocked = true;
      // NOTE: incorporation is NOT derived from marking documents signed.
      // The entity is incorporated only when every founding member has signed
      // via SIGN_FOR_INCORPORATION (see the incorporation module). The founding
      // documents (AoA, Reg GA, Founding Minutes) are executed by that signing,
      // not by this "mark as signed" flow — which remains for post-founding
      // documents (MPA, dissolution, contributor agreements).
    },
  };
