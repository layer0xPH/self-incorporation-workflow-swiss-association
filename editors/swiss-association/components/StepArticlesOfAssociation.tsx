import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import type { SwissAssociationState } from "document-models/swiss-association";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildAoaMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onNext: () => void;
}

export function StepArticlesOfAssociation({
  state,
  dispatch,
  onBack,
  onNext,
}: Props) {
  return (
    <Stage2DocumentStep
      title="Articles of Association (AoA)"
      description="Assemble and review the Articles of Association — the main governing document of your association. The template is populated with the data from the previous steps; review and edit it here. The statutes are adopted by approval at the founding meeting (step 7), not signed here — signing is an optional formality by one or two board members, not a requirement."
      documentType="AOA"
      dispatch={dispatch}
      documentState={state.aoaDocument}
      generateMarkdown={() => buildAoaMarkdown(state)}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue to Founding Minutes →"
      nextRequiresSigned={true}
      signable={false}
      lockedHint="The AoA is now locked and cannot be edited."
    />
  );
}
