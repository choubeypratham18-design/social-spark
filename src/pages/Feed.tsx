import React, { useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import CreatePostCard from '@/components/Post/CreatePostCard';
import PostCard from '@/components/Post/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, hasMore, loadMore, toggleLike } = usePosts();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  return (
    <Layout>
      <div className="space-y-6">
        {user && <CreatePostCard />}

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </div>

        <div ref={loadMoreRef} className="py-4">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {!loading && !hasMore && posts.length > 0 && (
            <p className="text-center text-muted-foreground">
              You've reached the end
            </p>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-foreground">No posts yet</p>
              <p className="text-muted-foreground">
                {user ? 'Be the first to share something!' : 'Login to see and create posts'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
