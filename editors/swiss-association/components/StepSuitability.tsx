import { useState } from "react";
import { SectionCard } from "./SectionCard.js";
import { FormField } from "./FormField.js";
import { assessPurpose } from "./assessPurposeClient.js";
import type { PurposeAssessment } from "./assessPurposeClient.js";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

// ---- Answer types ----------------------------------------------------------

type MemberCount = "1" | "2" | "3+";
type Jurisdiction = "same" | "different";
type Investment = "yes" | "no" | "maybe";
type Verdict = "aligned" | "misaligned";

const DISCLAIMER =
  "This is an informational structural check, not legal advice. We are not lawyers and do not recommend any specific legal vehicle. Consult a qualified professional for your situation.";

// ---- Small structured inputs (red accent, matching other steps) ------------

interface Option<T extends string> {
  value: T;
  label: string;
}

function RadioPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value === o.value
              ? "bg-red-600 border-red-600 text-white"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---- Deterministic verdict -------------------------------------------------
// Gate-only: alignment is driven solely by things the user can honestly self-
// report — member count and the investment/dividends intent. Whether a purpose
// qualifies as non-profit under Swiss law is a technical determination handled
// by a later automated assessment, not self-assessed here. Member jurisdiction
// only adds a neutral heads-up note; it never changes the verdict.

interface VerdictResult {
  verdict: Verdict;
  reasons: string[];
  notes: string[];
}

function computeVerdict(
  memberCount: MemberCount,
  jurisdiction: Jurisdiction,
  investment: Investment,
): VerdictResult {
  const reasons: string[] = [];
  if (memberCount === "1") {
    reasons.push("A Swiss association requires at least 2 founding members.");
  }
  if (investment === "yes") {
    reasons.push(
      "Swiss associations have no shareholders, cannot issue shares, and cannot distribute profits — so they don't suit equity investment or dividend payments.",
    );
  }

  const notes: string[] = [];
  if (memberCount === "2") {
    notes.push(
      "Two members (natural or legal persons) is the legal minimum, so a Swiss association is viable — but with only 2 members the tax-residency risk is higher. Three or more members is recommended.",
    );
  }
  if (jurisdiction === "same") {
    notes.push(
      "Heads-up: if most members operate from a single non-Swiss jurisdiction, this may raise tax-residency considerations for the association. Please consult a tax or legal advisor. (This is not legal or tax advice.)",
    );
  }
  if (investment === "maybe") {
    notes.push(
      "You indicated you might seek funding later. A Swiss association can't issue equity or distribute profits, but non-equity routes (e.g. grants or SAFTs, which confer no equity or profit rights) may be worth exploring with a qualified professional if those plans firm up.",
    );
  }

  return {
    verdict: reasons.length > 0 ? "misaligned" : "aligned",
    reasons,
    notes,
  };
}

const VERDICT_META: Record<
  Verdict,
  { box: string; title: string; heading: string; message: string }
> = {
  aligned: {
    box: "bg-green-50 border-green-300",
    title: "text-green-900",
    heading: "Appears aligned",
    message:
      "Based on your answers, your project appears consistent with a Swiss association's characteristics. You can proceed to set one up.",
  },
  misaligned: {
    box: "bg-red-50 border-red-300",
    title: "text-red-900",
    heading: "Does not appear to align",
    message:
      "Based on your answers, your project's characteristics do not appear to align with a Swiss association:",
  },
};

// Informational label for the AI purpose assessment — deliberately neutral
// (NOT a red/green pass-fail). It describes against the legal axis; it does not
// decide for the user.
function verdictLabel(verdict: string): string {
  switch (verdict) {
    case "likely_ideal":
      return "Appears primarily ideal / non-commercial in purpose";
    case "likely_economic":
      return "Appears primarily economic (gain for members)";
    default:
      return "Not clearly determinable from this description";
  }
}

// ---- Component -------------------------------------------------------------

export function StepSuitability({ onContinue, onBack }: Props) {
  const [memberCount, setMemberCount] = useState<MemberCount | null>(null);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [investment, setInvestment] = useState<Investment | null>(null);
  // Informational free-text. Feeds the optional AI purpose assessment below,
  // which is informational only and does NOT affect the deterministic verdict
  // or block proceeding.
  const [purpose, setPurpose] = useState("");
  const [assessment, setAssessment] = useState<PurposeAssessment | null>(null);
  const [assessing, setAssessing] = useState(false);

  async function handleAssess() {
    if (!purpose.trim() || assessing) return;
    setAssessing(true);
    setAssessment(null);
    const outcome = await assessPurpose(purpose.trim());
    setAssessment(outcome);
    setAssessing(false);
  }

  const ready =
    memberCount !== null && jurisdiction !== null && investment !== null;
  const result = ready
    ? computeVerdict(memberCount, jurisdiction, investment)
    : null;
  const meta = result ? VERDICT_META[result.verdict] : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Suitability Check
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          A quick structural check of whether your project's characteristics fit
          a Swiss association (Verein). Optional — your answers are not saved.
        </p>
      </div>

      <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
        <p className="text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Please note: </span>
          {DISCLAIMER}
        </p>
      </div>

      <SectionCard title="About your organization">
        <FormField
          label="1. How many founding members will your association have?"
          required
        >
          <RadioPills<MemberCount>
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3+", label: "3 or more" },
            ]}
            value={memberCount}
            onChange={setMemberCount}
          />
        </FormField>

        <FormField
          label="2. Will your members be located in the same country, or across different countries?"
          hint="Detailed per-member locations are collected later, in the Member Registry step."
          required
        >
          <RadioPills<Jurisdiction>
            options={[
              { value: "same", label: "Same country" },
              { value: "different", label: "Different countries" },
            ]}
            value={jurisdiction}
            onChange={setJurisdiction}
          />
        </FormField>

        <FormField
          label="3. Do you plan to raise equity investment, issue shares, or distribute profits/dividends to members?"
          required
        >
          <RadioPills<Investment>
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "maybe", label: "Not now, maybe later" },
            ]}
            value={investment}
            onChange={setInvestment}
          />
        </FormField>

        {/* Deterministic verdict renders directly under the structural inputs
            (Q1–Q3) that drive it — not in a later combined panel, and never
            co-located with the AI purpose assessment (which sits under Q4). */}
        {result && meta && (
          <div className={`p-5 border rounded-xl ${meta.box}`}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              <span aria-hidden="true">⚖️</span>
              Rule-based result · definitive
            </span>
            <p className={`text-base font-semibold mt-2 ${meta.title}`}>
              {meta.heading}
            </p>
            <p className={`text-sm mt-1 ${meta.title}`}>{meta.message}</p>

            {result.reasons.length > 0 && (
              <ul className="mt-3 space-y-2">
                {result.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-red-800"
                  >
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}

            {result.notes.length > 0 && (
              <ul className="mt-3 space-y-2">
                {result.notes.map((n, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <span className="mt-0.5 flex-shrink-0">›</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 pt-3 border-t border-black/10 text-xs text-slate-600">
              {DISCLAIMER}
            </p>
          </div>
        )}

        {!ready && (
          <p className="text-xs text-slate-400">
            Answer questions 1, 2 and 3 to see your result.
          </p>
        )}

        <FormField
          label="4. What is your organization's purpose?"
          hint="Describe what you're building and why."
        >
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={4}
            placeholder="e.g. We fund and maintain open-source developer tooling as a public good…"
            className="sw-input resize-none"
          />
          <div className="mt-3 space-y-3">
            <button
              onClick={() => void handleAssess()}
              disabled={!purpose.trim() || assessing}
              className="sw-btn-secondary"
            >
              {assessing ? "Assessing…" : "Assess purpose"}
            </button>

            {assessment && (
              // AI-assisted, advisory. Dashed border + prominent badge mark it
              // as different IN KIND from the deterministic rule-based verdict
              // (under Q3) — an opinion on free text, never a pass/fail result.
              <div className="p-4 bg-blue-50 border border-dashed border-blue-300 rounded-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  <span aria-hidden="true">✨</span>
                  AI-assisted · informational only
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {verdictLabel(assessment.verdict)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {assessment.explanation}
                </p>
                {assessment.considerations.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {assessment.considerations.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <span className="mt-0.5 flex-shrink-0">›</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 pt-2 border-t border-blue-200 text-xs text-slate-500">
                  An AI judgment on your free-text description — advisory only.
                  It does <span className="font-semibold">not</span> affect the
                  rule-based result under Q3 and is not legal advice. If
                  anything is unclear, consult qualified Swiss counsel.
                </p>
              </div>
            )}
          </div>
        </FormField>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        {ready && (
          <button onClick={onContinue} className="sw-btn-primary">
            Continue to setup →
          </button>
        )}
      </div>
    </div>
  );
}
