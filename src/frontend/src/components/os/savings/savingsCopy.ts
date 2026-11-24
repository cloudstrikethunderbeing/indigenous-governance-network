/**
 * Copy and configuration for the Cost Savings app. Every figure here is a
 * starting assumption the Nation can change — nothing is invented and no
 * reduction is promised. The estimator derives its numbers only from the
 * assumptions the reader sets.
 */

/** One operating-cost area a Nation can estimate savings for. */
export interface SavingsArea {
  /** Stable key, also used as the deterministic marker suffix. */
  key: string;
  label: string;
  /** What this area covers, in plain language. */
  description: string;
  /** Starting assumptions for this area, all editable by the reader. */
  defaults: SavingsAssumptions;
}

/**
 * The four assumption-driven inputs behind one area's estimate. The annual
 * saving is derived from these alone:
 *
 *   people × hours per week × hourly cost × 52 weeks × absorbed share
 */
export interface SavingsAssumptions {
  /** People who spend time on this work. */
  people: number;
  /** Hours each person spends on it in a week. */
  hoursPerWeek: number;
  /** Fully loaded cost of one hour of that work, in dollars. */
  hourlyCost: number;
  /** Share of that effort shared tooling could absorb, as a percentage. */
  absorbedShare: number;
}

/** The number of working weeks used to annualise a weekly figure. */
export const weeksPerYear = 52;

/**
 * The six operating-cost areas named in the accepted requirements. Each carries
 * starting assumptions the reader can change; the estimate is derived from
 * those assumptions and shown with its formula, never hidden.
 */
export const savingsAreas: SavingsArea[] = [
  {
    key: "administrative-duplication",
    label: "Administrative duplication",
    description:
      "The same information re-entered across separate systems and forms.",
    defaults: {
      people: 3,
      hoursPerWeek: 6,
      hourlyCost: 38,
      absorbedShare: 40,
    },
  },
  {
    key: "manual-document-handling",
    label: "Manual document handling",
    description:
      "Printing, filing, scanning and physically routing paper records.",
    defaults: {
      people: 2,
      hoursPerWeek: 5,
      hourlyCost: 34,
      absorbedShare: 45,
    },
  },
  {
    key: "software-subscriptions",
    label: "Fragmented software subscriptions",
    description:
      "Overlapping tools and licences that each hold part of the picture.",
    defaults: {
      people: 2,
      hoursPerWeek: 3,
      hourlyCost: 42,
      absorbedShare: 35,
    },
  },
  {
    key: "meeting-coordination",
    label: "Meeting coordination overhead",
    description:
      "Scheduling, circulating agendas and chasing decisions after meetings.",
    defaults: {
      people: 4,
      hoursPerWeek: 4,
      hourlyCost: 40,
      absorbedShare: 30,
    },
  },
  {
    key: "governance-recordkeeping",
    label: "Governance recordkeeping effort",
    description:
      "Maintaining minutes, resolutions, registers and audit trails by hand.",
    defaults: {
      people: 2,
      hoursPerWeek: 5,
      hourlyCost: 44,
      absorbedShare: 40,
    },
  },
  {
    key: "infrastructure-complexity",
    label: "Infrastructure complexity",
    description:
      "Running and maintaining separate servers, backups and integrations.",
    defaults: {
      people: 1,
      hoursPerWeek: 8,
      hourlyCost: 52,
      absorbedShare: 30,
    },
  },
];

/** The plain-language statement shown wherever an estimate is displayed. */
export const savingsDisclaimer =
  "Every figure is illustrative and derived only from the assumptions you set. It is not a quote, a benchmark or a guaranteed saving.";

/** The short note explaining how each area's estimate is calculated. */
export const savingsMethodNote =
  "For each area: people × hours per week × fully loaded hourly cost × 52 weeks × the share shared tooling could absorb. The combined estimate is the sum of the six area estimates.";

/** The visible formula shown beside each area's estimate. */
export const savingsFormulaLabel =
  "people × hours/week × hourly cost × 52 weeks × absorbed share";
