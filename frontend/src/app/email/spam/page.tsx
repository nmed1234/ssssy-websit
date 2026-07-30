"use client";

import { AlertTriangle } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function SpamPage() {
  return (
    <FolderMessageList
      folderType="SPAM"
      emptyIcon={<AlertTriangle className="h-12 w-12" />}
      emptyMessage="No spam — your folder is clean"
      showEmptyButton
      emptyButtonLabel="Delete All Spam"
    />
  );
}
