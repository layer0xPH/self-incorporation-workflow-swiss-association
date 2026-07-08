/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddBoardMemberInput,
  AddContributorAgreementInput,
  AddMemberInput,
  AddNoteInput,
  AdvancePhaseInput,
  AssociationMember,
  ContributorAgreement,
  ContributorTermType,
  CopyFoundingMembersToBoardInput,
  Dissolution,
  DissolutionResolutionForm,
  GeneratedStage2Document,
  MarkContributorAgreementSignedInput,
  MarkStage2DocumentSignedInput,
  MemberType,
  MultisigConfig,
  PhaseRecord,
  PhaseStatus,
  PrimaryLanguage,
  RemoveBoardMemberInput,
  RemoveContributorAgreementInput,
  RemoveMemberInput,
  SetAssociationNameInput,
  SetAssociationSeatInput,
  SetContributorAgreementMarkdownInput,
  SetDissolutionDetailsInput,
  SetFiscalDetailsInput,
  SetFoundingDateInput,
  SetMeetingRolesInput,
  SetMemberEthereumAddressInput,
  SetMultisigConfigInput,
  SetPurposeInput,
  SetStage2DocumentMarkdownInput,
  SignForIncorporationInput,
  Stage2DocumentType,
  StartStage_2Input,
  SwissAssociationState,
  UpdateBoardMemberInput,
  UpdateContributorAgreementInput,
  UpdateMemberInput,
  UpdatePhaseStatusInput,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const ContributorTermTypeSchema = z.enum([
  "FIXED_DATE",
  "NOTICE",
  "ON_SOW_COMPLETION",
]);

export const DissolutionResolutionFormSchema = z.enum([
  "PHYSICAL",
  "VIRTUAL",
  "WRITTEN",
]);

export const MemberTypeSchema = z.enum(["LEGAL_ENTITY", "NATURAL_PERSON"]);

export const PhaseStatusSchema = z.enum([
  "AWAITING_SIGNATURES",
  "COMPLETE",
  "IN_PROGRESS",
  "LOCKED",
]);

export const PrimaryLanguageSchema = z.enum(["DE", "EN"]);

export const Stage2DocumentTypeSchema = z.enum([
  "AOA",
  "DISSOLUTION_RESOLUTION",
  "FOUNDING_MINUTES",
  "MPA",
  "REG_GA",
]);

export function AddBoardMemberInputSchema(): z.ZodObject<
  Properties<AddBoardMemberInput>
> {
  return z.object({
    id: z.string(),
    name: z.string(),
    nationalityOrCountry: z.string(),
    representative: z.string().nullish(),
    residenceOrCity: z.string(),
    type: MemberTypeSchema,
  });
}

export function AddContributorAgreementInputSchema(): z.ZodObject<
  Properties<AddContributorAgreementInput>
> {
  return z.object({
    compensation: z.string().nullish(),
    contractDate: z.iso.datetime().nullish(),
    contractorAddress: z.string().nullish(),
    contractorIsEntity: z.boolean(),
    contractorName: z.string().nullish(),
    contractorNationality: z.string().nullish(),
    denominationCurrency: z.string().nullish(),
    denominationType: z.string().nullish(),
    entityJurisdiction: z.string().nullish(),
    entityName: z.string().nullish(),
    entityType: z.string().nullish(),
    fteHours: z.string().nullish(),
    id: z.string(),
    role: z.string().nullish(),
    services: z.string().nullish(),
    sowNumber: z.string().nullish(),
    termType: ContributorTermTypeSchema,
    terminationNoticePeriod: z.string().nullish(),
    workEndDate: z.iso.datetime().nullish(),
    workStartDate: z.iso.datetime().nullish(),
  });
}

export function AddMemberInputSchema(): z.ZodObject<
  Properties<AddMemberInput>
> {
  return z.object({
    ethereumAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    id: z.string(),
    name: z.string(),
    nationalityOrCountry: z.string(),
    representative: z.string().nullish(),
    residenceOrCity: z.string(),
    type: MemberTypeSchema,
  });
}

export function AddNoteInputSchema(): z.ZodObject<Properties<AddNoteInput>> {
  return z.object({
    note: z.string(),
  });
}

export function AdvancePhaseInputSchema(): z.ZodObject<
  Properties<AdvancePhaseInput>
> {
  return z.object({
    completedDate: z.iso.datetime(),
  });
}

export function AssociationMemberSchema(): z.ZodObject<
  Properties<AssociationMember>
> {
  return z.object({
    __typename: z.literal("AssociationMember").optional(),
    ethereumAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    id: z.string(),
    incorporationSignedAt: z.iso.datetime().nullish(),
    name: z.string(),
    nationalityOrCountry: z.string(),
    representative: z.string().nullish(),
    residenceOrCity: z.string(),
    type: MemberTypeSchema,
  });
}

export function ContributorAgreementSchema(): z.ZodObject<
  Properties<ContributorAgreement>
> {
  return z.object({
    __typename: z.literal("ContributorAgreement").optional(),
    compensation: z.string().nullish(),
    contractDate: z.iso.datetime().nullish(),
    contractorAddress: z.string().nullish(),
    contractorIsEntity: z.boolean(),
    contractorName: z.string().nullish(),
    contractorNationality: z.string().nullish(),
    denominationCurrency: z.string().nullish(),
    denominationType: z.string().nullish(),
    entityJurisdiction: z.string().nullish(),
    entityName: z.string().nullish(),
    entityType: z.string().nullish(),
    fteHours: z.string().nullish(),
    generatedDocument: z.lazy(() => GeneratedStage2DocumentSchema().nullish()),
    id: z.string(),
    role: z.string().nullish(),
    services: z.string().nullish(),
    sowNumber: z.string().nullish(),
    termType: ContributorTermTypeSchema,
    terminationNoticePeriod: z.string().nullish(),
    workEndDate: z.iso.datetime().nullish(),
    workStartDate: z.iso.datetime().nullish(),
  });
}

export function CopyFoundingMembersToBoardInputSchema(): z.ZodObject<
  Properties<CopyFoundingMembersToBoardInput>
> {
  return z.object({
    confirm: z.boolean(),
  });
}

export function DissolutionSchema(): z.ZodObject<Properties<Dissolution>> {
  return z.object({
    __typename: z.literal("Dissolution").optional(),
    assetRecipient: z.string().nullish(),
    dissolutionDate: z.iso.datetime().nullish(),
    executingPersons: z.string().nullish(),
    remainingAssetsSummary: z.string().nullish(),
    resolutionForm: DissolutionResolutionFormSchema.nullish(),
  });
}

export function GeneratedStage2DocumentSchema(): z.ZodObject<
  Properties<GeneratedStage2Document>
> {
  return z.object({
    __typename: z.literal("GeneratedStage2Document").optional(),
    isLocked: z.boolean().nullish(),
    isSigned: z.boolean().nullish(),
    markdown: z.string().nullish(),
    signedAt: z.iso.datetime().nullish(),
  });
}

export function MarkContributorAgreementSignedInputSchema(): z.ZodObject<
  Properties<MarkContributorAgreementSignedInput>
> {
  return z.object({
    id: z.string(),
    signedAt: z.iso.datetime(),
  });
}

export function MarkStage2DocumentSignedInputSchema(): z.ZodObject<
  Properties<MarkStage2DocumentSignedInput>
> {
  return z.object({
    documentType: Stage2DocumentTypeSchema,
    signedAt: z.iso.datetime(),
  });
}

export function MultisigConfigSchema(): z.ZodObject<
  Properties<MultisigConfig>
> {
  return z.object({
    __typename: z.literal("MultisigConfig").optional(),
    address: z.string().nullish(),
    availabilityThreshold: z.string().nullish(),
    decisionQuorum: z.number().nullish(),
    emergencyProcedures: z.string().nullish(),
    internalPolicyLink: z.string().nullish(),
    keysTotal: z.number().nullish(),
    multisigDate: z.iso.datetime().nullish(),
    platform: z.string().nullish(),
    privateChannel: z.string().nullish(),
  });
}

export function PhaseRecordSchema(): z.ZodObject<Properties<PhaseRecord>> {
  return z.object({
    __typename: z.literal("PhaseRecord").optional(),
    completedDate: z.iso.datetime().nullish(),
    documentsGenerated: z.boolean(),
    documentsSigned: z.boolean(),
    id: z.string(),
    name: z.string(),
    phaseNumber: z.number(),
    status: PhaseStatusSchema,
  });
}

export function RemoveBoardMemberInputSchema(): z.ZodObject<
  Properties<RemoveBoardMemberInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveContributorAgreementInputSchema(): z.ZodObject<
  Properties<RemoveContributorAgreementInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveMemberInputSchema(): z.ZodObject<
  Properties<RemoveMemberInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetAssociationNameInputSchema(): z.ZodObject<
  Properties<SetAssociationNameInput>
> {
  return z.object({
    nameDe: z.string().nullish(),
    nameEn: z.string(),
  });
}

export function SetAssociationSeatInputSchema(): z.ZodObject<
  Properties<SetAssociationSeatInput>
> {
  return z.object({
    registeredAddress: z.string().nullish(),
    seatCanton: z.string(),
    seatCity: z.string(),
  });
}

export function SetContributorAgreementMarkdownInputSchema(): z.ZodObject<
  Properties<SetContributorAgreementMarkdownInput>
> {
  return z.object({
    id: z.string(),
    markdown: z.string(),
  });
}

export function SetDissolutionDetailsInputSchema(): z.ZodObject<
  Properties<SetDissolutionDetailsInput>
> {
  return z.object({
    assetRecipient: z.string().nullish(),
    dissolutionDate: z.iso.datetime().nullish(),
    executingPersons: z.string().nullish(),
    remainingAssetsSummary: z.string().nullish(),
    resolutionForm: DissolutionResolutionFormSchema.nullish(),
  });
}

export function SetFiscalDetailsInputSchema(): z.ZodObject<
  Properties<SetFiscalDetailsInput>
> {
  return z.object({
    fiscalYearEnd: z.string().nullish(),
    membershipFee: z.string().nullish(),
    primaryLanguage: PrimaryLanguageSchema.nullish(),
  });
}

export function SetFoundingDateInputSchema(): z.ZodObject<
  Properties<SetFoundingDateInput>
> {
  return z.object({
    foundingDate: z.iso.datetime(),
  });
}

export function SetMeetingRolesInputSchema(): z.ZodObject<
  Properties<SetMeetingRolesInput>
> {
  return z.object({
    chairName: z.string(),
    chairRole: z.string(),
    counselName: z.string().nullish(),
    meetingIsOnline: z.boolean(),
    meetingVenue: z.string().nullish(),
    secretaryName: z.string(),
    secretaryRole: z.string(),
  });
}

export function SetMemberEthereumAddressInputSchema(): z.ZodObject<
  Properties<SetMemberEthereumAddressInput>
> {
  return z.object({
    ethereumAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      }),
    id: z.string(),
  });
}

export function SetMultisigConfigInputSchema(): z.ZodObject<
  Properties<SetMultisigConfigInput>
> {
  return z.object({
    address: z.string(),
    availabilityThreshold: z.string().nullish(),
    decisionQuorum: z.number(),
    emergencyProcedures: z.string().nullish(),
    internalPolicyLink: z.string().nullish(),
    keysTotal: z.number(),
    multisigDate: z.iso.datetime().nullish(),
    platform: z.string(),
    privateChannel: z.string().nullish(),
  });
}

export function SetPurposeInputSchema(): z.ZodObject<
  Properties<SetPurposeInput>
> {
  return z.object({
    purposeDe: z.string().nullish(),
    purposeEn: z.string(),
  });
}

export function SetStage2DocumentMarkdownInputSchema(): z.ZodObject<
  Properties<SetStage2DocumentMarkdownInput>
> {
  return z.object({
    documentType: Stage2DocumentTypeSchema,
    markdown: z.string(),
  });
}

export function SignForIncorporationInputSchema(): z.ZodObject<
  Properties<SignForIncorporationInput>
> {
  return z.object({
    signedAt: z.iso.datetime(),
  });
}

export function StartStage_2InputSchema(): z.ZodObject<
  Properties<StartStage_2Input>
> {
  return z.object({
    startedAt: z.iso.datetime(),
  });
}

export function SwissAssociationStateSchema(): z.ZodObject<
  Properties<SwissAssociationState>
> {
  return z.object({
    __typename: z.literal("SwissAssociationState").optional(),
    aoaDocument: z.lazy(() => GeneratedStage2DocumentSchema().nullish()),
    belowRecommendedMemberCount: z.boolean().nullish(),
    boardMembers: z.array(z.lazy(() => AssociationMemberSchema())).nullish(),
    chairName: z.string().nullish(),
    chairRole: z.string().nullish(),
    contributorAgreements: z.array(z.lazy(() => ContributorAgreementSchema())),
    counselName: z.string().nullish(),
    currentPhase: z.number().nullish(),
    customNotes: z.array(z.string()),
    dissolution: z.lazy(() => DissolutionSchema().nullish()),
    dissolutionResolutionDocument: z.lazy(() =>
      GeneratedStage2DocumentSchema().nullish(),
    ),
    fiscalYearEnd: z.string().nullish(),
    foundingDate: z.iso.datetime().nullish(),
    foundingMinutesDocument: z.lazy(() =>
      GeneratedStage2DocumentSchema().nullish(),
    ),
    incorporationCompletedAt: z.iso.datetime().nullish(),
    isPersonalunion: z.boolean().nullish(),
    languageClauseNeedsUpdate: z.boolean().nullish(),
    meetingIsOnline: z.boolean().nullish(),
    meetingVenue: z.string().nullish(),
    members: z.array(z.lazy(() => AssociationMemberSchema())),
    membershipFee: z.string().nullish(),
    mpaDocument: z.lazy(() => GeneratedStage2DocumentSchema().nullish()),
    multisig: z.lazy(() => MultisigConfigSchema().nullish()),
    nameDe: z.string().nullish(),
    nameEn: z.string().nullish(),
    phases: z.array(z.lazy(() => PhaseRecordSchema())),
    primaryLanguage: PrimaryLanguageSchema.nullish(),
    purposeDe: z.string().nullish(),
    purposeEn: z.string().nullish(),
    regGaDocument: z.lazy(() => GeneratedStage2DocumentSchema().nullish()),
    registeredAddress: z.string().nullish(),
    registeredAddressConfirmed: z.boolean().nullish(),
    seatCanton: z.string().nullish(),
    seatCity: z.string().nullish(),
    secretaryName: z.string().nullish(),
    secretaryRole: z.string().nullish(),
    stage2Started: z.boolean().nullish(),
  });
}

export function UpdateBoardMemberInputSchema(): z.ZodObject<
  Properties<UpdateBoardMemberInput>
> {
  return z.object({
    id: z.string(),
    name: z.string().nullish(),
    nationalityOrCountry: z.string().nullish(),
    representative: z.string().nullish(),
    residenceOrCity: z.string().nullish(),
    type: MemberTypeSchema.nullish(),
  });
}

export function UpdateContributorAgreementInputSchema(): z.ZodObject<
  Properties<UpdateContributorAgreementInput>
> {
  return z.object({
    compensation: z.string().nullish(),
    contractDate: z.iso.datetime().nullish(),
    contractorAddress: z.string().nullish(),
    contractorIsEntity: z.boolean().nullish(),
    contractorName: z.string().nullish(),
    contractorNationality: z.string().nullish(),
    denominationCurrency: z.string().nullish(),
    denominationType: z.string().nullish(),
    entityJurisdiction: z.string().nullish(),
    entityName: z.string().nullish(),
    entityType: z.string().nullish(),
    fteHours: z.string().nullish(),
    id: z.string(),
    role: z.string().nullish(),
    services: z.string().nullish(),
    sowNumber: z.string().nullish(),
    termType: ContributorTermTypeSchema.nullish(),
    terminationNoticePeriod: z.string().nullish(),
    workEndDate: z.iso.datetime().nullish(),
    workStartDate: z.iso.datetime().nullish(),
  });
}

export function UpdateMemberInputSchema(): z.ZodObject<
  Properties<UpdateMemberInput>
> {
  return z.object({
    id: z.string(),
    name: z.string().nullish(),
    nationalityOrCountry: z.string().nullish(),
    representative: z.string().nullish(),
    residenceOrCity: z.string().nullish(),
    type: MemberTypeSchema.nullish(),
  });
}

export function UpdatePhaseStatusInputSchema(): z.ZodObject<
  Properties<UpdatePhaseStatusInput>
> {
  return z.object({
    completedDate: z.iso.datetime().nullish(),
    documentsGenerated: z.boolean().nullish(),
    documentsSigned: z.boolean().nullish(),
    phaseNumber: z.number(),
    status: PhaseStatusSchema,
  });
}
