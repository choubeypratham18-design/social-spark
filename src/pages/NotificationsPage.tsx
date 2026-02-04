import React from 'react';
import Layout from '@/components/layout/Layout';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Heart, MessageCircle, UserPlus, Share2, Users, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'group_invite':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'share':
        return 'shared your post';
      case 'group_invite':
        return 'invited you to a group';
      case 'message':
        return 'sent you a message';
      default:
        return 'interacted with you';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg font-medium">Login to see notifications</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-muted-foreground">
              When someone interacts with you, you'll see it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-xl border border-border transition-colors cursor-pointer ${
                  notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                {notification.actor ? (
                  <Link to={`/profile/${notification.actor.username}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.actor.avatar_url || ''} />
                      <AvatarFallback>
                        {notification.actor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-foreground">
                    {notification.actor && (
                      <Link
                        to={`/profile/${notification.actor.username}`}
                        className="font-semibold hover:underline"
                      >
                        {notification.actor.name}
                      </Link>
                    )}{' '}
                    {notification.message || getMessage(notification.type)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getIcon(notification.type)}
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
