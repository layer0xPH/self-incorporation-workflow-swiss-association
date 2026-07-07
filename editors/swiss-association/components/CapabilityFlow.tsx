import type { StageProgress } from "./ProgressSidebar.js";

// Full-width hub-and-spokes summary of what the entity CAN DO, inferred entirely
// from existing document state (no model fields added). One required core
// capability (legal personhood) with three INDEPENDENT optional branches — the
// layout is deliberately parallel (spokes off a hub), never a 1→2→3 sequence,
// and never a "X of 4" / fill-to-100% progress view. A shell entity that has
// only the core is a COMPLETE state, shown with three inviting optional branches.

// Palette — reused from the sidebar's token set.
const GREEN = "#22c55e";
const GREEN_DK = "#16a34a";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";
const SLATE_800 = "#1e293b";

interface FlowNode {
  reached: boolean;
  title: string;
  sub?: string;
}

// Marker: a check when achieved, a "+" when available (reads as "add when you
// need it" — never a lock).
function StateMark({
  cx,
  cy,
  reached,
}: {
  cx: number;
  cy: number;
  reached: boolean;
}) {
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={reached ? "rgba(255,255,255,0.18)" : "#ffffff"}
        stroke={reached ? "rgba(255,255,255,0.65)" : SLATE_300}
        strokeWidth={1.5}
      />
      {reached ? (
        <path
          d={`M ${cx - 4} ${cy} l 2.6 2.9 l 5.2 -6.2`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <g stroke={SLATE_400} strokeWidth={1.6} strokeLinecap="round">
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} />
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} />
        </g>
      )}
    </>
  );
}

function CapabilityNode({
  x,
  y,
  w,
  h,
  node,
  emphasized = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  node: FlowNode;
  emphasized?: boolean;
}) {
  const { reached, title, sub } = node;
  const cy = y + h / 2;
  const markCx = x + 22;
  const textX = x + 42;
  const titleSize = emphasized ? 15 : 13;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={reached ? GREEN : "#ffffff"}
        stroke={reached ? GREEN_DK : SLATE_300}
        strokeWidth={emphasized ? 2 : 1.5}
      />
      <StateMark cx={markCx} cy={cy} reached={reached} />
      <text
        x={textX}
        y={sub ? cy - 3 : cy + titleSize / 3}
        fontSize={titleSize}
        fontWeight={emphasized ? 700 : 600}
        fill={reached ? "#ffffff" : SLATE_800}
      >
        {title}
      </text>
      {sub && (
        <text
          x={textX}
          y={cy + 13}
          fontSize={10}
          fill={reached ? "rgba(255,255,255,0.85)" : SLATE_500}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

export function CapabilityFlow({ progress }: { progress: StageProgress }) {
  // Core (required) + three independent optional branches.
  const core: FlowNode = {
    reached: progress.minutesSigned,
    title: "Exists as a legal person",
    sub: "Art. 60 ZGB · required foundation",
  };
  const branches: FlowNode[] = [
    // Keyed on the multisig (state.multisig != null); the MPA is additive.
    { reached: progress.hasMultisig, title: "Can hold & move money" },
    // Keyed on a signed CONTRIBUTOR agreement (step 9), NOT the MPA. That step
    // isn't built yet, so this capability stays soft/available — honest.
    { reached: false, title: "Can contract people" },
    // Never reached in the MVP — depends on the external dependencies shown
    // feeding into it on the right (registered domicile + tax ID).
    { reached: false, title: "Can invoice & get paid, compliantly" },
  ];

  // Geometry (viewBox units). Core on the left; branches stacked on the right,
  // each joined to the core by its own spoke. The last branch ("Can invoice…")
  // additionally has two external dependencies feeding into it from the right.
  const coreBox = { x: 24, y: 30, w: 300, h: 108 };
  const hub = { x: coreBox.x + coreBox.w, y: coreBox.y + coreBox.h / 2 };
  const branchX = 604;
  const branchW = 312;
  const branchRight = branchX + branchW;
  const branchGeom = [
    { y: 14, h: 50 },
    { y: 59, h: 50 },
    { y: 104, h: 50 },
  ];
  const invoiceGeom = branchGeom[2];
  const invoiceCy = invoiceGeom.y + invoiceGeom.h / 2;

  // External dependencies feeding "Can invoice…". SVG-ONLY — these are not app
  // steps and never appear as sidebar stages. Muted because they are external
  // and untracked in the MVP.
  const depX = 976;
  const depW = 188;
  const invoiceDeps = [
    { y: 106, h: 26, label: "Domicile (licensed provider)" },
    { y: 138, h: 26, label: "Tax ID" },
  ];

  return (
    <section className="swiss-wizard-capabilities w-full bg-white border-t border-slate-200 px-8 py-5">
      <p className="text-[11px] font-semibold text-slate-500 mb-3">
        What your entity can do — the core stands alone; the rest are optional.
      </p>
      <div className="w-full max-w-6xl mx-auto">
        <svg
          viewBox="0 0 1180 176"
          width="100%"
          role="img"
          aria-label="Entity capabilities: one required core with three optional branches; the invoicing branch has two external dependencies"
          style={{ fontFamily: "inherit", display: "block" }}
        >
          {/* Spokes (drawn first so nodes sit on top). Green when the branch is
              achieved, soft slate when it is simply available. */}
          {branchGeom.map((g, i) => {
            const by = g.y + g.h / 2;
            const midX = (hub.x + branchX) / 2;
            return (
              <path
                key={`spoke-${i}`}
                d={`M ${hub.x} ${hub.y} C ${midX} ${hub.y} ${midX} ${by} ${branchX} ${by}`}
                fill="none"
                stroke={branches[i].reached ? GREEN : SLATE_300}
                strokeWidth={2.25}
                strokeLinecap="round"
              />
            );
          })}
          {/* Hub anchor where the spokes fan out from the core. */}
          <circle cx={hub.x} cy={hub.y} r={3.5} fill={SLATE_400} />

          {/* Dependency feeders — from each dep chip into the invoice node. */}
          {invoiceDeps.map((d, i) => {
            const dcy = d.y + d.h / 2;
            return (
              <path
                key={`dep-line-${i}`}
                d={`M ${depX} ${dcy} C ${depX - 30} ${dcy} ${depX - 30} ${invoiceCy} ${branchRight} ${invoiceCy}`}
                fill="none"
                stroke={SLATE_200}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}

          <CapabilityNode
            x={coreBox.x}
            y={coreBox.y}
            w={coreBox.w}
            h={coreBox.h}
            node={core}
            emphasized
          />
          {branchGeom.map((g, i) => (
            <CapabilityNode
              key={`branch-${i}`}
              x={branchX}
              y={g.y}
              w={branchW}
              h={g.h}
              node={branches[i]}
            />
          ))}

          {/* External dependency chips (SVG-only, muted). */}
          <text
            x={depX}
            y={96}
            fontSize={8}
            fontWeight={700}
            letterSpacing="0.5"
            fill={SLATE_400}
          >
            EXTERNAL DEPENDENCIES
          </text>
          {invoiceDeps.map((d, i) => {
            const dcy = d.y + d.h / 2;
            return (
              <g key={`dep-${i}`}>
                <rect
                  x={depX}
                  y={d.y}
                  width={depW}
                  height={d.h}
                  rx={8}
                  fill="#f8fafc"
                  stroke={SLATE_200}
                  strokeWidth={1}
                />
                <circle cx={depX + 13} cy={dcy} r={2.5} fill={SLATE_300} />
                <text x={depX + 24} y={dcy + 3} fontSize={9} fill={SLATE_500}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
