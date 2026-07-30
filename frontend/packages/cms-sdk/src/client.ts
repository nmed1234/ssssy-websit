/**
 * @ssssy/cms-sdk — CmsClient
 *
 * Typed HTTP client wrapping the SSSSY backend API.
 * Handles auth token injection, token refresh, and response unwrapping.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  CmsClientOptions,
  ContentTypeDefinition,
  DynamicContentEntry,
  FormDefinition,
  FormSubmission,
  WorkflowState,
  UseContentOptions,
} from "./types";

export class CmsClient {
  private readonly http: AxiosInstance;
  private readonly getToken: () => string | null;

  constructor(options: CmsClientOptions) {
    this.getToken = options.getAccessToken
      ?? (() => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null));

    this.http = axios.create({
      baseURL: options.baseUrl,
      headers: { "Content-Type": "application/json" },
    });

    // Inject auth token on every request
    this.http.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // On 401, attempt token refresh
    this.http.interceptors.response.use(
      (res) => res,
      async (err) => {
        const orig = err.config as AxiosRequestConfig & { _retry?: boolean };
        if (err.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          try {
            const refreshToken =
              typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
            if (!refreshToken) throw new Error("no refresh token");
            const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${options.baseUrl}/auth/refresh`,
              { refreshToken }
            );
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            orig.headers = { ...(orig.headers as Record<string, string>) };
            (orig.headers as Record<string, string>).Authorization = `Bearer ${data.data.accessToken}`;
            return this.http(orig);
          } catch {
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
        }
        return Promise.reject(err);
      }
    );
  }

  // ─── Content Types ─────────────────────────────────────────────────────────

  async getContentTypes(): Promise<ContentTypeDefinition[]> {
    const { data } = await this.http.get<ApiResponse<ContentTypeDefinition[]>>("/v2/content-types");
    return data.data;
  }

  async getContentType(id: string): Promise<ContentTypeDefinition> {
    const { data } = await this.http.get<ApiResponse<ContentTypeDefinition>>(`/v2/content-types/${id}`);
    return data.data;
  }

  // ─── Dynamic Content Entries ───────────────────────────────────────────────

  async getEntries(
    typeName: string,
    opts: UseContentOptions = {}
  ): Promise<PaginatedResponse<DynamicContentEntry>> {
    const params: Record<string, unknown> = {
      page: opts.page ?? 0,
      size: opts.size ?? 20,
    };
    if (opts.status) params.status = opts.status;
    if (opts.search) params.search = opts.search;

    const { data } = await this.http.get<ApiResponse<PaginatedResponse<DynamicContentEntry>>>(
      `/v2/dt/${typeName}`,
      { params }
    );
    return data.data;
  }

  async getEntry(typeName: string, slug: string): Promise<DynamicContentEntry> {
    const { data } = await this.http.get<ApiResponse<DynamicContentEntry>>(
      `/v2/dt/${typeName}/${slug}`
    );
    return data.data;
  }

  async createEntry(
    typeName: string,
    payload: { slug?: string; fieldData: Record<string, unknown>; status?: string }
  ): Promise<DynamicContentEntry> {
    const { data } = await this.http.post<ApiResponse<DynamicContentEntry>>(
      `/v2/dt/${typeName}`,
      { ...payload, fieldData: JSON.stringify(payload.fieldData) }
    );
    return data.data;
  }

  // ─── Forms ────────────────────────────────────────────────────────────────

  async getForm(slug: string): Promise<FormDefinition> {
    const { data } = await this.http.get<ApiResponse<FormDefinition>>(`/public/forms/${slug}`);
    return data.data;
  }

  async submitForm(slug: string, values: Record<string, string>): Promise<FormSubmission> {
    const { data } = await this.http.post<ApiResponse<FormSubmission>>(
      `/public/forms/${slug}/submit`,
      { data: JSON.stringify(values) }
    );
    return data.data;
  }

  // ─── Workflow ─────────────────────────────────────────────────────────────

  async getWorkflowState(contentId: string): Promise<WorkflowState> {
    const { data } = await this.http.get<ApiResponse<WorkflowState>>(
      `/workflow/content/${contentId}/state`
    );
    return data.data;
  }

  async fireWorkflowAction(contentId: string, action: string, comment?: string): Promise<void> {
    await this.http.post(`/workflow/content/${contentId}/transition`, { action, comment });
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async getCurrentUser() {
    const { data } = await this.http.get<ApiResponse<import("./types").CmsUser>>("/auth/me");
    return data.data;
  }
}
