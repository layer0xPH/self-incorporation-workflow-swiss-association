import { showRevisionHistory } from "@powerhousedao/reactor-browser";
import type { SwissAssociationState } from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";
import { openPrintWindow } from "./documentRender.js";
import { buildAoaMarkdown } from "./stage2Templates.js";

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
// operation. The inline "<dateLabel> · <timestamp>" is the proof-of-execution
// label — "Signed" for most docs, "Adopted" (founding-meeting date) for the AoA.
function SignedDocCard({
  title,
  markdown,
  signedAt,
  dateLabel = "Signed",
}: {
  title: string;
  markdown: string | null | undefined;
  signedAt: string | null | undefined;
  dateLabel?: string;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {dateLabel} ·{" "}
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

  // The archive is the record of what was actually executed.
  // The founding documents (AoA, Reg GA, Founding Minutes) are executed together
  // when the founding members sign for incorporation — so they appear here once
  // `incorporationCompletedAt` is set, dated by it and labelled "Adopted". The
  // MPA is still executed via its own "mark as signed" flow.
  const incorporatedAt = state.incorporationCompletedAt;
  const incorporated = !!incorporatedAt;
  const singletons = [
    {
      title: "Articles of Association (AoA)",
      // Re-rendered from live state so the archived copy reflects the adopted
      // statutes, not a stale draft.
      markdown: buildAoaMarkdown(state),
      dateLabel: "Adopted",
      date: incorporatedAt,
      executed: incorporated,
    },
    {
      title: "Regulation of the General Assembly",
      markdown: state.regGaDocument?.markdown,
      dateLabel: "Adopted",
      date: incorporatedAt,
      executed: incorporated,
    },
    {
      title: "Founding Meeting Minutes",
      markdown: state.foundingMinutesDocument?.markdown,
      dateLabel: "Adopted",
      date: incorporatedAt,
      executed: incorporated,
    },
    {
      title: "Multisig Participation Agreement (MPA)",
      markdown: state.mpaDocument?.markdown,
      dateLabel: "Signed",
      date: state.mpaDocument?.signedAt,
      executed: state.mpaDocument?.isSigned === true,
    },
  ].filter((entry) => entry.executed);

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
            Documents appear here once they are executed. The founding documents
            are executed when every founding member signs for incorporation.
          </p>
        </div>
      ) : (
        <SectionCard title={`Executed Documents (${totalSigned})`}>
          <div className="space-y-3">
            {singletons.map((entry) => (
              <SignedDocCard
                key={entry.title}
                title={entry.title}
                markdown={entry.markdown}
                dateLabel={entry.dateLabel}
                signedAt={entry.date}
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
