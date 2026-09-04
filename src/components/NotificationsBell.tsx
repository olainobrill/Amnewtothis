"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { timeAgo } from "@/lib/time";

type Notification = {
  id: string;
  type: "LIKE" | "COMMENT" | "FRIEND_REQUEST" | "FRIEND_ACCEPT";
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string; username: string; avatarUrl: string | null };
};

const messageFor = (n: Notification) => {
  switch (n.type) {
    case "LIKE":
      return "liked your post";
    case "COMMENT":
      return "commented on your post";
    case "FRIEND_REQUEST":
      return "sent you a friend request";
    case "FRIEND_ACCEPT":
      return "accepted your friend request";
  }
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications));
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const toggle = async () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) =>
        prev ? prev.map((n) => ({ ...n, read: true })) : prev
      );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center relative"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold px-4 py-3 border-b border-gray-100">
            Notifications
          </h3>
          {notifications?.length === 0 && (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">
              No notifications yet.
            </p>
          )}
          {notifications?.map((n) => (
            <Link
              key={n.id}
              href={`/profile/${n.actor.username}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                !n.read ? "bg-blue-50" : ""
              }`}
            >
              <Avatar name={n.actor.name} avatarUrl={n.actor.avatarUrl} size={36} />
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{n.actor.name}</span>{" "}
                  {messageFor(n)}
                </p>
                <p className="text-xs text-gray-400">{timeAgo(n.createdAt)} ago</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
