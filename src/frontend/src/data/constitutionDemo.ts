/**
 * SOVEREIGN OS — Constitution Builder demo data.
 *
 * Everything in this module is static, in-memory and illustrative. It powers
 * the interactive Constitution Builder demonstration: a visitor picks an
 * example template, reads the plain-language rules it would produce, and
 * confirms a draft constitution. Nothing here is persisted, no backend call is
 * made, and no template is an assumption about any organization's legal or
 * traditional governance authority.
 */

/** One example constitution template. */
export interface ConstitutionTemplate {
  key: string;
  label: string;
  /** One plain-language sentence describing who the template suits. */
  description: string;
}

/** The six example templates. Every one is an example, never an assumption. */
export const constitutionTemplates: ConstitutionTemplate[] = [
  {
    key: "indigenousNation",
    label: "Indigenous Nation",
    description:
      "For a Nation governing its own lands, knowledge and community decisions.",
  },
  {
    key: "nonprofit",
    label: "Nonprofit",
    description: "For a mission-driven organization with a board and members.",
  },
  {
    key: "cooperative",
    label: "Cooperative",
    description: "For a member-owned organization where each member has a say.",
  },
  {
    key: "business",
    label: "Business",
    description: "For a company that wants clear, accountable decision-making.",
  },
  {
    key: "community",
    label: "Community",
    description: "For a neighbourhood or interest group making shared choices.",
  },
  {
    key: "customDao",
    label: "Custom DAO",
    description: "Start from a blank page and write every rule yourself.",
  },
];

/** One numbered clause in the draft constitution. */
export interface ConstitutionClause {
  number: string;
  title: string;
  /** Plain-language explanation a 12-year-old could follow. */
  body: string;
}

/** The draft constitution shown in the builder. */
export const draftConstitution = {
  title: "Constitution of the Organization",
  status: "Governance rules — draft",
  version: "v1.0.4",
  clauses: [
    {
      number: "01",
      title: "The collective will",
      body: "Decisions belong to the whole community. No single person decides alone, and every member can see how a decision was reached.",
    },
    {
      number: "02",
      title: "Voting & consensus",
      body: "Members vote on proposals. A proposal passes when it reaches the agreed share of support, after a fair time to discuss it.",
    },
    {
      number: "03",
      title: "Membership & delegation",
      body: "New members are approved by the community. A member may ask a trusted person to vote on their behalf, and can take that back at any time.",
    },
    {
      number: "04",
      title: "Role of examination",
      body: "An independent reviewer checks that decisions follow these rules, and reports openly to everyone.",
    },
  ] satisfies ConstitutionClause[],
};

/** One adjustable rule shown in the rule impact simulation. */
export interface RuleImpact {
  key: string;
  label: string;
  /** The plain-language value shown to the reader. */
  value: string;
  /** What changing this rule would affect. */
  impact: string;
}

/** The rules a visitor can preview in the impact simulation. */
export const ruleImpacts: RuleImpact[] = [
  {
    key: "majorityRule",
    label: "Majority rule",
    value: "More than half agree",
    impact: "How much support a proposal needs to pass.",
  },
  {
    key: "debatePeriod",
    label: "Debate period",
    value: "72 hours",
    impact: "How long members have to discuss before voting.",
  },
  {
    key: "quorum",
    label: "Quorum",
    value: "Half of members",
    impact: "How many members must take part for a vote to count.",
  },
];
