import type React from "react";


export interface User {
  id: string;
  username: string;
  email: string;
  firstNameAr?: string;
  lastNameAr?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  phone?: string;
  avatarUrl?: string;
  institution?: string;
  department?: string;
  position?: string;
  specialization?: string;
  biography?: string;
  address?: string;
  city?: string;
  country?: string;
  twoFactorEnabled?: boolean;
  role: string;
  roleDisplayNameAr?: string;
  roleDisplayNameEn?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayNameAr?: string;
  displayNameEn?: string;
  description?: string;
  hierarchyLevel: number;
  isSystem: boolean;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  displayName?: string;
  category?: string;
  description?: string;
}

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

export interface Category {
  id: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  sortOrder?: number;
  isActive?: boolean;
  contentCount?: number;
  createdAt?: string;
}

export interface Tag {
  id: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  createdAt?: string;
}

export interface ContentItem {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug: string;
  excerpt?: string;
  excerptAr?: string;
  body?: string;
  bodyAr?: string;
  bodyEn?: string;
  contentType: string;
  status: string;
  authorId: string;
  authorName: string;
  reviewerId?: string;
  publisherId?: string;
  category?: Category;
  tags?: Tag[];
  featuredImage?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  isMemberOnly?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  viewCount?: number;
  version?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  altTextAr?: string;
  altTextEn?: string;
  captionEn?: string;
  captionAr?: string;
  tags?: string;
  folderId?: string;
  folderName?: string;
  userId?: string;
  userName?: string;
  uploaderDisplayName?: string;
  uploaderName?: string;
  createdAt?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  imageCount?: number;
  children?: MediaFolder[];
}

export interface WorkflowLog {
  id: string;
  contentId: string;
  fromStatus?: string;
  toStatus: string;
  action: string;
  actorId: string;
  actorName: string;
  assigneeId?: string;
  assigneeName?: string;
  comments?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  publishedArticles: number;
  draftArticles: number;
  pendingReviews: number;
  totalContent: number;
  totalCategories: number;
  totalTags: number;
  totalMediaFiles: number;
  storageUsedBytes: number;
}

export interface Event {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  locationUrl?: string;
  eventType?: string;
  organizer?: string;
  featuredImage?: string;
  isPublished: boolean;
  address?: string;
  latitude?: number;
  longitude?: number;
  isOnline?: boolean;
  onlineUrl?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  status?: string;
  contactEmail?: string;
  // Phase 2
  registrationCount?: number;
  // Phase 5
  isFeatured?: boolean;
  displayOrder?: number;
  ogImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  registrationFormSchema?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventReminderRule {
  id: string;
  eventId: string;
  ruleType: string;  // BEFORE_EVENT | AFTER_EVENT | CUSTOM_DATE
  offsetHours: number;
  fireAt: string;
  subjectTemplate: string;
  bodyTemplate: string;
  sendEmail: boolean;
  sendInApp: boolean;
  isFired: boolean;
  firedAt?: string;
  recipientsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  archivedEvents: number;
  cancelledEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalRegistrationsThisMonth: number;
  mostRegisteredEventTitle?: string;
  mostRegisteredEventCount?: number;
}

export interface JobVacancy {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug: string;
  description?: string;
  requirements?: string;
  location?: string;
  jobType?: string;
  department?: string;
  deadline?: string;
  isPublished: boolean;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug: string;
  layoutType?: string;
  isPublished: boolean;
  isHomepage: boolean;
  parentId?: string;
  sortOrder?: number;
  authorName?: string;
  sections?: PageSection[];
  /** New block-tree JSON stored in pages.layout_json (Phase 3 refactor) */
  layoutJson?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Workflow status (DRAFT | REVIEW | APPROVED | PUBLISHED) */
  workflowStatus?: string;
  lastTransitionBy?: string;
  lastTransitionAt?: string;
  /** Multi-language support */
  language?: string;           // "EN" | "AR"
  translationGroupId?: string; // UUID linking translations
}

export interface PageSection {
  id: string;
  pageId: string;
  componentType: string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  styling?: Record<string, unknown>;
  eventsJson?: string;
  conditionsJson?: string;
  version?: number;
  sortOrder?: number;
  visibility?: string;
  isAnimated?: boolean;
  animationType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Menu {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  items?: MenuItem[];
  itemCount?: number;
  createdAt?: string;
  /** Visual dropdown template: classic | mega | minimal | modern */
  menuTemplate?: string;
  /** Framer-motion animation style: fade | slide | scale | flip */
  dropdownStyle?: string;
  /** Whether this menu is the site-wide style default */
  isDefaultStyle?: boolean;
  /** JSON string with optional colour overrides */
  styleConfig?: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  parentId?: string;
  labelAr?: string;
  labelEn?: string;
  url?: string;
  target?: string;
  icon?: string;
  pageId?: string;
  sortOrder?: number;
  isActive: boolean;
  children?: MenuItem[];
}

export interface Comment {
  id: string;
  contentId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  body: string;
  isApproved: boolean;
  approvedBy?: string;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt?: string;
  unsubscribedAt?: string;
}

export interface BoardMember {
  id: string;
  userId: string;
  userName?: string;
  memberName?: string;
  memberNameAr?: string;
  memberPhoto?: string;
  positionAr?: string;
  positionEn?: string;
  termStart?: string;
  termEnd?: string;
  bio?: string;
  photoUrl?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
  linkedinUrl?: string;
  email?: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  nameAr?: string;
  nameEn?: string;
  titleAr?: string;
  email?: string;
  phone?: string;
  photo?: string;
  photoUrl?: string;
  institution?: string;
  department?: string;
  position?: string;
  membershipType?: string;
  membershipNumber?: string;
  specialization?: string;
  specializationDetail?: string;
  researchInterests?: string;
  education?: string;
  careerSummary?: string;
  memberships?: string;
  languages?: string;
  nationality?: string;
  birthYear?: number;
  birthCity?: string;
  maritalStatus?: string;
  publicationsCount?: number;
  isPublic: boolean;
  joinedAt?: string;
  membershipExpiresAt?: string;
  orcidId?: string;
  googleScholarUrl?: string;
  linkedinUrl?: string;
  slug?: string;
}

export interface SystemConfig {
  id: string;
  configKey: string;
  configValue: string;
  configGroup?: string;
  configType?: string;
  isEncrypted: boolean;
  description?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  componentType: string;
  thumbnailUrl?: string;
  defaultConfig?: Record<string, unknown>;
  defaultData?: Record<string, unknown>;
  defaultStyling?: Record<string, unknown>;
  isSystem: boolean;
  sortOrder?: number;
}

export interface Publication {
  id: string;
  titleEn: string;
  titleAr?: string;
  slug: string;
  abstractEn?: string;
  abstractAr?: string;
  authors?: string;
  year?: number;
  category?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  fileSizeKb?: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSection {
  id: string;
  name: string;
  slug?: string;
  componentType: string;
  location?: string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  styling?: Record<string, unknown>;
  eventsJson?: string;
  conditionsJson?: string;
  version?: number;
  isActive: boolean;
  sortOrder?: number;
  // Draft/Publish workflow (V62)
  status?: 'DRAFT' | 'PUBLISHED';
  publishedData?: Record<string, unknown>;
  publishedConfig?: Record<string, unknown>;
  publishedStyling?: Record<string, unknown>;
  publishedAt?: string;
  versionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSectionVersion {
  id: string;
  sectionId: string;
  versionNumber: number;
  data: Record<string, unknown>;
  config: Record<string, unknown>;
  styling: Record<string, unknown>;
  publishedBy?: string;
  changeSummary?: string;
  createdAt?: string;
}

// ── Custom Section Block Types ────────────────────────────────────────────────

export type BlockType =
  // Core
  | 'heading' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer'
  | 'columns' | 'video' | 'icon' | 'card'
  // Advanced
  | 'accordion' | 'timeline' | 'team-grid' | 'map' | 'form-embed'
  | 'alert' | 'quote' | 'code' | 'html'
  // Dynamic
  | 'latest-news' | 'upcoming-events' | 'publications-carousel'
  | 'board-members' | 'statistics-counter';

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  /** For 'columns' type: array of column block lists */
  columns?: Block[][];
}

export interface ThemeSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingType: string;
  groupName: string;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoMetadata {
  id: string;
  entityType: string;
  entityId: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface JobApplication {
  id: string;
  jobVacancyId: string;
  jobVacancyTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  status?: string;
  appliedAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notes?: string;
  status?: string;
  registeredAt?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkInNotes?: string;
  waitlistPosition?: number;
  createdAt?: string;
}

export interface EventRegistrationRequest {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  notes?: string;
}

export interface EventRegistrationResponse {
  id: string;
  eventId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notes?: string;
  status?: string;
  registeredAt?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkInNotes?: string;
  waitlistPosition?: number;
  createdAt?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  readBy?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ContactSubmissionResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  isRead?: boolean;
  readBy?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ContactSubmissionReplyRequest {
  replyBody: string;
}

export interface CrmContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  contactType?: string;
  relationshipLevel?: string;
  notes?: string;
  source?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  lastContactAt?: string;
  nextFollowupAt?: string;
  tags?: string[];
  preferences?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  contactType?: string;
  relationshipLevel?: string;
  notes?: string;
  source?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  lastContactAt?: string;
  nextFollowupAt?: string;
  tags?: string[];
  preferences?: string;
}

// ─── Dynamic Form Engine (Phase 2) ─────────────────────────────────────────────

export type FormFieldType =
  | "text" | "email" | "textarea" | "richtext" | "number" | "date" | "datetime"
  | "select" | "multiselect" | "checkbox" | "radio" | "file" | "hidden";

export interface FormFieldOption {
  value: string;
  label: string;
  labelAr?: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface FormFieldDefinition {
  name: string;
  type: FormFieldType;
  labelEn: string;
  labelAr?: string;
  placeholder?: string;
  placeholderAr?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  helpText?: string;
  helpTextAr?: string;
  defaultValue?: string;
  width?: "full" | "half";
}

export interface FormDefinition {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  description?: string;
  schemaJson: string;         // JSON array string of FormFieldDefinition[]
  submitLabelEn?: string;
  submitLabelAr?: string;
  successMessageEn?: string;
  successMessageAr?: string;
  redirectUrl?: string;
  notificationEmails?: string;
  requiresAuth?: boolean;
  isActive?: boolean;
  createdByUsername?: string;
  submissionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  userId?: string;
  submitterName?: string;
  submitterEmail?: string;
  data: string;               // JSON object string
  ipAddress?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}


// ─── Dynamic Content Type Engine (Phase 3) ─────────────────────────────────────

export interface ContentTypeField {
  id?: string;
  fieldName: string;
  fieldLabelEn: string;
  fieldLabelAr?: string;
  /** text|richtext|number|date|datetime|url|email|select|multiselect|checkbox|radio|media|file */
  fieldType: string;
  isRequired?: boolean;
  isSearchable?: boolean;
  isListed?: boolean;
  placeholderEn?: string;
  placeholderAr?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  optionsJson?: string;   // JSON: [{value,label,labelAr}]
  validationJson?: string; // JSON: {min,max,pattern,message}
  sortOrder?: number;
  createdAt?: string;
}

export interface ContentTypeDefinition {
  id: string;
  name: string;                // URL-safe: "research-paper"
  labelEn: string;
  labelAr?: string;
  description?: string;
  icon?: string;
  workflowId?: string;
  workflowName?: string;
  allowComments?: boolean;
  allowMemberSubmit?: boolean;
  requiresApproval?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  createdByUsername?: string;
  entryCount?: number;
  fields: ContentTypeField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicContentEntry {
  id: string;
  contentTypeName: string;
  contentTypeLabelEn?: string;
  contentTypeLabelAr?: string;
  slug: string;
  status: string;
  authorId?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  workflowState?: string;
  fieldData: string;           // JSON object string
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}


// ─── Workflow State (used by CmsWorkflowButton / useWorkflow) ─────────────────

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

// ─── CMS SDK Plugin Registry Types (Phase 6) ──────────────────────────────────

export interface PluginBlockDefinition {
  /** Unique type identifier, e.g. "research-citation" */
  type: string;
  /** Human-readable label shown in page-builder palette */
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
