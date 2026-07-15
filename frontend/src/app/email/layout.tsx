"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getFolders, getMyAccount } from "@/lib/email";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import type { EmailFolder, EmailAccount } from "@/types/email";
import { Inbox, Send, FileText, Trash2, AlertTriangle, Archive, Edit3, Settings, ChevronDown, Loader2, Menu } from "lucide-react";

const folderIcons: Record<string, React.ReactNode> = {
  INBOX: <Inbox className="h-4 w-4" />,
  SENT: <Send className="h-4 w-4" />,
  DRAFTS: <FileText className="h-4 w-4" />,
  TRASH: <Trash2 className="h-4 w-4" />,
  SPAM: <AlertTriangle className="h-4 w-4" />,
  ARCHIVE: <Archive className="h-4 w-4" />,
};

function SidebarSkeleton() {
  return (
    <div className="w-64 p-4 space-y-4">
      <div className="h-10 bg-muted rounded-lg animate-shimmer" />
      <div className="space-y-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded animate-shimmer" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-3 w-24 bg-muted rounded animate-shimmer" />
        <div className="h-1.5 bg-muted rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

function SidebarContent({
  folders,
  account,
  pathname,
  folderRoute,
  CollapsedIndicator,
}: {
  folders: EmailFolder[];
  account: EmailAccount | null;
  pathname: string;
  folderRoute: (folder: EmailFolder) => string;
  CollapsedIndicator?: ({ folder }: { folder: EmailFolder }) => React.ReactNode | null;
}) {
  const router = useRouter();
  const usagePercent = account
    ? Math.round((account.usedBytes / account.quotaBytes) * 100)
    : 0;
  const barColor = usagePercent < 70 ? "bg-forest" : usagePercent < 90 ? "bg-yellow-500" : "bg-red-500";

  return (
    <>
      <div className="p-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => router.push("/email/compose")} className="w-full" size="default">
            <Edit3 className="h-4 w-4 mr-2" /> Compose
          </Button>
        </motion.div>
      </div>

      <nav className="px-2 space-y-0.5 relative">
        {folders
          .filter((f) => f.systemFolder)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((folder) => {
            const isActive = pathname === folderRoute(folder);
            return (
              <Link
                key={folder.id}
                href={folderRoute(folder)}
                className={`relative flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-soil-clay/10 text-soil-clay font-medium"
                    : "text-earth-gray hover:bg-muted"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFolder"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-soil-clay rounded-r"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="flex items-center gap-3">
                  {folderIcons[folder.folderType] || <Inbox className="h-4 w-4" />}
                  <span>{folder.name}</span>
                </span>
                {(folder.unreadCount ?? 0) > 0 && (
                  <span className="bg-soil-clay text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {folder.unreadCount}
                  </span>
                )}
                {CollapsedIndicator && <CollapsedIndicator folder={folder} />}
              </Link>
            );
          })}
      </nav>

      <AnimatePresence>
        {account && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card"
          >
            <div className="flex items-center justify-between text-xs text-earth-gray mb-1">
              <span>Storage</span>
              <span>{(account.usedBytes / 1048576).toFixed(0)}MB / {(account.quotaBytes / 1073741824).toFixed(0)}GB</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full transition-colors duration-500 ${barColor}`}
              />
            </div>
            <Link href="/email/settings" className="flex items-center gap-2 mt-3 text-xs text-earth-gray hover:text-soil-dark transition-colors">
              <Settings className="h-3 w-3" /> Email Settings
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [foldersLoaded, setFoldersLoaded] = useState(false);

  useEffect(() => {
    getFolders().then((res) => {
      if (res.data.success) setFolders(res.data.data);
      setFoldersLoaded(true);
    }).catch(() => setFoldersLoaded(true));
    getMyAccount().then((res) => {
      if (res.data.success) setAccount(res.data.data);
    }).catch(() => {});
  }, []);

  const folderRoute = (folder: EmailFolder): string => {
    switch (folder.folderType) {
      case "INBOX": return "/email/inbox";
      case "SENT": return "/email/sent";
      case "DRAFTS": return "/email/drafts";
      case "TRASH": return "/email/trash";
      case "SPAM": return "/email/spam";
      case "ARCHIVE": return "/email/archive";
      default: return `/email/folder/${folder.id}`;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 p-3 bg-card border-b border-border lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="relative h-full">
              {!foldersLoaded ? (
                <SidebarSkeleton />
              ) : (
                <SidebarContent folders={folders} account={account} pathname={pathname} folderRoute={folderRoute} />
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/email/inbox" className="text-sm font-semibold">Email</Link>
      </div>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex bg-card border-r border-border flex-shrink-0 overflow-hidden relative"
      >
        {!foldersLoaded ? (
          <SidebarSkeleton />
        ) : (
          <SidebarContent
            folders={folders}
            account={account}
            pathname={pathname}
            folderRoute={folderRoute}
            CollapsedIndicator={({ folder }) =>
              sidebarOpen ? null : (folder.unreadCount ?? 0) > 0 ? (
                <span className="w-2 h-2 rounded-full bg-soil-clay" />
              ) : null
            }
          />
        )}
      </motion.aside>

      {/* Toggle button (desktop) */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex p-2 border-r border-border hover:bg-muted flex-shrink-0 self-stretch items-center transition-colors"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      >
        <motion.div animate={{ rotate: sidebarOpen ? -90 : 90 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-4 w-4 text-earth-gray" />
        </motion.div>
      </motion.button>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
