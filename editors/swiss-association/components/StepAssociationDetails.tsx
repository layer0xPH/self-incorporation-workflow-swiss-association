import { useState } from "react";
import type {
  SwissAssociationState,
  PrimaryLanguage,
} from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  setAssociationName,
  setAssociationSeat,
  setFiscalDetails,
  setPurpose,
} from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
}

export function StepAssociationDetails({ state, dispatch, onNext }: Props) {
  const [nameEn, setNameEn] = useState(state.nameEn ?? "");
  const [nameDe, setNameDe] = useState(state.nameDe ?? "");
  const [seatCity, setSeatCity] = useState(state.seatCity ?? "Zug");
  const [seatCanton, setSeatCanton] = useState(
    state.seatCanton ?? "Canton Zug",
  );
  const [registeredAddress, setRegisteredAddress] = useState(
    state.registeredAddress ?? "",
  );
  // Fiscal year-end, membership fee and primary language are hidden in the MVP
  // editor but retained in the model — their values still flow through
  // handleSave with sensible defaults. (Setters dropped since nothing edits them.)
  const [fiscalYearEnd] = useState(state.fiscalYearEnd ?? "31 December");
  const [membershipFee] = useState(state.membershipFee ?? "none");
  const [primaryLanguage] = useState<PrimaryLanguage>(
    state.primaryLanguage ?? "EN",
  );
  const [purposeEn, setPurposeEn] = useState(state.purposeEn ?? "");
  const [purposeDe, setPurposeDe] = useState(state.purposeDe ?? "");

  function handleSave() {
    if (nameEn)
      dispatch(setAssociationName({ nameEn, nameDe: nameDe || undefined }));
    if (seatCity && seatCanton)
      dispatch(
        setAssociationSeat({
          seatCity,
          seatCanton,
          registeredAddress: registeredAddress || undefined,
        }),
      );
    dispatch(
      setFiscalDetails({ fiscalYearEnd, membershipFee, primaryLanguage }),
    );
    if (purposeEn)
      dispatch(setPurpose({ purposeEn, purposeDe: purposeDe || undefined }));
    onNext();
  }

  // The registered street address is optional: a Swiss Verein is validly
  // founded with only its municipality (city) + canton named in the statutes.
  // The street address belongs to the later operational (domicile-provider) layer.
  const isValid =
    nameEn.trim() !== "" &&
    seatCity.trim() !== "" &&
    seatCanton.trim() !== "" &&
    purposeEn.trim() !== "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Association Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define the identity and purpose of your Swiss association. This
          information will appear in your Articles of Association.
        </p>
      </div>

      <SectionCard title="Identity">
        <FormField label="Association Name (English)" required>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Open Protocol Foundation"
            className="sw-input"
          />
        </FormField>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-800 mb-1">
            Swiss filing note
          </p>
          <p className="text-xs text-amber-700">
            The editor drafts in English. Official filing outputs will still
            require German translations of required sections before submission
            in Switzerland.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Registered Seat">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" required>
            <input
              type="text"
              value={seatCity}
              onChange={(e) => setSeatCity(e.target.value)}
              placeholder="Zug"
              className="sw-input"
            />
          </FormField>
          <FormField label="Canton" required>
            <input
              type="text"
              value={seatCanton}
              onChange={(e) => setSeatCanton(e.target.value)}
              placeholder="Canton Zug"
              className="sw-input"
            />
          </FormField>
        </div>
        <FormField label="Registered Address">
          <input
            type="text"
            value={registeredAddress}
            onChange={(e) => setRegisteredAddress(e.target.value)}
            placeholder="c/o Provider, Bahnhofstrasse 1, 6300 Zug"
            className="sw-input"
          />
          {!registeredAddress.trim() && (
            <p className="text-xs text-slate-400 mt-1">
              Optional — a registered street address is added when you engage a
              domicile provider (operational step).
            </p>
          )}
        </FormField>
      </SectionCard>

      {/* Fiscal card (fiscal year-end + annual membership fee) hidden for the
          MVP editor — values retained in the model via handleSave defaults.
          Reintroduce post-workshop. */}

      <SectionCard title="Purpose Clause">
        <FormField
          label="Purpose (English)"
          required
          hint="2–4 sentences. This appears directly in Art. 2 of your Articles of Association."
        >
          <textarea
            value={purposeEn}
            onChange={(e) => setPurposeEn(e.target.value)}
            rows={4}
            placeholder="The purpose of the Association is to support and fund the development of open source software as a public good..."
            className="sw-input resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Your purpose statement also feeds the suitability analysis.
          </p>
        </FormField>
        {purposeEn && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-1">
              Legal note
            </p>
            <p className="text-xs text-amber-700">
              The English version will prevail unless you update the language
              clause. Ensure the purpose is exclusively non-commercial for Art.
              60 ZGB compliance.
            </p>
          </div>
        )}
      </SectionCard>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Please fill in all required fields before continuing:{" "}
          {[
            !nameEn.trim() && "Association Name (English)",
            !seatCity.trim() && "City",
            !seatCanton.trim() && "Canton",
            !purposeEn.trim() && "Purpose (English)",
          ]
            .filter(Boolean)
            .join(", ")}
          .
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="sw-btn-primary"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
