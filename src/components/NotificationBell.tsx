"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  // FIX: use boolean flag — session object reference changes on each next-auth
  // internal refresh, causing the interval to restart unnecessarily.
  const sessionReady = !!session;
  useEffect(() => {
    if (sessionReady) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [sessionReady]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: [notification._id] }),
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        // silent
      }
    }

    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_request": return "event_note";
      case "booking_confirmed": return "check_circle";
      case "booking_cancelled": return "cancel";
      case "mentor_approved": return "verified";
      case "new_message": return "chat";
      default: return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_request": return "text-primary";
      case "booking_confirmed": return "text-secondary";
      case "booking_cancelled": return "text-error";
      case "mentor_approved": return "text-secondary";
      case "new_message": return "text-primary";
      default: return "text-outline";
    }
  };

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-outline hover:text-primary transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] overflow-y-auto glass-panel border border-outline-variant rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50">
          <div className="sticky top-0 bg-surface-container-high border-b border-outline-variant px-4 py-3 flex justify-between items-center backdrop-blur-xl rounded-t-xl">
            <h3 className="font-mono-label text-sm text-on-surface uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-mono-label text-[10px] text-primary hover:text-secondary transition-colors uppercase"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">notifications_off</span>
              <p className="text-outline font-body-md text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors flex items-start gap-3 ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!notification.isRead ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                      {notification.message}
                    </p>
                    <p className="font-mono-label text-[10px] text-outline mt-1">{timeAgo(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
