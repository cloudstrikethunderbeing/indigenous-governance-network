// SOVEREIGN OS — Nation workspaces.
//
// This module defines the data model for the SOVEREIGN OS Nation workspace
// layer only. It is additive to every existing domain (DAO economy,
// governance, treasury, staking, waitlist, visitor engagement, Discovery):
// nothing here changes or replaces an existing type.
//
// Privacy model: a Nation's workspace content is community-controlled. The
// `privacyLevel` on a Nation and the per-content `privacy` settings decide
// what another Nation may read; the SOVEREIGN Network listing is opt-in and
// off by default. AI is advisory only — the Copilot answers questions and
// never mutates proposals, votes, membership or treasury.
import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  // Shared types reused from the common module.
  public type Timestamp = Common.Timestamp;
  public type ProposalId = Common.ProposalId;
  public type VoteChoice = Common.VoteChoice;

  // The stored file-content reference type. File bytes live off-chain; the
  // backend stores only this reference. Never a Text id or URL.
  public type ExternalBlob = Storage.ExternalBlob;

  // ---------------------------------------------------------------------
  // Identifiers
  // ---------------------------------------------------------------------

  public type NationId = Nat;
  public type WorkspaceId = Nat;
  public type WorkspaceAppId = Nat;
  public type NationProposalId = Nat;
  public type DiscussionThreadId = Nat;
  public type DiscussionPostId = Nat;
  public type NationMemberId = Nat;
  public type NationDocumentId = Nat;
  public type CalendarEventId = Nat;
  public type NationTreasuryTransactionId = Nat;

  // ---------------------------------------------------------------------
  // Nation
  //
  // A Nation is a sovereign community workspace. `isSample` marks the
  // built-in demonstration Nation whose workspace the app reads on first
  // load; it is never a real community's data. `openToCollaboration` is the
  // Nation's own choice and is independent of the SOVEREIGN Network opt-in.
  // ---------------------------------------------------------------------

  // How broadly a Nation's workspace content may be read.
  public type PrivacyLevel = {
    #privateToMembers;
    #openToCollaboration;
    #publiclyVisible;
  };

  public type Nation = {
    id : NationId;
    name : Text;
    shortDescription : Text;
    // Region or territory label, e.g. "Pacific Northwest".
    region : Text;
    // Human-readable governance model label, e.g. "Consensus council".
    governanceModel : Text;
    privacyLevel : PrivacyLevel;
    // True only for the built-in demonstration Nation.
    isSample : Bool;
    // Whether this Nation is open to collaboration with other Nations.
    openToCollaboration : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace
  //
  // A workspace is scoped to exactly one Nation. A Nation may have more
  // than one workspace; each workspace owns its own app registry and
  // content.
  // ---------------------------------------------------------------------

  public type Workspace = {
    id : WorkspaceId;
    nation : NationId;
    name : Text;
    description : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace app registry
  //
  // The apps a workspace shows. `status` distinguishes a working app from
  // one that is labelled Preview. `iconKey` is a stable key the frontend
  // maps to an icon; `order` is the display position within the workspace.
  // ---------------------------------------------------------------------

  public type WorkspaceAppStatus = { #working; #preview };

  public type WorkspaceApp = {
    id : WorkspaceAppId;
    workspace : WorkspaceId;
    // Stable app key, e.g. "governance".
    appKey : Text;
    displayName : Text;
    oneLineDescription : Text;
    status : WorkspaceAppStatus;
    iconKey : Text;
    order : Nat;
  };

  // ---------------------------------------------------------------------
  // Workspace content — governance
  //
  // Nation-scoped proposals with status and vote tallies. These are the
  // Nation workspace's own proposals, distinct from the DAO's global
  // governance proposals in types/common.mo.
  // ---------------------------------------------------------------------

  public type NationProposalStatus = {
    #draft;
    #open;
    #passed;
    #rejected;
    #withdrawn;
  };

  public type NationProposal = {
    id : NationProposalId;
    nation : NationId;
    title : Text;
    summary : Text;
    status : NationProposalStatus;
    votesInFavor : Nat;
    votesAgainst : Nat;
    votesAbstain : Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace content — discussion
  // ---------------------------------------------------------------------

  public type DiscussionThread = {
    id : DiscussionThreadId;
    nation : NationId;
    title : Text;
    // The member who opened the thread.
    author : Principal;
    timestamp : Timestamp;
  };

  public type DiscussionPost = {
    id : DiscussionPostId;
    thread : DiscussionThreadId;
    author : Principal;
    body : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace content — members
  //
  // A Nation member with a role label and the permission labels granted to
  // that role. `permissionLabels` are human-readable capability labels, not
  // the platform's `UserRole` values.
  // ---------------------------------------------------------------------

  public type NationMember = {
    id : NationMemberId;
    nation : NationId;
    member : Principal;
    displayName : Text;
    roleLabel : Text;
    permissionLabels : [Text];
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace content — documents
  //
  // `body` is the readable document text. Documents are Nation-scoped and
  // subject to the Nation's privacy level.
  // ---------------------------------------------------------------------

  public type NationDocument = {
    id : NationDocumentId;
    nation : NationId;
    title : Text;
    body : Text;
    // The member who last saved the document.
    author : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace content — calendar
  // ---------------------------------------------------------------------

  public type CalendarEvent = {
    id : CalendarEventId;
    nation : NationId;
    title : Text;
    description : Text;
    // Event start, in nanoseconds since epoch.
    startTime : Timestamp;
    // Event end, in nanoseconds since epoch.
    endTime : Timestamp;
    location : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Workspace content — treasury
  //
  // A Nation's own treasury summary plus its transactions, each carrying a
  // spending category. This is separate from the DAO's global treasury
  // ledger in types/common.mo.
  // ---------------------------------------------------------------------

  public type NationTreasuryDirection = { #income; #expense };

  public type NationTreasuryTransaction = {
    id : NationTreasuryTransactionId;
    nation : NationId;
    direction : NationTreasuryDirection;
    // Spending category label, e.g. "Education".
    category : Text;
    amount : Nat;
    description : Text;
    timestamp : Timestamp;
  };

  // The Nation treasury summary the workspace dashboard reads.
  public type NationTreasurySummary = {
    nation : NationId;
    totalIncome : Nat;
    totalExpense : Nat;
    // totalIncome - totalExpense, floored at zero.
    balance : Nat;
    transactionCount : Nat;
  };

  // ---------------------------------------------------------------------
  // Nation configuration
  //
  // Governance model options, the roles-and-permissions matrix, and the
  // privacy settings controlling which workspace content other Nations may
  // read.
  // ---------------------------------------------------------------------

  // A selectable governance model option.
  public type GovernanceModelOption = {
    // Stable option key, e.g. "consensusCouncil".
    modelKey : Text;
    labelText : Text;
    description : Text;
  };

  // One cell of the roles-and-permissions matrix: a role, a capability, and
  // whether that role is allowed that capability.
  public type RolePermissionEntry = {
    roleLabel : Text;
    capability : Text;
    allowed : Bool;
  };

  // Which workspace content areas are visible to other Nations.
  public type PrivacySettings = {
    nation : NationId;
    // Whether proposals are visible to other Nations.
    proposalsVisible : Bool;
    // Whether discussions are visible to other Nations.
    discussionsVisible : Bool;
    // Whether documents are visible to other Nations.
    documentsVisible : Bool;
    // Whether the calendar is visible to other Nations.
    calendarVisible : Bool;
    // Whether the treasury summary is visible to other Nations.
    treasuryVisible : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // SOVEREIGN Network
  //
  // The list of participating Nations with a short profile and collaboration
  // interests. Participation is opt-in and off by default.
  // ---------------------------------------------------------------------

  public type NetworkNationProfile = {
    nation : NationId;
    name : Text;
    shortDescription : Text;
    region : Text;
    collaborationInterests : [Text];
    // Opt-in flag: false keeps the Nation out of the SOVEREIGN Network.
    networkOptIn : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Nation OS launcher — five-step creation
  //
  // The launcher collects a Nation's name, governance model, membership and
  // voting permissions, selected applications and visual theme, then persists
  // a new isolated Nation with its workspace, apps and settings. A newly
  // created Nation is private and not opted in to the SOVEREIGN Network.
  // ---------------------------------------------------------------------

  // The visual theme chosen in the launcher. Wallpaper preferences are kept
  // separate from governance and identity settings.
  public type NationTheme = {
    // Theme mode key, e.g. "light", "dark", "system".
    themeKey : Text;
    // Wallpaper key, e.g. "neutral", "pacificCoast".
    wallpaperKey : Text;
    // Whether a subtle blur/dimming is applied to the desktop wallpaper.
    blurEnabled : Bool;
  };

  // Membership and voting configuration from the launcher.
  public type MembershipVotingConfig = {
    // Membership model key, e.g. "open", "inviteOnly", "approval".
    membershipModel : Text;
    // Voting model key, e.g. "oneMemberOneVote", "consensus".
    votingModel : Text;
    // Quorum as a whole percentage (0-100).
    quorumPercent : Nat;
    // Approval threshold as a whole percentage (0-100).
    approvalThresholdPercent : Nat;
  };

  // One application selected in the launcher. `status` distinguishes a
  // working app from one that is labelled Preview.
  public type SelectedApp = {
    appKey : Text;
    displayName : Text;
    oneLineDescription : Text;
    status : WorkspaceAppStatus;
    iconKey : Text;
  };

  // The five-step launcher input. A signed-in creator supplies this and the
  // backend persists a new isolated Nation from it.
  public type NationLauncherConfig = {
    name : Text;
    shortDescription : Text;
    region : Text;
    // Governance model key from listGovernanceModelOptions.
    governanceModelKey : Text;
    membershipVoting : MembershipVotingConfig;
    selectedApps : [SelectedApp];
    theme : NationTheme;
  };

  // Ownership record: which principal created a Nation. Used to scope Nation
  // switching and configuration to authorized members.
  public type NationOwnership = {
    nation : NationId;
    creator : Principal;
    timestamp : Timestamp;
  };

  // A Nation's own workspace and settings, read as one view.
  public type NationWorkspaceView = {
    nation : Nation;
    workspace : ?Workspace;
    apps : [WorkspaceApp];
    theme : NationTheme;
    membershipVoting : MembershipVotingConfig;
    privacySettings : PrivacySettings;
    // The Nation's confirmed SOVEREIGN Network opt-in state.
    networkOptIn : Bool;
  };

  // The collaboration participation state shown in the workspace.
  // `displayLabel` is the honest display string: "Private — Not Participating"
  // until an authorized administrator confirms opt-in, then "Open to
  // Collaboration". (`label` is a reserved Motoko keyword, so the field is
  // named `displayLabel`.)
  public type CollaborationState = {
    nation : NationId;
    optedIn : Bool;
    displayLabel : Text;
    isSample : Bool;
  };

  // ---------------------------------------------------------------------
  // AI Copilot
  //
  // A read-only question-and-answer call scoped to one Nation workspace. The
  // answer is advisory only and carries the workspace sources it drew on.
  // The Copilot never mutates proposals, votes, membership or treasury.
  // ---------------------------------------------------------------------

  // A workspace source the Copilot drew on, for citation in the answer.
  public type CopilotSource = {
    // The kind of workspace content, e.g. "proposal", "document".
    sourceKind : Text;
    // The referenced entity id, interpreted according to `sourceKind`.
    referenceId : Nat;
    title : Text;
  };

  public type CopilotAnswer = {
    nation : NationId;
    question : Text;
    answer : Text;
    sources : [CopilotSource];
    // Always true: the answer is advisory and changed no workspace state.
    advisoryOnly : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Results and errors
  //
  // Validation and authorization failures are returned to the caller as
  // variants rather than traps, so the frontend can present an actionable
  // message and the caller can retry.
  // ---------------------------------------------------------------------

  public type SovereignError = {
    #missingName;
    #missingTitle;
    #missingBody;
    #bodyTooLong;
    #unknownNation;
    #unknownWorkspace;
    #unknownProposal;
    #unknownThread;
    #unknownDocument;
    #unknownEvent;
    #unknownMember;
    #notAuthorized;
    #notNationMember;
    #invalidPrivacyLevel;
    #invalidTimeRange;
    #missingGovernanceModel;
    #missingApps;
    #invalidTheme;
    #notNationOwner;
  };

  public type SaveNationResult = {
    #ok : NationId;
    #err : SovereignError;
  };

  public type SaveWorkspaceResult = {
    #ok : WorkspaceId;
    #err : SovereignError;
  };

  public type SaveWorkspaceAppResult = {
    #ok : WorkspaceAppId;
    #err : SovereignError;
  };

  public type SaveNationProposalResult = {
    #ok : NationProposalId;
    #err : SovereignError;
  };

  public type SaveDiscussionThreadResult = {
    #ok : DiscussionThreadId;
    #err : SovereignError;
  };

  public type SaveDiscussionPostResult = {
    #ok : DiscussionPostId;
    #err : SovereignError;
  };

  public type SaveNationMemberResult = {
    #ok : NationMemberId;
    #err : SovereignError;
  };

  public type SaveNationDocumentResult = {
    #ok : NationDocumentId;
    #err : SovereignError;
  };

  public type SaveCalendarEventResult = {
    #ok : CalendarEventId;
    #err : SovereignError;
  };

  public type SaveNationTreasuryTransactionResult = {
    #ok : NationTreasuryTransactionId;
    #err : SovereignError;
  };

  public type SavePrivacySettingsResult = {
    #ok;
    #err : SovereignError;
  };

  public type SetNetworkOptInResult = {
    #ok;
    #err : SovereignError;
  };

  public type AskCopilotResult = {
    #ok : CopilotAnswer;
    #err : SovereignError;
  };

  public type CreateNationResult = {
    #ok : NationId;
    #err : SovereignError;
  };

  public type SaveNationThemeResult = {
    #ok;
    #err : SovereignError;
  };

  public type SaveMembershipVotingResult = {
    #ok;
    #err : SovereignError;
  };

  // ---------------------------------------------------------------------
  // Nation Files — the shared document storage layer
  //
  // Every Nation has its own independent file namespace. A folder tree and
  // file records are scoped to exactly one Nation and are private by
  // default. File bytes live off-chain and are referenced by an
  // `ExternalBlob`; both the metadata and the content reference are
  // access-controlled on the backend, never by frontend filtering alone.
  //
  // Files are the central document storage layer: Governance, Documents,
  // Discussions, Projects and Calendar reference the same stored files
  // through attachment links rather than creating duplicate copies. Files
  // are never automatically shared through the regional collaboration
  // network.
  // ---------------------------------------------------------------------

  public type NationFolderId = Nat;
  public type NationFileId = Nat;
  public type FileAttachmentId = Nat;

  // A folder in a Nation's file tree. `parent` is `null` for a root folder.
  // Folders are scoped to one Nation; a folder's parent must belong to the
  // same Nation.
  public type NationFolder = {
    id : NationFolderId;
    nation : NationId;
    // The containing folder, or `null` for a root folder.
    parent : ?NationFolderId;
    name : Text;
    // The member who created the folder.
    createdBy : Principal;
    timestamp : Timestamp;
  };

  // A stored file's metadata. `content` is the off-chain content reference;
  // the bytes are never stored on-chain. `folder` is `null` for a file at
  // the Nation's root.
  public type NationFile = {
    id : NationFileId;
    nation : NationId;
    folder : ?NationFolderId;
    name : Text;
    // Size in bytes, as reported by the uploader.
    size : Nat;
    // MIME content type, e.g. "application/pdf", "image/png".
    contentType : Text;
    // The member who uploaded the file.
    uploadedBy : Principal;
    // The off-chain content reference. Never a Text id or URL.
    content : ExternalBlob;
    timestamp : Timestamp;
  };

  // The kind of workspace record an attachment is linked to. Governance,
  // Documents, Discussions, Projects and Calendar all reference the same
  // stored files through these links.
  public type FileAttachmentTarget = {
    #proposal : NationProposalId;
    #discussionPost : DiscussionPostId;
    #project : Nat;
    #calendarEvent : CalendarEventId;
    #document : NationDocumentId;
  };

  // A link from a workspace record to an existing stored file. The link
  // carries no copy of the file: opening it resolves the referenced
  // `NationFile` and respects that file's permissions.
  public type FileAttachment = {
    id : FileAttachmentId;
    nation : NationId;
    file : NationFileId;
    target : FileAttachmentTarget;
    // The member who created the link.
    attachedBy : Principal;
    timestamp : Timestamp;
  };

  // A Nation's file-storage summary for the Files app header.
  public type NationFileSummary = {
    nation : NationId;
    fileCount : Nat;
    folderCount : Nat;
    // Total size in bytes across the Nation's files.
    totalBytes : Nat;
  };

  // ---------------------------------------------------------------------
  // Nation Files — results and errors
  // ---------------------------------------------------------------------

  public type FileError = {
    #missingName;
    #nameTooLong;
    #unknownNation;
    #unknownFolder;
    #unknownFile;
    #unknownAttachment;
    #unknownTarget;
    #notAuthorized;
    #notNationMember;
    #folderNotEmpty;
    #duplicateName;
    #invalidMove;
    #crossNationAccess;
    #sampleReadOnly;
  };

  public type SaveFolderResult = {
    #ok : NationFolderId;
    #err : FileError;
  };

  public type SaveFileResult = {
    #ok : NationFileId;
    #err : FileError;
  };

  public type SaveAttachmentResult = {
    #ok : FileAttachmentId;
    #err : FileError;
  };

  public type DeleteFileResult = {
    #ok;
    #err : FileError;
  };

  public type DeleteFolderResult = {
    #ok;
    #err : FileError;
  };

  public type MoveFileResult = {
    #ok;
    #err : FileError;
  };

  public type RenameFolderResult = {
    #ok;
    #err : FileError;
  };

  // =====================================================================
  // DAO Constitution & Governance
  //
  // Additive to the Nation workspace layer above. A Nation's constitution
  // is a versioned governance policy: the rule set in force, the amendment
  // history recording each amendment and the rules in effect at that time,
  // and a founding setup state that keeps an incomplete DAO in Founding
  // Setup until an authorized activation. Every record is scoped to exactly
  // one Nation and is private by default.
  //
  // These are example policies, not assumptions about an organization's
  // legal or traditional governance authority. The DAO governs; the OS is
  // the interface.
  // =====================================================================

  public type ConstitutionId = Nat;
  public type AmendmentId = Nat;
  public type GovernanceRoleId = Nat;
  public type RoleAssignmentId = Nat;
  public type RoleDelegationId = Nat;
  public type GovernanceProposalId = Nat;
  public type ExecutionRequestId = Nat;
  public type AppealId = Nat;
  public type CensusEntryId = Nat;

  // ---------------------------------------------------------------------
  // Founding setup state
  //
  // An incomplete DAO stays in Founding Setup until an authorized
  // activation. A declined or expired founding appointment can be replaced.
  // ---------------------------------------------------------------------

  public type FoundingSetupStatus = {
    // Collecting founding authorities and governance rules.
    #foundingSetup;
    // All founding authorities accepted and the constitution is confirmed.
    #activated;
    // Setup expired or was cancelled before activation.
    #expired;
    #cancelled;
  };

  // One founding authority appointment. Each authority independently accepts
  // through Internet Identity. A declined or expired appointment can be
  // replaced by the founding authority that created it.
  public type FoundingAppointmentStatus = {
    #pending;
    #accepted;
    #declined;
    #expired;
    #replaced;
  };

  public type FoundingAppointment = {
    id : Nat;
    nation : NationId;
    // The authority's Internet Identity principal.
    authority : Principal;
    // Human-readable appointment label, e.g. "Founding Authority #2".
    appointmentLabel : Text;
    status : FoundingAppointmentStatus;
    // When the appointment expires if not accepted.
    expiresAt : Timestamp;
    // Single-use invitation token, bound to the accepting principal. Empty
    // when the appointment was made by principal id rather than invitation.
    invitationToken : Text;
    // The email the invitation was sent to, when one was sent.
    invitedEmail : ?Text;
    // When the invitation token was consumed by an acceptance.
    acceptedAt : ?Timestamp;
    timestamp : Timestamp;
  };

  // The founding setup record for a Nation. `status` keeps an incomplete DAO
  // in Founding Setup; `foundingAuthority` is the authority that created the
  // DAO and appoints the others.
  public type FoundingSetup = {
    nation : NationId;
    status : FoundingSetupStatus;
    foundingAuthority : Principal;
    // When the whole setup expires if not activated.
    setupExpiresAt : Timestamp;
    // The constitution version confirmed at activation, if activated.
    activatedConstitutionVersion : ?Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Constitution — versioned governance policy
  //
  // The rule set is the full configurable governance configuration. Each
  // amendment produces a new constitution version; the version in force is
  // the active constitution. Historical decisions are preserved under the
  // rules effective when those decisions occurred.
  // ---------------------------------------------------------------------

  // The complete configurable governance rule set. Every field is a plain
  // setting the organization defines for itself; the templates are examples,
  // not assumptions.
  public type GovernanceRuleSet = {
    // Founding authority and appointment procedures.
    foundingAuthorityProcedure : Text;
    // Membership eligibility and identity verification.
    membershipEligibility : Text;
    identityVerification : Text;
    // Membership approval thresholds (whole percentage 0-100).
    membershipApprovalThresholdPercent : Nat;
    // Login and participation requirements.
    loginRequirement : Text;
    participationRequirement : Text;
    // Voting eligibility and new-member waiting periods (in days).
    votingEligibility : Text;
    newMemberWaitingPeriodDays : Nat;
    // Voting methods, delegation and voting weight.
    votingMethod : Text;
    delegationAllowed : Bool;
    votingWeight : Text;
    // Proposal submission, review and discussion periods (in days).
    proposalSubmissionPeriodDays : Nat;
    proposalReviewPeriodDays : Nat;
    proposalDiscussionPeriodDays : Nat;
    // Quorum, voting thresholds, abstentions and ties.
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
    abstentionsCount : Bool;
    tieBreakRule : Text;
    // Proposal classifications and approval outcomes.
    proposalClassifications : [Text];
    approvalOutcomes : [Text];
    // Treasury limits and financial authorizations.
    treasurySpendLimit : Nat;
    treasuryAuthorization : Text;
    // Leadership elections, terms and removals.
    leadershipElectionProcedure : Text;
    leadershipTermDays : Nat;
    leadershipRemovalProcedure : Text;
    // Document access and confidentiality.
    documentAccess : Text;
    confidentialityRule : Text;
    // AI permissions and human oversight.
    aiPermissions : Text;
    humanOversight : Text;
    // Appeals, disputes and evidence review.
    appealsProcedure : Text;
    disputeProcedure : Text;
    evidenceReviewProcedure : Text;
    // Emergency pause and governance recovery.
    emergencyPauseProcedure : Text;
    governanceRecoveryProcedure : Text;
    // Constitutional amendments.
    amendmentProcedure : Text;
    // Inter-DAO collaboration and data sharing.
    collaborationDataSharing : Text;
    // Dissolution, exit and data export.
    dissolutionProcedure : Text;
    dataExportProcedure : Text;
  };

  // A versioned constitution. `version` increments with each authorized
  // amendment; `rules` is the rule set in force for that version.
  public type Constitution = {
    id : ConstitutionId;
    nation : NationId;
    version : Nat;
    // The rule set in force for this version.
    rules : GovernanceRuleSet;
    // The template the constitution was created from, e.g. "indigenousNation".
    templateKey : Text;
    // The authority that confirmed this version.
    confirmedBy : Principal;
    // True only for the version currently in force.
    active : Bool;
    // One ratification record per founding authority that ratified this
    // version. Activation requires every accepted founding authority to
    // ratify the same version. Optional so a version created before
    // ratification tracking reads as not yet ratified.
    ratifications : ?[PlanRatification];
    timestamp : Timestamp;
  };

  // One amendment to a constitution. Records the amendment and the rules in
  // effect at that time, so a historical decision can be read under the
  // rules that governed it.
  public type Amendment = {
    id : AmendmentId;
    nation : NationId;
    // The constitution version this amendment produced.
    resultingVersion : Nat;
    // The version the amendment changed from.
    previousVersion : Nat;
    summary : Text;
    // The rules in effect before the amendment.
    previousRules : GovernanceRuleSet;
    // The rules in effect after the amendment.
    newRules : GovernanceRuleSet;
    // The authority that authorized the amendment.
    authorizedBy : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Roles & permissions
  //
  // The ten built-in governance roles plus custom roles. Permissions are
  // scoped across view, propose, approve, vote, modify and execute. A member
  // may hold multiple roles; a delegation carries an expiry and can be
  // revoked.
  // ---------------------------------------------------------------------

  // The ten built-in governance roles. `#custom` carries the custom role id.
  public type GovernanceRoleKind = {
    #foundingAuthority;
    #membershipAuthority;
    #member;
    #governanceDelegate;
    #proposalSteward;
    #executionAuthority;
    #treasurySteward;
    #documentSteward;
    #auditor;
    #observer;
    #custom : GovernanceRoleId;
  };

  // The six scoped permission capabilities.
  public type GovernanceCapability = {
    #view;
    #propose;
    #approve;
    #vote;
    #modify;
    #execute;
  };

  // A governance role definition. Built-in roles are seeded per Nation;
  // custom roles are created within platform security constraints.
  public type GovernanceRole = {
    id : GovernanceRoleId;
    nation : NationId;
    kind : GovernanceRoleKind;
    // Human-readable role name, e.g. "Treasury Steward".
    roleName : Text;
    // Plain-language explanation of what the role can do.
    description : Text;
    // The capabilities this role is granted.
    capabilities : [GovernanceCapability];
    // True for a custom role created by the Nation.
    isCustom : Bool;
    timestamp : Timestamp;
  };

  // A member's assignment to a role. A member may hold multiple roles.
  public type RoleAssignment = {
    id : RoleAssignmentId;
    nation : NationId;
    member : Principal;
    role : GovernanceRoleId;
    // The authority that granted the role.
    grantedBy : Principal;
    timestamp : Timestamp;
  };

  // A scoped delegation of a role's authority. Carries an expiry and can be
  // revoked before it expires.
  public type RoleDelegation = {
    id : RoleDelegationId;
    nation : NationId;
    delegator : Principal;
    delegate : Principal;
    role : GovernanceRoleId;
    // The capabilities delegated (a subset of the role's capabilities).
    capabilities : [GovernanceCapability];
    // When the delegation expires.
    expiresAt : Timestamp;
    // True until revoked or expired.
    active : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Decisions & execution
  //
  // A governance proposal carries its classification, review and discussion
  // periods, quorum, thresholds, abstentions and ties. Passing a vote never
  // implies execution: execution is a separate request, manually authorized
  // by default, with timelocks, cancellation, emergency pause and an audit
  // trail.
  // ---------------------------------------------------------------------

  public type GovernanceProposalStatus = {
    #draft;
    // In the review period before discussion opens.
    #review;
    // Open for discussion.
    #discussion;
    // Open for voting.
    #voting;
    // Voting closed; awaiting an execution request.
    #passed;
    #rejected;
    #withdrawn;
  };

  // How a proposal's outcome is decided.
  public type ProposalOutcome = {
    #approved;
    #rejected;
    // Quorum was not met.
    #noQuorum;
    // The vote tied and the tie rule did not resolve it.
    #tied;
  };

  public type GovernanceProposal = {
    id : GovernanceProposalId;
    nation : NationId;
    title : Text;
    summary : Text;
    // The proposal classification, e.g. "treasuryExpenditure".
    classification : Text;
    status : GovernanceProposalStatus;
    proposer : Principal;
    // The constitution version in force when the proposal was created.
    constitutionVersion : Nat;
    // Review and discussion periods, in days.
    reviewPeriodDays : Nat;
    discussionPeriodDays : Nat;
    // Quorum and approval threshold, as whole percentages (0-100).
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
    // Whether abstentions count toward quorum.
    abstentionsCount : Bool;
    // The tie-break rule applied when the vote ties.
    tieBreakRule : Text;
    votesInFavor : Nat;
    votesAgainst : Nat;
    votesAbstain : Nat;
    // Set once voting closes.
    outcome : ?ProposalOutcome;
    timestamp : Timestamp;
  };

  // A confidential vote. `confidential` votes are counted but their voter is
  // withheld from public reads; the Participation Census records that a vote
  // occurred without exposing the confidential choice.
  public type GovernanceVote = {
    proposal : GovernanceProposalId;
    nation : NationId;
    voter : Principal;
    choice : VoteChoice;
    // True when the voter asked for the choice to stay confidential.
    confidential : Bool;
    timestamp : Timestamp;
  };

  // The execution lifecycle of an approved proposal. Passing a vote never
  // implies execution: a separate request is created and manually authorized
  // by default.
  public type ExecutionStatus = {
    // Created, awaiting authorization.
    #pendingAuthorization;
    // Authorized, waiting out its timelock.
    #timelocked;
    // Executed and recorded.
    #executed;
    #cancelled;
    // Blocked by an emergency pause.
    #paused;
    #rejected;
  };

  // A separate execution request for an approved proposal. High-risk actions
  // require independent authorization; a timelock delays execution; an
  // emergency pause blocks it.
  public type ExecutionRequest = {
    id : ExecutionRequestId;
    nation : NationId;
    proposal : GovernanceProposalId;
    status : ExecutionStatus;
    // The authority that requested execution.
    requestedBy : Principal;
    // The authority that authorized execution, once authorized.
    authorizedBy : ?Principal;
    // True when the action is high-risk and needs independent authorization.
    highRisk : Bool;
    // The timelock end, once authorized.
    timelockUntil : ?Timestamp;
    // The authority that cancelled the request, if cancelled.
    cancelledBy : ?Principal;
    // The constitution version in force when execution was authorized.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // One entry in an execution audit trail. Every state change to an
  // execution request is recorded; unauthorized, duplicate or modified
  // execution requests are rejected.
  public type ExecutionAuditEntry = {
    id : Nat;
    nation : NationId;
    request : ExecutionRequestId;
    // The action recorded, e.g. "requested", "authorized", "executed".
    action : Text;
    // The authority that performed the action.
    actorPrincipal : Principal;
    // A short note, e.g. the rejection reason.
    note : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Appeals, disputes and recusal
  //
  // Appeals cover membership rejection, inactivity and governance
  // decisions. An appeal carries evidence and a recusal record for any
  // reviewer with a conflict of interest.
  // ---------------------------------------------------------------------

  public type AppealKind = {
    #membershipRejection;
    #inactivity;
    #governanceDecision;
  };

  public type AppealStatus = {
    #submitted;
    #underReview;
    #upheld;
    #denied;
    #withdrawn;
  };

  // One piece of evidence attached to an appeal.
  public type AppealEvidence = {
    // A short label for the evidence.
    evidenceLabel : Text;
    // The evidence body or a reference to a stored document.
    detail : Text;
    // The member who submitted the evidence.
    submittedBy : Principal;
    timestamp : Timestamp;
  };

  // A reviewer's recusal from an appeal because of a conflict of interest.
  public type AppealRecusal = {
    reviewer : Principal;
    // The documented conflict of interest.
    reason : Text;
    timestamp : Timestamp;
  };

  public type Appeal = {
    id : AppealId;
    nation : NationId;
    kind : AppealKind;
    status : AppealStatus;
    // The member who filed the appeal.
    appellant : Principal;
    // The subject of the appeal, interpreted according to `kind`.
    subjectId : Nat;
    summary : Text;
    evidence : [AppealEvidence];
    recusals : [AppealRecusal];
    // The authority that decided the appeal, once decided.
    decidedBy : ?Principal;
    decisionNote : ?Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Participation Census
  //
  // A privacy-aware governance accountability record: who is eligible, who
  // participates, what decisions are made and whether approved actions are
  // executed. Confidential votes are recorded as participation without
  // exposing the choice. Historical records are preserved after membership
  // or authority changes.
  // ---------------------------------------------------------------------

  public type CensusEventKind = {
    #membershipApproval;
    #activity;
    #proposal;
    #vote;
    #delegation;
    #permissionChange;
    #dispute;
    #executionOutcome;
  };

  // One Participation Census entry. `confidential` marks an entry whose
  // detail must not be exposed publicly (for example a confidential vote).
  public type CensusEntry = {
    id : CensusEntryId;
    nation : NationId;
    kind : CensusEventKind;
    // The member the entry concerns.
    subject : Principal;
    // The related record id, interpreted according to `kind`.
    referenceId : Nat;
    // A short, privacy-aware summary of the event.
    summary : Text;
    // True when the entry's detail is confidential.
    confidential : Bool;
    // The constitution version in force when the event occurred.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // A Nation's Participation Census summary for the accountability
  // dashboard.
  public type CensusSummary = {
    nation : NationId;
    eligibleMembers : Nat;
    activeMembers : Nat;
    proposals : Nat;
    votes : Nat;
    delegations : Nat;
    disputes : Nat;
    executions : Nat;
  };

  // ---------------------------------------------------------------------
  // Governance results and errors
  // ---------------------------------------------------------------------

  public type GovernanceError = {
    #missingName;
    #missingTitle;
    #missingSummary;
    #unknownNation;
    #unknownConstitution;
    #unknownRole;
    #unknownProposal;
    #unknownExecutionRequest;
    #unknownAppeal;
    #notAuthorized;
    #notNationMember;
    #notFoundingAuthority;
    #notInFoundingSetup;
    #alreadyActivated;
    #setupExpired;
    #invalidRuleSet;
    #invalidThreshold;
    #invalidTimelock;
    #duplicateExecution;
    #executionPaused;
    #proposalNotPassed;
    #alreadyVoted;
    #delegationExpired;
    #conflictOfInterest;
    // The founding setup expired before activation; the creator can start a
    // fresh founding setup for the same Nation.
    #setupExpiredRecoverable;
    // The founding setup was cancelled before activation; the creator can
    // start a fresh founding setup for the same Nation.
    #setupCancelledRecoverable;
  };

  public type SaveConstitutionResult = {
    #ok : ConstitutionId;
    #err : GovernanceError;
  };

  public type SaveAmendmentResult = {
    #ok : AmendmentId;
    #err : GovernanceError;
  };

  public type SaveRoleResult = {
    #ok : GovernanceRoleId;
    #err : GovernanceError;
  };

  public type SaveRoleAssignmentResult = {
    #ok : RoleAssignmentId;
    #err : GovernanceError;
  };

  public type SaveRoleDelegationResult = {
    #ok : RoleDelegationId;
    #err : GovernanceError;
  };

  public type SaveGovernanceProposalResult = {
    #ok : GovernanceProposalId;
    #err : GovernanceError;
  };

  public type SaveExecutionRequestResult = {
    #ok : ExecutionRequestId;
    #err : GovernanceError;
  };

  public type SaveAppealResult = {
    #ok : AppealId;
    #err : GovernanceError;
  };

  public type ActivateFoundingResult = {
    #ok;
    #err : GovernanceError;
  };

  // =====================================================================
  // Constitutional enforcement
  //
  // Additive to the constitution and governance layer above. These records
  // carry the enforcement state the backend needs to apply a Nation's own
  // constitution: membership join requests and invitations, per-member
  // admission records, one recorded vote per member per decision, and an
  // append-only per-Nation governance history. Every record is scoped to
  // exactly one Nation and is private by default.
  // =====================================================================

  public type JoinRequestId = Nat;
  public type MembershipInvitationId = Nat;
  public type MemberAdmissionId = Nat;
  public type RecordedVoteId = Nat;
  public type GovernanceHistoryId = Nat;

  // ---------------------------------------------------------------------
  // Membership onboarding
  //
  // Workflow: Request -> Pending Review -> Required Approvals -> Role
  // Assignment -> Active Membership. A request is rejected, withdrawn or
  // expired before admission. Each authorized approver is counted once.
  // ---------------------------------------------------------------------

  public type JoinRequestStatus = {
    // Submitted, awaiting review.
    #pendingReview;
    // Under review by an authorized approver.
    #underReview;
    // Enough distinct authorized approvals recorded; awaiting role assignment.
    #approved;
    // Admitted: the member is active.
    #active;
    #rejected;
    // Withdrawn by the applicant.
    #withdrawn;
    // Expired before a decision.
    #expired;
  };

  // A membership join request. `applicant` is the requesting principal;
  // `approvers` records each distinct authorized approver exactly once.
  public type JoinRequest = {
    id : JoinRequestId;
    nation : NationId;
    applicant : Principal;
    displayName : Text;
    message : Text;
    status : JoinRequestStatus;
    // The distinct authorized approvers recorded so far.
    approvers : [Principal];
    // The required distinct approvals captured when the request was created,
    // so a later constitutional change never applies retroactively.
    requiredApprovals : Nat;
    // The constitution version in force when the request was created.
    constitutionVersion : Nat;
    // When the request expires if not decided.
    expiresAt : Timestamp;
    timestamp : Timestamp;
  };

  // A secure membership invitation. The token is single-use and bound to the
  // accepting principal; an invitation expires after its window.
  public type MembershipInvitation = {
    id : MembershipInvitationId;
    nation : NationId;
    // Single-use invitation token.
    token : Text;
    // The email the invitation was sent to, when one was sent.
    invitedEmail : ?Text;
    // The principal the invitation is bound to, once accepted.
    acceptedBy : ?Principal;
    // The authority that issued the invitation.
    issuedBy : Principal;
    // When the invitation expires.
    expiresAt : Timestamp;
    // True until accepted or expired.
    active : Bool;
    timestamp : Timestamp;
  };

  // A per-member admission record: the admission timestamp and the
  // constitution version in force at admission. Voting eligibility is
  // computed from this record.
  public type MemberAdmission = {
    id : MemberAdmissionId;
    nation : NationId;
    member : Principal;
    // When the member was admitted.
    admittedAt : Timestamp;
    // The constitution version in force at admission.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Recorded votes
  //
  // One recorded vote per member per decision. A decision is identified by
  // its kind and id (a governance proposal or a Nation proposal).
  // ---------------------------------------------------------------------

  public type DecisionKind = {
    #governanceProposal : GovernanceProposalId;
    #nationProposal : NationProposalId;
  };

  public type RecordedVote = {
    id : RecordedVoteId;
    nation : NationId;
    decision : DecisionKind;
    voter : Principal;
    choice : VoteChoice;
    confidential : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Append-only governance history
  //
  // Every appointment, acceptance, approval, rejection, vote and
  // constitutional amendment is recorded here. Entries are never deleted.
  // ---------------------------------------------------------------------

  public type GovernanceHistoryKind = {
    #appointment;
    #acceptance;
    #approval;
    #rejection;
    #vote;
    #amendment;
  };

  public type GovernanceHistoryEntry = {
    id : GovernanceHistoryId;
    nation : NationId;
    kind : GovernanceHistoryKind;
    // The principal that performed the action.
    actorPrincipal : Principal;
    // The related record id, interpreted according to `kind`.
    referenceId : Nat;
    // A short, privacy-aware summary of the event.
    summary : Text;
    // The constitution version in force when the event occurred.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Constitutional approval rule result
  // ---------------------------------------------------------------------

  // The required number of distinct approvals for a decision, and the set of
  // eligible approvers it is computed against.
  public type ApprovalRequirement = {
    required : Nat;
    eligibleApprovers : [Principal];
  };

  // ---------------------------------------------------------------------
  // Voting eligibility result
  // ---------------------------------------------------------------------

  public type EligibilityRestriction = {
    // The member has not yet served the post-admission waiting period.
    #waitingPeriod;
    // The member has not met the activity requirement.
    #inactivity;
    // The member has no admission record.
    #notAdmitted;
  };

  public type VotingEligibility = {
    eligible : Bool;
    // The specific reason for a restriction, or null when eligible.
    restriction : ?EligibilityRestriction;
    // When the waiting period ends, if still in it.
    eligibleFrom : ?Timestamp;
  };

  // ---------------------------------------------------------------------
  // Constitutional enforcement results
  // ---------------------------------------------------------------------

  public type SubmitJoinRequestResult = {
    #ok : JoinRequestId;
    #err : GovernanceError;
  };

  public type ReviewJoinRequestResult = {
    #ok : JoinRequestStatus;
    #err : GovernanceError;
  };

  public type IssueInvitationResult = {
    #ok : MembershipInvitationId;
    #err : GovernanceError;
  };

  public type AcceptInvitationResult = {
    #ok : MemberAdmissionId;
    #err : GovernanceError;
  };

  public type RecordVoteResult = {
    #ok : RecordedVoteId;
    #err : GovernanceError;
  };

  // =====================================================================
  // DAO Lifecycle & Constitutional Continuity
  //
  // Additive to the constitution and enforcement layers above. These records
  // carry the state the backend needs to govern a DAO across its whole
  // lifecycle: an enforced lifecycle state per Nation, authority positions
  // separated from the individuals occupying them, a succession and recovery
  // plan, versioned constitutions, amendment proposals, member departures,
  // emergency suspensions and a governed dissolution workflow. Every record
  // is scoped to exactly one Nation and is private by default.
  //
  // The constitution outlives its founders: no individual, founding
  // authority, platform administrator or developer has unilateral control
  // over an activated DAO.
  // =====================================================================

  public type AuthorityPositionId = Nat;
  public type AuthorityTermEventId = Nat;
  public type ConstitutionVersionId = Nat;
  public type AmendmentProposalId = Nat;
  public type MemberDepartureId = Nat;
  public type EmergencySuspensionId = Nat;
  public type DissolutionId = Nat;

  // ---------------------------------------------------------------------
  // Lifecycle state
  //
  // The backend-enforced lifecycle state of a Nation. Every permitted action
  // is decided against this state; the UI only reflects it.
  // ---------------------------------------------------------------------

  public type NationLifecycleState = {
    // Created but not yet activated.
    #draft;
    // Founding authorities appointed; awaiting ratification and activation.
    #pendingActivation;
    // Fully activated and operating under its constitution.
    #active;
    // Normal quorum cannot be reached; only recovery procedures are open.
    #restrictedGovernance;
    // Temporarily suspended by an authorized emergency action.
    #temporarilySuspended;
    // A dissolution proposal is in progress (cooling-off, review, vote).
    #pendingDissolution;
    // Closed: operational governance disabled, history preserved.
    #archived;
  };

  // The lifecycle record for a Nation: the current state, when it was
  // entered, a plain-language reason, and the authority or process that
  // caused the transition.
  public type NationLifecycle = {
    nation : NationId;
    state : NationLifecycleState;
    // When the current state was entered.
    enteredAt : Timestamp;
    // Plain-language explanation of why the state was entered.
    reason : Text;
    // The authority or process that caused the transition.
    causedBy : Principal;
    // The constitution version in force at the transition.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Authority positions
  //
  // An authority position is separate from the person occupying it. The
  // position persists across holders; the holder is optional so a position
  // can be vacant without losing its history.
  // ---------------------------------------------------------------------

  public type AuthorityPositionStatus = {
    #vacant;
    #filled;
    #suspended;
    #retired;
  };

  public type AuthorityPosition = {
    id : AuthorityPositionId;
    nation : NationId;
    // Stable seat label, e.g. "Founding Authority #1".
    seatLabel : Text;
    // Term start, in nanoseconds since epoch.
    termStart : Timestamp;
    // Term end, in nanoseconds since epoch.
    termEnd : Timestamp;
    // The current holder, or null when the position is vacant.
    holder : ?Principal;
    // Human-readable label for the current holder.
    holderDisplayLabel : Text;
    status : AuthorityPositionStatus;
    timestamp : Timestamp;
  };

  // The kind of authority term event recorded against a position.
  public type AuthorityTermEventKind = {
    #appointment;
    #acceptance;
    #resignation;
    #retirement;
    #replacement;
    #removal;
  };

  // One authority term event: appointment, acceptance, resignation,
  // retirement, replacement or removal, with its reason, the acting
  // principal, the approvals collected and the timestamp.
  public type AuthorityTermEvent = {
    id : AuthorityTermEventId;
    nation : NationId;
    position : AuthorityPositionId;
    kind : AuthorityTermEventKind;
    // The principal the event concerns (the appointee, resigner, etc.).
    subject : Principal;
    // The principal that performed the action.
    actingPrincipal : Principal;
    reason : Text;
    // The distinct principals that approved the event.
    approvals : [Principal];
    // The constitution version in force when the event occurred.
    constitutionVersion : Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Succession and recovery plan
  //
  // Established during initial DAO configuration and ratified by every
  // founding authority before activation. Recovery procedures must remain
  // functional if one, two or all three authorities become unavailable.
  // ---------------------------------------------------------------------

  // A designated successor for an authority position.
  public type DesignatedSuccessor = {
    position : AuthorityPositionId;
    successor : Principal;
    successorDisplayLabel : Text;
  };

  // An alternate authority that can act when a primary is unavailable.
  public type AlternateAuthority = {
    alternate : Principal;
    alternateDisplayLabel : Text;
    // The position this alternate stands in for.
    coversPosition : AuthorityPositionId;
  };

  // A member of the elected membership council.
  public type CouncilMember = {
    councilMember : Principal;
    councilMemberDisplayLabel : Text;
  };

  // An independent recovery trustee.
  public type RecoveryTrustee = {
    trustee : Principal;
    trusteeDisplayLabel : Text;
  };

  // One founding authority's ratification of the succession and recovery
  // plan.
  public type PlanRatification = {
    authority : Principal;
    ratifiedAt : Timestamp;
  };

  public type SuccessionRecoveryPlan = {
    nation : NationId;
    designatedSuccessors : [DesignatedSuccessor];
    alternateAuthorities : [AlternateAuthority];
    membershipCouncil : [CouncilMember];
    recoveryTrustees : [RecoveryTrustee];
    // The number of distinct approvals required to invoke recovery.
    recoveryApprovalThreshold : Nat;
    // The identity recovery and principal replacement procedure.
    identityRecoveryProcedure : Text;
    // One ratification record per founding authority.
    ratifications : [PlanRatification];
    // True once every founding authority has ratified the plan.
    ratified : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Constitution versions
  //
  // Each authorized amendment produces a new constitution version. The
  // version in force is the active one; history is preserved.
  // ---------------------------------------------------------------------

  public type ConstitutionVersion = {
    id : ConstitutionVersionId;
    nation : NationId;
    version : Nat;
    // The full rule set in force for this version.
    rules : GovernanceRuleSet;
    // The amendment that produced this version, or null for the founding
    // version.
    producedByAmendment : ?AmendmentProposalId;
    // The authority that authorized this version.
    authorizingAuthority : Principal;
    // When this version takes effect.
    effectiveDate : Timestamp;
    // One ratification record per ratifying authority.
    ratifications : [PlanRatification];
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Amendment proposals
  //
  // A functional constitutional amendment proposal. Approved under the
  // constitution currently in effect; never retroactively alters pending
  // decisions or completed votes.
  // ---------------------------------------------------------------------

  // One field-level change: the field name and its before/after values.
  public type RuleChange = {
    fieldName : Text;
    beforeValue : Text;
    afterValue : Text;
  };

  public type AmendmentProposalStatus = {
    #discussion;
    #voting;
    #ratified;
    #rejected;
    #withdrawn;
  };

  // How abstentions are handled when tallying an amendment vote.
  public type AbstentionHandling = {
    // Whether abstentions count toward quorum.
    #countTowardQuorum;
    // Abstentions are excluded from the approval denominator.
    #excludedFromDenominator;
  };

  public type AmendmentProposal = {
    id : AmendmentProposalId;
    nation : NationId;
    title : Text;
    summary : Text;
    // The constitution version this amendment is based on.
    baseConstitutionVersion : Nat;
    // The proposed rule changes as field-level before/after values.
    changes : [RuleChange];
    // The discussion thread reference.
    discussionThread : ?DiscussionThreadId;
    // Voting eligibility description.
    votingEligibility : Text;
    // Quorum and approval thresholds, as whole percentages (0-100).
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
    // The voting deadline, in nanoseconds since epoch.
    votingDeadline : Timestamp;
    abstentionHandling : AbstentionHandling;
    status : AmendmentProposalStatus;
    // One ratification record per ratifying authority.
    ratifications : [PlanRatification];
    // When the amendment takes effect once ratified.
    effectiveDate : ?Timestamp;
    proposer : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Member departures
  //
  // Voluntary departure, retirement, suspension and constitutional removal.
  // Operational permissions are revoked when the departure becomes
  // effective; historical contributions are preserved.
  // ---------------------------------------------------------------------

  public type DepartureKind = {
    #voluntaryDeparture;
    #retirement;
    #suspension;
    #constitutionalRemoval;
  };

  public type DepartureStatus = {
    #notice;
    #underReview;
    #effective;
    #appealed;
    #withdrawn;
  };

  public type MemberDeparture = {
    id : MemberDepartureId;
    nation : NationId;
    member : Principal;
    kind : DepartureKind;
    status : DepartureStatus;
    // The plain-language notice given to the member.
    notice : Text;
    // The review step's outcome note.
    reviewNote : Text;
    // The appeal reference, when the member appealed.
    appealReference : ?AppealId;
    // When the departure becomes effective.
    effectiveAt : Timestamp;
    // When operational permissions were revoked.
    permissionRevokedAt : ?Timestamp;
    // The authority that recorded the departure.
    recordedBy : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Emergency suspensions
  //
  // Temporary, auditable and narrowly scoped. Default approval is two of
  // three authorized authorities. Emergency powers cannot amend the
  // constitution, seize assets, permanently remove authorities or dissolve
  // the DAO.
  // ---------------------------------------------------------------------

  public type EmergencySuspensionStatus = {
    #active;
    #restored;
    #expired;
  };

  // One entry in an emergency suspension's audit trail.
  public type EmergencyAuditEntry = {
    action : Text;
    actorPrincipal : Principal;
    note : Text;
    timestamp : Timestamp;
  };

  // The restoration record for a suspended Nation.
  public type EmergencyRestoration = {
    restoredBy : Principal;
    note : Text;
    restoredAt : Timestamp;
  };

  public type EmergencySuspension = {
    id : EmergencySuspensionId;
    nation : NationId;
    // The triggering reason.
    reason : Text;
    // The affected accounts or functions.
    affectedAccounts : [Principal];
    affectedFunctions : [Text];
    // The distinct authorities that approved the suspension.
    approvingAuthorities : [Principal];
    status : EmergencySuspensionStatus;
    // When the suspension expires if not restored.
    expiresAt : Timestamp;
    auditTrail : [EmergencyAuditEntry];
    restoration : ?EmergencyRestoration;
    // The authority that requested the suspension.
    requestedBy : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Dissolution
  //
  // A constitutionally governed closure workflow. Default threshold 90%
  // subject to enhanced quorum. Actual asset settlement and legal
  // dissolution remain outside the simulated functionality.
  // ---------------------------------------------------------------------

  public type DissolutionStatus = {
    #proposed;
    #coolingOff;
    #voting;
    #approved;
    #archived;
    #rejected;
    #withdrawn;
  };

  // The vote tally for a dissolution proposal.
  public type DissolutionTally = {
    votesInFavor : Nat;
    votesAgainst : Nat;
    votesAbstain : Nat;
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
  };

  // The review of outstanding obligations before dissolution.
  public type ObligationsReview = {
    reviewedBy : Principal;
    note : Text;
    outstandingObligations : [Text];
    reviewedAt : Timestamp;
  };

  public type Dissolution = {
    id : DissolutionId;
    nation : NationId;
    // The formal dissolution proposal text.
    proposal : Text;
    // The clear explanation given to members.
    explanation : Text;
    // When members were notified.
    memberNotifiedAt : ?Timestamp;
    status : DissolutionStatus;
    tally : DissolutionTally;
    // When the mandatory cooling-off period ends.
    coolingOffEnd : Timestamp;
    obligationsReview : ?ObligationsReview;
    // The authorized data export reference.
    dataExportReference : ?Text;
    // The final confirmation record.
    finalConfirmation : ?PlanRatification;
    // When the Nation was archived.
    archivedAt : ?Timestamp;
    proposer : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Lifecycle & continuity results and errors
  // ---------------------------------------------------------------------

  public type LifecycleError = {
    #unknownNation;
    #unknownPosition;
    #unknownAmendment;
    #unknownDeparture;
    #unknownSuspension;
    #unknownDissolution;
    #notAuthorized;
    #notNationMember;
    #notFoundingAuthority;
    #invalidLifecycleTransition;
    #invalidThreshold;
    #quorumNotReached;
    #approvalThresholdNotMet;
    #duplicateApproval;
    #selfApproval;
    #successorNotAccepted;
    #duplicateIdentity;
    #planNotRatified;
    #emergencyScopeExceeded;
    #coolingOffNotElapsed;
    #obligationsNotReviewed;
    #alreadyArchived;
    #notActivatedDraft;
    #missingReason;
    #missingTitle;
    #missingSummary;
  };

  public type TransitionLifecycleResult = {
    #ok : NationLifecycleState;
    #err : LifecycleError;
  };

  public type SaveAuthorityPositionResult = {
    #ok : AuthorityPositionId;
    #err : LifecycleError;
  };

  public type RecordAuthorityTermEventResult = {
    #ok : AuthorityTermEventId;
    #err : LifecycleError;
  };

  public type SaveSuccessionPlanResult = {
    #ok;
    #err : LifecycleError;
  };

  public type RatifySuccessionPlanResult = {
    #ok;
    #err : LifecycleError;
  };

  public type SaveConstitutionVersionResult = {
    #ok : ConstitutionVersionId;
    #err : LifecycleError;
  };

  public type SaveAmendmentProposalResult = {
    #ok : AmendmentProposalId;
    #err : LifecycleError;
  };

  public type RatifyAmendmentResult = {
    #ok : ConstitutionVersionId;
    #err : LifecycleError;
  };

  public type SaveMemberDepartureResult = {
    #ok : MemberDepartureId;
    #err : LifecycleError;
  };

  public type SaveEmergencySuspensionResult = {
    #ok : EmergencySuspensionId;
    #err : LifecycleError;
  };

  public type RestoreEmergencySuspensionResult = {
    #ok;
    #err : LifecycleError;
  };

  public type SaveDissolutionResult = {
    #ok : DissolutionId;
    #err : LifecycleError;
  };

  public type ArchiveDissolutionResult = {
    #ok;
    #err : LifecycleError;
  };

  // =====================================================================
  // Founding-seat confirmation & launch status
  //
  // Additive to the founding setup layer above. The creator's Founding
  // Authority #1 seat is recorded when the Nation is created; these records
  // let the creator confirm that existing seat without appointing a second
  // one, read the launch status of a Nation they own, and resume the launch
  // from the first unfinished step. The three-distinct-authority activation
  // requirement and the Pending Activation state are unchanged.
  // =====================================================================

  // One founding seat as the launch status reports it. `heldByCaller` is
  // true when the seat's authority is the caller; `awaitingOther` is true
  // when the seat is pending acceptance by someone other than the caller.
  public type FoundingSeatSummary = {
    appointmentId : Nat;
    appointmentLabel : Text;
    authority : Principal;
    status : FoundingAppointmentStatus;
    heldByCaller : Bool;
    awaitingOther : Bool;
  };

  // The launch status of one Nation the caller owns: the founding setup
  // state, the accepted authority count out of three, which seats the caller
  // holds, which seats await other people, whether the constitution is saved,
  // and a plain-language reason when the launch cannot continue.
  public type LaunchStatus = {
    nation : NationId;
    setupStatus : FoundingSetupStatus;
    lifecycleState : NationLifecycleState;
    acceptedAuthorities : Nat;
    requiredAuthorities : Nat;
    callerSeats : [FoundingSeatSummary];
    awaitingOtherSeats : [FoundingSeatSummary];
    constitutionSaved : Bool;
    // True when the launch can continue from the first unfinished step.
    canResume : Bool;
    // Plain-language reason the launch cannot continue, or empty when it can.
    blockedReason : Text;
  };

  // The result of confirming the caller's existing founding seat.
  public type ConfirmFoundingSeatResult = {
    #ok : Nat;
    #err : GovernanceError;
  };

  // The result of resuming a Nation's launch from its first unfinished step.
  public type ResumeLaunchResult = {
    #ok : LaunchStatus;
    #err : GovernanceError;
  };
};
