import type { GovernanceRuleSet } from "@/backend";

/**
 * Plain-language explanations for every rule in a GovernanceRuleSet.
 *
 * A non-expert should be able to read the organization's rules without knowing
 * any governance or blockchain vocabulary. Each rule is grouped under a plain
 * heading and paired with one short sentence explaining what it means in
 * everyday words. This module is presentation only: it never changes a rule.
 */

/** One readable group of rules. */
export interface RuleGroup {
  key: string;
  /** A plain heading a 12-year-old could follow. */
  label: string;
  /** One sentence explaining what this group of rules covers. */
  description: string;
  /** The rule fields shown in this group, in display order. */
  fields: (keyof GovernanceRuleSet)[];
}

/** The rule groups, in the order a reader should meet them. */
export const ruleGroups: RuleGroup[] = [
  {
    key: "who-belongs",
    label: "Who belongs",
    description: "Who may join, and what it takes to become a member.",
    fields: [
      "membershipEligibility",
      "identityVerification",
      "loginRequirement",
      "newMemberWaitingPeriodDays",
      "membershipApprovalThresholdPercent",
      "participationRequirement",
    ],
  },
  {
    key: "how-decisions-are-made",
    label: "How decisions are made",
    description: "How an idea becomes a decision the community has agreed to.",
    fields: [
      "votingMethod",
      "votingEligibility",
      "votingWeight",
      "quorumPercent",
      "approvalThresholdPercent",
      "abstentionsCount",
      "tieBreakRule",
      "approvalOutcomes",
      "proposalClassifications",
      "proposalSubmissionPeriodDays",
      "proposalDiscussionPeriodDays",
      "proposalReviewPeriodDays",
      "delegationAllowed",
    ],
  },
  {
    key: "who-may-do-what",
    label: "Who may do what",
    description: "The roles people hold and the limits on their authority.",
    fields: [
      "foundingAuthorityProcedure",
      "leadershipElectionProcedure",
      "leadershipTermDays",
      "leadershipRemovalProcedure",
    ],
  },
  {
    key: "money-and-resources",
    label: "Money and resources",
    description: "How the community's money is looked after and spent.",
    fields: ["treasuryAuthorization", "treasurySpendLimit"],
  },
  {
    key: "keeping-it-fair",
    label: "Keeping it fair",
    description: "How disagreements are handled and how people are protected.",
    fields: [
      "disputeProcedure",
      "appealsProcedure",
      "evidenceReviewProcedure",
      "confidentialityRule",
      "documentAccess",
      "dataExportProcedure",
      "collaborationDataSharing",
      "humanOversight",
      "aiPermissions",
    ],
  },
  {
    key: "changing-these-rules",
    label: "Changing these rules",
    description: "How the rules themselves can be updated, and how to recover.",
    fields: [
      "amendmentProcedure",
      "emergencyPauseProcedure",
      "governanceRecoveryProcedure",
      "dissolutionProcedure",
    ],
  },
];

/** One rule rendered as a plain-language label and explanation. */
export interface RuleExplanation {
  /** A short, everyday label for the rule. */
  label: string;
  /** One sentence explaining what the rule means. */
  explanation: string;
}

/**
 * The plain-language label and explanation for each rule field. Every field of
 * GovernanceRuleSet has an entry so no rule is ever shown without an
 * explanation.
 */
export const ruleExplanations: Record<
  keyof GovernanceRuleSet,
  RuleExplanation
> = {
  membershipEligibility: {
    label: "Who can join",
    explanation: "The people or groups who are allowed to become members.",
  },
  identityVerification: {
    label: "Proving who you are",
    explanation: "How a person shows they are who they say they are.",
  },
  loginRequirement: {
    label: "Signing in",
    explanation: "What a member needs in order to sign in and take part.",
  },
  newMemberWaitingPeriodDays: {
    label: "Waiting time to join",
    explanation: "How long a new member waits before they can take part.",
  },
  membershipApprovalThresholdPercent: {
    label: "Support needed to join",
    explanation: "How much of the community must agree before someone joins.",
  },
  participationRequirement: {
    label: "Staying active",
    explanation: "How much a member must take part to keep their say.",
  },
  votingMethod: {
    label: "How votes are counted",
    explanation: "The way the community casts and counts its votes.",
  },
  votingEligibility: {
    label: "Who may vote",
    explanation: "Which members are allowed to vote on a decision.",
  },
  votingWeight: {
    label: "How much each vote counts",
    explanation: "Whether every vote counts the same or some count more.",
  },
  quorumPercent: {
    label: "How many must take part",
    explanation: "The share of members who must vote for a result to count.",
  },
  approvalThresholdPercent: {
    label: "Support needed to pass",
    explanation: "The share of support a proposal needs to be agreed.",
  },
  abstentionsCount: {
    label: "Do abstentions count",
    explanation: "Whether a member who neither agrees nor disagrees counts.",
  },
  tieBreakRule: {
    label: "Breaking a tie",
    explanation: "What happens when the votes are exactly equal.",
  },
  approvalOutcomes: {
    label: "Possible results",
    explanation: "The outcomes a vote can end in once it closes.",
  },
  proposalClassifications: {
    label: "Kinds of proposal",
    explanation: "The categories an idea can be filed under.",
  },
  proposalSubmissionPeriodDays: {
    label: "Time to submit",
    explanation: "How long a member has to put an idea forward.",
  },
  proposalDiscussionPeriodDays: {
    label: "Time to discuss",
    explanation: "How long the community talks before voting begins.",
  },
  proposalReviewPeriodDays: {
    label: "Time to review",
    explanation: "How long a proposal is checked before it moves on.",
  },
  delegationAllowed: {
    label: "Asking someone to vote for you",
    explanation: "Whether a member may hand their vote to a trusted person.",
  },
  foundingAuthorityProcedure: {
    label: "The founding authority",
    explanation: "Who holds the first authority and how it is passed on.",
  },
  leadershipElectionProcedure: {
    label: "Choosing leaders",
    explanation: "How the community chooses the people who lead.",
  },
  leadershipTermDays: {
    label: "How long leaders serve",
    explanation: "How long a leader stays in their role before review.",
  },
  leadershipRemovalProcedure: {
    label: "Removing a leader",
    explanation: "How the community can remove a leader early.",
  },
  treasuryAuthorization: {
    label: "Who approves spending",
    explanation: "Who must agree before community money is spent.",
  },
  treasurySpendLimit: {
    label: "Spending limit",
    explanation: "The most that can be spent without a full community vote.",
  },
  disputeProcedure: {
    label: "Settling disagreements",
    explanation: "How the community works through a disagreement.",
  },
  appealsProcedure: {
    label: "Appeals",
    explanation: "How a member asks for a decision to be looked at again.",
  },
  evidenceReviewProcedure: {
    label: "Reviewing evidence",
    explanation: "How the facts behind a decision are checked.",
  },
  confidentialityRule: {
    label: "Keeping things private",
    explanation: "What stays private and who is allowed to see it.",
  },
  documentAccess: {
    label: "Who can read documents",
    explanation: "Which members may open the community's records.",
  },
  dataExportProcedure: {
    label: "Taking your data with you",
    explanation: "How a member can get a copy of their own information.",
  },
  collaborationDataSharing: {
    label: "Sharing with other Nations",
    explanation: "What may be shared outside, and only with permission.",
  },
  humanOversight: {
    label: "People stay in charge",
    explanation: "How people keep oversight of every automated decision.",
  },
  aiPermissions: {
    label: "What AI may do",
    explanation: "The limits on any AI helper, which only advises.",
  },
  amendmentProcedure: {
    label: "Changing the rules",
    explanation: "How the community agrees to update these rules.",
  },
  emergencyPauseProcedure: {
    label: "Pausing in an emergency",
    explanation: "How activity can be paused to prevent harm.",
  },
  governanceRecoveryProcedure: {
    label: "Recovering control",
    explanation: "How the community restores control if something goes wrong.",
  },
  dissolutionProcedure: {
    label: "Closing the organization",
    explanation: "How the community would wind things down if it chose to.",
  },
};

/** Format a rule value as plain language, never as raw data. */
export function formatRuleValue(
  field: keyof GovernanceRuleSet,
  rules: GovernanceRuleSet,
): string {
  const value = rules[field];
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "bigint") {
    if (field === "treasurySpendLimit") {
      return `$${value.toLocaleString("en-US")}`;
    }
    if (field.endsWith("Percent")) {
      return `${value.toString()}%`;
    }
    if (field.endsWith("Days")) {
      const days = value.toString();
      return days === "1" ? "1 day" : `${days} days`;
    }
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "None set";
  }
  const text = String(value).trim();
  return text.length > 0 ? text : "Not set";
}
