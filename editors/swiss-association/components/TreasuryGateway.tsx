import { useState } from "react";
import type { SwissAssociationState } from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  // Route into the multisig setup step (step 6). The caller also marks Stage 2
  // started so document generation can begin.
  onSetupMultisig: () => void;
  // Reopen the executed Articles of Association (step 4).
  onOpenAoa?: () => void;
}

type Choice = "yes" | "no" | null;

// Yes/No toggle matching the wallet-question styling used in StepMultisigConfig.
function ChoiceButtons({
  value,
  onYes,
  onNo,
}: {
  value: Choice;
  onYes: () => void;
  onNo: () => void;
}) {
  const base =
    "px-5 py-2 rounded-lg text-sm font-medium border transition-colors";
  const active = "bg-red-600 border-red-600 text-white";
  const idle =
    "bg-white border-slate-200 text-slate-600 hover:border-slate-300";
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onYes}
        className={`${base} ${value === "yes" ? active : idle}`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={onNo}
        className={`${base} ${value === "no" ? active : idle}`}
      >
        No
      </button>
    </div>
  );
}

// The post-founding front door. Reached only once the founding minutes are
// signed (Milestone M1), so the entity legally exists before any of this shows.
// It routes the constituted entity to one of three honest endpoints:
//   • no treasury           → a deliberate minimal-liability wrapper (complete)
//   • treasury + multisig   → the one built mechanism → multisig setup (step 6)
//   • treasury, no multisig → intent captured, mechanism pending (not complete,
//                             not incomplete — the only built rail is the multisig)
export function TreasuryGateway({ state, onSetupMultisig, onOpenAoa }: Props) {
  const [treasury, setTreasury] = useState<Choice>(null);
  const [multisig, setMultisig] = useState<Choice>(null);

  const name = state.nameEn || state.nameDe || "The association";
  // If a multisig is already configured, don't re-ask — reflect the achieved
  // state (the choice itself is local, but the outcome is persisted).
  const multisigConfigured = !!state.multisig;

  return (
    <div className="space-y-5">
      {/* Milestone M1 — prominent, solid-green banner so the achievement reads
          at a glance, not just as a colour change in the capability diagram. */}
      <div className="p-5 bg-green-600 rounded-xl text-white shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          Milestone M1
        </span>
        <h3 className="text-lg font-semibold mt-2">
          Legal personhood achieved
        </h3>
        <p className="text-sm text-green-50 mt-1">
          {name} now exists as a legal person under Art. 60 ZGB. The founding is
          complete — everything from here is an optional capability you add when
          you need it.
        </p>
        {onOpenAoa && (
          <button
            type="button"
            onClick={onOpenAoa}
            className="mt-3 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-green-700 hover:bg-green-50 transition-colors"
          >
            Open Executed Articles of Association
          </button>
        )}
      </div>

      {multisigConfigured ? (
        // Derived from persisted state: a multisig exists, so the treasury path
        // is already underway. Point onward to the participation agreement.
        <SectionCard title="Treasury">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800">
              Treasury configured
            </p>
            <p className="text-xs text-green-700 mt-1">
              A {state.multisig?.decisionQuorum}-of-{state.multisig?.keysTotal}{" "}
              multisig is set up. Continue to review and sign the Multisig
              Participation Agreement.
            </p>
            <button
              type="button"
              onClick={onSetupMultisig}
              className="sw-btn-primary mt-3"
            >
              Review multisig setup →
            </button>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="What's next?">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Set up a treasury?
              </p>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">
                A way for the association to hold and move money — a crypto
                multisig now, banking rails later.
              </p>
              <ChoiceButtons
                value={treasury}
                onYes={() => setTreasury("yes")}
                onNo={() => {
                  setTreasury("no");
                  setMultisig(null);
                }}
              />
            </div>

            {/* Treasury = No → deliberate minimal-liability wrapper. A valid,
                complete endpoint — styled as an achievement, never as red. */}
            {treasury === "no" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-green-800">
                  You're done — {name} is complete
                </p>
                <p className="text-xs text-green-700 mt-1">
                  A constituted association with no treasury is a deliberate,
                  fully valid endpoint: a minimal liability wrapper that exists
                  as a legal person and can act in its own name. You can add a
                  treasury (or any other capability) later, whenever you need
                  it.
                </p>
              </div>
            )}

            {/* Treasury = Yes → the only mechanism built today is the multisig. */}
            {treasury === "yes" && (
              <div className="pt-1 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-800 mt-3">
                  Set up or integrate a multisig?
                </p>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  The multisig is the treasury mechanism this workflow builds
                  today.
                </p>
                <ChoiceButtons
                  value={multisig}
                  onYes={() => {
                    setMultisig("yes");
                    onSetupMultisig();
                  }}
                  onNo={() => setMultisig("no")}
                />
              </div>
            )}

            {/* Treasury = Yes, Multisig = No → intent captured, mechanism
                pending. Neutral (not green-complete, not red-incomplete). */}
            {treasury === "yes" && multisig === "no" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-blue-900">
                  Treasury intent noted — mechanism pending
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  You want a treasury, but the only rail this workflow builds
                  today is the multisig. Other rails (banking, custodians) are
                  coming next, or your team can set one up independently. When
                  you're ready, come back and set up the multisig.
                </p>
                <button
                  type="button"
                  onClick={onSetupMultisig}
                  className="sw-btn-primary mt-3"
                >
                  Set up the multisig instead →
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
