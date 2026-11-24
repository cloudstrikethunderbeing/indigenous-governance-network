import type {
  CalendarEventId,
  DiscussionPostId,
  FileAttachmentTarget,
  NationDocumentId,
  NationProposalId,
} from "@/backend";

/**
 * Builders for the backend's `FileAttachmentTarget` variants. Every app that
 * references a stored file goes through one of these so the target shape stays
 * identical across Governance, Discussions, Projects, Calendar and Documents.
 */

/** A stored file attached to a governance proposal. */
export function proposalTarget(
  proposal: NationProposalId,
): FileAttachmentTarget {
  return { __kind__: "proposal", proposal };
}

/** A stored file attached to a discussion post. */
export function discussionPostTarget(
  discussionPost: DiscussionPostId,
): FileAttachmentTarget {
  return { __kind__: "discussionPost", discussionPost };
}

/** A stored file attached to a project. */
export function projectTarget(project: bigint): FileAttachmentTarget {
  return { __kind__: "project", project };
}

/** A stored file attached to a calendar event. */
export function calendarEventTarget(
  calendarEvent: CalendarEventId,
): FileAttachmentTarget {
  return { __kind__: "calendarEvent", calendarEvent };
}

/** A stored file attached to a document record. */
export function documentTarget(
  document: NationDocumentId,
): FileAttachmentTarget {
  return { __kind__: "document", document };
}

/** A stable key for a target, used for React keys and query identity. */
export function targetKey(target: FileAttachmentTarget): string {
  switch (target.__kind__) {
    case "proposal":
      return `proposal:${target.proposal}`;
    case "discussionPost":
      return `discussionPost:${target.discussionPost}`;
    case "project":
      return `project:${target.project}`;
    case "calendarEvent":
      return `calendarEvent:${target.calendarEvent}`;
    case "document":
      return `document:${target.document}`;
  }
}

/** A plain-language label for the kind of record a target points at. */
export function targetKindLabel(target: FileAttachmentTarget): string {
  switch (target.__kind__) {
    case "proposal":
      return "proposal";
    case "discussionPost":
      return "discussion post";
    case "project":
      return "project";
    case "calendarEvent":
      return "calendar event";
    case "document":
      return "document";
  }
}
