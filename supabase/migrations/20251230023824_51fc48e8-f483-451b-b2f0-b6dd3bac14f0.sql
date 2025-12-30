-- Create a table to cache GitHub user data
CREATE TABLE public.github_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_github_cache_username ON public.github_cache(username);
CREATE INDEX idx_github_cache_updated_at ON public.github_cache(updated_at);

-- Enable RLS but allow public read/write for edge functions
ALTER TABLE public.github_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cache (public profiles)
CREATE POLICY "Anyone can read cache"
ON public.github_cache
FOR SELECT
USING (true);

-- Allow edge functions to insert/update via service role
CREATE POLICY "Service role can insert cache"
ON public.github_cache
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update cache"
ON public.github_cache
FOR UPDATE
USING (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_github_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_github_cache_updated_at
BEFORE UPDATE ON public.github_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_github_cache_updated_at();