import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFollow = () => {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (data) {
      setFollowingIds(new Set(data.map(f => f.following_id)));
    }
  }, [user]);

  const toggleFollow = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;

    setLoading(true);
    const isFollowing = followingIds.has(targetUserId);

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      setFollowingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    } else {
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      setFollowingIds(prev => new Set([...prev, targetUserId]));
    }

    setLoading(false);
  };

  const isFollowing = (targetUserId: string) => followingIds.has(targetUserId);

  const getFollowersCount = async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    
    return count || 0;
  };

  const getFollowingCount = async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    
    return count || 0;
  };

  return {
    followingIds,
    loading,
    fetchFollowing,
    toggleFollow,
    isFollowing,
    getFollowersCount,
    getFollowingCount,
  };
};
