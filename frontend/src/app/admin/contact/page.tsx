"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ContactSubmissionResponse, ApiResponse, ContactSubmissionReplyRequest } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, User, Calendar, Eye, Reply, Trash2, Loader2, Check } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function AdminContactMessagesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmissionResponse | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const { data: messagesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ content: ContactSubmissionResponse[]; totalElements: number; totalPages: number; number: number }>>("/admin/contact-submissions");
      return res.data.data;
    },
  });

  const { data: unreadCountResponse } = useQuery({
    queryKey: ["contact-submissions-unread-count"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ count: number }>>("/admin/contact-submissions/unread-count");
      return res.data.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put<ApiResponse<ContactSubmissionResponse>>(`/admin/contact-submissions/${id}/read`, {});
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions-unread-count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/contact-submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions-unread-count"] });
      setSelectedMessage(null);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContactSubmissionReplyRequest }) => {
      const res = await api.post<ApiResponse<ContactSubmissionResponse>>(`/admin/contact-submissions/${id}/reply`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions-unread-count"] });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedMessage(null);
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      replyMutation.mutate({ id: selectedMessage.id, data: { replyBody: replyText } });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (isRead?: boolean) => {
    if (isRead) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Read</Badge>;
    }
    return <Badge variant="default" className="bg-red-100 text-red-800">Unread</Badge>;
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Contact Messages", "رسائل التواصل")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("Contact Messages", "رسائل التواصل") }]}
        actions={
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Unread: {unreadCountResponse?.count || 0}
            </Badge>
            <Button onClick={() => refetch()} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-700">Failed to load contact messages.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages List</CardTitle>
              <CardDescription>
                All contact form submissions ({messagesResponse?.totalElements || 0})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messagesResponse?.content.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No contact messages found.
                </div>
              ) : (
                <div className="space-y-1">
                  {messagesResponse?.content.map((message: ContactSubmissionResponse) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer transition-colors border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedMessage?.id === message.id ? "bg-soil-sand/30 border-l-4 border-l-soil-clay" : ""}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm truncate max-w-[200px]" title={message.name}>{message.name}</h3>
                        {getStatusBadge(message.isRead)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 truncate" title={message.subject}>{message.subject}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{message.email}</span>
                        <span>•</span>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Message Details</CardTitle>
                    <CardDescription>{formatDate(selectedMessage.createdAt)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReplyDialogOpen(true)}
                    >
                      <Reply className="h-4 w-4 mr-1" /> Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedMessage.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Sender Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedMessage.name}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedMessage.email}</p>
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{selectedMessage.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedMessage.isRead)}
                    </div>
                  </div>

                  {selectedMessage.readBy && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Read By</Label>
                      <p className="text-sm">{selectedMessage.readBy}</p>
                    </div>
                  )}

                  {selectedMessage.repliedAt && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Replied At</Label>
                      <p className="text-sm">{formatDate(selectedMessage.repliedAt)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                  <p className="text-sm font-medium">{selectedMessage.subject}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a message
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Click on any message from the list to view its details here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Contact Message</DialogTitle>
            <DialogDescription>
              Reply to {selectedMessage?.name} ({selectedMessage?.email}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <p className="text-sm font-medium mb-2">Original Message:</p>
              <p className="text-xs text-muted-foreground mb-2">Subject: {selectedMessage?.subject}</p>
              <p className="text-sm whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here...

You can include helpful information or direct them to relevant resources.

Best regards,
The Soil Science Society Team"
                className="min-h-32"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim() || replyMutation.isPending}
            >
              {replyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}