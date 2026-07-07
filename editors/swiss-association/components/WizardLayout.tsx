import type { ReactNode } from "react";
import { ProgressSidebar } from "./ProgressSidebar.js";
import type { StageProgress } from "./ProgressSidebar.js";
import { CapabilityFlow } from "./CapabilityFlow.js";

interface WizardLayoutProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  children: ReactNode;
  stageProgress?: StageProgress;
  onOpenArchive: () => void;
  // When the user took the no-treasury route, the capability diagram switches to
  // the enriched "deliberately minimal" (ShieldCo) mode.
  shieldCo?: boolean;
}

export function WizardLayout({
  currentStep,
  onStepClick,
  children,
  stageProgress,
  onOpenArchive,
  shieldCo = false,
}: WizardLayoutProps) {
  return (
    <div className="swiss-wizard min-h-screen bg-slate-50">
      {/* Header */}
      <div className="swiss-wizard-header bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1H9.5V6.5H15V9.5H9.5V15H6.5V9.5H1V6.5H6.5V1Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">
              Self Incorporation Flow
            </h1>
            <p className="text-xs text-slate-500">
              Non-profit Verein · Art. 60–79 ZGB
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>

        {/* Single sidebar — visual stage cards + step navigation */}
        {stageProgress && (
          <ProgressSidebar
            progress={stageProgress}
            currentStep={currentStep}
            onStepClick={onStepClick}
            onOpenArchive={onOpenArchive}
          />
        )}
      </div>

      {/* Full-width capability summary — hub-and-spokes, below the content. */}
      {stageProgress && (
        <CapabilityFlow progress={stageProgress} shieldCo={shieldCo} />
      )}
    </div>
  );
}
