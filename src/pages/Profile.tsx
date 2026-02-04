import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/Post/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { Profile, PostWithProfile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Briefcase, Calendar, Link as LinkIcon, Settings, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const { isFollowing, toggleFollow, fetchFollowing, getFollowersCount, getFollowingCount } = useFollow();
  const { toggleLike } = usePosts();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = currentUserProfile?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false });

      if (postsData) {
        const postIds = postsData.map(p => p.id);
        
        const [likesResult, commentsResult, userLikesResult] = await Promise.all([
          supabase.from('post_likes').select('post_id').in('post_id', postIds),
          supabase.from('post_comments').select('post_id').in('post_id', postIds),
          user
            ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id)
            : Promise.resolve({ data: [] }),
        ]);

        const likesCount: Record<string, number> = {};
        const commentsCount: Record<string, number> = {};
        const userLikes = new Set(userLikesResult.data?.map(l => l.post_id) || []);

        likesResult.data?.forEach(l => {
          likesCount[l.post_id] = (likesCount[l.post_id] || 0) + 1;
        });

        commentsResult.data?.forEach(c => {
          commentsCount[c.post_id] = (commentsCount[c.post_id] || 0) + 1;
        });

        const enrichedPosts: PostWithProfile[] = postsData.map(post => ({
          ...post,
          profile: profileData,
          likes_count: likesCount[post.id] || 0,
          comments_count: commentsCount[post.id] || 0,
          is_liked: userLikes.has(post.id),
        }));

        setPosts(enrichedPosts);
      }

      // Fetch follow counts
      const [followers, following] = await Promise.all([
        getFollowersCount(profileData.user_id),
        getFollowingCount(profileData.user_id),
      ]);
      setFollowersCount(followers);
      setFollowingCount(following);

      setLoading(false);
    };

    fetchProfile();
    fetchFollowing();
  }, [username, user, fetchFollowing, getFollowersCount, getFollowingCount]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-foreground">User not found</h2>
          <p className="mt-2 text-muted-foreground">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  const following = isFollowing(profile.user_id);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cover & Avatar */}
        <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 relative">
            {profile.cover_url && (
              <img
                src={profile.cover_url}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 gap-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => navigate('/settings/profile')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : user ? (
                  <>
                    <Button
                      variant={following ? 'outline' : 'default'}
                      onClick={() => toggleFollow(profile.user_id)}
                    >
                      {following ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="mt-3 text-foreground">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {profile.work && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.work}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="flex gap-6 mt-4">
              <button className="hover:underline">
                <span className="font-bold text-foreground">{followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </button>
              <button className="hover:underline">
                <span className="font-bold text-foreground">{followersCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post.id)}
              />
            ))
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
