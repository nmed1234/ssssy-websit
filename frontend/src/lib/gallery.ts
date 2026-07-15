import api from "./api";
import type { ApiResponse } from "@/types";

export interface GalleryAlbumResponse {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  coverImageUrl?: string;
  coverImageThumbnailUrl?: string;
  isPublished: boolean;
  sortOrder: number;
  isPasswordProtected: boolean;
  viewCount: number;
  downloadCount: number;
  watermarkOverrides?: string;
  settingsOverrides?: string;
  createdByName?: string;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImageResponse {
  id: string;
  albumId: string;
  mediaFileId: string;
  url: string;
  thumbnailUrl?: string;
  beforeUrl?: string;
  beforeThumbnailUrl?: string;
  sortOrder: number;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  altText?: string;
  hotspotData?: string;
  exifData?: string;
  colorPalette?: string;
  isCover: boolean;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface GalleryAlbumDetailResponse extends GalleryAlbumResponse {
  images?: GalleryImageResponse[];
}

export interface GalleryShareLinkResponse {
  id: string;
  albumId: string;
  albumTitle: string;
  token: string;
  shareUrl: string;
  expiresAt?: string;
  maxViews?: number;
  currentViews: number;
  isActive: boolean;
  createdByName?: string;
  createdAt: string;
}

export interface GalleryAnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  totalPrints: number;
  eventTypeBreakdown: Record<string, number>;
  dailyViews: Record<string, number>;
}

// ─── Public Endpoints ───────────────────────────────────────────────────────

export async function getPublishedAlbums() {
  return api.get<ApiResponse<GalleryAlbumResponse[]>>("/public/gallery/albums");
}

export async function getAlbumBySlug(slug: string, accessToken?: string) {
  const params = accessToken ? { accessToken } : undefined;
  return api.get<ApiResponse<GalleryAlbumDetailResponse>>(`/public/gallery/albums/${slug}`, { params });
}

export async function authenticateAlbum(albumId: string, password: string) {
  return api.post<ApiResponse<{ accessToken: string; authenticated: boolean }>>("/public/gallery/auth", { albumId, password });
}

export async function getAlbumImages(albumId: string, accessToken?: string) {
  const params = accessToken ? { accessToken } : undefined;
  return api.get<ApiResponse<GalleryImageResponse[]>>(`/public/gallery/albums/${albumId}/images`, { params });
}

export async function accessViaShareLink(token: string) {
  return api.get<ApiResponse<GalleryAlbumDetailResponse>>(`/public/gallery/share/${token}`);
}

export async function trackGalleryEvent(data: { albumId: string; imageId?: string; eventType: string; sessionId?: string }) {
  return api.post<ApiResponse<null>>("/public/gallery/analytics/track", data);
}

export async function downloadAlbumZip(albumId: string) {
  const response = await api.get(`/public/gallery/albums/${albumId}/zip`, { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `gallery-album-${albumId}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Admin Endpoints ────────────────────────────────────────────────────────

export async function getAllAlbums() {
  return api.get<ApiResponse<GalleryAlbumResponse[]>>("/admin/gallery/albums");
}

export async function getAdminAlbum(id: string) {
  return api.get<ApiResponse<GalleryAlbumDetailResponse>>(`/admin/gallery/albums/${id}`);
}

export async function createAlbum(data: Partial<GalleryAlbumResponse> & { titleAr: string; titleEn: string; slug: string }) {
  return api.post<ApiResponse<GalleryAlbumResponse>>("/admin/gallery/albums", data);
}

export async function updateAlbum(id: string, data: Partial<GalleryAlbumResponse>) {
  return api.put<ApiResponse<GalleryAlbumResponse>>(`/admin/gallery/albums/${id}`, data);
}

export async function deleteAlbum(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/gallery/albums/${id}`);
}

export async function addAlbumImages(albumId: string, mediaFileIds: string[]) {
  return api.post<ApiResponse<GalleryImageResponse[]>>(`/admin/gallery/albums/${albumId}/images`, { mediaFileIds });
}

export async function updateAlbumImage(albumId: string, imageId: string, updates: Record<string, unknown>) {
  return api.put<ApiResponse<GalleryImageResponse>>(`/admin/gallery/albums/${albumId}/images/${imageId}`, updates);
}

export async function removeAlbumImage(albumId: string, imageId: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/gallery/albums/${albumId}/images/${imageId}`);
}

export async function reorderAlbumImages(albumId: string, imageIds: string[]) {
  return api.put<ApiResponse<{ message: string }>>(`/admin/gallery/albums/${albumId}/images/reorder`, { imageIds });
}

export async function createShareLink(data: { albumId: string; expiresAt?: string; maxViews?: number }) {
  return api.post<ApiResponse<GalleryShareLinkResponse>>("/admin/gallery/share-links", data);
}

export async function getShareLinks(albumId?: string) {
  const params = albumId ? { albumId } : undefined;
  return api.get<ApiResponse<GalleryShareLinkResponse[]>>("/admin/gallery/share-links", { params });
}

export async function deleteShareLink(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/admin/gallery/share-links/${id}`);
}

export async function getAnalyticsSummary(albumId?: string) {
  const params = albumId ? { albumId } : undefined;
  return api.get<ApiResponse<GalleryAnalyticsSummary>>("/admin/gallery/analytics/summary", { params });
}

export async function exportAnalyticsCsv(albumId?: string) {
  const params = albumId ? { albumId } : undefined;
  const response = await api.get("/admin/gallery/analytics/export", { params, responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "gallery-analytics.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function generateAiAltText(albumId: string, imageId: string) {
  return api.post<ApiResponse<{ altText: string; tags?: string[]; message?: string }>>("/admin/gallery/ai/alt-text", { albumId, imageId });
}

export async function generateAiTags(albumId: string) {
  return api.post<ApiResponse<{ altText?: string; tags: string[]; message?: string }>>("/admin/gallery/ai/auto-tag", { albumId });
}
