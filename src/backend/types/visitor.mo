import Common "common";

// Visitor participation experience and lead-capture domain types.
//
// All visitor-engagement and lead types are declared in types/common.mo
// (the single shared type surface for this backend) and re-exported here
// so the visitor domain's lib and mixin files can import one module.
module {
  // Visitor-engagement types
  public type VisitorSessionId = Common.VisitorSessionId;
  public type ChallengeOption = Common.ChallengeOption;
  public type WeeklyChallenge = Common.WeeklyChallenge;
  public type ChallengeImpression = Common.ChallengeImpression;
  public type ChallengeStart = Common.ChallengeStart;
  public type ChallengeResponse = Common.ChallengeResponse;
  public type PublicComment = Common.PublicComment;
  public type CommentReport = Common.CommentReport;
  public type CommentModerationStatus = Common.CommentModerationStatus;
  public type VisitorError = Common.VisitorError;
  public type VisitorAnalytics = Common.VisitorAnalytics;

  // Lead-pathway types
  public type LeadId = Common.LeadId;
  public type LeadStatus = Common.LeadStatus;
  public type LeadPathway = Common.LeadPathway;
  public type OrganizationType = Common.OrganizationType;
  public type FundingSupportType = Common.FundingSupportType;
  public type Lead = Common.Lead;
  public type LeadError = Common.LeadError;
  public type SubmitLeadResult = Common.SubmitLeadResult;
  public type UpdateLeadResult = Common.UpdateLeadResult;
  public type LeadList = Common.LeadList;
  public type LeadAnalytics = Common.LeadAnalytics;
};
