import React from 'react';
import Layout from '@/components/layout/Layout';
import CreatePost from '@/components/Post/CreatePost';
import Post from '@/components/Post/Post';
import { useSocial } from '@/context/SocialContext';

const Home: React.FC = () => {
  const { posts } = useSocial();

  return (
    <Layout>
      <div className="space-y-6">
        <CreatePost />
        
        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-social">
            <p className="text-lg font-medium text-foreground">No posts yet</p>
            <p className="mt-2 text-muted-foreground">
              Be the first to share something!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
