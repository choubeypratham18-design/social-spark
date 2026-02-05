 import React, { useState, useEffect } from 'react';
 import { useParams } from 'react-router-dom';
 import Layout from '@/components/layout/Layout';
 import PostCard from '@/components/Post/PostCard';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { usePosts } from '@/hooks/usePosts';
 import { PostWithProfile, Profile } from '@/types/database';
 import { Hash, Loader2 } from 'lucide-react';
 
 const HashtagPage: React.FC = () => {
   const { tag } = useParams<{ tag: string }>();
   const { user } = useAuth();
   const { toggleLike } = usePosts();
   const [posts, setPosts] = useState<PostWithProfile[]>([]);
   const [loading, setLoading] = useState(true);
   const [postCount, setPostCount] = useState(0);
 
   useEffect(() => {
     const fetchPosts = async () => {
       if (!tag) return;
       setLoading(true);
 
       // Get hashtag
       const { data: hashtag } = await supabase
         .from('hashtags')
         .select('id')
         .eq('name', tag.toLowerCase())
         .maybeSingle();
 
       if (!hashtag) {
         setLoading(false);
         return;
       }
 
       // Get post IDs with this hashtag
       const { data: postHashtags } = await supabase
         .from('post_hashtags')
         .select('post_id')
         .eq('hashtag_id', hashtag.id);
 
       if (!postHashtags?.length) {
         setLoading(false);
         return;
       }
 
       const postIds = postHashtags.map((ph) => ph.post_id);
       setPostCount(postIds.length);
 
       // Fetch posts
       const { data: postsData } = await supabase
         .from('posts')
         .select('*')
         .in('id', postIds)
         .order('created_at', { ascending: false });
 
       if (!postsData) {
         setLoading(false);
         return;
       }
 
       const userIds = [...new Set(postsData.map((p) => p.user_id))];
 
       const [profilesResult, likesResult, commentsResult, userLikesResult] = await Promise.all([
         supabase.from('profiles').select('*').in('user_id', userIds),
         supabase.from('post_likes').select('post_id').in('post_id', postIds),
         supabase.from('post_comments').select('post_id').in('post_id', postIds),
         user
           ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id)
           : Promise.resolve({ data: [] }),
       ]);
 
       const profilesMap: Record<string, Profile> = {};
       profilesResult.data?.forEach((p) => {
         profilesMap[p.user_id] = p;
       });
 
       const likesCount: Record<string, number> = {};
       const commentsCount: Record<string, number> = {};
       const userLikes = new Set(userLikesResult.data?.map((l) => l.post_id) || []);
 
       likesResult.data?.forEach((l) => {
         likesCount[l.post_id] = (likesCount[l.post_id] || 0) + 1;
       });
 
       commentsResult.data?.forEach((c) => {
         commentsCount[c.post_id] = (commentsCount[c.post_id] || 0) + 1;
       });
 
       const enrichedPosts: PostWithProfile[] = postsData.map((post) => ({
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
     };
 
     fetchPosts();
   }, [tag, user]);
 
   return (
     <Layout>
       <div className="space-y-6">
         {/* Header */}
         <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
               <Hash className="h-8 w-8 text-primary" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-foreground">#{tag}</h1>
               <p className="text-muted-foreground">
                 {postCount} {postCount === 1 ? 'post' : 'posts'}
               </p>
             </div>
           </div>
         </div>
 
         {/* Posts */}
         {loading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
         ) : posts.length > 0 ? (
           <div className="space-y-4">
             {posts.map((post) => (
               <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
             ))}
           </div>
         ) : (
           <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
             <p className="text-muted-foreground">No posts found with this hashtag.</p>
           </div>
         )}
       </div>
     </Layout>
   );
 };
 
 export default HashtagPage;