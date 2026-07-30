"use client";

import { useParams } from "next/navigation";
import { Folder } from "lucide-react";
import FolderMessageList from "@/components/email/FolderMessageList";

export default function CustomFolderPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <FolderMessageList
      folderId={id}
      emptyIcon={<Folder className="h-12 w-12" />}
      emptyMessage="This folder is empty"
    />
  );
}
