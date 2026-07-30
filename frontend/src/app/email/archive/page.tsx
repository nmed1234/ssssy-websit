"use client";

import { Archive } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function ArchivePage() {
  return (
    <FolderMessageList
      folderType="ARCHIVE"
      emptyIcon={<Archive className="h-12 w-12" />}
      emptyMessage="Archive is empty"
    />
  );
}
