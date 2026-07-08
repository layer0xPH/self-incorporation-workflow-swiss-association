import type { ReactNode } from "react";
import { useUser } from "@powerhousedao/reactor-browser";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import { actions } from "document-models/swiss-association";
import type {
  SwissAssociationState,
  SwissAssociationAction,
} from "document-models/swiss-association";
import { SectionCard } from "./SectionCard.js";

// Mirrors the dispatch typing convention of the sibling step components (see
// StepFoundingMeeting.tsx) so `dispatch(actions.signForIncorporation(...))`
// typechecks against the same `safeDispatch` passed by editor.tsx.
interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onBack: () => void;
  onContinue: () => void;
}

function shortAddr(a: string | null | undefined): string {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function StepIncorporationSigning({
  state,
  dispatch,
  onBack,
  onContinue,
}: Props) {
  const user = useUser();
  const myAddress = user ? user.address.toLowerCase() : undefined;

  const members = state.members;
  const signedCount = members.filter((m) => m.incorporationSignedAt).length;
  const completedAt = state.incorporationCompletedAt;
  const incorporated = !!completedAt;
  // Members with no wallet can never sign, so incorporation cannot complete
  // until every one of them has an address. Surface this instead of leaving
  // them as silent "pending" rows.
  const unaddressed = members.filter((m) => !m.ethereumAddress);

  const myMember = myAddress
    ? members.find(
        (m) =>
          m.ethereumAddress && m.ethereumAddress.toLowerCase() === myAddress,
      )
    : undefined;

  const canSign = !!myMember && !myMember.incorporationSignedAt && !incorporated;

  function handleSign() {
    dispatch(
      actions.signForIncorporation({ signedAt: new Date().toISOString() }),
    );
  }

  let actionArea: ReactNode;
  if (completedAt) {
    actionArea = (
      <p style={{ fontWeight: 600, color: "#16a34a" }}>
        Entity incorporated on {new Date(completedAt).toLocaleString()}
      </p>
    );
  } else if (!myAddress) {
    actionArea = (
      <button className="sw-btn-primary" disabled>
        Connect your wallet to sign
      </button>
    );
  } else if (!myMember) {
    actionArea = (
      <button className="sw-btn-primary" disabled title={myAddress}>
        Your wallet isn&apos;t among the founding members
      </button>
    );
  } else if (myMember.incorporationSignedAt) {
    actionArea = (
      <p style={{ fontWeight: 600, color: "#16a34a" }}>
        ✓ You signed on{" "}
        {new Date(myMember.incorporationSignedAt).toLocaleString()}
      </p>
    );
  } else {
    actionArea = (
      <button
        className="sw-btn-primary"
        onClick={handleSign}
        disabled={!canSign}
      >
        Sign for Incorporation
      </button>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Incorporation Signing
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Each founding member signs for incorporation with their own wallet.
          The entity becomes incorporated only once every founding member has
          signed.
        </p>
      </div>

      <SectionCard title="Founding Members Roll-Call">
        <p className="text-sm text-slate-600">
          {signedCount} of {members.length} founding members have signed.
        </p>
        {!incorporated && unaddressed.length > 0 && (
          <div
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            role="status"
          >
            {unaddressed.length === 1
              ? `${unaddressed[0].name} has no wallet address set and cannot sign.`
              : `${unaddressed.length} founding members have no wallet address set and cannot sign.`}{" "}
            Incorporation can only complete once every member has an address —
            set them in the Member Registry step.
          </div>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
          {members.map((m) => {
            const isMe =
              !!myAddress &&
              !!m.ethereumAddress &&
              m.ethereumAddress.toLowerCase() === myAddress;
            return (
              <li
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: isMe ? "#fef2f2" : "transparent",
                }}
              >
                <span className="text-sm text-slate-700">
                  {m.name}{" "}
                  <span style={{ color: "#94a3b8" }} className="font-mono">
                    {shortAddr(m.ethereumAddress)}
                  </span>
                  {isMe ? (
                    <strong className="text-red-700"> — This is you</strong>
                  ) : null}
                </span>
                <span className="text-sm">
                  {m.incorporationSignedAt ? (
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      ✓ signed{" "}
                      {new Date(
                        m.incorporationSignedAt,
                      ).toLocaleDateString()}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>⏳ pending</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div style={{ margin: "1rem 0" }}>{actionArea}</div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button className="sw-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="sw-btn-secondary" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}
