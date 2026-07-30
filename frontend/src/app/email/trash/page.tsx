"use client";

import { Trash2 } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function TrashPage() {
  return (
    <FolderMessageList
      folderType="TRASH"
      emptyIcon={<Trash2 className="h-12 w-12" />}
      emptyMessage="Trash is empty"
      showEmptyButton
      emptyButtonLabel="Empty Trash"
    />
  );
}
