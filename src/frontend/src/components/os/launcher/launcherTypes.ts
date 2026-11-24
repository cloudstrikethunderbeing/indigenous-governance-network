import type { MembershipVotingConfig, NationTheme } from "@/backend";
import type { ThemeKey } from "@/data/wallpapers";

/**
 * The five-step Nation OS launcher — shared draft model.
 *
 * The launcher collects everything a new Nation needs in one guided flow. The
 * draft lives in local component state until the final step, when it is sent to
 * the canister as a single `NationLauncherConfig`. Nothing here is persisted
 * until the launch succeeds.
 */

/** The ordered steps of the launcher. */
export type LauncherStepId =
  | "identity"
  | "governance"
  | "membership"
  | "apps"
  | "constitution"
  | "review";

/** One step in the launcher rail. */
export interface LauncherStep {
  id: LauncherStepId;
  /** Step number, 1-based, shown in the rail. */
  number: number;
  label: string;
  /** One-line explanation of what this step decides. */
  summary: string;
}

/** The steps, in order. */
export const launcherSteps: LauncherStep[] = [
  {
    id: "identity",
    number: 1,
    label: "Name your Nation",
    summary: "Give your Nation or organization a name and a short description.",
  },
  {
    id: "governance",
    number: 2,
    label: "Choose governance",
    summary: "Pick how your community makes decisions.",
  },
  {
    id: "membership",
    number: 3,
    label: "Membership & voting",
    summary: "Set who may join and how votes pass.",
  },
  {
    id: "apps",
    number: 4,
    label: "Apps & theme",
    summary: "Select the applications and the visual theme.",
  },
  {
    id: "constitution",
    number: 5,
    label: "Your rules",
    summary: "Answer a few simple questions to set your organization's rules.",
  },
  {
    id: "review",
    number: 6,
    label: "Review & launch",
    summary: "Check every choice, then launch your Nation OS.",
  },
];

/**
 * The six example constitution templates. Every template is an example, never
 * an assumption about an organization's legal or traditional governance
 * authority. The recommended template is pre-selected so a first-time user can
 * continue without configuring anything.
 */
export interface LauncherTemplate {
  key: string;
  label: string;
  /** One plain-language sentence describing who the template suits. */
  description: string;
  /** The template offered first, with sensible defaults already applied. */
  recommended: boolean;
}

export const launcherTemplates: LauncherTemplate[] = [
  {
    key: "community",
    label: "Community",
    description:
      "For a neighbourhood or interest group making shared choices together.",
    recommended: true,
  },
  {
    key: "indigenousNation",
    label: "Indigenous Nation",
    description:
      "For a Nation governing its own lands, knowledge and community decisions.",
    recommended: false,
  },
  {
    key: "nonprofit",
    label: "Nonprofit",
    description: "For a mission-driven organization with a board and members.",
    recommended: false,
  },
  {
    key: "cooperative",
    label: "Cooperative",
    description: "For a member-owned organization where each member has a say.",
    recommended: false,
  },
  {
    key: "business",
    label: "Business",
    description: "For a company that wants clear, accountable decision-making.",
    recommended: false,
  },
  {
    key: "customDao",
    label: "Custom DAO",
    description: "Start from a blank page and write every rule yourself.",
    recommended: false,
  },
];

/** The template pre-selected for a first-time user. */
export const recommendedTemplateKey =
  launcherTemplates.find((template) => template.recommended)?.key ??
  launcherTemplates[0].key;

/** The plain-language label for a template key. */
export function templateLabel(key: string): string {
  return (
    launcherTemplates.find((template) => template.key === key)?.label ?? key
  );
}

/**
 * The advanced governance settings, hidden behind a Show advanced options
 * control until the user asks for them. Each carries a plain-language
 * explanation so the choice is never a mystery.
 */
export interface AdvancedGovernanceSetting {
  key: string;
  label: string;
  /** One plain-language sentence explaining what the setting controls. */
  explanation: string;
  /** The plain-language value shown to the reader. */
  value: string;
}

export const advancedGovernanceSettings: AdvancedGovernanceSetting[] = [
  {
    key: "debatePeriod",
    label: "Discussion time",
    explanation: "How long members may discuss a proposal before voting opens.",
    value: "72 hours",
  },
  {
    key: "reviewPeriod",
    label: "Review time",
    explanation: "How long a passed proposal waits before it takes effect.",
    value: "48 hours",
  },
  {
    key: "delegation",
    label: "Voting by proxy",
    explanation:
      "Whether a member may ask a trusted person to vote on their behalf.",
    value: "Allowed",
  },
  {
    key: "emergencyPause",
    label: "Emergency pause",
    explanation:
      "Whether an administrator may pause a decision while it is reviewed.",
    value: "Allowed with review",
  },
];

/** The membership models a Nation may choose. */
export interface MembershipModelOption {
  key: string;
  label: string;
  description: string;
}

export const membershipModelOptions: MembershipModelOption[] = [
  {
    key: "inviteOnly",
    label: "Invitation only",
    description: "Members join only when an administrator invites them.",
  },
  {
    key: "requestApproval",
    label: "Request and approval",
    description:
      "People ask to join and an administrator approves each request.",
  },
  {
    key: "openToCommunity",
    label: "Open to the community",
    description: "Anyone in the community may join without approval.",
  },
];

/** The voting models a Nation may choose. */
export interface VotingModelOption {
  key: string;
  label: string;
  description: string;
}

export const votingModelOptions: VotingModelOption[] = [
  {
    key: "simpleMajority",
    label: "Simple majority",
    description: "A proposal passes with more than half of the votes cast.",
  },
  {
    key: "supermajority",
    label: "Supermajority",
    description: "A proposal passes with a large majority of the votes cast.",
  },
  {
    key: "consensus",
    label: "Consensus",
    description: "A proposal passes only when the community broadly agrees.",
  },
];

/**
 * The applications a Nation may include in its workspace. These mirror the
 * workspace app registry; the launcher, sample and cost-savings entries are
 * product surfaces rather than workspace apps, so they are not offered here.
 */
export interface SelectableApp {
  appKey: string;
  displayName: string;
  oneLineDescription: string;
  /** Whether the app is a working feature or a labelled preview. */
  status: "working" | "preview";
  iconKey: string;
}

export const selectableApps: SelectableApp[] = [
  {
    appKey: "dashboard",
    displayName: "Dashboard",
    oneLineDescription: "The Nation's workspace at a glance.",
    status: "working",
    iconKey: "dashboard",
  },
  {
    appKey: "governance",
    displayName: "Governance",
    oneLineDescription: "Proposals, votes and decisions.",
    status: "working",
    iconKey: "governance",
  },
  {
    appKey: "discussions",
    displayName: "Discussions",
    oneLineDescription: "Community conversation threads.",
    status: "working",
    iconKey: "discussions",
  },
  {
    appKey: "members",
    displayName: "Members",
    oneLineDescription: "Who belongs to the Nation and their roles.",
    status: "working",
    iconKey: "members",
  },
  {
    appKey: "documents",
    displayName: "Documents",
    oneLineDescription: "Shared records and community knowledge.",
    status: "working",
    iconKey: "documents",
  },
  {
    appKey: "calendar",
    displayName: "Calendar",
    oneLineDescription: "Meetings, gatherings and events.",
    status: "working",
    iconKey: "calendar",
  },
  {
    appKey: "treasury",
    displayName: "Treasury",
    oneLineDescription: "Community income, spending and balance.",
    status: "working",
    iconKey: "treasury",
  },
  {
    appKey: "copilot",
    displayName: "AI Copilot",
    oneLineDescription: "Ask questions about the workspace.",
    status: "preview",
    iconKey: "copilot",
  },
  {
    appKey: "projects",
    displayName: "Projects",
    oneLineDescription: "Research and community initiatives.",
    status: "preview",
    iconKey: "projects",
  },
  {
    appKey: "conservation",
    displayName: "Conservation",
    oneLineDescription: "Land, water and stewardship records.",
    status: "preview",
    iconKey: "conservation",
  },
  {
    appKey: "settings",
    displayName: "Nation Settings",
    oneLineDescription: "Governance model, roles and privacy.",
    status: "working",
    iconKey: "settings",
  },
  {
    appKey: "network",
    displayName: "SOVEREIGN Network",
    oneLineDescription: "Nations open to collaboration.",
    status: "preview",
    iconKey: "network",
  },
];

/* ------------------------------------------------------------------ */
/* Constitution Builder — the plain-language rules step                */
/* ------------------------------------------------------------------ */

/**
 * One example constitution template the builder can start from. Every template
 * is an example, never an assumption about an organization's legal or
 * traditional governance authority. The recommended one is pre-selected so a
 * first-time user can continue without configuring anything.
 */
export interface ConstitutionTemplateOption {
  key: string;
  label: string;
  /** One plain-language sentence describing who the template suits. */
  description: string;
  /** The template offered first, with sensible defaults already applied. */
  recommended: boolean;
}

/** The example constitution templates, in display order. */
export const constitutionTemplateOptions: ConstitutionTemplateOption[] = [
  {
    key: "community",
    label: "Community",
    description:
      "For a neighbourhood or interest group making shared choices together.",
    recommended: true,
  },
  {
    key: "indigenousNation",
    label: "Indigenous Nation",
    description:
      "For a Nation governing its own lands, knowledge and community decisions.",
    recommended: false,
  },
  {
    key: "nonprofit",
    label: "Nonprofit",
    description: "For a mission-driven organization with a board and members.",
    recommended: false,
  },
  {
    key: "cooperative",
    label: "Cooperative",
    description: "For a member-owned organization where each member has a say.",
    recommended: false,
  },
  {
    key: "business",
    label: "Business",
    description: "For a company that wants clear, accountable decision-making.",
    recommended: false,
  },
  {
    key: "customDao",
    label: "Custom DAO",
    description: "Start from a blank page and write every rule yourself.",
    recommended: false,
  },
];

/** The constitution template pre-selected for a first-time user. */
export const recommendedConstitutionTemplateKey =
  constitutionTemplateOptions.find((template) => template.recommended)?.key ??
  constitutionTemplateOptions[0].key;

/** The plain-language label for a constitution template key. */
export function constitutionTemplateLabel(key: string): string {
  return (
    constitutionTemplateOptions.find((template) => template.key === key)
      ?.label ?? key
  );
}

/** The in-progress launcher draft, owned in local state until launch. */
export interface LauncherDraft {
  name: string;
  shortDescription: string;
  region: string;
  /** The example constitution template the rules are built from. */
  templateKey: string;
  governanceModelKey: string;
  membershipModel: string;
  votingModel: string;
  quorumPercent: number;
  approvalThresholdPercent: number;
  /** Selected app keys, in registry order. */
  selectedAppKeys: string[];
  themeKey: ThemeKey;
  wallpaperKey: string;
  blurEnabled: boolean;
  /** Whether the advanced governance settings are revealed. */
  advancedOpen: boolean;
  /** Whether the user has explicitly confirmed the governance rules. */
  rulesConfirmed: boolean;
  /** The example constitution template the Constitution Builder starts from. */
  constitutionTemplateKey: string;
  /** Whether the Constitution Builder's advanced rule settings are revealed. */
  constitutionAdvancedOpen: boolean;
  /** Whether the user has confirmed the constitution in the builder. */
  constitutionConfirmed: boolean;
}

/** The starting draft for a fresh launcher session. */
export const initialLauncherDraft: LauncherDraft = {
  name: "",
  shortDescription: "",
  region: "",
  templateKey: recommendedTemplateKey,
  governanceModelKey: "",
  membershipModel: membershipModelOptions[0].key,
  votingModel: votingModelOptions[0].key,
  quorumPercent: 50,
  approvalThresholdPercent: 60,
  selectedAppKeys: ["dashboard", "governance", "discussions", "members"],
  themeKey: "light",
  wallpaperKey: "neutral",
  blurEnabled: false,
  advancedOpen: false,
  rulesConfirmed: false,
  constitutionTemplateKey: recommendedConstitutionTemplateKey,
  constitutionAdvancedOpen: false,
  constitutionConfirmed: false,
};

/** Build the membership and voting config from a draft. */
export function toMembershipVotingConfig(
  draft: LauncherDraft,
): MembershipVotingConfig {
  return {
    membershipModel: draft.membershipModel,
    votingModel: draft.votingModel,
    quorumPercent: BigInt(Math.round(draft.quorumPercent)),
    approvalThresholdPercent: BigInt(
      Math.round(draft.approvalThresholdPercent),
    ),
  };
}

/** Build the visual theme from a draft. */
export function toNationTheme(draft: LauncherDraft): NationTheme {
  return {
    themeKey: draft.themeKey,
    wallpaperKey: draft.wallpaperKey,
    blurEnabled: draft.blurEnabled,
  };
}

/** The plain-language label for a membership model key. */
export function membershipModelLabel(key: string): string {
  return (
    membershipModelOptions.find((option) => option.key === key)?.label ?? key
  );
}

/** The plain-language label for a voting model key. */
export function votingModelLabel(key: string): string {
  return votingModelOptions.find((option) => option.key === key)?.label ?? key;
}

/**
 * One simple question in the Constitution Builder. Each question is phrased in
 * plain language and carries a short explanation of what the choice means, so a
 * first-time user can set the organization's rules without reading governance
 * theory.
 */
export interface ConstitutionQuestion {
  key: string;
  /** The plain-language question, phrased as a short sentence. */
  question: string;
  /** One short sentence explaining what the choice means. */
  explanation: string;
  /** The plain-language answers a user can pick from. */
  options: ConstitutionAnswer[];
}

/** One plain-language answer to a constitution question. */
export interface ConstitutionAnswer {
  key: string;
  label: string;
  /** One short sentence describing what this answer means in practice. */
  detail: string;
}

/** The few simple questions the Constitution Builder asks. */
export const constitutionQuestions: ConstitutionQuestion[] = [
  {
    key: "decisionStyle",
    question: "How should big decisions be made?",
    explanation:
      "This sets how much support an idea needs before your community accepts it.",
    options: [
      {
        key: "majority",
        label: "Most people agree",
        detail:
          "An idea passes when more than half of the votes are in favour.",
      },
      {
        key: "supermajority",
        label: "Almost everyone agrees",
        detail: "An idea passes only with a large majority in favour.",
      },
      {
        key: "consensus",
        label: "Everyone agrees",
        detail: "An idea passes only when the community broadly agrees.",
      },
    ],
  },
  {
    key: "whoJoins",
    question: "Who can join your organization?",
    explanation: "This decides how new people become members.",
    options: [
      {
        key: "inviteOnly",
        label: "Only by invitation",
        detail: "An administrator invites each new member.",
      },
      {
        key: "requestApproval",
        label: "People ask to join",
        detail: "People request to join and an administrator approves them.",
      },
      {
        key: "open",
        label: "Anyone can join",
        detail: "Anyone in your community may join without approval.",
      },
    ],
  },
  {
    key: "discussionTime",
    question: "How long should people discuss before voting?",
    explanation:
      "A short pause gives everyone time to read and think before they decide.",
    options: [
      {
        key: "oneDay",
        label: "One day",
        detail: "Quick decisions for small, fast-moving groups.",
      },
      {
        key: "threeDays",
        label: "Three days",
        detail: "A balanced pause that suits most organizations.",
      },
      {
        key: "oneWeek",
        label: "One week",
        detail: "More time to think for larger or slower decisions.",
      },
    ],
  },
];

/** The plain-language label for a constitution answer key. */
export function constitutionAnswerLabel(
  questionKey: string,
  answerKey: string,
): string {
  const question = constitutionQuestions.find(
    (entry) => entry.key === questionKey,
  );
  return (
    question?.options.find((option) => option.key === answerKey)?.label ??
    answerKey
  );
}

/**
 * The advanced rule settings, hidden behind an optional expandable area so the
 * default path stays short. Each carries a plain-language explanation.
 */
export interface ConstitutionAdvancedSetting {
  key: string;
  label: string;
  /** One plain-language sentence explaining what the setting controls. */
  explanation: string;
  /** The plain-language value shown to the reader. */
  value: string;
}

export const constitutionAdvancedSettings: ConstitutionAdvancedSetting[] = [
  {
    key: "reviewTime",
    label: "Review time",
    explanation: "How long a passed decision waits before it takes effect.",
    value: "48 hours",
  },
  {
    key: "proxyVoting",
    label: "Voting by proxy",
    explanation:
      "Whether a member may ask a trusted person to vote on their behalf.",
    value: "Allowed",
  },
  {
    key: "emergencyPause",
    label: "Emergency pause",
    explanation:
      "Whether an administrator may pause a decision while it is reviewed.",
    value: "Allowed with review",
  },
  {
    key: "recordKeeping",
    label: "Public record",
    explanation:
      "Whether every decision is written down where all members can read it.",
    value: "Always on",
  },
];
