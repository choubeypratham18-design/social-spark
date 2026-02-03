import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign, Share2 } from 'lucide-react';
import { Notification as NotificationType } from '@/types';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: NotificationType;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  share: Share2,
};

const notificationColors = {
  like: 'text-destructive bg-destructive/10',
  comment: 'text-primary bg-primary/10',
  follow: 'text-accent bg-accent/10',
  mention: 'text-warning bg-warning/10',
  share: 'text-success bg-success/10',
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markNotificationAsRead } = useSocial();
  const Icon = notificationIcons[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-colors hover:bg-secondary',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <Link to={`/profile/${notification.user.username}`}>
        <Avatar
          src={notification.user.avatar}
          alt={notification.user.displayName}
          size="md"
          isVerified={notification.user.isVerified}
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <Link
            to={`/profile/${notification.user.username}`}
            className="font-semibold hover:underline"
          >
            {notification.user.displayName}
          </Link>{' '}
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{notification.createdAt}</p>
      </div>

      <div className={cn('rounded-full p-2', notificationColors[notification.type])}>
        <Icon className="h-4 w-4" />
      </div>

      {!notification.isRead && (
        <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
      )}
    </div>
  );
};

export default NotificationItem;
