import type { SwissAssociationState } from "document-models/swiss-association";
import { M1Banner } from "./M1Banner.js";

interface Props {
  state: SwissAssociationState;
  // Continue into the post-founding "what's next" gateway.
  onContinue: () => void;
  // Open the executed-documents archive.
  onOpenArchive: () => void;
  // Return to the founding meeting step.
  onBack: () => void;
}

// A dedicated milestone screen shown once, right after the founding minutes are
// executed (M1). It is NOT a persistent header — it is a standalone moment that
// orients the user toward the optional capabilities ahead and points to the
// permanent record of what they just executed.
export function MilestonePage({
  state,
  onContinue,
  onOpenArchive,
  onBack,
}: Props) {
  return (
    <div className="max-w-3xl space-y-6">
      <M1Banner state={state} />

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenArchive}
            className="sw-btn-secondary"
          >
            View executed documents
          </button>
          <button type="button" onClick={onContinue} className="sw-btn-primary">
            What&apos;s next →
          </button>
        </div>
      </div>
    </div>
  );
}
