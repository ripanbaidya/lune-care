import React, { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationCard } from "../components/NotificationCard";
import {
  NotificationTabs,
  type FilterTab,
} from "../components/NotificationTabs";
import { NotificationEmpty } from "../components/NotificationEmpty";
import { NotificationHeader } from "../components/NotificationHeader";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "../hooks/useNotifications";
import Spinner from "../../../shared/components/ui/Spinner";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";

const TAB_TO_IS_READ: Record<FilterTab, boolean | undefined> = {
  all: undefined,
  unread: false,
  read: true,
};

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(0);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const PAGE_SIZE = 15;

  const [actingOnId, setActingOnId] = useState<string | null>(null);

  const { data, isLoading } = useNotifications(
    page,
    PAGE_SIZE,
    TAB_TO_IS_READ[activeTab],
  );
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteAllNotifications();

  const notifications = data?.data?.content ?? [];
  const pageInfo = data?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? 0;
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleMarkRead = (id: string) => {
    setActingOnId(id);
    markAsRead(id, {
      onSuccess: () => {
        toast.success("Marked as read");
        setActingOnId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingOnId(null);
      },
    });
  };

  const handleDelete = (id: string) => {
    setActingOnId(id);
    deleteNotification(id, {
      onSuccess: () => {
        toast.success("Notification deleted");
        setActingOnId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingOnId(null);
      },
    });
  };

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError: (err: AppError) => toast.error(err.message),
    });
  };

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(true);
  };

  const handleDeleteAllConfirm = () => {
    deleteAll(undefined, {
      onSuccess: () => {
        toast.success("All notifications deleted");
        setShowDeleteAllDialog(false);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setShowDeleteAllDialog(false);
      },
    });
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with bulk actions */}
      <NotificationHeader
        totalElements={totalElements}
        hasUnread={hasUnread}
        hasNotifications={notifications.length > 0}
        isMarkingAll={isMarkingAll}
        isDeletingAll={isDeletingAll}
        onMarkAllRead={handleMarkAllRead}
        onDeleteAll={handleDeleteAll}
      />

      {/* Filter tabs */}
      <NotificationTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmpty activeTab={activeTab} />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              isMarkingRead={actingOnId === notification.id}
              isDeleting={actingOnId === notification.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
          <p className="text-xs text-gray-500">
            Page <span className="text-gray-300 font-medium">{page + 1}</span>{" "}
            of <span className="text-gray-300 font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showDeleteAllDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
            <div className="px-6 pt-5 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Clear All Notifications?
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="px-6 pb-5 pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteAllDialog(false)}
                disabled={isDeletingAll}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700/70 text-gray-300 hover:bg-gray-800/60 transition-colors disabled:opacity-50"
              >
                No, Keep Them
              </button>
              <button
                type="button"
                onClick={handleDeleteAllConfirm}
                disabled={isDeletingAll}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
