-- Add content_type column to content_posts
ALTER TABLE public.content_posts
ADD COLUMN IF NOT EXISTS content_type TEXT CHECK (content_type IN ('blog_post', 'social_post', 'landing_page', 'email', 'ad_copy', 'meta_description', 'press_release'));

-- Backfill existing rows
UPDATE public.content_posts SET content_type = 'blog_post' WHERE content_type IS NULL;
