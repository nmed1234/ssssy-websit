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
  body?: string;
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
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
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
  membershipType?: string;
  membershipNumber?: string;
  specialization?: string;
  researchInterests?: string;
  education?: string;
  publicationsCount?: number;
  isPublic: boolean;
  joinedAt?: string;
  membershipExpiresAt?: string;
  orcidId?: string;
  googleScholarUrl?: string;
  linkedinUrl?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notes?: string;
  status?: string;
  registeredAt?: string;
  checkedIn?: boolean;
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