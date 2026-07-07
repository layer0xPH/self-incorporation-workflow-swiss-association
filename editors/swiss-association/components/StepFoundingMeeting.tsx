import { useState } from "react";
import type { SwissAssociationState } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import { setMeetingRoles } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";
import { Stage2DocumentStep } from "./Stage2DocumentStep.js";
import { buildFoundingMinutesMarkdown } from "./stage2Templates.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  // Once the minutes are signed (M1), continue to the post-founding gateway.
  onNext: () => void;
  onBack: () => void;
}

export function StepFoundingMeeting({
  state,
  dispatch,
  onNext,
  onBack,
}: Props) {
  const [chairName, setChairName] = useState(state.chairName ?? "");
  const [secretaryName, setSecretaryName] = useState(state.secretaryName ?? "");
  const [meetingIsOnline, setMeetingIsOnline] = useState(
    state.meetingIsOnline ?? true,
  );
  const [meetingVenue, setMeetingVenue] = useState(state.meetingVenue ?? "");
  const [counselName, setCounselName] = useState(state.counselName ?? "");
  const [rolesSaved, setRolesSaved] = useState(
    !!(state.chairName && state.secretaryName),
  );

  function handleSaveRoles() {
    dispatch(
      setMeetingRoles({
        chairName,
        chairRole: state.chairRole ?? "Chair",
        secretaryName,
        secretaryRole: state.secretaryRole ?? "Secretary",
        meetingIsOnline,
        meetingVenue: meetingIsOnline ? null : meetingVenue.trim() || null,
        counselName: counselName.trim() || null,
      }),
    );
    setRolesSaved(true);
  }

  const isValid =
    chairName.trim() !== "" &&
    secretaryName.trim() !== "" &&
    (meetingIsOnline || meetingVenue.trim() !== "");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Founding Meeting
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Now it is the moment to conduct the Founding Meeting, the initial
          meeting where a Swiss Association is formally created. The founding
          meeting must include at least two founding members who agree to
          establish the association.
        </p>
      </div>

      <SectionCard title="Meeting Roles">
        <div className="space-y-4">
          <FormField label="Who is chair?" required>
            <input
              type="text"
              value={chairName}
              onChange={(e) => setChairName(e.target.value)}
              placeholder="Full legal name"
              className="sw-input"
            />
          </FormField>
          <FormField label="Who is secretary?" required>
            <input
              type="text"
              value={secretaryName}
              onChange={(e) => setSecretaryName(e.target.value)}
              placeholder="Full legal name"
              className="sw-input"
            />
          </FormField>
          <FormField label="Meeting held online?">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={meetingIsOnline}
                onChange={(e) => setMeetingIsOnline(e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                {meetingIsOnline
                  ? "Yes — the founding meeting is held online."
                  : "No — held at a physical venue."}
              </span>
            </label>
          </FormField>
          {!meetingIsOnline && (
            <FormField label="Meeting venue" required>
              <input
                type="text"
                value={meetingVenue}
                onChange={(e) => setMeetingVenue(e.target.value)}
                placeholder="Venue name and location (e.g. MME offices, Zurich)"
                className="sw-input"
              />
            </FormField>
          )}
          <FormField label="Local counsel present (name)">
            <input
              type="text"
              value={counselName}
              onChange={(e) => setCounselName(e.target.value)}
              placeholder="Optional — leave empty if none (e.g. MME)"
              className="sw-input"
            />
          </FormField>
        </div>
        <div className="mt-4 flex gap-3">
          {!rolesSaved && (
            <button onClick={onBack} className="sw-btn-secondary">
              ← Back
            </button>
          )}
          <button
            onClick={handleSaveRoles}
            disabled={!isValid}
            className="sw-btn-primary"
          >
            {rolesSaved ? "Update Roles" : "Save Roles & Review Minutes →"}
          </button>
        </div>
      </SectionCard>

      {rolesSaved && (
        <Stage2DocumentStep
          title="Founding Meeting Minutes"
          description="Review the Founding Meeting Minutes generated from the data you provided. Sign to confirm the official record of the founding."
          documentType="FOUNDING_MINUTES"
          dispatch={dispatch}
          documentState={state.foundingMinutesDocument}
          generateMarkdown={() => buildFoundingMinutesMarkdown(state)}
          onBack={onBack}
          onNext={onNext}
          nextLabel="What's next →"
          nextRequiresSigned={true}
          lockedHint="The Founding Meeting Minutes are now locked and cannot be edited."
        />
      )}
    </div>
  );
}
