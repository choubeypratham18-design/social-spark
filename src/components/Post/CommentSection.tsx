 import React, { useState, useEffect } from 'react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { Profile } from '@/types/database';
 import { Link } from 'react-router-dom';
 import { formatDistanceToNow } from 'date-fns';
 import { MessageCircle, ChevronDown, ChevronUp, Loader2, Send } from 'lucide-react';
 
 interface Comment {
   id: string;
   post_id: string;
   user_id: string;
   content: string;
   parent_comment_id: string | null;
   created_at: string;
   profile?: Profile;
   replies?: Comment[];
 }
 
 interface CommentSectionProps {
   postId: string;
   commentsCount: number;
   onCommentAdded: () => void;
 }
 
 const CommentItem: React.FC<{
   comment: Comment;
   postId: string;
   depth: number;
   onReply: (parentId: string) => void;
   replyingTo: string | null;
   onSubmitReply: (content: string, parentId: string) => Promise<void>;
   onCancelReply: () => void;
 }> = ({ comment, postId, depth, onReply, replyingTo, onSubmitReply, onCancelReply }) => {
   const [showReplies, setShowReplies] = useState(depth < 2);
   const [replyContent, setReplyContent] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const { user } = useAuth();
 
   const handleSubmitReply = async () => {
     if (!replyContent.trim()) return;
     setSubmitting(true);
     await onSubmitReply(replyContent, comment.id);
     setReplyContent('');
     setSubmitting(false);
   };
 
   const hasReplies = comment.replies && comment.replies.length > 0;
 
   return (
     <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
       <div className="flex gap-3 py-3">
         <Link to={`/profile/${comment.profile?.username}`}>
           <Avatar className="h-8 w-8">
             <AvatarImage src={comment.profile?.avatar_url || ''} />
             <AvatarFallback className="text-xs bg-primary/10 text-primary">
               {comment.profile?.name?.charAt(0).toUpperCase() || 'U'}
             </AvatarFallback>
           </Avatar>
         </Link>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <Link
               to={`/profile/${comment.profile?.username}`}
               className="font-medium text-sm text-foreground hover:underline"
             >
               {comment.profile?.name || 'Unknown'}
             </Link>
             <span className="text-xs text-muted-foreground">
               {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
             </span>
           </div>
           <p className="text-sm text-foreground mt-1">{comment.content}</p>
           <div className="flex items-center gap-4 mt-2">
             {user && depth < 3 && (
               <button
                 onClick={() => onReply(comment.id)}
                 className="text-xs text-muted-foreground hover:text-primary transition-colors"
               >
                 Reply
               </button>
             )}
             {hasReplies && (
               <button
                 onClick={() => setShowReplies(!showReplies)}
                 className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
               >
                 {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                 {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
               </button>
             )}
           </div>
 
           {/* Reply input */}
           {replyingTo === comment.id && (
             <div className="mt-3 flex gap-2">
               <Textarea
                 value={replyContent}
                 onChange={(e) => setReplyContent(e.target.value)}
                 placeholder="Write a reply..."
                 className="min-h-[60px] text-sm resize-none"
               />
               <div className="flex flex-col gap-1">
                 <Button
                   size="sm"
                   onClick={handleSubmitReply}
                   disabled={!replyContent.trim() || submitting}
                 >
                   {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                 </Button>
                 <Button size="sm" variant="ghost" onClick={onCancelReply}>
                   Cancel
                 </Button>
               </div>
             </div>
           )}
         </div>
       </div>
 
       {/* Nested replies */}
       {hasReplies && showReplies && (
         <div>
           {comment.replies!.map((reply) => (
             <CommentItem
               key={reply.id}
               comment={reply}
               postId={postId}
               depth={depth + 1}
               onReply={onReply}
               replyingTo={replyingTo}
               onSubmitReply={onSubmitReply}
               onCancelReply={onCancelReply}
             />
           ))}
         </div>
       )}
     </div>
   );
 };
 
 const CommentSection: React.FC<CommentSectionProps> = ({
   postId,
   commentsCount,
   onCommentAdded,
 }) => {
   const { user, profile } = useAuth();
   const [comments, setComments] = useState<Comment[]>([]);
   const [loading, setLoading] = useState(false);
   const [newComment, setNewComment] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [replyingTo, setReplyingTo] = useState<string | null>(null);
 
   useEffect(() => {
     fetchComments();
   }, [postId]);
 
   const fetchComments = async () => {
     setLoading(true);
     const { data: commentsData, error } = await supabase
       .from('post_comments')
       .select('*')
       .eq('post_id', postId)
       .order('created_at', { ascending: true });
 
     if (error || !commentsData) {
       setLoading(false);
       return;
     }
 
     const userIds = [...new Set(commentsData.map((c) => c.user_id))];
     const { data: profilesData } = await supabase
       .from('profiles')
       .select('*')
       .in('user_id', userIds);
 
     const profilesMap: Record<string, Profile> = {};
     profilesData?.forEach((p) => {
       profilesMap[p.user_id] = p;
     });
 
     // Build threaded structure
     const commentsWithProfiles = commentsData.map((c) => ({
       ...c,
       profile: profilesMap[c.user_id],
       replies: [] as Comment[],
     }));
 
     const commentMap: Record<string, Comment> = {};
     commentsWithProfiles.forEach((c) => {
       commentMap[c.id] = c;
     });
 
     const rootComments: Comment[] = [];
     commentsWithProfiles.forEach((c) => {
       if (c.parent_comment_id && commentMap[c.parent_comment_id]) {
         commentMap[c.parent_comment_id].replies!.push(c);
       } else {
         rootComments.push(c);
       }
     });
 
     setComments(rootComments);
     setLoading(false);
   };
 
   const submitComment = async (content: string, parentId: string | null = null) => {
     if (!user) return;
 
     const { error } = await supabase.from('post_comments').insert({
       post_id: postId,
       user_id: user.id,
       content,
       parent_comment_id: parentId,
     });
 
     if (!error) {
       onCommentAdded();
       await fetchComments();
       setReplyingTo(null);
     }
   };
 
   const handleSubmitNewComment = async () => {
     if (!newComment.trim()) return;
     setSubmitting(true);
     await submitComment(newComment);
     setNewComment('');
     setSubmitting(false);
   };
 
   return (
     <div className="border-t border-border mt-3 pt-3">
       {/* New comment input */}
       {user && (
         <div className="flex gap-3 mb-4">
           <Avatar className="h-8 w-8">
             <AvatarImage src={profile?.avatar_url || ''} />
             <AvatarFallback className="text-xs bg-primary/10 text-primary">
               {profile?.name?.charAt(0).toUpperCase() || 'U'}
             </AvatarFallback>
           </Avatar>
           <div className="flex-1 flex gap-2">
             <Textarea
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               placeholder="Write a comment..."
               className="min-h-[60px] text-sm resize-none"
             />
             <Button
               size="sm"
               onClick={handleSubmitNewComment}
               disabled={!newComment.trim() || submitting}
               className="self-end"
             >
               {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
             </Button>
           </div>
         </div>
       )}
 
       {/* Comments list */}
       {loading ? (
         <div className="flex justify-center py-4">
           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
         </div>
       ) : comments.length > 0 ? (
         <div className="space-y-1">
           {comments.map((comment) => (
             <CommentItem
               key={comment.id}
               comment={comment}
               postId={postId}
               depth={0}
               onReply={(parentId) => setReplyingTo(parentId)}
               replyingTo={replyingTo}
               onSubmitReply={submitComment}
               onCancelReply={() => setReplyingTo(null)}
             />
           ))}
         </div>
       ) : (
         <p className="text-sm text-muted-foreground text-center py-4">
           No comments yet. Be the first to comment!
         </p>
       )}
     </div>
   );
 };
 
 export default CommentSection;