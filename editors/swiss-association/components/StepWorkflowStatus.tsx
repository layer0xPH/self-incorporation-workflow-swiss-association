import { useState } from "react";
import type {
  SwissAssociationState,
  PhaseRecord,
  PhaseStatus,
} from "document-models/swiss-association";
import type { SwissAssociationDocument } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  advancePhase,
  updatePhaseStatus,
  addNote,
} from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";

interface Props {
  phDocument: SwissAssociationDocument;
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onGenerateDocuments: () => void;
}

const STATUS_META: Record<
  PhaseStatus,
  { label: string; color: string; dot: string }
> = {
  LOCKED: {
    label: "Locked",
    color: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  AWAITING_SIGNATURES: {
    label: "Awaiting Signatures",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  COMPLETE: {
    label: "Complete",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
};

const PHASE_DOCS: Record<number, string[]> = {
  1: [
    "Articles of Association",
    "Regulation of the General Assembly",
    "Founding Meeting Minutes",
  ],
  2: ["Multisig Participation Agreement"],
  3: ["Final Archive"],
};

function PhaseCard({
  phase,
  isActive,
  onMarkDocumentsGenerated,
  onMarkDocumentsSigned,
  onAdvance,
}: {
  phase: PhaseRecord;
  isActive: boolean;
  onMarkDocumentsGenerated: () => void;
  onMarkDocumentsSigned: () => void;
  onAdvance: () => void;
}) {
  const meta = STATUS_META[phase.status];
  const docs = PHASE_DOCS[phase.phaseNumber] ?? [];

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isActive
          ? "border-red-200 bg-white shadow-sm"
          : phase.status === "COMPLETE"
            ? "border-green-200 bg-green-50/50"
            : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border ${meta.color}`}
          >
            {phase.status === "COMPLETE" ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7L5.5 10.5L12 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              phase.phaseNumber
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Phase {phase.phaseNumber} — {phase.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Documents: {docs.join(" · ")}
            </p>
            {phase.completedDate && (
              <p className="text-xs text-green-600 mt-1">
                Completed: {new Date(phase.completedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {isActive && phase.status !== "LOCKED" && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            Phase Progress
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={phase.documentsGenerated}
                onChange={onMarkDocumentsGenerated}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span
                className={`text-sm ${phase.documentsGenerated ? "text-slate-400 line-through" : "text-slate-700"}`}
              >
                Documents generated
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={phase.documentsSigned}
                onChange={onMarkDocumentsSigned}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span
                className={`text-sm ${phase.documentsSigned ? "text-slate-400 line-through" : "text-slate-700"}`}
              >
                All parties have signed
              </span>
            </label>
          </div>

          {phase.documentsGenerated &&
            phase.documentsSigned &&
            phase.status !== "COMPLETE" && (
              <button
                onClick={onAdvance}
                className="mt-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Mark Phase {phase.phaseNumber} Complete & Unlock Next Phase →
              </button>
            )}

          {phase.phaseNumber === 2 && phase.status === "COMPLETE" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                🎉 Entity Incorporated!
              </p>
              <p className="text-xs text-green-700 mt-1">
                The association is legally incorporated under Swiss law. Proceed
                to Phase 3 to set up on-chain treasury governance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StepWorkflowStatus({
  phDocument,
  state,
  dispatch,
  onBack,
  onGenerateDocuments,
}: Props) {
  const [newNote, setNewNote] = useState("");

  function handleExportForArchive() {
    const executionDate =
      state.foundingDate ?? new Date().toISOString().slice(0, 10);
    const issuer = state.nameEn ?? state.nameDe ?? "unknown-issuer";
    const baseName = `swiss-association-record__${issuer
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}__${executionDate}`;

    const payload = {
      document: phDocument,
      exportedAt: new Date().toISOString(),
      exportHint:
        "Place this file under archive/source and run archive pipeline",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${baseName}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleMarkDocumentsGenerated(phaseNumber: number, current: boolean) {
    dispatch(
      updatePhaseStatus({
        phaseNumber,
        status: current ? "IN_PROGRESS" : "AWAITING_SIGNATURES",
        documentsGenerated: !current,
      }),
    );
  }

  function handleMarkDocumentsSigned(phaseNumber: number, current: boolean) {
    dispatch(
      updatePhaseStatus({
        phaseNumber,
        status:
          state.phases.find((p) => p.phaseNumber === phaseNumber)?.status ??
          "IN_PROGRESS",
        documentsSigned: !current,
      }),
    );
  }

  function handleAdvance() {
    dispatch(
      advancePhase({ completedDate: new Date().toISOString().split("T")[0] }),
    );
  }

  function handleAddNote() {
    if (newNote.trim()) {
      dispatch(addNote({ note: newNote.trim() }));
      setNewNote("");
    }
  }

  const allComplete = state.phases.every((p) => p.status === "COMPLETE");
  const hasExecutedSignature = state.phases.some((p) => p.documentsSigned);

  // Derived completion flags for the progress overview. Registered address is
  // optional (a domicile provider can supply it later) and must NOT gate
  // completion — mirrors the step-1 criteria in editor.tsx.
  const detailsDone = !!(
    state.nameEn &&
    state.purposeEn &&
    state.seatCity &&
    state.seatCanton
  );
  const membersDone = (state.members?.length ?? 0) >= 2;
  const boardDone = (state.boardMembers?.length ?? 0) >= 1;
  const aoaSigned = state.aoaDocument?.isSigned === true;
  const minutesSigned = state.foundingMinutesDocument?.isSigned === true;
  const meetingRolesDone = !!(state.chairName && state.secretaryName);
  const mpaSigned = state.mpaDocument?.isSigned === true;

  function ProgressRow({
    done,
    label,
    sub,
  }: {
    done: boolean;
    label: string;
    sub?: string;
  }) {
    return (
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}
        >
          {done ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 5L4 7.5L8.5 2.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            "○"
          )}
        </span>
        <div>
          <p
            className={`text-sm ${done ? "text-slate-500 line-through" : "text-slate-800"}`}
          >
            {label}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Workflow Status
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your Swiss Association incorporation progress. Complete
          all Phase A steps before proceeding to the Multisig Participation
          Agreement.
        </p>
      </div>

      {/* Progress overview */}
      <SectionCard title="Phase 1 — Input Information">
        <p className="text-xs text-slate-500 mb-3">
          Enter all required data about the association, its members, and its
          board.
        </p>
        <div className="space-y-3">
          <ProgressRow
            done={detailsDone}
            label="Association Details"
            sub="Name, purpose, registered address"
          />
          <ProgressRow
            done={membersDone}
            label="Member Registry"
            sub="At least 2 founding members"
          />
          <ProgressRow
            done={boardDone}
            label="Board Setup"
            sub="At least 1 board member"
          />
        </div>
      </SectionCard>

      <SectionCard title="Phase 2 — Sign Governing Documents">
        <p className="text-xs text-slate-500 mb-3">
          Review and execute the core legal documents that define how the
          association operates.
        </p>
        <div className="space-y-3">
          <ProgressRow
            done={aoaSigned}
            label="Articles of Association signed"
            sub="Main governing document (Art. 60–79 ZGB)"
          />
          <ProgressRow
            done={aoaSigned}
            label="Regulation of the General Assembly signed"
            sub="Decision-making and voting rules"
          />
        </div>
      </SectionCard>

      <SectionCard title="Phase 3 — Incorporation">
        <p className="text-xs text-slate-500 mb-3">
          Conduct the founding meeting and execute the official minutes that
          legally create the association.
        </p>
        <div className="space-y-3">
          <ProgressRow
            done={meetingRolesDone}
            label="Founding Meeting — roles assigned"
            sub="Chair and Secretary designated"
          />
          <ProgressRow
            done={minutesSigned}
            label="Founding Meeting Minutes signed"
            sub="Official record of incorporation"
          />
        </div>
      </SectionCard>

      <SectionCard title="Phase 4 — MPA & Contributor Agreements (if needed)">
        <p className="text-xs text-slate-500 mb-3">
          Only required if the association manages an on-chain treasury via
          multisig.
        </p>
        <div className="space-y-3">
          <ProgressRow
            done={!!state.multisig}
            label="Treasury governance configured"
            sub="Multisig wallet and signing threshold"
          />
          <ProgressRow
            done={mpaSigned}
            label="Multisig Participation Agreement signed"
            sub="On-chain governance formalised"
          />
        </div>
      </SectionCard>

      {allComplete && (
        <div className="p-5 bg-green-50 border border-green-300 rounded-xl">
          <p className="text-base font-semibold text-green-900">
            🎉 Incorporation Complete
          </p>
          <p className="text-sm text-green-700 mt-1">
            All three phases are complete. The association is incorporated and
            on-chain governance is active. Keep your passport file safe for
            future reference.
          </p>
          {hasExecutedSignature && (
            <div className="mt-4">
              <button
                onClick={handleExportForArchive}
                className="sw-btn-primary"
              >
                Export to Local Archive (.json)
              </button>
              <p className="text-xs text-green-700 mt-2">
                This downloads a source file for your archive pipeline
                (`archive/source` → export/validate/promote/index).
              </p>
            </div>
          )}
        </div>
      )}

      {!allComplete && hasExecutedSignature && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-900">
            Signed execution detected
          </p>
          <p className="text-xs text-blue-700 mt-1">
            You can export to local archive after signature execution, even
            before all phases are marked complete.
          </p>
          <div className="mt-3">
            <button onClick={handleExportForArchive} className="sw-btn-primary">
              Export to Local Archive (.json)
            </button>
          </div>
        </div>
      )}

      <SectionCard title="Document Signing Tracker">
        <div className="space-y-3">
          {state.phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isActive={phase.phaseNumber === state.currentPhase}
              onMarkDocumentsGenerated={() =>
                handleMarkDocumentsGenerated(
                  phase.phaseNumber,
                  phase.documentsGenerated,
                )
              }
              onMarkDocumentsSigned={() =>
                handleMarkDocumentsSigned(
                  phase.phaseNumber,
                  phase.documentsSigned,
                )
              }
              onAdvance={handleAdvance}
            />
          ))}
        </div>
      </SectionCard>

      {/* Flags */}
      {(state.languageClauseNeedsUpdate ||
        state.belowRecommendedMemberCount ||
        !state.registeredAddressConfirmed) && (
        <SectionCard title="Flags & Reminders">
          <div className="space-y-2">
            {state.languageClauseNeedsUpdate && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Language clause:</span> The AoA
                  currently states the English version prevails. Review before
                  final signing if bilingual governance is intended.
                </p>
              </div>
            )}
            {state.belowRecommendedMemberCount && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Member count:</span> Fewer than
                  3 members. Consider adding a member from a different
                  jurisdiction to mitigate tax domicile risk.
                </p>
              </div>
            )}
            {!state.registeredAddressConfirmed && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Registered address:</span> Not
                  yet confirmed. Ensure the domicile provider address is locked
                  in before generating documents.
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Notes */}
      <SectionCard title="Notes">
        <div className="space-y-3">
          {state.customNotes.length > 0 && (
            <ul className="space-y-1">
              {state.customNotes.map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 p-2.5 bg-slate-50 rounded-lg"
                >
                  <span className="text-slate-400 mt-0.5">›</span>
                  {note}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Add a note or flag…"
              className="sw-input flex-1"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Legal reminder:</span>{" "}
          These documents are templates and should be reviewed by a qualified
          Swiss lawyer before submission to any authority or use in legal
          proceedings.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        {!state.stage2Started && (
          <button onClick={onGenerateDocuments} className="sw-btn-primary">
            Generate Documents →
          </button>
        )}
        {state.stage2Started && (
          <button onClick={onGenerateDocuments} className="sw-btn-primary">
            Continue Document Generation →
          </button>
        )}
      </div>
    </div>
  );
}
