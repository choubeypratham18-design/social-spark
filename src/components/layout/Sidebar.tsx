import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { users } from '@/data/mockData';

const Sidebar: React.FC = () => {
  const { toggleFollow, getUserById } = useSocial();
  
  const suggestedUsers = users.filter(u => !u.isFollowing && u.id !== '1').slice(0, 3);
  
  const trendingTopics = [
    { tag: '#ReactJS', posts: '12.5K posts' },
    { tag: '#TypeScript', posts: '8.2K posts' },
    { tag: '#WebDev', posts: '15.1K posts' },
    { tag: '#OpenSource', posts: '5.4K posts' },
  ];

  return (
    <aside className="sticky top-20 hidden w-80 space-y-6 lg:block">
      {/* Who to Follow */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-social">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Who to follow</h3>
        </div>
        <div className="space-y-4">
          {suggestedUsers.map((user) => {
            const currentUserData = getUserById(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between">
                <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    alt={user.displayName}
                    size="md"
                    isVerified={user.isVerified}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground hover:underline">
                      {user.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant={currentUserData?.isFollowing ? "outline" : "default"}
                  onClick={() => toggleFollow(user.id)}
                  className="ml-2 shrink-0"
                >
                  {currentUserData?.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-social">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Trending</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <p className="font-medium text-foreground">{topic.tag}</p>
              <p className="text-xs text-muted-foreground">{topic.posts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-2 px-2 text-xs text-muted-foreground">
        <a href="#" className="hover:underline">Terms</a>
        <span>·</span>
        <a href="#" className="hover:underline">Privacy</a>
        <span>·</span>
        <a href="#" className="hover:underline">Cookies</a>
        <span>·</span>
        <a href="#" className="hover:underline">About</a>
        <p className="mt-2 w-full">© 2024 SocialHub</p>
      </div>
    </aside>
  );
};

export default Sidebar;
