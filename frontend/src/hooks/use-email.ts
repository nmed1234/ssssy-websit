import { useState, useEffect, useCallback } from "react";
import {
  getMyAccount, getFolders, getMessages, getMessage, getThread,
  getDrafts, getContactGroups, getRules, getScheduledSends, getStarredMessages,
  sendEmail, saveDraft, updateDraft, sendDraft, replyToMessage,
  markAsRead, toggleStar, toggleFlag, deleteMessages, moveToFolder,
  createContact, getContacts, getAllContacts, autocompleteContacts,
  createRule, createContactGroup,
} from "@/lib/email";
import type { EmailAccount, EmailFolder, EmailMessage, EmailContact, ContactGroup, EmailRule } from "@/types/email";
import type { PaginatedResponse } from "@/types";

export function useEmail() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAccount()
      .then((res) => { if (res.data.success) setAccount(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { account, loading, refetch: () => getMyAccount().then((r) => r.data.success && setAccount(r.data.data)) };
}

export function useEmailFolders() {
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getFolders()
      .then((res) => { if (res.data.success) setFolders(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { folders, loading, refetch: fetch };
}

export function useEmailMessages(folderId?: string, page = 0, size = 20) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const res = await getMessages(folderId, page, size);
      if (res.data.success) {
        setMessages(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  }, [folderId, page, size]);

  useEffect(() => { fetch(); }, [fetch]);

  return { messages, totalPages, loading, refetch: fetch };
}

export function useEmailMessage(id?: string) {
  const [message, setMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMessage(id)
      .then((res) => { if (res.data.success) { setMessage(res.data.data); if (!res.data.data.isRead) markAsRead(id); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { message, loading };
}

export function useEmailCompose() {
  const [sending, setSending] = useState(false);

  const send = useCallback(async (data: Parameters<typeof sendEmail>[0]) => {
    setSending(true);
    try {
      const res = await sendEmail(data);
      return res.data;
    } catch { throw new Error("Failed to send"); } finally { setSending(false); }
  }, []);

  const save = useCallback(async (data: Parameters<typeof saveDraft>[0]) => {
    const res = await saveDraft(data);
    return res.data;
  }, []);

  const update = useCallback(async (id: string, data: Parameters<typeof updateDraft>[1]) => {
    const res = await updateDraft(id, data);
    return res.data;
  }, []);

  return { send, save, update, sending };
}

export function useEmailContacts() {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContacts()
      .then((res) => { if (res.data.success) setContacts(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const search = useCallback(async (q: string) => {
    const res = await autocompleteContacts(q);
    return res.data.data ?? [];
  }, []);

  return { contacts, loading, search };
}

export function useEmailRules() {
  const [rules, setRules] = useState<EmailRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    getRules()
      .then((res) => { if (res.data.success) setRules(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { rules, loading, refetch: fetch };
}

export function useEmailThread(threadId?: string) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    setLoading(true);
    getThread(threadId)
      .then((res) => { if (res.data.success) setMessages(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [threadId]);

  return { messages, loading };
}

export function useEmailSearch() {
  const [results, setResults] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string, folderId: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q);
    try {
      const res = await getMessages(folderId, 0, 50);
      if (res.data.success) {
        const ql = q.toLowerCase();
        setResults(res.data.data.content.filter((m) =>
          (m.subject ?? "").toLowerCase().includes(ql) ||
          (m.senderName ?? "").toLowerCase().includes(ql) ||
          (m.senderAddress ?? "").toLowerCase().includes(ql) ||
          (m.bodyText ?? "").toLowerCase().includes(ql)
        ));
      }
    } catch {} finally { setLoading(false); }
  }, []);

  return { results, loading, query, search };
}

export function useEmailScheduled() {
  const [sends, setSends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getScheduledSends(page, 20);
      if (res.data.success) {
        setSends(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { sends, loading, page, totalPages, setPage, refetch: fetch };
}
