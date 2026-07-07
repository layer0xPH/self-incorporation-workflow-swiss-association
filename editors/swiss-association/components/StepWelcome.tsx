import { SectionCard } from "./SectionCard.js";
import { STAGES } from "./stages.js";

interface Props {
  onNext: () => void;
  onCheckSuitability: () => void;
}

// Stages surfaced on the welcome screen, keyed by their `number` in
// stages.ts STAGES so the names never drift. Active/optional/coming-soon are all
// derived from each stage's flags there (the same source the sidebar uses), so
// this summary stays in sync. Pre-Incorporation (data entry) is omitted.
const FLOW_STAGES: { number: number; description: string }[] = [
  {
    number: 2,
    description:
      "The founding — Articles of Association, Regulation of the General Assembly, and the founding meeting & minutes. This constitutes the association as a legal person (Art. 60 ZGB).",
  },
  {
    number: 3,
    description:
      "Set up the multisig treasury and sign the Multisig Participation Agreement (MPA).",
  },
  {
    number: 4,
    description: "Engage contributors under independent-contractor agreements.",
  },
  {
    number: 6,
    description:
      "A tax ID and a registered domicile provider, so the entity can invoice and get paid compliantly.",
  },
  {
    number: 5,
    description:
      "The end of the entity lifecycle — formal dissolution, asset distribution, and closure.",
  },
];

const REQUIREMENTS = [
  "Names and details of founding members",
  "A board — this can be the same people as the founding members",
  "A Chair and Secretary — temporary roles for the founding meeting itself",
  "Your association's purpose",
  "A Swiss domicile — the city and canton of your seat (a street address is optional and can be added later with a domicile provider)",
];

export function StepWelcome({ onNext, onCheckSuitability }: Props) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Incorporate Your Swiss Association — Digitally
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          This tool guides you through creating a legally-constituted Swiss
          non-profit association (Verein), entirely online and local-first. Your
          documents are generated, signed, and stored as you go.
        </p>
      </div>

      <button
        onClick={onCheckSuitability}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 transition-colors"
      >
        <span aria-hidden="true">🧭</span>
        Check if a Swiss association fits your needs
      </button>

      <SectionCard title="Incorporation flow stages">
        <p className="text-sm text-slate-500 mb-4">
          Incorporation constitutes your association as a legal person — a
          complete state on its own. The stages that follow are optional onward
          capabilities you can add if and when you need them.
        </p>
        <ol className="space-y-4">
          {FLOW_STAGES.map((flowStage, i) => {
            const stage = STAGES.find((s) => s.number === flowStage.number);
            if (!stage) return null;
            // Active / optional / coming-soon are read straight from the stage
            // flags in stages.ts, so this list matches the sidebar's rendering.
            const comingSoon = !!stage.comingSoon;
            const required = !stage.optional && !comingSoon;
            return (
              <li
                key={flowStage.number}
                className={`flex gap-3 ${comingSoon ? "opacity-75" : ""}`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 ${
                    comingSoon
                      ? "bg-slate-100 text-slate-400"
                      : required
                        ? "bg-red-600 text-white"
                        : "bg-slate-400 text-white"
                  }`}
                >
                  {comingSoon ? <span aria-hidden="true">⋯</span> : i + 1}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      comingSoon ? "text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {stage.name}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${
                        comingSoon
                          ? "bg-slate-200 text-slate-500"
                          : required
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {comingSoon
                        ? "Coming next"
                        : required
                          ? "Required"
                          : "Optional"}
                    </span>
                  </p>
                  <p
                    className={`text-sm ${
                      comingSoon ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {flowStage.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>

      <SectionCard title="What you'll need">
        <ul className="space-y-2">
          {REQUIREMENTS.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex justify-end pt-2">
        <button onClick={onNext} className="sw-btn-primary">
          Get Started →
        </button>
      </div>
    </div>
  );
}
