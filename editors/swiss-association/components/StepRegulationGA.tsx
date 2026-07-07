import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildRegulationGAMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

export function StepRegulationGA({ state, dispatch, onBack, onNext }: Props) {
  return (
    <Stage2DocumentStep
      title="Regulation of the General Assembly"
      description="Review and edit the Regulation of the General Assembly — the decision-making rules governing how your association votes and operates. The template is populated with your association's data. The regulations are approved at the founding meeting (step 7), not signed here — signing is an optional formality by one or two board members, not a requirement."
      documentType="REG_GA"
      dispatch={dispatch}
      documentState={state.regGaDocument}
      generateMarkdown={() => buildRegulationGAMarkdown(state)}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue →"
      nextRequiresSigned={true}
      lockedHint="The Regulation of the General Assembly is now locked and cannot be edited."
    />
  );
}
