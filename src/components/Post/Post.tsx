import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Trash2,
  Send
} from 'lucide-react';
import { Post as PostType } from '@/types';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { currentUser, toggleLike, toggleBookmark, sharePost, addComment, deletePost, toggleCommentLike } = useSocial();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleLike = () => {
    setIsLikeAnimating(true);
    toggleLike(post.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleShare = () => {
    sharePost(post.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(post.id, newComment);
      setNewComment('');
    }
  };

  const handleCommentClick = () => {
    setShowComments(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const isOwnPost = post.userId === currentUser.id;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-social transition-shadow hover:shadow-social-lg animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.user.username}`} className="flex items-center gap-3">
          <Avatar
            src={post.user.avatar}
            alt={post.user.displayName}
            size="md"
            isVerified={post.user.isVerified}
          />
          <div>
            <p className="font-semibold text-foreground hover:underline">
              {post.user.displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              @{post.user.username} · {post.createdAt}
            </p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost && (
              <DropdownMenuItem 
                onClick={() => deletePost(post.id)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete post</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Copy link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post image"
            className="mt-3 w-full rounded-xl object-cover"
            style={{ maxHeight: '400px' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            post.isLiked
              ? 'text-destructive'
              : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          )}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-transform',
              post.isLiked && 'fill-current',
              isLikeAnimating && 'animate-like'
            )}
          />
          <span className={cn(isLikeAnimating && 'animate-count')}>{post.likes}</span>
        </button>

        <button
          onClick={handleCommentClick}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments.length}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-success/10 hover:text-success"
        >
          <Share2 className="h-5 w-5" />
          <span>{post.shares}</span>
        </button>

        <button
          onClick={() => toggleBookmark(post.id)}
          className={cn(
            'rounded-full p-1.5 transition-colors',
            post.isBookmarked
              ? 'text-warning'
              : 'text-muted-foreground hover:bg-warning/10 hover:text-warning'
          )}
        >
          <Bookmark className={cn('h-5 w-5', post.isBookmarked && 'fill-current')} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {/* Existing Comments */}
          {post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Link to={`/profile/${comment.user.username}`}>
                    <Avatar
                      src={comment.user.avatar}
                      alt={comment.user.displayName}
                      size="sm"
                    />
                  </Link>
                  <div className="flex-1 rounded-lg bg-secondary p-3">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/profile/${comment.user.username}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {comment.user.displayName}
                      </Link>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{comment.content}</p>
                    <button
                      onClick={() => toggleCommentLike(post.id, comment.id)}
                      className={cn(
                        'mt-2 flex items-center gap-1 text-xs transition-colors',
                        comment.isLiked
                          ? 'text-destructive'
                          : 'text-muted-foreground hover:text-destructive'
                      )}
                    >
                      <Heart className={cn('h-3.5 w-3.5', comment.isLiked && 'fill-current')} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3">
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.displayName}
              size="sm"
            />
            <div className="relative flex-1">
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full rounded-full border border-border bg-secondary py-2 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;
