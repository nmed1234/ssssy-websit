/**
 * @/lib/cms-sdk — thin re-export shim
 *
 * Application code that needs the CmsSDK registry or its types should
 * import from here rather than from @ssssy/cms-sdk directly. The tsconfig
 * path alias "@ssssy/cms-sdk" → "packages/cms-sdk/src/index.ts" still
 * works for the monorepo setup; this file covers the "@/lib/cms-sdk" import
 * pattern used in admin pages.
 */
export {
  CmsClient,
  CmsSDK,
  ContentRenderer,
  CmsWorkflowButton,
  MediaPicker,
  PluginLoader,
  useContent,
  useContentType,
  useForms,
  useWorkflow,
  useAuth,
} from "@ssssy/cms-sdk";

export type {
  ApiResponse as SdkApiResponse,
  PaginatedResponse as SdkPaginatedResponse,
  CmsUser,
  ContentTypeField as SdkContentTypeField,
  ContentTypeDefinition as SdkContentTypeDefinition,
  DynamicContentEntry as SdkDynamicContentEntry,
  FormFieldType,
  FormFieldOption,
  FormFieldDefinition as SdkFormFieldDefinition,
  FormDefinition as SdkFormDefinition,
  FormSubmission as SdkFormSubmission,
  WorkflowTransition,
  WorkflowState,
  PluginBlockDefinition,
  PluginAdminRoute,
  PluginContentRenderer,
  PluginManifest,
  CmsClientOptions,
  UseContentOptions,
  UseContentResult,
  UseContentTypeResult,
  UseFormsResult,
  UseWorkflowResult,
  UseAuthResult,
} from "@ssssy/cms-sdk";
