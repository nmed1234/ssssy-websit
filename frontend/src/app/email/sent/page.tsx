"use client";

import { Send } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function SentPage() {
  return (
    <FolderMessageList
      folderType="SENT"
      emptyIcon={<Send className="h-12 w-12" />}
      emptyMessage="No sent messages"
      showReplyForward={false}
    />
  );
}
