import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import Post from '@/components/Post/Post';
import { useSocial } from '@/context/SocialContext';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { getUserByUsername, posts } = useSocial();

  const user = getUserByUsername(username || '');

  if (!user) {
    return (
      <Layout>
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-social">
          <h2 className="text-xl font-bold text-foreground">User not found</h2>
          <p className="mt-2 text-muted-foreground">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  const userPosts = posts.filter((post) => post.userId === user.id);

  return (
    <Layout>
      <div className="space-y-6">
        <ProfileHeader user={user} />

        {/* User's Posts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Posts</h2>
          {userPosts.length > 0 ? (
            userPosts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-social">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
