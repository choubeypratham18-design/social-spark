import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, LinkIcon, Calendar, ArrowLeft } from 'lucide-react';
import { User } from '@/types';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const { currentUser, toggleFollow, getUserById } = useSocial();
  const navigate = useNavigate();
  const isOwnProfile = user.id === currentUser.id;
  
  // Get the latest user data
  const latestUser = getUserById(user.id) || user;

  return (
    <div className="rounded-xl border border-border bg-card shadow-social overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 sm:h-48">
        <img
          src={latestUser.coverImage}
          alt="Cover"
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-foreground/50 p-2 text-background backdrop-blur-sm transition-colors hover:bg-foreground/70"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 sm:px-6">
        {/* Avatar */}
        <div className="relative -mt-12 sm:-mt-16">
          <Avatar
            src={latestUser.avatar}
            alt={latestUser.displayName}
            size="xl"
            isVerified={latestUser.isVerified}
            className="ring-4 ring-card"
          />
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          {isOwnProfile ? (
            <Button variant="outline">Edit Profile</Button>
          ) : (
            <Button
              variant={latestUser.isFollowing ? 'outline' : 'default'}
              onClick={() => toggleFollow(latestUser.id)}
              className={latestUser.isFollowing ? '' : 'gradient-primary border-0'}
            >
              {latestUser.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Name and Username */}
        <div className="mt-2">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {latestUser.displayName}
          </h1>
          <p className="text-muted-foreground">@{latestUser.username}</p>
        </div>

        {/* Bio */}
        <p className="mt-3 text-foreground">{latestUser.bio}</p>

        {/* Meta Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {latestUser.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{latestUser.location}</span>
            </div>
          )}
          {latestUser.website && (
            <a
              href={latestUser.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              <span>{latestUser.website.replace('https://', '')}</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {latestUser.joinedDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6">
          <div className="group cursor-pointer">
            <span className="font-bold text-foreground">{latestUser.following.toLocaleString()}</span>{' '}
            <span className="text-muted-foreground group-hover:underline">Following</span>
          </div>
          <div className="group cursor-pointer">
            <span className="font-bold text-foreground">{latestUser.followers.toLocaleString()}</span>{' '}
            <span className="text-muted-foreground group-hover:underline">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
