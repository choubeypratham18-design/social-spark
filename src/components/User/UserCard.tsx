import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';

interface UserCardProps {
  profile: Profile;
  showFollowButton?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ profile, showFollowButton = true }) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow, loading } = useFollow();
  const isOwnProfile = user?.id === profile.user_id;
  const following = isFollowing(profile.user_id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
      <Link to={`/profile/${profile.username}`}>
        <Avatar className="h-12 w-12 ring-2 ring-background">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${profile.username}`}
          className="font-semibold text-foreground hover:underline block truncate"
        >
          {profile.name}
        </Link>
        <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{profile.bio}</p>
        )}
      </div>

      {showFollowButton && !isOwnProfile && user && (
        <Button
          variant={following ? 'outline' : 'default'}
          size="sm"
          onClick={() => toggleFollow(profile.user_id)}
          disabled={loading}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

export default UserCard;
