import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useUpload } from '@/hooks/useUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Image, X, Loader2, Send } from 'lucide-react';

const CreatePostCard: React.FC = () => {
  const { profile } = useAuth();
  const { createPost } = usePosts();
  const { uploadPostImage, uploading } = useUpload();
  const { toast } = useToast();

  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const { url, error } = await uploadPostImage(file);
    if (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      setImagePreview(null);
    } else if (url) {
      setImageUrl(url);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setPosting(true);
    const { error } = await createPost(content.trim(), imageUrl || undefined);
    setPosting(false);

    if (error) {
      toast({
        title: 'Post Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setContent('');
      removeImage();
      toast({
        title: 'Posted!',
        description: 'Your post has been shared.',
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
          />

          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-64 object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Image className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || posting || uploading}
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCard;
