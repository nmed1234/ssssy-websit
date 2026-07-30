/**
 * @ssssy/cms-sdk — React Hooks
 *
 * Drop-in hooks that connect React components to the SSSSY backend.
 * All hooks are backed by @tanstack/react-query for caching + refetch.
 *
 * Usage:
 *   const { data, loading } = useContent('research-paper', { status: 'PUBLISHED' });
 *   const { submit, status } = useForms('paper-submission');
 */

"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CmsClient } from "./client";
import type {
  ContentTypeDefinition,
  DynamicContentEntry,
  FormDefinition,
  FormFieldDefinition,
  WorkflowState,
  CmsUser,
  PaginatedResponse,
  UseContentOptions,
} from "./types";

// ─── Context-free client reference ────────────────────────────────────────────
// Components import { useContent } and pass a CmsClient instance they hold.
// The SDK does not impose a React context — callers can wrap it themselves.

// ─── useContent ──────────────────────────────────────────────────────────────

export interface UseContentResult {
  data: PaginatedResponse<DynamicContentEntry> | null;
  entries: DynamicContentEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContent(
  client: CmsClient,
  typeName: string,
  opts: UseContentOptions = {}
): UseContentResult {
  const queryKey = ["sdk-content", typeName, opts.status, opts.page, opts.size, opts.search];
  const { data = null, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => client.getEntries(typeName, opts),
    enabled: opts.enabled !== false && !!typeName,
    staleTime: 30_000,
  });

  return {
    data,
    entries: data?.content ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ─── useContentType ───────────────────────────────────────────────────────────

export interface UseContentTypeResult {
  contentType: ContentTypeDefinition | null;
  loading: boolean;
  error: Error | null;
}

export function useContentType(client: CmsClient, id: string): UseContentTypeResult {
  const { data = null, isLoading, error } = useQuery({
    queryKey: ["sdk-content-type", id],
    queryFn: () => client.getContentType(id),
    enabled: !!id,
    staleTime: 60_000,
  });
  return { contentType: data, loading: isLoading, error: error as Error | null };
}

// ─── useForms ────────────────────────────────────────────────────────────────

export interface UseFormsResult {
  formDef: FormDefinition | null;
  fields: FormFieldDefinition[];
  loading: boolean;
  error: Error | null;
  submit: (values: Record<string, string>) => void;
  submitting: boolean;
  submitted: boolean;
  submissionId: string | null;
  submitError: string | null;
}

export function useForms(client: CmsClient, slug: string): UseFormsResult {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: formDef = null, isLoading, error } = useQuery({
    queryKey: ["sdk-form", slug],
    queryFn: () => client.getForm(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (values: Record<string, string>) => client.submitForm(slug, values),
    onSuccess: (result: import("./types").FormSubmission) => {
      setSubmitted(true);
      setSubmissionId(result.id);
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ["sdk-form", slug] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? "Submission failed");
    },
  });

  let fields: FormFieldDefinition[] = [];
  if (formDef?.schemaJson) {
    try { fields = JSON.parse(formDef.schemaJson) as FormFieldDefinition[]; } catch { /* ignore */ }
  }

  return {
    formDef,
    fields,
    loading: isLoading,
    error: error as Error | null,
    submit: mutation.mutate,
    submitting: mutation.isPending,
    submitted,
    submissionId,
    submitError,
  };
}

// ─── useWorkflow ──────────────────────────────────────────────────────────────

export interface UseWorkflowResult {
  state: WorkflowState | null;
  loading: boolean;
  error: Error | null;
  fire: (action: string, comment?: string) => void;
  firing: boolean;
  refetch: () => void;
}

export function useWorkflow(client: CmsClient, contentId: string): UseWorkflowResult {
  const queryClient = useQueryClient();

  const { data: state = null, isLoading, error, refetch } = useQuery({
    queryKey: ["sdk-workflow", contentId],
    queryFn: () => client.getWorkflowState(contentId),
    enabled: !!contentId,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: ({ action, comment }: { action: string; comment?: string }) =>
      client.fireWorkflowAction(contentId, action, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sdk-workflow", contentId] }),
  });

  return {
    state,
    loading: isLoading,
    error: error as Error | null,
    fire: (action, comment) => mutation.mutate({ action, comment }),
    firing: mutation.isPending,
    refetch,
  };
}

// ─── useAuth ──────────────────────────────────────────────────────────────────

export interface UseAuthResult {
  user: CmsUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isPublisher: boolean;
  hasRole: (role: string) => boolean;
}

export function useAuth(client: CmsClient): UseAuthResult {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["sdk-auth-me"],
    queryFn: () => client.getCurrentUser(),
    staleTime: 120_000,
    retry: false,
  });

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    const roleHierarchy: Record<string, number> = { USER: 1, EDITOR: 2, PUBLISHER: 3, ADMIN: 4 };
    return (roleHierarchy[user.role] ?? 0) >= (roleHierarchy[role] ?? 99);
  }, [user]);

  return {
    user,
    loading: isLoading,
    isAuthenticated: !!user,
    isAdmin: hasRole("ADMIN"),
    isEditor: hasRole("EDITOR"),
    isPublisher: hasRole("PUBLISHER"),
    hasRole,
  };
}
