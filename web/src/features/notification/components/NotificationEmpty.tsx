import React from "react";
import { Bell, BellOff } from "lucide-react";
import type { FilterTab } from "./NotificationTabs";

interface NotificationEmptyProps {
  activeTab: FilterTab;
}

export const NotificationEmpty: React.FC<NotificationEmptyProps> = ({
  activeTab,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 flex flex-col items-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-800/30 flex items-center justify-center">
        {activeTab === "unread" ? (
          <BellOff size={24} className="text-gray-600" />
        ) : (
          <Bell size={24} className="text-gray-600" />
        )}
      </div>
      <p className="text-sm font-medium text-gray-300">
        {activeTab === "unread"
          ? "No unread notifications"
          : activeTab === "read"
            ? "No read notifications"
            : "No notifications yet"}
      </p>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        {activeTab === "all"
          ? "Notifications about your appointments and activity will appear here."
          : 'Switch to "All" to see all your notifications.'}
      </p>
    </div>
  );
};
