"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUnreadCount, getNotifications, markAllAsRead } from "@/lib/notifications";
import { subscribeToUserQueue } from "@/lib/websocket";
import type { Notification } from "@/types";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      subscription = subscribeToUserQueue("queue/notifications", (message) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          setUnreadCount((prev) => prev + 1);
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
        } catch {}
      });
    } catch {}
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchUnreadCount() {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.data.count);
    } catch { }
  }

  async function openDropdown() {
    setIsOpen(true);
    try {
      const { data } = await getNotifications(0, 5);
      setNotifications(data.data.content);
    } catch { }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" className="relative" onClick={openDropdown}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">No notifications</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  className={`block p-3 border-b hover:bg-gray-50 ${!n.isRead ? "bg-blue-50" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-1 truncate">{n.body}</p>}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
