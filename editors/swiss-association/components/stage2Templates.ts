import type {
  ContributorAgreement,
  SwissAssociationState,
} from "document-models/swiss-association";
import {
  aoaTemplateRaw,
  contributorAgreementTemplateRaw,
  dissolutionResolutionTemplateRaw,
  foundingMinutesTemplateRaw,
  mpaV2TemplateRaw,
  regulationGATemplateRaw,
} from "./stage2Templates.generated.js";

function formatList(items: string[]) {
  if (items.length === 0) return "- (to be completed)";
  return items.map((item) => `- ${item}`).join("\n");
}

function formatDate(date: string | null | undefined) {
  // Date scalars are stored as full ISO datetimes; render date-only (yyyy-mm-dd).
  return (date || new Date().toISOString()).slice(0, 10);
}

function formatMemberLine(
  name: string,
  nationalityOrCountry: string,
  residenceOrCity: string,
) {
  return `${name} (${nationalityOrCountry}, ${residenceOrCity})`;
}

function replaceToken(template: string, token: string, value: string) {
  let next = template.split(token).join(value);

  // Some legal templates escape bracket placeholders as \[Token\].
  if (token.includes("[") || token.includes("]")) {
    const escapedToken = token.replaceAll("[", "\\[").replaceAll("]", "\\]");
    next = next.split(escapedToken).join(value);
  }

  return next;
}

function replaceTokenOnce(template: string, token: string, value: string) {
  let next = template.replace(token, value);

  if (token.includes("[") || token.includes("]")) {
    const escapedToken = token.replaceAll("[", "\\[").replaceAll("]", "\\]");
    next = next.replace(escapedToken, value);
  }

  return next;
}

type ReplacementSpec = {
  token: string;
  value: string;
};

const IGNORED_BRACKET_TOKENS = new Set([
  "[Inaugural Meeting Minutes]",
  "[…]",
  "[...]",
  "[]",
  "[ ]",
]);

function applyReplacements(template: string, replacements: ReplacementSpec[]) {
  return replacements.reduce(
    (nextTemplate, replacement) =>
      replaceToken(nextTemplate, replacement.token, replacement.value),
    template,
  );
}

function findUnresolvedBracketTokens(template: string) {
  const matches = template.match(/\[[^\]\n]{1,120}\]/g) || [];
  const cleaned = matches
    .map((match) => match.trim())
    .filter((match) => !IGNORED_BRACKET_TOKENS.has(match));
  return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
}

function appendPlaceholderReport(template: string, templateName: string) {
  const unresolved = findUnresolvedBracketTokens(template);
  if (unresolved.length === 0) return template;

  return `${template}

---

> Placeholder check (${templateName}): unresolved bracket tokens
${unresolved.map((token) => `- ${token}`).join("\n")}
`;
}

function toMemberLines(state: SwissAssociationState) {
  return state.members.map((member) =>
    formatMemberLine(
      member.name,
      member.nationalityOrCountry,
      member.residenceOrCity,
    ),
  );
}

// Attendee line for the founding minutes: "Name/Entity + representative, City".
// The representative is only shown for members that have one (e.g. legal entities).
function toFoundingAttendeeLines(state: SwissAssociationState) {
  return state.members.map((member) => {
    const rep = member.representative ? ` + ${member.representative}` : "";
    return `${member.name}${rep}, ${member.residenceOrCity}`;
  });
}

function toBoardMemberLines(state: SwissAssociationState) {
  return (state.boardMembers || []).map((member) =>
    formatMemberLine(
      member.name,
      member.nationalityOrCountry,
      member.residenceOrCity,
    ),
  );
}

function resolveAddress(state: SwissAssociationState) {
  return (
    state.registeredAddress ||
    `${state.seatCity || "Zug"}, ${state.seatCanton || "Switzerland"}`
  );
}

function stripAoaPreamble(template: string): string {
  // The template starts with a description/parameter block before the first table row.
  // Strip everything up to (but not including) the first table row.
  const tableStart = template.indexOf("|");
  return tableStart > 0 ? template.slice(tableStart) : template;
}

interface Signatory {
  name: string;
  role: string;
  note?: string;
}

// The ONE signature convention shared by every generated document: an
// "## Signatures" section (which starts on a fresh page in print) followed by
// one page-break-protected block per signatory — name, role, an optional note
// (nationality / "represented by …"), and a signature / date / place line. The
// <!-- SIG --> markers become break-inside:avoid containers in the shared
// renderer, so no single signer is ever split across pages.
const SIG_LINE =
  "Signature: ______________________________   Date: ________________   Place: ________________";

function buildSignatureSection(
  intro: string,
  signatories: Signatory[],
): string {
  const list =
    signatories.length > 0 ? signatories : [{ name: "", role: "Signatory" }];
  const blocks = list
    .map((s) => {
      const noteLine = s.note ? `\n${s.note}` : "";
      return `<!-- SIG -->
**${s.name || " "}**
${s.role}${noteLine}

${SIG_LINE}
<!-- /SIG -->`;
    })
    .join("\n\n");

  return `

## Signatures

${intro}

${blocks}
`;
}

// --- English-only AoA output (MVP) ------------------------------------------
// The AoA template body is a bilingual table: | German | English |  |  |.
// For the MVP we render English only, by projecting the English column. Flip
// AOA_ENGLISH_ONLY to false to restore the full bilingual output — the German
// content stays untouched in the template and the model (nameDe, purposeDe,
// German template strings), it is only suppressed at render time.
const AOA_ENGLISH_ONLY: boolean = true;

function toEnglishOnlyTable(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      // Only touch bilingual table rows; leave everything else as-is.
      if (!(trimmed.startsWith("|") && trimmed.endsWith("|"))) return line;
      const cells = trimmed.slice(1, -1).split("|");
      if (cells.length < 2) return line;
      // Table separator row (dashes) -> single-column separator.
      if (
        cells.some((c) => c.includes("-")) &&
        cells.every((c) => /^[\s:-]*$/.test(c))
      ) {
        return "| --- |";
      }
      // Keep only the English column (index 1); drop German + padding columns.
      return `| ${cells[1].trim()} |`;
    })
    .join("\n");
}

export function buildAoaMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const city = state.seatCity || "Zug";

  // Adoption is effected by APPROVAL at the founding assembly (step 7), never by
  // the optional signing at step 4. So every "adopted / in force" claim in the
  // AoA is conditional on the founding minutes being signed — a draft before (no
  // past tense, no date), the dated fact after, with the date taken from the
  // founding meeting (the minutes' signedAt, falling back to the founding date),
  // NOT from the AoA's own optional sign action.
  const adopted = state.foundingMinutesDocument?.isSigned === true;
  const adoptionDate = formatDate(
    state.foundingMinutesDocument?.signedAt || state.foundingDate,
  );

  // The registered street address is optional. The registered office renders
  // from the full address when present, otherwise from the municipality +
  // canton alone (a Swiss Verein is validly seated on that basis). This also
  // consumes the template's hardcoded "Zug, Switzerland" trailer so no dangling
  // locality is left behind.
  const registeredOffice = state.registeredAddress?.trim()
    ? state.registeredAddress.trim()
    : `${city}, ${state.seatCanton || "Switzerland"}`;

  const templateWithBaseData = applyReplacements(aoaTemplateRaw, [
    { token: "[Association Name]", value: associationName },
    { token: "[purpose]", value: state.purposeEn || "N/A" },
    { token: "[Date]", value: date },
    {
      token: "in [Address] Zug, Switzerland",
      value: `in ${registeredOffice}`,
    },
    { token: "[Address]", value: resolveAddress(state) },
  ]);
  const signatories = formatList(toMemberLines(state));
  let template = applyReplacements(templateWithBaseData, [
    { token: "[Signatories (Name, Company}]", value: signatories },
    { token: "[Signatory: Signing Party (Name, Company)]", value: signatories },
    {
      token: "[cryptographic signature hash (per signing party, timestamp]",
      value: "pending-signature-hash",
    },
    { token: "[MJP domicile provider]", value: resolveAddress(state) },
  ]);

  // Strip the description/parameter preamble and add a clean title.
  // English-titled document: use the English name (nameEn); fall back to a bare
  // title (no dangling "of ") when it is unset.
  template = stripAoaPreamble(template);
  // MVP: render the AoA English-only (suppress the German column).
  if (AOA_ENGLISH_ONLY) template = toEnglishOnlyTable(template);
  const englishName = state.nameEn?.trim();
  const aoaTitle = englishName
    ? `Articles of Association of ${englishName}`
    : "Articles of Association";
  template = `# ${aoaTitle}\n\n` + template;

  if (!state.isPersonalunion) {
    template = replaceToken(
      template,
      "General Assembly (personal union with the board)",
      "General Assembly and a separate board",
    );
    template = replaceToken(
      template,
      "Generalversammlung (Personalunion mit Vorstand)",
      "Generalversammlung und separater Vorstand",
    );
    template += `\n\n## Art. 7 Separate Board Composition (Generated)\n${formatList(
      toBoardMemberLines(state),
    )}\n`;
  }

  // The template's own "entry into force" clause is likewise conditional on
  // adoption — the statutes are only in force once the founding assembly adopts
  // them (same signal as the adoption statement below).
  template = replaceToken(
    template,
    "The Members have adopted the present Articles of Association. The present Articles of Association have entered into force today.",
    adopted
      ? `The Members have adopted the present Articles of Association. The present Articles of Association entered into force on ${adoptionDate}.`
      : "The present Articles of Association will enter into force upon adoption by the founding assembly.",
  );

  // Adoption of a non-commercial Verein's statutes is effected by APPROVAL at
  // the founding assembly (step 7) — signing the statutes is not legally
  // mandatory. The AoA drafted here is the instrument; the mandatory signatures
  // (chair + secretary) live on the founding minutes, handled separately. Here
  // we render at most ONE optional board signatory as a formality, not an
  // all-board sign-off.
  const boardSigners = state.boardMembers?.length
    ? state.boardMembers
    : state.members;
  const optionalSigner = boardSigners.at(0);

  const adoptionStatement = adopted
    ? `These Articles of Association were adopted by the founding assembly of **${associationName}** on **${adoptionDate}** in **${city}**, Switzerland. Signing the statutes is an optional formality — adoption is effected by the assembly's approval, with the mandatory signatures recorded on the founding meeting minutes.`
    : `These Articles of Association are submitted for adoption by the founding assembly of **${associationName}**. Until the assembly approves them at the founding meeting they remain a draft — signing here is an optional formality by one or two board members, and the mandatory signatures (chair + secretary) are recorded on the founding meeting minutes.`;
  template += buildSignatureSection(
    adoptionStatement,
    optionalSigner
      ? [
          {
            name: optionalSigner.name,
            role: "For the Board — optional signatory",
            note: optionalSigner.nationalityOrCountry,
          },
        ]
      : [],
  );

  return appendPlaceholderReport(template, "AoA");
}

export function buildFoundingMinutesMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const chairName = state.chairName || "Chair";
  const secretaryName = state.secretaryName || "Secretary";

  // Registered (Swiss) seat — set in Step 1. Distinct from and independent of
  // the meeting venue: the meeting may be held abroad while the seat stays Swiss.
  const seatCity = state.seatCity || "[Registered Seat]";

  // Meeting place — entered in the Founding Meeting step (Step 4).
  const meetingPlaceSentence = state.meetingIsOnline
    ? "The founding meeting was held online."
    : `The founding meeting was held at ${
        state.meetingVenue || "[Meeting Venue]"
      }.`;
  const meetingPlaceLabel = state.meetingIsOnline
    ? "Online"
    : state.meetingVenue || "[Meeting Venue]";

  // Optional local counsel (e.g. a Swiss counsel like MME). Empty = none.
  const counselName = state.counselName?.trim() || "";

  // Attendees = founding members (Name/Entity + representative, City).
  const memberLines = toFoundingAttendeeLines(state);
  const membersBlock = formatList(memberLines);
  // Top attendance list additionally names local counsel when present.
  const attendantBlock = formatList(
    counselName
      ? [...memberLines, `${counselName} (local counsel)`]
      : memberLines,
  );

  // The template opens with an authoring legend (title, "Description",
  // "Variable Parameters", "Fix Parameters") that must NOT appear in the
  // executed document. Strip everything before the real minutes heading.
  // Anchor on the heading's distinctive "\[Association Name\]" token — the
  // legend title above it is "**Founding Meeting Minutes**", so a bare
  // "**Founding Meeting" anchor would wrongly match the title and strip nothing.
  let raw = foundingMinutesTemplateRaw;
  const bodyStart = raw.indexOf("**Founding Meeting  \\[Association Name\\]");
  if (bodyStart > 0) raw = raw.slice(bodyStart);

  let template = applyReplacements(raw, [
    { token: "[Association Name]", value: associationName },
    // Match the name WITH its trailing common-noun "association" first, so a
    // name that already ends in "Association" doesn't read "… association".
    {
      token: "Powerhouse Genesis Operational Hub association",
      value: associationName,
    },
    { token: "Powerhouse Genesis Operational Hub", value: associationName },
    { token: "[Association name]", value: associationName },
    { token: "[Date]", value: date },
    // Registered (Swiss) seat — replace the hardcoded "Zug" literals.
    {
      token: "registered seat in Zug",
      value: `registered seat in ${seatCity}`,
    },
    { token: "Registered seat: Zug", value: `Registered seat: ${seatCity}` },
    // Meeting place — preamble label first, then the body line (see below).
    {
      token: "Meeting Place: Online",
      value: `Meeting Place: ${meetingPlaceLabel}`,
    },
    { token: "*Place: Online*", value: `*${meetingPlaceSentence}*` },
    // Section 5 signatory list = founding members only (counsel does not sign for the association).
    { token: "[Attendees / Founding Members]", value: membersBlock },
    { token: "[Role, Chair]", value: chairName },
    {
      token: "Chair [Role]",
      value: `Chair ${chairName}`,
    },
    {
      token: "Secretary  [Role]",
      value: `Secretary ${secretaryName}`,
    },
    { token: "[signatory power]", value: "joint signatory power" },
  ]);

  // Top "Attendant" section lists the same placeholder three times, each wrapped
  // in a single-asterisk italic pair (*…*). Replace the WHOLE wrapped line — not
  // just the inner token — otherwise the empty duplicates leave orphan "**"
  // markers. The first gets the full (unwrapped) attendance block so it renders
  // as a real bullet list; the remaining duplicates are removed entirely.
  template = replaceTokenOnce(
    template,
    "*Attendees (Name / Company \\+ representative, City)*",
    attendantBlock,
  );
  template = replaceToken(
    template,
    "*Attendees (Name / Company \\+ representative, City)*",
    "",
  );
  template = replaceToken(
    template,
    "*Attendees (Name / Company + representative, City)*",
    "",
  );

  template = replaceToken(
    template,
    "CARS as Secretary of the meeting",
    `${secretaryName} as Secretary of the meeting`,
  );

  // Replace the two signatory placeholder lines. In the template the chair's
  // line has no leading curly quote ("Signatory\u201d: \u2026") and the secretary's does
  // ("\u201cSignatory\u201d: \u2026"). Replace the leading-quote (secretary) line FIRST so the
  // chair pattern below can't also match inside the secretary line.
  template = template
    .replace(
      /\u201cSignatory\u201d: Signing Party \(Name, Entity, Role\)\)/,
      `${secretaryName} (Secretary)`,
    )
    .replace(
      /Signatory\u201d: Signing Party \(Name, Entity, Role\)\)/,
      `${chairName} (Chair)`,
    );

  // Prepend clean title
  template =
    `# ${associationName} \u2014 Founding Meeting Minutes\n\n` + template;

  // Shared signature section. Local counsel signs only when one was named.
  const minutesSignatories: Signatory[] = [
    { name: chairName, role: "Chair of the Founding Meeting" },
    { name: secretaryName, role: "Secretary of the Founding Meeting" },
  ];
  if (counselName)
    minutesSignatories.push({ name: counselName, role: "Local Counsel" });
  template += buildSignatureSection(
    `The undersigned hereby confirm the founding meeting of **${associationName}**, held on **${date}**.`,
    minutesSignatories,
  );

  return appendPlaceholderReport(template, "Founding Meeting Minutes");
}

export function buildRegulationGAMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const date = formatDate(state.foundingDate);
  const chairName = state.chairName || "Chair";
  const secretaryName = state.secretaryName || "Secretary";

  // Strip preamble BEFORE replacements so the anchor text is still intact
  let raw = regulationGATemplateRaw;
  const bodyStart = raw.indexOf("**Article I.");
  if (bodyStart > 0) raw = raw.slice(bodyStart);

  let template = applyReplacements(raw, [
    { token: "[Association Name]", value: associationName },
    { token: "[Date]", value: date },
    {
      token: "[default majority rule =absolute majority]",
      value: "absolute majority",
    },
    {
      token: "[special majority rule = unanimous vote]",
      value: "unanimous vote",
    },
  ]);

  // Prepend clean title
  template =
    `# ${associationName} — Regulation of the General Assembly\n\n` + template;

  // Replace signatory placeholders
  template = template
    .replace("Signatory 1 (Role = chair]", chairName)
    .replace("Signatory 2 (Role = secretary)", secretaryName);

  // Approval by the General Assembly is the operative act — signing this
  // regulation is not mandatory. Render a single optional signatory (the chair)
  // as a formality, not a required chair+secretary pair (those mandatory
  // signatures belong to the founding minutes, handled separately).
  template += buildSignatureSection(
    `Approved by the General Assembly of **${associationName}** on **${date}**. Signing this regulation is an optional formality — approval by the General Assembly is the operative act, with the mandatory signatures recorded on the founding meeting minutes.`,
    [
      {
        name: chairName,
        role: "For the General Assembly — optional signatory",
      },
    ],
  );

  return appendPlaceholderReport(template, "Regulation GA");
}

export function buildMpaMarkdown(state: SwissAssociationState) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const multisig = state.multisig;
  const activeSigner = state.boardMembers?.at(0) ?? state.members.at(0);
  let template = applyReplacements(mpaV2TemplateRaw, [
    { token: "[Association Name]", value: associationName },
    {
      token: "[Active Signer  Personal Name]",
      value: activeSigner?.name || "Active Signer",
    },
    {
      token: "[Citizenship]",
      value: activeSigner?.nationalityOrCountry || "N/A",
    },
    {
      token: "[Residence Country]",
      value: activeSigner?.residenceOrCity || "N/A",
    },
    {
      token: "[Active Signer Entity Name]",
      value: activeSigner?.name || "Active Signer Entity",
    },
    {
      token: "(Incorporation City, Incorporation Country]",
      value: `${activeSigner?.residenceOrCity || "N/A"}, ${activeSigner?.nationalityOrCountry || "N/A"}`,
    },
    {
      token: "Number of Keys",
      value: String(multisig?.keysTotal || "N/A"),
    },
    {
      token: "[Decision Quorum]",
      value: String(multisig?.decisionQuorum || "N/A"),
    },
    {
      token: "[Multisignature Platform]",
      value: multisig?.platform || "Safe Multisig",
    },
    {
      token: "[Wallet Address]",
      value: multisig?.address || "N/A",
    },
    {
      token: "Private Channel (for association members only) Discord channel",
      value: `Private Channel (for association members only) ${multisig?.privateChannel || "N/A"}`,
    },
    {
      token: "[Link to internal policy documents]",
      value: multisig?.internalPolicyLink || "N/A",
    },
  ]);

  // Shared signature section for the active signers (the Association's board).
  const mpaSigners = state.boardMembers?.length
    ? state.boardMembers
    : state.members;
  template += buildSignatureSection(
    `Executed by **${associationName}** and the Active Signers listed below.`,
    mpaSigners.map((m) => ({
      name: m.name,
      role: "Active Signer",
      note: m.nationalityOrCountry,
    })),
  );
  return appendPlaceholderReport(template, "MPA v2");
}

export const DISSOLUTION_PROCEDURE_MEMO = `## Dissolution & Liquidation Procedure (Reference)

_Assumptions: unanimous agreement, no debts, no disputes. Legal basis: ZGB, Articles of Association, Regulation GA._

1. **General Assembly Resolution (unanimous)** — resolve to dissolve, confirm no debts, designate the persons executing liquidation, approve use of remaining assets, instruct final accounts and tax filings.
2. **Confirm financial position** — closing balance sheet at the dissolution date; reconcile bank accounts, crypto wallets, receivables.
3. **Settle final administrative items** — invoices, contracts, registrations (VAT, social security), tools/subscriptions.
4. **Transfer / allocate remaining assets** — per purpose, no member distributions; document recipients, wallet addresses, transaction hashes.
5. **Prepare final liquidation accounts** — opening balance, transfers, final balance (typically zero).
6. **Final confirmation by Members** — confirm completion and approve final accounts.
7. **Tax & regulatory closure** — notify tax authorities, file final returns, close social security.
8. **Close bank accounts & infrastructure** — confirm zero balances, archive statements, empty/decommission wallets.
9. **Formal deregistration** — if registered, file deletion with the Swiss Commercial Register.
10. **Record retention** — store all records for 10 years.

_Outcome: Association fully dissolved, compliant, and closed with a clean audit trail._`;

export function buildDissolutionResolutionMarkdown(
  state: SwissAssociationState,
) {
  const associationName = state.nameEn || state.nameDe || "Association";
  const d = state.dissolution;
  // dissolutionDate is stored as a full ISO datetime (the Date scalar
  // validates via z.iso.datetime()); show date-only in the document.
  const date = d?.dissolutionDate
    ? d.dissolutionDate.slice(0, 10)
    : formatDate(undefined);
  const formLabels: Record<string, string> = {
    PHYSICAL: "Physical",
    VIRTUAL: "Virtual",
    WRITTEN: "Written (Urabstimmung)",
  };
  const form = d?.resolutionForm
    ? formLabels[d.resolutionForm]
    : "Physical / Virtual / Written (Urabstimmung)";
  const recipient = d?.assetRecipient || "[Insert recipient]";

  let template = applyReplacements(dissolutionResolutionTemplateRaw, [
    { token: "[Association Name]", value: associationName },
    { token: "[Date]", value: date },
    { token: "[Form]", value: form },
    { token: "[Insert recipient]", value: recipient },
  ]);

  // Drop the template's inline signature placeholder; append the shared section.
  template = template.split("[Signatures]").join("");
  template += buildSignatureSection(
    `The undersigned members hereby resolve the dissolution of **${associationName}**, effective **${date}**.`,
    state.members.map((m) => ({ name: m.name, role: "Member" })),
  );

  return appendPlaceholderReport(template, "Dissolution Resolution");
}

// Keep the <!-- FAMILY:VALUE -->…<!-- /FAMILY:VALUE --> block whose VALUE
// matches `keep`, and drop every other block in that family (markers included).
// Used for both the entity/individual branches and the §4 term alternatives.
function resolveMarkers(
  template: string,
  family: string,
  keep: string,
): string {
  const re = new RegExp(
    `<!--\\s*${family}:([A-Z_]+)\\s*-->([\\s\\S]*?)<!--\\s*/${family}:\\1\\s*-->`,
    "g",
  );
  return template.replace(re, (_full, value: string, inner: string) =>
    value === keep ? inner : "",
  );
}

// Drop any instructional front-matter above the contract's title. The committed
// template already opens at the heading; this is a defensive no-op otherwise.
function stripBeforeContributorHeading(template: string): string {
  const heading = "# INDEPENDENT CONTRACTOR AGREEMENT";
  const idx = template.indexOf(heading);
  return idx > 0 ? template.slice(idx) : template;
}

// Date scalars are stored as full ISO datetimes; show date-only in the document.
function dateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

export function buildContributorAgreementMarkdown(
  agreement: ContributorAgreement,
  state: SwissAssociationState,
) {
  // 1. Strip front-matter, then resolve the entity/individual branch and the
  //    §4 term alternative down to the single selected clause.
  let template = stripBeforeContributorHeading(contributorAgreementTemplateRaw);
  template = resolveMarkers(
    template,
    "BRANCH",
    agreement.contractorIsEntity ? "ENTITY" : "INDIVIDUAL",
  );
  template = resolveMarkers(template, "TERM", agreement.termType);

  // 2. OH-side tokens are read from Step 1 state (never re-collected).
  const associationName = state.nameEn || state.nameDe || "Association";
  const replacements: ReplacementSpec[] = [
    { token: "[Association Name]", value: associationName },
    { token: "[Registered Address]", value: resolveAddress(state) },
    { token: "[Canton]", value: state.seatCanton || "Zug" },
  ];
  const ohAgent = state.chairName || state.secretaryName;
  if (ohAgent) replacements.push({ token: "[OH Agent]", value: ohAgent });

  // Replace the template's in-line signature table with the shared signature
  // section (kept in place, before the schedules). The OH and the contractor
  // each sign; entity contractors sign through their named agent.
  const contractorName = agreement.contractorIsEntity
    ? agreement.entityName || "Contractor Entity"
    : agreement.contractorName || "Contractor";
  const contractorNote =
    agreement.contractorIsEntity && agreement.contractorName
      ? `Represented by ${agreement.contractorName}`
      : undefined;
  const sigSection = buildSignatureSection(
    `Executed by the Parties on ${dateOnly(agreement.contractDate) || "the date written below"}.`,
    [
      {
        name: associationName,
        role: "Operational Hub",
        note: ohAgent ? `Represented by ${ohAgent}` : undefined,
      },
      { name: contractorName, role: "Contractor", note: contractorNote },
    ],
  );
  const sigStart = template.indexOf("IN WITNESS WHEREOF");
  const schedStart = template.indexOf("## List of Schedules");
  if (sigStart !== -1 && schedStart > sigStart) {
    template =
      template.slice(0, sigStart) +
      sigSection.trim() +
      "\n\n" +
      template.slice(schedStart);
  }

  // 3. Contractor tokens come from the agreement. Only push a replacement when
  //    the value is present, so unset tokens survive into the placeholder
  //    report rather than resolving to an empty string.
  const optional: [string, string | null | undefined][] = [
    ["[Contractor Name]", agreement.contractorName],
    ["[Contractor Nationality]", agreement.contractorNationality],
    ["[Contractor Address]", agreement.contractorAddress],
    ["[Contractor Entity Name]", agreement.entityName],
    ["[Contractor Entity Type]", agreement.entityType],
    ["[Contractor Entity Jurisdiction]", agreement.entityJurisdiction],
    ["[Contractor Title]", agreement.role],
    ["[Contract Date]", dateOnly(agreement.contractDate)],
    ["[Work Start Date]", dateOnly(agreement.workStartDate)],
    ["[Work End Date]", dateOnly(agreement.workEndDate)],
    ["[Termination Notice Period]", agreement.terminationNoticePeriod],
    ["[SOW Number]", agreement.sowNumber],
    ["[Services To Be Rendered]", agreement.services],
    ["[FTE Hours]", agreement.fteHours],
    ["[Compensation Amount]", agreement.compensation],
    ["[Denomination Type]", agreement.denominationType],
    ["[Denomination Currency]", agreement.denominationCurrency],
  ];
  for (const [token, value] of optional) {
    if (value) replacements.push({ token, value });
  }

  template = applyReplacements(template, replacements);
  return appendPlaceholderReport(template, "Contributor Agreement");
}
