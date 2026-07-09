// Single source of truth for the wizard's stage/step structure.
// Step 0 (Welcome) is intentionally NOT listed here — it is an intro screen,
// not a navigable workflow step.

export interface StageStep {
  number: number;
  label: string;
}

// The incorporation-signing roll-call is a dedicated screen (not a numbered
// workflow step). Its selector matches the `SIGNING_STEP` constant in editor.tsx
// so a sidebar click routes to the same screen. Kept out-of-band (negative) so
// it never collides with the numbered steps.
export const SIGNING_STEP = -5;

export interface StageDef {
  number: number;
  name: string;
  steps: StageStep[];
  // Optional capability branches (Treasury, Supplier & Contributor,
  // Dissolution) hang off the constituted entity in parallel. They do NOT gate
  // one another and only open once Milestone M1 (the entity legally exists) is
  // reached. Required stages (Pre-Incorporation, Incorporation) stay sequential.
  optional?: boolean;
  // A not-yet-built onward capability shown as a muted "coming soon" placeholder
  // (no steps, not clickable). Reads as optional/coming-soon, never as an
  // incomplete required step.
  comingSoon?: boolean;
  // Badge text for a coming-soon stage (defaults to "Coming soon").
  comingSoonBadge?: string;
  // Optional description, currently only used by the coming-soon stages.
  description?: string;
}

// Stages are grouped to mirror the capability-flow diagram. Step NUMBERS are
// deliberately preserved (no renumbering) even though the grouping moves step 6
// (Multisig Setup) out of Incorporation and after step 7 — the visible numbers
// may run out of order across stages, and that is expected.
export const STAGES: StageDef[] = [
  {
    number: 1,
    name: "Pre-Incorporation",
    steps: [
      { number: 1, label: "Association Details" },
      { number: 2, label: "Member Registry" },
      { number: 3, label: "Board Setup" },
    ],
  },
  {
    // Completing this stage = "Exists as a legal person" — a shell entity that
    // stops here is COMPLETE. Step 6 (treasury) is intentionally NOT here.
    number: 2,
    name: "Incorporation",
    steps: [
      { number: 4, label: "Review & Sign AoA" },
      { number: 5, label: "Review & Sign Reg GA" },
      { number: 7, label: "Founding Meeting & Minutes" },
      { number: SIGNING_STEP, label: "Incorporation Signing" },
    ],
  },
  {
    // Capability "Can hold & move money" — defined by the multisig (step 6).
    // The MPA (step 8) is additive/optional within the stage; it does not gate
    // the capability. An accessible OPTIONAL stage: it unlocks once the entity
    // is constituted (M1) and is reachable in the flow and the sidebar. (The
    // governance-only inputs — finance-policy URL, emergency procedures — are
    // hidden inside StepMultisigConfig; the core multisig config stays.)
    number: 3,
    name: "Treasury & Governance",
    optional: true,
    steps: [
      { number: 6, label: "Multisig Setup" },
      { number: 8, label: "Review & Sign MPA" },
    ],
  },
  {
    // Capability "Can contract people" — reachable straight after founding,
    // independently of Treasury.
    number: 4,
    name: "Supplier & Contributor Management",
    optional: true,
    steps: [{ number: 9, label: "Contributor agreements" }],
  },
  {
    // Optional onward capability that is not built yet. Full operation requires
    // a tax ID + a registered domicile provider (the "operational later" layer).
    // Mirrors the CapabilityFlow "Can invoice & get paid, compliantly" node.
    // number 6 (out of array order vs Dissolution) is intentional — it is only
    // used as a React key / milestone selector and is never shown (the card is
    // a muted coming-soon placeholder with no numbered circle).
    number: 6,
    name: "Operational",
    optional: true,
    comingSoon: true,
    description:
      "The full operational setup — coming next: obtain a tax ID and engage a registered domicile provider, so the entity can invoice and get paid compliantly. Completed later; the product will support this.",
    steps: [],
  },
  {
    // Optional end-of-lifecycle stage, presented as coming-soon for now (same
    // muted, non-clickable treatment as Operational). Founding is complete
    // without it — this must never make a founded-only entity read as unfinished.
    number: 5,
    name: "Dissolution",
    optional: true,
    comingSoon: true,
    comingSoonBadge: "Coming next",
    description:
      "Winding down — coming next. The end of the entity lifecycle: formal dissolution, asset distribution, closure. Sovereignty includes ending the entity cleanly, on your terms.",
    steps: [
      { number: 10, label: "Dissolution Details" },
      { number: 11, label: "Dissolution Resolution" },
    ],
  },
];

// Dissolution steps are always reachable regardless of milestone gating.
export const DISSOLUTION_FIRST_STEP = 10;

// The three founding-document steps whose ORDER matters — the only required,
// sequentially-gated chain. Everything else is either free data-entry
// (steps 0–3), an optional parallel branch (6/8/9), or dissolution (10/11).
export const REQUIRED_CHAIN_STEPS = [4, 5, 7] as const;
const OPTIONAL_BRANCH_STEPS = new Set([6, 8, 9]);

// The minimum signals needed to decide whether a step is a read-only preview.
// `minutesSigned` is Milestone M1 — the association legally exists.
export interface StepGate {
  aoaSigned: boolean;
  regGaSigned: boolean;
  minutesSigned: boolean;
}

// Is `step` a genuinely-locked read-only preview (not yet reachable)?
//
// Gating is per-branch, NOT one linear chain:
//   • Required founding chain, order matters: AoA (4) → Reg GA (5) →
//     Founding Meeting (7). Each is a preview until its predecessors are signed.
//   • Optional parallel branches (Treasury 6/8, Supplier & Contributor 9) open
//     together once the entity is constituted (M1). No cross-branch gating — a
//     user reaches the contributor agreement (9) after founding WITHOUT the
//     multisig (6).
//   • Welcome + data entry (0–3) and Dissolution (≥10) are always reachable.
export function isStepLocked(step: number, g: StepGate): boolean {
  if (step >= DISSOLUTION_FIRST_STEP) return false;
  // Incorporation signing is itself the founding act — never gate it behind a
  // "mark as signed" flag. The Sign button and the reducer enforce who may sign
  // (matching member, not yet signed, not already incorporated), and the step
  // warns about members without a wallet.
  if (step === SIGNING_STEP) return false;
  if (OPTIONAL_BRANCH_STEPS.has(step)) return !g.minutesSigned;
  if (step === 5) return !g.aoaSigned;
  if (step === 7) return !g.aoaSigned || !g.regGaSigned;
  return false;
}
