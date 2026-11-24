// SOVEREIGN OS — Nation Files.
//
// The Nation Files endpoints are implemented in `mixins/sovereign-api.mo`,
// which is the mixin the composition root (`main.mo`) includes. This module
// is retained as the documented home of the Nation Files data contract and
// carries no executable declarations, so it can never conflict with the
// wired mixin.
//
// Files is the central document storage layer for each Nation. Every Nation
// has its own independent file namespace: folders and files are scoped to
// exactly one Nation and are private by default. Nation-scoped isolation is
// enforced against each record's `nation` field, and both file metadata and
// the file content reference are access-controlled on the backend — never by
// frontend filtering alone.
//
// Governance, Documents, Discussions, Projects and Calendar reference the
// same stored files through attachment links rather than creating duplicate
// copies. Files are never automatically shared through the regional
// collaboration network.
//
// The public API is:
//   listNationFolders, listNationFiles, getNationFileSummary,
//   listFileAttachments,
//   createNationFolder, renameNationFolder, moveNationFolder,
//   deleteNationFolder,
//   createNationFile, renameNationFile, moveNationFile, deleteNationFile,
//   attachFileToTarget, detachFile.
module {};
