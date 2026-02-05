 import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PostWithProfile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
 import { Heart, MessageCircle, Share2, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { renderContentWithHashtags } from '@/lib/hashtags';
 import CommentSection from './CommentSection';
 import ShareDialog from './ShareDialog';

 interface PostCardProps {
   post: PostWithProfile;
   onLike?: () => void;
   onBookmark?: () => void;
   onCommentAdded?: () => void;
 }

 const PostCard: React.FC<PostCardProps> = ({
   post,
   onLike,
   onBookmark,
   onCommentAdded,
 }) => {
   const [showComments, setShowComments] = useState(false);
   const [showShareDialog, setShowShareDialog] = useState(false);
   const [commentsCount, setCommentsCount] = useState(post.comments_count);
 
   const handleCommentAdded = () => {
     setCommentsCount((prev) => prev + 1);
     onCommentAdded?.();
   };
 
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${post.profile.username}`}>
          <Avatar className="h-10 w-10 ring-2 ring-background">
            <AvatarImage src={post.profile.avatar_url || ''} alt={post.profile.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${post.profile.username}`}
            className="font-semibold text-foreground hover:underline"
          >
            {post.profile.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            @{post.profile.username} · {formattedDate}
          </p>
        </div>
      </div>

 
       {/* Content with hashtags */}
       <div className="mb-3">
         <p className="text-foreground whitespace-pre-wrap">
           {renderContentWithHashtags(post.content)}
         </p>
       </div>

      {/* Image */}
      {post.image_url && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

 
       {/* Actions */}
       <div className="flex items-center justify-between pt-2 border-t border-border/50">
         <Button
           variant="ghost"
           size="sm"
           className={`gap-2 ${post.is_liked ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'}`}
           onClick={onLike}
         >
           <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
           <span>{post.likes_count}</span>
         </Button>
 
         <Button
           variant="ghost"
           size="sm"
           className={`gap-2 ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
           onClick={() => setShowComments(!showComments)}
         >
           <MessageCircle className="h-4 w-4" />
           <span>{commentsCount}</span>
           {showComments ? (
             <ChevronUp className="h-3 w-3" />
           ) : (
             <ChevronDown className="h-3 w-3" />
           )}
         </Button>
 
         <Button
           variant="ghost"
           size="sm"
           className="gap-2 text-muted-foreground"
           onClick={() => setShowShareDialog(true)}
         >
           <Share2 className="h-4 w-4" />
         </Button>
 
         <Button
           variant="ghost"
           size="sm"
           className={`${post.is_bookmarked ? 'text-primary' : 'text-muted-foreground'}`}
           onClick={onBookmark}
         >
           <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
         </Button>
       </div>
 
       {/* Comments Section */}
       {showComments && (
         <CommentSection
           postId={post.id}
           commentsCount={commentsCount}
           onCommentAdded={handleCommentAdded}
         />
       )}
 
       {/* Share Dialog */}
       <ShareDialog
         open={showShareDialog}
         onOpenChange={setShowShareDialog}
         postId={post.id}
         postContent={post.content}
       />
     </div>
  );
};

export default PostCard;
