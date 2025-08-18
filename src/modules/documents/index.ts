// Components
export { default as DocumentsList } from "./components/DocumentsList";
export { default as DocumentDetail } from "./components/DocumentDetail";
export { default as DocumentUploadForm } from "./components/DocumentUploadForm";

// Services
export { documentService } from "./services/documentService";

// Types
export type {
  Document,
  DocumentUploadRequest,
  DocumentUploadResponse,
  ComplianceDomain,
  DocumentTagConstants,
  DocumentsState,
  DocumentsActions,
} from "./types";
