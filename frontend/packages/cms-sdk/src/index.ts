/**
 * @ssssy/cms-sdk — Main barrel export
 *
 * All public SDK exports. Internal modules should NOT be imported directly
 * by application code — use this barrel instead.
 *
 * Usage:
 *   import { CmsClient, CmsSDK, useContent, useForms, ContentRenderer } from '@ssssy/cms-sdk';
 */

// Core client
export { CmsClient } from "./client";

// React hooks
export { useContent, useContentType, useForms, useWorkflow, useAuth } from "./hooks";
export type {
  UseContentResult,
  UseContentTypeResult,
  UseFormsResult,
  UseWorkflowResult,
  UseAuthResult,
} from "./hooks";

// Plugin registry singleton
export { CmsSDK } from "./registry";

// React components
export { ContentRenderer } from "./components/ContentRenderer";
export { CmsWorkflowButton } from "./components/CmsWorkflowButton";
export { MediaPicker } from "./components/MediaPicker";

// Plugin loader
export { PluginLoader } from "./PluginLoader";

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  CmsUser,
  ContentTypeField,
  ContentTypeDefinition,
  DynamicContentEntry,
  FormFieldType,
  FormFieldOption,
  FormFieldDefinition,
  FormDefinition,
  FormSubmission,
  WorkflowTransition,
  WorkflowState,
  PluginBlockDefinition,
  PluginAdminRoute,
  PluginContentRenderer,
  PluginManifest,
  CmsClientOptions,
  UseContentOptions,
} from "./types";
