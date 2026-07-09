import type { SwissAssociationState } from "document-models/swiss-association";

interface Props {
  state: SwissAssociationState;
  // Reopen the executed Articles of Association (step 4).
  onOpenAoa?: () => void;
}

// Milestone M1 — the association legally exists. Rendered page-level at the top
// of the editor view (not inline in a step) once the founding minutes are
// signed, so crossing into legal personhood reads as a moment, and stays
// visible as the achievement that unlocks every optional capability below it.
export function M1Banner({ state, onOpenAoa }: Props) {
  const name = state.nameEn || state.nameDe || "The association";

  return (
    <div className="p-6 bg-green-600 rounded-2xl text-white shadow-md">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        Milestone M1 · Art. 60 ZGB
      </span>
      <h2 className="text-2xl font-bold mt-2.5">Legal personhood achieved</h2>
      <p className="text-sm text-green-50 mt-1 max-w-2xl">
        {name} now exists as a legal person and can act in its own name. The
        founding is complete — everything from here is optional: set up a
        treasury, engage contributors, or simply keep the association as a
        minimal, constituted entity.
      </p>
      {onOpenAoa && (
        <button
          type="button"
          onClick={onOpenAoa}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-green-700 hover:bg-green-50 transition-colors"
        >
          Open Executed Articles of Association
        </button>
      )}
    </div>
  );
}
