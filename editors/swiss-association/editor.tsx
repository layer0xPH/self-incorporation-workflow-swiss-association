import { useState } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import {
  actions,
  useSelectedSwissAssociationDocument,
} from "document-models/swiss-association";
import { WizardLayout } from "./components/WizardLayout.js";
import { StepWelcome } from "./components/StepWelcome.js";
import { StepSuitability } from "./components/StepSuitability.js";
import { ReadOnlyStepWrapper } from "./components/ReadOnlyStepWrapper.js";
import { StepAssociationDetails } from "./components/StepAssociationDetails.js";
import { StepMemberRegistry } from "./components/StepMemberRegistry.js";
import { StepBoardSetup } from "./components/StepBoardSetup.js";
import { StepFoundingMeeting } from "./components/StepFoundingMeeting.js";
import { TreasuryGateway } from "./components/TreasuryGateway.js";
import { MilestonePage } from "./components/MilestonePage.js";
import { StepFinalArchive } from "./components/StepFinalArchive.js";
import { StepMultisigConfig } from "./components/StepMultisigConfig.js";
import { StepArticlesOfAssociation } from "./components/StepArticlesOfAssociation.js";
import { StepMultisigParticipationAgreement } from "./components/StepMultisigParticipationAgreement.js";
import { StepContributorAgreements } from "./components/StepContributorAgreements.js";
import { StepRegulationGA } from "./components/StepRegulationGA.js";
import { StepDissolutionDetails } from "./components/StepDissolutionDetails.js";
import { StepDissolutionResolution } from "./components/StepDissolutionResolution.js";
import type { StageProgress } from "./components/ProgressSidebar.js";
import { isStepLocked } from "./components/stages.js";

export default function Editor() {
  const [document, dispatch] = useSelectedSwissAssociationDocument();
  const [currentStep, setCurrentStep] = useState(0);
  // Where the archive returns to — set when it's opened from any step.
  const [archiveReturnStep, setArchiveReturnStep] = useState(0);
  // The gateway's no-treasury choice (local, like the gateway itself). Drives
  // the enriched "deliberately minimal" capability view.
  const [noTreasury, setNoTreasury] = useState(false);

  if (!document || !dispatch) {
    return (
      <div style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>
        Select a SwissAssociation document to open this editor.
      </div>
    );
  }

  const state = document.state.global;
  const safeDispatch = dispatch;

  // Optional Suitability side-screen, reachable from Welcome (not a numbered step).
  const SUITABILITY_STEP = -1;
  // Post-founding treasury gateway — its own page, reached from the founding
  // step once M1 is signed. Not a numbered sidebar step.
  const GATEWAY_STEP = -2;
  // Dedicated M1 milestone screen, shown once between founding and the gateway.
  const MILESTONE_STEP = -3;
  // Executed-documents archive — reachable from any step and the milestone page.
  const ARCHIVE_STEP = -4;

  // Open the archive, remembering where to return (unless already there).
  function openArchive() {
    if (currentStep !== ARCHIVE_STEP) setArchiveReturnStep(currentStep);
    setCurrentStep(ARCHIVE_STEP);
  }

  const stageProgress: StageProgress = {
    // Registered address is optional (a domicile provider can supply it later),
    // so it must NOT gate step-1 completion — only name, purpose, city + canton.
    detailsDone: !!(
      state.nameEn &&
      state.purposeEn &&
      state.seatCity &&
      state.seatCanton
    ),
    membersDone: (state.members?.length ?? 0) >= 2,
    boardDone: (state.boardMembers?.length ?? 0) >= 1,
    aoaSigned: state.aoaDocument?.isSigned === true,
    regGaSigned: state.regGaDocument?.isSigned === true,
    meetingRolesDone: !!(state.chairName && state.secretaryName),
    minutesSigned: state.foundingMinutesDocument?.isSigned === true,
    multisigConfigured: !!state.multisig,
    mpaSigned: state.mpaDocument?.isSigned === true,
    dissolutionDetailsDone: !!(
      state.dissolution?.dissolutionDate && state.dissolution?.assetRecipient
    ),
    dissolutionSigned: state.dissolutionResolutionDocument?.isSigned === true,
    hasMultisig: !!state.multisig,
  };

  // All steps are navigable; genuinely-locked steps render as read-only
  // previews. Gating is per-branch (see isStepLocked): the required founding
  // chain is ordered, while the optional Treasury / Supplier & Contributor
  // branches open together once the entity is constituted (M1).
  function handleStepClick(step: number) {
    setCurrentStep(step);
  }

  const isCurrentStepLocked = isStepLocked(currentStep, stageProgress);

  function renderStep() {
    switch (currentStep) {
      case SUITABILITY_STEP:
        return (
          <StepSuitability
            onContinue={() => setCurrentStep(1)}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 0:
        return (
          <StepWelcome
            onNext={() => setCurrentStep(1)}
            onCheckSuitability={() => setCurrentStep(SUITABILITY_STEP)}
          />
        );
      case 1:
        return (
          <StepAssociationDetails
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <StepMemberRegistry
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepBoardSetup
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <StepArticlesOfAssociation
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );
      case 5:
        // Multisig (step 6) leaves the required chain — Reg GA flows straight
        // to the founding meeting (step 7). Step 6 is reached only via the
        // post-founding gateway or the optional-branch sidebar.
        return (
          <StepRegulationGA
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(4)}
            onNext={() => setCurrentStep(7)}
          />
        );
      case 6:
        // Back returns to the treasury gateway it was launched from; forward
        // continues to the Multisig Participation Agreement (step 8).
        return (
          <StepMultisigConfig
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(8)}
            onBack={() => setCurrentStep(GATEWAY_STEP)}
          />
        );
      case 7:
        return (
          <StepFoundingMeeting
            state={state}
            dispatch={safeDispatch}
            onNext={() => setCurrentStep(MILESTONE_STEP)}
            onBack={() => setCurrentStep(5)}
          />
        );
      case MILESTONE_STEP:
        return (
          <MilestonePage
            state={state}
            onContinue={() => setCurrentStep(GATEWAY_STEP)}
            onOpenArchive={openArchive}
            onBack={() => setCurrentStep(7)}
          />
        );
      case ARCHIVE_STEP:
        return (
          <StepFinalArchive
            state={state}
            onBack={() => setCurrentStep(archiveReturnStep)}
          />
        );
      case GATEWAY_STEP:
        return (
          <TreasuryGateway
            state={state}
            onSetupMultisig={() => {
              if (!state.stage2Started) {
                safeDispatch(
                  actions.startStage_2({ startedAt: new Date().toISOString() }),
                );
              }
              setCurrentStep(6);
            }}
            onNoTreasuryChange={setNoTreasury}
            onBack={() => setCurrentStep(MILESTONE_STEP)}
          />
        );
      case 8:
        return (
          <StepMultisigParticipationAgreement
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(7)}
            onNext={() => setCurrentStep(9)}
          />
        );
      case 9:
        return (
          <StepContributorAgreements
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(8)}
          />
        );
      case 10:
        return (
          <StepDissolutionDetails
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(9)}
            onNext={() => setCurrentStep(11)}
          />
        );
      case 11:
        return (
          <StepDissolutionResolution
            state={state}
            dispatch={safeDispatch}
            onBack={() => setCurrentStep(10)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <DocumentToolbar />
      <style>{`
        .sw-input {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #0f172a;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .sw-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        .sw-input::placeholder {
          color: #94a3b8;
        }
        select.sw-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        .sw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          background-color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .sw-btn-primary:hover:not(:disabled) {
          background-color: #b91c1c;
        }
        .sw-btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .sw-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .sw-btn-secondary:hover {
          background-color: #f8fafc;
        }
      `}</style>
      <WizardLayout
        currentStep={currentStep}
        onStepClick={handleStepClick}
        stageProgress={stageProgress}
        onOpenArchive={openArchive}
        shieldCo={noTreasury}
      >
        {isCurrentStepLocked ? (
          <ReadOnlyStepWrapper>{renderStep()}</ReadOnlyStepWrapper>
        ) : (
          renderStep()
        )}
      </WizardLayout>
    </>
  );
}
