export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  AttachmentRef: {
    input: `attachment://v${number}:${string}`;
    output: `attachment://v${number}:${string}`;
  };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AddBoardMemberInput = {
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  nationalityOrCountry: Scalars["String"]["input"];
  representative?: InputMaybe<Scalars["String"]["input"]>;
  residenceOrCity: Scalars["String"]["input"];
  type: MemberType;
};

export type AddContributorAgreementInput = {
  compensation?: InputMaybe<Scalars["String"]["input"]>;
  contractDate?: InputMaybe<Scalars["Date"]["input"]>;
  contractorAddress?: InputMaybe<Scalars["String"]["input"]>;
  contractorIsEntity: Scalars["Boolean"]["input"];
  contractorName?: InputMaybe<Scalars["String"]["input"]>;
  contractorNationality?: InputMaybe<Scalars["String"]["input"]>;
  denominationCurrency?: InputMaybe<Scalars["String"]["input"]>;
  denominationType?: InputMaybe<Scalars["String"]["input"]>;
  entityJurisdiction?: InputMaybe<Scalars["String"]["input"]>;
  entityName?: InputMaybe<Scalars["String"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  fteHours?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  role?: InputMaybe<Scalars["String"]["input"]>;
  services?: InputMaybe<Scalars["String"]["input"]>;
  sowNumber?: InputMaybe<Scalars["String"]["input"]>;
  termType: ContributorTermType;
  terminationNoticePeriod?: InputMaybe<Scalars["String"]["input"]>;
  workEndDate?: InputMaybe<Scalars["Date"]["input"]>;
  workStartDate?: InputMaybe<Scalars["Date"]["input"]>;
};

export type AddMemberInput = {
  ethereumAddress?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  nationalityOrCountry: Scalars["String"]["input"];
  representative?: InputMaybe<Scalars["String"]["input"]>;
  residenceOrCity: Scalars["String"]["input"];
  type: MemberType;
};

export type AddNoteInput = {
  note: Scalars["String"]["input"];
};

export type AdvancePhaseInput = {
  completedDate: Scalars["Date"]["input"];
};

export type AssociationMember = {
  ethereumAddress: Maybe<Scalars["EthereumAddress"]["output"]>;
  id: Scalars["OID"]["output"];
  incorporationSignedAt: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  nationalityOrCountry: Scalars["String"]["output"];
  representative: Maybe<Scalars["String"]["output"]>;
  residenceOrCity: Scalars["String"]["output"];
  type: MemberType;
};

export type ContributorAgreement = {
  compensation: Maybe<Scalars["String"]["output"]>;
  contractDate: Maybe<Scalars["Date"]["output"]>;
  contractorAddress: Maybe<Scalars["String"]["output"]>;
  contractorIsEntity: Scalars["Boolean"]["output"];
  contractorName: Maybe<Scalars["String"]["output"]>;
  contractorNationality: Maybe<Scalars["String"]["output"]>;
  denominationCurrency: Maybe<Scalars["String"]["output"]>;
  denominationType: Maybe<Scalars["String"]["output"]>;
  entityJurisdiction: Maybe<Scalars["String"]["output"]>;
  entityName: Maybe<Scalars["String"]["output"]>;
  entityType: Maybe<Scalars["String"]["output"]>;
  fteHours: Maybe<Scalars["String"]["output"]>;
  generatedDocument: Maybe<GeneratedStage2Document>;
  id: Scalars["OID"]["output"];
  role: Maybe<Scalars["String"]["output"]>;
  services: Maybe<Scalars["String"]["output"]>;
  sowNumber: Maybe<Scalars["String"]["output"]>;
  termType: ContributorTermType;
  terminationNoticePeriod: Maybe<Scalars["String"]["output"]>;
  workEndDate: Maybe<Scalars["Date"]["output"]>;
  workStartDate: Maybe<Scalars["Date"]["output"]>;
};

export type ContributorTermType = "FIXED_DATE" | "NOTICE" | "ON_SOW_COMPLETION";

export type CopyFoundingMembersToBoardInput = {
  confirm: Scalars["Boolean"]["input"];
};

export type Dissolution = {
  assetRecipient: Maybe<Scalars["String"]["output"]>;
  dissolutionDate: Maybe<Scalars["Date"]["output"]>;
  executingPersons: Maybe<Scalars["String"]["output"]>;
  remainingAssetsSummary: Maybe<Scalars["String"]["output"]>;
  resolutionForm: Maybe<DissolutionResolutionForm>;
};

export type DissolutionResolutionForm = "PHYSICAL" | "VIRTUAL" | "WRITTEN";

export type GeneratedStage2Document = {
  isLocked: Maybe<Scalars["Boolean"]["output"]>;
  isSigned: Maybe<Scalars["Boolean"]["output"]>;
  markdown: Maybe<Scalars["String"]["output"]>;
  signedAt: Maybe<Scalars["DateTime"]["output"]>;
};

export type MarkContributorAgreementSignedInput = {
  id: Scalars["OID"]["input"];
  signedAt: Scalars["DateTime"]["input"];
};

export type MarkStage2DocumentSignedInput = {
  documentType: Stage2DocumentType;
  signedAt: Scalars["DateTime"]["input"];
};

export type MemberType = "LEGAL_ENTITY" | "NATURAL_PERSON";

export type MultisigConfig = {
  address: Maybe<Scalars["String"]["output"]>;
  availabilityThreshold: Maybe<Scalars["String"]["output"]>;
  decisionQuorum: Maybe<Scalars["Int"]["output"]>;
  emergencyProcedures: Maybe<Scalars["String"]["output"]>;
  internalPolicyLink: Maybe<Scalars["String"]["output"]>;
  keysTotal: Maybe<Scalars["Int"]["output"]>;
  multisigDate: Maybe<Scalars["Date"]["output"]>;
  platform: Maybe<Scalars["String"]["output"]>;
  privateChannel: Maybe<Scalars["String"]["output"]>;
};

export type PhaseRecord = {
  completedDate: Maybe<Scalars["Date"]["output"]>;
  documentsGenerated: Scalars["Boolean"]["output"];
  documentsSigned: Scalars["Boolean"]["output"];
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  phaseNumber: Scalars["Int"]["output"];
  status: PhaseStatus;
};

export type PhaseStatus =
  | "AWAITING_SIGNATURES"
  | "COMPLETE"
  | "IN_PROGRESS"
  | "LOCKED";

export type PrimaryLanguage = "DE" | "EN";

export type RemoveBoardMemberInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveContributorAgreementInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveMemberInput = {
  id: Scalars["OID"]["input"];
};

export type SetAssociationNameInput = {
  nameDe?: InputMaybe<Scalars["String"]["input"]>;
  nameEn: Scalars["String"]["input"];
};

export type SetAssociationSeatInput = {
  registeredAddress?: InputMaybe<Scalars["String"]["input"]>;
  seatCanton: Scalars["String"]["input"];
  seatCity: Scalars["String"]["input"];
};

export type SetContributorAgreementMarkdownInput = {
  id: Scalars["OID"]["input"];
  markdown: Scalars["String"]["input"];
};

export type SetDissolutionDetailsInput = {
  assetRecipient?: InputMaybe<Scalars["String"]["input"]>;
  dissolutionDate?: InputMaybe<Scalars["Date"]["input"]>;
  executingPersons?: InputMaybe<Scalars["String"]["input"]>;
  remainingAssetsSummary?: InputMaybe<Scalars["String"]["input"]>;
  resolutionForm?: InputMaybe<DissolutionResolutionForm>;
};

export type SetFiscalDetailsInput = {
  fiscalYearEnd?: InputMaybe<Scalars["String"]["input"]>;
  membershipFee?: InputMaybe<Scalars["String"]["input"]>;
  primaryLanguage?: InputMaybe<PrimaryLanguage>;
};

export type SetFoundingDateInput = {
  foundingDate: Scalars["Date"]["input"];
};

export type SetMeetingRolesInput = {
  chairName: Scalars["String"]["input"];
  chairRole: Scalars["String"]["input"];
  counselName?: InputMaybe<Scalars["String"]["input"]>;
  meetingIsOnline: Scalars["Boolean"]["input"];
  meetingVenue?: InputMaybe<Scalars["String"]["input"]>;
  secretaryName: Scalars["String"]["input"];
  secretaryRole: Scalars["String"]["input"];
};

export type SetMemberEthereumAddressInput = {
  ethereumAddress: Scalars["EthereumAddress"]["input"];
  id: Scalars["OID"]["input"];
};

export type SetMultisigConfigInput = {
  address: Scalars["String"]["input"];
  availabilityThreshold?: InputMaybe<Scalars["String"]["input"]>;
  decisionQuorum: Scalars["Int"]["input"];
  emergencyProcedures?: InputMaybe<Scalars["String"]["input"]>;
  internalPolicyLink?: InputMaybe<Scalars["String"]["input"]>;
  keysTotal: Scalars["Int"]["input"];
  multisigDate?: InputMaybe<Scalars["Date"]["input"]>;
  platform: Scalars["String"]["input"];
  privateChannel?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetPurposeInput = {
  purposeDe?: InputMaybe<Scalars["String"]["input"]>;
  purposeEn: Scalars["String"]["input"];
};

export type SetStage2DocumentMarkdownInput = {
  documentType: Stage2DocumentType;
  markdown: Scalars["String"]["input"];
};

export type SignForIncorporationInput = {
  signedAt: Scalars["DateTime"]["input"];
};

export type Stage2DocumentType =
  | "AOA"
  | "DISSOLUTION_RESOLUTION"
  | "FOUNDING_MINUTES"
  | "MPA"
  | "REG_GA";

export type StartStage_2Input = {
  startedAt: Scalars["DateTime"]["input"];
};

export type SwissAssociationState = {
  aoaDocument: Maybe<GeneratedStage2Document>;
  belowRecommendedMemberCount: Maybe<Scalars["Boolean"]["output"]>;
  boardMembers: Maybe<Array<AssociationMember>>;
  chairName: Maybe<Scalars["String"]["output"]>;
  chairRole: Maybe<Scalars["String"]["output"]>;
  contributorAgreements: Array<ContributorAgreement>;
  counselName: Maybe<Scalars["String"]["output"]>;
  currentPhase: Maybe<Scalars["Int"]["output"]>;
  customNotes: Array<Scalars["String"]["output"]>;
  dissolution: Maybe<Dissolution>;
  dissolutionResolutionDocument: Maybe<GeneratedStage2Document>;
  fiscalYearEnd: Maybe<Scalars["String"]["output"]>;
  foundingDate: Maybe<Scalars["Date"]["output"]>;
  foundingMinutesDocument: Maybe<GeneratedStage2Document>;
  incorporationCompletedAt: Maybe<Scalars["DateTime"]["output"]>;
  isPersonalunion: Maybe<Scalars["Boolean"]["output"]>;
  languageClauseNeedsUpdate: Maybe<Scalars["Boolean"]["output"]>;
  meetingIsOnline: Maybe<Scalars["Boolean"]["output"]>;
  meetingVenue: Maybe<Scalars["String"]["output"]>;
  members: Array<AssociationMember>;
  membershipFee: Maybe<Scalars["String"]["output"]>;
  mpaDocument: Maybe<GeneratedStage2Document>;
  multisig: Maybe<MultisigConfig>;
  nameDe: Maybe<Scalars["String"]["output"]>;
  nameEn: Maybe<Scalars["String"]["output"]>;
  phases: Array<PhaseRecord>;
  primaryLanguage: Maybe<PrimaryLanguage>;
  purposeDe: Maybe<Scalars["String"]["output"]>;
  purposeEn: Maybe<Scalars["String"]["output"]>;
  regGaDocument: Maybe<GeneratedStage2Document>;
  registeredAddress: Maybe<Scalars["String"]["output"]>;
  registeredAddressConfirmed: Maybe<Scalars["Boolean"]["output"]>;
  seatCanton: Maybe<Scalars["String"]["output"]>;
  seatCity: Maybe<Scalars["String"]["output"]>;
  secretaryName: Maybe<Scalars["String"]["output"]>;
  secretaryRole: Maybe<Scalars["String"]["output"]>;
  stage2Started: Maybe<Scalars["Boolean"]["output"]>;
};

export type UpdateBoardMemberInput = {
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  nationalityOrCountry?: InputMaybe<Scalars["String"]["input"]>;
  representative?: InputMaybe<Scalars["String"]["input"]>;
  residenceOrCity?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<MemberType>;
};

export type UpdateContributorAgreementInput = {
  compensation?: InputMaybe<Scalars["String"]["input"]>;
  contractDate?: InputMaybe<Scalars["Date"]["input"]>;
  contractorAddress?: InputMaybe<Scalars["String"]["input"]>;
  contractorIsEntity?: InputMaybe<Scalars["Boolean"]["input"]>;
  contractorName?: InputMaybe<Scalars["String"]["input"]>;
  contractorNationality?: InputMaybe<Scalars["String"]["input"]>;
  denominationCurrency?: InputMaybe<Scalars["String"]["input"]>;
  denominationType?: InputMaybe<Scalars["String"]["input"]>;
  entityJurisdiction?: InputMaybe<Scalars["String"]["input"]>;
  entityName?: InputMaybe<Scalars["String"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  fteHours?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  role?: InputMaybe<Scalars["String"]["input"]>;
  services?: InputMaybe<Scalars["String"]["input"]>;
  sowNumber?: InputMaybe<Scalars["String"]["input"]>;
  termType?: InputMaybe<ContributorTermType>;
  terminationNoticePeriod?: InputMaybe<Scalars["String"]["input"]>;
  workEndDate?: InputMaybe<Scalars["Date"]["input"]>;
  workStartDate?: InputMaybe<Scalars["Date"]["input"]>;
};

export type UpdateMemberInput = {
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  nationalityOrCountry?: InputMaybe<Scalars["String"]["input"]>;
  representative?: InputMaybe<Scalars["String"]["input"]>;
  residenceOrCity?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<MemberType>;
};

export type UpdatePhaseStatusInput = {
  completedDate?: InputMaybe<Scalars["Date"]["input"]>;
  documentsGenerated?: InputMaybe<Scalars["Boolean"]["input"]>;
  documentsSigned?: InputMaybe<Scalars["Boolean"]["input"]>;
  phaseNumber: Scalars["Int"]["input"];
  status: PhaseStatus;
};
