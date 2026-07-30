"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getFolders, getMyAccount } from "@/lib/email";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import type { EmailFolder, EmailAccount } from "@/types/email";
import {
  Inbox, Send, FileText, Trash2, AlertTriangle, Archive,
  Edit3, Settings, ChevronLeft, ChevronRight, Loader2,
  Menu, Star, Clock, ArrowLeft, Search, HelpCircle,
  MoreHorizontal,
} from "lucide-react";

/* ── Folder icon + color map ────────────────────────────────────────── */
const FOLDER_META: Record<string, {
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
}> = {
  INBOX:   { icon: Inbox,         color: "text-blue-400",   bg: "bg-blue-400/10" },
  SENT:    { icon: Send,          color: "text-emerald-400", bg: "bg-emerald-400/10" },
  DRAFTS:  { icon: FileText,      color: "text-amber-400",  bg: "bg-amber-400/10" },
  TRASH:   { icon: Trash2,        color: "text-red-400",    bg: "bg-red-400/10" },
  SPAM:    { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
  ARCHIVE: { icon: Archive,       color: "text-purple-400", bg: "bg-purple-400/10" },
};

const EXTRA_LINKS = [
  { href: "/email/starred",   Icon: Star,  label: "Starred",   color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { href: "/email/scheduled", Icon: Clock, label: "Scheduled", color: "text-sky-400",    bg: "bg-sky-400/10" },
];

function folderRoute(folder: EmailFolder): string {
  switch (folder.folderType) {
    case "INBOX":   return "/email/inbox";
    case "SENT":    return "/email/sent";
    case "DRAFTS":  return "/email/drafts";
    case "TRASH":   return "/email/trash";
    case "SPAM":    return "/email/spam";
    case "ARCHIVE": return "/email/archive";
    default:        return `/email/folder/${folder.id}`;
  }
}

/* ── Storage bar color ──────────────────────────────────────────────── */
function storageColor(pct: number) {
  if (pct > 85) return "bg-red-500";
  if (pct > 60) return "bg-amber-400";
  return "bg-emerald-500";
}

/* ── Sidebar body ───────────────────────────────────────────────────── */
function SidebarBody({
  folders,
  account,
  pathname,
  collapsed,
}: {
  folders: EmailFolder[];
  account: EmailAccount | null;
  pathname: string;
  collapsed: boolean;
}) {
  const router = useRouter();
  const usagePct = account && account.quotaBytes
    ? Math.min(Math.round((account.usedBytes / account.quotaBytes) * 100), 100)
    : 0;

  const systemFolders = folders
    .filter((f) => f.systemFolder)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Brand header */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-white/10 shrink-0 ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && (
          <span className="text-base font-bold text-white tracking-tight flex-1">Mail</span>
        )}
      </div>

      {/* Compose button */}
      <div className={`px-3 py-3 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/email/compose")}
          className={`flex items-center gap-2.5 bg-soil-clay hover:bg-soil-clay/80 text-white rounded-xl transition-colors font-medium text-sm shadow-md ${
            collapsed ? "p-2.5" : "px-4 py-2.5 w-full"
          }`}
          title="Compose"
        >
          <Edit3 className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Compose</span>}
        </motion.button>
      </div>

      {/* Search shortcut */}
      {!collapsed && (
        <div className="px-3 pb-2 shrink-0">
          <Link
            href="/email/search"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white/80 text-sm"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>Search…</span>
            <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">/</kbd>
          </Link>
        </div>
      )}

      {/* Folder nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
        {systemFolders.map((folder) => {
          const meta = FOLDER_META[folder.folderType];
          const Icon = meta?.icon ?? Inbox;
          const isActive = pathname === folderRoute(folder);
          const unread = folder.unreadCount ?? 0;

          return (
            <Link
              key={folder.id}
              href={folderRoute(folder)}
              title={collapsed ? folder.name : undefined}
              className={`relative flex items-center gap-3 rounded-lg transition-all duration-150 ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2"
              } ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/55 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFolderBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-soil-clay rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className={`shrink-0 ${meta?.bg ?? ""} p-1 rounded-md`}>
                <Icon className={`h-3.5 w-3.5 ${meta?.color ?? "text-white/70"}`} />
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
                  {unread > 0 && (
                    <span className="bg-soil-clay text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </>
              )}
              {collapsed && unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-soil-clay" />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="mx-2 my-1.5 h-px bg-white/10" />

        {/* Starred / Scheduled */}
        {EXTRA_LINKS.map(({ href, Icon, label, color, bg }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 rounded-lg transition-all duration-150 ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2"
              } ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/55 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`extra-${href}`}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-soil-clay rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className={`shrink-0 ${bg} p-1 rounded-md`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              {!collapsed && <span className="flex-1 text-sm font-medium truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: storage + links */}
      <AnimatePresence>
        {account && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="shrink-0 border-t border-white/10 p-3"
          >
            {!collapsed ? (
              <>
                {/* Account pill */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full bg-soil-clay flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {account.emailAddress.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs text-white/70 truncate flex-1" title={account.emailAddress}>
                    {account.emailAddress}
                  </p>
                </div>

                {/* Storage bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>{(account.usedBytes / 1_048_576).toFixed(0)} MB used</span>
                    <span>{(account.quotaBytes / 1_073_741_824).toFixed(0)} GB</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${storageColor(usagePct)}`}
                    />
                  </div>
                </div>

                {/* Bottom links */}
                <div className="flex items-center justify-between mt-3">
                  <Link href="/email/settings" className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors">
                    <Settings className="h-3 w-3" /> Settings
                  </Link>
                  <Link href="/" className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors">
                    <ArrowLeft className="h-3 w-3" /> Back to site
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link href="/email/settings" title="Settings" className="p-1.5 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/8">
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main layout ────────────────────────────────────────────────────── */
export default function EmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFolders()
      .then((res) => { if (res.data.success) setFolders(res.data.data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
    getMyAccount()
      .then((res) => { if (res.data.success) setAccount(res.data.data); })
      .catch(() => {});
  }, []);

  // Global keyboard shortcut: "/" to search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      router.push("/email/search");
    }
  }, [router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sidebarWidth = collapsed ? 56 : 240;

  return (
    <div className="flex h-screen bg-[#f0ece8] dark:bg-[#1a1410] overflow-hidden">
      {/* ── Mobile header ─────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-3 py-2.5 bg-soil-dark border-b border-white/10 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-soil-dark border-r border-white/10">
            {loaded ? (
              <SidebarBody folders={folders} account={account} pathname={pathname} collapsed={false} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-5 w-5 animate-spin text-white/40" />
              </div>
            )}
          </SheetContent>
        </Sheet>
        <span className="text-sm font-bold text-white flex-1">Mail</span>
        <Link href="/email/search">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:bg-white/10">
            <Search className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/email/compose">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:bg-white/10">
            <Edit3 className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-soil-dark border-r border-white/10 shrink-0 overflow-hidden relative z-10"
        style={{ minWidth: sidebarWidth }}
      >
        {loaded ? (
          <SidebarBody folders={folders} account={account} pathname={pathname} collapsed={collapsed} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        )}
      </motion.aside>

      {/* ── Collapse toggle ───────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex flex-col items-center justify-center w-3 bg-soil-dark hover:bg-white/5 border-r border-white/10 transition-colors group shrink-0 self-stretch"
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
          <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white/60 transition-colors" />
        </motion.div>
      </button>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden pt-14 lg:pt-0 flex flex-col">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="h-full flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
