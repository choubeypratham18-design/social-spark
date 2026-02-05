 import { useState, useEffect, useCallback, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { PostWithProfile, PostComment, Profile } from '@/types/database';
 import { saveHashtags } from '@/lib/hashtags';

const POSTS_PER_PAGE = 10;

export const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    
    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    // Fetch posts
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      isFetchingRef.current = false;
      setHasMore(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setHasMore(false);
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    const postIds = postsData.map(p => p.id);
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    
    // Fetch profiles, likes, comments in parallel
    const [profilesResult, likesResult, commentsResult, userLikesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds),
      supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds),
      supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds),
      user
        ? supabase
            .from('post_likes')
            .select('post_id')
            .in('post_id', postIds)
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] }),
    ]);

    const profilesMap: Record<string, Profile> = {};
    profilesResult.data?.forEach(p => {
      profilesMap[p.user_id] = p;
    });

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
      profile: profilesMap[post.user_id] || {
        id: '',
        user_id: post.user_id,
        username: 'unknown',
        name: 'Unknown User',
        bio: null,
        work: null,
        avatar_url: null,
        cover_url: null,
        created_at: '',
        updated_at: '',
      },
      likes_count: likesCount[post.id] || 0,
      comments_count: commentsCount[post.id] || 0,
      is_liked: userLikes.has(post.id),
    }));

    if (append) {
      setPosts(prev => [...prev, ...enrichedPosts]);
    } else {
      setPosts(enrichedPosts);
    }

    setHasMore(postsData.length === POSTS_PER_PAGE);
    setLoading(false);
    isFetchingRef.current = false;
  }, [user]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isFetchingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    isFetchingRef.current = false;
    fetchPosts(0, false);
  }, [fetchPosts]);

  const createPost = async (content: string, imageUrl?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();

     if (!error && data) {
       // Save hashtags
       await saveHashtags(data.id, content);
       refresh();
     }
 
     return { data, error };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }

    return { error };
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        )
      );
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        )
      );
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

    if (!error) {
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );
    }

    return { error };
  };

  const getComments = async (postId: string): Promise<PostComment[]> => {
    const { data: commentsData, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !commentsData) {
      console.error('Error fetching comments:', error);
      return [];
    }

    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    const profilesMap: Record<string, Profile> = {};
    profilesData?.forEach(p => {
      profilesMap[p.user_id] = p;
    });

    return commentsData.map(comment => ({
      ...comment,
      profile: profilesMap[comment.user_id],
    }));
  };

  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    getComments,
  };
};
