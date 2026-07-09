import { useEffect, useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  GeneratedStage2Document,
  Stage2DocumentType,
} from "document-models/swiss-association";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  markStage2DocumentSigned,
  setStage2DocumentMarkdown,
} from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";
import {
  LEGAL_DOC_CSS,
  markdownToHtml,
  openPrintWindow,
} from "./documentRender.js";

interface Stage2DocumentStepProps {
  title: string;
  description: string;
  // Singleton documents identify themselves by type; collection items (e.g.
  // contributor agreements) instead inject `persistMarkdown` / `markSigned`.
  documentType?: Stage2DocumentType;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  documentState: GeneratedStage2Document | null | undefined;
  generateMarkdown: () => string;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  lockedHint?: string;
  nextRequiresSigned?: boolean;
  // When false, this document is NOT signed here (no "Mark as Signed" button /
  // signed banner) — it is executed elsewhere (the founding documents are
  // executed by SIGN_FOR_INCORPORATION). In that mode `nextRequiresSigned`
  // gates on the draft being generated instead of signed. Defaults to true.
  signable?: boolean;
  // Optional overrides for persistence — when provided they take precedence
  // over the documentType-based dispatch (used by collection items keyed by id).
  persistMarkdown?: (markdown: string) => void;
  markSigned?: (signedAt: string) => void;
}

export function Stage2DocumentStep({
  title,
  description,
  documentType,
  dispatch,
  documentState,
  generateMarkdown,
  onBack,
  onNext,
  nextLabel = "Continue →",
  lockedHint,
  nextRequiresSigned = false,
  signable = true,
  persistMarkdown,
  markSigned,
}: Stage2DocumentStepProps) {
  // Persist/sign via the injected callbacks when present, otherwise fall back to
  // the singleton documentType-based dispatch.
  function persist(markdown: string) {
    if (persistMarkdown) {
      persistMarkdown(markdown);
    } else if (documentType) {
      dispatch(setStage2DocumentMarkdown({ documentType, markdown }));
    }
  }
  function sign(signedAt: string) {
    if (markSigned) {
      markSigned(signedAt);
    } else if (documentType) {
      dispatch(markStage2DocumentSigned({ documentType, signedAt }));
    }
  }
  const [generationMessage, setGenerationMessage] = useState<string | null>(
    null,
  );
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  // The rendered document preview is collapsed by default — action buttons stay
  // visible; generating or choosing a view expands it. A header re-collapses it.
  const [previewOpen, setPreviewOpen] = useState(false);
  const isLocked = documentState?.isLocked === true;
  const isSigned = documentState?.isSigned === true;
  const isGenerated = !!documentState?.markdown;
  // Whether the "advance" precondition is met: signed (signable docs) or merely
  // drafted (non-signable founding docs, executed later at incorporation).
  const advanceReady = signable ? isSigned : isGenerated;
  const markdown =
    previewMarkdown ?? documentState?.markdown ?? generateMarkdown();

  useEffect(() => {
    setPreviewMarkdown(null);
    setGenerationMessage(null);
    setShowSource(false);
    setPreviewOpen(false);
  }, [documentType, documentState?.signedAt, documentState?.isLocked]);

  function handleGenerate() {
    try {
      const nextMarkdown = generateMarkdown();
      setPreviewMarkdown(nextMarkdown);
      setPreviewOpen(true);

      if (isLocked) {
        setGenerationMessage(
          `Preview refreshed at ${new Date().toLocaleTimeString()} (document is locked; draft not persisted).`,
        );
        return;
      }

      persist(nextMarkdown);
      setGenerationMessage(
        `Draft refreshed at ${new Date().toLocaleTimeString()}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown generation error";
      setGenerationMessage(`Draft generation failed: ${message}`);
    }
  }

  function handleMarkSigned() {
    if (isLocked) return;
    const markdownToPersist = previewMarkdown ?? generateMarkdown();

    if (!documentState?.markdown || previewMarkdown) {
      persist(markdownToPersist);
    }
    sign(new Date().toISOString());
  }

  return (
    <div className="max-w-3xl space-y-6">
      <style>{LEGAL_DOC_CSS}</style>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      {signable && isSigned && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800">
            Signed and locked at{" "}
            {new Date(documentState.signedAt || "").toLocaleString()}
          </p>
          {lockedHint && (
            <p className="text-xs text-green-700 mt-1">{lockedHint}</p>
          )}
        </div>
      )}
      {!signable && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-600">
            This document is executed by the founding members signing for
            incorporation — there is no separate signature here. Review and edit
            it, then complete the Incorporation Signing step.
          </p>
        </div>
      )}

      <SectionCard title="Generated Markdown">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLocked}
              className="sw-btn-secondary"
            >
              Generate / Refresh Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSource((current) => !current);
                setPreviewOpen(true);
              }}
              className="sw-btn-secondary"
            >
              {showSource ? "Show Document View" : "Show Markdown Source"}
            </button>
            <button
              type="button"
              onClick={() => openPrintWindow(markdown, title)}
              className="sw-btn-secondary"
            >
              Download PDF
            </button>
            {signable && (
              <button
                type="button"
                onClick={handleMarkSigned}
                disabled={isLocked}
                className="sw-btn-primary"
              >
                Mark as Signed
              </button>
            )}
          </div>
          {generationMessage && (
            <p className="text-xs text-slate-500">{generationMessage}</p>
          )}
          {/* Collapsed by default — the buttons above stay usable; expanding is
              opt-in so the long rendered document doesn't dominate the step. */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setPreviewOpen((open) => !open)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
            >
              <span>{showSource ? "Markdown source" : "Document preview"}</span>
              <span className="text-xs text-slate-400">
                {previewOpen ? "Collapse ▲" : "Expand ▼"}
              </span>
            </button>
            {previewOpen &&
              (showSource ? (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700">
                    {markdown}
                  </pre>
                </div>
              ) : (
                <div className="bg-white border-t border-slate-200 p-8">
                  <div
                    className="legal-doc max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(markdown),
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextRequiresSigned && !advanceReady}
            className="sw-btn-primary"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
