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
  const incorporated = !!state.incorporationCompletedAt;

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
  if (incorporated) {
    actionArea = (
      <p style={{ fontWeight: 600, color: "#16a34a" }}>
        Entity incorporated on{" "}
        {new Date(state.incorporationCompletedAt as string).toLocaleString()}
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
