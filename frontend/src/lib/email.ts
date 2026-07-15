import api from "./api";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { EmailAccount, EmailFolder, EmailMessage, EmailContact, ContactGroup, EmailRule } from "@/types/email";

export async function getMyAccount() {
  return api.get<ApiResponse<EmailAccount>>("/email/account");
}

export async function provisionAccount() {
  return api.post<ApiResponse<EmailAccount>>("/email/account/provision");
}

export async function updateAccount(data: { displayName?: string; signature?: string }) {
  return api.put<ApiResponse<EmailAccount>>("/email/account", data);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return api.put<ApiResponse<void>>("/email/account/password", { currentPassword, newPassword });
}

export async function getFolders() {
  return api.get<ApiResponse<EmailFolder[]>>("/email/folders");
}

export async function getFolderByType(folderType: string) {
  return api.get<ApiResponse<EmailFolder>>(`/email/folders/type/${folderType}`);
}

export async function createFolder(data: { name: string }) {
  return api.post<ApiResponse<EmailFolder>>("/email/folders", data);
}

export async function deleteFolder(id: string) {
  return api.delete<ApiResponse<void>>(`/email/folders/${id}`);
}

export async function getMessages(folderId: string, page = 0, size = 20) {
  return api.get<ApiResponse<PaginatedResponse<EmailMessage>>>(`/email/messages?folderId=${folderId}&page=${page}&size=${size}`);
}

export async function getMessage(id: string) {
  return api.get<ApiResponse<EmailMessage>>(`/email/messages/${id}`);
}

export async function markAsRead(id: string) {
  return api.put<ApiResponse<void>>(`/email/messages/${id}/read`);
}

export async function toggleStar(id: string) {
  return api.put<ApiResponse<void>>(`/email/messages/${id}/star`);
}

export async function toggleFlag(id: string) {
  return api.put<ApiResponse<void>>(`/email/messages/${id}/flag`);
}

export async function moveToFolder(messageIds: string[], targetFolderId: string) {
  return api.put<ApiResponse<void>>("/email/messages/move", { messageIds, targetFolderId });
}

export async function deleteMessages(messageIds: string[]) {
  return api.post<ApiResponse<void>>("/email/messages/delete", messageIds);
}

export async function getDrafts(page = 0, size = 20) {
  return api.get<ApiResponse<PaginatedResponse<EmailMessage>>>(`/email/messages/drafts?page=${page}&size=${size}`);
}

export async function deleteDraft(id: string) {
  return api.delete<ApiResponse<void>>(`/email/messages/draft/${id}`);
}

export async function getThread(threadId: string) {
  return api.get<ApiResponse<EmailMessage[]>>(`/email/messages/thread/${threadId}`);
}

export async function sendEmail(data: {
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  toRecipients: string[];
  ccRecipients?: string[];
  bccRecipients?: string[];
  priority?: string;
}) {
  return api.post<ApiResponse<EmailMessage>>("/email/compose/send", data);
}

export async function saveDraft(data: {
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  toRecipients?: string[];
  ccRecipients?: string[];
}) {
  return api.post<ApiResponse<EmailMessage>>("/email/compose/draft", data);
}

export async function updateDraft(id: string, data: {
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  toRecipients?: string[];
  ccRecipients?: string[];
}) {
  return api.put<ApiResponse<EmailMessage>>(`/email/compose/draft/${id}`, data);
}

export async function sendDraft(id: string) {
  return api.post<ApiResponse<EmailMessage>>(`/email/compose/draft/${id}/send`);
}

export async function replyToMessage(id: string, data: {
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  toRecipients: string[];
}) {
  return api.post<ApiResponse<EmailMessage>>(`/email/compose/${id}/reply`, data);
}

export async function getContacts(page = 0, size = 50) {
  return api.get<ApiResponse<PaginatedResponse<EmailContact>>>(`/email/contacts?page=${page}&size=${size}`);
}

export async function getAllContacts() {
  return api.get<ApiResponse<EmailContact[]>>("/email/contacts/all");
}

export async function autocompleteContacts(q: string) {
  return api.get<ApiResponse<EmailContact[]>>(`/email/contacts/autocomplete?q=${q}`);
}

export async function createContact(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
}) {
  return api.post<ApiResponse<EmailContact>>("/email/contacts", data);
}

export async function deleteContact(id: string) {
  return api.delete<ApiResponse<void>>(`/email/contacts/${id}`);
}

export async function getContactGroups() {
  return api.get<ApiResponse<ContactGroup[]>>("/email/contact-groups");
}

export async function createContactGroup(data: { name: string; description?: string; color?: string }) {
  return api.post<ApiResponse<ContactGroup>>("/email/contact-groups", data);
}

export async function getRules() {
  return api.get<ApiResponse<EmailRule[]>>("/email/rules");
}

export async function createRule(data: {
  name: string;
  conditions: string;
  actions: string;
  matchAll?: boolean;
}) {
  return api.post<ApiResponse<EmailRule>>("/email/rules", data);
}

export async function getScheduledSends(page = 0, size = 20) {
  return api.get<ApiResponse<PaginatedResponse<any>>>(`/email/scheduled?page=${page}&size=${size}`);
}

export async function deleteScheduledSend(id: string) {
  return api.delete<ApiResponse<void>>(`/email/scheduled/${id}`);
}

export async function getStarredMessages(page = 0, size = 20) {
  return api.get<ApiResponse<PaginatedResponse<EmailMessage>>>(`/email/messages?starred=true&page=${page}&size=${size}`);
}

export async function deleteContactGroup(id: string) {
  return api.delete<ApiResponse<void>>(`/email/contact-groups/${id}`);
}

export async function addContactToGroup(groupId: string, contactId: string) {
  return api.post<ApiResponse<void>>(`/email/contact-groups/${groupId}/members/${contactId}`);
}

export async function removeContactFromGroup(groupId: string, contactId: string) {
  return api.delete<ApiResponse<void>>(`/email/contact-groups/${groupId}/members/${contactId}`);
}
