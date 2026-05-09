import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Trash2, Clock, ArrowRight } from "lucide-react";
import { NOTIFICATION_CATEGORY_ICON } from "../types/notification.types";
import type { NotificationResponse } from "../types/notification.types";
import Spinner from "../../../shared/components/ui/Spinner";
import { appointmentDetailPath } from "../../../routes/routePaths";
import { useAuth } from "../../../shared/hooks/useAuth";

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationCardProps {
  notification: NotificationResponse;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}) => {
  const navigate = useNavigate();
  const { isPatient } = useAuth();
  const icon = NOTIFICATION_CATEGORY_ICON[notification.category] ?? "🔔";

  const handleCardClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (isPatient && notification.referenceId) {
      navigate(appointmentDetailPath(notification.referenceId));
    }
  };

  return (
    <div
      className={[
        "relative flex items-start gap-4 px-4 py-4 rounded-xl border transition-all group",
        notification.isRead
          ? "bg-gray-900/30 border-gray-800/50 hover:border-gray-700/50"
          : "bg-blue-950/30 border-blue-800/40 shadow-lg shadow-blue-500/10 hover:border-blue-700/50",
      ].join(" ")}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-400 rounded-full flex-shrink-0 animate-pulse" />
      )}

      {/* Category icon */}
      <div
        className={[
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg",
          notification.isRead ? "bg-gray-800/50" : "bg-blue-500/20",
        ].join(" ")}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={[
              "text-sm font-semibold leading-snug",
              notification.isRead ? "text-gray-300" : "text-white",
            ].join(" ")}
          >
            {notification.title}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {notification.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={10} />
            {formatRelativeTime(notification.createdAt)}
          </span>
          {isPatient && notification.referenceId && (
            <button
              onClick={handleCardClick}
              className="flex items-center gap-1 text-xs text-blue-400 font-medium hover:text-blue-300 transition-colors"
            >
              View details <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            disabled={isMarkingRead}
            title="Mark as read"
            className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-40"
          >
            {isMarkingRead ? <Spinner size="sm" /> : <Check size={14} />}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          disabled={isDeleting}
          title="Delete"
          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
        >
          {isDeleting ? <Spinner size="sm" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
};
