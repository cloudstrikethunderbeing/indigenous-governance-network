import {
  Calendar,
  FileText,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  MessagesSquare,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The apps shown inside the landing page's live Sample Nation preview.
 *
 * This is a deliberately smaller registry than the full OS `osApps`: it lists
 * the eight workspace apps the preview demonstrates (dashboard, governance,
 * discussions, members, documents, calendar, treasury and files). The preview
 * renders its own chrome and switches views with local state, so it never
 * navigates the visitor away from the landing page.
 */
export interface PreviewApp {
  /** Stable key, also used as the deterministic marker suffix. */
  key: string;
  label: string;
  /** One-line description shown in the preview window chrome. */
  description: string;
  icon: LucideIcon;
  /** Whether the app appears in the preview dock. */
  inDock: boolean;
}

export const previewApps: PreviewApp[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "The Nation's workspace at a glance.",
    icon: LayoutDashboard,
    inDock: true,
  },
  {
    key: "files",
    label: "Files",
    description: "Folders and files the Nation stores.",
    icon: FolderOpen,
    inDock: true,
  },
  {
    key: "governance",
    label: "Governance",
    description: "Proposals, votes and decisions.",
    icon: Gavel,
    inDock: true,
  },
  {
    key: "discussions",
    label: "Discussions",
    description: "Community conversation threads.",
    icon: MessagesSquare,
    inDock: true,
  },
  {
    key: "members",
    label: "Members",
    description: "Who belongs to the Nation and their roles.",
    icon: Users,
    inDock: true,
  },
  {
    key: "documents",
    label: "Documents",
    description: "Shared records and community knowledge.",
    icon: FileText,
    inDock: true,
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "Meetings, gatherings and events.",
    icon: Calendar,
    inDock: true,
  },
  {
    key: "treasury",
    label: "Treasury",
    description: "Community income, spending and balance.",
    icon: Wallet,
    inDock: true,
  },
];

/** The apps shown in the preview dock, in registry order. */
export const previewDockApps = previewApps.filter((app) => app.inDock);

/** Look up a preview app by key, falling back to the dashboard. */
export function findPreviewApp(key: string): PreviewApp {
  return previewApps.find((app) => app.key === key) ?? previewApps[0];
}
