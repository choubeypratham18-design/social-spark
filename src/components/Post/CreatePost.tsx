import React, { useState } from 'react';
import { Image, Smile, MapPin, X } from 'lucide-react';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';

const CreatePost: React.FC = () => {
  const { currentUser, addPost } = useSocial();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addPost(content, imageUrl || undefined);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setShowImageInput(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-social">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.displayName}
            size="md"
            isVerified={currentUser.isVerified}
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none border-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-48 w-full rounded-lg object-cover"
                  onError={() => setImageUrl('')}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-background transition-colors hover:bg-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Image URL Input */}
            {showImageInput && !imageUrl && (
              <div className="mt-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="w-full rounded-lg border border-border bg-secondary p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10"
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-warning transition-colors hover:bg-warning/10"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-accent transition-colors hover:bg-accent/10"
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="submit"
                disabled={!content.trim()}
                className="gradient-primary border-0 px-6"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
