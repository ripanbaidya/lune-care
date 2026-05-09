import React from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import Spinner from "../../../shared/components/ui/Spinner";

interface NotificationHeaderProps {
  totalElements: number;
  hasUnread: boolean;
  hasNotifications: boolean;
  isMarkingAll: boolean;
  isDeletingAll: boolean;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  totalElements,
  hasUnread,
  hasNotifications,
  isMarkingAll,
  isDeletingAll,
  onMarkAllRead,
  onDeleteAll,
}) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">
          {totalElements > 0
            ? `${totalElements} notification${totalElements !== 1 ? "s" : ""}`
            : "No notifications yet"}
        </p>
      </div>

      {/* Bulk actions */}
      {hasNotifications && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasUnread && (
            <button
              onClick={onMarkAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/50 border border-gray-700/50 text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 disabled:opacity-50 transition-all duration-200"
            >
              {isMarkingAll ? <Spinner size="sm" /> : <CheckCheck size={13} />}
              Mark all read
            </button>
          )}
          <button
            onClick={onDeleteAll}
            disabled={isDeletingAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-950/20 border border-red-800/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-900/30 hover:border-red-700/40 disabled:opacity-50 transition-all duration-200"
          >
            {isDeletingAll ? <Spinner size="sm" /> : <Trash2 size={13} />}
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
