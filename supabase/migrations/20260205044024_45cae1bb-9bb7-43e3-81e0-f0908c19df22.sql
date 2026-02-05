-- Add parent_comment_id for threaded comments
ALTER TABLE public.post_comments 
ADD COLUMN parent_comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Create index for faster nested comment queries
CREATE INDEX idx_post_comments_parent ON public.post_comments(parent_comment_id);

-- Create hashtags table
CREATE TABLE public.hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create post_hashtags junction table
CREATE TABLE public.post_hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id uuid NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Enable RLS on hashtags
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

-- Anyone can view hashtags
CREATE POLICY "Anyone can view hashtags" 
ON public.hashtags 
FOR SELECT 
USING (true);

-- Authenticated users can create hashtags
CREATE POLICY "Authenticated users can create hashtags" 
ON public.hashtags 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on post_hashtags
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- Anyone can view post_hashtags
CREATE POLICY "Anyone can view post_hashtags" 
ON public.post_hashtags 
FOR SELECT 
USING (true);

-- Post owners can add hashtags to their posts
CREATE POLICY "Post owners can add hashtags" 
ON public.post_hashtags 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- Post owners can remove hashtags from their posts
CREATE POLICY "Post owners can remove hashtags" 
ON public.post_hashtags 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_post_hashtags_post ON public.post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag ON public.post_hashtags(hashtag_id);
CREATE INDEX idx_hashtags_name ON public.hashtags(name);