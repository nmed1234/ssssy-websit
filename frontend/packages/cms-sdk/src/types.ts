/**
 * @ssssy/cms-sdk — Shared Type Definitions
 *
 * All types used across the SDK surface. These mirror the backend DTOs
 * so callers get full type safety without maintaining separate definitions.
 */

import type React from "react";

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface CmsUser {
  id: string;
  username: string;
  email: string;
  role: string;
  firstNameEn?: string;
  lastNameEn?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  avatarUrl?: string;
  isActive: boolean;
}

// ─── Content types (Dynamic Content Engine — Phase 3) ─────────────────────────

export interface ContentTypeField {
  id?: string;
  fieldName: string;
  fieldLabelEn: string;
  fieldLabelAr?: string;
  fieldType: string;
  isRequired?: boolean;
  isSearchable?: boolean;
  isListed?: boolean;
  optionsJson?: string;
  validationJson?: string;
  sortOrder?: number;
}

export interface ContentTypeDefinition {
  id: string;
  name: string;
  labelEn: string;
  labelAr?: string;
  description?: string;
  icon?: string;
  allowComments?: boolean;
  allowMemberSubmit?: boolean;
  requiresApproval?: boolean;
  isActive?: boolean;
  entryCount?: number;
  fields: ContentTypeField[];
  createdAt?: string;
}

export interface DynamicContentEntry {
  id: string;
  contentTypeName: string;
  slug: string;
  status: string;
  authorId?: string;
  authorUsername?: string;
  workflowState?: string;
  fieldData: string; // JSON
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Dynamic Form Engine (Phase 2) ────────────────────────────────────────────

export type FormFieldType =
  | "text" | "email" | "textarea" | "richtext" | "number" | "date" | "datetime"
  | "select" | "multiselect" | "checkbox" | "radio" | "file" | "hidden";

export interface FormFieldOption {
  value: string;
  label: string;
  labelAr?: string;
}

export interface FormFieldDefinition {
  name: string;
  type: FormFieldType;
  labelEn: string;
  labelAr?: string;
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: { minLength?: number; maxLength?: number; pattern?: string; message?: string };
  helpText?: string;
  defaultValue?: string;
  width?: "full" | "half";
}

export interface FormDefinition {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  description?: string;
  schemaJson: string;
  submitLabelEn?: string;
  submitLabelAr?: string;
  successMessageEn?: string;
  successMessageAr?: string;
  requiresAuth?: boolean;
  isActive?: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: string; // JSON
  status: string;
  createdAt: string;
}

// ─── Workflow (Phase 4) ───────────────────────────────────────────────────────

export interface WorkflowTransition {
  fromState: string;
  toState: string;
  action: string;
  label: string;
  allowedRoles: string[];
}

export interface WorkflowState {
  currentState: string;
  availableTransitions: WorkflowTransition[];
}

// ─── Plugin registry ──────────────────────────────────────────────────────────

export interface PluginBlockDefinition {
  /** Unique type identifier, e.g. "research-citation" */
  type: string;
  /** Human-readable label shown in page builder palette */
  label: string;
  /** Optional icon name from lucide-react */
  icon?: string;
  /** JSON schema of configurable props */
  schema?: Record<string, { type: string; label: string; defaultValue?: unknown }>;
  /** The React component that renders this block */
  render: (props: Record<string, unknown>) => React.ReactElement | null;
}

export interface PluginAdminRoute {
  /** Path appended to /admin, e.g. "research-portal" → /admin/research-portal */
  path: string;
  /** Label shown in sidebar */
  label: string;
  labelAr?: string;
  /** Icon name from lucide-react */
  icon?: string;
}

export interface PluginContentRenderer {
  /** Matches contentTypeName from DynamicContentEntry */
  contentType: string;
  /** Full-page renderer component */
  render: (entry: DynamicContentEntry) => React.ReactElement | null;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  /** URL to the JS bundle to dynamically load (served from MinIO/CDN) */
  frontendBundleUrl?: string;
  registeredBlocks?: string[];
  registeredRoutes?: string[];
  registeredRenderers?: string[];
}

// ─── SDK options ──────────────────────────────────────────────────────────────

export interface CmsClientOptions {
  /** Backend API base URL, e.g. "https://api.ssssy.org/api" */
  baseUrl: string;
  /** Called to retrieve a fresh access token. Falls back to localStorage */
  getAccessToken?: () => string | null;
}

export interface UseContentOptions {
  status?: string;
  page?: number;
  size?: number;
  search?: string;
  /** Skip the query — useful for conditional fetching */
  enabled?: boolean;
}
