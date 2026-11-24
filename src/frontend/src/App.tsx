import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import Layout from "@/components/Layout";
import OsShell from "@/components/os/OsShell";
import FoundingInvitationPage from "@/components/os/launcher/FoundingInvitationPage";
import AdminEngagementPage from "@/pages/AdminEngagementPage";
import AuditHistoryPage from "@/pages/AuditHistoryPage";
import CommunityPage from "@/pages/CommunityPage";
import DaoHomePage from "@/pages/DaoHomePage";
import DaoPreviewPage from "@/pages/DaoPreviewPage";
import DeployLandingPage from "@/pages/DeployLandingPage";
import DiscoveryCollaboratorsPage from "@/pages/DiscoveryCollaboratorsPage";
import DiscoveryDashboardPage from "@/pages/DiscoveryDashboardPage";
import DiscoveryIdeasPage from "@/pages/DiscoveryIdeasPage";
import DiscoveryNetworkPage from "@/pages/DiscoveryNetworkPage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import EmissionSchedulePage from "@/pages/EmissionSchedulePage";
import FundraisingPage from "@/pages/FundraisingPage";
import FutureRoadmapPage from "@/pages/FutureRoadmapPage";
import GovernancePage from "@/pages/GovernancePage";
import ParticipationEconomyPage from "@/pages/ParticipationEconomyPage";
import ResearchCreditsPage from "@/pages/ResearchCreditsPage";
import StakingPage from "@/pages/StakingPage";
import TokenomicsPage from "@/pages/TokenomicsPage";
import TreasuryPage from "@/pages/TreasuryPage";
import CalendarAppPage from "@/pages/os/CalendarAppPage";
import ConservationAppPage from "@/pages/os/ConservationAppPage";
import ConstitutionBuilderPage from "@/pages/os/ConstitutionBuilderPage";
import CopilotAppPage from "@/pages/os/CopilotAppPage";
import DiscussionsAppPage from "@/pages/os/DiscussionsAppPage";
import DocumentsAppPage from "@/pages/os/DocumentsAppPage";
import FilesAppPage from "@/pages/os/FilesAppPage";
import GovernanceAppPage from "@/pages/os/GovernanceAppPage";
import GovernanceControlCenterPage from "@/pages/os/GovernanceControlCenterPage";
import LauncherAppPage from "@/pages/os/LauncherAppPage";
import MembersAppPage from "@/pages/os/MembersAppPage";
import NationDashboardPage from "@/pages/os/NationDashboardPage";
import NationSettingsAppPage from "@/pages/os/NationSettingsAppPage";
import NetworkAppPage from "@/pages/os/NetworkAppPage";
import OsDesktopPage from "@/pages/os/OsDesktopPage";
import ProjectsAppPage from "@/pages/os/ProjectsAppPage";
import SampleNationAppPage from "@/pages/os/SampleNationAppPage";
import SavingsAppPage from "@/pages/os/SavingsAppPage";
import TreasuryAppPage from "@/pages/os/TreasuryAppPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OsDesktopPage,
});

const deployLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "deploy",
  component: DeployLandingPage,
});

const fundraisingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "500k",
  component: FundraisingPage,
});

const daoPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dao-preview",
  component: DaoPreviewPage,
});

const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dao",
  component: Layout,
});

const daoIndexRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "/",
  component: DaoHomePage,
});

const tokenomicsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "tokenomics",
  component: TokenomicsPage,
});

const emissionScheduleRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "emissions",
  component: EmissionSchedulePage,
});

const researchCreditsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "research-credits",
  component: ResearchCreditsPage,
});

const participationEconomyRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "participation",
  component: ParticipationEconomyPage,
});

const treasuryRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "treasury",
  component: TreasuryPage,
});

const stakingRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "staking",
  component: StakingPage,
});

const governanceRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "governance",
  component: GovernancePage,
});

const communityRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "community",
  component: CommunityPage,
});

const auditHistoryRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "audit-history",
  component: AuditHistoryPage,
});

const futureRoadmapRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "future-roadmap",
  component: FutureRoadmapPage,
});

const deployRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "deploy",
  component: DeployLandingPage,
});

const engagementRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "engagement",
  component: AdminEngagementPage,
});

const discoveryRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "discovery",
  component: DiscoveryPage,
});

const discoveryNetworkRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "discovery/network",
  component: DiscoveryNetworkPage,
});

const discoveryIdeasRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "discovery/ideas",
  component: DiscoveryIdeasPage,
});

const discoveryCollaboratorsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "discovery/collaborators",
  component: DiscoveryCollaboratorsPage,
});

const discoveryDashboardRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: "discovery/dashboard",
  component: DiscoveryDashboardPage,
});

/* ------------------------------------------------------------------ */
/* SOVEREIGN OS — desktop shell and Nation workspace apps              */
/* ------------------------------------------------------------------ */

const osDesktopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "os",
  component: OsDesktopPage,
});

const osLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "os-shell",
  component: OsShell,
});

const osNationRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/nation",
  component: NationDashboardPage,
});

const osGovernanceRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/governance",
  component: GovernanceAppPage,
});

const osGovernanceControlCenterRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/governance/control-center",
  component: GovernanceControlCenterPage,
});

const osConstitutionRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/constitution",
  component: ConstitutionBuilderPage,
});

const osDiscussionsRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/discussions",
  component: DiscussionsAppPage,
});

const osMembersRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/members",
  component: MembersAppPage,
});

const osDocumentsRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/documents",
  component: DocumentsAppPage,
});

const osFilesRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/files",
  component: FilesAppPage,
});

const osCalendarRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/calendar",
  component: CalendarAppPage,
});

const osTreasuryRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/treasury",
  component: TreasuryAppPage,
});

const osCopilotRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/copilot",
  component: CopilotAppPage,
});

const osProjectsRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/projects",
  component: ProjectsAppPage,
});

const osConservationRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/conservation",
  component: ConservationAppPage,
});

const osSettingsRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/settings",
  component: NationSettingsAppPage,
});

const osNetworkRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/network",
  component: NetworkAppPage,
});

const osLauncherRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/launcher",
  component: LauncherAppPage,
});

const osFoundingRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/founding",
  component: FoundingInvitationPage,
});

const osSampleRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/sample",
  component: SampleNationAppPage,
});

const osSavingsRoute = createRoute({
  getParentRoute: () => osLayoutRoute,
  path: "os/savings",
  component: SavingsAppPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  deployLandingRoute,
  fundraisingRoute,
  daoPreviewRoute,
  osDesktopRoute,
  osLayoutRoute.addChildren([
    osNationRoute,
    osGovernanceRoute,
    osGovernanceControlCenterRoute,
    osConstitutionRoute,
    osDiscussionsRoute,
    osMembersRoute,
    osDocumentsRoute,
    osFilesRoute,
    osCalendarRoute,
    osTreasuryRoute,
    osCopilotRoute,
    osProjectsRoute,
    osConservationRoute,
    osSettingsRoute,
    osNetworkRoute,
    osLauncherRoute,
    osFoundingRoute,
    osSampleRoute,
    osSavingsRoute,
  ]),
  daoLayoutRoute.addChildren([
    daoIndexRoute,
    tokenomicsRoute,
    emissionScheduleRoute,
    researchCreditsRoute,
    participationEconomyRoute,
    treasuryRoute,
    stakingRoute,
    governanceRoute,
    communityRoute,
    auditHistoryRoute,
    futureRoadmapRoute,
    deployRoute,
    engagementRoute,
    discoveryRoute,
    discoveryNetworkRoute,
    discoveryIdeasRoute,
    discoveryCollaboratorsRoute,
    discoveryDashboardRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
