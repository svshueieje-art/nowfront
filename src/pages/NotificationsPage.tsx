// ========================================
// Notifications Page
// ========================================

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api';
import {
  Card,
  PageHeader,
  Button,
  EmptyState,
  ListSkeleton,
  Alert,
  Pagination,
} from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Coffee,
  Sun,
  Send,
  Users,
  Gift,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'payment_approved':
      return <CheckCircle2 className="h-4 w-4 text-success-500" />;
    case 'payment_rejected':
      return <XCircle className="h-4 w-4 text-danger-500" />;
    case 'coffee_activated':
      return <Coffee className="h-4 w-4 text-brand-400" />;
    case 'daily_income':
      return <Sun className="h-4 w-4 text-warning-500" />;
    case 'withdrawal_completed':
      return <Send className="h-4 w-4 text-success-500" />;
    case 'withdrawal_rejected':
      return <XCircle className="h-4 w-4 text-danger-500" />;
    case 'referral_commission':
      return <Users className="h-4 w-4 text-info-500" />;
    case 'reward_received':
      return <Gift className="h-4 w-4 text-brand-400" />;
    case 'system_announcement':
      return <Megaphone className="h-4 w-4 text-surface-400" />;
    default:
      return <Bell className="h-4 w-4 text-surface-400" />;
  }
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getNotifications(page, 20),
    staleTime: 15000,
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // Silently fail
    }
  };

  const hasUnread = data?.data.some((n) => !n.isRead);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        action={
          hasUnread ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <ListSkeleton rows={10} />
      ) : error ? (
        <Alert variant="error">Failed to load notifications.</Alert>
      ) : !data?.data.length ? (
        <EmptyState
          icon={<BellOff className="h-12 w-12" />}
          title="You're all caught up"
          description="No notifications at the moment."
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((notification) => (
              <button
                key={notification.id}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                className={clsx(
                  'w-full text-left focus-ring rounded-xl transition-all',
                  !notification.isRead && 'ring-1 ring-brand-500/20'
                )}
              >
                <Card
                  variant="bordered"
                  padding="sm"
                  className={clsx(
                    !notification.isRead && 'bg-brand-500/5 border-brand-500/15'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={clsx(
                            'text-sm font-medium',
                            notification.isRead ? 'text-surface-300' : 'text-surface-100'
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-surface-600 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
