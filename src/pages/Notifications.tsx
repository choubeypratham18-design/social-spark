import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import NotificationItem from '@/components/Notification/NotificationItem';
import { useSocial } from '@/context/SocialContext';
import { Button } from '@/components/ui/button';

const Notifications: React.FC = () => {
  const { notifications, markAllNotificationsAsRead, unreadNotificationsCount } = useSocial();

  return (
    <Layout>
      <div className="rounded-xl border border-border bg-card shadow-social">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Notifications</h1>
              {unreadNotificationsCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadNotificationsCount} unread
                </p>
              )}
            </div>
          </div>
          {unreadNotificationsCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
              className="text-primary"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-border">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No notifications yet</p>
              <p className="mt-2 text-muted-foreground">
                When you get notifications, they'll show up here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
