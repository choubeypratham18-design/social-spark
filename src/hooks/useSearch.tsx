import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, PostWithProfile } from '@/types/database';
import { useAuth } from './useAuth';

export const useSearch = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  const searchPosts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPosts([]);
      return;
    }

    setLoading(true);
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postIds = postsData.map(p => p.id);
    const userIds = [...new Set(postsData.map(p => p.user_id))];

    const [profilesResult, likesResult, commentsResult, userLikesResult] = await Promise.all([
      supabase.from('profiles').select('*').in('user_id', userIds),
      supabase.from('post_likes').select('post_id').in('post_id', postIds),
      supabase.from('post_comments').select('post_id').in('post_id', postIds),
      user
        ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id)
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

    setPosts(enrichedPosts);
    setLoading(false);
  }, [user]);

  const search = useCallback(async (query: string) => {
    await Promise.all([searchUsers(query), searchPosts(query)]);
  }, [searchUsers, searchPosts]);

  const clearResults = () => {
    setUsers([]);
    setPosts([]);
  };

  return {
    users,
    posts,
    loading,
    search,
    searchUsers,
    searchPosts,
    clearResults,
  };
};
