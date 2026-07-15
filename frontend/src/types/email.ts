export interface EmailAccount {
  id: string;
  userId: string;
  emailAddress: string;
  username: string;
  displayName?: string;
  quotaBytes: number;
  usedBytes: number;
  isActive: boolean;
  isVerified: boolean;
  autoReplyEnabled?: boolean;
  autoReplySubject?: string;
  autoReplyBody?: string;
  forwardTo?: string;
  forwardKeepCopy?: boolean;
  signature?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailFolder {
  id: string;
  accountId: string;
  parentId?: string;
  name: string;
  folderType: string;
  systemFolder: boolean;
  sortOrder: number;
  unreadCount: number;
  totalCount: number;
  createdAt: string;
}

export interface EmailRecipient {
  id: string;
  messageId: string;
  recipientType: "TO" | "CC" | "BCC";
  address: string;
  name?: string;
  isInternal?: boolean;
}

export interface EmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  isInline?: boolean;
}

export interface EmailMessage {
  id: string;
  accountId: string;
  folderId: string;
  messageId?: string;
  inReplyTo?: string;
  threadId?: string;
  senderAddress: string;
  senderName?: string;
  replyToAddress?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  previewText?: string;
  hasAttachments?: boolean;
  attachmentCount?: number;
  priority?: string;
  isRead?: boolean;
  isStarred?: boolean;
  isFlagged?: boolean;
  isDraft?: boolean;
  isScheduled?: boolean;
  scheduledSendAt?: string;
  actuallySentAt?: string;
  deliveryStatus?: string;
  recipients: EmailRecipient[];
  attachments: EmailAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailContact {
  id: string;
  ownerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  company?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface ContactGroup {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  color?: string;
  memberCount?: number;
  createdAt: string;
}

export interface EmailRule {
  id: string;
  accountId: string;
  name: string;
  orderIndex: number;
  isEnabled: boolean;
  stopProcessing?: boolean;
  matchAll?: boolean;
  conditions: string;
  actions: string;
  createdAt: string;
}
