import { showRevisionHistory } from "@powerhousedao/reactor-browser";
import type { SwissAssociationState } from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";
import { openPrintWindow } from "./documentRender.js";

interface Props {
  state: SwissAssociationState;
  onBack: () => void;
}

// Archive cards serve the PDF — the same styled, print-to-PDF pipeline used at
// signing (openPrintWindow applies LEGAL_DOC_CSS), so an archived PDF matches
// exactly what the signer saw. No raw markdown is exposed here.
//
// "Open revision history" opens the association document's audit trail (via the
// global showRevisionHistory() — no doc-id needed; it targets the selected
// document), where each signing shows as a MARK_STAGE2_DOCUMENT_SIGNED
// operation. The inline "Signed · <timestamp>" is the proof-of-execution label.
function SignedDocCard({
  title,
  markdown,
  signedAt,
}: {
  title: string;
  markdown: string | null | undefined;
  signedAt: string | null | undefined;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Signed ·{" "}
          {signedAt ? new Date(signedAt).toLocaleString() : "Not signed"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => showRevisionHistory()}
          className="sw-btn-secondary"
        >
          Open revision history
        </button>
        <button
          type="button"
          onClick={() => markdown && openPrintWindow(markdown, title)}
          disabled={!markdown}
          className="sw-btn-secondary"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export function StepFinalArchive({ state, onBack }: Props) {
  const associationName = state.nameEn || state.nameDe || "Association";

  // Signed-only — the archive is the record of what was actually executed.
  const singletons = [
    { title: "Articles of Association (AoA)", doc: state.aoaDocument },
    {
      title: "Regulation of the General Assembly",
      doc: state.regGaDocument,
    },
    { title: "Founding Meeting Minutes", doc: state.foundingMinutesDocument },
    { title: "Multisig Participation Agreement (MPA)", doc: state.mpaDocument },
  ].filter((entry) => entry.doc?.isSigned === true);

  // Contributor agreements are a collection — surface each signed one.
  const signedContributors = state.contributorAgreements.filter(
    (c) => c.generatedDocument?.isSigned === true,
  );

  const totalSigned = singletons.length + signedContributors.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Executed Documents
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          The permanent archive of every executed document for {associationName}
          , stored in the document state for long-term record keeping.
        </p>
      </div>

      {totalSigned === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm font-medium text-slate-700">
            No executed documents yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Documents appear here once they are signed. Complete and sign the
            governing documents to build the archive.
          </p>
        </div>
      ) : (
        <SectionCard title={`Executed Documents (${totalSigned})`}>
          <div className="space-y-3">
            {singletons.map((entry) => (
              <SignedDocCard
                key={entry.title}
                title={entry.title}
                markdown={entry.doc?.markdown}
                signedAt={entry.doc?.signedAt}
              />
            ))}
            {signedContributors.map((c) => (
              <SignedDocCard
                key={c.id}
                title={`Contributor Agreement — ${
                  c.contractorName || c.entityName || c.role || "Contributor"
                }`}
                markdown={c.generatedDocument?.markdown}
                signedAt={c.generatedDocument?.signedAt}
              />
            ))}
          </div>
        </SectionCard>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
      </div>
    </div>
  );
}
