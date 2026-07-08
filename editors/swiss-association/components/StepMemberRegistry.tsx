import { useState } from "react";
import { generateId } from "document-model";
import type {
  SwissAssociationState,
  AssociationMember,
  MemberType,
} from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  actions,
  addMember,
  updateMember,
  removeMember,
} from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

function shortAddr(a: string | null | undefined): string {
  if (!a) return "no wallet set";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
  onBack: () => void;
}

type MemberForm = {
  id: string;
  type: MemberType;
  name: string;
  nationalityOrCountry: string;
  residenceOrCity: string;
  representative: string;
  ethereumAddress: string;
};

function emptyForm(): MemberForm {
  return {
    id: generateId(),
    type: "NATURAL_PERSON",
    name: "",
    nationalityOrCountry: "",
    residenceOrCity: "",
    representative: "",
    ethereumAddress: "",
  };
}

function MemberCard({
  member,
  onEdit,
  onRemove,
}: {
  member: AssociationMember;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            member.type === "NATURAL_PERSON"
              ? "bg-blue-100 text-blue-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {member.type === "NATURAL_PERSON" ? "P" : "E"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {member.residenceOrCity} · {member.nationalityOrCountry}
          </p>
          {member.representative && (
            <p className="text-xs text-slate-400 mt-0.5">
              Rep: {member.representative}
            </p>
          )}
          <p
            className={`text-xs mt-0.5 font-mono ${
              member.ethereumAddress ? "text-slate-500" : "text-slate-300"
            }`}
            title={member.ethereumAddress ?? undefined}
          >
            {shortAddr(member.ethereumAddress)}
          </p>
          <span
            className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium ${
              member.type === "NATURAL_PERSON"
                ? "bg-blue-50 text-blue-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >
            {member.type === "NATURAL_PERSON"
              ? "Natural Person"
              : "Legal Entity"}
          </span>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="text-xs px-3 py-1.5 text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function MemberFormModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: MemberForm;
  onSave: (form: MemberForm) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MemberForm>(initial);
  const isValid =
    form.name && form.nationalityOrCountry && form.residenceOrCity;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {initial.name ? "Edit Member" : "Add Founding Member"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Swiss law requires at least 2 founding members.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <FormField label="Member Type">
            <div className="flex gap-3">
              {(["NATURAL_PERSON", "LEGAL_ENTITY"] as MemberType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t === "NATURAL_PERSON" ? "Natural Person" : "Legal Entity"}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Full Legal Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                form.type === "NATURAL_PERSON"
                  ? "Alice Müller"
                  : "Acme Labs LLC"
              }
              className="sw-input"
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={
                form.type === "NATURAL_PERSON"
                  ? "Nationality"
                  : "Country of Incorporation"
              }
              required
            >
              <input
                type="text"
                value={form.nationalityOrCountry}
                onChange={(e) =>
                  setForm({ ...form, nationalityOrCountry: e.target.value })
                }
                placeholder="Swiss"
                className="sw-input"
              />
            </FormField>
            <FormField
              label={
                form.type === "NATURAL_PERSON"
                  ? "City of Residence"
                  : "City of Incorporation"
              }
              required
            >
              <input
                type="text"
                value={form.residenceOrCity}
                onChange={(e) =>
                  setForm({ ...form, residenceOrCity: e.target.value })
                }
                placeholder="Zurich, Switzerland"
                className="sw-input"
              />
            </FormField>
          </div>

          {form.type === "LEGAL_ENTITY" && (
            <FormField
              label="Representative Name"
              hint="Person signing on behalf of the entity"
            >
              <input
                type="text"
                value={form.representative}
                onChange={(e) =>
                  setForm({ ...form, representative: e.target.value })
                }
                placeholder="Bob Smith"
                className="sw-input"
              />
            </FormField>
          )}

          <FormField
            label="Ethereum address (wallet)"
            hint="Used to sign for incorporation with this member's own wallet"
          >
            <input
              type="text"
              value={form.ethereumAddress}
              onChange={(e) =>
                setForm({ ...form, ethereumAddress: e.target.value.trim() })
              }
              placeholder="0x…"
              className="sw-input"
            />
          </FormField>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid}
            className="sw-btn-primary"
          >
            {initial.name ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepMemberRegistry({ state, dispatch, onNext, onBack }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberForm | null>(null);

  function handleAdd(form: MemberForm) {
    dispatch(
      addMember({
        id: form.id,
        type: form.type,
        name: form.name,
        nationalityOrCountry: form.nationalityOrCountry,
        residenceOrCity: form.residenceOrCity,
        representative: form.representative || undefined,
        ethereumAddress: form.ethereumAddress || undefined,
      }),
    );
    setShowForm(false);
  }

  function handleUpdate(form: MemberForm) {
    dispatch(
      updateMember({
        id: form.id,
        type: form.type,
        name: form.name,
        nationalityOrCountry: form.nationalityOrCountry,
        residenceOrCity: form.residenceOrCity,
        representative: form.representative || undefined,
      }),
    );
    if (form.ethereumAddress) {
      dispatch(
        actions.setMemberEthereumAddress({
          id: form.id,
          ethereumAddress: form.ethereumAddress,
        }),
      );
    }
    setEditingMember(null);
  }

  function handleRemove(id: string) {
    dispatch(removeMember({ id }));
  }

  const memberCount = state.members.length;
  const hasMinimum = memberCount >= 2;

  return (
    <div className="max-w-2xl space-y-6">
      {(showForm || editingMember) && (
        <MemberFormModal
          initial={editingMember ?? emptyForm()}
          onSave={editingMember ? handleUpdate : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Member Registry
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Association members govern and control the association through their
          membership rights, such as voting in the general assembly, electing
          the board, and approving key decisions. However, they do not own the
          association in the way shareholders own a company: they hold
          membership rights, not shares, and they generally have no ownership
          claim over the association's assets.
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          memberCount === 0
            ? "bg-slate-50 border-slate-200"
            : hasMinimum
              ? state.belowRecommendedMemberCount
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            memberCount === 0
              ? "bg-slate-200 text-slate-500"
              : hasMinimum
                ? state.belowRecommendedMemberCount
                  ? "bg-amber-200 text-amber-700"
                  : "bg-green-200 text-green-700"
                : "bg-red-200 text-red-700"
          }`}
        >
          {memberCount}
        </div>
        <div>
          <p
            className={`text-sm font-medium ${
              memberCount === 0
                ? "text-slate-600"
                : hasMinimum
                  ? state.belowRecommendedMemberCount
                    ? "text-amber-800"
                    : "text-green-800"
                  : "text-red-800"
            }`}
          >
            {memberCount === 0 && "No members yet — add at least 2 to proceed"}
            {memberCount === 1 &&
              "1 member — add at least 1 more (legal minimum)"}
            {memberCount === 2 && "2 members — legal minimum met."}
            {memberCount >= 3 &&
              `${memberCount} members — recommended threshold met ✓`}
          </p>
        </div>
      </div>

      <SectionCard title="Founding Members">
        <div className="space-y-3">
          {state.members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() =>
                setEditingMember({
                  id: member.id,
                  type: member.type,
                  name: member.name,
                  nationalityOrCountry: member.nationalityOrCountry,
                  residenceOrCity: member.residenceOrCity,
                  representative: member.representative ?? "",
                  ethereumAddress: member.ethereumAddress ?? "",
                })
              }
              onRemove={() => handleRemove(member.id)}
            />
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            + Add Founding Member
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasMinimum}
          className="sw-btn-primary"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
