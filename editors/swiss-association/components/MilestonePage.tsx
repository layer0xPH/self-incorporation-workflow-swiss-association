import type { SwissAssociationState } from "document-models/swiss-association";
import { M1Banner } from "./M1Banner.js";
import { SectionCard } from "./SectionCard.js";

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
  const name = state.nameEn || state.nameDe || "The association";

  return (
    <div className="max-w-3xl space-y-6">
      <M1Banner state={state} />

      <SectionCard title="Where to from here">
        <p className="text-sm text-slate-600">
          {name} can now hold rights and obligations in its own name. From here
          every step is optional — set up a treasury, engage contributors, or
          simply keep the association as a minimal, constituted entity.
        </p>
        <button
          type="button"
          onClick={onOpenArchive}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
        >
          View executed documents archive →
        </button>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <button type="button" onClick={onContinue} className="sw-btn-primary">
          What&apos;s next →
        </button>
      </div>
    </div>
  );
}
