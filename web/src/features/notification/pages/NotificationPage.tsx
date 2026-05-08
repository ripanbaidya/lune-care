import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Clock,
    Trash2,
    ArrowRight,
} from 'lucide-react';
import {
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification,
    useDeleteAllNotifications,
} from '../hooks/useNotifications';
import {NOTIFICATION_CATEGORY_ICON} from '../types/notification.types';
import type {NotificationResponse} from '../types/notification.types';
import Spinner from '../../../shared/components/ui/Spinner';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';
import {appointmentDetailPath} from '../../../routes/routePaths';

// Helpers

function formatRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
}

// Single Notification Card

interface NotificationCardProps {
    notification: NotificationResponse;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    isMarkingRead: boolean;
    isDeleting: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
                                                               notification,
                                                               onMarkRead,
                                                               onDelete,
                                                               isMarkingRead,
                                                               isDeleting,
                                                           }) => {
    const navigate = useNavigate();
    const icon = NOTIFICATION_CATEGORY_ICON[notification.category] ?? '🔔';

    const handleCardClick = () => {
        // Mark as read on click if unread
        if (!notification.isRead) {
            onMarkRead(notification.id);
        }
        // Deep-link to appointment detail if referenceId exists
        if (notification.referenceId) {
            navigate(appointmentDetailPath(notification.referenceId));
        }
    };

    return (
        <div
            className={[
                'relative flex items-start gap-4 px-4 py-4 rounded-xl border transition-all group',
                notification.isRead
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50/60 border-blue-200 shadow-sm',
            ].join(' ')}
        >
            {/* Unread dot */}
            {!notification.isRead && (
                <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"/>
            )}

            {/* Category icon */}
            <div
                className={[
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg',
                    notification.isRead ? 'bg-gray-100' : 'bg-blue-100',
                ].join(' ')}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={[
                            'text-sm font-semibold leading-snug',
                            notification.isRead ? 'text-gray-700' : 'text-gray-900',
                        ].join(' ')}
                    >
                        {notification.title}
                    </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {notification.body}
                </p>
                <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10}/>
                        {formatRelativeTime(notification.createdAt)}
                    </span>
                    {notification.referenceId && (
                        <button
                            onClick={handleCardClick}
                            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                        >
                            View details <ArrowRight size={10}/>
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
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                        {isMarkingRead ? <Spinner size="sm"/> : <Check size={14}/>}
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    disabled={isDeleting}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                >
                    {isDeleting ? <Spinner size="sm"/> : <Trash2 size={14}/>}
                </button>
            </div>
        </div>
    );
};

// Filter Tab Type

type FilterTab = 'all' | 'unread' | 'read';

const TABS: { key: FilterTab; label: string }[] = [
    {key: 'all', label: 'All'},
    {key: 'unread', label: 'Unread'},
    {key: 'read', label: 'Read'},
];

const TAB_TO_IS_READ: Record<FilterTab, boolean | undefined> = {
    all: undefined,
    unread: false,
    read: true,
};

// Page

const NotificationsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 15;

    // Track which notification is being acted on (for per-item loading state)
    const [actingOnId, setActingOnId] = useState<string | null>(null);

    const {data, isLoading} = useNotifications(page, PAGE_SIZE, TAB_TO_IS_READ[activeTab]);
    const {mutate: markAsRead} = useMarkAsRead();
    const {mutate: markAllAsRead, isPending: isMarkingAll} = useMarkAllAsRead();
    const {mutate: deleteNotification} = useDeleteNotification();
    const {mutate: deleteAll, isPending: isDeletingAll} = useDeleteAllNotifications();

    const notifications = data?.data?.content ?? [];
    const pageInfo = data?.data?.page;
    const totalPages = pageInfo?.totalPages ?? 0;
    const totalElements = pageInfo?.totalElements ?? 0;
    const hasUnread = notifications.some((n) => !n.isRead);

    const handleMarkRead = (id: string) => {
        setActingOnId(id);
        markAsRead(id, {
            onSuccess: () => {
                toast.success('Marked as read');
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
                toast.success('Notification deleted');
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
            onSuccess: () => toast.success('All notifications marked as read'),
            onError: (err: AppError) => toast.error(err.message),
        });
    };

    const handleDeleteAll = () => {
        if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
        deleteAll(undefined, {
            onSuccess: () => toast.success('All notifications deleted'),
            onError: (err: AppError) => toast.error(err.message),
        });
    };

    const handleTabChange = (tab: FilterTab) => {
        setActiveTab(tab);
        setPage(0);
    };

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {totalElements > 0
                            ? `${totalElements} notification${totalElements !== 1 ? 's' : ''}`
                            : 'No notifications yet'}
                    </p>
                </div>

                {/* Bulk actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                {isMarkingAll ? <Spinner size="sm"/> : <CheckCheck size={13}/>}
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={handleDeleteAll}
                            disabled={isDeletingAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                            {isDeletingAll ? <Spinner size="sm"/> : <Trash2 size={13}/>}
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => handleTabChange(t.key)}
                        className={[
                            'px-4 py-2 text-sm font-medium transition-colors',
                            activeTab === t.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50',
                        ].join(' ')}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner size="lg"/>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        {activeTab === 'unread' ? (
                            <BellOff size={24} className="text-gray-400"/>
                        ) : (
                            <Bell size={24} className="text-gray-400"/>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                        {activeTab === 'unread'
                            ? 'No unread notifications'
                            : activeTab === 'read'
                                ? 'No read notifications'
                                : 'No notifications yet'}
                    </p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        {activeTab === 'all'
                            ? 'Notifications about your appointments and activity will appear here.'
                            : 'Switch to "All" to see all your notifications.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
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
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;