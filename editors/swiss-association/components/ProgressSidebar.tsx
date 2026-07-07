import { useState } from "react";
import { STAGES, isStepLocked } from "./stages.js";
import type { StageDef } from "./stages.js";

// Four-state color system, shared by stage cards and step rows:
//   done      → GREEN  (underlying data complete)
//   current   → BLUE   (the step/stage the user is actively on)
//   available → neutral (reachable, clickable, not yet done)
//   locked    → subtle GREY (not yet reachable; read-only preview)
type Status = "done" | "current" | "available" | "locked";

interface MilestoneData {
  title: string;
  reached: boolean;
}

export interface StageProgress {
  detailsDone: boolean;
  membersDone: boolean;
  boardDone: boolean;
  aoaSigned: boolean;
  regGaSigned: boolean;
  meetingRolesDone: boolean;
  minutesSigned: boolean;
  multisigConfigured: boolean;
  mpaSigned: boolean;
  dissolutionDetailsDone: boolean;
  dissolutionSigned: boolean;
  hasMultisig: boolean;
}

// Maps a navigable step number to its "done" condition, derived from state.
// The MPA step (8) is satisfied either by signing it or — when no multisig is
// used — once the entity is constituted (matching the old "no multisig needed"
// completion). Contributor agreements (9) is a placeholder with no completion
// state yet; it stays not-done until its templates are wired in.
function isStepDone(step: number, p: StageProgress): boolean {
  const constituted = p.aoaSigned && p.minutesSigned;
  switch (step) {
    case 1:
      return p.detailsDone;
    case 2:
      return p.membersDone;
    case 3:
      return p.boardDone;
    case 4:
      return p.aoaSigned;
    case 5:
      return p.regGaSigned;
    case 6:
      return p.multisigConfigured;
    case 7:
      return p.minutesSigned;
    case 8:
      return p.mpaSigned || (!p.hasMultisig && constituted);
    case 9:
      return false;
    case 10:
      return p.dissolutionDetailsDone;
    case 11:
      return p.dissolutionSigned;
    default:
      return false;
  }
}

// Stage milestones mirror the capability-flow diagram, keyed on the same flags.
function stageMilestone(
  stageNumber: number,
  p: StageProgress,
): MilestoneData | undefined {
  switch (stageNumber) {
    case 2:
      // Incorporation complete → the entity legally exists (shell-complete).
      // Wording kept identical to the CapabilityFlow SVG node.
      return { title: "Exists as a legal person", reached: p.minutesSigned };
    case 3:
      // Defined by the multisig; the MPA is additive and does not gate it.
      return { title: "Can hold & move money", reached: p.hasMultisig };
    case 4:
      // Keyed on a signed contributor agreement (step 9), which is not built
      // yet — so this stays available (not reached), honestly.
      return { title: "Can contract people", reached: false };
    case 5:
      return { title: "Entity dissolved", reached: p.dissolutionSigned };
    case 6:
      // Operational (coming soon) — mirrors the CapabilityFlow node. Never
      // reached in the MVP (needs a tax ID + registered domicile provider).
      return { title: "Can invoice & get paid, compliantly", reached: false };
    default:
      return undefined;
  }
}

function stageAllDone(stage: StageDef, p: StageProgress): boolean {
  return stage.steps.every((s) => isStepDone(s.number, p));
}

// ---- Color lookups ---------------------------------------------------------

const CARD_BG: Record<Status, string> = {
  done: "bg-green-50 border-green-200",
  current: "bg-blue-50 border-blue-200",
  available: "bg-white border-slate-200",
  locked: "bg-slate-50 border-slate-200",
};

const CARD_CIRCLE: Record<Status, string> = {
  done: "bg-green-500 text-white",
  current: "bg-blue-600 text-white",
  available: "bg-slate-200 text-slate-500",
  locked: "bg-slate-100 text-slate-400",
};

const CARD_NAME: Record<Status, string> = {
  done: "text-green-800",
  current: "text-blue-800",
  available: "text-slate-700",
  locked: "text-slate-400",
};

const CARD_COUNT: Record<Status, string> = {
  done: "text-green-600",
  current: "text-blue-600",
  available: "text-slate-400",
  locked: "text-slate-300",
};

const BAR_TRACK: Record<Status, string> = {
  done: "bg-green-100",
  current: "bg-blue-100",
  available: "bg-slate-100",
  locked: "bg-slate-200",
};

const BAR_FILL: Record<Status, string> = {
  done: "bg-green-500",
  current: "bg-blue-600",
  available: "bg-slate-400",
  locked: "bg-slate-300",
};

const ROW_BG: Record<Status, string> = {
  done: "hover:bg-slate-50",
  current: "bg-blue-50",
  available: "hover:bg-slate-50",
  locked: "hover:bg-slate-50",
};

const ROW_CIRCLE: Record<Status, string> = {
  done: "bg-green-500 text-white",
  current: "bg-blue-600 text-white",
  available: "bg-slate-200 text-slate-500",
  locked: "bg-slate-100 text-slate-400",
};

const ROW_LABEL: Record<Status, string> = {
  done: "text-slate-600",
  current: "text-blue-700 font-semibold",
  available: "text-slate-700",
  locked: "text-slate-400",
};

const DOT_COLOR: Record<Status, string> = {
  done: "#22c55e",
  current: "#2563eb",
  available: "#94a3b8",
  locked: "#e2e8f0",
};

// Resolve a single step row's status. `current` wins (you-are-here) over done.
// Locking is per-branch (see stages.isStepLocked) — no single linear frontier.
function getStepStatus(
  step: number,
  currentStep: number,
  progress: StageProgress,
): Status {
  if (step === currentStep) return "current";
  if (isStepDone(step, progress)) return "done";
  if (isStepLocked(step, progress)) return "locked";
  return "available";
}

function MilestoneCard({
  milestone,
  dimmed,
}: {
  milestone: MilestoneData;
  dimmed: boolean;
}) {
  return (
    <div
      className="mt-2.5 rounded-lg px-2 py-1.5 flex items-center gap-1.5"
      style={{
        background: "#fefbf0",
        border: milestone.reached ? "1.5px solid #d4a92a" : "1px solid #e8dba8",
        boxShadow: milestone.reached
          ? "0 0 8px rgba(212, 169, 42, 0.15)"
          : "none",
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <span className="text-sm">★</span>
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: milestone.reached ? 700 : 600,
            color: milestone.reached ? "#8a6d1b" : "#b8b0a0",
            letterSpacing: "0.3px",
          }}
        >
          {milestone.reached ? "MILESTONE REACHED" : "MILESTONE"}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: milestone.reached ? "#6b5212" : "#b8b0a0",
            fontWeight: milestone.reached ? 500 : 400,
          }}
        >
          {milestone.title}
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5L4 7.5L8 2.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepRow({
  number,
  label,
  status,
  onClick,
}: {
  number: number;
  label: string;
  status: Status;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${ROW_BG[status]}`}
    >
      <span
        className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${ROW_CIRCLE[status]}`}
      >
        {status === "done" ? <CheckIcon size={9} /> : number}
      </span>
      <span className={`text-[11px] ${ROW_LABEL[status]}`}>{label}</span>
    </button>
  );
}

function StageCard({
  stage,
  status,
  progress,
  currentStep,
  onStepClick,
}: {
  stage: StageDef;
  status: Status;
  progress: StageProgress;
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  const completedCount = stage.steps.filter((s) =>
    isStepDone(s.number, progress),
  ).length;
  const totalCount = stage.steps.length;
  const fraction = totalCount > 0 ? completedCount / totalCount : 0;
  const milestone = stageMilestone(stage.number, progress);

  // Coming-soon: a muted, non-interactive placeholder card. Reads as an
  // optional onward capability that isn't built yet — not an incomplete step.
  if (stage.comingSoon) {
    return (
      <div className="border border-dashed border-slate-200 rounded-xl p-2.5 bg-slate-50 opacity-75">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 bg-slate-100 text-slate-400">
              <span aria-hidden="true">⋯</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {stage.name}
            </span>
          </div>
          <span className="text-[9px] font-semibold px-1.5 py-px rounded-full bg-slate-200 text-slate-500">
            {stage.comingSoonBadge ?? "Coming soon"}
          </span>
        </div>
        {stage.description && (
          <p className="text-[10px] leading-snug text-slate-400 mt-1">
            {stage.description}
          </p>
        )}
        {milestone && <MilestoneCard milestone={milestone} dimmed />}
      </div>
    );
  }

  return (
    <div className={`border rounded-xl p-2.5 ${CARD_BG[status]}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${CARD_CIRCLE[status]}`}
          >
            {status === "done" ? <CheckIcon /> : stage.number}
          </div>
          <span className={`text-[11px] font-semibold ${CARD_NAME[status]}`}>
            {stage.name}
          </span>
        </div>
        {status === "done" ? (
          <span className="text-[9px] bg-green-500 text-white px-1.5 py-px rounded-full font-semibold">
            Done
          </span>
        ) : (
          <span className={`text-[9px] font-semibold ${CARD_COUNT[status]}`}>
            {completedCount} / {totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {status !== "done" && (
        <div
          className={`h-[3px] rounded-full overflow-hidden ${BAR_TRACK[status]}`}
        >
          <div
            className={`h-full rounded-full ${BAR_FILL[status]}`}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
      )}

      {/* Step navigation rows — shown for every stage */}
      <div className="mt-2 flex flex-col gap-0.5">
        {stage.steps.map((step) => (
          <StepRow
            key={step.number}
            number={step.number}
            label={step.label}
            status={getStepStatus(step.number, currentStep, progress)}
            onClick={() => onStepClick(step.number)}
          />
        ))}
      </div>

      {/* Milestone */}
      {milestone && (
        <MilestoneCard milestone={milestone} dimmed={status === "locked"} />
      )}
    </div>
  );
}

interface ProgressSidebarProps {
  progress: StageProgress;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function ProgressSidebar({
  progress,
  currentStep,
  onStepClick,
}: ProgressSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Overall progress tracks only the required path to legal existence
  // (Pre-Incorporation + Incorporation, stages 1–2). Optional onward
  // capabilities — Treasury & Governance, Supplier & Contributor, Dissolution —
  // are NOT counted, so a shell entity that stops at "Exists as a legal person"
  // reads as complete rather than deficient.
  const incorporationSteps = STAGES.filter((s) => s.number <= 2).flatMap(
    (s) => s.steps,
  );
  const completed = incorporationSteps.filter((s) =>
    isStepDone(s.number, progress),
  ).length;
  const total = incorporationSteps.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  // A stage is current when the user is on one of its steps. It is never
  // "current" by default — Stage 4 (Dissolution) included.
  function getStageStatus(stage: StageDef, index: number): Status {
    // Coming-soon stages are muted placeholders — checked first, since an empty
    // step list would otherwise read as vacuously "done".
    if (stage.comingSoon) return "locked";
    if (stageAllDone(stage, progress)) return "done";
    if (stage.steps.some((s) => s.number === currentStep)) return "current";
    // Optional capability branches (Treasury, Supplier & Contributor,
    // Dissolution) hang off the constituted entity in parallel — they open
    // together once M1 is reached and never gate one another.
    if (stage.optional) {
      return progress.minutesSigned ? "available" : "locked";
    }
    // Required stages (Pre-Incorporation → Incorporation) stay sequential.
    const prevAllDone =
      index === 0 || stageAllDone(STAGES[index - 1], progress);
    return prevAllDone ? "available" : "locked";
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-20 right-4 z-10 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div className="flex gap-0.5">
          {STAGES.map((s, i) => {
            const st = getStageStatus(s, i);
            return (
              <div
                key={s.number}
                className="w-1.5 h-1.5 rounded-sm"
                style={{ background: DOT_COLOR[st] }}
              />
            );
          })}
        </div>
        <span className="text-[9px] font-semibold text-slate-500">
          {Math.round(pct)}%
        </span>
        <span className="text-[10px] text-slate-400">◀</span>
      </button>
    );
  }

  return (
    <aside className="swiss-wizard-status w-56 min-h-[calc(100vh-73px)] bg-white border-l border-slate-200 pt-4 px-3 flex-shrink-0">
      {/* Collapse toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setCollapsed(true)}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 text-[10px]"
        >
          ▶
        </button>
      </div>

      {/* Overall header */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Self Incorporation Flow
          </span>
          <span className="text-[11px] font-semibold text-slate-900">
            {completed} / {total}
          </span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background:
                pct >= 100
                  ? "#22c55e"
                  : `linear-gradient(90deg, #22c55e ${Math.max(0, pct - 15)}%, #2563eb 100%)`,
            }}
          />
        </div>
      </div>

      {/* Stage cards */}
      <div className="flex flex-col gap-2">
        {STAGES.map((stage, i) => (
          <StageCard
            key={stage.number}
            stage={stage}
            status={getStageStatus(stage, i)}
            progress={progress}
            currentStep={currentStep}
            onStepClick={onStepClick}
          />
        ))}
      </div>
    </aside>
  );
}
