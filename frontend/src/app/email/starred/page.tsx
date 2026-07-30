"use client";

import { Star } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function StarredPage() {
  return (
    <FolderMessageList
      folderType="starred"
      emptyIcon={<Star className="h-12 w-12" />}
      emptyMessage="No starred messages"
    />
  );
}
