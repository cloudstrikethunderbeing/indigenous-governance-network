import {
  BookOpen,
  Calendar,
  Compass,
  FileText,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  Leaf,
  MessagesSquare,
  Network,
  PiggyBank,
  Rocket,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Whether an app is a working feature or a labelled preview. */
export type OsAppStatus = "working" | "preview";

/** One app registered in the SOVEREIGN OS desktop shell. */
export interface OsApp {
  /** Stable key, also used as the deterministic marker suffix. */
  key: string;
  /** Route into the app. */
  to: string;
  label: string;
  /** One-line description shown in the drawer and window chrome. */
  description: string;
  icon: LucideIcon;
  status: OsAppStatus;
  /** Whether the app appears in the dock. */
  inDock: boolean;
  /**
   * The key of the app this entry lives inside, when it is not a top-level
   * app. A nested entry is reachable from its parent app and never appears in
   * the desktop grid, dock, sidebar, drawer or search as a separate app.
   */
  parentKey?: string;
}

/**
 * The single source of truth for the SOVEREIGN OS app registry. It drives the
 * desktop icon grid, the dock, the sidebar and the mobile drawer, so a new app
 * is registered in exactly one place.
 */
export const osApps: OsApp[] = [
  {
    key: "dashboard",
    to: "/os/nation",
    label: "Dashboard",
    description: "The Nation's workspace at a glance.",
    icon: LayoutDashboard,
    status: "working",
    inDock: true,
  },
  {
    key: "files",
    to: "/os/files",
    label: "Files",
    description: "Folders and files the Nation stores.",
    icon: FolderOpen,
    status: "working",
    inDock: true,
  },
  {
    key: "governance",
    to: "/os/governance",
    label: "Governance",
    description: "Proposals, votes and decisions.",
    icon: Gavel,
    status: "working",
    inDock: true,
  },
  {
    key: "constitution",
    to: "/os/constitution",
    label: "DAO Constitution",
    description: "Write and confirm your organization's rules.",
    icon: ScrollText,
    status: "working",
    inDock: false,
    parentKey: "governance",
  },
  {
    key: "governance-control-center",
    to: "/os/governance/control-center",
    label: "Governance Control Center",
    description: "The Nation's state, succession plan and recovery.",
    icon: ShieldCheck,
    status: "working",
    inDock: false,
    parentKey: "governance",
  },
  {
    key: "discussions",
    to: "/os/discussions",
    label: "Discussions",
    description: "Community conversation threads.",
    icon: MessagesSquare,
    status: "working",
    inDock: true,
  },
  {
    key: "members",
    to: "/os/members",
    label: "Members",
    description: "Who belongs to the Nation and their roles.",
    icon: Users,
    status: "working",
    inDock: true,
  },
  {
    key: "documents",
    to: "/os/documents",
    label: "Documents",
    description: "Shared records and community knowledge.",
    icon: FileText,
    status: "working",
    inDock: true,
  },
  {
    key: "calendar",
    to: "/os/calendar",
    label: "Calendar",
    description: "Meetings, gatherings and events.",
    icon: Calendar,
    status: "working",
    inDock: true,
  },
  {
    key: "treasury",
    to: "/os/treasury",
    label: "Treasury",
    description: "Community income, spending and balance.",
    icon: Wallet,
    status: "working",
    inDock: true,
  },
  {
    key: "copilot",
    to: "/os/copilot",
    label: "AI Copilot",
    description: "Ask questions about the workspace.",
    icon: Sparkles,
    status: "preview",
    inDock: false,
  },
  {
    key: "projects",
    to: "/os/projects",
    label: "Projects",
    description: "Research and community initiatives.",
    icon: BookOpen,
    status: "preview",
    inDock: false,
  },
  {
    key: "conservation",
    to: "/os/conservation",
    label: "Conservation",
    description: "Land, water and stewardship records.",
    icon: Leaf,
    status: "preview",
    inDock: false,
  },
  {
    key: "settings",
    to: "/os/settings",
    label: "Nation Settings",
    description: "Governance model, roles and privacy.",
    icon: Settings,
    status: "working",
    inDock: false,
  },
  {
    key: "network",
    to: "/os/network",
    label: "SOVEREIGN Network",
    description: "Nations open to collaboration.",
    icon: Network,
    status: "preview",
    inDock: false,
  },
  {
    key: "launcher",
    to: "/os/launcher",
    label: "Deploy a Nation",
    description: "Launch a new Nation in five guided steps.",
    icon: Rocket,
    status: "working",
    inDock: false,
  },
  {
    key: "sample",
    to: "/os/sample",
    label: "Sample Nation",
    description: "Explore a fully populated example Nation.",
    icon: Compass,
    status: "working",
    inDock: false,
  },
  {
    key: "savings",
    to: "/os/savings",
    label: "Cost Savings",
    description: "Estimate what self-hosting could save.",
    icon: PiggyBank,
    status: "working",
    inDock: false,
  },
];

/** The apps shown in the dock, in registry order. */
export const dockApps = osApps.filter((app) => app.inDock);

/**
 * The top-level apps: every app that is not nested inside another app. The
 * desktop grid, dock, sidebar, drawer and search read this list so a nested
 * entry such as the DAO Constitution never appears as a separate app.
 */
export const topLevelApps = osApps.filter((app) => app.parentKey === undefined);

/** The apps nested inside a given parent app, in registry order. */
export function childApps(parentKey: string): OsApp[] {
  return osApps.filter((app) => app.parentKey === parentKey);
}
